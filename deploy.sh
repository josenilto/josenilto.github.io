#!/bin/sh
# ══════════════════════════════════════════════════════════════════
#  deploy.sh — Atualiza o portfólio PRD sem perder o banco SQLite
#
#  Uso:
#    ./deploy.sh              # pull + build + restart
#    ./deploy.sh --backup-only
#
#  Variáveis de ambiente (.env ou export):
#    DATA_DIR        path do banco no host  (padrão: ./data)
#    API_SECRET_KEY  chave da API           (opcional)
#    BACKUP_DIR      onde guardar backups   (padrão: ./backups)
# ══════════════════════════════════════════════════════════════════
set -eu

DATA_DIR="${DATA_DIR:-./data}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_FILE="${DATA_DIR}/portfolio.db"
COMPOSE="docker compose"

# ── Cores ─────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { printf "${GREEN}[deploy]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[deploy]${NC} %s\n" "$*"; }
error() { printf "${RED}[deploy]${NC} %s\n" "$*" >&2; }

# ── 1. Garante que o diretório de dados existe no host ────────────
info "Verificando diretório de dados: ${DATA_DIR}"
mkdir -p "${DATA_DIR}" "${BACKUP_DIR}"

# ── 2. Backup do banco ANTES de qualquer operação ─────────────────
if [ -f "${DB_FILE}" ]; then
  TS=$(date +%Y%m%d_%H%M%S)
  BACKUP="${BACKUP_DIR}/portfolio_${TS}.db"
  info "Backup: ${DB_FILE} → ${BACKUP}"
  cp "${DB_FILE}" "${BACKUP}"

  # Mantém apenas os últimos 30 backups
  ls -t "${BACKUP_DIR}"/portfolio_*.db 2>/dev/null | tail -n +31 | xargs -r rm --
  info "Backups anteriores: $(ls "${BACKUP_DIR}"/portfolio_*.db 2>/dev/null | wc -l) arquivo(s)"
else
  warn "Banco ainda não existe — será criado no primeiro start."
fi

[ "${1:-}" = "--backup-only" ] && { info "Backup concluído. Saindo."; exit 0; }

# ── 3. Pull das imagens atualizadas (se usar registry) ────────────
info "Atualizando imagens..."
$COMPOSE pull --ignore-pull-failures 2>/dev/null || true

# ── 4. Build sem cache das camadas de aplicação ───────────────────
info "Buildando imagens..."
$COMPOSE build --no-cache

# ── 5. Restart sem --volumes (NUNCA apaga o bind mount) ───────────
# 'down' sem -v preserva o DATA_DIR (bind mount no host).
# 'up -d' recria os containers com as novas imagens.
info "Reiniciando serviços..."
$COMPOSE down
$COMPOSE up -d

# ── 6. Aguarda health checks ───────────────────────────────────────
info "Aguardando health checks..."
TRIES=0
MAX=12   # 12 × 5s = 60s
while [ $TRIES -lt $MAX ]; do
  STATUS=$($COMPOSE ps --format json 2>/dev/null \
    | grep -c '"Health":"healthy"' 2>/dev/null || echo 0)
  [ "$STATUS" -ge 2 ] && break
  TRIES=$(( TRIES + 1 ))
  sleep 5
done

if [ $TRIES -eq $MAX ]; then
  error "Health check não passou em 60s. Verificar logs:"
  error "  docker compose logs --tail=50"
  exit 1
fi

# ── 7. Resumo ──────────────────────────────────────────────────────
info "Deploy concluído!"
info "  Site:   http://localhost:8080"
info "  API:    http://localhost:8080/api/health"
info "  Banco:  ${DB_FILE}"
info "  Backup: ${BACKUP:-nenhum (banco novo)}"
$COMPOSE ps
