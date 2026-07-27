#!/usr/bin/env bash
# massupload.sh — upload every file in a folder to the remote host

REMOTE="user@example.com:/var/www/uploads/"

for file in "$SRC_DIR"/*; do
  scp "$file" "$REMOTE"
done
