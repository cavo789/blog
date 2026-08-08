---
slug: ollama-ai-translate
title: "ai-translate: Translate Any Text Locally — String, Pipe, or File"
authors: [christophe, claude]
image: /img/v2/typewriter_terminal.webp
mainTag: ai
tags: [ai, ollama, zsh, linux]
date: 2026-12-31
description: "A zsh function that translates text, piped output, or a document into any language — English by default — without a single byte leaving your machine. Three modes, one command."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-translate: Translate Any Text Locally — String, Pipe, or File](/img/v2/typewriter_terminal.webp)

<!-- cspell:ignoreCase ai-translate ai-summarize ai-docs ollama zshrc qwen docling deploymentpijplijn gepland onderhoud OLLAMA_TRANSLATE_LANG -->

<TLDR>
This article adds a standalone `ai-translate` to the "Ollama daily-use functions" series: a three-mode function that accepts an inline string, piped terminal output, or a file path, and translates the text into any language — English by default. No cloud API, no browser tab: the model runs locally, the text never leaves the machine. File mode reuses `_ai_extract_text` from [ai-translate & ai-summarize](/blog/ollama-ai-docs) when available, so `.pdf`/`.docx`/`.pptx` files work too — but the function degrades gracefully to `cat` for plain text if that helper isn't installed yet.
</TLDR>

Three colleagues, three languages — by the end of any given week, my terminal has seen error messages in French, commit summaries in Dutch, and CI logs in English that somebody needs handed back in French. Not because the tools care which language they write in, but because the people configuring them do. Opening a browser tab for two lines of text is the kind of friction that accumulates quietly: small enough that you stop noticing, large enough that by Thursday you've probably broken focus a dozen times for no good reason.

<!-- truncate -->

## Demo — Inline String

<Terminal source="./files/terminal_text.txt" typewriter />

One argument, no quoting required beyond the string itself — paste a message from a colleague, a log line, or a Jira comment and get the English back in the same terminal pane you were already in.

## Demo — Piped Output

<Terminal source="./files/terminal_pipe.txt" typewriter />

The pipe case is the one I reach for most often: `git log --oneline | ai-translate` turns a week of French commit history into something a non-French reviewer can skim without opening a browser tab.

## Demo — Other Languages

<Terminal source="./files/terminal_lang.txt" typewriter />

<AlertBox variant="tip" title="Use full language names, not ISO codes">
Pass `French` rather than `fr`, `Dutch` rather than `nl`. LLMs respond more reliably to full language names than to ISO codes — the codes are lookup keys; the names carry semantic weight the model can act on directly.
</AlertBox>

## Three Modes, One Function

`ai-translate` detects how it was called and picks the right source automatically:

<Snippet filename="~/.zsh/fns/ai-translate.zsh" source="./files/ai-translate.zsh" defaultOpen={true} />

The three cases — piped stdin, file path, inline string — cover every real entry point I could think of for a translation task in the terminal. The `OLLAMA_TRANSLATE_LANG` env var lets you change the default permanently if English isn't your most common target:

```bash
# In ~/.zshrc, if French is your everyday default:
export OLLAMA_TRANSLATE_LANG=French
```

<AlertBox variant="note" title="This supersedes the ai-translate from ai-docs">
`ai-translate` was first introduced in [ai-translate & ai-summarize: Confidential Documents, Handled 100% Locally](/blog/ollama-ai-docs), as a document-only function that defaulted to French. This standalone version supersedes it: it handles plain text and piped input as well as files, and defaults to English. If you already have the older version installed, sourcing this file after it will replace the function — or remove the `ai-translate` definition from `_ai-docs.zsh` and keep only `_ai_extract_text` and `ai-summarize`.
</AlertBox>

## File Mode

When the first argument is a path that exists on disk, `ai-translate` reads the file. For plain `.md` and `.txt` files it uses `cat` directly — no dependencies. For `.pdf`, `.docx`, `.pptx`, `.xlsx` and `.html` files, it delegates to `_ai_extract_text`, the Docling-backed helper introduced in [ai-translate & ai-summarize](/blog/ollama-ai-docs):

```zsh
# Translates a plain Markdown file — no extra dependency
ai-translate release-notes.md French

# Translates a Word document — requires _ai-docs.zsh installed
ai-translate quarterly-report.docx Dutch
```

If `_ai_extract_text` isn't installed yet, office formats fall back to `cat`, which will produce garbled output — the function won't crash, but the translation won't be useful. Install `_ai-docs.zsh` alongside if you need `.docx`/`.pdf` support.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[translate]=...` — reachable as `ai translate "text"` or directly as `ai-translate`, alongside every other function in the series.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-translate quick reference"
  steps={[
    { content: "**Three modes** — inline string, piped stdin, or file path; detected automatically" },
    { content: "**English by default** — pass a second argument or set `OLLAMA_TRANSLATE_LANG` to change it" },
    { content: "**Use full language names** — `French`/`Dutch`/`Spanish`, not `fr`/`nl`/`es`" },
    { content: "**Office files via Docling** — `.pdf`/`.docx`/`.pptx` need `_ai_extract_text` from `_ai-docs.zsh`" },
    { content: "**Nothing leaves the machine** — the local Ollama model handles everything end to end" },
    { content: "**Registers into `ai`** — reachable as `ai translate`" }
  ]}
/>

## Conclusion

`ai-translate` doesn't eliminate the need to work across languages — it just removes the browser tab from the equation. A French error log, a Dutch Slack message, a commit history that needs to go into an English release note: one command, same terminal, no context switch. The function is deliberately small — three cases, one prompt, one `_ollama_query` call — because translation doesn't need to be complicated. It just needs to be there.
