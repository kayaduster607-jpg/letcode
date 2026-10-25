FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate && pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate && pnpm generate:videos && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

RUN apk add --no-cache su-exec
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/ship ./ship
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p data && chown nextjs:nodejs data && chmod +x docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
