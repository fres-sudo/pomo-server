# Base stage
FROM oven/bun:1.0.35 AS base
WORKDIR /app

# Install dependencies in the base stage
COPY package.json .
RUN bun install --frozen-lockfile

# Copy the rest of the source code for building
COPY . .

# Build stage
FROM base AS build
RUN bun build ./src/index.ts --compile --outfile ./cli

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install Bun in the production stage
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copy the built app and node_modules from the build stage
COPY --from=build /app/cli /app/cli
COPY --from=build /app/node_modules /app/node_modules

# Expose the application port
EXPOSE 9000

# Run migrations and then the built app
CMD ["sh", "-c", "bun run db:migrateprod && ./cli"]

