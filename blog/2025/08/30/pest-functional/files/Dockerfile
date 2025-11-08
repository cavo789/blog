# cspell:disable

# syntax=docker/dockerfile:1.4

ARG PHP_CLI_VERSION=8.3-cli
ARG PHP_FPM_VERSION=8.3.24-fpm
ARG COMPOSER_VERSION=2.8.11

ARG OS_USERID=1000
ARG OS_GROUPID=1000
ARG OS_USERNAME="docker"

ARG TIMEZONE="Europe/Brussels"

FROM php:${PHP_CLI_VERSION} AS builder

ARG COMPOSER_VERSION

WORKDIR /var/www/html

# Set cache environment variables for all subsequent commands
ENV NPM_CONFIG_CACHE=/var/www/html/.npm-cache \
    PLAYWRIGHT_BROWSERS_PATH=/var/www/html/.cache/ms-playwright

# Install system dependencies, PHP extensions, and Node.js with browser dependencies
RUN --mount=type=cache,target=/var/cache/apt,id=apt-cache,sharing=private \
    set -eux && \
    apt-get update && apt-get install -y \
        unzip zip git curl libzip-dev gnupg2 wget ca-certificates \
        libgtk-3-0 libxshmfence-dev libxkbcommon-x11-dev \
        libnspr4 libnss3 libgbm1 libasound2t64 \
    && docker-php-ext-install zip sockets \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer \
    | php -- --version=${COMPOSER_VERSION} --install-dir=/usr/local/bin --filename=composer

# Create a temporary package.json to install node dependencies
RUN echo '{ "name": "pest-browser-tests", "version": "1.0.0", "devDependencies": { "playwright": "^1.55.0", "playwright-core": "^1.55.0" } }' > package.json

# Install Node dependencies with cache
RUN npm install

# Setup Composer dependencies with cache
RUN --mount=type=cache,target=/root/.composer \
    composer init --name="function_test/pestphp" --require-dev="pestphp/pest:^4.0" --no-interaction && \
    composer config --no-plugins allow-plugins.pestphp/pest-plugin true && \
    composer require pestphp/pest-plugin-browser --dev && \
    composer install --no-interaction --prefer-dist --no-progress

FROM php:${PHP_FPM_VERSION} AS php

ARG TIMEZONE
ENV TZ=${TIMEZONE}

WORKDIR /var/www/html

# Install PHP and Node.js dependencies
RUN --mount=type=cache,target=/var/cache/apt,id=apt-cache,sharing=private \
    set -eux && \
    apt-get update && apt-get install -y \
        unzip zip libzip-dev curl gnupg2 wget ca-certificates \
        libgtk-3-0 libxshmfence-dev libxkbcommon-x11-dev \
        libnspr4 libnss3 libgbm1 libasound2t64 \
    && docker-php-ext-install pcntl zip sockets \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG OS_USERID
ARG OS_GROUPID
ARG OS_USERNAME

RUN set -e -x \
    && groupadd --gid ${OS_GROUPID} "${OS_USERNAME}" \
    && useradd --password '' -G www-data,root --uid ${OS_USERID} --gid ${OS_GROUPID} -l -d "/home/${OS_USERNAME}" "${OS_USERNAME}" \
    && mkdir -p "/home/${OS_USERNAME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/${OS_USERNAME}"

# Copy all files from the builder stage and set permissions
COPY --from=builder --chown=${OS_USERNAME}:${OS_USERNAME} /var/www/html /var/www/html

# Set cache and path environment variables for all subsequent commands
ENV NPM_CONFIG_CACHE=/var/www/html/.npm-cache \
    PLAYWRIGHT_BROWSERS_PATH="/var/www/html/.cache/ms-playwright" \
    PATH="/var/www/html/node_modules/.bin:$PATH"

# Switch to our user
USER ${OS_USERNAME}

# Install Playwright browsers in the new, accessible location
RUN npx playwright install chromium

# Dev entrypoint (keep container alive)
ENTRYPOINT ["tail", "-f", "/dev/null"]
