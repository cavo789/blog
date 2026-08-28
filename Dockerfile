# syntax=docker/dockerfile:1.9

# By default, 1000:1000 but can be different like 1002:1002.
# There parameters are initialized using the "make build" command.
ARG OS_USERID=1000
ARG OS_GROUPID=1000

# Don't change, we'll reuse the standard user (the "node" user is
# the one is node Docker image having user 1000:1000
ARG OS_USERNAME="node"

# Yarn cache folder location
ARG HOME_FOLDER="/home/${OS_USERNAME}"
ARG YARN_CACHE_FOLDER="${HOME_FOLDER}/.cache/yarn/v6"

# Root folder where Docusaurus will be installed in the Docker image
ARG APP_HOME="/opt/docusaurus"

# ─────────────────────────────────────────────────────────────
# 🧱 Base Image: Devcontainer Node.js environment
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS base

# Install bash and bash-completion (required for Devcontainer shell features)
ENV DEBIAN_FRONTEND=noninteractive
# Avoid .pyc cache files from build-time pip/pre-commit invocations, and unbuffered stdout for
# any Python process run interactively in this container.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt/lists \
    set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        bash-completion \
        curl \
        git \
        lsof \
        openssl \
        procps

# Pin yarn to the version declared in package.json#packageManager (overrides corepack's symlink)
RUN npm install -g yarn@1.22.22 --force --quiet

# If the host userid/groupid is different from 1000:1000 then update the
# existing node user to these IDs. This is not needed here for the production
# image but well for devcontainer to remove permissions problems while synchronizing
# with the host
ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

RUN set -eux && \
    if [ "$OS_USERID" -ne 1000 ] || [ "$OS_GROUPID" -ne 1000 ]; then \
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

# Ensure yarn cache folder exists in the image and contains a placeholder so
# Docker will populate named volumes with content owned by the correct user.
ARG YARN_CACHE_FOLDER
RUN mkdir -p "${YARN_CACHE_FOLDER}" && \
    touch "${YARN_CACHE_FOLDER}/.keep"

# ─────────────────────────────────────────────────────────────
# 📦 Stage 1: Dependency Installation
# ─────────────────────────────────────────────────────────────
FROM base AS dependencies

ARG APP_HOME
ARG OS_USERNAME
ARG OS_USERID
ARG OS_GROUPID
ARG YARN_CACHE_FOLDER

# Configure the cache folder for yarn so we can reuse it in our Devcontainer later on
ENV YARN_CACHE_FOLDER=${YARN_CACHE_FOLDER}

USER root

RUN set -eux && \
    mkdir -p "${YARN_CACHE_FOLDER}" && \
    chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${YARN_CACHE_FOLDER}"

# Copy package manifests and lockfiles for dependency installation
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" package.json package-*.* yarn*.* ./

USER "${OS_USERNAME}"

# Install dependencies using Yarn with cache mount
# sharp is already in package.json; @img/sharp-linux-x64 is in yarn.lock — no yarn add needed
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER},uid=${OS_USERID},gid=${OS_GROUPID} \
    yarn install --immutable --frozen-lockfile --prefer-offline

# ─────────────────────────────────────────────────────────────
# 🧪 Stage 2: Development Environment Setup
#
# This is the target to use when building a Devcontainer
# ─────────────────────────────────────────────────────────────
FROM base AS development

# https://github.com/facebook/docusaurus/discussions/10580
ENV DOCUSAURUS_IGNORE_SSG_WARNINGS=true

ARG YARN_CACHE_FOLDER
ENV YARN_CACHE_FOLDER=${YARN_CACHE_FOLDER}

ARG APP_HOME
ARG HOME_FOLDER
ARG OS_USERNAME

# The home folder has to be owned by the user
RUN set -eux && \
    mkdir -p "${HOME_FOLDER}" \
        "${HOME_FOLDER}/.vscode-server/extensions" \
        "${HOME_FOLDER}/.vscode-server/data/Machine" \
        "${HOME_FOLDER}/.cache/yarn/v6"

# Copy package manifests from dependencies stage (node_modules are supplied at runtime via named volume)
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" --from=dependencies "${APP_HOME}"/package.json "${APP_HOME}"/package-*.* "${APP_HOME}"/yarn*.* ./

# Switch to root to install global scripts
USER root
COPY --chmod=755 .devcontainer/scripts/interactive.sh /usr/local/bin/
COPY --chmod=755 .devcontainer/docker-entrypoint.sh /usr/local/bin/
USER "${OS_USERNAME}"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# ─────────────────────────────────────────────────────────────
# 🔧 Stage 3: Devcontainer (extends development)
#
# Single self-contained build target for VSCode devcontainers.
# "code . → Reopen in Container" works without any prior make build.
# ─────────────────────────────────────────────────────────────
FROM development AS devcontainer

ARG OS_USERNAME="node"
ARG OS_USERID=1000
ARG OS_GROUPID=1000

# mkcert v1.4.4 — update both ARGs together when bumping the version
ARG MKCERT_SHA256_AMD64="6d31c65b03972c6dc4a14ab429f2928300518b26503f58723e532d1b0a3bbb52"
ARG MKCERT_SHA256_ARM64="b98f2cc69fd9147fe4d405d859c57504571adec0d3611c3eefd04107c7ac00d0"

USER root

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_BREAK_SYSTEM_PACKAGES=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN --mount=type=cache,target=/var/lib/apt/lists \
    --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        jq \
        openssh-client \
        python3 \
        python3-pip \
        sudo && \
    echo "${OS_USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/"${OS_USERNAME}" && \
    chmod 0440 /etc/sudoers.d/"${OS_USERNAME}" && \
    ARCH=$(dpkg --print-architecture) && \
    curl -sSL "https://dl.filippo.io/mkcert/latest?for=linux/${ARCH}" -o /usr/local/bin/mkcert && \
    case "${ARCH}" in \
      amd64) echo "${MKCERT_SHA256_AMD64}  /usr/local/bin/mkcert" | sha256sum -c ;; \
      arm64) echo "${MKCERT_SHA256_ARM64}  /usr/local/bin/mkcert" | sha256sum -c ;; \
      *) echo "Unknown arch ${ARCH}, skipping checksum" ;; \
    esac && \
    chmod +x /usr/local/bin/mkcert

USER "${OS_USERNAME}"

RUN --mount=type=cache,target=/home/${OS_USERNAME}/.cache/pip,uid=${OS_USERID},gid=${OS_GROUPID} \
    pip install --upgrade pip && \
    pip install \
        oyaml \
        pre-commit \
        python-frontmatter \
        requests

# Pre-install Playwright's Chromium browser + OS-level deps, so the "run" skill /
# verification scripts can render pages in a headless browser without a slow,
# repeated first-use download inside the running devcontainer.
RUN --mount=type=cache,target=/var/lib/apt/lists \
    --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/home/${OS_USERNAME}/.cache/ms-playwright,uid=${OS_USERID},gid=${OS_GROUPID} \
    npx playwright install --with-deps chromium

# ─────────────────────────────────────────────────────────────
# 🏗️ Stage 4: Static Site Build
#
# This stage is used to build the static site; when
# "TARGET=production make build" is fired.
# ─────────────────────────────────────────────────────────────
FROM development AS build

ARG OS_USERNAME

# node_modules are not baked into development (served via named volume for devcontainer);
# restore them here explicitly so yarn build has its full dependency tree.
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" --from=dependencies "${APP_HOME}"/node_modules ./node_modules

# Copy only what yarn build needs — not api/, scripts/, nginx.conf, certs, .unpublished/, etc.
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" blog/              ./blog/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" src/               ./src/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" static/            ./static/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" plugins/           ./plugins/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" docusaurus.config.js sidebars.js ./

# Build the Docusaurus site into static HTML/CSS/JS
RUN yarn build

# ─────────────────────────────────────────────────────────────
# 🚀 Stage 4: Production Image (Nginx)
#
# Minimal Nginx image for serving static files)
# ─────────────────────────────────────────────────────────────
FROM nginx:stable-alpine@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46 AS production

LABEL org.opencontainers.image.title="blog-docusaurus" \
      org.opencontainers.image.version="0.1.0" \
      org.opencontainers.image.description="Personal technical blog powered by Docusaurus 3.x" \
      org.opencontainers.image.vendor="cavo789" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="cavo789@gmail.com"

# Clean default Nginx content
RUN rm -rf /usr/share/nginx/html/*

ARG APP_HOME

# Copy built static site from build stage into Nginx's web root
COPY --from=build "${APP_HOME}"/build /usr/share/nginx/html

# Create cert dir; mount real certs at runtime via -v /path/to/certs:/etc/nginx/certs:ro
RUN mkdir -p /etc/nginx/certs

# Replace default Nginx config with custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# HTTPS healthcheck — certs must be mounted at runtime; --no-check-certificate handles self-signed
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO /dev/null --no-check-certificate https://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
