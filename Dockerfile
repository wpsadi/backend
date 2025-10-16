# Base image
FROM oven/bun:slim AS base
WORKDIR /app



# Install system dependencies for building native modules
RUN apt-get update -y && apt-get install -y \
    build-essential \
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
COPY --from=builder /app/build /app/build
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json /app/




EXPOSE 3000/tcp
# EXPOSE 50051/tcp # its for internal use so no need to expose
USER bun

ENTRYPOINT ["bun", "run", "start"]