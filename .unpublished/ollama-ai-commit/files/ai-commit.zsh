# ai-commit — draft a Conventional Commits message for your staged changes
# using a local LLM, then accept, edit, or discard it before anything is
# actually committed.

AI_COMMANDS[commit]="ai-commit  — draft a Conventional Commits message from staged changes"

ai-commit() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "ai-commit: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "ai-commit: nothing staged — run 'git add' first" >&2
    return 1
  fi

  if (( ${#diff} > 12000 )); then
    echo "ai-commit: staged diff is large (${#diff} chars) — the message may be less precise. Consider committing in smaller chunks." >&2
  fi

  local prompt="You are a git commit message expert. Write a single Conventional Commits message (type(scope): subject, optionally a short body) for the staged diff below. Keep the subject line under 72 characters, imperative mood. Output ONLY the commit message — no explanations, no markdown fences, no surrounding quotes.

--- STAGED DIFF ---
$diff"

  local message
  message=$(_ollama_query "$prompt") || return 1

  echo "--------------------------------------------------"
  echo "$message"
  echo "--------------------------------------------------"
  print -n "Use this message? [y]es / [e]dit / [N]o: "
  read -k1 answer
  echo

  case "$answer" in
    y|Y) git commit -m "$message" ;;
    e|E) git commit -e -m "$message" ;;
    *)   echo "ai-commit: aborted, nothing committed." ;;
  esac
}
