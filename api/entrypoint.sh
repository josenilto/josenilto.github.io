#!/bin/sh
# Garante que /data pertence ao usuario node antes de iniciar a API.
# Necessario quando o bind mount cria ./data como root no host.
# Roda como root, corrige permissoes, executa node como usuario node.
set -e

DATA_DIR="${DB_PATH%/*}"
DATA_DIR="${DATA_DIR:-/data}"

if [ -d "$DATA_DIR" ]; then
  chown -R node:node "$DATA_DIR" 2>/dev/null || true
  chmod 750 "$DATA_DIR"            2>/dev/null || true
fi

echo "[api-entrypoint] data dir: $DATA_DIR ($(stat -c '%U:%G %a' "$DATA_DIR" 2>/dev/null || echo 'stat indisponivel'))"
echo "[api-entrypoint] iniciando node como usuario 'node'..."

exec su-exec node node server.js
