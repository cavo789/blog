# syntax=docker/dockerfile:1.4

# cspell:disable
FROM ghcr.io/quarto-dev/quarto:1.8.25 AS base

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

ARG INSTALL_CHROMIUM=false
ARG INSTALL_CSPELL=false
ARG INSTALL_GRAPHVIZ=false
ARG INSTALL_PRECOMMIT_HOOKS=false

# Yaml tooling
ARG YQ_VERSION=v4.42.1

# ---------- Stage 1: Install system dependencies ----------
#
# openssh-client  : used by git when pushing/pulling using git@ protocol
# sudo            : to easily install additional dependencies if needed
# texlive-*       : to render as PDF using "quarto render . --to pdf"
# yamllint        : to validate YAML frontmatter in .qmd files
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        libnss3 libfontconfig1 libgbm1 \
        libsecret-1-dev \
        libx11-dev \
        libxkbfile-dev \
        openssh-client \
        texlive-xetex texlive-fonts-recommended texlive-plain-generic \
        unzip \
        sudo \
        yamllint \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Allow our user to run sudo without password
RUN echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install yq (YAML validator) for validating YAML frontmatter
RUN --mount=type=cache,target=/var/cache/yq \
    set -eux; \
    curl -L --fail --silent --show-error \
        https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64 \
        -o /var/cache/yq/yq_linux_amd64; \
    install -m 0755 /var/cache/yq/yq_linux_amd64 /usr/local/bin/yq

# ---------- Stage 2: Extras - pre-commit, Node.js + cspell ----------
FROM base AS extras

ARG INSTALL_CSPELL
ARG INSTALL_GRAPHVIZ
ARG INSTALL_PRECOMMIT_HOOKS
ARG USERNAME

# Install pre-commit (without installing hooks at build time)
RUN --mount=type=cache,target=/root/.cache/pip \
    if [ "$INSTALL_PRECOMMIT_HOOKS" = "true" ]; then \
        set -eux; \
        echo "Installing Python and pre-commit..." && \
        apt-get update && \
        apt-get install -y --no-install-recommends python3-pip && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/* && \
        pip3 install --no-cache-dir --upgrade pip && \
        pip3 install --no-cache-dir pre-commit && \
        pip cache purge || true; \
    fi

# Install Node.js + cspell (optional)
RUN --mount=type=cache,target=/home/${USERNAME}/.npm \
    if [ "${INSTALL_CSPELL}" = "true" ]; then \
        set -eux; \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y --no-install-recommends nodejs && \
        npm config set cache /home/${USERNAME}/.npm && \
        npm install -g cspell && \
        npm cache clean --force && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*; \
    fi

# Install Graphviz for Quarto (dot diagrams support)
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    if [ "${INSTALL_GRAPHVIZ}" = "true" ]; then \
        set -eux; \
        apt-get update \
        && apt-get install -y --no-install-recommends \
            libcairo2 \
            libpango-1.0-0 \
            graphviz \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*; \
    fi

# ---------- Stage 3: Finalization ----------
FROM extras AS final

ARG USERNAME
ARG USER_UID
ARG USER_GID
ARG INSTALL_CHROMIUM

# ---------- User and permissions --------------------------------------------
RUN set -eux && \
    USER_UID=${USER_UID:-1000} && \
    USER_GID=${USER_GID:-1000} && \
    groupadd -g "${USER_GID}" "${USERNAME}" && \
    useradd -m -u "${USER_UID}" -g "${USER_GID}" -s /bin/bash "${USERNAME}" && \
    chown -R "${USERNAME}":"${USERNAME}" "/home/${USERNAME}"

# Create .ssh directory and set permissions for the non-root user
RUN set -eux && \
    mkdir -p /home/${USERNAME}/.ssh && \
    chown -R "${USERNAME}":"${USERNAME}" "/home/${USERNAME}/.ssh" && \
    chmod 700 /home/${USERNAME}/.ssh

# Switch to non-root user for Chromium and Quarto tools
USER ${USERNAME}

# Install Quarto Chromium tool (optional)
RUN --mount=type=cache,target=/home/${USERNAME}/.quarto/tools \
    if [ "${INSTALL_CHROMIUM}" = "true" ]; then \
        set -eux; \
        echo "Installing Quarto's Chromium tool..." && \
        quarto install tool chromium; \
    fi

# ---------- Shell and history setup -----------------------------------------
# Configure bash to use this file
RUN echo "export HISTFILE=/home/${USERNAME}/.bash_history" >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTSIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTFILESIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'shopt -s histappend' >> "/home/${USERNAME}/.bashrc" && \
    echo "alias render_graphviz='find . -name \"flow.dot\" -exec sh -c '\''for f; do dir=\$(dirname \"\$f\"); dot -Tpng \"\$f\" -o \"\$dir/flow.png\"; done'\'' sh {} +'" >> "/home/${USERNAME}/.bashrc"

# Set up the shell prompt
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${USERNAME}/.bashrc"

# Welcome message and tips
RUN set -eux && \
    cat <<EOF >> "/home/${USERNAME}/.bashrc"
echo -e "\n📘 Welcome to the Quarto Docs Dev Container!"
echo -e ""
echo -e "Below are some useful commands:"
echo -e ""
echo -e "  \e[1mQuarto Commands\e[0m"
echo -e "  ───────────────"
echo -e "  ✨ \e[32mquarto preview .\e[0m                             Start a hot-reloading preview in your browser."
echo -e "  ✨ \e[32mquarto render .\e[0m                              Build the documentation (based on _quarto.yml)."
echo -e "  ✨ \e[32mquarto render . --profile docx --to docx\e[0m     Build a .docx file (requires _quarto-docx.yml)."
EOF

# Append conditional commands depending on optional tools
RUN set -eux && \
    if [ "${INSTALL_CSPELL}" = "true" ] || [ "${INSTALL_PRECOMMIT_HOOKS}" = "true" ]; then \
        echo -e 'echo -e ""' >> "/home/${USERNAME}/.bashrc"; \
        echo -e 'echo -e "  \e[1mData quality checks\e[0m"' >> "/home/${USERNAME}/.bashrc"; \
        echo -e 'echo -e "  ───────────────────"' >> "/home/${USERNAME}/.bashrc"; \
    fi && \
    if [ "${INSTALL_CSPELL}" = "true" ]; then \
        echo 'echo -e "  ✍️  \e[32mcspell lint . --config .vscode/cspell.json\e[0m  Run spell checks.\n"' >> "/home/${USERNAME}/.bashrc"; \
    fi && \
    if [ "${INSTALL_PRECOMMIT_HOOKS}" = "true" ]; then \
        echo 'echo -e "  ⚙️  \e[32mpre-commit run --all-files\e[0m                  Run code quality checks on all files.\n"' >> "/home/${USERNAME}/.bashrc"; \
    fi

# Tools
RUN set -eux && \
    if [ "${INSTALL_GRAPHVIZ}" = "true" ]; then \
        echo 'echo -e ""' >> "/home/${USERNAME}/.bashrc"; \
        echo 'echo -e "  \e[1mTools\e[0m"' >> "/home/${USERNAME}/.bashrc"; \
        echo 'echo -e "  ─────"' >> "/home/${USERNAME}/.bashrc"; \
        echo 'echo -e "  📊 \e[32mrender_graphviz\e[0m                              Scan your documentation, process .dot files and generate .png ones.\n"' >> "/home/${USERNAME}/.bashrc"; \
    fi
