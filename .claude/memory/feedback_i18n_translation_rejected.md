---
name: feedback-i18n-translation-rejected
description: "French translation of the blog (Docusaurus i18n + Ollama) was evaluated and rejected — don't re-propose without new information"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2159350b-e46e-4652-87cb-e112063de1eb
  modified: 2026-08-31T12:01:37.134Z
---

Auto-translating the blog to French (Docusaurus native i18n, `/fr/` URL prefix, Ollama-generated
translations, browser-language auto-redirect) was evaluated on 2026-08-31 and explicitly rejected.

**Why:** Browsers already offer free, on-the-fly translation (Chrome/Edge/Safari "translate this
page"), which covers the actual reader need. The only real upside of native i18n would be French
SEO discoverability, but for a personal blog that doesn't justify the cost: permanent double
maintenance across 247+ posts (every English edit desyncs its French mirror — same problem as
[[project_internal_links]]'s freshness tracking, doubled), plus translation-quality risk on
technical content (code blocks, bash commands, MDX components like `<Terminal>`/`<AlertBox>`
must never be touched by the translator).

**How to apply:** Don't re-suggest full-corpus i18n translation. If SEO ever becomes a stated
goal, the only reasonable fallback discussed was a narrow, manual/reviewed translation of the
5-10 highest-traffic articles only — not the whole corpus, not fully automated.
