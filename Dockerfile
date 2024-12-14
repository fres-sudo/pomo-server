# Base stage
FROM oven/bun:1.0.35 AS base
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .

# Production stage
FROM node:18 AS production
WORKDIR /app

# Copy the Bun binary from the Bun stage
COPY --from=oven/bun:1.0.35 /usr/local/bin/bun /usr/local/bin/bun
ENV PATH="/usr/local/bin:$PATH"

# Copy the built app from the build stage
COPY --from=base /app .

CMD ["sh", "-c", "bun run db:migrateprod && bun run start"]
