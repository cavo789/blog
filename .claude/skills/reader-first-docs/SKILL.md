---
name: reader-first-docs
description: Time-to-value audit methodology for Docusaurus blog articles — front-load proof, keep install/code before the first result visible, measure TTV mechanically from line positions. Defines the three passes (mechanical, repetition, qualitative), the metric thresholds, and the OK/MINOR/RESTRUCTURE verdict. Docusaurus-specific (MDX components, <!-- truncate --> anchor, AlertBox, Terminal, Snippet). For the audit workflow (journal, batch selection, TODO filing), invoke via /reader_review, not directly.
disable-model-invocation: false
---

# Reader-First Docs — Docusaurus Blog

Load before auditing an article under `blog/` or `.unpublished/`. This skill defines the
**methodology** only — what to measure and how to judge. The `/reader_review` command owns the
workflow: which articles to audit, in what order, and how to track progress across sessions.

The target structure every article should converge toward is defined in `blog-post-structure` —
load it too if the nature of a required restructure is unclear. While reading an article's
`<Terminal>`/`<Snippet>` blocks for Pass 1 below, also note a value the reader would change (a
port, a container name, a version) hardcoded and repeated across 2+ commands instead of declared
once with `<Vars>` — `blog-post-structure`'s self-check names this explicitly; a `/reader_review`
pass is a natural place to catch an older article that predates the component.

## The principle: Time-to-Value (TTV)

A reader arrives with one question: *should I keep reading, and can I get value fast?* Every line
they scan before seeing a result is a line they might leave on. Structure the article so the
**result comes first** — literally, in reading order — not after the prerequisites, the theory,
or the install section.

A Docusaurus article has a natural dividing line: `<!-- truncate -->`. Everything before it is the
excerpt the reader sees on the blog index page. Everything after is the body the committed reader
opens. The body must prove its value **early** — not after a long install section, not after a
code dump the reader has no context for, not after a recap of what they just read in the TLDR.

## Article structure anchor points

```bash
grep -n '<!-- truncate -->\|^## \|<Terminal\|<Snippet\|<Prerequisite\|apt install\|^!\[\|```mermaid\|```plaintext\|<ProjectSetup\|<StepsCard\|<QuickJump' <path>
wc -l <path>
```

Let `T` = line of `<!-- truncate -->`, `E` = last line of the file, `BODY = E − T`.

**`<QuickJump>` is scaffolding, not content.** If a `<QuickJump ... />` sits between `T` and the
first real content line, move `T` to the line right after it before computing anything — it never
counts as install/abstraction/proof and never inflates `BODY` or the TTV percentage. Treat it the
same way the excerpt before `<!-- truncate -->` is treated: present, useful to the reader, outside
the measurement.

All three passes below work from `T` as the zero point. The excerpt before `T` is not evaluated —
it is already the reader's entry point and has its own quality signal (the 30-second test reads it).

## Pass 1 — Mechanical (position-based, not a full read)

Compute from line positions only. This is what keeps a batch cheap.

**"Proof"** is the first of these strictly after `T`:

- a `<Terminal>` showing **output** — not one whose content is only an install command
  (`apt install`, `yarn add`, `docker pull`);
- an image of a result (`![…](./images/…)`), excluding the banner image above the TLDR;
- a `plaintext` / `mermaid` block showing the outcome;
- a before/after pair.

When in doubt about a `<Terminal source="./files/x.txt">`, read that one file — it is short.

If no proof exists anywhere in the article body, `TTV = 100%` — say so explicitly.

| Metric | Computation | Threshold |
| --- | --- | --- |
| **Time to value (TTV)** | `(proof_line − T) / BODY` | 🟢 < 15% · 🟠 < 30% · 🔴 ≥ 30% |
| **Install-before-proof** | a `<Prerequisite>`, `apt install`, or `## Prerequisites` heading sits before `proof_line` | red flag (binary) |
| **Abstraction-before-proof** | a `<Snippet>` of implementation sits before `proof_line` | red flag (binary) |
| **Unmarked deep-dive** | a section covering internals whose title carries no "optional / skip / under the hood" signal | count |
| **Landing** | do the last three paragraphs recap *and* point somewhere next? | yes / no |

## Pass 2 — Repetition ("is this information new?")

TTV gets the reader in; repetition drives them back out. An article that says the same thing four
times reads as padded, and it is usually 15–20% longer than it needs to be.

Method — mechanical, no full read required:

1. Extract the article's **core claims**: take the `<TLDR>`, the `## ` headings, and any
   takeaways card. That is typically 4 to 6 distinct facts.
2. `grep -in` a distinctive phrase for each claim across the file, and count where it lands.
3. Measure the weight of each section:

   ```bash
   awk -v t=$T 'NR>=t' <path> | awk '/^## /{if(s)print s" | "w" words"; s=$0; w=0; next} {w+=NF} END{print s" | "w" words"}'
   ```

| Metric | Computation | Threshold |
| --- | --- | --- |
| **Redundancy** | occurrences of the most-repeated core claim | 🟢 ≤ 3 · 🟠 4-5 · 🔴 ≥ 6 |
| **Dead-weight block** | a summary/takeaways block whose every bullet restates a fact already in the body | yes / no |
| **Duplicated warning** | two `<AlertBox>` carrying the same caution in different sections | count |

Frequent shapes worth naming in the report:

- a takeaways card mirroring the body one-for-one;
- a bullet list whose items rephrase the section headings (adds no new clause);
- an intro sentence that restates its own heading;
- a step-by-step list followed by one subsection per step (the list was the summary, the sections
  are the depth — the list is redundant, cut it or turn it into a `<StepsCard>`);
- the same caution in two `<AlertBox>` — a classic side effect of a past restructuring.

**Count facts, not words.** A short section that adds nothing is worse than a long one that teaches
something. Say what a further cut would *cost* rather than chasing a percentage — if the remaining
length is all information, say so plainly. A section being long is not by itself a finding.

## Pass 3 — The 30-second test (qualitative)

Read **only** the title, the frontmatter `description`, and lines `T` to `T + 40`. Nothing else.
Then answer as someone who has never heard of this tool:

- **Do I keep reading, or do I leave?**
- **Why**, in one sentence.
- What is the article asking me to do before it has shown me anything?

This is the heart of the audit. The mechanical metrics of passes 1 and 2 only make the judgment
reproducible from one article to the next — they never override it. An article can score 12% TTV
and still lose the reader if the opening never says what the thing is *for*.

## Verdict

Exactly one per article:

| Verdict | Condition | Action |
| --- | --- | --- |
| `OK` | proof within the first screen, no red flag, redundancy 🟢, the 30-second test says "keep reading" | journal only |
| `MINOR` | sound structure, one weakness (unmarked deep-dive, flat landing, proof slightly late but 🟠, redundancy 🟠, one dead-weight block) | journal + one-line note, **no TODO** |
| `RESTRUCTURE` | TTV 🔴, **or** install-before-proof, **or** abstraction-before-proof, **or** redundancy 🔴, **or** the 30-second test says "I leave" | one TODO |

`MINOR` never produces a TODO: a batch sweep over 40+ articles would bury real findings under
one-line files for every article with a single flat ending.

For `RESTRUCTURE`, file one TODO (format and language: see `/reader_review`). The proposed fix is
always a **reorder**, never a cut — name which existing section/line range each reordered block
comes from, so nothing reads as discarded.

## What this does NOT mean

- **Don't delete reference material.** TTV is about *order*, not *completeness*. Advanced sections
  still have a place — they just aren't the first thing every reader sees.
- **Don't compress the opening into a one-liner.** A stranger must understand what the article
  teaches without already knowing the tool — not just recognize it from the title.
- **A long section is not a finding.** A deep-dive covering internals is legitimately the bulk of a
  good technical article; flag it only when its title carries no signal that it is optional.
