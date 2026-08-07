---
description: Audit this project's Dockerfile(s) against the dockerfile-best-practices / devcontainer-dockerfile-best-practices skills, then offer to auto-fix what's safe, propose OCI label values, and file TODOs for the rest
argument-hint: "[path or pattern] (optional — defaults to searching the whole project)"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, Agent
---

# Docker review

Invoke the `dockerfile-best-practices-reviewer` agent to find and audit every Dockerfile-shaped
file matching **$ARGUMENTS** (or, with no argument, every Dockerfile anywhere in the project —
`Dockerfile`, `Dockerfile.prod`, `Dockerfile_dev`, `*.dockerfile`, `Containerfile`, under
`.devcontainer/` or anywhere else) against the `dockerfile-best-practices` skill, plus
`devcontainer-dockerfile-best-practices` for anything that builds a devcontainer image.

The agent itself stays read-only: it reports MUST/SHOULD/MAY violations and anti-pattern matches
with file:line, it never edits. Everything below happens in this conversation once its report is
back — relay its findings as the summary first, then work through the three steps below.

## Devcontainer exception: no version-pinning findings

`.devcontainer/Dockerfile` (or any file the agent classified as a devcontainer image) is rebuilt
often and deliberately tracks the latest tool/base-image versions — pinning defeats the point.
Before doing anything else, drop every finding about such a file that is purely about **pinning a
version** (a hardcoded tool version that "should" become an `ARG`, a floating base-image tag, a
missing digest): don't auto-fix it, don't propose it, don't file a TODO for it. Every other kind of
finding on a devcontainer file — OCI labels, secrets, the syntax pragma, merged `RUN`s,
`COPY --chmod`, … — still applies normally.

## 1. Auto-fixable now — mechanical, zero-risk rewrites

Some MUST/SHOULD violations are pure syntax rewrites that provably don't change what the image
does — safe to apply directly instead of parking as a TODO. A finding qualifies only if the fix is
mechanical: no judgment call, no external lookup, no behavior change.

- A hardcoded tool version inline in a `RUN`/`FROM` → hoist it to `ARG <NAME>_VERSION=<current
  value>` and reference `${<NAME>_VERSION}` at the call site (skipped for a devcontainer file, per
  above).
- A `RUN chmod`/`RUN chown` layer immediately following the `COPY` it fixes up → fold into
  `COPY --chmod=… --chown=…` on that same instruction.
- A fetch/extract/cleanup split across separate `RUN`s → merge into one `RUN`.
- A missing `# syntax=docker/dockerfile:<minor>` pragma as line 1 → add it, pinned to the minor the
  file's own BuildKit features already require, or the current stable minor if it uses none yet.
- A Linux-based stage missing `PYTHONDONTWRITEBYTECODE=1` and/or `PYTHONUNBUFFERED=1` → add the
  block below near the stage's other `ENV` lines, comment included verbatim. Applies to any stage
  a Python interpreter could plausibly run in — Python, Quarto, Debian/Ubuntu, a polyglot image
  where Python is only one of several tools — not just one whose primary language is Python.
  Skip only a stage that genuinely can't run Python: a PHP-only base (`php:*-fpm`, `php:*-cli`)
  with no Python installed, or a shell-less scratch/distroless stage.

  ```dockerfile
  # Avoid .pyc cache files from build-time pip/pre-commit invocations, and unbuffered stdout for
  # any Python process run interactively in this container.
  ENV PYTHONDONTWRITEBYTECODE=1
  ENV PYTHONUNBUFFERED=1
  ```

- An *existing* `.dockerignore` missing one or more entries from any of the skill's baselines →
  append only the missing lines, unchanged, to the end of the file. List which entries were added
  and why:
  - Secret-exclusion baseline (`.git`, `.env*`, SSH private keys, cloud/API credential files, …) —
    always applies.
  - Dependency-directory baseline — conditional on the matching manifest actually being present in
    the build context: `node_modules/` if `package.json` exists, `vendor/` if `composer.json`
    exists, `.venv/`/`venv/`/`__pycache__/` if a Python manifest (`pyproject.toml`,
    `requirements*.txt`, `Pipfile`) exists.
  - Root-level bookkeeping baseline — only for a `.dockerignore` next to a root-level/deploy
    Dockerfile (skip for `.devcontainer/`, which never `COPY`s application source). For each
    candidate in the skill's generic bookkeeping table (`.gitattributes`, `.gitignore`,
    `.gitlab-ci*.yml`, `.temp/`, `temp/`, `.logs/`, `logs/`, `.cache/`, `.devcontainer/`,
    `.editorconfig`, `.vscode/`, `documentation/`, `test/`, `README.md`/`readme.md`) **plus** this
    this project's own recurring conventions (`.claude/`, `.todos/`, `CLAUDE.md`),
    `Glob`/`Bash test` the project root and append only the ones that actually exist there — never
    add a line for a path this project doesn't have, that's the whole point of checking first.

  All three are mechanical: the secret list is a fixed constant, the dependency list is a direct
  lookup keyed off a manifest file that either exists or doesn't, and the bookkeeping list is a
  direct existence test per candidate path — no judgment call, unlike inventing the file's
  project-specific build-artifact excludes from scratch.

Not a match for this list — these need judgment or an external action, so they go to step 3
instead: digest-pinning a base image (needs a registry lookup, not just a text edit), creating a
`.dockerignore` **from scratch** where none exists (needs a real project-specific exclude list, not
a template — though it must still be seeded with both baselines above, secret-exclusion and
whichever dependency directories apply, not left for a later pass), a `HEALTHCHECK` (needs the
app's actual endpoint), non-root `USER` changes,
secret-handling rewrites (`ARG`/`ENV` secret → `--mount=type=secret` changes the build command
callers must pass, not just the Dockerfile), or anything from the agent's **Open questions**.

List the candidates found this run, then apply each with `Edit` — same as any other file edit in
this conversation, gated by the normal tool-approval prompt. State per file which fixes landed.

## 2. OCI labels — propose values, then write them

For every Dockerfile missing OCI labels, propose a full `LABEL` block covering these six, then
apply it the same way as step 1 (list the proposed values, then `Edit`):

| Label | Value |
| --- | --- |
| `org.opencontainers.image.title` | Derive from the image/service name — the directory name, the project's `CLAUDE.md`/README title, or a nearby manifest's `name` field. State what it was derived from. |
| `org.opencontainers.image.version` | Derive from a `VERSION` file, a manifest's `version` field, or the latest git tag reachable from the Dockerfile's directory. If none exists, propose `0.1.0` and say so explicitly rather than guessing silently. |
| `org.opencontainers.image.description` | One line, derived from the project's own README/`CLAUDE.md` description or the Dockerfile's own header comment if it has one. |
| `org.opencontainers.image.vendor` | Derive from git config user.name or `cavo789` — the blog's author. |
| `org.opencontainers.image.licenses` | Always `MIT` — this repo's LICENSE file. |
| `org.opencontainers.image.authors` | Always `cavo789@gmail.com` — fixed, not derived. |

Title/version/description are judgment calls — say what each was derived from so the user can
correct it in the same review pass; vendor/licenses/authors are constants, never ask about those.

## 3. Everything else → TODOs

File one TODO per remaining finding — every MUST/SHOULD violation not covered by step 1, every
anti-pattern match, and every **Open question** the agent raised. Load the **`todo-authoring`**
skill and follow it exactly (numbering, `NNNN-short-description.md`, the mandatory
`Priority`/`Batch`/`Depends`/`Files` header bullets) — do not improvise the format from memory. Use
a `Batch` key of `docker` unless the open backlog already has a more specific key for this
file/service (`grep -h '^- \*\*Batch\*\*:' .todos/*.md | sort -u` first — reuse rather than invent).
Skip anything already fixed in step 1 or 2, and skip the devcontainer pinning findings dropped above
entirely.

### Special case: read-only / tmpfs readiness findings

Never auto-applied — whether a given writable path wants a real `VOLUME` (state that must survive
a restart) or a `--tmpfs` mount (disposable scratch space) is a product judgment call the Dockerfile
alone doesn't settle, and adding a `VOLUME` does change the image (it's a real behavioral
declaration, not a mechanical rewrite). Write the TODO body as a concrete remediation plan, not a
restatement of the finding:

- List every writable path the agent flagged (known stateful base/package from the skill's
  Read-only / tmpfs compatibility table, an undeclared `RUN mkdir`/`RUN touch` path, a blanket
  `chmod -R 777`), each with the specific `docker run --read-only --tmpfs <path>` or `-v
  name:<path>` flag it needs.
- State the skill's own default for each: `VOLUME` for genuine state (database data directories),
  `--tmpfs` for scratch/cache (nginx's cache dir, PID files, language-runtime caches) — propose
  which applies per path rather than leaving it unstated.
- Carry forward the agent's open question about the application's own source verbatim (whether it
  writes to some path the Dockerfile can't see) — that part stays for the human to verify by
  actually running the image with `--read-only`, not something this TODO can resolve on paper.

After writing the TODOs, regenerate the plan:

```text
/todo-plan
```

Do not hand-edit `.todos/plan.md` — it is a regenerated projection. In the final report, point to
`.todos/plan.md` and quote the first prompt to run, alongside a summary of what steps 1 and 2
already fixed.
