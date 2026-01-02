# syntax=docker/dockerfile:1.6

# Use Dockerfile syntax version 1.6 for advanced features like cache mounts
# https://docs.docker.com/build/dockerfile/frontend/
# This Dockerfile is designed for use in a Devcontainer setup with VSCode

# Use a custom base image that includes Node.js and Docusaurus dependencies
# This image is built from the `blog-docusaurus` Dockerfile file you'll
# find in the root directory of this blog
FROM blog-docusaurus:development

# Define build-time arguments for user and workspace configuration
# Moved after FROM to avoid redundancy and ensure availability in the build stage
ARG OS_USERID=1000
ARG OS_GROUPID=1000
ARG OS_USERNAME="node"
ARG APP_HOME="/opt/docusaurus"

# Switch to root to install system packages and configure environment
USER root

# Prevent apt from prompting for user input
ENV DEBIAN_FRONTEND=noninteractive

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
        passwd \
        sudo && \
    # Update the node user UID/GID to match the host if provided
    # This ensures file permissions work correctly with mounted volumes
    if [ "$OS_USERID" -ne 1000 ]; then usermod -u ${OS_USERID} ${OS_USERNAME}; fi && \
    if [ "$OS_GROUPID" -ne 1000 ]; then groupmod -g ${OS_GROUPID} ${OS_USERNAME}; fi && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    # Use --system so the config applies to all users (including node)
    git config --system --add safe.directory "${APP_HOME}"

# Grant passwordless sudo access to the node user
# Allow our node user to run "sudo xxx" in case of very specific use case
RUN set -eux && \
    echo "${OS_USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/"${OS_USERNAME}" && \
    chmod 0440 /etc/sudoers.d/"${OS_USERNAME}"

# Create and set permissions for VSCode server folders used for extensions and remote features
RUN set -eux && \
    mkdir -p "/home/${OS_USERNAME}/.vscode-server/bin" \
             "/home/${OS_USERNAME}/.vscode-server/extensions" \
             "/home/${OS_USERNAME}/.vscode-server/data" && \
    chown -R "${OS_USERNAME}:${OS_USERNAME}" "/home/${OS_USERNAME}/.vscode-server"

# ---------- Shell and history setup ----------
# Configure bash history behavior for the node user
RUN cat <<EOF >> "/home/${OS_USERNAME}/.bashrc"
export HISTFILE=/home/${OS_USERNAME}/.bash_history
export HISTSIZE=10000
export HISTFILESIZE=10000
shopt -s histappend
EOF

# Customize the shell prompt for clarity and style
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${OS_USERNAME}/.bashrc"

# Switch to the node user for development tasks
USER "${OS_USERNAME}"

# Set the working directory to the application root
WORKDIR "${APP_HOME}"
