# syntax=docker/dockerfile:1
# Use the official Python 3.14 image based on Alpine Linux.
FROM python:3.14-alpine

# 1. Get the 'uv' binary from the official Astral image for high-speed
#    Python package management.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 2. Environment Variables for Python & UV
#    - PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files.
#    - PYTHONUNBUFFERED: Ensures that Python output is sent straight to the
#      terminal without being buffered first.
#    - UV_CACHE_DIR / PYTHONPYCACHEPREFIX: Centralize cache files in a
#      non-persistent directory.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPYCACHEPREFIX=/tmp/pycache \
    UV_CACHE_DIR=/tmp/uv-cache

WORKDIR /app

# 3. System Dependencies
#    Install Git (for the hook's logic) and PHP (for syntax validation of
#    .php files). '--no-cache' keeps the image layer lean.
RUN apk add --no-cache git php

# 4. Python Dependencies using UV
#    Use a BuildKit cache mount to speed up subsequent builds.
COPY pyproject.toml ./
RUN --mount=type=cache,target=/tmp/uv-cache \
    uv pip install --system --requirement pyproject.toml

# 5. Security: Create a dedicated non-root user and directories.
#    - Create the 'appuser' with no password and no home directory.
#    - Create cache directories and grant ownership to 'appuser' to ensure
#      they are writable at runtime without root privileges.
RUN adduser -D appuser && \
    mkdir -p /tmp/pycache /app/.cache && \
    chown -R appuser:appuser /tmp/pycache /app/.cache

# Switch to the non-root user for all subsequent operations.
USER appuser

# 6. Copy Application Source Code
#    Ensure the 'appuser' owns the copied files.
COPY --chown=appuser:appuser src/ ./src/
COPY --chown=appuser:appuser config/ ./config/

# 7. Entrypoint
#    Define the default command to run when the container starts.
ENTRYPOINT ["python", "src/main.py"]