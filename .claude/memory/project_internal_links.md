---
name: project-internal-links
description: "How to count internal/external links in /blog correctly — run `node scripts/internal-link-opportunities.mjs --stats`, never an ad hoc grep"
metadata:
  node_type: memory
  type: project
  originSessionId: 7a1e2a8d-2968-4e43-bbbf-0058d0b07379
  modified: 2026-07-28T12:36:04.575Z
---

**Never audit blog linking with an ad hoc grep.** Run this instead, from the repo root:

```bash
yarn links:audit                                          # site-wide audit (--stats)
yarn links:check blog/2026/07/27/reactions                # one article (--post), exits 1 if it links nowhere
node scripts/internal-link-opportunities.mjs --out .todos/internal-link-opportunities.md
```

`--post` (added 2026-07-28) accepts the article folder or its `index.md`, works on
`.unpublished/` drafts too, flags links pointing to no published article, and backs the
non-blocking `internal-links` job in `.github/workflows/quality.yml`. For the rule it
enforces on new content, see [[feedback-internal-linking]].

`--stats` prints the audit below; without it, the script reports per-article
opportunities (articles whose prose names a topic another article covers, without
linking to it), ranked with orphan articles first.

## Verified baseline

| Metric | First audit | After the full pass | Current (2026-07-28) |
|---|---|---|---|
| Articles scanned | 238 | 238 | **245** (`.mdx` now included) |
| Internal links via `<Link to="...">` | 220 | 697 | 721 |
| Internal links via Markdown `[x](/blog/y)` | 23 | 24 | 44 |
| **Internal total** | 243 (1.02/article) | 721 (3.03/article) | **765** (3.12/article) |
| External links | 669 (2.81/article) | 668 | 712 (2.91/article) |
| Localhost links (reader instructions, not outbound) | 18 | 18 | 18 |
| Ratio external : internal | 2.75 : 1 | 0.93 : 1 | 0.93 : 1 |
| Articles linking to another article | 136 / 238 (57 %) | 232 / 238 (97 %) | **245 / 245 (100 %)** |
| **Articles linking nowhere** | 102 (43 %) | 6 (3 %) | **0** |

Two corrections landed on 2026-07-28 and explain the third column:

1. `findPosts()` only collected `index.md`, so the **7 `index.mdx` posts were never
   audited at all** (docusaurus-cards, php-api-tips, docusaurus-bluesky-share/-comments,
   docker-joomla + part-2 + restore-jpa). Two of them were orphans: docusaurus-cards and
   php-api-tips.
2. Links to `/blog/tags/...`, `/blog/archive`, `/blog/authors`, `/blog/page/...`
   (`SECTION_ROUTE`) are internal but are **not** article links: they no longer make a post
   count as "linked", and `--post` lists them separately instead of flagging them as broken.

The original TODO is finished and archived at
`.todos/DONE/DONE-internal-link-opportunities.md`.

**2026-07-28 — the last 8 orphans were fixed** (windows-winget, new-year-2024,
matomo-install, outlook-vba-pdf, vbs-files-csv, php-api-tips, docusaurus-cards,
claude-ia-spare-tokens), so the blog is at 100 %. Six of them had no incoming link
either; backlinks were added in vba-excel-ribbon, docker-docusaurus-own-blog,
vbs-auto-update and docusaurus-easter-eggs. Still with **no incoming link**:
windows-winget and new-year-2024 — no article's prose names `winget` (checked), and a
New Year greeting is a poor link destination.

Do not treat `/blog/inexisting_page` in **docusaurus-easter-eggs** as a bug: it is a
deliberate 404 demo, and `--post` will always flag it with `!!`.

The blog's internal linking is healthy overall. The outbound volume is fine as-is:
2.9 external links per article is normal for a technical blog.

## Working through `.todos/internal-link-opportunities.md`

Christophe asks for this file to be processed **incrementally, in batches**: pick
the next articles, add the links, then **delete each processed article's whole
`##` section from the TODO** — the file shrinks until empty. Update the counters
in its header (and the "Processed so far" line) after each batch. He sets the
batch size himself and has raised it mid-run ("30 next", then "60 next"), so
don't stop at 10 unless he asked for 10.

The script's candidate list is a *hint, not a spec*: it ranks on shared words and
tags, so it often proposes weak pairs (`docker image` matching four unrelated
posts) while missing the obvious link the prose is begging for. Read the article,
link the concept the author actually names — a tool, a prerequisite, a follow-up —
and put it inline where the term appears, never in a link dump at the end.
Reciprocal links (A→B and B→A) are welcome. Run `npx docusaurus build` afterwards
to confirm nothing broke.

## The four traps (each undercounts internal links)

1. **Posts cross-link with the JSX `<Link to="/blog/x">` component, not Markdown.**
   220 vs 23. `Link` is globally registered in `src/theme/MDXComponents.js`, so
   posts use it without importing it. Matching only `](/blog/` misses ~90 %.
2. **`\[[^\]]*\]\(` also matches images** `![alt](./images/x.webp)`. Needs a
   `(?<!!)` lookbehind, otherwise banners inflate the count.
3. **Fenced code blocks** contain sample URLs that are not navigation.
4. **Frontmatter contains links too** (3 posts do) — they are metadata, not prose
   links, and must be excluded. This is the difference between 243 and 244.

Also: absolute `https://www.avonture.be/blog/...` URLs are internal links, and
`127.0.0.1`/`localhost` URLs are instructions to the reader, not outbound traffic.

**Why:** I audited this three times with Markdown-only regexes and reported 33
internal links, a 20:1 outbound ratio and "9 of 238 posts link internally" — all
badly wrong, and it overstated the problem to Christophe before he pushed back.

**How to apply:** run the script. If it must change, keep `collectLinks()` as the
single place where link forms are recognised. Related: [[project-blog-map]],
[[project-components]].
