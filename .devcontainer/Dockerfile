# syntax=docker/dockerfile:1.6

ARG OS_USERID=1002
ARG OS_GROUPID=1002
ARG OS_USERNAME="vscode"
ARG DOCKER_APP_HOME="/opt/docusaurus"

FROM cavo789/blog:node

ARG DOCKER_APP_HOME

USER root

RUN --mount=type=cache,target=/var/cache/apk \
    set -eux && \
    apk add --no-cache \
        git \
        bash \
        bash-completion \
        curl \
        ca-certificates && \
    git config --global --add safe.directory "${DOCKER_APP_HOME}"

ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

# RUN set -eux; \
#     addgroup -g ${OS_GROUPID} "${OS_USERNAME}" && \
#     adduser -D -u ${OS_USERID} -G "${OS_USERNAME}" "${OS_USERNAME}" && \
#     mkdir -p /home/"${OS_USERNAME}" && \
#     chown -R "${OS_USERNAME}":"${OS_USERNAME}" /home/"${OS_USERNAME}"

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

# Welcome message and tips (make sure the message isn't yet in the file)
RUN set -eux; \
    BASHRC="/home/${OS_USERNAME}/.bashrc"; \
    MARKER="# DEV CONTAINER WELCOME MESSAGE"; \
    grep -qxF "$MARKER" "$BASHRC" || cat <<EOF >> "$BASHRC"
$MARKER
echo -e "\n📘 Welcome to the Dev Container!"
echo -e "Below are some useful commands:"
echo -e ""
echo -e "  ✨ \e[32mnpx docusaurus -V \e[0m  Show current version of Docusaurus."
EOF
# echo -e "  ✨ \e[32myarn upgrade && yarn upgrade @docusaurus/core@latest @docusaurus/plugin-ideal-image@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest \e[0m  Start a hot-reloading preview in your browser."

USER "${OS_USERNAME}"

WORKDIR "${DOCKER_APP_HOME}"
