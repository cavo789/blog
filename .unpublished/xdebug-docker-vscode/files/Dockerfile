# syntax=docker/dockerfile:1.7-labs
#
# This is the Xdebug addition on top of the PHP devcontainer already built in
# https://www.avonture.be/blog/php-devcontainer — start from that Dockerfile
# and add these lines before the final USER switch.

FROM php:8.3-apache AS final

RUN pecl install xdebug && \
    docker-php-ext-enable xdebug

COPY xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

WORKDIR /var/www/html
