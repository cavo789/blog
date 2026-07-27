# syntax=docker/dockerfile:1.7-labs

FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04 AS final

# Prevent Python from writing .pyc files, buffer logs, and skip pip update checks
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/home/developer/.cache/huggingface

ARG UID=1000
ARG GID=1000

# Ubuntu 22.04 ships Python 3.10, which already satisfies Docling's 3.10+ requirement
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Create an unprivileged user without a valid login shell for strict security
RUN groupadd -g "${GID}" developer && \
    useradd -m -u "${UID}" -g "${GID}" -s /usr/sbin/nologin developer

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir docling

WORKDIR /workspace

USER developer

# Execute the CLI tool directly
ENTRYPOINT ["docling"]
