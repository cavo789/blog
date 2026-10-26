---
slug: open-webui-advanced
title: "Open WebUI — Beyond the Chat: Models, RAG, Tools and API Keys"
description: "Open WebUI is much more than a chat interface for Ollama. Custom model presets with system prompts, local document RAG, web search, Python Tools and personal API keys let you build a genuinely useful local AI workspace."
authors: [christophe, claude]
image: /img/v2/exploring_webgui.webp
mainTag: ai
tags: [ai, docker, ollama, self-hosted]
date: 2026-10-26
ai_assisted: true
tried_it: false
---

![Open WebUI — Beyond the Chat: Models, RAG, Tools and API Keys](/img/v2/exploring_webgui.webp)

<TLDR>
Open WebUI's chat window is the surface. Below it: custom model presets with fixed system prompts and temperature, a knowledge base for RAG (upload PDFs and Markdown files, ask questions, get grounded answers), web search integration, a Python plugin system (Tools and Functions) to extend it, and personal API keys to drive it all from scripts. This article walks through each, starting from a basic install.
</TLDR>

If you installed Open WebUI to chat with Ollama and haven't explored further, you've been using about 20% of what's there. The rest is accessible through the tabs and menus that are easy to overlook when you just want to ask a question.

This article picks up where <Link to="/blog/ollama-installation">the Ollama installation guide</Link> left off — assuming you have Ollama running locally and Open WebUI up on port 4000 (or wherever you deployed it).

<!-- truncate -->

## Seeing It Work

Open WebUI exposes an OpenAI-compatible API, protected by a personal API key. Here it summarizes real meeting notes, called straight from a terminal:

<Terminal source="./files/terminal_summarize.txt" typewriter />

Replace `qwen2.5-coder:3b` with one of the ids the second command printed on your machine — the [model name section](#4-pick-a-model-name-the-api-knows) explains why. Three bullet points, grounded in the actual numbers and dates from the text — not a generic restatement. That's the same request the chat window sends — the [API keys section](#api-keys) below shows how to get the `$TOKEN`, and the [Tools section](#tools-and-functions) packages the same prompt as a reusable Tool.

<AlertBox variant="tip" title="Translate into...">
Just add `Answer in French.` in the system prompt to get answers in French.

```bash
- **Decision:** Migrer le staging de PostgreSQL 12 à PostgreSQL 16, échéance du 15 octobre.
- **Action:** Tom rédige un plan de remise en arrière pour une vérification avec Sarah avant le 15 octobre.
- **Budget:** Approuvé un budget de 4,200 EUR pour un contractor externe pour la migration.
```

</AlertBox>

## Why It Works

- **Model presets** are a saved combination of base model, system prompt and temperature — switching between "Code Reviewer" and "Brainstorm Partner" is a dropdown, not retyping context every time.
- **Knowledge (RAG)** indexes your own documents and grounds answers in them, citing the source passage — the model answers from what you gave it, not from training data.
- **Web search** hands the model current information beyond its training cutoff, toggled per-message or on by default for a preset.
- **Tools and Functions** are Python code running inside the container — Tools the model can call, and admin-level Functions (Pipes, Filters, Actions) that extend the platform itself.
- **API keys** let any script reach all of the above through an OpenAI-compatible endpoint.

These five are genuinely independent capabilities that happen to share one chat window, not five views onto the same feature.

## Setup reminder

If you don't have Open WebUI running yet, the minimal `compose.yaml` is below; the full walkthrough, with screenshots, is in the <Link to="/blog/ollama-installation#using-a-web-interface">Open WebUI section of the Ollama installation guide</Link>.

<Snippet source="./files/compose.yaml" language="yaml" />

<Terminal>
docker compose up -d
# open http://localhost:4000
</Terminal>

The `open-webui` volume persists all your data — conversations, uploaded documents, custom models, functions — across container restarts and updates. Don't skip it.

<AlertBox variant="info" title="Version note">
Open WebUI evolves rapidly. Menu paths in this article were checked against the official documentation in October 2026. A recurring change across releases: anything that affects **every** user (web search, document settings, Functions, API keys) lives in the **Admin Panel**, while personal building blocks (Models, Knowledge, Tools) live in **Workspace**.
</AlertBox>

## Model presets — same Ollama model, different persona

Ollama has one `qwen3-coder:30b` model. But you might want to talk to it as a strict code reviewer one moment and a brainstorming partner the next — with different system prompts and temperature settings for each.

### Workspace → Models → + New Model

Give it a name ("Code Reviewer"), select the base model from Ollama, and configure:

- **System prompt**: the instruction that frames every conversation with this preset. For a code reviewer: *"You are a strict code reviewer. Focus on correctness, security, and maintainability. Point out issues directly. Do not suggest cosmetic changes."*
- **Temperature**: lower (0.1–0.3) for deterministic, structured output; higher (0.7–0.9) for creative tasks. The default is usually 0.8.
- **Context length**: how many tokens from the conversation history to include. Raising this lets the model remember more of a long conversation, at the cost of more VRAM.

Save the preset. It now appears in the model selector at the top of every chat. You can switch between "Code Reviewer", "Brainstorm Partner", and "Explain Like I'm Five" as easily as switching chat tabs.

<AlertBox variant="tip" title="Emoji in model names">
Open WebUI displays model names in the selector list. Using an emoji prefix (`🔍 Code Reviewer`, `🧠 Brainstorm`, `🐣 ELI5`) makes it easy to scan the list at a glance.
</AlertBox>

## Knowledge — RAG on your local documents

### Workspace → Knowledge → + New Knowledge

A Knowledge collection is a group of documents that Open WebUI indexes and uses to ground answers. Unlike raw chat, answers from a RAG query cite the specific passages they drew from. If document Q&A is all you need, <Link to="/blog/anythingllm-chat-with-your-docs">AnythingLLM</Link> is a dedicated alternative that talks to the same Ollama instance.

### What you can upload

- PDF files (scanned documents work if text is extractable)
- Markdown files
- Plain text, DOCX, XLSX
- Web page URLs (Open WebUI fetches and indexes the content)

### Workflow

1. Create a Knowledge collection, e.g., "Project Documentation"
2. Upload your documents (drag and drop in the collection view)
3. Wait for indexing — a progress indicator shows each file being processed
4. In a chat, click the `+` button → **Knowledge** → select your collection
5. Ask questions: *"What does the API authentication section say about token expiry?"*

Open WebUI retrieves the most relevant passages and includes them in the model's context. The model answers based on your documents, not its training data — and cites which document and section it used.

### Practical use cases

- Technical documentation for a project you're working on
- A collection of Markdown notes you want to query
- A set of PDF specs or RFCs you need to cross-reference
- Your own blog articles (query your own writing)

<AlertBox variant="info" title="Embedding models">
RAG requires an embedding model to index documents. Open WebUI defaults to using Ollama for embeddings if available, or a built-in sentence transformer. You can change the embedding model in **Admin Panel → Settings → Documents → Embedding Model**. A dedicated embedding model (like `nomic-embed-text`) improves retrieval quality and uses less VRAM than routing through your main LLM.
</AlertBox>

## Web search integration

### Admin Panel → Settings → Web Search

Enable it and select a search engine. Options include SearXNG (self-hosted — pairs naturally with a local Open WebUI setup), DuckDuckGo, Google, Brave, and others. For SearXNG, you point it at your own instance URL and no API key is needed.

With web search active, you can toggle it per-message using the search icon in the chat toolbar, or enable it by default for a model preset. When enabled, Open WebUI queries the search engine, fetches the top results, and includes the content in the model's context — giving it current information beyond its training cutoff.

## Tools and Functions — extend Open WebUI with Python {#tools-and-functions}

Open WebUI has two Python plugin systems, managed in two different places:

- **Tools** (**Workspace → Tools**): functions the model can decide to call during a chat, like MCP tools. Any user granted the permission can add them.
- **Functions** (**Admin Panel → Functions**): admin-only extensions of the platform itself, for every user. Their type is inferred from the class name:
  - **Pipes** appear as a selectable model and replace the model call entirely (call an external API, chain models, etc.)
  - **Filters** modify messages in or out — pre-process your prompt, post-process the response
  - **Actions** add a button under a message

The simplest plugin is a Tool. Here's one that wraps a summarization prompt — the exact one behind the demo at the top of this article:

<Snippet source="./files/summarize-function.py" language="python" />

Install it: **Workspace → Tools → + New Tool → paste → Save**.

Then enable it for a chat with the `+` button (or attach it permanently to a model preset). Paste text, ask for a summary, and the model calls `summarize`, which frames the request according to the configured word count and language.

Tools and Functions can do much more — query a database, call a REST API, read files from the host — because they run as Python inside the Open WebUI container. The `Valves` pattern (a Pydantic model) provides admin-configurable settings shown in the plugin's settings panel.

<AlertBox variant="caution" title="It's arbitrary code">
Tools and Functions execute arbitrary Python on your server. Read the code before installing one — a listing on the community site is not a security review.
</AlertBox>

<AlertBox variant="tip" title="Community plugins">
The Open WebUI [community site](https://openwebui.com/) has ready-to-import Tools and Functions for common tasks: web scraping, code execution, image generation, translation, and more.
</AlertBox>

## API keys — call Open WebUI from scripts {#api-keys}

The `curl` call at the top of this article sends `Authorization: Bearer $TOKEN`. That token is a personal API key, and it is disabled by default. Three switches stand between a fresh install and a working key.

### 1. Turn the feature on (admin)

**Admin Panel → Settings → General → Authentication**, toggle **Enable API Key** on, then **Save**.

This is the master switch: while it's off, nobody — not even an admin — can generate a key. In the same section, **API Key Endpoint Restrictions** lets you limit which routes a key may call (for example only `/api/models,/api/chat/completions`).

### 2. Allow users to create keys (admin)

Non-admin users also need the **API Keys** feature permission:

- **For everybody**: **Admin Panel → Users → Groups → Default Permissions → Features Permissions**, toggle **API Keys** on, then **Save**.
- **For a few people only** (recommended): **Admin Panel → Users → Groups**, create or select a group, add the users, then **Permissions → Features Permissions → API Keys**.

### 3. Create the key (user)

Click your profile icon (bottom-left) → **Settings → Account**. The **API keys** line is only a heading: the controls sit on the line just below it, **Secrets**. Click **Show** on that line, then **Create new secret key**. Once the key exists, **Copy API Key** puts it on your clipboard; it starts with `sk-`.

<Terminal>
$ export TOKEN="sk-..."
$ curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/models
</Terminal>

A JSON list of models means the key works. A key carries exactly the permissions of the user who created it — it sees the same models, Knowledge collections and Tools — so create it from an account that has no more rights than the script needs.

### 4. Pick a model name the API knows

The `model` field of a request must be the **exact `id`** of a model in your instance — name and tag included. Anything else returns:

```json
{"detail":"Model not found"}
```

That message has nothing to do with the key: it means the name you sent isn't in the list. Print the valid ids — the `jq` filter keeps only the `id` field of each entry (see <Link to="/blog/linux-jq">The jq utility for Linux</Link> if the syntax is new to you):

<Terminal>
$ curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/models | jq -r '.data[].id'
</Terminal>

Copy one of them into `MODEL`, as in the example at the top of this article.

## Under the Hood (skip this if you just want to use it)

### Conversation management

A few features that make daily use more comfortable:

**Folders**: organize conversations into named folders (right-click a conversation in the sidebar). Useful when you maintain separate threads for different projects.

**Tags**: tag conversations for quick filtering. The sidebar has a tag filter at the bottom.

**Conversation sharing**: generate a shareable link for any conversation (the share icon in the chat header). Useful for showing a colleague the exact exchange without copy-pasting.

**Regenerate**: hover over any model response and click the regenerate button (circular arrows) to get a different answer with the same prompt and settings. The model is stochastic — temperature means the same prompt produces different outputs.

### Accessing Open WebUI from other devices

If Ollama is running on your main workstation and Open WebUI is on port 4000, other devices on your LAN can reach it at `http://your-ip:4000`. The <Link to="/blog/accessing-ollama-across-your-local-network">Accessing Ollama across your local network</Link> article covers the network setup — Open WebUI sits in front of Ollama, so the same approach applies.

For HTTPS on the local network (useful if you want to use the camera or microphone APIs in the browser), put a reverse proxy such as Caddy in front of Open WebUI.

## Conclusion

Open WebUI's value compounds as you layer these features. A model preset with the right system prompt and temperature removes the friction of re-explaining your context on every chat. A RAG knowledge base anchors answers in your actual documents. Web search adds current information. Tools and Functions add capabilities the base model doesn't have, and an API key opens all of it to your scripts — the summarize call at the top of this article is the smallest example.

The chat window is just the beginning — spend an afternoon in Workspace and Settings, and you'll find a genuinely configurable local AI environment that's worth the time to set up properly.
