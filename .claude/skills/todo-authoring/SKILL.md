---
name: todo-authoring
description: Shared contract for filing a TODO into a project's `.todos/` backlog — ID numbering via `todo_next_id.sh`, the `NNNN-short-description.md` filename convention, the anti-duplication check, and the mandatory `Priority`/`Batch`/`Depends`/`Files` header bullets that `/todo-plan` parses. Every command or skill that files TODOs (`deep-code-review`, `focused-code-review`, `ux-onboarding-review`, `reader-first-docs`, `/docker-review`, `/todo-add`, …) loads this instead of restating it. Internal methodology — not invoked directly by a user.
disable-model-invocation: false
---

# TODO Authoring — shared contract

Generic across every command or skill that files work into `.todos/`. This skill owns only the
**mechanics** of a well-formed TODO — numbering, naming, header bullets, dedup. It does not decide
*which* findings deserve a TODO or how many (exhaustive for `deep-code-review`, selective for
`focused-code-review`/`reader-first-docs`/`ux-onboarding-review`) — that judgment call belongs to the
calling command/skill. Load this skill before writing any TODO file; do not restate its rules inline
in a command — a paraphrase drifts from the real contract and from what `/todo-plan`'s parser
actually expects.

File one TODO per item, flat under `.todos/`.

- **Numbering** — run `.claude/scripts/todo_next_id.sh .todos` to
  get the next ID; it scans `.todos/` and all its subfolders, ignores status prefixes (`DONE_`,
  `PARTIAL_`, …), and prints `max + 1` zero-padded to 4 digits. Never compute this by hand, and never
  reuse or collide with an ID that exists anywhere, including under status subfolders. **Filing
  several items in one run:** call the script again before each new file — every TODO you already
  wrote this run is now on disk and must count toward the next scan; do not batch-compute one ID and
  increment it locally.
- **Naming** — `NNNN-short-description.md`, description in English. The filename carries the ID and
  subject only — never encode priority, status, or batch (those change; the filename is a stable
  identity that other TODOs, commits, and notes point at).
- **Anti-duplication** — before writing, confirm no existing item (any folder) already covers it; if
  related, reference it and say whether to extend or chain rather than duplicate.

Every TODO opens with `# NNNN — title`, then a bullet header the plan generator (`/todo-plan`) parses.
The first four fields are mandatory and machine-readable:

```markdown
# 0447 — AI create tree walks unpruned: the file cap miscounts

- **Priority**: High
- **Batch**: ai-create
- **Depends**: 0445
- **Files**: `path/to/file_a.py`, `path/to/file_b.py`
- **Horizon**: <free-text rationale, optional>
```

- **Priority** — `Critical` | `High` | `Medium` | `Low`, first word only; a prose suffix after an em
  dash is allowed and ignored by the parser.
- **Batch** — short kebab-case subsystem key shared by every TODO fixed in the same session (same
  module, same fix pattern). **Reuse an existing key when one fits** — read the open backlog for the
  vocabulary, do not invent from memory:

  ```bash
  grep -h '^- \*\*Batch\*\*:' .todos/*.md | sed -E 's/^- \*\*Batch\*\*:[[:space:]]*//' | sort | uniq -c | sort -rn
  ```

  Keys name a **subsystem**, not a symptom. Invent a new key only when nothing covers the files you
  touch; a one-member key is fine.
- **Depends** — comma-separated bare `NNNN` IDs that must be implemented first, or `—` for none.
  Only real ordering constraints; "related to" belongs elsewhere. **Plain numeric IDs only** — never
  a `[[wikilink]]` or a full `NNNN-slug.md` filename: `todo_parse_backlog.sh` and `/todo-plan` match
  digits, so anything else silently drops the dependency instead of erroring.
- **Files** — backtick-quoted paths touched by the fix, comma-separated. `TBD` only when the TODO is
  genuinely decision-only (no files identified yet).

A caller may add its own extra mandatory fields on top of these four (e.g. `ux-onboarding-review`'s
`Horizon`) — say so explicitly in that skill rather than leaving it implicit.

After writing the TODOs, regenerate the execution plan with `/todo-plan` (it parses these bullets).
Do not hand-edit `.todos/plan.md` — it is a regenerated projection. In the report, point to
`.todos/plan.md` and quote the first prompt to run.
