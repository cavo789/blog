# 0080 — Create banner images for the 12 series added by TODO 070

- **Priority**: Medium
- **Batch**: series-images
- **Depends**: —
- **Files**: `src/data/series.js`, `static/img/series/*.webp`

## Problème

`.todos/DONE/DONE_070-nouvelles-series-articles-orphelins.md` created 12 new series in
`src/data/series.js` (clusters A–L: VSCode tips, ZSH, Bash, Modern CLI, VBA & Office, SSH,
WinSCP, Windows Terminal, Diagrams as code, Self-host, WSL2, REST APIs) and attached 93
articles to them via `series:` frontmatter.

Every existing series entry in `src/data/series.js` carries an `image:
/img/series/<slug>.webp` pointing at a custom-designed banner. The 12 new entries were
added **without** an `image` key — image generation is outside what an autonomous `/todo`
run can do (no image-generation tool available in this session). `SeriesCards`
(`src/components/Blog/SeriesCards/index.js`) already falls back gracefully to
`/img/default.webp` when `image` is undefined, so the build isn't broken and `/series`
doesn't show broken cards — but all 12 cards currently show the same generic placeholder
image instead of a distinct banner.

## Risque

- Ne rien faire : les 12 nouvelles cartes sur `/series` restent visuellement identiques
  (même image par défaut), ce qui nuit à la reconnaissance visuelle par rapport aux 13
  séries existantes qui ont chacune leur propre bannière.

## Solution proposée

For each of the 12 series below, create `static/img/series/<slug>.webp` (same style/format
as the existing 13 — check their dimensions/aspect ratio first, e.g. `identify
static/img/series/bluesky.webp` or equivalent) and add the corresponding `image:
/img/series/<slug>.webp` line to its entry in `src/data/series.js`.

| Series name | Suggested slug |
| --- | --- |
| Building and testing REST APIs | `rest-apis.webp` |
| Customize your shell with ZSH | `zsh.webp` |
| Diagrams as code | `diagrams-as-code.webp` |
| Modern CLI tools for your terminal | `modern-cli.webp` |
| Self-host your own services | `self-host.webp` |
| SSH - From your first key to remote development | `ssh.webp` |
| VBA & MS Office automation | `vba-office.webp` |
| VSCode - Tips, extensions and shortcuts | `vscode-tips.webp` |
| WSL2 - Install, move and use it | `wsl2.webp` |
| WinSCP & remote file transfer | `winscp.webp` |
| Windows Terminal | `windows-terminal.webp` |
| Writing better Bash scripts | `bash.webp` |

## Explicit NON-goals

- Not about creating new series or reassigning articles — that's done (see TODO 070).
- Not about the blog post banner images in `static/img/v2/` — those are unrelated and
  already exist for every affected article.

## Status — PARTIAL (2026-08-08)

### Done

- 8 of the 12 images were supplied by the user and wired into `src/data/series.js`
  (`image:` line added, Prettier-formatted):
  - Building and testing REST APIs → `rest-apis.webp`
  - Customize your shell with ZSH → `zsh.webp`
  - Diagrams as code → `diagrams-as-code.webp`
  - Self-host your own services → `self-host.webp`
  - SSH - From your first key to remote development → `ssh.webp`
  - VBA & MS Office automation → `vba-office.webp`
  - VSCode - Tips, extensions and shortcuts → `vscode-tips.webp` (see caveat below)
  - WSL2 - Install, move and use it → `wsl2.webp`
- `yarn build`, `yarn lint`, `yarn format:check` all pass — no regressions.

### Not done

- **4 images still missing**, series entries left without an `image` key (fall back to
  `/img/default.webp`, no broken cards):
  - Modern CLI tools for your terminal → `static/img/series/modern-cli.webp`
  - WinSCP & remote file transfer → `static/img/series/winscp.webp`
  - Windows Terminal → `static/img/series/windows-terminal.webp`
  - Writing better Bash scripts → `static/img/series/bash.webp`
  **Reason:** not yet created by the user (no image-generation tool available on this
  side either).
- **`vscode-tips.webp` needs to be redone.** It's 1024×1024 (square) instead of the ~2:1
  landscape ratio every other series banner uses (`PostCard` renders series images in a
  fixed `aspect-ratio: 2/1` box with `object-fit: contain`, so it's not visually broken —
  just letterboxed and noticeably smaller than its neighbors on `/series`). Confirmed by
  visual inspection. Regenerate in landscape, ideally close to `bluesky.webp`'s
  1472×704 reference ratio.
  **Reason:** image was generated at the wrong aspect ratio; needs regeneration, not a
  crop (the existing composition — banner title, mascot cluster, side panels — doesn't
  crop cleanly to 2:1 without losing content).

## Status — DONE (2026-08-08)

The remaining 4 images (`modern-cli`, `winscp`, `windows-terminal`, `bash`) and the
`vscode-tips.webp` redo were supplied by the user in a follow-up round. All 12 series now
have a distinct `image:` entry in `src/data/series.js` (25/25 series total). Verified:
`yarn build`/`lint`/`format:check` all pass, and `build/series/index.html` references all
12 new `.webp` files after a production build.

**Update (2026-08-08, same day):** user regenerated `winscp.webp` and `windows-terminal.webp`
at 1024×572 (ratio 1.79, matching the rest of the set) — the aspect-ratio note above is
resolved, rebuilt and reverified (`build/series/index.html` picks up both). Only remaining
cosmetic note, not blocking:

- `bash.webp`'s headline text has a small AI-generation glitch (a garbled glyph between
  "Better" and "Bash" reading roughly "B[icon]SH BASH SCRIPTS" instead of a clean single
  "Bash"). Cosmetic only; flagged for the user to judge whether it's worth regenerating.
