# =============================================================================
# FABINS Frontend — Next.js Multi-Stage Production Dockerfile
#
# Optimized 3-stage build using Node.js 20 Alpine for minimal image size (~120MB)
# and maximum container security.
# =============================================================================

# --- STAGE 1: Install Dependencies --------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# glibc shim — some native Node modules are built against glibc and will not
# load on Alpine's musl without it. --no-cache skips writing the package index
# to the image layer.
RUN apk add --no-cache libc6-compat

# Copy package descriptors first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install production and development dependencies cleanly using pnpm
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# --- STAGE 2: Build Application -----------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables needed during static generation (if any)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run Next.js production build (generates output in .next/standalone)
RUN npm run build

# --- STAGE 3: Production Runner Image ----------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root system user for runtime security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential public assets & standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Execute Next.js standalone Node server
CMD ["node", "server.js"]
