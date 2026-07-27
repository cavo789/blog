# ai-ask <question> — get the shell command for a plain-English question,
# answered by a local LLM. No file reading, no side effects — just the
# command you're looking for, printed to stdout.

AI_COMMANDS[ask]="ai-ask <question>  — get the shell command for a plain-English question"

ai-ask() {
  if [[ -z "$1" ]]; then
    echo "Usage: ai-ask <question>" >&2
    return 1
  fi

  local question="$*"
  local os_info
  os_info=$(uname -a)

  local prompt="You are a Linux/zsh command-line expert. Answer the question below with the exact shell command to run and nothing else. If a flag is genuinely non-obvious, add one short line after it starting with '# '. Do not wrap the command in markdown code fences. Environment: $os_info

Question: $question"

  _ollama_query "$prompt"
}
