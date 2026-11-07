---
description: Audit this project's Python against the python-best-practices skill (read-only)
argument-hint: "[path] (optional — defaults to the whole project)"
allowed-tools: Agent
---

# Python review

Invoke the `python-best-practices-reviewer` agent to audit **$ARGUMENTS** (or the
whole project if no argument is given) against the `python-best-practices` skill, and
against this project's own Python rule/skill too, if it ships one.

Read-only: the agent reports violations with file:line, it never edits.
