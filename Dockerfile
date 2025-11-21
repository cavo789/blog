# syntax=docker/dockerfile:1.6

# By default, 1000:1000 but can be different like 1002:1002.
# There parameters are initialized using the "make build" command.
ARG OS_USERID=1000
ARG OS_GROUPID=1000

# Don't change, we'll reuse the standard user (the "node" user is
# the one is node Docker image having user 1000:1000
ARG OS_USERNAME="node"

# Root folder where Docusaurus will be installed in the Docker image
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

# If the host userid/groupid is different from 1000:1000 then update the
# existing node user to these IDs. This is not needed here for the production
# image but well for devcontainer to remove permissions problems while synchronizing
# with the host
ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

RUN set -eux && \
    if [ "$OS_USERID" != 1000 ] || [ "$OS_GROUPID" != "1000" ]; then \
        groupmod -g "$OS_GROUPID" node; \
        usermod -u "$OS_USERID" -g "$OS_GROUPID" "${OS_USERNAME}"; \
    fi

# Add the node user to the docker group (create it if needed) to allow,
# in devcontainer, to run Docker-in-Docker actions if needed
RUN set -eux && \
    groupadd docker || true && \
    usermod -aG docker "${OS_USERNAME}"

ARG APP_HOME
RUN set -eux && \
    # Make sure the home folder exists
    mkdir -p "${APP_HOME}" && \
    # Pre-create the .docusaurus folder to avoid permission issues during build
    # Note: this folder will be stored in memory (tmpfs) when running devcontainer
    mkdir -p "${APP_HOME}/.docusaurus" && \
    chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${APP_HOME}"

# Switch to non-root user for all subsequent stages
USER "${OS_USERNAME}"
WORKDIR "${APP_HOME}"

# ─────────────────────────────────────────────────────────────
# 📦 Stage 1: Dependency Installation
# ─────────────────────────────────────────────────────────────
FROM base AS dependencies

ARG APP_HOME
ARG OS_USERNAME
ARG OS_USERID
ARG OS_GROUPID

# Configure the cache folder for yarn so we can reuse it in our Devcontainer later on
ENV YARN_CACHE_FOLDER=/home/${OS_USERNAME}/.cache/yarn/v6
RUN set -eux && \
    mkdir -p "${YARN_CACHE_FOLDER}" && \
    chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${YARN_CACHE_FOLDER}"

# Copy package manifests and lockfiles for dependency installation
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" package.json package-*.* yarn*.* ./

USER "${OS_USERNAME}"

# Install dependencies using Yarn with cache mount
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER},uid=${OS_USERID},gid=${OS_GROUPID} \
    yarn install --immutable --frozen-lockfile --prefer-offline

# ─────────────────────────────────────────────────────────────
# 🧪 Stage 2: Development Environment Setup
#
# This is the target to use when building a Devcontainer
# ─────────────────────────────────────────────────────────────
FROM base AS development

ARG APP_HOME

# Copy full project source code and installed node_modules from dependencies stage

COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" --from=dependencies "${APP_HOME}"/node_modules ./node_modules

# ─────────────────────────────────────────────────────────────
# 🏗️ Stage 3: Static Site Build
#
# This stage is used to build the static site; when
# "TARGET=production make build" is fired.
# ─────────────────────────────────────────────────────────────
FROM development AS build

ARG APP_HOME

# Copy full project source code
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" . .

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
