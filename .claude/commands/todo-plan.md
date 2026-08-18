---
description: Regenerate .todos/plan.md — the prioritized, batched execution plan for the open TODO backlog.
argument-hint: "   (no arguments)"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# TODO Plan

Regenerate `.todos/plan.md`: a prioritized, batched reading of the **open** TODO backlog that answers
one question — *what should I hand to `/todo` next, and in what order?*

**Usage:** `/todo-plan` (no arguments)

## Core rule — plan.md is a projection, never a source

`plan.md` is **regenerated from scratch on every run** and overwritten. It holds no information of its
own: every fact in it comes from a TODO file. Consequences, all mandatory:

- **Never edit `plan.md` by hand** — the next run discards the edit.
- **Never edit a TODO file from this command.** If a TODO lacks metadata, infer it (rules below) and
  note the inference in the plan; do not "fix" the TODO. This command is read-only on `.todos/*.md`.
- **Never append.** A stale plan is worse than no plan: `/todo` moves files to `DONE/` and the plan
  must forget them, not accumulate them.

Run it after any `/todo` session, and at the end of every review that files new TODOs.

---

## Phase 1 — Collect the open backlog

**The flat backlog is the queue.** Rank and batch **only** flat `.todos/*.md`. Exclude, without
exception:

- the status subfolders (`DONE/`, `PARTIAL/`, `BLOCKED/`, `UNNEEDED/`, `POSTPONED/`) — `/todo`
  Phase 3 moves a TODO there precisely to take it out of the queue,
- `plan.md` itself,
- `000_*.md` backlog aggregates (e.g. the `/dry` backlog) — they are their own tracking system,
- `0000-*.md` progress journals (`0000-freshness-journal.md`, `0000-reader-review-journal.md`) —
  they are session logs maintained by `/freshness` and `/reader_review`, not tasks.

If the flat backlog is empty, write a `plan.md` saying so and stop.

**One read-only exception — `PARTIAL/`.** A `PARTIAL_NNN-*.md` was closed out with real work left
behind, documented under its `### Not done` bullets. That work is invisible everywhere else, so list
those files in a dedicated reminder section (Phase 4) — **ID, title, and link only**. Do **not** rank
them, batch them, or fold them into a lot: they are not `/todo`-addressable (`/todo NNN` globs
`.todos/NNN-*.md`, which no longer matches once the file moved). The section exists so the remainder
is visible, not so it is queued. Reviving one is a human decision: it means re-filing a fresh TODO
for the remainder.

Never read `DONE/` (348 files and growing) — it answers no question this command asks.

## Phase 2 — Parse metadata per TODO

Run the parser script once instead of opening each TODO file:

```bash
.claude/scripts/todo_parse_backlog.sh .todos
```

It scans every flat `.todos/*.md` (the same scope as Phase 1 — subfolders, `plan.md`, `000_*.md`
aggregate backlogs and `0000-*.md` journals are already excluded) and prints one record per TODO:

| Field | Meaning |
| --- | --- |
| `ID` / `TITLE` | from the first line, `# NNN — title` |
| `PRIORITY` | first word only, already lowercased (empty → `(missing)`) |
| `BATCH` | declared batch, empty if not declared |
| `DEPENDS` | declared depends, empty if none/absent |
| `FILES` | the raw `- **Files**:` bullet text, wrapped lines already joined onto one line |
| `FLAGS` | `missing-priority`, `missing-files`, `stale-status` (file contains `## Status` but is still in the flat backlog) |
| `LOCKED` | UTC timestamp if a `/todo` run currently holds this TODO (see `todo_lock.sh`), empty otherwise |

Do not open a TODO file yourself except to disambiguate a record the script flags or a `FILES` value
that looks like a brace glob or an ambiguous continuation (below). The plan reuses each TODO's title;
it does not re-summarize file content, so there is normally nothing else to read.

The script reports each field verbatim; the judgment below is still yours:

- **Priority** — the script already stripped any prose suffix (`Low — pedagogical gap` → `low`).
  Accepted: `critical` > `high` > `medium` > `low`. Anything else, or `(missing)` — treat as `medium`
  and flag the file under *Anomalies*.
- **Depends** — comma-separated `NNN` IDs. An ID that is not in the open backlog (already `DONE/`,
  or nonexistent) is a **satisfied or void** dependency: ignore it for ordering, but list it under
  *Anomalies* if the file does not exist at all.
- **Batch** — a short kebab-case subsystem key (`core`, `helpers`, `docker`, `devcontainer`, `docs`
  — adapt these to this project's own subsystems). When `BATCH` is empty, **infer** it from the
  longest common path prefix of `FILES`, reduced to a meaningful segment (`src/main.py` → `core`,
  `lib/utils.sh` → `lib`, `.devcontainer/...` → `devcontainer`, `Dockerfile` → `docker`). Mark every
  inferred batch with `~` in the plan so the reader knows it was guessed, not declared. Respect this
  project's own vendored/third-party carve-outs, if any (check CLAUDE.md or a README): a `FILES`
  entry that resolves only under a vendored/third-party directory is out of scope for this repo and
  should never be batched or lotted — flag it under *Anomalies* instead.
- **Files** — reduce every backtick-quoted path in `FILES` to its **immediate parent directory**
  (`lib/utils.sh` → `lib`, `main.py` → project root). That directory set is what Phase 3 intersects.
  Normalize first — each of these has been observed corrupting a lot:
  - **Brace globs**: `lib/{utils,config}.sh` expands to two files/directories. Left literal it
    matches nothing and the TODO wrongly looks isolated even though a sibling TODO really does touch
    one of the expanded paths.
  - **Relative continuations**: a `FILES` list often abbreviates siblings after the first full path
    (`lib/api.sh`, `db.sh`, `queue.sh`).
    Resolve such a fragment against the last full path's root; if that is ambiguous, drop it —
    never keep a bare filename as a directory, it collides with everything.
  - **Prose instead of paths**: `none yet, decision-only TODO`, `not yet scoped`. This is a
    **decision-only TODO**: an empty directory set, handled explicitly in Phase 3.
  When a path cannot be resolved confidently, drop it. A dropped path can only split a lot, never
  merge two unrelated ones — the safe direction (see Phase 3's conservative default).
- A record with `FLAGS: missing-priority` or `missing-files` is not a reason to stop: emit it under
  *Anomalies* with what could be read, and keep going.
- **`FLAGS: stale-status`** — a flat file closed out (`## Status — BLOCKED`/`PARTIAL`) but never moved
  to its status folder. Keep it **out of the lots** — ranking known-blocked work as the next thing to
  do is the one failure that discredits the whole plan — and report it under *Anomalies* so the
  author moves it.
- **`LOCKED` non-empty** — a `/todo` session already holds this TODO. Keep it **out of the lots and
  out of Standalone** — recommending it as "next to run" while another session is already running it
  is the same failure as ranking blocked work. List it in the dedicated *Currently in progress*
  section (Phase 4) instead, with the `LOCKED` timestamp.

## Phase 3 — Build the lots

A **lot** is a set of TODOs worth handing to a single `/todo` prompt, because they open the **same
files**. The win is one context load, one validation gate (this project's own lint/format/test
commands), one review pass.

**A shared theme is not a shared context.** This is the one rule that matters. Grouping, say, a
`makefile` build-arg fix with a `Dockerfile` base-image bump just because both are "about Docker" is
the trap: if they share **zero** files, the session pays for both contexts at once — every turn
re-sends the whole conversation, so the cost is quadratic in tool calls, not linear in final size.
A lot that does not save a context load is not a saving; it is a tax with a nice name.

So the batch key **proposes**, the file sets **decide**:

1. **Group by batch key**, then **split each group by actual file overlap.**
   - Two TODOs are *adjacent* when their normalized directory sets (Phase 2) intersect — a shared
     file, or a shared immediate parent directory.
   - A **lot is a connected component** under that relation. (Adjacency is transitive through a
     member: A–B and B–C makes one lot of three, even if A and C do not touch. B is the context
     they both load.)
   - Never merge across batch keys, even on a file overlap: the key is author intent about
     *subsystem*, and overriding it produces lots nobody asked for.
   - **Conservative default:** no demonstrable overlap → no lot. Splitting a lot that could have
     held costs one extra `/clear`; merging two that share nothing costs a whole quota's worth of
     re-sent context. Never lot on a hunch.
2. **A decision-only TODO is never lotted.** No `**Files**` (or prose like `none yet`) means no
   evidence of shared context — it goes to *Standalone*, whatever its batch key. This is not an
   anomaly: a decision-only TODO legitimately has no files yet. If it is ordered relative to another
   TODO ("settle the layout before filling it"), that belongs in `**Depends**`, not in a lot.
3. **Cap a lot at 5 TODOs.** A 15-TODO lot is not a prompt, it is a project: split it into themed
   sub-lots (`core-upload`, `core-csv-checks`, `core-ftp`) rather than emitting one unusable line.
4. **Split a lot when priorities diverge sharply.** A `critical` never waits behind a `low` that
   merely happens to touch the same file. Promote the critical into its own lot, first.
5. **Order inside a lot** topologically: a TODO comes after everything it depends on. Then by
   priority, then by ID.
6. **Order the lots** by their highest priority member (critical → high → medium → low), except that
   a cross-lot dependency always wins: the lot that is depended upon comes first. Break remaining
   ties by lot size, larger first — bigger context payoff.
7. **A cycle in `Depends`** (A→B→A) is an authoring bug: keep both, order by priority, report the
   cycle under *Anomalies*.
8. **A TODO left alone** — the only one in its batch, or isolated by rules 1-2 — is not a lot: it
   goes to the *Standalone* section. A one-TODO session is the normal case, not a failure.

**Every lot must name the path its members share.** Phase 4's *Why grouped* has to cite the actual
shared directory, because that sentence is the only thing a reader can audit before spending a
session on the lot. If the honest justification is "both are about X" with no path in it, rule 1
already told you: that is not a lot. Batching is now mechanical — file sets decide it. Judgment
belongs to `/todo` Phase 0 (is this TODO *right*?), not here. The plan does **not** assess
readiness, correctness, or effort in hours.

## Phase 4 — Write `.todos/plan.md`

Overwrite the file in whatever language this project's own documentation uses (check CLAUDE.md/
README for a stated convention; English is the safe default absent one). The Phase 5 chat summary
stays in French regardless — that's a personal preference for talking with Claude, not a project
rule. Structure:

````markdown
# TODO execution plan

> Generated by `/todo-plan` on YYYY-MM-DD — **do not edit by hand**, this file is regenerated from
> `.todos/*.md` on every run. Priority and batching live in the TODO files themselves.
>
> Open TODOs: N — Critical: n · High: n · Medium: n · Low: n · Locked: n
> Batches marked `~` were inferred from `**Files**`, not declared.
> Lots require a shared path, never a shared theme — each lot names the directory its members
> share. A standalone TODO is the normal case: run it in its own session, `/clear` between.

## Recommended order

| # | Lot | Priority | TODOs | Prompt |
|---|-----|----------|-------|--------|
| 1 | lib | High | 2 | `/todo 012 014` |
| 2 | docker ~ | Medium | 2 | `/todo 021 022` |

## Lots

### 1. lib — High

**Shared context:** `lib/validation.py` — both.

**Why grouped:** 014 adds a new date-normalization helper; 012 calls it from the row validator.
Splitting them would load `lib/validation.py` twice.

**Prompt:** `/todo 012 014`

| Order | ID | Priority | Title | Depends |
|-------|----|----------|-------|---------|
| 1 | 014 | High | Add a date-normalization helper to `lib/validation.py` | — |
| 2 | 012 | High | Use the new date helper in row validation | 014 |

*(one such block per lot, in recommended order)*

## Standalone

One `/todo NNN` each, in its own session — highest priority first. These share no files with a
sibling (or declare none yet), so there is nothing for a lot to save.

| ID | Priority | Title | Batch | Why not lotted |
|----|----------|-------|-------|----------------|
| 030 | High | Fix chmod on `.env` inside `Dockerfile` | docker ~ | no path shared with a batch sibling |
| 009 | Medium | Document the retry-policy edge case | docs | decision-only, no `**Files**` yet |

## Currently in progress

Locked by a running `/todo` session (see `/todo`'s own "Locking" section for the mechanism). **Not
queued**: don't recommend these, another session already has them. If the timestamp looks stale (the
owning session likely crashed), that's a call for the human — this plan only reports the fact.

| ID | Title | Locked since |
|----|-------|--------------|
| 555 | Example locked TODO | 2026-08-07T09:47:08Z |

*(omit this section entirely when no flat TODO is locked)*

## Partially done — remaining work

Closed out as `PARTIAL`, with work documented under their `### Not done` bullets. **Not queued**:
`/todo NNN` no longer reaches them. Listed so the remainder stays visible — reviving one means
filing a fresh TODO for what is left.

| ID | Title | File |
|----|-------|------|
| 007 | Inspect baseline format | [PARTIAL_007-inspect.md](PARTIAL/PARTIAL_007-inspect.md) |

*(omit this section entirely when `PARTIAL/` is empty)*

## Anomalies

Authoring issues found while parsing. Fix them in the TODO files, then rerun `/todo-plan`.

- `4xx-...md`: unparseable priority `Urgent` — treated as Medium.
- `4xx-...md`: depends on 999, which does not exist.
- `4xx-...md`: carries a `## Status — BLOCKED` section but sits in the flat backlog — it is being
  ranked as actionable work. Move it to `BLOCKED/` (see `/todo` Phase 3).

*(omit this section entirely when empty)*
````

## Phase 5 — Report

Respond in **French**, compact. State: how many open TODOs, how many lots, the first three prompts to
run, how many are currently locked (if any), and any anomaly that needs an author fix. Do not paste
the plan into the chat — link it as [.todos/plan.md](.todos/plan.md).

---

## Notes

- Cheap by design: one script call replaces N file reads, no source inspection, no test runs. Run it
  in its own session, after a `/clear` — it needs TODO headers, not the implementation history of the
  `/todo` run that preceded it.
- **The plan spends the user's quota.** Each prompt it emits becomes a session, and every turn of
  that session re-sends the whole conversation — so a lot that does not genuinely share files makes
  the reader pay for two contexts at once. That is why Phase 3 demands a shared path and defaults to
  splitting. Fewer, honest lots beat a tidy-looking grouping.
- Complements manual TODO authoring (e.g. after a code review, an incident, or a `pre-commit`
  finding you don't want to fix on the spot) and `/todo` (which consumes them). It sits between the
  two and holds no state.
