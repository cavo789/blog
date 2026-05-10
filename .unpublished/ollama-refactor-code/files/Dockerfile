# syntax=docker/dockerfile:1.7

# --- GLOBAL ARGUMENTS ---
ARG PYTHON_VERSION=3.14
ARG ALPINE_VERSION=3.22
ARG UV_VERSION=0.11.8

# --- BUILDER STAGE ---
FROM ghcr.io/astral-sh/uv:${UV_VERSION} AS uv_bin
FROM python:${PYTHON_VERSION}-alpine${ALPINE_VERSION} AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_CACHE_DIR=/root/.cache/uv

WORKDIR /build

# Install build dependencies with BuildKit cache
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --update git

# Copy uv binaries
COPY --from=uv_bin /uv /uvx /bin/

# Install dependencies
RUN --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=cache,target=${UV_CACHE_DIR} \
    uv sync --frozen --no-install-project --no-dev

# --- RUNTIME BASE ---
FROM python:${PYTHON_VERSION}-alpine${ALPINE_VERSION} AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Create system user
RUN addgroup -S architect && adduser -S architect -G architect \
    && mkdir -p /tmp/pycache && chown architect:architect /tmp/pycache

# --- DEVELOPMENT TARGET ---
FROM base AS development

ENV ENV=development

RUN --mount=type=cache,target=/var/cache/apk \
    apk add --update curl git gdb

COPY --from=builder /build/.venv /app/.venv
COPY --chown=architect:architect . .

USER architect

ENTRYPOINT ["python", "src/main.py"]

# --- PRODUCTION TARGET ---
FROM base AS production

ENV ENV=production

COPY --from=builder --chown=architect:architect /build/.venv /app/.venv
COPY --chown=architect:architect src/ ./src/
COPY --chown=architect:architect config/ ./config/

USER architect

# Verify non-root execution capability
RUN python -c "import os; print(f'Running as UID {os.getuid()}')"

# 7. Entrypoint
#    Define the default command to run when the container starts.
ENTRYPOINT ["python", "src/main.py"]