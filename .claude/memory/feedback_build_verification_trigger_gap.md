---
name: feedback-build-verification-trigger-gap
description: "Always use the isolated-build method (not safe_build.sh) when verifying a build while the dev server may be live — the rule that says so is gated on paths unrelated to \"you're about to run a build\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: d05d3478-4afa-4650-bc57-947811d493b3
  modified: 2026-09-19T18:43:23.524Z
---

`.claude/rules/build-verification.md` only auto-loads on edits to `plugins/**`, `scripts/**` or
`docusaurus.config.js`. It does NOT trigger just because you're about to run a verification
build — so editing a plain `src/theme/**` component (e.g. `BlogPostItem`) never surfaces it, even
though its most important warning applies unconditionally: `yarn clear` (called by
`.claude/scripts/safe_build.sh`) runs `docusaurus clear && rm -rf .docusaurus-dev` per
`package.json`'s `clear` script — it wipes the LIVE dev server's cache
(`.docusaurus-dev/`), not just the build's own `.docusaurus/`.

**Why:** I ran `safe_build.sh` to verify a 3-file JSX change while the devcontainer's always-on
dev server (and a busy peer session, possibly with a browser pointed at it) was live. The build
also failed with an unrelated `SyntaxError: ... JSON.parse` deep in the SSR bundle — likely from
a JSON sidecar being mid-write by the peer session's concurrent work, not from my change. The dev
server self-healed (regenerated `.docusaurus-dev/` on the next request, stayed at 200), but it
could have glitched a live viewer mid-session, and the confusing failure cost a debugging detour.

**How to apply:** Before running any verification build for ANY change, not just ones that touch
`plugins/**`/`scripts/**`/`docusaurus.config.js` — check whether the dev server is likely running
(it almost always is in this devcontainer, per `docker-entrypoint.sh`) and default to the isolated
form instead of `safe_build.sh`:

```bash
DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify \
  npx docusaurus build --locale en --locale fr --out-dir build-verify
```

Reserve `safe_build.sh` for when you've confirmed (via `ListAgents` + asking, or the user saying
so) that no one is relying on the live dev server right now. See also
[[feedback_dev_server_restart]] — same class of "don't disrupt what the user/peer might be
looking at" caution, extended here to builds, not just restarts.
