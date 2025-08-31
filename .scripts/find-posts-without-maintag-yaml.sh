#!/bin/bash

EXCLUDE_DIR="blog/XXX"

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

  # If frontmatter exists but doesn't include mainTag
  if [[ -n "$frontmatter" && "$frontmatter" != *"mainTag"* ]]; then
    # Output: filepath <TAB> URL
    printf "\e[39;1m%s\e[0m\n" "${file}"
  fi
done | sort --reverse
