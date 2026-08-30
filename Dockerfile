# ---- deps & build ----
FROM oven/bun:1 AS builder
WORKDIR /app

# NEXT_PUBLIC_* values are inlined at build time — must be a build ARG.
ARG NEXT_PUBLIC_PB_URL=http://localhost:8090
ENV NEXT_PUBLIC_PB_URL=$NEXT_PUBLIC_PB_URL

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---- runtime ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
# Next copies the build .env into standalone — strip it so no secrets are
# baked into the image. Runtime env is injected via docker-compose.
RUN rm -f .env
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]