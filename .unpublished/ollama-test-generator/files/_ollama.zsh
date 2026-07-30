# Foundation file for every "ai-*" function in this series. Named with a
# leading underscore: the ~/.zsh/fns/*.zsh loader sources files in
# alphabetical order, and "_" sorts before any letter — so this file is
# always loaded first, no matter how many ai-* functions get added later.
#
# Provides:
#   - _ollama_check       reachability guard for Ollama
#   - _ollama_query       shared HTTP client (curl + jq)
#   - _git_staged_diff    validated staged-diff fetcher (shared by pre-commit functions)
#   - AI_COMMANDS         registry each ai-* function adds itself to
#   - AI_PARAMS           registry of interactive parameter types (file/language/number/text/none)
#   - _ai_prompt_*        FZF/read helpers for interactive argument collection
#   - ai                  entry-point dispatcher / interactive menu

typeset -gA AI_COMMANDS
typeset -gA AI_PARAMS

# ---------------------------------------------------------------------------
# Ollama helpers
# ---------------------------------------------------------------------------

# _ollama_check — verify that the Ollama daemon is reachable.
# Fails loudly so callers can bail early rather than watching curl hang.
_ollama_check() {
  local host="${OLLAMA_HOST:-http://localhost:11434}"
  if ! curl --silent --max-time 2 "${host}/api/tags" >/dev/null 2>&1; then
    echo "ollama: cannot reach ${host} — is the Ollama container running?" >&2
    return 1
  fi
}

# _ollama_query <prompt> — send a prompt to the local model and print the response.
# Assumes Ollama is reachable; call _ollama_check first if you need an early guard.
_ollama_query() {
  local prompt="$1"
  local model="${OLLAMA_MODEL:-qwen3-coder:30b}"
  local host="${OLLAMA_HOST:-http://localhost:11434}"

  _ollama_check || return 1

  jq -n --arg model "$model" --arg prompt "$prompt" \
    '{model: $model, prompt: $prompt, stream: false}' \
    | curl --silent "${host}/api/generate" --data-binary @- \
    | jq -r '.response // empty'
}

# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

# _git_staged_diff <caller> — validate the git context and return the staged diff.
# Handles three early-exit cases (not a repo, nothing staged, oversized diff)
# so every pre-commit function gets them for free without repeating the guards.
_git_staged_diff() {
  local caller="${1:-ai}"

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "${caller}: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "${caller}: nothing staged — run 'git add' first" >&2
    return 1
  fi

  if (( ${#diff} > 12000 )); then
    echo "${caller}: staged diff is large (${#diff} chars) — output may be less precise. Consider committing in smaller chunks." >&2
  fi

  print -- "$diff"
}

# ---------------------------------------------------------------------------
# Interactive argument helpers (used by the ai() dispatcher)
# ---------------------------------------------------------------------------

# _ai_prompt_file [label] — open an fzf file picker; print the chosen path.
_ai_prompt_file() {
  local label="${1:-Select a file:}"
  if command -v fd >/dev/null 2>&1; then
    fd --type f | fzf --prompt="${label} " --height=50% --reverse \
      --preview='bat --color=always {} 2>/dev/null || cat {}'
  else
    find . -type f | fzf --prompt="${label} " --height=50% --reverse
  fi
}

# _ai_prompt_language — open an fzf language picker; print the chosen language.
_ai_prompt_language() {
  printf '%s\n' English French Dutch German Spanish Italian Portuguese Japanese Chinese Korean \
    | fzf --prompt='Target language: ' --height=40% --reverse
}

# _ai_prompt_number [label] — read a positive integer; print it (or nothing on Enter, which
# lets the caller fall back to its own default). Returns 1 only on invalid input.
_ai_prompt_number() {
  local label="${1:-Number (Enter for default):}"
  print -n "${label} "
  local n
  read n
  if [[ -z "$n" ]]; then
    return 0
  fi
  if [[ ! "$n" =~ ^[1-9][0-9]*$ ]]; then
    echo "Expected a positive integer." >&2
    return 1
  fi
  print -- "$n"
}

# _ai_prompt_text [label] — read a free-form string; print it. Returns 1 if empty.
_ai_prompt_text() {
  local label="${1:-Input:}"
  print -n "${label} "
  local t
  read t
  if [[ -z "$t" ]]; then
    echo "No input given." >&2
    return 1
  fi
  print -- "$t"
}

# ---------------------------------------------------------------------------
# Entry-point dispatcher
# ---------------------------------------------------------------------------

# ai              → interactive fzf menu of every registered ai-* command
# ai <cmd> [args] → dispatch straight to ai-<cmd> [args]
#
# When opened via the fzf menu, each command's declared AI_PARAMS type triggers
# a secondary picker before the command runs:
#   file     → fzf file picker (fd + preview if available)
#   language → fzf language list
#   number   → read prompt, empty input uses the command's own default
#   text     → read prompt, required
#   none     → run the command directly (it collects its own input)
# Space-separated values declare multiple parameters in order, e.g. "file language".
ai() {
  local cmd="$1"

  # Direct dispatch: ai <cmd> [args]
  if [[ -n "$cmd" && "$cmd" != "help" && "$cmd" != "list" ]]; then
    if (( ${+AI_COMMANDS[$cmd]} )); then
      shift
      "ai-${cmd}" "$@"
      return
    fi
    echo "ai: unknown command '${cmd}'" >&2
    echo >&2
  fi

  # Interactive menu
  if ! command -v fzf >/dev/null 2>&1; then
    echo "Available ai commands:"
    for key in ${(ok)AI_COMMANDS}; do
      printf "  ai %-10s %s\n" "$key" "$AI_COMMANDS[$key]"
    done
    return
  fi

  local picked
  picked=$(
    for key in ${(ok)AI_COMMANDS}; do
      printf '%s\t%s\n' "$key" "$AI_COMMANDS[$key]"
    done \
      | fzf --delimiter='\t' --with-nth=2 --prompt='ai > ' --height=40% --reverse \
      | cut -f1
  )
  [[ -z "$picked" ]] && return

  # Collect arguments interactively based on AI_PARAMS declaration
  local -a args=()
  local param_type
  for param_type in ${(s: :)${AI_PARAMS[$picked]:-none}}; do
    case "$param_type" in
      file)
        local f
        f=$(_ai_prompt_file "File for ai-${picked}:") || return 1
        args+=("$f")
        ;;
      language)
        local l
        l=$(_ai_prompt_language) || return 1
        args+=("$l")
        ;;
      number)
        local n
        n=$(_ai_prompt_number) || return 1
        [[ -n "$n" ]] && args+=("$n")
        ;;
      text)
        local t
        t=$(_ai_prompt_text) || return 1
        args+=("$t")
        ;;
      none) ;;
    esac
  done

  "ai-${picked}" "${args[@]}"
}
