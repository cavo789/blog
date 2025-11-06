# syntax=docker/dockerfile:1.6

ARG OS_USERID=1002
ARG OS_GROUPID=1002
ARG OS_USERNAME="vscode"
ARG DOCKER_APP_HOME="/opt/docusaurus"

FROM node:20-alpine AS base

# We'll create our user in order to make sure files are owned by the right user
# and not root. This will avoid to force us to run a "chown" command every time
# which will be really slow.
ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME
ARG DOCKER_APP_HOME

RUN addgroup -g ${OS_GROUPID} vscode \
    && adduser -D -u ${OS_USERID} -G vscode vscode \
    && mkdir -p "${DOCKER_APP_HOME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${DOCKER_APP_HOME}"

USER "${OS_USERNAME}"
WORKDIR "${DOCKER_APP_HOME}"

# --- Stage 1: Dependency Installation (node:20-alpine) ---
FROM base AS dependencies
ARG DOCKER_APP_HOME
RUN mkdir -p "${DOCKER_APP_HOME}"
WORKDIR "${DOCKER_APP_HOME}"
COPY --chown=vscode:vscode package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# --- Stage 2: Prepare for the devcontainer ---
FROM base AS devcontainer
ARG DOCKER_APP_HOME
RUN mkdir -p "${DOCKER_APP_HOME}"
WORKDIR "${DOCKER_APP_HOME}"
COPY --chown=vscode:vscode . .
COPY --chown=vscode:vscode --from=dependencies "${DOCKER_APP_HOME}"/node_modules ./node_modules

# --- Stage 3: Build the Docusaurus site ---
FROM devcontainer AS build
RUN yarn build

# --- Stage 4: Final Production Image (Minimal Nginx image for serving static files) ---
FROM nginx:stable-alpine AS final
ARG DOCKER_APP_HOME
RUN rm -rf /usr/share/nginx/html/*
RUN mkdir -p "${DOCKER_APP_HOME}"
COPY --from=build "${DOCKER_APP_HOME}"/build /usr/share/nginx/html
RUN mkdir -p /etc/nginx/certs
COPY localhost.pem /etc/nginx/certs/
COPY localhost-key.pem /etc/nginx/certs/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]