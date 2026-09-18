---
paths:
  - "**/*.md"
  - "**/*.mdx"
---

# Markdown — always apply

Full rationale: `markdown-style` skill. These exist precisely because the matching lint rule
(MD049/MD050) is commonly **disabled** — nothing will flag a wrong marker, get it right by hand.
Verify: `rumdl`/`markdownlint`.

- ✅ DO: `**double asterisks**` for bold. ❌ DON'T: `__double underscores__`.
- ✅ DO: `*single asterisks*` for italic. ❌ DON'T: `_underscores_`.
  Enforced since 2026-09-18 by MD049/MD050 in `.config/.markdownlint.json`, not merely
  documented. Prettier no longer formats Markdown at all (`*.md`/`*.mdx` in `.prettierignore`):
  it rewrites `*x*` to `_x_` with no option to stop, which turns a filename written `*file*.py`
  into `_file_.py` — emphasis to CommonMark, and the real name lost.
- ❌ DON'T: rewrite a dunder or underscore-glob filename (`__init__.py`, `_runner_`) as emphasis —
  it's code, leave the underscores intact.
- ✅ DO: ATX headings (`#`, `##`, …). ❌ DON'T: Setext underlines (`===`/`---` below a title).
- ✅ DO: dash `-` for unordered list bullets, 2-space nested indent. ❌ DON'T: `*` or `+` bullets.
