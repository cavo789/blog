---
description: Analyze a Docker image's actual byte breakdown with dive, auto-fix mechanical waste (unmerged cache-purge layers, missing no-cache flags), propose heavy-tool-for-narrow-need swaps for joint review, and file TODOs for the rest
argument-hint: "[Dockerfile path or image tag] (optional — auto-discovers the project's main Dockerfile)"
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Docker dive optimization

Load the `docker-image-slimming` skill first — it defines how to fetch `dive` without touching the
system, how to run it non-interactively (`-j`/`--json`, no TUI), the verified JSON schema, and the
three-bucket classification (auto-fix / propose / TODO) this command drives. Don't duplicate that
reasoning here — this file only adds project discovery, the build step, and the reporting/TODO
wiring.

## 1. Discover the target(s)

**With `$ARGUMENTS`**:

- If it looks like an image tag (contains `:` or resolves via `docker image inspect`), analyze that
  tag directly without building.
- If it's a file path, use it directly.
- Otherwise treat it as a glob and search for matching Dockerfile-shaped filenames.

**Without `$ARGUMENTS`** (auto-discovery):

1. Look for a `docker-compose.yml` or `compose.yaml` at the project root. If found, list the
   services and their `build:` contexts to identify the main application image.
2. If no compose file, look for a `Dockerfile` at the project root.
3. Skip Dockerfiles that live under example, sample, tutorial, or documentation directories
   (e.g., `examples/`, `docs/`, `blog/`, `.unpublished/`, `samples/`) unless explicitly passed as
   an argument — these are illustration files, not images to optimize.
4. If multiple candidates remain after filtering, list them and ask the user to pick one.

State which target was selected before moving on.

## 2. Build the image

**If a compose file was found**: use the compose command to build the target service:

```bash
docker compose build <service-name>
```

**Otherwise**, fall back to a direct build:

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

## 6. Bucket C — Document remaining findings

List every remaining finding as a numbered item: the layer size, the `command` that caused it, and
a one-line description of why it can't be fixed automatically. Do not touch the Dockerfile for any
of these.

Track them in whatever backlog system the project uses — a GitHub issue, a comment in the
Dockerfile itself, a plain text file, or the team's task tracker. The only requirement is that they
don't get lost.

In the final report, give the size/efficiency before vs. after from step 4, list the items awaiting
a decision from step 5, and list the Bucket C items with enough context for a future session to pick
them up without re-running dive.
