FROM python:3.13-slim

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# hadolint ignore=DL3008
RUN set -e -x \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends graphviz \
    && apt-get clean \
    && rm -rf /tmp/* /var/lib/apt/lists/*

# hadolint ignore=DL3013
RUN pip install --no-cache-dir pydot
