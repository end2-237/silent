# ---------------------------------------------------------------- build ---
# SILENT est exporté en statique : on compile avec Node, puis on ne garde que
# les fichiers produits. Aucune directive « syntax » ici : elle obligerait le
# démon à télécharger l'image frontend docker/dockerfile avant de commencer.
FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Les dépendances d'abord : couche réutilisée tant que le verrou ne bouge pas.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ------------------------------------------------------------------ run ---
# alpine-slim : 5 Mo, sans les modules nginx dont un site statique n'a pas
# besoin. L'image finale à télécharger pèse donc environ 7 Mo.
FROM nginx:1.27-alpine-slim AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
