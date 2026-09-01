#!/usr/bin/env bash
# Scans the current directory with Bandit (static analysis) and pip-audit
# (dependency vulnerabilities) using the isolated py-security-scan image.
# The project is mounted read-only — a scanner never needs to write to it.
set -euo pipefail

exec docker run --rm -i \
    -v "${PWD}:/workspace:cached,ro" \
    --read-only \
    --tmpfs /tmp:size=64m,noexec,nosuid \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -u "$(id -u):$(id -g)" \
    py-security-scan
