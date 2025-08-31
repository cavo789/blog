#!/bin/bash

EXCLUDE_DIR="blog/XXX"
BASE_URL="https://www.avonture.be/blog"

# Find all .md and .mdx files under blog/, excluding the EXCLUDE_DIR
find blog -type f \( -name "*.md" -o -name "*.mdx" \) ! -path "$EXCLUDE_DIR/*" | while read -r file; do
  # Read YAML frontmatter (only the first block)
  frontmatter=$(awk '
    BEGIN { in_frontmatter=0; line_count=0 }
    /^---$/ {
      if (++line_count == 1) { in_frontmatter=1; next }
      else if (line_count == 2) { in_frontmatter=0; exit }
    }
    in_frontmatter { print }
  ' "$file")

  # If frontmatter exists but doesn't include blueSkyRecordKey
  if [[ -n "$frontmatter" && "$frontmatter" != *"blueSkyRecordKey"* ]]; then
    # Get the last directory name before the file
    slug=$(basename "$(dirname "$file")")

    # Compose URL
    url="${BASE_URL}/${slug}"

    # Output: filepath <TAB> URL
    printf "\e[39;1m%-70s\e[36m%s\e[0m\n" "${file}" "${url}"
  fi
done | sort --reverse
