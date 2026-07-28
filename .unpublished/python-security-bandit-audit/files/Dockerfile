# syntax=docker/dockerfile:1.7-labs

FROM python:3.13-slim AS final

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

ARG UID=1000
ARG GID=1000

RUN groupadd -g "${GID}" developer && \
    useradd -m -u "${UID}" -g "${GID}" -s /usr/sbin/nologin developer

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir bandit pip-audit

COPY scan.sh /usr/local/bin/scan.sh
RUN chmod +x /usr/local/bin/scan.sh

WORKDIR /workspace

USER developer

ENTRYPOINT ["/usr/local/bin/scan.sh"]
