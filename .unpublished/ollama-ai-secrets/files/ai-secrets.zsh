# ai-secrets — scan staged changes for hardcoded credentials and API keys.
# A cheap regex pass finds candidate lines first (no model call if nothing
# matches); a local LLM then judges which candidates are genuine leaks versus
# false positives (a variable just named "password", a safe getenv() read,
# an already-redacted placeholder).

AI_COMMANDS[secrets]="ai-secrets  — scan staged changes for hardcoded credentials and API keys"

ai-secrets() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "ai-secrets: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "ai-secrets: nothing staged — run 'git add' first" >&2
    return 1
  fi

  local suspects
  suspects=$(echo "$diff" | grep -nEi \
    '(api[_-]?key|secret|password|passwd|token|access[_-]?key|private[_-]?key|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)')

  if [[ -z "$suspects" ]]; then
    echo "ai-secrets: no suspicious patterns in the staged diff." >&2
    return 0
  fi

  local prompt="You are a secrets-detection expert reviewing a git diff. Below are ONLY the lines that matched a suspicious pattern (credentials, keys, tokens, passwords) — context around them has been trimmed. For each one: quote the offending line, and say whether it looks like a genuine hardcoded secret or a false positive (a variable NAME containing 'password' with no real value, a placeholder like 'changeme', an already-redacted value, or a read from an environment variable via getenv()/os.environ/process.env — that pattern is correct, not a leak). Output only genuine findings, one per line with a one-sentence reason, or the single line 'No secrets detected.' if every match is a false positive.

--- SUSPICIOUS LINES ---
$suspects"

  _ollama_query "$prompt"
}
