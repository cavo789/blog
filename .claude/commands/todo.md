---
description: Process one or more TODO files from .todos/ by number (readiness → implement → close out).
argument-hint: "<NNN> [NNN...]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# TODOs

Process one or more TODO files from `.todos/` by TODO number.

**Usage:** `/todo 0133 0134 0135`

**Arguments:** one or more numeric TODO IDs only. IDs are matched by value, not by digit
width — a legacy 3-digit ID (`031`) and a current 4-digit one (`0637`) both resolve fine,
so type the number exactly as it appears in the filename you're targeting.

## Argument validation — MANDATORY

Read `$ARGUMENTS`.

If `$ARGUMENTS` is empty, or contains anything other than space-separated numbers, stop immediately and respond:

```text
Usage: /todo <number> [number...]
Example: /todo 0133 0134 0135
```

Do not continue.

Parse `$ARGUMENTS` as a list of TODO numbers.

For each number `NNN`:

1. Find exactly one file matching:

   ```bash
   .todos/NNN-*.md
   ```

2. If no file matches, mark that number as not ready:

   `No TODO file found matching .todos/NNN-*.md`

   Before giving up, check the status subfolders (`DONE/`, `PARTIAL/`, `BLOCKED/`, `UNNEEDED/`): if
   the number already exists there, report its current status instead of treating it as missing
   (e.g. "Already DONE: .todos/DONE/DONE_NNN-*.md").

3. If more than one file matches, mark that number as not ready:

   `Multiple TODO files found matching .todos/NNN-*.md`

4. Check whether the TODO is locked by another session:

   ```bash
   .claude/scripts/todo_lock.sh check .todos NNN
   ```

   Exit `1` means another `/todo` run already holds it — mark that number as not ready:

   `Locked: already being processed (since <timestamp from the script's output>) — likely
   another /todo session running concurrently. If that session crashed and this lock is
   stale, delete .todos/.locks/<NNN>/ and re-run.`

   See "Locking" below for the full mechanism.

5. Build the resolved TODO file list in the same order as the numbers provided.

If any number cannot be resolved to exactly one file, output a readiness report and stop. Do not implement anything.

From this point onward, "each TODO file" means each resolved file from the numeric arguments.

## Locking — two sessions can't process the same TODO at once

`.todos/.locks/<value>/` (keyed by numeric value, so `055` and `0055` collide the same way file
resolution already does) is an advisory lock held for the duration this command actually works on a
TODO. It exists because two Claude Code sessions commonly share the same checked-out `.todos/` (two
terminals in the same devcontainer) — without it, a typo'd or overlapping `/todo` invocation in a
second session can start implementing a file another session is mid-way through.

- **Checked** in Argument validation step 4, above — a locked number is reported not-ready, same as
  a missing or ambiguous one; nothing is implemented.
- **Acquired** for every resolved file right after Phase 1 passes for **all** of them (not one at a
  time during resolution — a lock is only taken once this run has actually committed to
  implementing).
- **Released** as the first action of whichever Phase 3 branch closes out that file — DONE, PARTIAL,
  or BLOCKED all release it; a TODO stops being "in progress" the moment this run stops touching it,
  regardless of outcome.
- **Stale locks** (the owning session crashed or was killed before Phase 3) don't self-expire —
  delete `.todos/.locks/<value>/` by hand once you've confirmed no session actually holds it.
- `.todos/.locks/` is session-local, ephemeral state, not backlog content — add it to the project's
  `.gitignore` (`.todos/.locks/`) so it never gets committed.

---

## Phase 0 — Challenge the TODO relevance

For each file, critically assess whether the TODO is still relevant and not already covered by existing features, recent changes, or other TODOs. If redundant, obsolete, or superseded, flag it immediately in the readiness report with a note like:
"Obsolete: already covered by [feature X]"
or
"Redundant: superseded by [TODO Y]".
Only proceed if the TODO adds genuine, non-duplicative value.

## Phase 1 — Readiness check (MANDATORY, run before any work)

For each file passed in `$ARGUMENTS`:

1. Read the file in full.
2. Evaluate whether you have enough context to act on it *right now*, without asking follow-up
   questions mid-task. Consider:
   - Is the required code already in the repo?
   - Are there ambiguous acceptance criteria?
   - Does it depend on external systems, credentials, or data you cannot access?
   - Is the scope clear enough to judge "done" vs "partial"?
   - **Does the TODO name concrete files or a concrete scope?** A well-formed TODO carries a
     `Files:` header bullet (see the backlog conventions) and, ideally, an `Explicit NON-goals`
     section. If neither is present and the target files are not otherwise unambiguous from the
     body, mark the file **NOT ready**: the missing scope would force blind tree-walking during
     implementation. Blocker note: `No Files: section and scope not derivable — needs the target
     files listed before this can be processed autonomously.`

3. Produce a **readiness report** — one row per file:

   | File | Ready? | Blockers / open questions |
   |------|--------|---------------------------|
   | 031-sqlite.md | ✓ | — |
   | 007-inspect.md | ✗ | Need to know which baseline format is expected |

4. **If any file is NOT ready:** stop here. Ask the user to clarify the blockers before proceeding.
   Do not start implementation.

5. **If all files are ready:** acquire the lock for every resolved file before touching any of them:

   ```bash
   .claude/scripts/todo_lock.sh acquire .todos NNN
   ```

   Exit `1` here means another session grabbed it in the gap between the Argument-validation check
   and now (rare, but the check-then-acquire window is real) — drop that file from this run, report
   it the same way as a pre-existing lock, and continue with the rest. Once every remaining file is
   locked, state "All TODOs are actionable — starting autonomous processing." then continue to
   Phase 2 without interrupting the user.

---

## Phase 2 — Implementation

For each TODO file (process them in the order given):

1. **Treat the TODO's `Files:` header and `Explicit NON-goals` section as the exploration
   boundary.** Start from the listed files; if this project keeps a module-map or architecture
   reference doc (check its CLAUDE.md/README for one), consult it first instead of grepping the
   tree. Do not fan out into unrelated modules, and respect this project's own vendored/third-party
   carve-outs, if any (check CLAUDE.md or a README for what's out of scope — changes to vendored
   code belong upstream, not here). Widen scope beyond the listed files only when implementation
   reveals a concrete, named dependency the TODO missed — and note that deviation in the outcome.
2. Implement everything described in the TODO using this project's own conventions — check its
   CLAUDE.md, contributing guide, or existing code for style, error-handling, and documentation
   conventions, and follow them exactly rather than defaulting to generic style.
3. Verify with **targeted tests only**: run just the test(s) covering the touched code, using this
   project's own test runner, never the full suite. The full suite is usually expensive to run and
   parse — reserve it for the user, per the Phase 6 reminder. If the change is broad enough that no
   single targeted test covers it, run the couple of most relevant ones and say so plainly in the
   Phase 4 summary rather than falling back to a full run.
4. Keep track of what was done and what could not be done (and why).

---

## Phase 3 — Close out each TODO

After finishing work on a file, release its lock first — the outcome below doesn't change this:

```bash
.claude/scripts/todo_lock.sh release .todos NNN
```

Then apply exactly one of the following outcomes:

### Fully handled → rename with `DONE_` prefix

- Rename: `.todos/NNN-name.md` → `.todos/DONE/DONE_NNN-name.md`
- Do **not** modify the file content.
- Run: `git mv .todos/NNN-name.md .todos/DONE/DONE_NNN-name.md`

### Partially handled → rename with `PARTIAL_` prefix and update content

- Rename: `.todos/NNN-name.md` → `.todos/PARTIAL/PARTIAL_NNN-name.md`
- Run: `git mv .todos/NNN-name.md .todos/PARTIAL/PARTIAL_NNN-name.md`
- Then **edit** `.todos/PARTIAL/PARTIAL_NNN-name.md`: append a `## Status` section at the bottom of
  the file with this exact structure:

  ```markdown
  ## Status — PARTIAL (YYYY-MM-DD)

  ### Done
  - <bullet per completed item>

  ### Not done
  - <bullet per remaining item>
    **Reason:** <concise explanation — missing data / out of scope / blocked by X>
  ```

  Be precise and honest. A future reader must be able to pick up the remaining work without
  context from this conversation.

### Nothing could be done → rename with `BLOCKED_` prefix and update content

- Rename: `.todos/NNN-name.md` → `.todos/BLOCKED/BLOCKED_NNN-name.md`
- Run: `git mv .todos/NNN-name.md .todos/BLOCKED/BLOCKED_NNN-name.md`
- Then **edit** `.todos/BLOCKED/BLOCKED_NNN-name.md`: append a `## Status` section:

  ```markdown
  ## Status — BLOCKED (YYYY-MM-DD)

  ### Not done
  - All items remain open.
    **Reason:** <explanation — what unblocks it, and who/what is needed>
  ```

  The move out of the flat backlog is **mandatory**, not cosmetic: `/todo-plan` ranks every flat
  `.todos/*.md` as actionable work. A blocked TODO left in place is re-proposed as the next thing to
  do on every plan regeneration, forever.

---

## Phase 4 — Final summary

After all files are processed, output a compact summary table:

| File | Outcome | Notes |
|------|---------|-------|
| DONE_031-sqlite.md | ✓ Done | — |
| PARTIAL_007-inspect.md | ~ Partial | `--debt` flag deferred: needs baseline API |

Then run this project's own lint/type/format gate — the exact commands live in its `CLAUDE.md` or contributing guide
(a linter, a type-checker, a formatter). If the project routes all of them through `pre-commit`,
`pre-commit run --all-files` covers it; otherwise run them as documented.

Report pass/fail inline; fix before declaring done.

## Phase 5 — Refresh the execution plan (MANDATORY)

Every outcome in Phase 3 moves a file out of the flat backlog, so `.todos/plan.md` is now stale: it
still lists the TODOs you just closed, and its batching no longer reflects what remains. Regenerate
it (see `todo-plan.md`):

```text
/todo-plan
```

Run this **even when every TODO came out `PARTIAL` or `BLOCKED`** — those moved too. Do not hand-edit
`plan.md` to strike out the processed lines: it is a regenerated projection, and a manual edit is
both discarded on the next run and a chance to get the remaining batching wrong. Regeneration is the
only supported update path.

## Phase 6 — Commit-hygiene reminder (MANDATORY, always output)

Processing a TODO can touch many files; stacking several `/todo` runs without committing between them
is how an unreviewable 40-file working tree happens (and the commit-reminder extension only nags once
the count is already large). Before ending the session, always output this reminder verbatim — even
when only one TODO ran, and even when everything came out `PARTIAL`/`BLOCKED`:

```text
⚠ Commit checkpoint — before starting the next TODO:
  1. Run the full test suite yourself (only targeted tests were run above)
  2. Review the diff:  git status  then  git diff
  3. Stage what belongs together:  git add -p  (group by intent, not "add all")
  4. Commit now, per TODO — do not batch several TODOs into one commit.
     Small, reviewable commits keep the diff legible and the history bisectable.
```

Count the files currently touched (`git status --porcelain | wc -l`) and, if it is already large,
say so explicitly in the closing message ("N files uncommitted — commit before the next TODO").

Close by pointing at [.todos/plan.md](.todos/plan.md) with the next prompt to run.
