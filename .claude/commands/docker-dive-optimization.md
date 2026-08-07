---
description: Analyze a Docker image's actual byte breakdown with dive, auto-fix mechanical waste (unmerged cache-purge layers, missing no-cache flags), propose heavy-tool-for-narrow-need swaps for joint review, and file TODOs for the rest
argument-hint: "[Dockerfile path or image tag] (optional — defaults to the project's own /opt/docusaurus/Dockerfile)"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Docker dive optimization

Load the `docker-image-slimming` skill first — it defines how to fetch `dive` without touching the
system, how to run it non-interactively (`-j`/`--json`, no TUI), the verified JSON schema, and the
three-bucket classification (auto-fix / propose / TODO) this command drives. Don't duplicate that
reasoning here — this file only adds project discovery, the build step, and the reporting/TODO
wiring.

## 1. Discover the target(s)

**This project context**: the repository is a Docusaurus blog. It contains many Dockerfiles under
`blog/` and `.unpublished/` — these are **article example files**, not images to optimize. Do NOT
target them unless the user explicitly passes their path.

**Default target** (no `$ARGUMENTS`): the project's own Dockerfile at `Dockerfile` (root of the
repo). That is the only image that actually runs this project.

**With `$ARGUMENTS`**:

- If it looks like an image tag (contains `:` or resolves via `docker image inspect`), analyze that
  tag directly without building.
- If it's a file path, use it directly.
- Otherwise treat it as a glob and search for matching Dockerfile-shaped filenames.

State which target was selected before moving on.

## 2. Build the image

For the project Dockerfile (`Dockerfile` at repo root), the canonical build command is:

```bash
docker compose build docusaurus
```

This uses `compose.yaml` at the repo root, which passes the real build args (`APP_HOME`,
`OS_USERID`, `OS_GROUPID`, build target) and produces the tagged image `blog-docusaurus:development`.
Prefer this over a bare `docker build` — it matches what CI and the devcontainer actually ship.

If the user passed a custom Dockerfile path that isn't covered by `compose.yaml`, fall back to:

```bash
docker build -q -f <Dockerfile> -t dive-optimize/<basename>:local <context-dir>
```

State which command was used and the resulting image tag before running dive.

## 3. Run dive, classify

Per the skill: fetch/verify the `dive` binary into the scratch directory if not already on `PATH`,
run `dive <tag> -j <scratch>/dive-<basename>.json`, then classify every finding into Bucket
A/B/C. Report, before doing anything else: current `image.sizeBytes` and `image.efficiencyScore`, and
the count of findings per bucket.

## 4. Bucket A — apply now

Apply every Bucket A finding with `Edit`, same as any other file edit in this conversation — gated by
the normal tool-approval prompt. List each merge/flag added with its file:line.

Then **rebuild and re-run dive** to confirm the fix actually worked (the skill's "verify the fix"
step) — report `image.sizeBytes` and `image.efficiencyScore` before vs. after. If a Bucket A edit
didn't measurably help, say so plainly rather than reporting success on the edit alone.

## 5. Bucket B — propose, wait

Present every Bucket B finding as a numbered list: dive's evidence (layer size, % of image,
`command`), what it appears to be there for, and a concrete alternative with its own trade-off (a
standalone binary instead of a full runtime, a discarded builder stage, a slimmer base image). Stop
here and wait for a decision on each item — do not touch the Dockerfile for any of these without an
explicit go-ahead, even for the ones that look obviously right. If the user greenlights one, apply it
with `Edit`, then rebuild + re-run dive the same way as step 4 to confirm the win.

## 6. Bucket C — TODOs

File one TODO per remaining finding. Load the **`todo-authoring`** skill and follow it exactly
(numbering via `todo_next_id.sh`, `NNNN-short-description.md`, the mandatory
`Priority`/`Batch`/`Depends`/`Files` header bullets) — do not improvise the format from memory. Use a
`Batch` key of `docker` unless the open backlog already has a more specific key for this
file/service (`grep -h '^- \*\*Batch\*\*:' .todos/*.md | sort -u` first — reuse rather than invent).

After writing the TODOs, regenerate the plan:

```text
/todo-plan
```

Do not hand-edit `.todos/plan.md` — it is a regenerated projection. In the final report, give the
size/efficiency before vs. after from step 4, list what's awaiting a decision from step 5, and point
to `.todos/plan.md` for step 6.
