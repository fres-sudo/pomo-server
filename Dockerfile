# Base image with Bun
FROM oven/bun:1.0.35 as base

WORKDIR /home/bun/app

# Install migration-specific dependencies in a separate directory
FROM base as migration-deps
WORKDIR /migrations
COPY ./scripts/package.json ./scripts/pnpm-lock.yaml ./
RUN bun install --no-save

# Application dependencies
FROM base as deps
WORKDIR /home/bun/app
COPY ./package.json ./bun.lockb ./
RUN bun install --no-save

# Build the app
FROM deps as builder
COPY . .
RUN bun build

# Production runtime image
FROM base as runner

WORKDIR /home/bun/app

# Expose application port
EXPOSE 9000

# Copy build artifacts
COPY --from=builder /home/bun/app/dist ./dist
COPY --from=migration-deps /migrations/node_modules ./migrations/node_modules

# Copy scripts for migration and runtime
COPY ./scripts ./scripts
RUN chmod +x ./scripts/run.sh

# Start the app using the custom script
CMD ["./scripts/run.sh"]

