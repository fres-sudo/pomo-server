# Base stage
FROM oven/bun:1.0.35 AS base
WORKDIR /home/bun/app
COPY package.json .
RUN bun install
COPY . .

# Migration stage
FROM base AS migrate
ENV NODE_ENV=production
RUN bun install --production
CMD ["bun", "run", "db:migrateprod"]

# Build stage
FROM base AS build
RUN bun add esbuild@latest
RUN bun install --production
RUN bun run build

# Production stage
FROM oven/bun:1.0.35 AS production
WORKDIR /home/bun/app
COPY --from=build /home/bun/app .
CMD ["bun", "run", "start"]

