# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS codebase
COPY . /app


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS builder
# Install ffmpeg (includes ffprobe) and openssl
RUN apt-get update -y && apt-get install -y \
    openssl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=codebase /app/ /app/

# This stage requires presence of DATABASE URL env var for Prisma otherwise error will be there`
# ENV DATABASE_URL="mongodb+srv://admin:password@prod.atlas.mongodb.net/ecommerce"
RUN bun db:generate:prod
RUN bun code:build
# /app/build/server.js is the single output file

# [optional] tests & build
ENV NODE_ENV=production
ENV PORT=3000
# RUN bun test





# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /app
COPY --from=builder /app/generated /app/generated
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
RUN apt-get update -y && apt-get install -y \
    openssl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=builder /app/build /app/build
COPY --from=codebase /app/package.json .



ENV NODE_ENV=production
ENV PORT=3000

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]