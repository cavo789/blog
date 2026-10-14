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
series: "Ollama daily use"
---

![ai-translate: Translate Any Text Locally — String, Pipe, or File](/img/v2/typewriter_terminal.webp)

<!-- cspell:ignoreCase ai-translate ai-summarize ai-docs ollama zshrc qwen docling deploymentpijplijn gepland onderhoud OLLAMA_TRANSLATE_LANG -->

<TLDR>
This article adds a standalone `ai-translate` to the "Ollama daily use" series: a three-mode function that accepts an inline string, piped terminal output, or a file path, and translates the text into any language — English by default. No cloud API, no browser tab: the model runs locally, the text never leaves the machine. File mode reuses `_ai_extract_text` from <Link to="/blog/ollama-ai-docs">ai-translate & ai-summarize</Link> when available, so `.pdf`/`.docx`/`.pptx` files work too — but the function degrades gracefully to `cat` for plain text if that helper isn't installed yet.
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

No need to copy anything yet: the `.zsh` files shown in this article are here to be read, and [Installing It](#installing-it) at the end creates every one of them in `~/.zsh/fns/` for you.

<Snippet filename="~/.zsh/fns/ai-translate.zsh" source="./files/ai-translate.zsh" defaultOpen={true} />

The three cases — piped stdin, file path, inline string — cover every real entry point I could think of for a translation task in the terminal. The `OLLAMA_TRANSLATE_LANG` env var lets you change the default permanently if English isn't your most common target:

```bash
# In ~/.zshrc, if French is your everyday default:
export OLLAMA_TRANSLATE_LANG=French
```

<AlertBox variant="note" title="This supersedes the ai-translate from ai-docs">
`ai-translate` was first introduced in <Link to="/blog/ollama-ai-docs">ai-translate & ai-summarize: Confidential Documents, Handled 100% Locally</Link>, as a document-only function that defaulted to French. This standalone version supersedes it: it handles plain text and piped input as well as files, and defaults to English. If you already have the older version installed, save this one over it: same `~/.zsh/fns/ai-translate.zsh` file name, same `ai translate` entry in the menu. `_ai-docs.zsh` and `ai-summarize.zsh` stay as they are.
</AlertBox>

## File Mode

When the first argument is a path that exists on disk, `ai-translate` reads the file. For plain `.md` and `.txt` files it uses `cat` directly — no dependencies. For `.pdf`, `.docx`, `.pptx`, `.xlsx` and `.html` files, it delegates to `_ai_extract_text`, the Docling-backed helper introduced in <Link to="/blog/ollama-ai-docs">ai-translate & ai-summarize</Link>:

```zsh
# Translates a plain Markdown file — no extra dependency
ai-translate release-notes.md French

# Translates a Word document — requires _ai-docs.zsh installed
ai-translate quarterly-report.docx Dutch
```

If `_ai_extract_text` isn't installed yet, office formats fall back to `cat`, which will produce garbled output — the function won't crash, but the translation won't be useful. Install `_ai-docs.zsh` alongside if you need `.docx`/`.pdf` support.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[translate]=...` — reachable as `ai translate "text"` or directly as `ai-translate`, alongside every other function in the series.

`_ollama_query` and the `AI_COMMANDS` registry live in the shared `_ollama.zsh` foundation introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>. If you already followed an earlier article in this series, it's already sitting in `~/.zsh/fns/` and sourced by your autoloader — nothing more to do. Starting here instead? It is one of the files created in [Installing It](#installing-it) below.

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

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-translate.zsh" source="./files/ai-translate.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-translate
```

`ai-translate is a shell function from …/ai-translate.zsh` means you're ready. `ai-translate not found` means step 2 is missing.

## Conclusion

`ai-translate` doesn't eliminate the need to work across languages — it just removes the browser tab from the equation. A French error log, a Dutch Slack message, a commit history that needs to go into an English release note: one command, same terminal, no context switch. The function is deliberately small — three cases, one prompt, one `_ollama_query` call — because translation doesn't need to be complicated. It just needs to be there.
