---
description: Critical deep review of my blog (architecture, reliability, DX). Generates TODOs.
argument-hint: "[path-or-subsystem]   (empty = full codebase)"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Deep Review of my blog

Perform a comprehensive and critical review of the my blog codebase.

Your goal is not to confirm existing design choices, but to identify weaknesses, risks,
inconsistencies, technical debt, missing features, maintainability concerns, developer-experience
issues, architectural limitations, and opportunities for improvement.

## Scope — read `$ARGUMENTS` first

`$ARGUMENTS` is an **optional** scope.

- **Empty** → review the whole codebase (full mode).
- **A path** (e.g. `src/components`, `src/components/BrowserWindow`) → restrict the review to that
  directory and its direct collaborators. State the scope explicitly in the report header.

If `$ARGUMENTS` does not resolve to any existing path or known subsystem, stop and respond:

```text
Usage: /deep_review [path-or-subsystem]
Examples: /deep_review            (full codebase)
          /deep_review install    (subsystem)
          /deep_review src/components
```

A scoped run still considers cross-cutting impact, but only files findings whose root cause lives in
the requested scope.

## Project Context

my blog provides a unified way to execute quality-related tasks: linting, formatting, security
checks, dependency audits, unit tests, and other QA tasks.

The tool must behave identically on a developer workstation, inside a DevContainer, inside Docker,
and in GitLab CI/CD. Local execution and CI execution must produce the same results whenever
possible.

## Review Objectives

Evaluate whether my blog:

1. Fully achieves its stated objectives.
2. Provides a reliable and deterministic execution environment.
3. Avoids configuration drift between local and CI environments.
4. Is maintainable over the long term.
5. Is easy to understand and adopt by development teams.
6. Encourages good engineering practices.
7. Scales to larger projects and teams.
8. Provides sufficient guidance and feedback when errors occur.

## Areas to Review

### Architecture

Separation of responsibilities, modularity, extensibility, coupling, cohesion, future
maintainability.

### Code Quality

Complexity, readability, naming consistency, error handling, silent-failure risks, edge cases, dead
code, duplicate logic.

### Configuration

Docker, DevContainer, GitLab CI/CD, YAML files, environment variables, defaults and fallbacks.
Identify fragile configurations or scenarios that could produce unexpected behavior.

### Reliability

Hidden bugs, race conditions, incorrect assumptions, non-deterministic behavior,
environment-dependent behavior, potential CI/local inconsistencies.

### Developer Experience (DX)

my blog should feel like a coach and assistant rather than "yet another tool". Evaluate whether
commands are discoverable, error messages are actionable, documentation is sufficient, guidance is
contextual, developers can understand what the tool is doing, and developers can learn from failures.

### Pedagogy

my blog targets both junior and senior developers. CLI usage is mandatory: a developer must be able
to launch any job with a single command. Evaluate the balance between simplicity, discoverability,
flexibility, and power-user capabilities.

### Documentation

Accuracy, completeness, consistency, missing examples, missing troubleshooting information, missing
architectural explanations.

## Incremental / rerun mode

This review may run many times over the project's life. Treat the current code and the existing
TODO backlog as the baseline:

1. Before reporting, enumerate **all** existing TODO IDs across `.todos/` **and its subfolders**
   (`DONE/`, `PARTIAL/`, `BLOCKED/`, `UNNEEDED/`). Treat every one — including `DONE` — as known.
2. Do not re-report problems already captured by an existing TODO. Instead verify whether the
   existing TODO is sufficient; if not, say how it should be extended, and reference it by ID.
3. Spend the report on gaps, blind spots, second-order issues, and opportunities created by the
   future implementation of existing TODOs.
4. Always assume additional improvements exist; do not stop because major issues are already covered.

## Output Format

Respond in French. Be direct, precise, and critical. Do not avoid criticism.

State the scope (full or the resolved path/subsystem) in the first line.

For every issue found: explain the problem, the impact, the risk, and propose a concrete solution.

Prioritize findings using: Critical, High, Medium, Low.

## TODO Generation

Propose a TODO file **for every issue found**, stored flat in `.todos/`.

**Numbering (mandatory):** scan `.todos/` and all its subfolders for the highest existing `NNN`
(three-digit) ID. New TODOs start at `max + 1` and increment. Never reuse or collide with an ID that
already exists anywhere, including under `DONE/`, `PARTIAL/`, `BLOCKED/`, `UNNEEDED/`.

**Naming:** `NNN-short-description.md`, the short description in **English** (e.g.
`178-humanize-bash-fatal-error.md`).

**Anti-duplication:** before writing a TODO, confirm no existing item (any folder) already covers it.
If a related TODO exists, reference it and explain whether it should be extended or chained rather
than creating a duplicate.

For each proposed TODO provide: suggested filename, priority, objective, expected benefit, rough
implementation strategy, and its relationship to existing TODOs (dependencies / chaining).

Focus on actionable improvements rather than theoretical observations.
