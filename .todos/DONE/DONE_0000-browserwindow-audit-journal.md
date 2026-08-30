# BrowserWindow Audit Journal

Tracks articles already scanned for the 0110 audit (images outside `<BrowserWindow>`, classified
"page web" vs "autre" by direct visual reading), so each future session continues where the last
one stopped. Do not edit manually except to append new batches — maintained by whoever resumes
`.todos/0110-detecter-screenshots-hors-browserwindow.md` (now closed as `PARTIAL`, see
`.todos/PARTIAL/PARTIAL_0110-detecter-screenshots-hors-browserwindow.md`).

Universe (computed 2026-08-29 by the mechanical scan, banner images `/img/**` excluded): **169
articles**, **662** candidate images outside `BrowserWindow`. Batch 1 below covers the first 30
(alphabetical path order from the scan script) — 139 articles / ~582 images remain.

Resuming: rerun the scan script (see `.todos/PARTIAL/PARTIAL_0110-*.md` Status section for the
script source), skip articles already listed here, continue in the same path order.

**`Wrapped` column** — filled in by hand, whenever you actually go add `<BrowserWindow>` around
the image(s) listed in `Page-web images`. Only meaningful on `**page web**` rows (leave `—` on
`autre` rows, there's nothing to wrap). Use whatever mark you like (`x`, `✅`, a date) — this file
is never rendered, only read by you and by future Claude sessions.

| Batch | Date | Article (path) | Images scanned | Verdict | Page-web images | Wrapped |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-08-29 | `.unpublished/docker-dive` | 1 | autre | — | — |
| 1 | 2026-08-29 | `.unpublished/docusaurus-ollama-tags` | 7 | autre | — | — |
| 1 | 2026-08-29 | `.unpublished/lazydocker` | 1 | autre | — | — |
| 1 | 2026-08-29 | `.unpublished/removing-algolia-for-pagefind` | 1 | **page web** | `images/pagefind-search-caesiumclt.png` | [ ] |
| 1 | 2026-08-29 | `.unpublished/winscp-putty` | 2 | autre | — | — |
| 1 | 2026-08-29 | `blog/2023/11/02/welcome` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/02/wslg-rpd-connection` | 5 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/03/install-docker` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/03/vscode-markdown-code-folding` | 1/2 | autre | — (⚠ `images/code_folding.gif` unreadable, >5MB — check manually) | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/03/wsl-explorer` | 3 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/21/frankenphp` | 2 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/22/docker-volumes` | 4 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/24/docker-diagrams` | 2 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/27/laravel-filament` | 1 | **page web** | `images/filament_demo.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/27/vscode-githubdev` | 1 | **page web** | `images/smartphone_view.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/11/27/vscode-sticky-scroll` | 1/2 | autre | — (⚠ `images/sticky_scroll.gif` unreadable, >5MB — check manually) | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/01/docker-pascal` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/05/docker_uptime_kuma` | 1 | **page web** | `images/notification.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/10/vba-excel-ribbon` | 17 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/12/docker-healthy` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/14/winget` | 2 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/16/docker-mindmap` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/19/bash-ascii-art` | 2 | **page web** | `images/sample.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/21/docker-quarto` | 5 | **page web** | `images/revealjs_version1.webp`, `revealjs_slide1.webp`, `revealjs_slide2.webp`, `revealjs_slide3.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/22/docker-php-ini` | 2 | autre (doute) | — (`before.webp`/`after.webp`: dark dashboard cropped, no chrome, source app unidentified — classé "autre" par prudence) | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/25/quarto-conditional-display` | 4 | **page web** | `images/html.webp`, `images/revealjs.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/25/quarto-powerpoint` | 4 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/27/docker-phpdocumentor` | 1 | **page web** | `images/wordpress_phpdoc.webp` | ✅ |
| 1 | 2026-08-29 | `blog/2023/12/31/powerlevel10k_sandbox` | 1 | autre | — | ✅ |
| 1 | 2026-08-29 | `blog/2024/01/03/quarto-project-variables` | 2 | **page web** | `images/variables.webp`, `images/environment.webp` | ✅ |

**Excluded on purpose from batch 1:** `blog/2024/01/03/quarto-revealjs-tips` (29 images in one
article — deferred to keep batch 1 a manageable single-session chunk; do it first in batch 2).

**Unreadable images (Read tool hit the 5MB API limit) — need a human look or a resize:**

- `blog/2023/11/03/vscode-markdown-code-folding/images/code_folding.gif`
- `blog/2023/11/27/vscode-sticky-scroll/images/sticky_scroll.gif`
