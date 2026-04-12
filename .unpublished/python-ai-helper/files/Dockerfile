# syntax=docker/dockerfile:1

FROM python:3.13-slim AS builder

WORKDIR /build

COPY pyproject.toml .

# Create dummy src for pip install .
RUN mkdir src && touch src/__init__.py

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install .[dev]

FROM python:3.13-slim AS runtime

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN groupadd -g ${GROUP_ID} agentgroup && \
    useradd -l -u ${USER_ID} -g agentgroup agentuser && \
    mkdir -p /app/src /tmp/agent && chown -R agentuser:agentgroup /app

COPY --from=builder /install /usr/local
COPY --chown=agentuser:agentgroup src /app/src
COPY --chown=agentuser:agentgroup pyproject.toml /app/

WORKDIR /app

USER agentuser

ENV HOME=/tmp \
    PYTHONPATH=/app/src \
    PYTHONDONTWRITEBYTECODE=1

ENTRYPOINT ["python", "src/main.py"]