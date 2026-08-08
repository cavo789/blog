# ai-commit — draft a Conventional Commits message from staged changes using
# a local LLM, then ask for explicit confirmation before committing anything.
# The default answer (Enter) is always "no" — this function never commits
# on your behalf without a deliberate y or e.

AI_COMMANDS[commit]="ai-commit  — draft a Conventional Commits message from staged changes"
AI_PARAMS[commit]="none"

ai-commit() {
  local diff
  diff=$(_git_staged_diff ai-commit) || return 1

  local prompt="You are a git commit message expert. Write a single Conventional Commits message (type(scope): subject, optionally a short body) for the staged diff below. Keep the subject line under 72 characters, imperative mood. Output ONLY the commit message — no explanations, no markdown fences, no surrounding quotes.

--- STAGED DIFF ---
${diff}"

  local message
  message=$(_ollama_query "$prompt") || return 1

  echo "--------------------------------------------------"
  echo "$message"
  echo "--------------------------------------------------"
  print -n "Use this message? [y]es / [e]dit / [N]o: "
  local answer
  read -k1 answer
  echo

  case "$answer" in
    y|Y) git commit -m "$message" ;;
    e|E) git commit -e -m "$message" ;;
    *)   echo "ai-commit: aborted, nothing committed." ;;
  esac
}
