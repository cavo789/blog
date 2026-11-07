# syntax=docker/dockerfile:1

# Gitleaks, plus a small Git repository with a token buried in its history.
# The tokens are fake. Bump the tag during a /freshness pass.
FROM zricethezav/gitleaks:v8.30.1

USER root
WORKDIR /demo

RUN git config --global user.name "Demo" && \
    git config --global user.email "demo@example.com" && \
    git config --global init.defaultBranch main && \
    git config --global --add safe.directory /demo && \
    git init -q && \
    echo 'print("Hello")' > app.py && \
    git add . && git commit -qm "Initial commit" && \
    echo 'GITHUB_TOKEN = "ghp_R7mK2xQ9vT4bN8sL1pW6yC3dF5hJ0aZ8eG2u"' > config.py && \
    git add . && git commit -qm "Add API configuration" && \
    git rm -q config.py && git commit -qm "Oops, remove the token"

ENTRYPOINT []
CMD ["/bin/sh"]
