# syntax=docker/dockerfile:1.4

# cspell:disable
FROM ghcr.io/quarto-dev/quarto:1.8.25 AS base

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

ARG INSTALL_CHROMIUM="false"
ARG INSTALL_CSPELL="false"
ARG INSTALL_PRECOMMIT_HOOKS="false"

# Yaml tooling
ARG YQ_VERSION=v4.42.1

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# ---------- Stage 1: Install system dependencies ----------
#
# texlive-*       : to render as PDF using "quarto render . --to pdf"
# texlive-luatex  : to ensure lualatex is installed
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libnss3 libfontconfig1 libgbm1 \
        libsecret-1-dev \
        libx11-dev \
        libxkbfile-dev \
        openssh-client \
        sudo \
        unzip \
        # yamllint \
    # --- PDF Rendering Packages (Revised) ---
        texlive-xetex \
        texlive-fonts-recommended \
        texlive-plain-generic \
        texlive-luatex \
        texlive-latex-extra \
        texlive-fonts-extra \
        texlive-science \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Pre-generate the LuaLaTeX font database to avoid runtime delay
# This command must be run AFTER all texlive packages are installed.
# RUN set -eux; \
#     luaotfload-tool -f -u -v

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
        echo "Installing NPM and Code Spell Checker..." && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y --no-install-recommends nodejs && \
        npm config set cache /home/${USERNAME}/.npm && \
        npm install -g cspell && \
        npm cache clean --force && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*; \
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

# Grant passwordless sudo access to the node user
# Allow our node user to run "sudo xxx" in case of very specific use case
RUN set -eux && \
    echo "${USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/"${USERNAME}" && \
    chmod 0440 /etc/sudoers.d/"${USERNAME}"

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

# Note: Decktape is started on the host (using Docker-out-of-Docker). We need to
# make sure the slides.pdf file is created with the right ownership and in the right place; our local absolute path.
RUN set -eux \
    && echo "alias decktape='docker run --rm --user root -v \${LOCAL_WORKSPACE}/:/slides ghcr.io/astefanutti/decktape reveal http://host.docker.internal:5931/ slides.pdf && sudo chown ${USERNAME}:${USERNAME} slides.pdf'" >> "/home/${USERNAME}/.bashrc" \
    && echo "alias cspell='cspell lint . --config .vscode/cspell.json'" >> "/home/${USERNAME}/.bashrc" \
    && echo "alias pre-commit='pre-commit run --all-files'" >> "/home/${USERNAME}/.bashrc"

# Configure bash to use this file
RUN echo "export HISTFILE=/home/${USERNAME}/.bash_history" >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTSIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTFILESIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'shopt -s histappend' >> "/home/${USERNAME}/.bashrc"

# Set up the shell prompt
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${USERNAME}/.bashrc"

# Welcome message and tips
RUN set -eux && \
    cat <<EOF >> "/home/${USERNAME}/.bashrc"
echo -e "\n📘 Welcome to the Quarto Docs Dev Container!"
echo -e "Below are some useful commands:"
echo -e ""
echo -e "  \e[1mQuarto Commands\e[0m"
echo -e "  ───────────────"
echo -e "  ✨ \e[32mquarto preview . --port 5931 --host 0.0.0.0\e[0m  Start a hot-reloading preview in your browser."
echo -e "  ✨ \e[32mquarto render . --output-dir build\e[0m           Render a static HTML site in the folder build."
echo -e ""
echo -e "  ✨ \e[32mdecktape\e[0m                                     Export the slideshow as slides.pdf with full respect of the layout."
echo -e ""
EOF

# Append conditional commands depending on optional tools
RUN set -eux && \
    if [ "${INSTALL_CSPELL}" = "true" ] || [ "${INSTALL_PRECOMMIT_HOOKS}" = "true" ]; then \
        echo 'echo -e "  \e[1mData quality checks\e[0m"' >> "/home/${USERNAME}/.bashrc" && \
        echo 'echo -e "  ───────────────────"' >> "/home/${USERNAME}/.bashrc"; \
    fi && \
    if [ "${INSTALL_CSPELL}" = "true" ]; then \
        echo 'echo -e "  ✍️ \e[32mcspell\e[0m                                       Run spell checks.\n"' >> "/home/${USERNAME}/.bashrc"; \
    fi && \
    if [ "${INSTALL_PRECOMMIT_HOOKS}" = "true" ]; then \
        echo 'echo -e "  ⚙️ \e[32mpre-commit\e[0m                                   Run code quality checks on all files.\n"' >> "/home/${USERNAME}/.bashrc"; \
    fi
