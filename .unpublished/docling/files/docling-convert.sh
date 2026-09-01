#!/usr/bin/env bash
# Converts documents to Markdown using the isolated docling Docker image, with
# GPU acceleration. Unlike md-convert, docling writes "<basename>.md" directly
# into the current directory rather than to stdout — the source format is
# auto-detected from the file extension.
#
# The docling-models named volume persists downloaded Hugging Face models
# across runs, so the (multi-hundred-MB) download only happens once.
set -euo pipefail

exec docker run --rm -i \
    --gpus all \
    -v "${PWD}:/workspace:cached" \
    -v docling-models:/home/developer/.cache/huggingface \
    --read-only \
    --tmpfs /tmp:size=512m,noexec,nosuid \
    --tmpfs /run:size=16m \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -u "$(id -u):$(id -g)" \
    docling convert "$1" --to md --device auto --output .
