# syntax=docker/dockerfile:1.6

# .devcontainer/Dockerfile

ARG OS_USERID=1000
ARG OS_GROUPID=1000
ARG OS_USERNAME="vscode"
ARG DOCKER_APP_HOME="/app"

FROM my_sample_prod:latest

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

USER root

RUN --mount=type=cache,target=/var/cache/apt,rw \
    set -eux \
    && printf "\e[0;105m%s\e[0;0m\n" "Install required Linux binaries for devcontainer..." \
    && apt-get update -yqq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        bash \
        bash-completion \
        git \
        curl \
        ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --- Create non-root user ---

ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

RUN set -eux \
    && if ! id -u "${OS_USERNAME}" >/dev/null 2>&1; then \
        printf "\e[0;105m%s\e[0;0m\n" "Create devcontainer user ${OS_USERNAME} (${OS_USERID}:${OS_GROUPID})..." \
        && groupadd -g ${OS_GROUPID} "${OS_USERNAME}" \
        && useradd -u ${OS_USERID} -g ${OS_GROUPID} -m --shell /bin/bash --create-home "${OS_USERNAME}" \
        && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/${OS_USERNAME}"; \
    fi

# Ensure vscode home folders exist and are writable. The .vscode-server folder is used by
# VSCode while installing extensions in the container. That folder has to be owner by our user; not root.
RUN set -eux \
    && mkdir -p "/home/${OS_USERNAME}/.vscode-server/bin" \
    && mkdir -p "/home/${OS_USERNAME}/.vscode-server/extensions" \
    && mkdir -p "/home/${OS_USERNAME}/.vscode-server/data" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/${OS_USERNAME}/.vscode-server"

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
echo -e "  ✨ \e[32mpython -m debugpy --listen 0.0.0.0:5679 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload\e[0m  Start a hot-reloading preview in your browser."
EOF

ARG DOCKER_APP_HOME

# Important: in the production image, the folder "DOCKER_APP_HOME" (/app most probably) is
# owned by the root user. Here, for the devcontainer, the folder has to be owned by our
# current user.
RUN set -eux \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "${DOCKER_APP_HOME}"

USER "${OS_USERNAME}"

COPY requirements.txt .

RUN --mount=type=cache,target=/home/${OS_USERNAME}/.cache/pip \
    set -eux \
    && cat requirements.txt \
    && printf "\e[0;105m%s\e[0;0m\n" "Install Python dev dependencies..." \
    && python -m pip install --no-cache-dir -r requirements.txt

WORKDIR "${DOCKER_APP_HOME}"
