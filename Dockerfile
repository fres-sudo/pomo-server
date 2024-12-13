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
FROM oven/bun:1.0.35 AS production
WORKDIR /app
COPY --from=build /app .
CMD ["bun", "run", "start"]

