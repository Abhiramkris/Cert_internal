# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies and build in a single stage to minimize disk space usage
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Resource optimizations for small GCP VMs
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV NEXT_TELEMETRY_DISABLED=1

RUN rm -rf tmp .next && npm run build

# Stage 2: Minimal Runner
FROM node:22-alpine AS runner
# Install npm, git, and certbot for SSL provisioning
RUN apk add --no-cache npm git bash libc6-compat certbot
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create required directories
RUN mkdir -p /app/tmp && \
    mkdir -p /app/builds && \
    mkdir -p /app/node_modules && \
    mkdir -p /app/scripts && \
    chown -R nextjs:nodejs /app/tmp /app/builds /app/node_modules

# Copy app source and scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy and setup scripts
COPY scripts/ ./scripts/
RUN chmod +x scripts/*.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Note: certbot needs root. The entrypoint starts as root, 
# runs SSL setup, then we hand over execution.
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"]
