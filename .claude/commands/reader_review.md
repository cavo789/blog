---
description: Audit a batch of articles as a first-time reader ("I have one minute — do I keep reading?"). Measures time-to-value, flags install-before-proof, tracks progress in .todos/reader-review-journal.md.
argument-hint: "[batch-size (default 10)] or [path or slug of one article]"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Reader Review — the 30-second test

Audit articles the way a stranger reads them: they have one minute, they have installed
nothing, and they owe the article nothing. Does the page prove its value before it asks for
effort?

**This command never edits an article.** It measures, it reports, it writes a TODO. `Edit` is
deliberately absent from `allowed-tools` — restructuring moves whole sections and rewrites
transitions, which is a job for `/todo`, not for an audit.

The target structure is defined **once**, in `.claude/skills/blog-post-structure/SKILL.md`.
Read it before judging anything, and do not restate it here.

## 0. Parse arguments

Read `$ARGUMENTS`.

- **Empty** → `BATCH_SIZE = 10`, batch mode.
- **A single integer** → `BATCH_SIZE = that number`, batch mode.
- **Anything else** → single-article mode: a folder (`blog/2026/08/03/ollama-test-generator`),
  an `index.md`, a slug (`ollama-test-generator`), or a `.unpublished/` draft. Resolve a slug
  with:

  ```bash
  grep -rl "^slug: $ARGUMENTS$" blog .unpublished --include=index.md --include=index.mdx
  ```

  If it resolves to nothing, stop and print the usage block below.

**Hard cap:** if `BATCH_SIZE > 15`, stop immediately and print:

```text
Error: batch size {BATCH_SIZE} exceeds the maximum of 15.

Each article costs one structural scan plus a read of its opening.
Beyond 15, the context window fills faster than the per-session overhead saved.

Run: /reader_review 15   (or omit the argument — 10 is the default)
Then: /clear
Then: /reader_review 15  (the journal remembers your progress)
```

Usage block:

```text
Usage: /reader_review [batch-size | path | slug]
Examples: /reader_review                                  (batch of 10)
          /reader_review 5                                (batch of 5)
          /reader_review blog/2026/08/03/ollama-test-generator
          /reader_review ollama-test-generator            (by slug)
```

## 1. Load the journal

Read `.todos/reader-review-journal.md` (create it if absent — format at the end of this file).

Build a **reviewed set**: `{ slug → review-date }`.

## 2. Select the batch

Skip this step in single-article mode.

Unlike `/freshness`, there is **no volatility score**: an article's structure does not rot
with time, it rots when the article is rewritten. So the ordering is:

1. **Unreviewed `.unpublished/` drafts first.** They are not published: restructuring costs
   no URL, no reader, no `updates:` entry. Maximum leverage, minimum risk.
2. **Then published articles, newest first.** A freshly written article gets audited right
   after it is written — that is the steady state this command is built for.
3. **Back into the pool** when the article changed after its review:

   ```bash
   git log -1 --format=%ad --date=short -- <path>
   ```

   If that date is later than the journal date, the structure is worth a second look.

Enumerate candidates with:

```bash
find blog .unpublished -name index.md -o -name index.mdx
```

Take the top `BATCH_SIZE`. **Announce the selected batch before running any check** — slug,
published or draft, date — so the user can interrupt if the selection looks wrong.

## 3. Mechanical pass — position-based, not a full read

This is what keeps a batch cheap. Every metric below comes from **line positions**, not from
reading the article end to end.

```bash
grep -n '<!-- truncate -->\|^## \|<Terminal\|<Snippet\|<Prerequisite\|apt install\|^!\[\|```mermaid\|```plaintext\|<ProjectSetup\|<StepsCard' <path>
wc -l <path>
```

Let `T` = line of `<!-- truncate -->`, `E` = last line, `BODY = E − T`.

**"Proof"** is the first of these strictly after `T`:

- a `<Terminal>` showing **output** — not one whose content is only an install command
  (`apt install`, `yarn add`, `docker pull`);
- an image of a result (`![…](./images/…)`), excluding the banner image above the TLDR;
- a `plaintext` / `mermaid` block drawing the flow;
- a before/after pair.

When in doubt about a `<Terminal source="./files/x.txt">`, read that one file — it is short.

| Metric | Computation | Threshold |
| --- | --- | --- |
| **Time to value (TTV)** | `(proof_line − T) / BODY` | 🟢 < 15% · 🟠 < 30% · 🔴 ≥ 30% |
| **Install-before-proof** | a `<Prerequisite>`, `apt install`, or `## Prerequisites` heading sits before `proof_line` | red flag (binary) |
| **Abstraction-before-proof** | a `<Snippet>` of implementation sits before `proof_line` | red flag (binary) |
| **Unmarked deep-dive** | a section covering internals whose title carries no "optional / skip / under the hood" signal | count |
| **Landing** | do the last three paragraphs recap *and* point somewhere next? | yes / no |

If no proof exists anywhere, `TTV = 100%` — and say so explicitly, it is the worst case.

## 3b. Repetition pass — "is this information new?"

Time to value gets the reader in; repetition drives them back out. An article that says the
same thing four times reads as padded, and it is usually 15 to 20% longer than it needs to be.

Method — mechanical, no full read required:

1. Extract the article's **core claims**: take the `<TLDR>`, the `## ` headings, and any
   takeaways card. That is typically 4 to 6 distinct facts ("the extension picks the
   framework", "it runs in Docker", "nothing is written without confirmation").
2. `grep -in` a distinctive phrase for each claim across the file, and count where it lands.
3. Measure the weight of each section, to see where the mass actually sits:

   ```bash
   awk -v t=$T 'NR>=t' <path> | awk '/^## /{if(s)print s" | "w" words"; s=$0; w=0; next} {w+=NF} END{print s" | "w" words"}'
   ```

| Metric | Computation | Threshold |
| --- | --- | --- |
| **Redundancy** | occurrences of the most-repeated core claim | 🟢 ≤ 3 · 🟠 4-5 · 🔴 ≥ 6 |
| **Dead-weight block** | a summary/takeaways block whose every bullet restates a fact already in the body | yes / no |
| **Duplicated warning** | two `<AlertBox>` carrying the same caution in different sections | count |

Frequent shapes, worth naming explicitly in the report:

- a takeaways card mirroring the body one-for-one;
- a bullet list whose items are the section headings rewritten as sentences (a bullet that
  carries no clause the reader could not guess is not concise, it is empty);
- an intro sentence restating its own heading;
- a step-by-step list followed by one subsection per step, explaining each in depth;
- the same warning in two `<AlertBox>` — a classic side effect of a past restructuring.

**Count facts, not words.** A short section that adds nothing is worse than a long one that
teaches something: the target is never a word count, it is "every paragraph carries a fact
stated nowhere else". Say what a further cut would *cost* rather than chasing a percentage —
if the remaining length is all information, say so plainly.

A section being long is not by itself a finding. Deep-dive sections are legitimately the
bulk of a good technical article.

## 4. Qualitative pass — the 30-second test

Read **only** the title, the description, and lines `T` to `T + 40`. Nothing else. Then answer
as someone who has never heard of this tool:

- **Do I keep reading, or do I leave?**
- **Why**, in one sentence.
- What is the article asking me to do before it has shown me anything?

This is the heart of the command. The metrics of step 3 only make it reproducible from one
article to the next — they never override it. An article can score 12% TTV and still lose the
reader because the opening never says what the thing is *for*.

## 5. Verdict

Exactly one per article:

| Verdict | Condition | Action |
| --- | --- | --- |
| `OK` | proof within the first screen, no red flag, redundancy 🟢, the 30-second test says "keep reading" | journal only |
| `MINOR` | sound structure, one weakness (unmarked deep-dive, flat landing, proof slightly late but 🟠, redundancy 🟠, one dead-weight block) | journal + a one-line note, **no TODO** |
| `RESTRUCTURE` | TTV 🔴, **or** install-before-proof, **or** abstraction-before-proof, **or** redundancy 🔴, **or** the 30-second test says "I leave" | one TODO |

`MINOR` never produces a TODO on purpose: a sweep over 44 drafts would otherwise bury the real
findings under forty one-line files.

## 6. TODO — only for `RESTRUCTURE`

Write `.todos/reader-<slug>.md` — **not numbered**, same convention as `/freshness`
(`.todos/freshness-<slug>.md`): a batch process must not burn `NNN` identifiers nor risk
collisions between batches.

Check first that no existing TODO already covers the article (scan `.todos/` **and** its
subfolders `DONE/`, `PARTIAL/`, `WONT_DO/`). If one does, extend the report instead of writing
a duplicate.

Written **in French** (the `.todos/` convention):

```markdown
# Reader review : <slug>

**Détecté :** YYYY-MM-DD
**Article :** blog/YYYY/MM/DD/<slug>/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **X %** (preuve ligne N sur un corps de M lignes).
Drapeaux : <install-avant-preuve / abstraction-avant-preuve / aucun>.
Redondance : <fait le plus répété> énoncé **N fois** (l. …).

Test des 30 secondes : <"j'abandonne" + la raison en une phrase>.

## Risque

<Ce que le lecteur d'une minute rate concrètement, et ce qui existe déjà dans l'article mais
au mauvais endroit.>

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
|---|---|---|
| ... | ... | l. X-Y |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
```

The "comes from" column matters: it proves nothing is thrown away, only moved.

## 7. Update the journal

Append one row per article processed — **including `OK` ones**, that is the whole point:

```text
| YYYY-MM-DD | <slug> | published/draft | XX% | OK/MINOR/RESTRUCTURE | <todo file or "—"> |
```

## 8. Session report

Respond **in French**. For each article: TTV, flags, the 30-second verdict in one sentence.

Then the summary table:

| Slug | Publié/Draft | TTV | Verdict | Note |
| --- | --- | --- | --- | --- |

List the TODO files created. Then, in batch mode only, print this block verbatim:

```text
---
Le journal a enregistré la progression : /reader_review reprendra au lot suivant.
Lance /clear avant le prochain lot pour repartir sur un contexte propre.
---
```

---

## Journal file format (create if absent)

`.todos/reader-review-journal.md`:

```markdown
# Reader Review Journal

Tracks articles already audited for reader-first structure, so each `/reader_review` session
continues where the last one stopped. Do not edit manually — maintained by the
`/reader_review` command.

Target structure: `.claude/skills/blog-post-structure/SKILL.md`

| Revu | Slug | État | TTV | Verdict | TODO |
| ---- | ---- | ---- | --- | ------- | ---- |
```
