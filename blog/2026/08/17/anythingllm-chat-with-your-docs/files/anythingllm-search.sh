#!/usr/bin/env bash
#
# Ask the AnythingLLM 'blog' workspace a question and print the answer plus the
# articles it came from, as clickable links.
#
#   ai-blog-search which articles cover docker?
#
# Index first with .scripts/anythingllm-index.sh — this script only reads.

set -o errexit
set -o nounset
set -o pipefail

WORKSPACE="${ANYTHINGLLM_WORKSPACE:-blog}"

if [[ "$#" -eq 0 ]]; then
  printf 'Usage: %s <your question>\n' "$(basename "${0}")" >&2
  exit 1
fi
question="$*"

# Same resolution as the indexer: environment first, then the gitignored .env.
if [[ -z "${ANYTHINGLLM_API_KEY:-}" && -f ".env" ]]; then
  ANYTHINGLLM_API_KEY="$(grep -E '^ANYTHINGLLM_API_KEY=' .env | head -1 | cut -d= -f2- | tr -d "\"'")" || true
fi
: "${ANYTHINGLLM_API_KEY:?Generate one in Settings > Tools > Developer API}"

if [[ -z "${ANYTHINGLLM_URL:-}" ]]; then
  for candidate in "http://localhost:3001" "http://172.17.0.1:3001"; do
    if curl --silent --fail --max-time 2 "${candidate}/api/ping" >/dev/null 2>&1; then
      ANYTHINGLLM_URL="${candidate}"
      break
    fi
  done
fi
: "${ANYTHINGLLM_URL:?No AnythingLLM instance answered on port 3001}"

# "query" keeps the model inside the retrieved documents; "chat" would let it
# answer from its own general knowledge, which is how you get invented articles.
#
# The random sessionId matters more than it looks: without it every call lands
# in the workspace's default thread, and the model reads its own previous
# answers as context. One bad answer then repeats itself for every later
# question, even after the underlying retrieval has been fixed.
response="$(curl --silent --show-error \
  --header "Authorization: Bearer ${ANYTHINGLLM_API_KEY}" \
  --header "Content-Type: application/json" \
  --request POST "${ANYTHINGLLM_URL}/api/v1/workspace/${WORKSPACE}/chat" \
  --data "$(jq -nc --arg m "${question}" --arg s "cli-${RANDOM}${RANDOM}-$$" \
    '{message: $m, mode: "query", sessionId: $s}')")"

error="$(jq -r '.error // empty' <<<"${response}")"
if [[ -n "${error}" && "${error}" != "null" ]]; then
  printf 'AnythingLLM returned an error: %s\n' "${error}" >&2
  exit 1
fi

printf '\n\033[1;36m❓ %s\033[0m\n\n' "${question}"
jq -r '.textResponse' <<<"${response}"

# OSC 8 hyperlinks make the title itself clickable in VS Code's terminal and
# Windows Terminal; anywhere else (or when piped) fall back to the bare URL.
if [[ -t 1 ]]; then
  print_source() {
    printf '  \033[1;32m•\033[0m \033]8;;%s\033\\\033[4m%s\033[0m\033]8;;\033\\\n' "${1}" "${2}"
    printf '    \033[2m%s\033[0m\n' "${3}"
  }
else
  print_source() {
    printf '  • %s\n    %s\n' "${2}" "${1}"
  }
fi

sources="$(jq -r '
  [ .sources[]?
    | select(.chunkSource // "" | startswith("link://"))
    | { title, url: (.chunkSource | sub("^link://"; "")) }
  ] | unique_by(.url) | .[] | "\(.url)\t\(.title)"' <<<"${response}")"

if [[ -n "${sources}" ]]; then
  printf '\n\033[1;33m📚 Sources the answer was built from\033[0m\n'
  while IFS=$'\t' read -r url title; do
    print_source "${url}" "${title}" "${url##*/}"
  done <<<"${sources}"
else
  printf '\n\033[2mNo source document was cited.\033[0m\n'
fi

# Vector search ranks by similarity and stops at topN, so it will never
# enumerate exhaustively: a couple of long articles can fill every slot. This
# second pass is the opposite trade-off — a dumb, exact, complete scan of the
# frontmatter. Together they answer "where did I write about X" properly.
blog_dir="${BLOG_DIR:-blog}"

# Function words, English and French — the vocabulary of asking a question
# rather than of any topic. Rarity alone can't catch these: "content" and
# "already" each legitimately appear in a handful of titles.
stopwords="
about after algo already also always another anything article articles been
before blog both content cover covers does each every find first from give
have here how into just know like list made make mention mentions more most
must need only other post posts really related same search some something
such talk talked than that their them then there these they this those
topic use used using very want what when where which while will with write
written wrote your
alors aussi autre avec avoir beaucoup cela cette comme contenu dans deja
déjà donc dont elle encore est etre être fait faire ils leur mais mes mon
nous ont parle parler parlé pour quel quelle quelles quels qui quoi sans
sont sujet sur tous tout toute une vous
"

mapfile -t candidates < <(printf '%s' "${question}" | tr -c '[:alnum:]' '\n' |
  tr '[:upper:]' '[:lower:]' | awk 'length($0) >= 4' | sort -u |
  grep -vxF -f <(printf '%s' "${stopwords}" | tr -s '[:space:]' '\n' | grep .) || true)

# Second filter, dictionary-free: drop any surviving word that is simply too
# common to be a topic. "docker" matches half the blog and would drown the
# result; "joomla" matches nine posts and is exactly what you asked about.
total="$(find "${blog_dir}" -type f \( -name 'index.md' -o -name 'index.mdx' \) | wc -l)"
ceiling=$(( total / 10 ))
[[ "${ceiling}" -ge 3 ]] || ceiling=3

keywords=()
matched=""
for word in "${candidates[@]}"; do
  files="$(grep -rliE "^(title|slug|description|mainTag):.*${word}|^  - ${word}$" \
    "${blog_dir}" --include='index.md' --include='index.mdx' || true)"
  count="$(grep -c . <<<"${files}" || true)"
  [[ -n "${files}" && "${count}" -le "${ceiling}" ]] || continue
  keywords+=("${word}")
  matched+="${files}"$'\n'
done

if [[ "${#keywords[@]}" -gt 0 ]]; then
  matches="$(sort -u <<<"${matched}" | grep . || true)"
  if [[ -n "${matches}" ]]; then
    printf '\n\033[1;33m🔎 Exact frontmatter matches (%s)\033[0m\n' "${keywords[*]}"
    while read -r file; do
      [[ -n "${file}" ]] || continue
      # sed, not awk -F': ' — plenty of titles contain a colon of their own.
      slug="$(sed -n 's/^slug: *//p' "${file}" | head -1 | sed 's/^"//; s/"$//')"
      title="$(sed -n 's/^title: *//p' "${file}" | head -1 | sed 's/^"//; s/"$//')"
      print_source "${SITE_URL:-https://www.avonture.be}/blog/${slug}" "${title}" "${slug}"
    done <<<"${matches}"
  fi
fi
printf '\n'
