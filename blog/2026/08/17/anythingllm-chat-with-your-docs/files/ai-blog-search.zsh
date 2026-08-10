# ai-blog-search — ask your own blog a question and get the matching articles
# back, as clickable links.
#
# The odd one out in this series: it doesn't call Ollama directly. It queries an
# AnythingLLM workspace, which owns the vector index and calls Ollama itself for
# both the embeddings and the answer. So the guard clause below is the
# AnythingLLM counterpart of _ollama_check rather than a reuse of it.

AI_COMMANDS[blog-search]="ai-blog-search — ask your blog a question (RAG over every published article)"
AI_PARAMS[blog-search]="text"

# Where the blog repository lives, used only by the exact-match pass. Without
# it you still get the semantic answer — just not the grep safety net.
: "${AI_BLOG_DIR:=$HOME/repositories/blog}"
: "${AI_BLOG_SITE_URL:=https://www.avonture.be}"
: "${AI_BLOG_WORKSPACE:=blog}"

# _anythingllm_check — credentials and reachability guard.
_anythingllm_check() {
  if [[ -z "${ANYTHINGLLM_API_KEY:-}" ]]; then
    echo "ai-blog-search: ANYTHINGLLM_API_KEY is not set — generate one under Settings > Tools > Developer API" >&2
    return 1
  fi

  local host="${ANYTHINGLLM_URL:-http://localhost:3001}"
  if ! curl --silent --max-time 2 "${host}/api/ping" >/dev/null 2>&1; then
    echo "ai-blog-search: cannot reach ${host} — is the AnythingLLM container running?" >&2
    return 1
  fi
}

# _ai_blog_link <url> <title> — one source line, hyperlinked when the terminal
# is one (OSC 8) and a plain URL when the output is being piped.
_ai_blog_link() {
  if [[ -t 1 ]]; then
    printf '  \e[1;32m•\e[0m \e]8;;%s\e\\\e[4m%s\e[0m\e]8;;\e\\\n' "$1" "$2"
    printf '    \e[2m%s\e[0m\n' "${1:t}"
  else
    printf '  • %s\n    %s\n' "$2" "$1"
  fi
}

ai-blog-search() {
  local question="$*"
  if [[ -z "$question" ]]; then
    echo "usage: ai-blog-search <your question>" >&2
    return 1
  fi

  _anythingllm_check || return 1

  local host="${ANYTHINGLLM_URL:-http://localhost:3001}"

  # "query" confines the model to the retrieved excerpts; "chat" would let it
  # answer from general knowledge and describe articles that don't exist.
  #
  # The random sessionId is not cosmetic: without one every call lands in the
  # workspace's default thread, the model reads its own previous answers as
  # context, and a single wrong answer repeats itself for every later question.
  local response
  response=$(
    jq -nc --arg m "$question" --arg s "zsh-${RANDOM}${RANDOM}-$$" \
      '{message: $m, mode: "query", sessionId: $s}' \
      | curl --silent --show-error --data-binary @- \
          --header "Authorization: Bearer ${ANYTHINGLLM_API_KEY}" \
          --header "Content-Type: application/json" \
          "${host}/api/v1/workspace/${AI_BLOG_WORKSPACE}/chat"
  )

  local error
  error=$(print -r -- "$response" | jq -r '.error // empty')
  if [[ -n "$error" ]]; then
    echo "ai-blog-search: ${error}" >&2
    return 1
  fi

  printf '\n\e[1;36m❓ %s\e[0m\n\n' "$question"
  print -r -- "$response" | jq -r '.textResponse'

  local sources
  sources=$(print -r -- "$response" | jq -r '
    [ .sources[]?
      | select(.chunkSource // "" | startswith("link://"))
      | {title, url: (.chunkSource | sub("^link://"; ""))}
    ] | unique_by(.url) | .[] | "\(.url)\t\(.title)"')

  if [[ -n "$sources" ]]; then
    printf '\n\e[1;33m📚 Sources the answer was built from\e[0m\n'
    local line
    for line in ${(f)sources}; do
      _ai_blog_link "${line%%$'\t'*}" "${line#*$'\t'}"
    done
  fi

  _ai_blog_grep "$question"
}

# "?" and "*" are glob characters in zsh, and a natural question ends in one.
# Without this, "ai-blog-search which posts cover Joomla?" dies with "no matches
# found" before the function is even called. Declared after the function, since
# zsh refuses to define a function whose name is an existing alias.
alias ai-blog-search='noglob ai-blog-search'

# _ai_blog_grep <question> — the exact half of the answer.
#
# Vector search ranks by similarity and stops at the workspace's topN, so it
# never enumerates: two long articles can fill every slot. This pass is the
# opposite trade-off — dumb, exact and complete.
_ai_blog_grep() {
  [[ -d "${AI_BLOG_DIR}" ]] || return 0

  local question="$1"

  # Function words, English and French: the vocabulary of asking a question
  # rather than of any topic. Rarity alone can't catch these — "content" and
  # "already" each legitimately appear in a handful of titles.
  local stopwords="about after already also always another anything article articles
    been before blog both content cover covers does each every find first from give
    have here into just know like list made make mention mentions more most must need
    only other post posts really related same search some something such talk talked
    than that their them then there these they this those topic used using very want
    what when where which while will with write written wrote your
    alors aussi autre avec avoir beaucoup cela cette comme contenu dans deja donc dont
    elle encore est etre fait faire ils leur mais mes mon nous ont parle parler pour
    quel quelle quelles quels qui quoi sans sont sujet sur tous tout toute une vous"

  local -a candidates
  candidates=(${(u)${(s: :)${(L)question//[^[:alnum:]]/ }}})

  # Second filter, dictionary-free: drop any surviving word too common to be a
  # topic. "docker" matches half the blog; "joomla" matches nine posts.
  local total ceiling
  total=$(find "${AI_BLOG_DIR}/blog" -type f \( -name 'index.md' -o -name 'index.mdx' \) | wc -l)
  ceiling=$(( total / 10 ))
  (( ceiling >= 3 )) || ceiling=3

  local -a keywords matched
  local word files count
  for word in $candidates; do
    (( ${#word} >= 4 )) || continue
    [[ " ${stopwords} " == *" ${word} "* ]] && continue

    files=$(grep -rliE "^(title|slug|description|mainTag):.*${word}|^  - ${word}\$" \
      "${AI_BLOG_DIR}/blog" --include='index.md' --include='index.mdx' 2>/dev/null)
    [[ -n "$files" ]] || continue

    count=$(print -r -- "$files" | grep -c .)
    (( count <= ceiling )) || continue

    keywords+=("$word")
    matched+=(${(f)files})
  done

  (( ${#keywords} > 0 )) || return 0

  printf '\n\e[1;33m🔎 Exact frontmatter matches (%s)\e[0m\n' "${keywords[*]}"

  local file slug title
  for file in ${(u)matched}; do
    # sed, not awk -F': ' — plenty of titles contain a colon of their own.
    slug=$(sed -n 's/^slug: *//p' "$file" | head -1 | sed 's/^"//; s/"$//')
    title=$(sed -n 's/^title: *//p' "$file" | head -1 | sed 's/^"//; s/"$//')
    _ai_blog_link "${AI_BLOG_SITE_URL}/blog/${slug}" "$title"
  done
  printf '\n'
}
