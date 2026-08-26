---
description: Pick one or more unwritten ideas from .todos/0000-suggestions-articles-a-publier.md and draft them as .unpublished/ posts
argument-hint: "[optional keyword to pre-filter the list]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, WebFetch, Skill, AskUserQuestion
---

# Write an article from the suggestions backlog

Turn one or more still-open ideas from `.todos/0000-suggestions-articles-a-publier.md` into real
drafts under `.unpublished/`. This is the "implement" half of the suggestions workflow —
`/suggestions-add` only records ideas, this command writes them.

**Usage:** `/suggestions-write` (browse everything open) or `/suggestions-write <keyword>` (pre-filter).

## Procedure

### 1. Load the candidate list

- Read `.todos/0000-suggestions-articles-a-publier.md`.
- Collect every `### [ ]` heading (unchecked = not yet written). Skip `### [x]` headings — already
  drafted.
- If the file has zero `[ ]` headings, report that the backlog is empty and stop.
- If `$ARGUMENTS` is non-empty, narrow the list to headings whose title or body matches it
  (case-insensitive); if nothing matches, say so and fall back to the full list.

### 2. Ask which one(s) to write

Use `AskUserQuestion` with the candidate titles as options (`multiSelect: true` — this is a genuine
case where the user picks a subset from a list only they can prioritize, not a research question you
could resolve yourself). Show enough of each idea's first bullet as the option description that the
user can decide without re-opening the file.

If the user picks none (cancels), stop without changing anything.

### 3. For each selected idea, in order

1. **Re-verify it's not a duplicate** — the entry was checked when added, but time may have passed
   (another draft may have been written since). Quick `grep -rliI` across `blog/` and `.unpublished/`
   for the topic's keywords. If it's now covered, skip it, mark it `[x]` anyway with a note pointing
   to what covers it, and move to the next selection.

2. **Load the `blog-post-structure` skill** (via the `Skill` tool) before writing a single line —
   this is mandatory per this project's `CLAUDE.md`, not optional groundwork. Also check the
   project's writing-style and components conventions (this session's own memory, or
   `AGENTS.md`/`CLAUDE.md` if memory isn't loaded) for: banner image pool (`static/img/v2/`), valid
   tags (`blog/tags.yml`), valid authors (`blog/authors.yml`), and which existing components apply
   (`AlertBox`, `Terminal`, `Snippet`, `StepsCard`, ...).

3. **Verify factual claims before writing them down** — tool versions, CLI flags, download URLs.
   Use `WebFetch` against the tool's real docs/repo rather than writing from training-data memory;
   this project's own history has caught stale claims before (e.g. a wrong config path, an EOL'd
   tool) — don't repeat that. If something can't be verified, say so explicitly in the draft rather
   than presenting a guess as fact.

4. **Derive a slug** (kebab-case, matching the blog's naming pattern) and **write
   `.unpublished/<slug>/index.md`** — full frontmatter (`draft: true`, `slug`, `title`, `description`,
   `tags`, `mainTag`, ...) plus a complete first-pass article body following `blog-post-structure`
   (result before installation, code before the first half stays light, deep-dives marked optional).
   Add supporting `files/`/`images/` subfolders only if the draft actually references them.

5. **Mark the idea done** — edit its heading in
   `.todos/0000-suggestions-articles-a-publier.md` from `### [ ]` to `### [x]`, and append one line
   under it: `**Draft written:** .unpublished/<slug>/index.md (YYYY-MM-DD)`. Leave every other
   heading untouched — this is a targeted edit, not a rewrite of the file.

### 4. Report

- One line per selection: written (with path) or skipped (with why).
- Remind the user that `.unpublished/plan.md` should stay in sync with new drafts (per this
  project's own convention) — offer to update it.
- Do not touch `.todos/plan.md` or run `/todo-plan` — this backlog file is intentionally excluded
  from that flow.
