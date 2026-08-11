---
name: project_llms_txt_discoverability
description: "llms.txt/series-bundle discoverability work — what was built, and external directory submission status"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6eb8ae47-742c-4932-82bc-41dc6d0b60bd
  modified: 2026-08-11T18:29:58.156Z
---

`plugins/markdown-export-plugin` generates `/llms.txt`, per-series bundles at `/llms/<slug>.txt`,
and per-article `.md` mirrors (see [[project_components]]). On 2026-08-11 these were made
discoverable (the fix, not just generated):

- `llms.txt` now links its own per-series bundles (was the real gap — they were orphaned on disk).
- Site-wide `<link rel="alternate" type="text/markdown" href="/llms.txt">` in `docusaurus.config.js`'s
  `headTags` (SSR, every page).
- Per-article equivalent: `src/components/MarkdownAlternate`, wired into `src/theme/BlogPostPage/index.js`.
- Per-series human-facing link ("View this series as plain Markdown") on `/series/<slug>`
  (`src/components/Blog/Series/SeriesArticlesPage.js`) — note this page is client-rendered only
  (React Router dynamic route), so this particular link is invisible to non-JS crawlers, unlike
  the two SSR `<link>` tags above.
- Comment breadcrumb in `static/robots.txt` pointing at `/llms.txt` (non-standard, no real directive
  exists for this).

**External directory submissions** (manual, outside the repo — the correct directories are the ones
`llmstxt.org`'s official spec page links to, NOT `directory.llmstxt.org` which doesn't resolve —
that was a bad URL Claude gave once, corrected same session):

- `llmstxt.site` — submitted 2026-08-11.
- `directory.llmstxt.cloud` — submitted 2026-08-11.
- `llmstxthub.com` — submission form was broken/KO as of 2026-08-11. **Retry later.**

Changes were verified with a full `yarn build` but not committed as of 2026-08-11 — ask before
committing.
