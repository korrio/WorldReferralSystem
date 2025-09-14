# Multi-stage build for Node.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env* ./
COPY --from=deps /app/node_modules ./node_modules

# Copy shared schema
COPY --from=builder /app/shared ./shared

USER nextjs

EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/index.js"]