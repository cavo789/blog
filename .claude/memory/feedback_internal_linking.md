---
name: feedback-internal-linking
description: Every new blog post must ship with inline internal links from day one — never write a post that links nowhere
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2c591471-161b-402f-98bd-8ebd6aa6ea08
  modified: 2026-07-28T12:09:45.729Z
---

**No new article is finished until it links to other articles on the blog.** This is not an
optional polish step, it is part of writing the post — same level as the banner image or the
frontmatter. Applies to posts in `blog/` *and* to drafts in `.unpublished/` (a draft that
links nowhere becomes a published orphan the day it moves).

Target: **2 to 4 inline internal links** in a normal-length post. Fewer is acceptable only
when nothing on the blog is genuinely related — say so explicitly rather than shipping
silently.

How to do it while writing:

1. Before writing, look up related posts in [[project-blog-map]] (slug + tags catalogue) —
   same `mainTag` and same series first.
2. Place links **inline, where the term is named in the prose** — the first time the post
   mentions a tool, a prerequisite, or a follow-up topic already covered elsewhere.
   Never a "See also" link dump at the end; `RelatedPosts` already covers the bottom of
   the page.
3. Use the JSX component: `<Link to="/blog/slug">…</Link>`. It is globally registered in
   `src/theme/MDXComponents.js`, so no import is needed. Markdown `[x](/blog/y)` also works
   but the blog overwhelmingly uses `Link`.
4. Add the **reciprocal link** in the older post when it makes sense (A→B and B→A) — this is
   how the older article keeps getting traffic.
5. After writing, run `yarn links:check blog/YYYY/MM/DD/slug` (or the `.unpublished/` path).
   It prints the internal links found, flags links pointing to no published article, lists
   candidate targets, and exits 1 when the post links nowhere. Treat its candidates as
   hints, not a spec — see [[project-internal-links]] for why the ranking proposes weak
   pairs.

The rule is also written in `AGENTS.md` ("Blog Content Guidelines" → Internal links), and
the `internal-links` job in `.github/workflows/quality.yml` runs the same check on every
added or modified article as a **non-blocking** annotation — deliberately non-blocking,
same reasoning as the lint job: a writing remark must never block publishing.

**Why:** Christophe ran a full retro-fit pass over the 238 existing posts (the
`.todos/DONE/DONE-internal-link-opportunities.md` TODO, 159 articles fixed, orphans down
from 102 to 6). He does not want that debt to build up again — the fix belongs at writing
time, not in a future cleanup campaign.

**How to apply:** when creating or reviewing any post, add the links before declaring the
post done, and report in the summary which internal links were added. Related:
[[feedback-post-creation]], [[project-blog-conventions]], [[writing-style]].
