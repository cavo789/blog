#!/usr/bin/env bash
# massupload.sh — upload every file in a folder to the remote host, in parallel, with retry

REMOTE="user@example.com:/var/www/uploads/"
MAX_RETRIES=3

upload_one() {
  local file="$1"
  local attempt=1
  while (( attempt <= MAX_RETRIES )); do
    scp "$file" "$REMOTE" && return 0
    echo "Retry $attempt/$MAX_RETRIES for $file" >&2
    ((attempt++))
  done
  echo "FAILED: $file" >&2
  return 1
}

for file in "$SRC_DIR"/*; do
  [[ "$file" == *.tmp ]] && continue
  upload_one "$file" &
done
wait
