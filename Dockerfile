# Base stage
FROM oven/bun:1.0.35 AS base
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .

RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x bullseye main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean

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

