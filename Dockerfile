# Base stage
FROM --platform=linux/amd64 oven/bun:1.0.35 AS base
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .

# Production stage
FROM --platform=linux/amd64 node:18 AS production
WORKDIR /app

COPY --from=oven/bun:1.0.35 /usr/local/bin/bun /usr/local/bin/bun
ENV PATH="/usr/local/bin:$PATH"

COPY --from=base /app .

CMD ["sh", "-c", "bun run db:migrateprod && bun run start"]

