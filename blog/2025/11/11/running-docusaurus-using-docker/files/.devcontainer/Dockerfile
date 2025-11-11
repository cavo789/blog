# syntax=docker/dockerfile:1.6

# Use Dockerfile syntax version 1.6 for advanced features like cache mounts
# https://docs.docker.com/build/dockerfile/frontend/
# This Dockerfile is designed for use in a Devcontainer setup with VSCode

# Define build-time arguments for user and workspace configuration
ARG OS_USERID=1000
ARG OS_GROUPID=1000
ARG OS_USERNAME="node"
ARG APP_HOME="/opt/docusaurus"

# Use a custom base image that includes Node.js and Docusaurus dependencies
# This image is built from the `blog-docusaurus` Dockerfile file you'll
# find in the root directory of this blog
FROM blog-docusaurus:latest

# Re-declare APP_HOME to ensure it's available in later stages
ARG APP_HOME

# Switch to root to install system packages and configure environment
USER root

# Install essential packages with caching to speed up rebuilds
RUN --mount=type=cache,target=/var/lib/apt/lists \
    --mount=type=cache,target=/var/cache/apt \
    set -eux && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        bash \
        bash-completion \
        curl \
        ca-certificates \
        sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    git config --global --add safe.directory "${APP_HOME}"  # Avoid Git safety warnings

# Grant passwordless sudo access to the VSCode user
# Allow our VSCode user to run "sudo xxx" in case of very specific use case
ARG OS_USERNAME
RUN set -eux && \
    echo "${OS_USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/"${OS_USERNAME}" && \
    chmod 0440 /etc/sudoers.d/"${OS_USERNAME}"

# Create and set permissions for VSCode server folders used for extensions and remote features
RUN set -eux && \
    mkdir -p "/home/${OS_USERNAME}/.vscode-server/bin" && \
    mkdir -p "/home/${OS_USERNAME}/.vscode-server/extensions" && \
    mkdir -p "/home/${OS_USERNAME}/.vscode-server/data" && \
    chown -R "${OS_USERNAME}:${OS_USERNAME}" "/home/${OS_USERNAME}/.vscode-server"

# ---------- Shell and history setup ----------
# Configure bash history behavior for the VSCode user
RUN echo "export HISTFILE=/home/${OS_USERNAME}/.bash_history" >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'export HISTSIZE=10000' >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'export HISTFILESIZE=10000' >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'shopt -s histappend' >> "/home/${OS_USERNAME}/.bashrc"

# Customize the shell prompt for clarity and style
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${OS_USERNAME}/.bashrc"

# ---------- Yarn setup and dependency caching ----------
# Define Yarn cache location to improve install performance
ENV YARN_CACHE_FOLDER="/home/${OS_USERNAME}/.cache/yarn/v6"

# Create the cache folder and assign correct ownership
RUN set -eux && \
    mkdir -p "${YARN_CACHE_FOLDER}" && \
    chown -R "${OS_USERNAME}:${OS_USERNAME}" "${YARN_CACHE_FOLDER}"

# Install project dependencies and the Sharp image plugin required by Docusaurus

ARG OS_USERID
ARG OS_GROUPID
RUN --mount=type=cache,target=${YARN_CACHE_FOLDER},uid=${OS_USERID},gid=${OS_GROUPID} \
    set -eux && \
    yarn install --immutable --frozen-lockfile --prefer-offline && \
    yarn add --platform=linux --arch=x64 sharp

# Switch to the VSCode user for development tasks
USER "${OS_USERNAME}"

# Set the working directory to the application root
WORKDIR "${APP_HOME}"
