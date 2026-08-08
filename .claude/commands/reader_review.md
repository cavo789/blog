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
transitions, which is a separate implementation step, not something an audit should do inline.

That TODO is **not** actioned via `/todo` — `.todos/reader-<slug>.md` is deliberately
non-numbered (see step 4) and `/todo` only resolves `.todos/NNN-*.md` by numeric ID, so it
will report the file as not found. To implement a `RESTRUCTURE` finding, ask directly:
"read and apply `.todos/reader-<slug>.md`" (or point at the article). Say this plainly in the
session report (step 6) so it isn't left for the user to discover.

**Load both skills before evaluating anything:**

- `reader-first-docs` — the three-pass audit methodology (mechanical TTV, repetition,
  30-second test), the metric thresholds, and the OK/MINOR/RESTRUCTURE verdict. Do not
  restate the methodology here.
- `blog-post-structure` — the target structure every article should converge toward. Use it
  to judge whether a proposed reorder actually improves the article.

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

## 3. Audit each article

Apply the three passes defined in `reader-first-docs` in order — mechanical (TTV, flags,
unmarked deep-dives, landing), repetition (redundancy, dead-weight blocks, duplicated
warnings), then the 30-second test. Then assign exactly one verdict per the skill's table.

The skill defines every metric, threshold, and proof signal. Do not restate them here.

## 4. TODO — only for `RESTRUCTURE`

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
| --- | --- | --- |
| ... | ... | l. X-Y |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
```

The "comes from" column matters: it proves nothing is thrown away, only moved.

## 5. Update the journal

Append one row per article processed — **including `OK` ones**, that is the whole point:

```text
| YYYY-MM-DD | <slug> | published/draft | XX% | OK/MINOR/RESTRUCTURE | <todo file or "—"> |
```

## 6. Session report

Respond **in French**. For each article: TTV, flags, the 30-second verdict in one sentence.

Then the summary table:

| Slug | Publié/Draft | TTV | Verdict | Note |
| --- | --- | --- | --- | --- |

List the TODO files created. For each one, add one line: "Pour l'implémenter : demande-moi de
lire et d'appliquer `<path>` (pas `/todo` — ce fichier n'est pas numéroté)."

Then, in batch mode only, print this block verbatim:

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
