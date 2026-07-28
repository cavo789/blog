# syntax=docker/dockerfile:1.7-labs

FROM python:3.13-slim AS final

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

ARG UID=1000
ARG GID=1000
ARG DUCKDB_VERSION=1.5.5

# Download the official CLI release directly — there is no apt/pip package
# for the interactive shell itself, only for the Python bindings.
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip ca-certificates && \
    curl -fsSL -o /tmp/duckdb.zip \
        "https://github.com/duckdb/duckdb/releases/download/v${DUCKDB_VERSION}/duckdb_cli-linux-amd64.zip" && \
    unzip /tmp/duckdb.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/duckdb && \
    rm /tmp/duckdb.zip && \
    apt-get purge -y unzip && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -g "${GID}" developer && \
    useradd -m -u "${UID}" -g "${GID}" -s /usr/sbin/nologin developer

WORKDIR /workspace

USER developer

ENTRYPOINT ["duckdb"]
