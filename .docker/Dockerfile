# syntax=docker/dockerfile:1

# cspell:ignore hadolint,skel

# Source https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

ARG HOMEDIR=/opt/docusaurus
ARG TARGET=/development

# # The user and group ID of the user to create
# ARG DOCKER_UID=1000
# ARG DOCKER_GID=1000
# ARG USERNAME=node

# region - Stage 1: Base image.

FROM node:lts AS base

# Disable color output from yarn to make logs easier to read.
ENV FORCE_COLOR=0

# Enable corepack.
RUN corepack enable

# Make sure bash is installed
RUN apt-get -y update \
    && apt-get install --yes --no-install-recommends bash \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory to `/opt/docusaurus`.
ARG HOMEDIR
WORKDIR "${HOMEDIR}"

# Adjust PS1
ARG TARGET
ENV TARGET="${TARGET}"

RUN /bin/bash -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> /home/node/.bashrc "

# endregion

# region - Stage 2a: Development mode.

FROM base AS development

ARG HOMEDIR

# Install git
RUN apt-get -y update \
    && apt-get install --yes --no-install-recommends git \
    && git config --global --add safe.directory ${HOMEDIR} \
    && rm -rf /var/lib/apt/lists/*

USER root

RUN set -e -x \
    && mkdir -p "/home/node/.vscode-server/bin" \
    && mkdir -p "/home/node/.vscode-server/extensions" \
    && chown -R "node":"node" "/home/node"

USER node

# # We'll create a new user with the same uid/gid than ours, on our host machine.
# ARG DOCKER_UID
# ARG DOCKER_GID
# ARG USERNAME

# # hadolint ignore=DL3008
# RUN set -e -x \
#     && if [ ! "$DOCKER_UID" = "1000" ]; then \
#     groupadd --gid ${DOCKER_GID} "${USERNAME}" \
#     && useradd --home-dir /home/"${USERNAME}" --create-home --uid ${DOCKER_UID} \
#         --gid ${DOCKER_GID} --shell /bin/sh --skel /dev/null "${USERNAME}" ; \
#     fi

# USER "${USERNAME}"

# endregion

# region - Stage 2b: Production build mode.

FROM base AS building_production

ARG TARGET

# Target is set in the .env file to "development" or "production"
ENV NODE_ENV="${TARGET}"

# Install the latest version of Docusaurus
ARG HOMEDIR
RUN npx create-docusaurus@latest "${HOMEDIR}/" classic --javascript \
    # Remove dummy files like dummy blog, docs, ... that were added during the installation
    && rm -rf "${HOMEDIR}/blog" "${HOMEDIR}/docs" "${HOMEDIR}/src" \
    && chown -R node:node "${HOMEDIR}/"

# We need our package.json / package.lock file before running yarn install
COPY package.* .

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# Copy over the source code.
COPY . "${HOMEDIR}/"

# Build the static site (generated files will be created in /opt/docusaurus/build)
RUN yarn build

# endregion

# region - Stage 3: Serve with nginx

FROM nginx:stable-alpine3.19-perl AS production

RUN set -e -x; \
    apk update --no-cache && apk add --no-cache bash \
    && rm -rf /var/cache/apk/*

ARG TARGET

RUN /bin/sh -c "echo \"PS1='\n\e[0;33m🐳 (${TARGET})\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> ~/.bashrc "

# Copy the Docusaurus build output.
ARG HOMEDIR

COPY --from=building_production "${HOMEDIR}/build /usr/share/nginx/html"

WORKDIR /usr/share/nginx/html

# endregion
