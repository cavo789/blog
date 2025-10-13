# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base

RUN apt-get -y update \
    && apt-get install --yes --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR "/app/src"

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
