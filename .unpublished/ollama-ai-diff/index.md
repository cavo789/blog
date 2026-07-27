---
slug: ollama-ai-diff
title: "ai-diff: What Actually Changed, Not a Wall of Plus and Minus Signs"
authors: [christophe, claude]
image: /img/v2/git-delta.webp
mainTag: ai
tags: [ai, ollama, zsh, git]
date: 2026-12-31
description: "A zsh function that compares two versions of a file — code against its last commit, or any two documents, .docx included — and explains what changed functionally: intent and effect, not a line-by-line transcript."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-diff: What Actually Changed, Not a Wall of Plus and Minus Signs](/img/v2/git-delta.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-diff qwen ollama zshrc massupload docling -->

<TLDR>
This article adds `ai-diff` to the "Ollama daily-use functions" series: point it at one file and it compares the working copy against the last git commit; point it at two files and it compares them directly, `.docx`/`.pdf` included via the same [Docling extraction](/blog/docling) used by `ai-translate`. Either way, the output isn't a line-by-line transcript — it's a plain-language explanation of what the change actually *does*, grouped by intent, most significant first.
</TLDR>

`git diff` and [`delta`](/blog/git-delta) are great at showing you *exactly* what changed, character by character — that's precisely their job, and I use both daily. But "exactly what changed" and "what this change means" are two different questions. Reviewing a 40-line diff of `massupload.sh` after not touching it for two months, I don't want to re-derive the intent from `+`/`-` signs — I want the two-sentence version a colleague would give me if I asked "what did you change here?"

<!-- truncate -->

## Two Ways to Compare

`ai-diff` accepts either one argument or two, and picks its mode based on that:

- **One file** — compares the working copy against the file's last committed version (`git show HEAD:<file>`). The everyday case: "what did I just change here."
- **Two files** — compares them directly, whatever they are. This is where it stops being git-specific: `ai-diff project_v1.docx project_v2.docx` works exactly like comparing two script versions, because both text extractions go through the same `_ai_extract_text` helper [introduced for `ai-translate`/`ai-summarize`](/blog/ollama-ai-docs) — `.docx`/`.pdf`/`.pptx`/`.xlsx`/`.html` via Docling, plain text and Markdown read directly.

<AlertBox variant="important" title="This article depends on two earlier ones">
`ai-diff` reuses `_ai_extract_text` from `_ai-docs.zsh` — install that file (from the ai-translate/ai-summarize article) alongside this one, or two-file mode against office documents won't work. Single-file git mode doesn't need it.
</AlertBox>

## The `ai-diff` Function

<Snippet filename="~/.zsh/fns/ai-diff.zsh" source="./files/ai-diff.zsh" defaultOpen={true} />

The prompt is where the actual point of this function lives: explicitly told to explain *functionally* — intent and effect — group related changes together, skip purely cosmetic ones, and lead with the most significant change. Without that instruction, a model asked to "compare these two texts" defaults to restating the diff in prose, which is barely more useful than the diff itself.

<AlertBox variant="note" title="Identical versions short-circuit immediately">
If the two texts come out byte-identical, `ai-diff` says so and returns without ever calling the model — no point spending a request explaining that nothing changed.
</AlertBox>

## Demo — A Script Against Its Last Commit

<Snippet filename="massupload.sh — before (HEAD)" source="./files/massupload_old.sh" defaultOpen={false} />
<Snippet filename="massupload.sh — after (working copy, staged)" source="./files/massupload_new.sh" defaultOpen={false} />

<Terminal source="./files/terminal_diff_git.txt" typewriter />

Four bullet points, and notice what's *not* there: no mention of the new `upload_one()` function existing, no mention of the loop restructuring — those are implementation details in service of the actual changes (parallelism, retry, filtering, error visibility), which is exactly the altitude I wanted.

## Demo — Two Document Versions

<Terminal source="./files/terminal_diff_docs.txt" typewriter />

This is the case that started the idea: two versions of a project charter, and instead of a paragraph-by-paragraph reading of both, four bullet points that would let me answer "what changed in the new scope" in a meeting without having opened either file beforehand — including the budget percentage, computed by the model from the two raw numbers.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[diff]=...` — reachable as `ai diff <file> [other-file]` or directly as `ai-diff`, alongside every other function in the series.

<AlertBox variant="caution" title="Functional isn't the same as complete">
A four-bullet summary will, by design, drop details a line-by-line diff wouldn't. For code you're about to merge, this is a first read, not a replacement for `git diff` or [`delta`](/blog/git-delta) — use `ai-diff` to orient yourself, then look at the real diff for anything you're about to approve.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-diff quick reference"
  steps={[
    { content: "**One argument** — working copy vs last git commit" },
    { content: "**Two arguments** — any two files, any format `_ai_extract_text` supports" },
    { content: "**Functional, not line-by-line** — intent and effect, grouped, most significant first" },
    { content: "**Identical texts short-circuit** — no model call wasted on \"nothing changed\"" },
    { content: "**Registers into `ai`** — reachable as `ai diff`" }
  ]}
/>

## Conclusion

`git diff` will always tell me *what* changed, character by character, and I'm not giving that up — [`delta`](/blog/git-delta) makes it genuinely pleasant to read. `ai-diff` answers a different question, the one I actually ask out loud more often: not "what are the exact changes" but "what does this change *mean*." Between a two-month-old shell script and a client's project charter that grew a Risks section overnight, that's turned out to be the more common question by far.
