#!/usr/bin/env bash
set -euo pipefail

mkdir -p .build/.quarto_deno_cache_data/deno
chmod -R 777 .build/.quarto_deno_cache_data

# shellcheck disable=SC2046 # id -u/-g never contain whitespace, safe unquoted
docker run -it --rm \
  -u $(id -u):$(id -g) \
  -v ".:/public" \
  -w /public \
  -v "./.build/.quarto_deno_cache_data:/container_cache" \
  -e DENO_DIR="/container_cache/deno" \
  -e QUARTO_CACHE_DIR="/container_cache/quarto" \
  -e HOME="/public" \
  ghcr.io/quarto-dev/quarto \
  quarto render overview.qmd --no-cache --output-dir .build --quiet

( cd .build && explorer.exe overview.html )
