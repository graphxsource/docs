FROM node:25-alpine3.23 AS base

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/gxsio/package.json ./apps/gxsio/package.json
COPY apps/gxsio/source.config.ts ./apps/gxsio/source.config.ts
COPY apps/gxsio/next.config.mjs ./apps/gxsio/next.config.mjs

RUN PNPM_VERSION=$(node -e "console.log(require('./package.json').packageManager.split('@')[1])") \
    && npm install -g pnpm@${PNPM_VERSION}

FROM base AS deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/gxsio/node_modules ./apps/gxsio/node_modules

COPY apps/gxsio/source.config.ts ./apps/gxsio/source.config.ts
COPY apps/gxsio/next.config.mjs ./apps/gxsio/next.config.mjs
COPY apps/gxsio ./apps/gxsio

ENV DOCKER_BUILD=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN cd apps/gxsio && pnpm build

FROM node:25-alpine3.23 AS runner

WORKDIR /app

COPY --chown=1001:1001 package.json ./

RUN PNPM_VERSION=$(node -e "console.log(require('./package.json').packageManager.split('@')[1])") \
    && npm install -g pnpm@${PNPM_VERSION}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nextjs:nodejs /app/apps/gxsio/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/gxsio/.next/static ./apps/gxsio/.next/static

USER nextjs

WORKDIR /app/apps/gxsio

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
