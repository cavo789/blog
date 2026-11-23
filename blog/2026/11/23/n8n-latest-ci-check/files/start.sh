#!/usr/bin/env bash
set -euo pipefail

# Start n8n in the background, using the compose.yaml stored next to this script.
docker compose -f "$(dirname "$0")/compose.yaml" up -d

printf 'n8n is running: http://localhost:5678\n'
