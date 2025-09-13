# Multi-stage build for Dyad Web Platform
# Stage 1: Build dependencies and shared packages
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build shared package
FROM base AS shared-builder
WORKDIR /app
COPY shared/ ./shared/
RUN cd shared && npm run build

# Stage 3: Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY frontend/ ./frontend/
COPY --from=shared-builder /app/shared/dist ./shared/dist

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NODE_ENV=production

RUN cd frontend && npm run build

# Stage 4: Build backend
FROM base AS backend-builder
WORKDIR /app
COPY backend/ ./backend/
COPY --from=shared-builder /app/shared/dist ./shared/dist

# Generate Prisma client
RUN cd backend && npx prisma generate

# Build backend
RUN cd backend && npm run build

# Stage 5: Production image
FROM node:20-alpine AS production

# Create app directory and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dyad -u 1001
WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Copy built applications
COPY --from=frontend-builder --chown=dyad:nodejs /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder --chown=dyad:nodejs /app/frontend/public ./frontend/public
COPY --from=frontend-builder --chown=dyad:nodejs /app/frontend/package.json ./frontend/

COPY --from=backend-builder --chown=dyad:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=dyad:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=dyad:nodejs /app/backend/package.json ./backend/
COPY --from=backend-builder --chown=dyad:nodejs /app/backend/prisma ./backend/prisma

COPY --from=shared-builder --chown=dyad:nodejs /app/shared/dist ./shared/dist

# Copy production dependencies
COPY --from=base --chown=dyad:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=dyad:nodejs /app/package.json ./

# Copy startup script
COPY --chown=dyad:nodejs docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create logs directory
RUN mkdir -p /app/logs && chown dyad:nodejs /app/logs

# Switch to non-root user
USER dyad

# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/app/start.sh"]