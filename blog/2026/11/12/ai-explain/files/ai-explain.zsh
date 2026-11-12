# ai-explain [file|text] — explain a script, an error message or any piped
# output in plain English. Three input modes, checked in this order:
#   cat error.log | ai-explain            piped input always wins
#   ai-explain deploy.sh                  an existing file is read
#   ai-explain 'error: undefined symbol'  anything else is the text itself

AI_COMMANDS[explain]="ai-explain [file|text]  — explain a script, an error or piped output in plain English"
AI_PARAMS[explain]="file"

ai-explain() {
  local input

  if [[ ! -t 0 ]]; then
    input=$(cat)
  elif [[ -f "$1" ]]; then
    input=$(cat "$1")
  elif (( $# > 0 )); then
    input="$*"
  else
    echo 'Usage: ai-explain <file>   or   command 2>&1 | ai-explain   or   ai-explain "error message"' >&2
    return 1
  fi

  if [[ -z "$input" ]]; then
    echo "ai-explain: empty input — nothing to explain" >&2
    return 1
  fi

  local prompt="You are a helpful assistant that explains technical content in plain English.

Look at the content below and:
- If it is a script (bash, zsh, python, php, etc.): explain what it does step by step. Mention what it produces, what it modifies, and any side effects or risks.
- If it is an error message, stack trace, or log output: explain what went wrong, why it happened, and what to do to fix it.
- If you are not sure: describe what you see and give your best interpretation.

Keep the explanation concrete and practical. No hype, no filler. If there is a fix, give the exact command or change.
Never copy the input back: name the command or the line you are talking about instead. Plain text, no headings, no emoji, at most 15 lines. The user is on $(uname -s), so only suggest commands for that platform.

---
${input}"

  _ollama_query "$prompt"
}
