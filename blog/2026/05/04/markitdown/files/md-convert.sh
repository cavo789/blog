#!/usr/bin/env bash
# Converts documents to Markdown using the isolated markitdown Docker image.
# Dynamically mounts the current working directory ($PWD) to process files anywhere.
# Strictly enforces read-only mounts, tmpfs, and unprivileged execution.

exec docker run --rm -i \
    -v "${PWD}:/workspace:cached" \
    --read-only \
    --tmpfs /tmp:size=64m,noexec,nosuid \
    --tmpfs /run:size=16m \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -u "$(id -u):$(id -g)" \
    markitdown "$@"