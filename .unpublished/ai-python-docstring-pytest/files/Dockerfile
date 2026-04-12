# syntax=docker/dockerfile:1
FROM python:3.14-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Ensure the user has a home directory they can write to
ENV HOME=/tmp

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/tmp/pip_cache \
    pip install --cache-dir=/tmp/pip_cache libcst requests ruff mypy pytest

RUN chown -R 1002:1002 /app

COPY main.py .

ENTRYPOINT ["python", "main.py"]