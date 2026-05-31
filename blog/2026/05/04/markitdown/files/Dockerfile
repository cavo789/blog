# syntax=docker/dockerfile:1.7-labs

FROM python:3.14-slim AS builder

# Prevent Python from writing .pyc files, buffer logs, and skip pip update checks
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install required dependencies for docx, xlsx, and pdf parsing to an isolated prefix
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/python "markitdown[docx,xlsx,pdf]==0.1.5"

FROM python:3.14-slim AS final

# Enforce read-only compatibility and link the isolated Python environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/tmp \
    PYTHONPATH=/python/lib/python3.14/site-packages \
    PATH="/python/bin:$PATH"

ARG UID=1000
ARG GID=1000

# Create an unprivileged user without a valid login shell for strict security
RUN groupadd -g "${GID}" developer && \
    useradd -m -u "${UID}" -g "${GID}" -s /usr/sbin/nologin developer

COPY --from=builder /python  /python

WORKDIR /workspace

USER developer

# Execute the CLI tool directly
ENTRYPOINT ["python", "-m", "markitdown"]
