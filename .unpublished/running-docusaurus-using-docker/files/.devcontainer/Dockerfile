# syntax=docker/dockerfile:1.6

ARG OS_USERID=1000
ARG OS_GROUPID=1000
ARG OS_USERNAME="vscode"
ARG APP_HOME="/opt/docusaurus"

FROM blog-docusaurus:latest

ARG APP_HOME

USER root

RUN --mount=type=cache,target=/var/lib/apt/lists \
    --mount=type=cache,target=/var/cache/apt \
    set -eux && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        bash \
        bash-completion \
        curl \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    git config --global --add safe.directory "${APP_HOME}"

ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

# Ensure vscode home folders exist and are writable. The .vscode-server folder is used by
# VSCode while installing extensions in the container. That folder has to be owner by our user; not root.
RUN set -eux \
    && mkdir -p "/home/"${OS_USERNAME}"/.vscode-server/bin" \
    && mkdir -p "/home/"${OS_USERNAME}"/.vscode-server/extensions" \
    && mkdir -p "/home/"${OS_USERNAME}"/.vscode-server/data" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/"${OS_USERNAME}"/.vscode-server"

# ---------- Shell and history setup -----------------------------------------
# Configure bash to use this file
RUN echo "export HISTFILE=/home/${OS_USERNAME}/.bash_history" >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'export HISTSIZE=10000' >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'export HISTFILESIZE=10000' >> "/home/${OS_USERNAME}/.bashrc" && \
    echo 'shopt -s histappend' >> "/home/${OS_USERNAME}/.bashrc"

# Set up the shell prompt
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${OS_USERNAME}/.bashrc"

USER "${OS_USERNAME}"

WORKDIR "${APP_HOME}"
