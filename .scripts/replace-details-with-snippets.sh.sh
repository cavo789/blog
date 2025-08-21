#!/bin/bash

# Script: replace-details-with-snippets.sh
# Description: Replaces <details><summary>FILENAME</summary> blocks with <Snippet filename="FILENAME"> blocks in all .md files recursively.

shopt -s globstar nullglob

for file in blog/**/*.md; do
  echo "Processing $file..."

  # Use awk to do a multi-line regex replacement
  awk '
  BEGIN { in_block = 0 }
  /^<details>/ {
    in_block = 1
    next
  }
  /^<summary>.*<\/summary>/ {
    if (in_block) {
      match($0, /<summary>(.*)<\/summary>/, m)
      filename = m[1]
      print "<Snippet filename=\"" filename "\">"
      next
    }
  }
  /^<\/details>/ {
    if (in_block) {
      print "</Snippet>"
      in_block = 0
      next
    }
  }
  {
    if (in_block || !in_block) print
  }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done

echo "✅ Replacement complete."
