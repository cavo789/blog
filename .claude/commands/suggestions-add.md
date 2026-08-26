---
description: Capture a new article idea into the .todos/0000-suggestions-articles-a-publier.md backlog
argument-hint: <topic description>
allowed-tools: Bash(grep*), Bash(find*), Read, Edit, Write
---

# Add an article suggestion

Capture the idea described in **$ARGUMENTS** as one new entry in
`.todos/0000-suggestions-articles-a-publier.md`. Do NOT write any article content or create a draft
— this only records the idea. Writing happens later, via `/suggestions-write`.

## Procedure

1. **Resolve the description.**
   - If `$ARGUMENTS` is empty, ask the user for a one-line topic description and stop until you
     have it.
   - Derive a concise title (a few words, tool/topic name first — mirror the existing entries'
     style: `Trivy — scan de vulnérabilités d'image Docker`).

2. **Check for duplicates — mandatory, do not skip.**
   - Read `.todos/0000-suggestions-articles-a-publier.md` and list its existing `### ` headings
     (both `[ ]` and `[x]`).
   - `grep -rliI` the topic's keywords across `blog/` and `.unpublished/` (`--include="index.md*"`)
     to check whether it is already published, already drafted, or already proposed. Watch for the
     known false-positive traps documented in the blog-map memory (e.g. the Bluesky share-widget
     footer matching on "bluesky" everywhere) — a keyword hit inside unrelated boilerplate is not a
     duplicate.
   - If it clearly duplicates an existing suggestion, a published post, or a draft: STOP and tell
     the user what already covers it — don't add a second entry.
   - If it's a genuine but partial overlap (e.g. same tool, different angle), say so explicitly in
     the new entry rather than silently proceeding as if unrelated.

3. **Append a new entry** to `.todos/0000-suggestions-articles-a-publier.md`, under the `## Idées`
   heading, in this shape:

   ```markdown
   ### [ ] <Title>

   - <2-4 bullets: what the article would cover, why it's not a duplicate (cite the grep check),
     and — if relevant — which existing published post or draft it would bridge/complement>
   ```

   Match the tone and depth of the existing entries in the file — concrete, verified claims, not a
   vague one-liner. Preserve the file's existing entries exactly; only append.

4. **Report** the heading added and its position in the file. Remind the user that nothing was
   drafted — `/suggestions-write` picks from this list when they're ready to actually write one.
