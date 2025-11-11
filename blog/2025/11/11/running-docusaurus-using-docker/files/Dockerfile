# syntax=docker/dockerfile:1.6

# Define build-time arguments for user and workspace configuration
ARG OS_USERNAME="node"
ARG APP_HOME="/opt/docusaurus"

# ─────────────────────────────────────────────────────────────
# 🧱 Base Image: Devcontainer Node.js environment
# ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm AS base

# Install bash and bash-completion (required for Devcontainer shell features)
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt/lists \
    set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        bash-completion; \
    rm -rf /var/lib/apt/lists/*

# We'll create our user in order to make sure files are owned by the right user
# and not root. This will avoid to force us to run a "chown" command every time
# which will be really slow.
ARG OS_USERNAME
ARG APP_HOME

ARG OS_USERNAME
ARG APP_HOME

RUN set -eux && \
    mkdir -p "${APP_HOME}" && \
    chown -R "${OS_USERNAME}:${OS_USERNAME}" "${APP_HOME}" /home/${OS_USERNAME}

# Pre-create the .docusaurus folder to avoid permission issues during build
RUN set -eux && \
    mkdir -p "${APP_HOME}/.docusaurus" && \
    chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${APP_HOME}"

# Switch to non-root user for all subsequent stages
USER "${OS_USERNAME}"
WORKDIR "${APP_HOME}"

# ─────────────────────────────────────────────────────────────
# 📦 Stage 1: Dependency Installation
# ─────────────────────────────────────────────────────────────
FROM base AS dependencies

ENV HOME=/tmp

ARG APP_HOME
ARG OS_USERNAME

# Configure the cache folder for yarn so we can reuse it in our Devcontainer later on
ENV YARN_CACHE_FOLDER=/home/${OS_USERNAME}/.cache/yarn/v6
RUN set -eux && \
    mkdir -p "${YARN_CACHE_FOLDER}" && \
    chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${YARN_CACHE_FOLDER}"

# Copy package manifests and lockfiles for dependency installation
COPY --chown=node:node package.json package-*.* yarn*.* ./

USER "${OS_USERNAME}"

# Install dependencies using Yarn with cache mount (1000:1000 is the UID/GID
# of the current "node" user)
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER},uid=1000,gid=1000 \
    yarn install --immutable --frozen-lockfile --prefer-offline

# ─────────────────────────────────────────────────────────────
# 🧪 Stage 2: Development Environment Setup
#
# This is the target to use when building a Devcontainer
# ─────────────────────────────────────────────────────────────
FROM base AS development

ARG APP_HOME

# Ensure working directory exists
RUN mkdir -p "${APP_HOME}"

WORKDIR "${APP_HOME}"

# Copy full project source code and installed node_modules from dependencies stage
COPY --chown=node:node . .
COPY --chown=node:node --from=dependencies "${APP_HOME}"/node_modules ./node_modules

# ─────────────────────────────────────────────────────────────
# 🏗️ Stage 3: Static Site Build
#
# This stage is used to build the static site; when
# "TARGET=production make build" is fired.
# ─────────────────────────────────────────────────────────────
FROM development AS build

# Build the Docusaurus site into static HTML/CSS/JS
RUN yarn build


# ─────────────────────────────────────────────────────────────
# 🚀 Stage 4: Production Image (Nginx)
#
# Minimal Nginx image for serving static files)
# ─────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Clean default Nginx content
RUN rm -rf /usr/share/nginx/html/*

ARG APP_HOME
RUN mkdir -p "${APP_HOME}"

# Copy built static site from build stage into Nginx's web root
COPY --from=build "${APP_HOME}"/build /usr/share/nginx/html

# Add TLS certificates (for HTTPS support)
RUN mkdir -p /etc/nginx/certs
COPY localhost.pem /etc/nginx/certs/
COPY localhost-key.pem /etc/nginx/certs/

# Replace default Nginx config with custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
