# ══════════════════════════════════════════════════════════════════
#  Stage 1 — Build da aplicação React (Node 20 Alpine)
# ══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

# Atualiza todos os pacotes Alpine para corrigir CVEs (openssl, musl, etc.)
RUN apk upgrade --no-cache

WORKDIR /build

COPY dev/package*.json ./
RUN npm ci --prefer-offline

COPY dev/ .

# Produz assets com base em /app/ (consistente com nginx e GH Pages)
RUN npm run build -- --base /app/

# ══════════════════════════════════════════════════════════════════
#  Stage 2 — Imagem final com Nginx Alpine (< 50 MB)
# ══════════════════════════════════════════════════════════════════
FROM nginx:1.27-alpine AS production

LABEL org.opencontainers.image.title="josenilto.github.io" \
      org.opencontainers.image.description="Portfólio pessoal — site estático + React app" \
      org.opencontainers.image.source="https://github.com/josenilto/josenilto.github.io" \
      org.opencontainers.image.licenses="MIT"

# Atualiza todos os pacotes Alpine para corrigir CVEs:
# openssl (CVE-2026-31789, CVE-2025-15467, CVE-2026-28387)
# expat   (CVE-2026-32767)
# libxml2 (CVE-2025-49796, CVE-2025-49794, CVE-2025-6021)
# libpng  (CVE-2026-25646, CVE-2026-33636)
# musl    (CVE-2026-40200)
RUN apk upgrade --no-cache

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Site estático (portfólio principal) em /
COPY index.html  /usr/share/nginx/html/index.html
COPY 404.html    /usr/share/nginx/html/404.html
COPY assets/     /usr/share/nginx/html/assets/

# ── React app compilada em /app/
COPY --from=builder /build/dist/ /usr/share/nginx/html/app/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
