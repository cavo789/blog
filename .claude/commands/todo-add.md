---
description: Capture a new task into the .todos/ backlog as one well-formed NNNN-slug.md file
argument-hint: <short task description>
allowed-tools: Bash(ls*), Bash(find*), Bash(.claude/scripts/todo_next_id.sh*), Read, Write
---

# Add a TODO to the backlog

Capture the task described in **$ARGUMENTS** as a single, well-formed backlog file.
Do NOT implement anything — this only creates the entry. The header bullets below follow the
**`todo-authoring`** skill's contract — load it if any field's meaning is unclear (e.g. what counts
as a valid `Depends` value).

## Procedure

1. **Resolve the description.**
   - If `$ARGUMENTS` is empty, ask the user for a one-line task description and stop
     until you have it.
   - Derive a concise Title (imperative, ≤ ~10 words) and a kebab-case `slug`
     (lowercase, alphanumerics + dashes, no leading article, ≤ ~6 words).

2. **Locate the backlog.**
   - Use `.todos/` at the repository root. If it doesn't exist, create it.

3. **Dedupe (cheap guard).**
   - List existing `.todos/*.md` and read their Titles (first `# ` heading).
   - If the new task clearly duplicates an existing entry, STOP and tell the user
     which file already covers it — don't create a second one.

4. **Compute the next ID.**
   - Run `.claude/scripts/todo_next_id.sh .todos` — it scans every `.todos/*.md`
     file (including status subfolders and any numeric-prefixed name like
     `000_...`) and prints `max + 1`, zero-padded to 4 digits (`NNNN`). Never
     compute this by hand, and never reuse an existing ID. (Legacy 3-digit IDs
     from before this width change stay as they are — never rename them.)

5. **Write `.todos/NNNN-<slug>.md`** with the skeleton below. The filename is an
   **identity**: never encode priority, status, or batch in it.

   ```markdown
   # NNNN — <Title>

   - **Priority**: medium
   - **Batch**: unassigned
   - **Depends**: —
   - **Files**: TBD

   ## Context

   <1–3 sentences: what and why, drawn from the description and the current conversation.>

   ## Acceptance

   - [ ] <concrete, verifiable outcome>
   ```

   Fill Context/Acceptance from `$ARGUMENTS` and the conversation. Leave
   `Priority` / `Batch` / `Depends` / `Files` at their defaults for the user to
   adjust — these header bullets are what `/todo-plan` parses.

6. **Report and hand off.**
   - Print the created path and the Title.
   - Remind the user that `.todos/plan.md` is a generated projection — run
     `/todo-plan` to regenerate it. Offer to run it now.
