# Foundation file for every "ai-*" function in this series. Named with a
# leading underscore on purpose: the ~/.zsh/fns/*.zsh loader sources files in
# alphabetical order, and "_" sorts before any letter — so this file is
# always loaded first, no matter how many ai-* functions get added later.
#
# Already installed this? Skip it — it's the exact same file, reused as-is.
# First introduced here: /blog/ollama-test-generator
#
# Provides:
#   - _ollama_query   the shared Ollama API client (curl + jq, no other deps)
#   - AI_COMMANDS     a registry each ai-* function adds itself to
#   - ai              the entry-point dispatcher / interactive menu

typeset -gA AI_COMMANDS

_ollama_query() {
  local prompt="$1"
  local model="${OLLAMA_MODEL:-qwen3-coder:30b}"
  local host="${OLLAMA_HOST:-http://localhost:11434}"

  if ! curl --silent --max-time 2 "${host}/api/tags" >/dev/null 2>&1; then
    echo "ollama: cannot reach ${host} — is the Ollama container running?" >&2
    return 1
  fi

  jq -n --arg model "$model" --arg prompt "$prompt" \
    '{model: $model, prompt: $prompt, stream: false}' \
    | curl --silent "${host}/api/generate" --data-binary @- \
    | jq -r '.response'
}

# ai              → interactive menu of every registered ai-* command
# ai <cmd> [args] → dispatch straight to ai-<cmd> [args]
ai() {
  local cmd="$1"

  if [[ -n "$cmd" && "$cmd" != "help" && "$cmd" != "list" ]]; then
    if (( ${+AI_COMMANDS[$cmd]} )); then
      shift
      "ai-${cmd}" "$@"
      return
    fi
    echo "ai: unknown command '$cmd'" >&2
    echo >&2
  fi

  if command -v fzf >/dev/null 2>&1; then
    local picked
    picked=$(
      for key in ${(ok)AI_COMMANDS}; do
        printf '%s\t%s\n' "$key" "$AI_COMMANDS[$key]"
      done | fzf --delimiter='\t' --with-nth=2 --prompt='ai > ' --height=40% --reverse \
        | cut -f1
    )
    [[ -n "$picked" ]] && "ai-${picked}"
  else
    echo "Available ai commands:"
    for key in ${(ok)AI_COMMANDS}; do
      printf "  ai %-8s %s\n" "$key" "$AI_COMMANDS[$key]"
    done
  fi
}
