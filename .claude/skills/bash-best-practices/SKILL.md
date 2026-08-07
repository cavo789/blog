---
name: bash-best-practices
description: Generic Bash best practices — quoting, set -o nounset/errexit, [[ ]] vs [ ], $() vs backticks, explicit error handling, shellcheck-clean patterns, and common pitfalls. Language-level rules, not any one project's conventions.
disable-model-invocation: false
---

# Bash Best Practices

Generic Bash rules applicable to any project. This skill covers only what's true of Bash itself —
check whether the current project has its own conventions skill (logging system, sourcing pattern,
function naming, status files, etc.) and defer to it for anything project-specific.

## Recommended script setup

​```bash
#!/usr/bin/env bash
set -o nounset
set -o errexit
​```

A widely-used default for scripts that should fail fast and never silently operate on an unset
variable. Not universal law — some scripts deliberately omit `errexit` because they must keep going
despite a failing step. Check what the current project actually does before assuming.

`pipefail` (`set -o pipefail`) is a separate opt-in: without it, a failing command in the middle of
a pipe does not by itself abort the script. Check whether the current project sets it before relying
on that behavior.

## Variables and scoping

**Local scope, `readonly` unless reassigned:**

​```bash
function my_function() {
    local -r arg1="${1}"
    ...
}
​```

**Undefined variable error (under `set -o nounset`):**

​```bash
echo "${UNDEFINED_VAR}"             # Error under nounset
value="${UNDEFINED_VAR:-default}"   # OK: provides a default
​```

## Error handling — principle

Propagate, log, and return/exit explicitly — never swallow an error silently:

​```bash
# Bad: swallowed error
result=$(some_command) || echo "Error"           # Error not propagated

# Good: propagate, log, and return/exit explicitly
result=$(some_command) || { echo "Command failed" >&2; return 1; }
​```

Guard-clause functions (argument-count/non-empty checks at the top of a function, returning or
exiting early on failure) are a robust, common pattern. Check whether the current project already
has its own assertion helpers before writing ad hoc `[[ ]]` checks everywhere.

## Bash patterns (shellcheck-clean)

**Variable quoting (SC2086):**

​```bash
# Bad: unquoted variable splits on whitespace and globs
files=$file_list
for f in $files; do ...   # a filename with a space becomes two iterations
rm $file                  # if $file="a b", removes two files

# Good: quote scalars; use a real array to iterate a list
rm "${file}"
files=(a b "c d")               # array, not a space-joined string
for f in "${files[@]}"; do ...  # each element stays intact, even with spaces
​```

Note: `for f in ${var}` (braces but no quotes) still word-splits — braces are not quoting. Quote
(`"${var}"`) or use an array (`"${arr[@]}"`).

**Command substitution:**

​```bash
# Preferred
result=$(command)

# Avoid (deprecated)
result=`command`
​```

**Conditional:**

​```bash
# Good
if [[ -f "${file}" ]]; then ...
if [[ "${var}" == "value" ]]; then ...

# Avoid
if [ -f ${file} ]; then ...  # Unquoted, uses [ instead of [[
​```

**Checking `$?` explicitly (SC2181)** — prefer checking a command's exit status directly:

​```bash
# Preferred
if command; then ...

# If you must defer the check (e.g. after an intermediate command that consumes it),
# justify the shellcheck disable inline
# shellcheck disable=SC2181
if [[ $? -ne 0 ]]; then ...
​```

## Shellcheck directives

Use sparingly, and always justify inline with a comment — a disable without a reason invites someone
to copy it somewhere it doesn't apply.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| `if $? -eq 0` (checking exit after other commands ran in between) | Check immediately: `if command; then ...`, or `# shellcheck disable=SC2181` right before the check if you must defer it |
| Unquoted variables | Always quote: `"${var}"` |
| Assuming `pipefail` is set | It's an explicit opt-in (`set -o pipefail`), not a Bash default — check the current project |
| `` result=`command` `` (backticks) | Prefer `result=$(command)` — nests cleanly, easier to read |


## Pipes (SC2094)

```bash
# Good
grep pattern < file | sort

# Bad (sometimes)
sort < file | grep pattern > file  # Overwrites input
```

## String escaping for generated scripts

When Bash writes shell code (e.g., via Jinja2 template), escape carefully:

```bash
# Template generating a shell script
cat > "${output_script}" << 'EOF'
#!/bin/bash
log::info "Running ${job_name}"
EOF
# Single-quote the heredoc (EOF) to prevent variable expansion
```

---

Remember: Bash is fragile. Defensive programming (quoting, guard clauses, explicit error handling)
prevents silent failures.
