#!/usr/bin/env bash
set -euo pipefail

for tool in docker git curl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing prerequisite: $tool" >&2
    exit 1
  fi
done

git pull --rebase origin main

tag="myapp:$(git rev-parse --short HEAD)"
docker build -t "$tag" .

APP_IMAGE="$tag" docker compose up -d --no-deps app

for _ in $(seq 1 12); do
  if [[ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/health)" == "200" ]]; then
    echo "Deploy successful: $tag"
    exit 0
  fi
  sleep 5
done

echo "Health check failed for $tag" >&2
exit 1
