# ai-review — code review of your staged changes: SOLID violations, magic
# constants, functions doing too much, unclear naming, and general quality.
# Read-only — it never modifies the diff or blocks the commit itself.

AI_COMMANDS[review]="ai-review  — code review of staged changes (SOLID, magic constants, long functions, naming)"

ai-review() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "ai-review: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "ai-review: nothing staged — run 'git add' first" >&2
    return 1
  fi

  if (( ${#diff} > 12000 )); then
    echo "ai-review: staged diff is large (${#diff} chars) — review quality may drop. Consider reviewing in smaller chunks." >&2
  fi

  local prompt="You are a strict senior code reviewer. Review the staged diff below and report ONLY genuine issues, organized under these exact headings (omit a heading entirely if there is nothing to report under it):

## SOLID violations
## Magic constants
## Long functions
## Naming
## Overall quality

For each issue: cite the file and approximate line, state the problem in one sentence, and suggest a concrete fix in one sentence. Do not invent issues to fill every heading — an empty section is a good outcome, not a failure. Do not comment on formatting or style already enforced by a linter.

--- STAGED DIFF ---
$diff"

  _ollama_query "$prompt"
}
