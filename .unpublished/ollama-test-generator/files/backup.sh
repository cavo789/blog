#!/usr/bin/env bash
# backup.sh — tar+gzip a directory into a timestamped archive

backup_dir() {
  local src="$1"
  local dest_dir="${2:-.}"

  if [[ -z "$src" ]]; then
    echo "Usage: backup_dir <source_dir> [dest_dir]" >&2
    return 1
  fi

  if [[ ! -d "$src" ]]; then
    echo "Error: '$src' is not a directory" >&2
    return 1
  fi

  local timestamp
  timestamp=$(date +%Y%m%d-%H%M%S)
  local archive_name
  archive_name="$(basename "$src")-${timestamp}.tar.gz"

  mkdir -p "$dest_dir"

  if tar -czf "${dest_dir}/${archive_name}" -C "$(dirname "$src")" "$(basename "$src")" 2>/dev/null; then
    echo "${dest_dir}/${archive_name}"
    return 0
  else
    echo "Error: tar failed for '$src'" >&2
    return 1
  fi
}
