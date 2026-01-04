ARG PHP_VERSION=8.3-apache

FROM php:${PHP_VERSION:-latest}

RUN set -e -x ; \
    docker-php-ext-install mysqli pdo pdo_mysql && docker-php-ext-enable pdo_mysql
