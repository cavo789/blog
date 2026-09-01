---
slug: ollama-tag-suggester
title: Let Ollama Double-Check Your Blog Post Tags
authors: [christophe, claude]
image: /img/v2/workflows.webp
mainTag: ai
tags: [ai, docusaurus, nodejs, ollama, vscode]
date: 2026-12-31
description: "A Node.js script and a VS Code task that send an article's frontmatter and this blog's tag catalogue to a local Ollama model — confirming the tags already set and suggesting up to five relevant ones that are missing. Suggestion only: nothing is written back automatically."
language: en
ai_assisted: true
draft: true
series: "Ollama daily use"
---

![Let Ollama Double-Check Your Blog Post Tags](/img/v2/workflows.webp)

<!-- cspell:ignoreCase qwen mjs yaml -->

<TLDR>
Picking tags by hand from memory stops working once a tag catalogue passes a few dozen entries — you either forget a relevant one or, worse, keep one a rewritten article no longer supports. A small Node.js script sends the article and this blog's tag catalogue to a local Ollama model, which confirms the tags already set and suggests up to five it thinks are missing. Nothing is written to the article automatically — it is a second opinion, not an autopilot.
</TLDR>

I tag every post from memory, picking whatever feels right out of the several dozen tags this blog has accumulated. Most of the time that works fine. Then, while drafting the very article about using a local model to tag Markdown posts, I typed `docusaurus` into its own tag list out of habit — even though the article itself says, twice, that the pipeline it describes has nothing Docusaurus-specific about it. Nobody caught it before I did, and I only caught it because I happened to run the tool this post is about against my own draft.

<!-- truncate -->

## What `tags:suggest` Does For You

Point it at any article, and it reads the frontmatter plus <Link to="/blog/docusaurus-tags">the blog's tag catalogue</Link> to tell you which existing tags actually hold up — and which ones never made it in:

<Terminal source="./files/demo-undertagged.txt" typewriter />

Two tags on a post whose own description names Docker in its first sentence. Five real gaps came back, capped exactly where the prompt tells the model to stop — not because there was nothing else to say, but because precision beats recall here.

## Why It Works

- The "why" behind every confirmed or suggested tag is the tag's own description from `tags.yml` — text I already wrote and trust — not a free-text explanation invented by the model. There is nothing to fact-check in the output beyond the slug itself.
- The prompt asks for precision over recall: a tag only gets suggested if the model is confident, capped at five. A wrong "maybe" buried among real hits is worse than a missed one.
- It only ever reads the article and the tag catalogue and only ever prints to the terminal — the frontmatter itself is never touched, so a bad suggestion can never silently land in a published post.
- It runs against the same local Ollama instance the rest of the "Ollama daily use" series already assumes, so there is nothing new to install or authenticate against.

## Add It To Your Own Blog

This needs a local Ollama instance reachable from wherever the script runs — see <Link to="/blog/ollama-installation">Installing Ollama and get local AI</Link> if that part is not in place yet.

The script itself is plain Node.js, no dependencies beyond `js-yaml` for parsing the tag catalogue:

<Snippet filename="scripts/suggest-tags.mjs" source="scripts/suggest-tags.mjs" defaultOpen={false} />

Wire it up as a package script:

```json title="package.json"
"scripts": {
  "tags:suggest": "node scripts/suggest-tags.mjs"
}
```

And add a VS Code task so it can run against whatever article is currently open, instead of typing the path by hand:

<Snippet filename=".vscode/tasks.json" source=".vscode/tasks.json" defaultOpen={false} />

With the task in place, open an article and run it from the Command Palette — <kbd>F1</kbd>, **Tasks: Run Task**, then **Suggest tags (Ollama)** — and the output shows up in its own terminal panel.

## More Demos

It catches the opposite mistake too — a tag that is set but no longer earned. Running it against the draft of the very article about tagging blog posts with a local model turned up exactly the habit it was built to catch:

<Terminal source="./files/demo-suggestion.txt" typewriter />

I had typed `docusaurus` from muscle memory, even though that article says twice that its pipeline is nothing Docusaurus-specific. Caught by the tool the article is about, on the draft that introduced it.

And on a post that is already tagged correctly, it says so instead of inventing something to add:

<Terminal source="./files/demo-confirmed.txt" typewriter />

That "none" matters as much as a real suggestion: a tool that always finds something to add is not being honest about confidence, it is just filling space.

## Under the Hood (skip this if you just want to use it)

The response format matters more than it looks. Asking Ollama for `{ slug, reason }` objects — one per tag, with the model explaining itself — made the smaller local models return an empty array more often than not: the extra structure gave them room to hedge into nothing. Asking for a flat array of slugs, and pulling the "reason" back out of the catalogue's own descriptions afterward, fixed that outright.

The model choice mattered more. `task-tiny`, the small extraction model this series already uses for lightweight jobs, kept anchoring on the tags already set in the frontmatter instead of scanning the whole catalogue — it would confirm or reject what was there and almost never surface a real gap. Swapping in `qwen3-coder:30b`, already pulled on this machine for coding tasks, fixed that too: verified by hand on an article with a `Dockerfile`, a `compose.yaml` and two Python scripts in it, where the tiny model missed `docker`, `devcontainer` and `python` entirely and the bigger one caught all three, still in a few seconds since this only ever runs against one article at a time.

## Conclusion

The tag I almost shipped by habit is exactly the kind of mistake this tool exists to catch: not a typo, not a broken build, just a small inconsistency between what an article says and what its frontmatter claims — invisible to `yarn build`, invisible to a skim before hitting publish. A Node.js script, a VS Code task, and a model that already runs on this machine for other things now read every draft back to me before it ships. The <Link to="/blog/docusaurus-ollama-tags">next place I want to take this</Link> is comparing those tags across the whole corpus, not just one article at a time — using the tags a post ends up with to suggest which older posts it should link to.
