# syntax=docker/dockerfile:1

# cspell:ignore PYTHONDONTWRITEBYTECODE,PYTHONUNBUFFERED,HISTFILE
# cspell:ignore addgroup,adduser,keyscan,hadolint,gecos,endregion

# Those variables are initialized in the .docker.env file
ARG DOCKER_APP_HOME="/app"
ARG DOCKER_CONTAINER_NAME="python"
ARG DOCKER_OS_GROUPID=1000
ARG DOCKER_OS_USERID=1000
ARG DOCKER_OS_USERNAME="python"
ARG DOCKER_PYTHON_VERSION=3.10-slim

# region - Our Python base image. We'll install Linux and Python dependencies here
# and do some other configuration work

FROM python:${DOCKER_PYTHON_VERSION} AS base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

ARG DOCKER_APP_HOME
WORKDIR "${DOCKER_APP_HOME}/src"

# hadolint ignore=DL3008
RUN --mount=type=cache,target=/var/cache/apk,rw \
    set -e -x \
    && printf "\e[0;105m%s\e[0;0m\n" "Install required Linux binaries..."  \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends bash git openssh-client tree \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# Install Python dependencies
#
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=src/requirements.txt,target=requirements.txt \
    printf "\e[0;105m%s\e[0;0m\n" "Install Python dependencies" \
    && python -m pip install --no-cache-dir -r requirements.txt

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]

# endregion

# region - Define our development image
FROM base AS development

ENV SHELL /bin/bash

# Our user will be part of the root group since we're building the development image
ARG DOCKER_OS_GROUPID
ARG DOCKER_OS_USERID
ARG DOCKER_OS_USERNAME

RUN set -e -x \
    mkdir -p "/home/.vscode-server/bin" \
    && mkdir -p "/home/.vscode-server/extensions" \
    && mkdir -p "/home/.vscode-server/extensionsCache" \
    && printf "\e[0;105m%s\e[0;0m\n" "Create our ${DOCKER_OS_USERNAME} application user" \
    && mkdir -p "/home/${DOCKER_OS_USERNAME}/.vscode-server/bin" \
    && mkdir -p "/home/${DOCKER_OS_USERNAME}/.vscode-server/extensions" \
    && mkdir -p "/home/${DOCKER_OS_USERNAME}/.vscode-server/extensionsCache" \
    # Create the application user home directory
    && mkdir -p "/home/${DOCKER_OS_USERNAME}" \
    # Create our application user group
    && addgroup "${DOCKER_OS_USERNAME}" --gid "${DOCKER_OS_GROUPID}" \
    # Create our application user
    && adduser \
    --system \
    --disabled-password \
    --gecos "" \
    --home "/home/${DOCKER_OS_USERNAME}" \
    --uid "${DOCKER_OS_USERID}" \
    "${DOCKER_OS_USERNAME}" \
    # And, finally, set the correct permissions to the home folder of our user
    && chown -R "${DOCKER_OS_USERNAME}:${DOCKER_OS_USERNAME}" "/home/${DOCKER_OS_USERNAME}"

USER "${DOCKER_OS_USERNAME}"

ARG DOCKER_CONTAINER_NAME

RUN /bin/bash -c "echo \"PS1='\n\e[0;33m🐳 ${DOCKER_CONTAINER_NAME} \e[0;32mDEV\e[0m - \e[0;36m$(whoami)\e[0m \w # '\" >> /home/${DOCKER_OS_USERNAME}/.bashrc"

# Save the bash history in file /home/${OS_USERNAME}/commandhistory/.bash_history
# Like this we'll be able to map that folder using a volume in our
# compose.yaml file and then make the history persistent.
RUN set -e -x \
    && SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/home/${DOCKER_OS_USERNAME}/commandhistory/.bash_history" \
    && mkdir -p "/home/${DOCKER_OS_USERNAME}/commandhistory" \
    && touch "/home/${DOCKER_OS_USERNAME}/commandhistory/.bash_history" \
    && echo "${SNIPPET}" >> "/home/${DOCKER_OS_USERNAME}/.bashrc" \
    && echo "${SNIPPET}" >> "/home/${DOCKER_OS_USERNAME}/.bashrc"

# endregion
