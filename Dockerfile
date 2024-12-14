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

# Copy the Bun runtime from the Bun stage
COPY --from=oven/bun:1.0.35 /bun /usr/local/bin/bun
COPY --from=oven/bun:1.0.35 /usr/local/lib/bun /usr/local/lib/bun
ENV PATH="/usr/local/bin:$PATH"

# Copy the built app from the build stage
COPY --from=build /app .

CMD ["bun", "run", "start"]


