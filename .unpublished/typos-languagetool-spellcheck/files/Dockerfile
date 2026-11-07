# syntax=docker/dockerfile:1

# typos, plus a tiny project with mistakes in its code and its documentation.
# Bump TYPOS_VERSION during a /freshness pass.
FROM python:3.14-slim

ARG TYPOS_VERSION=1.52.0
RUN pip install --no-cache-dir --root-user-action=ignore "typos==${TYPOS_VERSION}"

WORKDIR /demo

COPY <<'PY' deploy.py
def recieve_config(path):
    """Load the configuraton file."""
    enviroment = open(path).read()
    return enviroment
PY

COPY <<'MD' README.md
# My project

Run the deploy script to acheive a succesful deployment.
The occured errors are written in the log file.
MD

ENTRYPOINT []
CMD ["/bin/bash"]
