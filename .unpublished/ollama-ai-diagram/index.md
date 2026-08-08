---
slug: ollama-ai-diagram
title: "ai-diagram: From a Sentence (or a compose.yaml) to a Mermaid Diagram"
authors: [christophe, claude]
image: /img/v2/diagrams.webp
mainTag: doc-as-code
tags: [doc-as-code, ai, ollama, zsh]
date: 2026-12-31
description: "A zsh function that turns a plain-English description, or an existing config file like a docker-compose.yaml, into a Mermaid diagram — printed as a ready-to-paste fenced code block. Where docker-python-mermaid parses structured data with Python, ai-diagram understands loosely-structured input a parser can't."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-diagram: From a Sentence (or a compose.yaml) to a Mermaid Diagram](/img/v2/diagrams.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-diagram qwen ollama zshrc mermaid -->

<TLDR>
This article adds `ai-diagram` to the "Ollama daily-use functions" series: give it a plain-English description of a process, or point it at a file like a `docker-compose.yaml`, and it returns a Mermaid diagram — a fenced code block, ready to paste straight into a Markdown file. It's a deliberate bridge between this series and my doc-as-code articles: `docker-compose-viz` and `docker-python-mermaid` both turn *structured* data into diagrams with real parsers; `ai-diagram` handles the case those can't — a description with no schema at all, or a config file you don't want to write a parser for just to sketch one diagram.
</TLDR>

I've written more "turn X into a diagram" articles than I first realized: [Diagrams as code](/blog/docker-diagram-as-code), [a graph from compose.yaml](/blog/docker-compose-viz), [documentation as code with Python and Mermaid](/blog/docker-python-mermaid). Every one of them shares the same shape: a real parser reads a structured input and a library draws the picture. That works great — right up until what I want to diagram is a paragraph I just typed, or a one-off config file that isn't worth writing a parser for.

<!-- truncate -->

## Demo — Plain-English Description

<Terminal source="./files/terminal_diagram_text.txt" typewriter />

No YAML, no schema, just a sentence — and a flowchart that correctly branches on the validation outcome, which I didn't explicitly spell out as a "decision point" in the description.

## Demo — An Existing Config File

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={false} />

<Terminal source="./files/terminal_diagram_file.txt" typewriter />

Three services, their dependency edges, and the named volume — read straight out of the compose file's own structure, no manual translation into "what depends on what" required.

<AlertBox variant="caution" title="Read the Mermaid before you trust it">
For anything going into actual documentation — an onboarding doc, an architecture decision record — treat this the same way as `docker-compose-viz`'s output: a strong first draft. The model can miss an edge case (a `depends_on: condition: service_healthy`, a less obvious network alias) that a real parser like `docker-python-mermaid`'s wouldn't.
</AlertBox>

## Where This Actually Sits Next to `docker-python-mermaid`

<AlertBox variant="info" title="Not a replacement — a different input shape">
[`docker-python-mermaid`](/blog/docker-python-mermaid) is the right tool when the source is genuinely structured (a directory tree, a real schema) and you want a diagram that's guaranteed to match it exactly, every time, deterministically. `ai-diagram` is for the other half of the job: a Slack message's worth of description, or a file you have but no parser for. Less precision, way less setup — I use both, depending on which one I actually have in hand.
</AlertBox>

## The `ai-diagram` Function

<Snippet filename="~/.zsh/fns/ai-diagram.zsh" source="./files/ai-diagram.zsh" defaultOpen={true} />

Two input modes, detected the same way `ai-summarize` and `ai-translate` already do it:

1. **A file** — read as-is, and the prompt is told to infer the diagram type from context (a `compose.yaml` implies a service graph, a folder listing implies a tree, an OpenAPI spec implies a sequence diagram).
2. **Free text** — everything after the command is treated as the description, and the model picks whichever Mermaid diagram type fits best on its own.

Either way, the instruction is strict: output *only* the fenced `` ```mermaid `` block, nothing before or after — this blog renders Mermaid natively, so the output is meant to be pasted directly into a post, not read as prose first.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[diagram]=...` — reachable as `ai diagram <input>` or directly as `ai-diagram`, alongside every other function in the series.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-diagram quick reference"
  steps={[
    { content: "**Two input modes** — an existing file, or free-text description, auto-detected" },
    { content: "**Diagram type is inferred** — flowchart, sequence, ER, class, state — the model picks based on context" },
    { content: "**Output is fence-only** — a raw ```mermaid block, meant to be pasted directly" },
    { content: "**Complements, doesn't replace, `docker-python-mermaid`** — use a real parser for structured, exact input; use this for everything else" },
    { content: "**Registers into `ai`** — reachable as `ai diagram`" }
  ]}
/>

## Conclusion

My doc-as-code articles have always assumed I already had something structured to feed a parser. `ai-diagram` is what fills the gap before that point — the sentence I just typed, the file I have but haven't written a parser for. It won't replace [Diagrams as code](/blog/docker-diagram-as-code) or [docker-python-mermaid](/blog/docker-python-mermaid) for anything that needs to be exact and reproducible, but for the "let me just sketch this quickly" case that used to mean opening a whiteboard tool, it's turned into one command and a paste.
