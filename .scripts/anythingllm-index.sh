#!/usr/bin/env bash
#
# Index every blog post into an AnythingLLM workspace.
#
#   .scripts/anythingllm-index.sh          # from the root of the blog
#   ai-index                               # same thing, devcontainer shell
#
# Re-run it after publishing a new article: only new and modified posts are
# sent, everything else is skipped.
#
# KEEP IN SYNC with the copy published in the article:
#   blog/2026/08/17/anythingllm-chat-with-your-docs/files/anythingllm-index.sh
# Only this header block differs; everything below it must stay identical.
# Check with:  diff <(tail -n +16 .scripts/anythingllm-index.sh) \
#                   <(tail -n +9 blog/2026/08/17/anythingllm-chat-with-your-docs/files/anythingllm-index.sh)

set -o errexit
set -o nounset
set -o pipefail

WORKSPACE="${ANYTHINGLLM_WORKSPACE:-blog}"
BLOG_DIR="${BLOG_DIR:-blog}"
STATE_FILE="${STATE_FILE:-.anythingllm-indexed}"
SITE_URL="${SITE_URL:-https://www.avonture.be}"

# The key can come from the environment (a line in ~/.zshrc) or from the
# gitignored .env at the root of the blog — handy inside a devcontainer, which
# doesn't inherit the host's shell configuration.
if [[ -z "${ANYTHINGLLM_API_KEY:-}" && -f ".env" ]]; then
  ANYTHINGLLM_API_KEY="$(grep -E '^ANYTHINGLLM_API_KEY=' .env | head -1 | cut -d= -f2- | tr -d "\"'")" || true
fi
: "${ANYTHINGLLM_API_KEY:?Generate one in Settings > Tools > Developer API}"

# "localhost" is right when the script runs on the Docker host; from inside
# another container it isn't, and the bridge gateway is what reaches it.
if [[ -z "${ANYTHINGLLM_URL:-}" ]]; then
  for candidate in "http://localhost:3001" "http://172.17.0.1:3001"; do
    if curl --silent --fail --max-time 2 "${candidate}/api/ping" >/dev/null 2>&1; then
      ANYTHINGLLM_URL="${candidate}"
      break
    fi
  done
fi
: "${ANYTHINGLLM_URL:?No AnythingLLM instance answered on port 3001}"

api() {
  curl --silent --show-error \
    --header "Authorization: Bearer ${ANYTHINGLLM_API_KEY}" "$@"
}

# Read one key out of a Markdown file's YAML frontmatter, unquoted.
frontmatter() {
  local key="${1}" file="${2}"

  awk -v key="${key}" '
    NR == 1 && $0 == "---" { in_fm = 1; next }
    in_fm && $0 == "---" { exit }
    in_fm && index($0, key ":") == 1 {
      sub("^" key ": *", "")
      gsub(/^"|"$/, "")
      print
      exit
    }
  ' "${file}"
}

# Fail early and loudly rather than uploading 248 files into the void.
if ! api "${ANYTHINGLLM_URL}/api/v1/workspaces" |
  jq -e --arg slug "${WORKSPACE}" '.workspaces[]? | select(.slug == $slug)' >/dev/null; then
  printf 'Workspace "%s" not found at %s (check the slug and the API key)\n' \
    "${WORKSPACE}" "${ANYTHINGLLM_URL}" >&2
  exit 1
fi

# Replay the state file: post path -> "<sha256>\t<document location>".
declare -A previous=()
if [[ -f "${STATE_FILE}" ]]; then
  while IFS=$'\t' read -r hash path location; do
    [[ -n "${path}" ]] && previous["${path}"]="${hash}"$'\t'"${location}"
  done <"${STATE_FILE}"
fi

declare -A current=()
added=0
updated=0
skipped=0
failed=0

while IFS= read -r -d '' file; do
  hash="$(sha256sum "${file}" | cut -d' ' -f1)"
  entry="${previous["${file}"]:-}"
  known_hash="${entry%%$'\t'*}"

  if [[ "${known_hash}" == "${hash}" ]]; then
    current["${file}"]="${entry}"
    skipped=$((skipped + 1))
    continue
  fi

  if [[ "$(frontmatter draft "${file}")" == "true" ]]; then
    continue
  fi

  # Every post is an index.md, so the folder name is what makes it
  # identifiable — send it as the filename AnythingLLM will cite.
  slug="$(frontmatter slug "${file}")"
  [[ -n "${slug}" ]] || slug="$(basename "$(dirname "${file}")")"
  title="$(frontmatter title "${file}")"
  [[ -n "${title}" ]] || title="${slug}"

  # AnythingLLM stamps each document with a "published" date taken from the
  # temp file the collector received — i.e. the upload date, always today, and
  # not overridable through the API. Ask the workspace when something was
  # written and it answers confidently and wrongly.
  # Of the three fields copied into every chunk's header, "title" is the only
  # one we control, so the real date rides along inside it.
  published="$(frontmatter date "${file}")"
  [[ -z "${published}" ]] || title="${title} (published ${published})"

  # A modified post: drop the previously embedded copy first, otherwise the
  # workspace ends up answering from two versions of the same article.
  if [[ -n "${entry}" ]]; then
    old_location="${entry#*$'\t'}"
    api --request DELETE "${ANYTHINGLLM_URL}/api/v1/system/remove-documents" \
      --header "Content-Type: application/json" \
      --data "$(jq -nc --arg name "${old_location}" '{names: [$name]}')" >/dev/null || true
  fi

  # A "link://" chunkSource is the one metadata field AnythingLLM copies into
  # every chunk's header, so this is what lets the model answer with the live
  # URL of the article instead of just a filename.
  response="$(api --request POST "${ANYTHINGLLM_URL}/api/v1/document/upload" \
    --form "file=@${file};filename=${slug}.md;type=text/markdown" \
    --form "addToWorkspaces=${WORKSPACE}" \
    --form "metadata=$(jq -nc \
      --arg title "${title}" \
      --arg source "${file}" \
      --arg link "link://${SITE_URL}/blog/${slug}" \
      '{title: $title, docSource: $source, chunkSource: $link}')")"

  location="$(jq -r '.documents[0].location // empty' <<<"${response}")"
  if [[ -z "${location}" ]]; then
    printf 'FAILED  %s: %s\n' "${slug}" "$(jq -r '.error // "unknown error"' <<<"${response}")" >&2
    failed=$((failed + 1))
    continue
  fi

  current["${file}"]="${hash}"$'\t'"${location}"
  if [[ -n "${entry}" ]]; then
    printf 'updated %s\n' "${slug}"
    updated=$((updated + 1))
  else
    printf 'added   %s\n' "${slug}"
    added=$((added + 1))
  fi
done < <(find "${BLOG_DIR}" -type f \( -name 'index.md' -o -name 'index.mdx' \) -print0 | sort -z)

# Rewrite the state file from scratch so deleted posts drop out of it.
for path in "${!current[@]}"; do
  printf '%s\t%s\t%s\n' \
    "${current["${path}"]%%$'\t'*}" "${path}" "${current["${path}"]#*$'\t'}"
done | sort -k2 >"${STATE_FILE}"

printf '\n%d added, %d updated, %d unchanged, %d failed\n' \
  "${added}" "${updated}" "${skipped}" "${failed}"
[[ "${failed}" -eq 0 ]]
