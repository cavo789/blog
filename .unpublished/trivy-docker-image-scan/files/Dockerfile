# syntax=docker/dockerfile:1

# A throwaway Trivy sandbox: the scanner, plus a small project with three
# deliberate problems to find. Bump the tag during a /freshness pass.
FROM aquasec/trivy:0.76.2

WORKDIR /demo

# Problem 1: Python dependencies pinned years ago
COPY <<'REQ' requirements.txt
flask==2.0.1
requests==2.25.0
pyyaml==5.3
REQ

# Problem 2: a token committed by accident (fake value, right format)
COPY <<'CONF' config.py
GITHUB_TOKEN = "ghp_R7mK2xQ9vT4bN8sL1pW6yC3dF5hJ0aZ8eG2u"
CONF

# Problem 3: a Dockerfile with risky habits
COPY <<'DF' Dockerfile.app
FROM python:3.8-slim
COPY . /app
CMD ["python", "/app/main.py"]
DF

ENTRYPOINT []
CMD ["/bin/sh"]
