# syntax=docker/dockerfile:1

# PowerShell base image: the generated .ps1 can be run by Aider's /run command
FROM mcr.microsoft.com/powershell:7.5-ubuntu-24.04

ARG AIDER_VERSION=0.86.2

LABEL org.opencontainers.image.title="aider-ollama" \
      org.opencontainers.image.description="Aider coding assistant, with PowerShell, talking to a local Ollama" \
      org.opencontainers.image.vendor="cavo789" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="no-reply@gmail.com"

# Aider commits every change: git is mandatory
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /usr/local/bin/uv

# uv downloads its own Python 3.12: nothing to install from apt
ENV UV_TOOL_DIR=/opt/uv/tools \
    UV_TOOL_BIN_DIR=/usr/local/bin \
    UV_PYTHON_INSTALL_DIR=/opt/uv/python
RUN uv tool install --python 3.12 "aider-chat==${AIDER_VERSION}"

# The container runs with the host's UID, unknown at build time: HOME must be writable by anyone
ENV HOME=/home/aider \
    OLLAMA_API_BASE=http://host.docker.internal:11434
RUN mkdir -p "$HOME" && chmod 1777 "$HOME"
COPY --chmod=644 aider.conf.yml "$HOME/.aider.conf.yml"
COPY --chmod=644 aider.model.settings.yml "$HOME/.aider.model.settings.yml"

WORKDIR /app
ENTRYPOINT ["aider"]
