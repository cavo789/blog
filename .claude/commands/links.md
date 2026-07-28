---
description: Add missing internal links to an article (inline, in the prose) and the reciprocal link in the older post.
argument-hint: "[path or slug of an article — omit to use the articles changed in the working tree]"
allowed-tools: Read, Glob, Grep, Bash, Edit
---

# Add internal links to an article

The blog's cross-linking rule lives in `AGENTS.md` ("Blog Content Guidelines" → Internal links):
every article carries **2 to 4 internal links, inline in the prose**, plus a reciprocal link in the
older article when it makes sense. The `internal-links` job of `.github/workflows/quality.yml`
flags articles that link nowhere; this command is the fix.

## 1. Decide which articles to work on

`$ARGUMENTS` may be an article folder (`blog/2026/07/27/reactions`), an `index.md`, a slug
(`reactions`), or a `.unpublished/` draft. A slug has to be resolved first:

```bash
grep -rl "^slug: $ARGUMENTS$" blog .unpublished --include=index.md --include=index.mdx
```

If `$ARGUMENTS` is empty, work on the articles currently modified or added in the working tree:

```bash
git status --porcelain -- 'blog/**/index.md*' '.unpublished/**/index.md*' | awk '{print $NF}'
```

If that is empty too, fall back to the last commit
(`git diff --name-only --diff-filter=ACM HEAD~1 HEAD -- 'blog/**/index.md*' '.unpublished/**/index.md*'`)
and, before editing anything, tell the user which articles you picked.

## 2. Run the check

```bash
yarn links:check <path>
```

It prints the internal links already present, marks with `!!` any link pointing to no published
article (a wrong slug — fix those), and lists candidate targets ranked by score.

## 3. Choose the links — judgment, not the score

**The candidate list is a hint, not a spec.** It ranks on shared words and tags, so it happily
proposes four unrelated posts that merely say "docker image", while missing the one link the prose
is begging for. So:

- Read the article. Look for the moments where it *names* something covered elsewhere: a tool, a
  prerequisite, a concept explained in an earlier post, a natural follow-up.
- Cross-check the memory blog map (`/home/node/.claude/projects/-opt-docusaurus/memory/project_blog_map.md`)
  for same-`mainTag` and same-series posts the script may have scored too low.
- Aim for 2 to 4 links. Prefer few and relevant over many and weak — a link the reader does not
  need is noise, and this rule exists to help readers, not to satisfy a counter.
- If the article genuinely has no relevant neighbour, say so instead of forcing a link.

## 4. Insert them

- Inline, **at the first place the term appears in the prose**. Never a "See also" list at the end:
  the `RelatedPosts` grid already covers the bottom of the page.
- Use the globally registered component, no import needed:
  `<Link to="/blog/slug">the natural words already in the sentence</Link>`.
- Do not rewrite the sentence around the link, and do not add a sentence just to host one. If no
  sentence can host it naturally, that link was not the right one.
- Never link inside a fenced code block, a heading, or frontmatter.
- Add the **reciprocal link** in the older article when it fits its prose — that is what keeps old
  posts alive. Same rules apply there.

## 5. Verify

```bash
yarn links:check <path>          # for each article touched, including the reciprocal ones
```

Every link must point to an existing slug (no `!!` lines). If several articles were edited, or if
any doubt remains on a slug, run `npx docusaurus build` — it fails on broken internal links.

## 6. Report

For each article: the links added, with the anchor text and the target slug, and where the
reciprocal link went. Mention explicitly any article you deliberately left with fewer than two
links, and why.
