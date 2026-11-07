# syntax=docker/dockerfile:1

# OpenHands Agent Canvas + a PHP toolchain, so the agent never has to install
# anything at runtime: every mission starts from the same image.
ARG AGENT_CANVAS_IMAGE=ghcr.io/openhands/agent-canvas:latest

FROM composer:2 AS composer

FROM ${AGENT_CANVAS_IMAGE}

LABEL org.opencontainers.image.title="openhands-php" \
      org.opencontainers.image.description="OpenHands Agent Canvas with PHP CLI and Composer" \
      org.opencontainers.image.vendor="cavo789" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="no-reply@gmail.com"

# Your host user's ids: files the agent writes in the bind-mounted project
# stay yours instead of belonging to the image's default UID 10001.
ARG UID=1000
ARG GID=1000

USER root

# PHP CLI from Debian trixie, plus the extensions PHPUnit and Laravel need.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        php-cli php-mbstring php-xml php-curl php-zip php-sqlite3 php-intl unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/local/bin/composer

RUN groupmod -g "${GID}" openhands \
    && usermod -u "${UID}" -g "${GID}" openhands \
    && find / -xdev -uid 10001 -exec chown -h "${UID}:${GID}" {} +

USER openhands
