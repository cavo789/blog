# syntax=docker/dockerfile:1

# Source https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

ARG TARGET=production

# Stage 1: Base image.

FROM node:lts AS base

# Disable colour output from yarn to make logs easier to read.
ENV FORCE_COLOR=0

# Enable corepack.
RUN corepack enable

# Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus

ARG TARGET
ENV TARGET=${TARGET}

RUN /bin/bash -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> ~/.bashrc "

# --------------------------------------------------------------------

# Stage 2a: Development mode.

FROM base AS development

# Run the development server.
CMD [ -d "node_modules" ] && yarn start || yarn install && yarn start --host 0.0.0.0

# --------------------------------------------------------------------

# Stage 2b: Production build mode.

FROM base AS building_production

# Copy over the source code.
COPY . /opt/docusaurus/

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# Build the static site (generated files will be created in /opt/docusaurus/build)
RUN yarn build

# --------------------------------------------------------------------

# Stage 3: Serve with Caddy

FROM caddy:2.7.6-alpine AS production

ARG TARGET
ENV TARGET=${TARGET}

RUN set -e -x; \
    apk update --no-cache && apk add --no-cache bash \
    && rm -rf /var/cache/apk/*

# Copy the Caddyfile (present in the repository root folder)
COPY --from=building_production /opt/docusaurus/Caddyfile /etc/caddy/Caddyfile

# Copy the Docusaurus build output.
COPY --from=building_production /opt/docusaurus/build /var/docusaurus

RUN /bin/sh -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> ~/.bashrc "
