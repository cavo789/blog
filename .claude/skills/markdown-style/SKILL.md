---
name: markdown-style
description: Personal Markdown house style — bold via **asterisks** never __underscores__, italic *asterisks* never _underscores_, ATX headings, dash bullets, 2-space nested indent, and the authoring choices (no hard-wrap, inline HTML, bare URLs) that compensate for lint rules commonly left disabled. Applies to .md and to prose/frontmatter in .qmd. Linter-agnostic.
disable-model-invocation: false
---

# Markdown Style (house style)

Load before editing any `*.md`, or prose/frontmatter in `*.qmd`.

These are authoring rules that hold whether or not a linter is present. Several exist
*precisely because* the matching lint rule is commonly **disabled** (enforcing it would
corrupt code-like text), which means nothing flags a mistake — you must get it right by
hand. A project may bind these to a specific linter config; defer to that project for
which rules are actually enforced versus left to you.

## Emphasis markers — the gap a linter often can't see

- **Strong (bold): always `**double asterisks**`.** Never `__double underscores__`.
  The strong-style rule (markdownlint MD050) is often **disabled** because it mangles
  filenames like `__init__.py` into `**init**.py`. Nothing will flag a wrong bold
  marker — get it right by hand.
- **Emphasis (italic): always `*single asterisks*`.** Never `_underscores_`.
  The emphasis-style rule (MD049) is often **disabled** too, because it rewrites
  filename-glob spans like `_runner_` into `*runner*`. Same consequence: unguarded.
- **Never rewrite a dunder or underscore-glob filename** (`__init__.py`, `__main__.py`,
  `_runner_`) as if it were emphasis. It is code — leave the underscores intact.

## Structure

- **Headings: ATX only** (`#`, `##`, …), never Setext underlines (MD003).
- **Unordered lists: dash `-`** as the bullet, never `*` or `+` (MD004).
- **Nested-list indent: 2 spaces** per level (MD007).
- **Repeated subheadings under different parents are fine** — e.g. "Symptom / Cause /
  Solution" per FAQ entry (MD024 in `siblings-only` mode). Don't invent unique wordings
  to dodge a duplicate warning that won't fire.

## Explicitly allowed (don't self-censor)

- **No line-length limit** (MD013): don't hard-wrap prose to fit a column.
- **Inline HTML is fine** (MD033).
- **Bare URLs are fine** (MD034): no need to wrap every link in `<…>` or `[…]()`.
- **Emphasis used as a pseudo-heading is fine** (MD036).

## Quarto (`.qmd`)

This house style applies to the **prose and YAML frontmatter** of `.qmd` files too. It
does not cover Quarto-specific mechanics (shortcodes, includes, cross-references, book /
project structure) — if the project has a dedicated Quarto skill, defer to it for those.
