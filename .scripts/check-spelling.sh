#!/bin/bash

###############################################################################
# Objective:
#   Automated spelling and grammar check for Docusaurus blog posts using a
#   local LanguageTool API service.
#
# Requirements:
#   - A running LanguageTool container (accessible at http://languagetool:8010).
#   - 'jq' utility installed for JSON processing.
#   - 'curl' utility for API interaction.
#
# Usage:
#   1. Ensure your Docker services are up: `docker compose up -d`
#   2. Run from the project root: `./.scripts/check-spelling.sh`
#
# Features:
#   - Recursive globbing for all Markdown files in /blog.
#   - URL-safe encoding for Markdown content.
#   - Error reporting with line-specific messages.
#   - Graceful handling of API parse errors.
###############################################################################

# Exit on error, prevent globbing issues
set -e
shopt -s globstar nullglob

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Run 'apt-get update && apt-get install jq -y'."
    exit 1
fi

echo "--- Starting Spelling Check ---"

for file in blog/**/*.md; do
  # Avoid processing directories
  [ -d "$file" ] && continue

  echo "Processing: $file"

  # We use --data-urlencode to safely handle Markdown characters (#, `, etc.)
  res=$(curl -s -X POST http://languagetool:8010/v2/check \
    --data-urlencode "language=en-US" \
    --data-urlencode "text=$(cat "$file")")

  # Safeguard: Validate that the response is valid JSON before processing
  if echo "$res" | jq -e . >/dev/null 2>&1; then
    count=$(echo "$res" | jq '.matches | length')

    if [ "$count" -gt 0 ]; then
      echo "❌ $count errors found in: $file"
      # Extracts line context and error message for the first 5 errors
      echo "$res" | jq -r '.matches[] | "   - Line \(.context.offset): \(.message)"' | head -n 5
    fi
  else
    echo "⚠️  Error: Could not parse API response for $file."
    echo "    Check if the file is too large or if the LanguageTool service is healthy."
  fi
done

echo "--- Check Completed ---"
