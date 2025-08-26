#!/bin/bash

# Go to the /blog folder
cd ./blog || exit 1

# Define the list of extensions or names to ignore (without dot)
IGNORE_LIST="bat|js|javascript|py|python|php|css|json|yaml|yml|vb|vba|vbs|xml|bashrc|sh|zsh|dockerfile|.dockerignore|cmd|md|qmd|markdownlint_ignore|json|bas|html|sql|zshrc|txt|ini|toml|ps1|makefile|svg"

# Find all .md and .mdx files, extract filenames, normalize and deduplicate
grep -rhoE '<Snippet filename="[^"]+"' . --include="*.md" --include="*.mdx" |
  sed -E 's/.*filename="([^"]+)".*/\1/' |
  awk -v ignore="$IGNORE_LIST" '
  {
    if ($0 ~ /\./) {
      # File has extension: extract extension (e.g. file.css => css)
      n = split($0, parts, ".")
      ext = parts[n]
      print tolower(ext)
    } else {
      # No dot: treat full filename as-is
      print tolower($0)
    }
  }' |
  grep -vE "^($IGNORE_LIST)$" |
  sort -u