# syntax=docker/dockerfile:1
FROM python:3.14-alpine

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apk add --no-cache \
    git bash curl libstdc++ gcompat openssh-client shadow sudo

RUN addgroup -S vscode && \
    adduser -S vscode -G vscode -s /bin/bash && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode && \
    chmod 0440 /etc/sudoers.d/vscode

USER vscode

ENV UV_CACHE_DIR=/home/vscode/.cache/uv \
    PYTHONPYCACHEPREFIX=/home/vscode/.cache/pycache \
    UV_LINK_MODE=copy

RUN mkdir -p /home/vscode/.cache/uv /home/vscode/.cache/pycache

WORKDIR /app