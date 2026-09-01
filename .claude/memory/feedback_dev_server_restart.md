---
name: feedback-dev-server-restart
description: "Christophe authorized restarting the dev server for content-verification purposes, conditional on broadcasting to other active Claude Code sessions first"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b1417793-d60e-4e11-ba8d-0b50aeea9692
  modified: 2026-08-30T16:55:21.411Z
---

CLAUDE.md's default rule ("never run `yarn start`, `yarn docusaurus start`, or kill whatever is on
port 3000 via the Bash tool") is relaxed for one specific case: restarting the dev server to
visually verify a blog article's rendering (e.g. via a headless-browser screenshot). Christophe
explicitly authorized this on 2026-08-30, after first declining the same request and being talked
into it — the goal ("improve article content") justifies it.

**The authorization is conditional, not blanket.** Before touching the dev server:

1. Run `ListAgents` to check for other active Claude Code sessions on this machine.
2. If any peer session is listed, `SendMessage` them a heads-up describing exactly what is about
   to happen (dev server restart, port 3000) and why, and give them a chance to object (e.g. if
   they have `yarn start` running or work that depends on the server's current state) before
   proceeding.
3. Only use the sanctioned restart path — the `start` function in
   `.devcontainer/scripts/interactive.sh` (kills whatever holds port 3000, clears the cache,
   relaunches with the correct `HTTPS`/`SSL_CRT_FILE`/`SSL_KEY_FILE`/`--host 0.0.0.0` invocation).
   Never a bare `yarn start` or manual `kill`.
4. After finishing (screenshot taken, verification done), clean up (remove any temp copy made
   into `blog/` for previewing a `.unpublished/` draft) and send a follow-up message to any peer
   session notified in step 2, so they know the server is back to a healthy, shared state.

**Why:** Christophe's own words: "je pense que tu peux le faire; je t'autorise à faire cette
action puisqu'elle vise à améliorer le contenu des articles." The condition he attached is the
coordination step (steps 1–2 above) — he does not want a restart to silently disrupt another
active session sharing the same devcontainer.

**A related, separately learned fact**: `curl`ing the dev server (even for an already-published
route) always returns the same generic SPA shell — Docusaurus dev mode does not do per-request
SSR the way a production build does. Content only exists after client-side JS hydration, so
`curl`-based verification of dev-server content is useless; a real headless browser (Playwright,
already a project dependency — `node_modules/.bin/playwright`, browsers pre-installed under
`~/.cache/ms-playwright/`) is required to check what a route actually renders in dev mode. Note
also `<Terminal typewriter>`'s animation must be skipped (click the terminal, or wait it out) or
`innerText` checks on its content will falsely report substrings missing.

**How to apply:** When a task calls for visually verifying an article or component in the running
dev server (not just structural/lint checks), don't default to refusing per CLAUDE.md's blanket
wording — follow the four steps above. For a `.unpublished/` draft specifically, still use the
established temp-copy-into-`blog/`-then-delete dance (see [[project-blog-conventions]]) around the
restart.

**Scope note (2026-08-30):** this authorization covers verification only — screenshots taken this
way are transient (inspect, then delete), never saved into an article's `images/` folder as a
side effect. Christophe clarified after the fact: he does not want screenshots added to an
article just because a verification pass produced them. Adding real screenshots to enrich an
article is a separate, deliberate decision — only do it if asked, or if it genuinely adds value
to that specific article, not as an automatic by-product of restarting/verifying.
