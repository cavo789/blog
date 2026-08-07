---
paths:
  - "**/*.sh"
  - "**/*.bash"
  - "**/.bash_aliases"
---

# Bash — always apply

Full rationale and more patterns: `bash-best-practices` skill. Verify: `shellcheck`/`shfmt`.

- ✅ DO: `set -o nounset` + `set -o errexit` (+ `pipefail` if the project relies on failing mid-pipe)
  at the top of every executable script.
- ✅ DO: quote every variable expansion — `"${var}"`, `"${arr[@]}"` for arrays.
  ❌ DON'T: `rm $file` / `for f in $files` — unquoted, splits on whitespace and globs.
- ✅ DO: `result=$(command)`. ❌ DON'T: `` result=`command` `` (deprecated backticks).
- ✅ DO: `if [[ -f "${file}" ]]`. ❌ DON'T: `if [ -f ${file} ]` (unquoted, `[` not `[[`).
- ✅ DO: propagate errors explicitly — `cmd || { echo "failed" >&2; return 1; }`.
  ❌ DON'T: `result=$(cmd) || echo "Error"` — swallows the failure, doesn't return/exit.
- ✅ DO: check exit status immediately — `if command; then`. Only defer to `$?` with an inline
  `# shellcheck disable=SC2181` justification.
- ✅ DO: a `grep` inside a `set -o pipefail` script that can legitimately match nothing ends with
  `|| true` — otherwise its exit 1 aborts the script.
