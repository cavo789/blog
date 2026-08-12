---
slug: blog-time-to-value-audit
title: I Measured How Long My Own Articles Take to Prove Anything. The Answer Was 50%.
authors: [christophe, claude]
image: /img/v2/clean_code.webp
mainTag: doc-as-code
tags: [doc-as-code, markdown, docusaurus]
date: 2026-11-17
description: A repeatable, mechanical way to audit a technical blog — measure time-to-value from line positions, flag install-before-proof and abstraction-before-proof, and judge with a 30-second read. Run over 318 of my own articles it returned 180 restructure verdicts, and every fix was a reorder, never a cut.
language: en
ai_assisted: true
draft: true
---

<!-- cspell:ignore TTV maintag reorder reorders -->

![I Measured How Long My Own Articles Take to Prove Anything. The Answer Was 50%.](/img/v2/clean_code.webp)

<TLDR>
A reader arrives with one minute and decides to stay or leave before scrolling twice. I built a mechanical metric for that — time-to-value: how far into an article the first actual proof appears, measured from line positions rather than from opinion — and ran it over 318 articles and drafts. The median was 42%, and 60 articles had no proof at all before the very end. 180 came back needing a restructure. Every single fix was a reorder of material that was already written.
</TLDR>

I have been writing this blog for three years, and I was fairly happy with it. The articles are technically correct, they have real terminal output, real screenshots, working code. I proofread them. What could be wrong?

Then I tried an experiment that I do not really recommend for your peace of mind: I opened one of my own articles and read it as a stranger would. One minute. No prior knowledge. Nothing installed.

The article was about Docker volumes. In that minute I was asked to create a folder, write a `Dockerfile`, write a shell script, and build an image — and I had not yet been shown a single thing about volumes, which were the entire point. The good part, a beautiful before/after of a counter losing and then keeping its state, existed. It was 90 lines further down.

I had not written a bad article. I had written a good article in the wrong order. And I immediately wanted to know how many others were like it.

<!-- truncate -->

## What "Measuring an Article" Actually Looks Like

The metric is deliberately dumb, because a dumb metric is one you can run 300 times without your judgment drifting. Find where the excerpt ends, find where the first real *proof* appears, divide:

<Terminal source="./files/measure.txt" />

That is the same <Link to="/blog/docker-volumes">Docker volumes article</Link>, after the fix. It went from **38% to 3.2%**. Nothing was deleted, nothing was rewritten — the before/after demo that was sitting at line 125 moved to line 35, and the `Dockerfile` that was at line 39 moved down to the setup section where it belongs.

Run over the whole blog, the picture was not subtle:

```plaintext
318 articles and drafts audited

time to value        🟢 < 15%   ████████████                       52
                     🟠 15-29%  ██████████████                     62
                     🔴 ≥ 30%   ███████████████████████████████   191

                     median 42%      ·  60 articles at 100% (no proof at all)

verdict              OK           ███████                          29
                     MINOR        ██████████████████████          109
                     RESTRUCTURE  ████████████████████████████    180
```

Sixty articles at 100% is the number that hurts. That does not mean "the proof came late" — it means there was **no result shown anywhere in the body**. Three years of writing about tools, and in sixty cases I never once showed the tool doing the thing.

## Why a Mechanical Metric Beats Reading Carefully

I did not expect to defend the crudeness of this. Now I would:

- **It survives 300 repetitions.** Careful reading does not. By article forty your standards have drifted, and you no longer know whether article ten and article two hundred were judged the same way.
- **It cannot be argued with.** "This section is important" is a debate. "Your first proof is at 66% of the body" is a fact, and it moves the conversation straight to what to do about it.
- **It points at a fix, not at a flaw.** A late proof has exactly one remedy: move the proof earlier. That is why 180 verdicts produced 180 reorders and zero rewrites.
- **It is cheap enough to be honest about your whole corpus.** Two `grep`s per article. That is what made auditing everything — not just the articles I suspected — actually possible.

The metric never decides anything on its own, though. It makes the judgment *reproducible*; a human still has to make it.

## The Three Passes

### Pass 1 — Position, not prose

Two commands, four numbers. `T` is the `<!-- truncate -->` line, `E` the end of file, `BODY = E − T`. Proof is the first of: a <Link to="/blog/docusaurus-terminal-typewriter">`<Terminal>`</Link> showing **output** (not one that only runs `apt install`), a result screenshot, a `plaintext`/`mermaid` block showing an outcome, or a before/after pair.

| Metric | Threshold |
| --- | --- |
| Time to value — `(proof − T) / BODY` | 🟢 < 15% · 🟠 < 30% · 🔴 ≥ 30% |
| Install-before-proof — a `<Prerequisite>` or `apt install` before the proof | red flag, binary |
| Abstraction-before-proof — an implementation <Link to="/blog/docusaurus-snippets">`<Snippet>`</Link> before the proof | red flag, binary |
| Unmarked deep-dive — an internals section whose title gives no "optional" signal | count |
| Landing — do the last three paragraphs recap *and* point somewhere? | yes / no |

The two red flags matter more than the percentage. **Install-before-proof** asks the reader for effort before giving them a reason. **Abstraction-before-proof** dumps three hundred lines of implementation on someone who does not yet know what it does — and who therefore cannot possibly judge it.

### Pass 2 — Is any of this new?

Time-to-value gets the reader in; repetition drives them back out. The method is equally mechanical: pull the article's core claims out of the TLDR, the `##` headings and any takeaways card — usually four to six distinct facts — then `grep` each one and count where it lands. Above three occurrences of the same fact, something is dead weight.

The shapes that kept recurring in my own writing:

- a takeaways card mirroring the body one-for-one;
- a bullet list whose items are just the section headings restated as sentences;
- an intro sentence that repeats its own heading;
- a step-by-step list followed by one subsection per step — the list was a summary of the sections directly beneath it;
- the same warning in two `<AlertBox>` in different sections, invariably a leftover from an earlier restructuring.

The rule I ended up with: **each paragraph must carry at least one fact stated nowhere else.** Not a new angle on a known fact — a new fact.

### Pass 3 — The thirty-second test

Read only the title, the `description`, and lines `T` to `T + 40`. Nothing else. Then answer, as someone who has never heard of this tool: *do I keep reading, or do I leave?* And: *what is this article asking me to do before it has shown me anything?*

This is the pass that decides. An article can score 12% and still lose the reader if the opening never says what the thing is *for*.

## The Verdict Scale, and the Rule That Saved the Audit

Exactly one verdict per article:

| Verdict | Condition | Action |
| --- | --- | --- |
| `OK` | proof in the first screen, no red flag, the 30-second test says "keep reading" | journal entry only |
| `MINOR` | sound structure, one weakness — flat ending, unmarked deep-dive, proof slightly late | journal + one line, **no TODO** |
| `RESTRUCTURE` | 🔴 TTV, **or** either red flag, **or** the 30-second test says "I leave" | one TODO |

That middle row is the most important design decision in the whole thing. **`MINOR` never produces a TODO.** In a sweep over 318 articles, 109 came back MINOR — and if each had produced a file, the 180 genuine problems would have been buried under 109 notes saying "the ending is a bit flat".

An audit that flags everything flags nothing.

## What a Fix Actually Looks Like

Every `RESTRUCTURE` produces one file, and its core is a table with a column that is not optional: **where each block comes from**. Here is the real one for the Docker volumes article:

| New order | Content | Comes from |
| --- | --- | --- |
| 1. Hook | unchanged, up to `<!-- truncate -->` | l. 1-31 |
| 2. The result | the before/after pair: counter reset to 1 after a `down/up`, then the same counter preserved once a volume is declared | l. 86-97 + l. 115-127 |
| 3. Why it works | the three strategies as three bullets, no code | `<StepsCard>` from the Conclusion, l. 271-279 |
| 4. Installation | `Dockerfile`, `counter.sh`, `compose.yaml`, the build — collapsed | l. 33-75 |
| 5. More demos | Docker-managed volumes, then bind mounts | l. 103-143 + l. 217-243 |
| 6. Under the hood *(skip if you just want to use it)* | where Docker stores volumes, the `root` permission problem | l. 145-215 + l. 245-267 |
| 7. Conclusion | unchanged, minus the `<StepsCard>` promoted to 3 | l. 269-287 |

Look at row 3. The best summary in that entire article — three lines that explain when to use which kind of volume — was in a takeaways card, in the conclusion, at the very bottom. The reader who needed it most had already left.

**The proposed fix is always a reorder, never a cut.** Naming the source line range for every block is what enforces that, and it is also what makes the change safe to apply later: nothing can quietly go missing.

<AlertBox variant="tip" title="Time-to-value is about order, not length">
A long deep-dive section is not a finding. A thousand-word section on internals is legitimately the bulk of a good technical article — the problem is only that nothing tells the reader they have already got what they came for. Retitle it `## Under the Hood (skip this if you just want to use it)` and the same thousand words stop being an obstacle.
</AlertBox>

## Under the Hood (skip this if you just want the method)

### Auditing and fixing must be separate steps

My audit tooling cannot edit articles. That is deliberate, not a limitation: restructuring moves whole sections and rewrites the transitions between them, which is real writing work. An audit that "helpfully" starts editing produces changes nobody reviewed, in an article nobody re-read.

Measure, report, file. Then, separately, decide and apply.

### A journal, or you will audit the same article three times

Every audited article gets one row: date, slug, published or draft, the measured TTV with a short justification, the verdict, and the TODO if there is one. Sessions resume from it. Without that file, a corpus this size is simply not auditable — you lose track after the second sitting.

It also turns into an unexpectedly useful artifact. Re-auditing after the restructures, the journal is what let me write entries like *"3.3% ✅ (image l. 40, body of 241 lines), restructuring of 08-11 confirmed"* — the fix verified with the same measurement that found the problem.

### Batches of fifteen, maximum

Each article costs one structural scan plus a read of its opening. Past fifteen in a session, the overhead of holding them all in mind outweighs anything saved by batching. Fifteen, then stop, then resume from the journal.

### The re-audit found things the first pass could not

Reading an article you restructured yesterday is not the same as reading it cold. Two examples from my own second pass: an article whose conclusion is a thank-you note to the tool's developers and therefore has no exit link at all, and another where the token-generation command uses `-base64 24` in step 1.1 and `-base64 32` in the security section. Neither is a structural problem. Both were only visible once the structure stopped shouting.

## Conclusion

The uncomfortable part of this is not that 180 of my articles needed restructuring. It is that not one of them needed *new material*. The proof was always written. The clearest summary was often already there, in the conclusion, three screens below the reader who gave up.

Three years of work was not missing — it was misplaced.

If you write technical articles, run the measurement on your last three. It takes two `grep`s each, and the number it gives you is not a matter of taste. Then check whether your best paragraph is in the last section, because on this blog that is where it was hiding — and I am fairly sure I am not special.
