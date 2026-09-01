---
name: project-run-ci-e2e-known-issue
description: "run_ci e2e has one permanently-allowlisted, known React hydration warning — check before re-investigating a failure"
metadata:
  node_type: memory
  type: project
  originSessionId: 1beb29ab-f298-4f32-9b04-d5bb0e2751c9
  modified: 2026-09-01T17:44:09.839Z
---

`run_ci e2e` (Playwright smoke/hydration test, TODO 0107) can show a **known, accepted, permanently
allowlisted** React hydration warning: `Docusaurus React Root onRecoverableError: Error: Minified
React error #418;...`. It was investigated exhaustively over two days (2026-08-31/09-01,
`.todos/DONE/DONE_0112-eli5-codeblock-hydration-mismatch.md`) and traced to a timing-sensitive race
condition in Docusaurus's own `<CodeBlock>` (a chunk-loading race, most likely) — not a content bug,
not specific to `Eli5CodeBlock`/`Snippet`, and a **known upstream Docusaurus issue**
([facebook/docusaurus#9884](https://github.com/facebook/docusaurus/issues/9884), closed `wontfix`).
Zero reader-visible impact (React self-heals). The author explicitly accepted the allowlist as the
final closure, not a temporary workaround — see the DONE file for the full investigation, the ruled-out
list (~15 hypotheses tested), and a ready-to-run repro script if anyone ever wants to actually fix it
(preload/eliminate the on-demand chunk).

**Why:** if `run_ci e2e` fails in a future session, don't re-investigate from scratch — check the
exact error message first.

**How to apply:** If the failing message is exactly `Docusaurus React Root onRecoverableError: Error:
Minified React error #418;...`, it's this known issue — just verify the allowlist regex in
`tests/e2e/smoke.spec.ts` (`/^Docusaurus React Root onRecoverableError: Error: Minified React error
#418;/`) is still present and wasn't accidentally removed. If the message is *different* (a different
error code, or different text entirely), it's a genuinely new bug — investigate normally, don't assume
it's the same cause. Link: [[project_components]].
