---
description: Walk the AUTHOR-CHECK placeholders left in draft articles and resolve them with the author before publication
argument-hint: "[slug or keyword to limit the review to one draft]"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, AskUserQuestion, Skill
---

# Review the open questions of the drafts

Drafts are often written while the author is away. Whatever only the author can settle (a
screenshot of their own screen, a choice, a run on their machine, a fact to confirm) is left in the
draft as an **`AUTHOR-CHECK` placeholder**. This command finds them all and works through them with
the author, so that no draft is published with an open question in it.

`$ARGUMENTS` optionally limits the review to the drafts whose path or slug contains it.

## The placeholder contract

One HTML comment, on its own line, invisible in the rendered page:

```markdown
<!-- AUTHOR-CHECK(<kind>): <the question, in French, self-contained> -->
```

| Kind | What the author must provide | How it is resolved |
| --- | --- | --- |
| `screenshot` | A capture of their own screen | They give an image path; convert it to `images/<name>.webp` (sharp, quality 85), insert it, remove the marker |
| `decision` | A choice between options | Ask with the options; apply the choice in the prose, remove the marker |
| `run` | A command run on their machine, or a result only a real run can give | Run it yourself if possible (Docker-first, see `/suggestions:iterate` step 3), otherwise ask for the output; paste the real output, remove the marker |
| `fact` | A fact to confirm (a version, a date, a behavior) | Verify it (WebFetch, release API) or ask; fix the prose, remove the marker |

The question must make sense on its own: the author reads it in a dialog, without the article
open. Name the section and what the draft currently says.

**Every command that writes drafts emits these markers** instead of guessing: a result that was not
run, a screenshot that only the author can take, a choice that is theirs. Legacy markers from older
drafts — `TODO-RUN` and `TODO:` inside an HTML comment — are treated as `run` and `decision`
respectively.

## Procedure

1. **Collect.** List every marker in the drafts, with its file and line:

   ```bash
   grep -rnE '<!-- *(AUTHOR-CHECK|TODO-RUN|TODO:)' .unpublished --include='index.md*'
   grep -rlE '^draft: *true' blog --include='index.md*' | xargs -r grep -nE '<!-- *(AUTHOR-CHECK|TODO-RUN|TODO:)'
   ```

   The second command covers the drafts already moved to `blog/` (`draft: true` there means
   "ready, awaiting the go"). Apply `$ARGUMENTS` as a filter if given. Nothing found: say so and
   stop.

2. **Show the map first.** One table, in French: draft, number of markers by kind, oldest first
   (date of the front matter). The author sees the size of the job before answering anything.

3. **Resolve what you can alone, before asking.** `fact` markers you can verify, and `run` markers
   you can execute in a throwaway container, are done first — the author only gets the questions
   that are really theirs. Report each one in a line.

4. **Ask the rest in batches.** Up to 4 questions per `AskUserQuestion` call, one draft at a time,
   `decision` first (they can change the others). Each question carries the recommended option
   first, marked "(Recommandé)". For a `screenshot`, the options are "Je fournis l'image" (they
   paste a path), "Plus tard" and "Supprimer ce passage".

5. **Apply each answer immediately**, in the draft, then remove its marker. "Plus tard" leaves the
   marker untouched. After a draft is done, re-read its surroundings: an inserted screenshot or a
   decision often makes a nearby sentence wrong (see *After any restructuring* in the
   `blog-post-structure` skill).

6. **Check each touched draft**: `markdownlint-cli2` on it, every `source=` and `./images/` path
   exists, and the `blog-prose` grep.

## Report

In French: per draft, the markers resolved (by you / by the author), those postponed, and the ones
left. End with the drafts that now have **zero** markers — the only ones that may lose
`draft: true`. A draft with a marker left is not publishable; say so plainly.

Commit nothing unless asked.
