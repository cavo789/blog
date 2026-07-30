# ai-secrets — scan staged changes for hardcoded credentials.
# Phase 1: a cheap regex pass over the diff finds candidate lines
#           (no model call wasted if nothing matches).
# Phase 2: the LLM judges each candidate — real leak vs. safe pattern
#           (getenv(), placeholder, variable name only, already-redacted value).

AI_COMMANDS[secrets]="ai-secrets  — scan staged changes for hardcoded credentials"
AI_PARAMS[secrets]="none"

ai-secrets() {
  local diff
  diff=$(_git_staged_diff ai-secrets) || return 1

  local suspects
  suspects=$(print -- "$diff" | grep -nEi \
    '(api[_-]?key|secret|password|passwd|token|access[_-]?key|private[_-]?key|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)')

  if [[ -z "$suspects" ]]; then
    echo "ai-secrets: no suspicious patterns in the staged diff." >&2
    return 0
  fi

  local prompt="You are a secrets-detection expert reviewing a git diff. Below are ONLY the lines that matched a suspicious pattern — context around them has been trimmed. For each line: quote it, then state whether it is a genuine hardcoded secret or a false positive. False positives include: a variable NAME containing 'password' with no real value, a placeholder like 'changeme', an already-redacted value, or a correct read from the environment via getenv()/os.environ/process.env. Output only genuine findings, one per line with a one-sentence reason, or the single line 'No secrets detected.' if every match is a false positive.

--- SUSPICIOUS LINES ---
${suspects}"

  _ollama_query "$prompt"
}
