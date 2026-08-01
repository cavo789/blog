# Freshness: vscode-tabnine

**Detected:** 2026-07-30
**Closed:** 2026-07-31
**Article:** blog/2024/03/02/vscode-tabnine/index.md
**Verdict:** DONE

## Finding

The article presents Tabnine as a "MUST HAVE" free VSCode extension. Tabnine discontinued its free
Basic tier on April 2, 2025 and eliminated the individual Dev plan on October 16, 2025. As of 2026
it is enterprise-only with two plans: Code Assistant ($39/user/month) and Agentic Platform
($59/user/month), both requiring annual billing. The content is actively misleading for any reader
who tries to install it expecting a free tool.

A warning `<AlertBox variant="warning">` has been added at the top of the article to flag the
situation for existing readers. The full article still needs to be reworked or replaced with a
recommendation for a free alternative (GitHub Copilot free tier, Supermaven, Codeium, etc.).

## Source

- <https://ailimit.watch/tools/tabnine/> — dated changelog of Tabnine pricing changes
- <https://www.g2.com/products/tabnine/pricing> — current pricing page (enterprise-only, $39/mo)

## Suggested action

Rewrite the article to either:
1. Replace Tabnine with a current free alternative (GitHub Copilot free, Codeium/Windsurf, Supermaven); or
2. Repurpose as a "Tabnine went enterprise — here are the free alternatives" post.

The existing TLDR and animated gif remain valid technically but the "MUST HAVE" framing and the
offline/privacy pitch now apply only to teams that can afford enterprise pricing.

## Done (2026-07-31)

Direction chosen by user: no alternatives — just "Bye bye Tabnine".

- `description` updated to reflect enterprise-only status
- `updates:` entry added (2026-07-31)
- `<AlertBox variant="warning">` (from freshness pass) replaced by stronger `<AlertBox variant="caution" title="Tabnine is no longer free — avoid it">` with dates and "$39/user/month" facts
- TLDR rewritten in past tense, flagging enterprise-only status
- Opening "is a MUST HAVE" → "was a MUST HAVE", body put into past tense
- Old download blockquote and privacy AlertBox removed (no longer relevant)
- New section "## Bye bye, Tabnine" added as a conclusive farewell — no alternatives suggested
