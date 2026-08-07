---
description: Audit this project's Bash scripts against the bash-best-practices skill (read-only)
argument-hint: "[path] (optional — defaults to the whole project)"
allowed-tools: Agent
---

# Bash review

Invoke the `bash-best-practices-reviewer` agent to audit **$ARGUMENTS** (or the whole
project if no argument is given) against the `bash-best-practices` skill, and against
this project's own bash-conventions rule/skill too, if it ships one.

Read-only: the agent reports violations with file:line, it never edits.
