# syntax=docker/dockerfile:1.6

ARG OS_USERID=1002
ARG OS_GROUPID=1002
ARG OS_USERNAME="vscode"
ARG APP_HOME="/opt/docusaurus"

# FROM node:20-alpine AS base
# FROM mcr.microsoft.com/devcontainers/javascript-node:20 AS base
FROM mcr.microsoft.com/devcontainers/javascript-node:20-bookworm AS base

# Bash is required by the devcontainer - Docker devfeature.
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt/lists \
    set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        bash \
        bash-completion; \
    rm -rf /var/lib/apt/lists/*

# We'll create our user in order to make sure files are owned by the right user
# and not root. This will avoid to force us to run a "chown" command every time
# which will be really slow.
ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME
ARG APP_HOME

RUN set -eux \
    && addgroup --gid ${OS_GROUPID} vscode \
    && adduser --uid ${OS_USERID} --ingroup vscode \
               --home /home/${OS_USERNAME} \
               --shell /bin/bash \
               --disabled-password \
               ${OS_USERNAME} \
    && groupadd docker || true \
    && usermod -aG docker ${OS_USERNAME} \
    && mkdir -p "${APP_HOME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${APP_HOME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" /home/${OS_USERNAME}

USER "${OS_USERNAME}"
WORKDIR "${APP_HOME}"

# --- Stage 1: Dependency Installation (node:20-alpine) ---
FROM base AS dependencies
ENV HOME=/tmp
ARG APP_HOME
ARG OS_USERNAME
ARG OS_USERID
RUN mkdir -p "${APP_HOME}"
WORKDIR "${APP_HOME}"
COPY --chown=vscode:vscode package.json package-*.* yarn*.* ./
USER "${OS_USERNAME}"
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,uid=${OS_USERID} \
    yarn install --frozen-lockfile --cache-folder /usr/local/share/.cache/yarn/v6 --prefer-offline

# --- Stage 2: Prepare for the devcontainer ---
FROM base AS development
ARG APP_HOME
RUN mkdir -p "${APP_HOME}"
WORKDIR "${APP_HOME}"
COPY --chown=vscode:vscode . .
COPY --chown=vscode:vscode --from=dependencies "${APP_HOME}"/node_modules ./node_modules

# --- Stage 3: Build the Docusaurus site ---
FROM development AS build
RUN yarn build

# --- Stage 4: Final Production Image (Minimal Nginx image for serving static files) ---
FROM nginx:stable-alpine AS production
ARG APP_HOME
RUN rm -rf /usr/share/nginx/html/*
RUN mkdir -p "${APP_HOME}"
COPY --from=build "${APP_HOME}"/build /usr/share/nginx/html
RUN mkdir -p /etc/nginx/certs
COPY localhost.pem /etc/nginx/certs/
COPY localhost-key.pem /etc/nginx/certs/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
