# ══════════════════════════════════════════════════════════════════
#  Stage 1 — Build da aplicação React (Node 20 Alpine)
# ══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

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
