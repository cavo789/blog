# ai-review — SOLID, magic-constants, naming and overall quality review of
# staged changes, printed straight to the terminal. Read-only: it never
# modifies the diff or blocks a commit — that decision stays with you.

AI_COMMANDS[review]="ai-review  — code review of staged changes (SOLID, magic constants, naming)"
AI_PARAMS[review]="none"

ai-review() {
  local diff
  diff=$(_git_staged_diff ai-review) || return 1

  local prompt="You are a strict senior code reviewer. Review the staged diff below and report ONLY genuine issues, organized under these exact headings (omit a heading entirely if there is nothing to report under it):

## SOLID violations
## Magic constants
## Long functions
## Naming
## Overall quality

For each issue: cite the file and approximate line, state the problem in one sentence, and suggest a concrete fix in one sentence. Do not invent issues to fill every heading — an empty section is a good outcome, not a failure. Do not comment on formatting or style already enforced by a linter.

--- STAGED DIFF ---
${diff}"

  _ollama_query "$prompt"
}
