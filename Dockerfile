# syntax=docker/dockerfile:1

# Source https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

ARG HOMEDIR=/opt/docusaurus
ARG TARGET=/development

# Stage 1: Base image.

FROM node:lts AS base

# Disable colour output from yarn to make logs easier to read.
ENV FORCE_COLOR=0

# Enable corepack.
RUN corepack enable

# Set the working directory to `/opt/docusaurus`.
ARG HOMEDIR
ENV HOMEDIR="${HOMEDIR}"

WORKDIR ${HOMEDIR}

ARG TARGET
RUN /bin/bash -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> ~/.bashrc "

# --------------------------------------------------------------------

# Stage 2a: Development mode.

FROM base AS development

RUN apt-get -y update \
    && apt-get install --yes --no-install-recommends git \
    && git config --global --add safe.directory ${HOMEDIR} \
    && rm -rf /var/lib/apt/lists/*

COPY package.* .

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# --------------------------------------------------------------------

# Stage 2b: Production build mode.

FROM base AS building_production

ARG TARGET

# Target is set in the .env file to "development" or "production"
ENV NODE_ENV=${TARGET}

# Install the latest version of Docusaurus
RUN npx create-docusaurus@latest  "${HOMEDIR}/" classic --javascript && \
    chown -R node:node  "${HOMEDIR}/"

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# Set the working directory to `/opt/docusaurus`.
WORKDIR "${HOMEDIR}"

# Copy over the source code.
COPY . "${HOMEDIR}/"

# Build the static site (generated files will be created in /opt/docusaurus/build)
RUN yarn build

# --------------------------------------------------------------------

# Stage 3: Serve with Caddy

FROM caddy:2.7.6-alpine AS production

RUN set -e -x; \
    apk update --no-cache && apk add --no-cache bash \
    && rm -rf /var/cache/apk/*

ARG HOMEDIR

# Copy the Caddyfile (present in the repository root folder)
COPY --from=building_production "${HOMEDIR}/Caddyfile" /etc/caddy/Caddyfile

# Copy the Docusaurus build output.
COPY --from=building_production "${HOMEDIR}/build" /var/docusaurus

ARG TARGET

RUN /bin/sh -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> ~/.bashrc "
