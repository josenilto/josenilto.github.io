# ══════════════════════════════════════════════════════════════════
#  Lovable Portfolio DEV — Multi-stage: Node build → Nginx Alpine
#  Serve: josenilto.github.io/dev  |  Local: localhost:8081
# ══════════════════════════════════════════════════════════════════

# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
# Build para produção com base /dev/ (GitHub Pages path)
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────
FROM nginx:stable-alpine3.23 AS production

LABEL org.opencontainers.image.title="josenilto-dev-portfolio" \
      org.opencontainers.image.description="Portfólio DEV — React/Vite/Tailwind/shadcn" \
      org.opencontainers.image.source="https://github.com/josenilto/josenilto.github.io"

# Hardening: remove pacotes desnecessários e atualiza CVEs Alpine
RUN apk upgrade --no-cache && \
    apk del --no-cache curl fontconfig freetype libavif 2>/dev/null || true

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.dev.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
