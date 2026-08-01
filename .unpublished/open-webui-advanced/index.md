---
slug: open-webui-advanced
title: "Open WebUI — Beyond the Chat: Models, RAG, and Functions"
description: "Open WebUI is much more than a chat interface for Ollama. Custom model presets with system prompts, local document RAG, web search, and a Python Function system let you build a genuinely useful local AI workspace."
authors: [christophe, claude]
image: /img/v2/using_ollama_local_network.webp
mainTag: ai
draft: true
tags: [ai, docker, ollama, self-hosted]
date: 2026-09-22
ai_assisted: true
tried_it: false
---

![Open WebUI — Beyond the Chat: Models, RAG, and Functions](/img/v2/using_ollama_local_network.webp)

<TLDR>
Open WebUI's chat window is the surface. Below it: custom model presets with fixed system prompts and temperature, a knowledge base for RAG (upload PDFs and Markdown files, ask questions, get grounded answers), web search integration, and a Python Function system that lets you extend the interface with your own tools. This article walks through each, starting from a basic install.
</TLDR>

If you installed Open WebUI to chat with Ollama and haven't explored further, you've been using about 20% of what's there. The rest is accessible through the tabs and menus that easy to overlook when you just want to ask a question.

This article picks up where <Link to="/blog/ollama-installation">the Ollama installation guide</Link> left off — assuming you have Ollama running locally and Open WebUI up on port 4000 (or wherever you deployed it).

<!-- truncate -->

## Setup reminder

If you don't have Open WebUI running yet, the minimal `compose.yaml`:

<Snippet source="./files/compose.yaml" language="yaml" />

<Terminal>
docker compose up -d
# open http://localhost:4000
</Terminal>

The `open-webui` volume persists all your data — conversations, uploaded documents, custom models, functions — across container restarts and updates. Don't skip it.

<AlertBox type="info" title="Version note">
Open WebUI evolves rapidly. This article reflects the feature set available in versions 0.4 and later. The UI layout changes between releases, but the features described here have been stable across several recent versions.
</AlertBox>

## Model presets — same Ollama model, different persona

Ollama has one `qwen3-coder:30b` model. But you might want to talk to it as a strict code reviewer one moment and a brainstorming partner the next — with different system prompts and temperature settings for each.

**Workspace → Models → + New Model**

Give it a name ("Code Reviewer"), select the base model from Ollama, and configure:

- **System prompt**: the instruction that frames every conversation with this preset. For a code reviewer: *"You are a strict code reviewer. Focus on correctness, security, and maintainability. Point out issues directly. Do not suggest cosmetic changes."*
- **Temperature**: lower (0.1–0.3) for deterministic, structured output; higher (0.7–0.9) for creative tasks. The default is usually 0.8.
- **Context length**: how many tokens from the conversation history to include. Raising this lets the model remember more of a long conversation, at the cost of more VRAM.

Save the preset. It now appears in the model selector at the top of every chat. You can switch between "Code Reviewer", "Brainstorm Partner", and "Explain Like I'm Five" as easily as switching chat tabs.

<AlertBox type="tip" title="Emoji in model names">
Open WebUI displays model names in the selector list. Using an emoji prefix (`🔍 Code Reviewer`, `🧠 Brainstorm`, `🐣 ELI5`) makes it easy to scan the list at a glance.
</AlertBox>

## Knowledge — RAG on your local documents

**Workspace → Knowledge → + New Knowledge**

A Knowledge collection is a group of documents that Open WebUI indexes and uses to ground answers. Unlike raw chat, answers from a RAG query cite the specific passages they drew from.

**What you can upload:**
- PDF files (scanned documents work if text is extractable)
- Markdown files
- Plain text, DOCX, XLSX
- Web page URLs (Open WebUI fetches and indexes the content)

**Workflow:**

1. Create a Knowledge collection, e.g., "Project Documentation"
2. Upload your documents (drag and drop in the collection view)
3. Wait for indexing — a progress indicator shows each file being processed
4. In a chat, click the `+` button → **Knowledge** → select your collection
5. Ask questions: *"What does the API authentication section say about token expiry?"*

Open WebUI retrieves the most relevant passages and includes them in the model's context. The model answers based on your documents, not its training data — and cites which document and section it used.

**Practical use cases:**
- Technical documentation for a project you're working on
- A collection of Markdown notes you want to query
- A set of PDF specs or RFCs you need to cross-reference
- Your own blog articles (query your own writing)

<AlertBox type="info" title="Embedding models">
RAG requires an embedding model to index documents. Open WebUI defaults to using Ollama for embeddings if available, or a built-in sentence transformer. You can change the embedding model in **Settings → Documents → Embedding Model**. A dedicated embedding model (like `nomic-embed-text`) improves retrieval quality and uses less VRAM than routing through your main LLM.
</AlertBox>

## Web search integration

**Settings → Web Search**

Enable it and select a search engine. Options include SearXNG (self-hosted — pairs naturally with a local Open WebUI setup), DuckDuckGo, Google, Brave, and others. For SearXNG, you point it at your own instance URL and no API key is needed.

With web search active, you can toggle it per-message using the search icon in the chat toolbar, or enable it by default for a model preset. When enabled, Open WebUI queries the search engine, fetches the top results, and includes the content in the model's context — giving it current information beyond its training cutoff.

## Functions — extend Open WebUI with Python

**Workspace → Functions**

Functions are Python classes that run inside Open WebUI. They can add tools, modify prompts before they reach the model, or process the model's response before it reaches you. Three types:

- **Tools**: callable functions the model can invoke (like MCP tools)
- **Filters**: modify messages in or out — pre-process your prompt, post-process the response
- **Pipes**: replace the model entirely with a custom flow (call an external API, chain models, etc.)

The simplest Function is a Tool. Here's one that wraps a summarization prompt:

<Snippet source="./files/summarize-function.py" language="python" />

Install it: **Workspace → Functions → + New Function → paste → Save**.

The function appears as a tool in the chat toolbar. Click it, paste text, and the model summarizes it according to the configured word count and language.

Functions can do much more — query a database, call a REST API, read files from the host — because they run as Python inside the Open WebUI container. The `Valves` pattern (a Pydantic model) provides user-configurable settings shown in the function's settings panel.

<AlertBox type="tip" title="Community functions">
The Open WebUI [community hub](https://openwebui.com/functions) has ready-to-install Functions for common tasks: web scraping, code execution, image generation, translation, and more. Install them with one click from within Open WebUI (Settings → Get Community Functions).
</AlertBox>

## Conversation management

A few features that make daily use more comfortable:

**Folders**: organize conversations into named folders (right-click a conversation in the sidebar). Useful when you maintain separate threads for different projects.

**Tags**: tag conversations for quick filtering. The sidebar has a tag filter at the bottom.

**Conversation sharing**: generate a shareable link for any conversation (the share icon in the chat header). Useful for showing a colleague the exact exchange without copy-pasting.

**Regenerate**: hover over any model response and click the regenerate button (circular arrows) to get a different answer with the same prompt and settings. The model is stochastic — temperature means the same prompt produces different outputs.

## Accessing Open WebUI from other devices

If Ollama is running on your main workstation and Open WebUI is on port 4000, other devices on your LAN can reach it at `http://your-ip:4000`. The <Link to="/blog/accessing-ollama-across-your-local-network">Accessing Ollama across your local network</Link> article covers the network setup — Open WebUI sits in front of Ollama, so the same approach applies.

For HTTPS on the local network (useful if you want to use the camera or microphone APIs in the browser), point Caddy at Open WebUI as a reverse proxy — the approach from the Caddy article in this series applies directly.

## Conclusion

Open WebUI's value compounds as you layer these features. A model preset with the right system prompt and temperature removes the friction of re-explaining your context on every chat. A RAG knowledge base anchors answers in your actual documents. Web search adds current information. Functions add capabilities the base model doesn't have.

The chat window is just the beginning — spend an afternoon in Workspace and Settings, and you'll find a genuinely configurable local AI environment that's worth the time to set up properly.
