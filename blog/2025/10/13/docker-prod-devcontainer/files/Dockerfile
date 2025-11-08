# cspell:disable

# Production Dockerfile

ARG DOCKER_APP_HOME="/app"
ARG PYTHON_VERSION=3.13
ARG TIMEZONE="Europe/Brussels"

FROM python:${PYTHON_VERSION}-slim

ARG TIMEZONE

ENV TZ=${TIMEZONE}

RUN --mount=type=cache,target=/var/cache/apt,rw \
    set -eux \
    && printf "\e[0;105m%s\e[0;0m\n" "Install required Linux binaries..." \
    && apt-get update -yqq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        locales \
        tini \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && locale-gen en_US.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

ARG DOCKER_APP_HOME

WORKDIR "${DOCKER_APP_HOME}"

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    set -eux \
    && printf "\e[0;105m%s\e[0;0m\n" "Install Python prod dependencies..." \
    && pip install --no-cache-dir -r requirements.txt

# Make sure installed dependencies are in the PATH
ENV PATH="/root/.local/bin:$PATH"

COPY . .

ENTRYPOINT ["/usr/bin/tini", "--"]

ENV PYTHONPATH="${DOCKER_APP_HOME}/src"

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "main:app"]

