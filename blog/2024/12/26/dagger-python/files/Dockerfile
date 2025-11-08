# cspell:disable

FROM python:3.11-slim-buster AS base

# Dagger is using the Docker technology so we need to install Docker in the image
# Also install required Linux dependencies
# hadolint ignore=DL3008
RUN set -e -x \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends docker.io wget \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# Install Dagger
ARG VERSION=0.15.1
ARG ARCHIVE=dagger_v${VERSION}_linux_amd64.tar.gz
ARG URL=https://github.com/dagger/dagger/releases/download/v${VERSION}/${ARCHIVE}

# hadolint ignore=DL3003
RUN set -e -x \
    && cd /tmp \
    && wget --quiet --output-document ${ARCHIVE} ${URL} \
    && tar xvfz ${ARCHIVE} \
    && mv dagger /usr/local/bin/ \
    && rm -rf /tmp/

WORKDIR /app/src

ENTRYPOINT [ "/usr/local/bin/dagger" ]
