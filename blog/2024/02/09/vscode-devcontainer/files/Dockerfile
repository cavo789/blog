ARG PHP_VERSION=8.2

ARG COMPOSER_HOME="/var/cache/composer"
ARG COMPOSER_VERSION=2.5.5

ARG PHPCSFIXER_INSTALL=true
ARG PHPCSFIXER_VERSION=3.46.0

ARG PHPCBF_INSTALL=true
ARG PHPCBF_VERSION=3.7.2

ARG TIMEZONE="Europe/Brussels"

ARG OS_USERID=1000
ARG OS_USERNAME="docker"

FROM composer:${COMPOSER_VERSION} AS composer_base

FROM php:${PHP_VERSION}-fpm

ARG TIMEZONE
ENV TZ=${TIMEZONE}

ARG PHPCSFIXER_INSTALL
ARG PHPCSFIXER_VERSION

RUN set -e -x \
    && if [ "$PHPCSFIXER_INSTALL" = "true" ] ; then \
    printf "\e[0;105m%s\e[0;0m\n" "Install php-cs-fixer.phar ${PHPCSFIXER_VERSION}" \
    && curl -L https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/releases/download/v${PHPCSFIXER_VERSION}/php-cs-fixer.phar -o /usr/local/bin/php-cs-fixer.phar \
    && chmod +x /usr/local/bin/php-cs-fixer.phar ; \
    fi

ARG PHPCBF_INSTALL
ARG PHPCBF_VERSION

RUN set -e -x \
    && if [ "$PHPCBF_INSTALL" = "true" ] ; then \
    printf "\e[0;105m%s\e[0;0m\n" "Install phpcbf.phar ${PHPCBF_VERSION}" \
    && curl -L https://github.com/squizlabs/PHP_CodeSniffer/releases/download/${PHPCBF_VERSION}/phpcbf.phar -o /usr/local/bin/phpcbf.phar \
    && chmod +x /usr/local/bin/phpcbf.phar \
    && curl -L https://github.com/squizlabs/PHP_CodeSniffer/releases/download/${PHPCBF_VERSION}/phpcs.phar -o /usr/local/bin/phpcs.phar \
    && chmod +x /usr/local/bin/phpcs.phar ; \
    fi

ARG COMPOSER_HOME
ENV COMPOSER_HOME=${COMPOSER_HOME}

RUN set -e -x \
    && mkdir -p "${COMPOSER_HOME}/cache/files" \
    && mkdir -p "${COMPOSER_HOME}/cache/vcs" \
    && chmod -R 777 "${COMPOSER_HOME}"

COPY --from=composer_base /usr/bin/composer /usr/bin/composer

ARG OS_USERID
ARG OS_USERNAME

RUN set -e -x \
    && useradd --password '' -G www-data,root -u ${OS_USERID} -l -d "/home/${OS_USERNAME}" "${OS_USERNAME}" \
    && mkdir -p "/home/${OS_USERNAME}" \
    && chown -R "${OS_USERNAME}":"${OS_USERNAME}" "/home/${OS_USERNAME}"

RUN set -e -x \
    && printf "\e[0;105m%s\e[0;0m\n" "Install Linux binaries" \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends curl libzip-dev zip unzip \
    && docker-php-ext-install zip \
    && docker-php-source delete \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

WORKDIR /var/www/html
