# Syntax: Dockerfile syntax version
# syntax = docker/dockerfile:1.7

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy package files for caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies (including workspace packages)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

# Build shared types (install its deps first)
RUN cd packages/shared-types && pnpm install --no-frozen-lockfile && pnpm run build

# Build frontend with production config (enables standalone output)
RUN cp apps/frontend/next.config.production.js apps/frontend/next.config.js && \
    pnpm --filter=page-pulse-frontend run build

# Production stage - standalone Next.js output
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy built artifacts (Next.js standalone output)
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

# Copy package.json for pnpm workspace
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/frontend/server.js"]