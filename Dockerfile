# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- build ---
# SILENT est exporté en statique : on compile avec Node, puis on ne garde
# que les fichiers produits. Pas de Nixpacks, pas de nix-env à télécharger.
FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Les dépendances d'abord : cette couche est réutilisée telle quelle tant que
# le verrou ne bouge pas. Le cache npm est monté par BuildKit, pour ne pas
# retélécharger les paquets quand il bouge.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --prefer-offline

COPY . .
RUN npm run build

# ------------------------------------------------------------------ run ---
FROM nginx:1.27-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
