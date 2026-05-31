# syntax=docker/dockerfile:1

# ── Builder: установка зависимостей и сборка обоих пакетов ─────────────────────
FROM node:22-alpine AS builder
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# Сначала только манифесты — слой установки кэшируется, пока не меняются зависимости
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

# Исходники и сборка бэка (tsc) + фронта (vite)
COPY . .
RUN pnpm --filter @mern-stack/server build \
  && pnpm --filter @mern-stack/client build

# Изолированный prod-деплой бэкенда: server + только prod-зависимости → /app
RUN pnpm --filter @mern-stack/server --prod deploy /app

# ── Runner: минимальный образ только с тем, что нужно в рантайме ───────────────
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV CLIENT_DIST_DIR=/app/client/dist
WORKDIR /app

# Бэкенд (dist + prod node_modules) и собранный SPA
COPY --from=builder /app ./
COPY --from=builder /repo/client/dist ./client/dist

EXPOSE 5000
CMD ["node", "dist/server.js"]
