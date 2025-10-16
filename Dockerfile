# Base image
FROM oven/bun:slim AS base
WORKDIR /app



# Install system dependencies for building native modules
RUN apt-get update -y && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# -------------------
# Install dependencies
# -------------------
FROM base AS deps
# Copy package files for caching
COPY package.json bun.lock /app/
# Install dev dependencies
RUN bun install --frozen-lockfile
# Install production dependencies separately
RUN bun install --frozen-lockfile --production

# -------------------
# Build code
# -------------------
FROM base AS builder
COPY --from=deps /app/node_modules node_modules
COPY . /app

# Generate Prisma client & build project
RUN bun db:generate
RUN bun code:build

# -------------------
# Release image
# -------------------
FROM base AS release
WORKDIR /app

# Copy built code and production deps
COPY --from=builder /app/out /app/out
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json /app/




EXPOSE 3000/tcp
USER bun

ENTRYPOINT ["bun", "run", "start"]