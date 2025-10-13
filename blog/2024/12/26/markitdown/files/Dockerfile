FROM python:3.13-slim AS base

RUN set -e -x \
    && pip install markitdown \
    && mkdir -p /in

WORKDIR "/in"

ENTRYPOINT [ "/bin/sh" ]
