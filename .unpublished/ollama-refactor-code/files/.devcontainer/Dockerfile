# syntax=docker/dockerfile:1.7

# --- GLOBAL ARGUMENTS ---
ARG PYTHON_VERSION=3.14
ARG ALPINE_VERSION=3.21
ARG UV_VERSION=0.11.8

# --- DEVCONTAINER TARGET ---
FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv_bin
FROM python:${PYTHON_VERSION}-alpine${ALPINE_VERSION}

# 1. System Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPYCACHEPREFIX=/tmp/pycache \
    UV_CACHE_DIR=/tmp/uv-cache \
    UV_LINK_MODE=copy \
    # Ensure local bin is in path
    PATH="/home/vscode/.local/bin:$PATH"

ENV UV_CACHE_DIR=/home/vscode/.cache/uv \
    PYTHONPYCACHEPREFIX=/home/vscode/.cache/pycache \
    UV_LINK_MODE=copy

# 2. Install Development Tools with BuildKit cache
# shadow: needed for usermod/groupmod
# gcompat/libstdc++: needed for many compiled python wheels on Alpine
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --update \
    git \
    bash \
    curl \
    libstdc++ \
    gcompat \
    openssh-client \
    shadow \
    sudo \
    build-base

# 3. Copy UV binaries
COPY --from=uv_bin /uv /uvx /bin/

# 4. Consistent User Management
# We use UID 1000 as a standard, but devcontainers often override this
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# 5. Persistent Cache Directories
RUN mkdir -p /tmp/pycache /tmp/uv-cache \
    && chown -R $USERNAME:$USERNAME /tmp/pycache /tmp/uv-cache

# 6. Pre-installing standard dev tools (Optional but recommended)
# This keeps the container ready to use the moment it opens
USER $USERNAME

# Enable 'uv' shell completion for bash
RUN echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc

# The DevContainer usually stays alive with a sleep command or the shell
CMD ["sleep", "infinity"]
