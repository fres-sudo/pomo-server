# Base stage
FROM oven/bun:1.0.35 AS base
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .

# Migration stage
FROM base AS migrate
WORKDIR /app
ENV NODE_ENV=production
RUN bun install --production
CMD ["bun", "run", "db:migrateprod"]

# Build stage
FROM base AS build
WORKDIR /app
RUN bun install --frozen-lockfile
RUN bun build ./src/index.ts --compile --outfile cli

# Production stage
FROM node:18 AS production
WORKDIR /app

# Copy the Bun binary from the Bun stage
COPY --from=oven/bun:1.0.35 /usr/local/bin/bun /usr/local/bin/bun
ENV PATH="/usr/local/bin:$PATH"

# Copy the built app from the build stage
COPY --from=build /app .

# Expose a port (if needed)
EXPOSE 9000

CMD ["bun", "run", "start"]
