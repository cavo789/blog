#!/usr/bin/env bash
# Refresh catalog.duckdb with today's product catalog.
# Meant to run from cron; credentials come from the .env file next to it.
set -euo pipefail

cd "$(dirname "$0")"

# API_USERNAME and API_PASSWORD
# shellcheck source=/dev/null
source ./.env

# 1. Download and check. When an assertion fails, Hurl does not write
#    products.json and exits non-zero: set -e stops the script right here
#    and the database keeps yesterday's data.
hurl --test \
    --variable "username=${API_USERNAME}" \
    --secret "password=${API_PASSWORD}" \
    products.hurl

# 2. Load the checked file into DuckDB (duckdb-cli image, see the DuckDB article)
docker run --rm -i \
    -v "${PWD}:/workspace" \
    -w /workspace \
    -u "$(id -u):$(id -g)" \
    duckdb-cli catalog.duckdb < load.sql
