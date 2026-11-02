#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
#  Monta a pasta de publicação do site estático (PRD e HMG)
#
#  Uso: .github/scripts/build-static.sh <pasta-destino>
#
#  1. copia só o que vai para o ar (HTML, assets, pt/, robots, sitemap, health)
#  2. junta os 4 CSS da página em assets/css/bundle.css (bundle-css.mjs)
#  3. minifica CSS/JS próprios com esbuild (versão fixa) — os vendors já
#     vêm minificados; se o esbuild falhar, publica os originais
#  4. confere os links do pacote final
#  5. grava version.json (commit, branch, run) — o health check espera
#     esse arquivo mostrar o commit novo para confirmar o deploy
# ══════════════════════════════════════════════════════════════════
set -euo pipefail

OUT="${1:?informe a pasta de destino}"
ESBUILD_VERSION="0.25.12"

rm -rf "$OUT"
mkdir -p "$OUT"

for f in *.html robots.txt sitemap.xml health; do
  [ -f "$f" ] && cp "$f" "$OUT/"
done
[ -d assets ] && cp -r assets "$OUT/assets"
[ -d pt ]     && cp -r pt     "$OUT/pt"            # versão pt-BR em /pt/

# ── CSS em um único arquivo (1 requisição bloqueante em vez de 4) ──
node .github/scripts/bundle-css.mjs "$OUT"

# ── Minificação (CSS/JS próprios) ─────────────────────────────────
before=$(du -cb "$OUT"/assets/css/*.css "$OUT"/assets/js/*.js 2>/dev/null | tail -1 | cut -f1)
if npx --yes "esbuild@${ESBUILD_VERSION}" --version >/dev/null 2>&1; then
  for f in "$OUT"/assets/css/*.css "$OUT"/assets/js/*.js; do
    [ -f "$f" ] || continue
    npx --yes "esbuild@${ESBUILD_VERSION}" "$f" --minify --log-level=warning \
      --outfile="$f.min" && mv "$f.min" "$f"
  done
  after=$(du -cb "$OUT"/assets/css/*.css "$OUT"/assets/js/*.js | tail -1 | cut -f1)
  echo "🗜️ CSS/JS minificados: ${before} → ${after} bytes"
else
  after="$before"
  echo "::warning title=Minificação pulada::esbuild indisponível — publicando CSS/JS originais"
fi

# ── Confere os links do pacote final (bundle.css incluso) ─────────
node .github/scripts/check-links.mjs "$OUT"

# ── Versão publicada ──────────────────────────────────────────────
cat > "$OUT/version.json" <<EOF
{"sha":"${GITHUB_SHA:-local}","ref":"${GITHUB_REF_NAME:-local}","run":"${GITHUB_RUN_NUMBER:-0}","built_at":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "## 📦 Pacote de publicação"
    echo "| Campo | Valor |"
    echo "| --- | --- |"
    echo "| Arquivos | $(find "$OUT" -type f | wc -l) |"
    echo "| Tamanho | $(du -sh "$OUT" | cut -f1) |"
    echo "| CSS/JS próprios | ${before} → ${after} bytes |"
  } >> "$GITHUB_STEP_SUMMARY"
fi

echo "📂 Estrutura de publicação:"
find "$OUT" -maxdepth 2 -type f | sort
