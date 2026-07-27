---
description: Refresh Claude's auto-memory of the blog (published posts + drafts) so future sessions don't need a full re-scan.
argument-hint: "(no arguments)"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Refresh Blog Memory

Keep Claude's persistent auto-memory of this blog up to date, incrementally, without re-reading all
245+ posts every time. The memory files live in
`/home/node/.claude/projects/-opt-docusaurus/memory/` — specifically `project_blog_map.md` (exhaustive
catalog: slug, title, date, mainTag, tags, series, for every published post + draft),
`project_blog_coverage.md` (compact per-technology coverage summary), and `project_article_proposals.md`
(pending article ideas and their status).

## 1. Detect what changed

`project_blog_map.md`'s header states the last-known post count and the newest date it covers (the
`Period: ... → YYYY-MM-DD` line). Compare against the live repo:

```bash
find blog -name "index.md*" | wc -l
find .unpublished -mindepth 1 -maxdepth 1 -type d | wc -l
for f in $(find blog -name "index.md*"); do
  slug=$(grep -m1 "^slug:" "$f" | sed 's/slug:\s*//;s/"//g')
  date=$(grep -m1 "^date:" "$f" | sed 's/date:\s*//;s/"//g')
  echo "$date|$slug|$f"
done | sort -r
```

Any post with a date **after** the memory's recorded end date is new — read its full frontmatter block
(`awk '/^---$/{c++; if(c==2) exit} c==1' path/to/index.md`) to get `mainTag`, `tags`, `series`,
`ai_assisted`.

For `.unpublished/`, list current folders and diff against the "Drafts — Unpublished" table already in
`project_blog_map.md`:
- A folder that disappeared and now exists as a published post in `blog/` → it was published; move it
  out of the drafts table into its mainTag section, and in `project_article_proposals.md` update its
  status line from "Draft written" to "Published YYYY-MM-DD: `/blog/<slug>`".
- A folder that disappeared with no matching published post → ask the user before assuming it was
  deleted (don't silently drop it from memory).
- A new folder with an `index.md` → add it to the drafts table (read its frontmatter the same way).
- A new folder with no `index.md` (just source files under `files/`) → note it as "staged only, no post
  written yet", don't count it as a draft in the totals.

If nothing changed (counts and newest date match), say so and stop — no edits needed.

## 2. Apply the delta

Do **not** rewrite the memory files from scratch — edit them surgically:

- `project_blog_map.md`: bump the header counts (published/drafts/date range/AI-assisted count — count
  via `grep -rl "^ai_assisted: true" blog/ --include=index.md --include=index.mdx | wc -l`), update the
  `mainTag Distribution` table (recompute via
  `for f in $(find blog -name "index.md*"); do grep -m1 "^mainTag:" "$f" | sed 's/mainTag:\s*//'; done | sort | uniq -c | sort -rn`),
  add new posts as rows to their mainTag section (newest first) and to their series section if they
  have one, update the "Drafts — Unpublished" section.
- `project_blog_coverage.md`: add a short bullet for each new post under the relevant technology
  section, remove/update entries in "Drafts in progress" to match reality, refresh the header date.
- `project_article_proposals.md`: flip `[ ]` → `[x]` for any proposal that got published, with the
  publish date and slug.

While reading frontmatter, opportunistically sanity-check `project_blog_map.md` itself: if an existing
row's `mainTag` doesn't match the live file (this has happened before — e.g. a post filed under the
wrong mainTag section), fix that row too instead of just appending new ones.

## 3. Report

Short summary only: how many new posts, how many drafts published/added/removed, and which memory
files were touched. Do not print the full diff or dump table contents — the memory files are the
record, not the chat.
