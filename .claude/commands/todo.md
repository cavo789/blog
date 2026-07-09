---
description: Process one or more TODO files from .todos/ by number (readiness → implement → close out).
argument-hint: "<NNN> [NNN...]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# TODOs

Process one or more TODO files from `.todos/` by TODO number.

**Usage:** `/todo 031 133 134 135`

**Arguments:** one or more numeric TODO IDs only.

## Argument validation — MANDATORY

Read `$ARGUMENTS`.

If `$ARGUMENTS` is empty, or contains anything other than space-separated numbers, stop immediately and respond:

```text
Usage: /todo <number> [number...]
Example: /todo 031 133 134 135
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

4. Build the resolved TODO file list in the same order as the numbers provided.

If any number cannot be resolved to exactly one file, output a readiness report and stop. Do not implement anything.

From this point onward, "each TODO file" means each resolved file from the numeric arguments.

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

3. Produce a **readiness report** — one row per file:

   | File | Ready? | Blockers / open questions |
   |------|--------|---------------------------|
   | 031-sqlite.md | ✓ | — |
   | 007-inspect.md | ✗ | Need to know which baseline format is expected |

4. **If any file is NOT ready:** stop here. Ask the user to clarify the blockers before proceeding.
   Do not start implementation.

5. **If all files are ready:** state "All TODOs are actionable — starting autonomous processing."
   then continue to Phase 2 without interrupting the user.

---

## Phase 2 — Implementation

For each TODO file (process them in the order given):

1. Implement everything described in the TODO using the normal project conventions (CLAUDE.md rules
   apply: ruff + mypy must pass if Python files are touched, 200-line limit, etc.).
2. Keep track of what was done and what could not be done (and why).

---

## Phase 3 — Close out each TODO

After finishing work on a file, apply exactly one of the following outcomes:

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

### Nothing could be done → keep original name, append status section

- Do **not** rename the file.
- Append a `## Status` section:

  ```markdown
  ## Status — BLOCKED (YYYY-MM-DD)

  ### Not done
  - All items remain open.
    **Reason:** <explanation>
  ```

---

## Phase 4 — Final summary

After all files are processed, output a compact summary table:

| File | Outcome | Notes |
|------|---------|-------|
| DONE_031-sqlite.md | ✓ Done | — |
| PARTIAL_007-inspect.md | ~ Partial | `--debt` flag deferred: needs baseline API |

Then run the lint gate if any Python files were modified:

```bash
ruff check src/caf/ && ruff format --check src/caf/ && mypy --strict src/caf/
```

Report pass/fail inline. Fix any violations before declaring the task complete.
