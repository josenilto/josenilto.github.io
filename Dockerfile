# ══════════════════════════════════════════════════════════════════
#  Imagem de produção — site estático servido por Nginx Alpine
#  React app movida para repositório dedicado (commit 96d03aa)
# ══════════════════════════════════════════════════════════════════
FROM nginx:stable-alpine3.23 AS production

LABEL org.opencontainers.image.title="josenilto.github.io" \
      org.opencontainers.image.description="Portfólio pessoal — site estático HTML/CSS/JS" \
      org.opencontainers.image.source="https://github.com/josenilto/josenilto.github.io" \
      org.opencontainers.image.licenses="MIT"

# Atualiza pacotes Alpine para corrigir CVEs (openssl, expat, libxml2, libpng, musl)
# Remove pacotes não utilizados em runtime para reduzir superfície de ataque:
#   curl       → CVEs médios: CVE-2025-13034, CVE-2026-4873, CVE-2026-6253 e outros
#   fontconfig → CVE-2026-34085
#   freetype   → CVE-2026-23865
#   libavif    → CVE-2025-48174, CVE-2025-48175
RUN apk upgrade --no-cache && \
    apk del --no-cache curl fontconfig freetype libavif 2>/dev/null || true

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config customizada com headers de segurança, gzip e health-check
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o site estático com permissões corretas para o usuário nginx
COPY --chown=nginx:nginx index.html       /usr/share/nginx/html/index.html
COPY --chown=nginx:nginx 404.html         /usr/share/nginx/html/404.html
COPY --chown=nginx:nginx server-info.html /usr/share/nginx/html/server-info.html
COPY --chown=nginx:nginx robots.txt       /usr/share/nginx/html/robots.txt
COPY --chown=nginx:nginx sitemap.xml      /usr/share/nginx/html/sitemap.xml
COPY --chown=nginx:nginx health           /usr/share/nginx/html/health
COPY --chown=nginx:nginx assets/          /usr/share/nginx/html/assets/

# Script de coleta de métricas: lê /proc/stat e /proc/meminfo → /tmp/metrics.json
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["/entrypoint.sh"]
