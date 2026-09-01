#!/usr/bin/env bash
# Runs the DuckDB CLI against files in the current directory — no local
# install required. Called with no arguments, drops you into the
# interactive REPL; with -c "SQL", runs one query and exits.
set -euo pipefail

exec docker run --rm -it \
    -v "${PWD}:/workspace:cached" \
    --read-only \
    --tmpfs /tmp:size=256m,noexec,nosuid \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -u "$(id -u):$(id -g)" \
    duckdb "$@"
