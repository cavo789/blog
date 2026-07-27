---
slug: anythingllm-chat-with-your-docs
title: "AnythingLLM: Chat With All Your Scattered Documentation"
authors: [christophe, claude]
image: /img/v2/using_ollama_local_network.webp
mainTag: ai
tags: [ai, ollama, docker, self-hosted]
date: 2026-12-31
description: "AnythingLLM turns a pile of Markdown, Quarto, PDF, DOCX, Excel and PowerPoint files into something you can actually chat with, backed by a local Ollama model. Part 1 sets it up on a single machine; Part 2 keeps the documents on my work PC while borrowing the GPU sitting at home."
language: en
ai_assisted: true
draft: true
---

![AnythingLLM: Chat With All Your Scattered Documentation](/img/v2/using_ollama_local_network.webp)

<!-- cspell:ignoreCase anythingllm lancedb nomic mintplexlabs qwen tailscale wireguard seccomp qmd -->

<TLDR>
AnythingLLM is a self-hosted, Docker-friendly app that turns your own documents — Markdown, Quarto, PDF, DOCX, Excel, PowerPoint, whatever — into a searchable, chattable knowledge base, with answers that cite the exact file they came from. It doesn't run its own AI; it talks to an LLM provider of your choice, which means it can reuse an Ollama server you already have running elsewhere. This article sets it up twice: once fully on one machine (my home PC), and once split across two — documents on my work PC, GPU inference on the home PC — because some documents are simply not allowed to leave the machine they live on.
</TLDR>

Under `~/repositories` on my work laptop, I have dozens of project folders, and every one of them has quietly grown its own pile of documentation: a `README.md` here, a Quarto report there, a PDF spec somebody sent me, an Excel sheet nobody remembers the purpose of anymore, a PowerPoint from a meeting six months ago. Individually, each file is fine. Together, they're a graveyard — I *know* I wrote down the answer to "how did I configure that VPN last time" somewhere, in one of these folders, in one of these formats, but finding it means either remembering the exact filename or grepping and hoping the words match.

If you've ever opened a terminal, typed `grep -r "some term" ~/repositories`, gotten forty irrelevant hits, and given up — you already have the problem this article is about.

<!-- truncate -->

## The Problem: Documentation Everywhere, Findable Nowhere

Text search tools like `rg` are great when you remember the exact word you're looking for. They're useless when you remember the *idea* but not the vocabulary — "that thing where I had to fix the CORS issue on the API" won't match a file that talks about "cross-origin" without ever using the word "CORS". Multiply that by dozens of repositories, several file formats that don't even open the same way (try grepping inside a `.xlsx`), and you get exactly the kind of mess that makes you close the terminal and just try to remember harder.

This is the specific itch AnythingLLM scratches: ask a question in plain English, across every document you've fed it, and get an answer built from whatever chunk of whatever file actually contains the relevant information — with a pointer back to that file.

## What AnythingLLM Actually Does

[AnythingLLM](https://anythingllm.com/) is an open-source, self-hosted application (Docker image or desktop app) built around one idea: Retrieval-Augmented Generation (RAG) over your own files, organized into **workspaces**.

A few concepts worth knowing before touching Docker:

- **Workspaces** are isolated containers of documents, vectors and settings. One workspace per project, per client, per topic — whatever separation makes sense for you. Nothing leaks between them.
- **Documents in, answers out.** You feed a workspace files — Markdown, Quarto `.qmd`, PDF, DOCX, XLSX, PPTX, CSV, HTML, 50+ source-code extensions, even YouTube transcripts and scraped web pages — and it chunks and embeds them into a vector database sitting right next to your documents.
- **Citations, not guesses.** Every answer comes back with a reference to the source file and the chunk it was pulled from, so you can go verify it instead of trusting a hallucination on faith.
- **It's a client, not an LLM.** AnythingLLM doesn't ship a model of its own — it calls out to an **LLM Provider** you configure: OpenAI, Anthropic, or, the interesting part for us, **Ollama**.

That last point is the one that makes this whole article possible: if you already run Ollama somewhere, AnythingLLM is just another thing that talks to it.

## Is It Actually Useful, or Just Another AI Toy?

Genuinely useful — for this specific job. It is not a replacement for `rg`; it's the tool you reach for once `rg` has failed you, because you know the idea but not the exact words, or because the answer is buried inside a PDF or a spreadsheet that grep can't even read. It's also not a replacement for Open WebUI: Open WebUI is your general-purpose chat client for Ollama, AnythingLLM is specifically the document-RAG layer on top of a model — the two coexist without stepping on each other's toes, both perfectly happy to talk to the same Ollama instance.

Where it stops being useful is if you expect it to behave like a live filesystem index. It doesn't watch folders and auto-update as you edit files — you (or a script) have to feed it documents, and the GUI currently uploads file by file (you can multi-select several at once from the OS file picker, but not an entire folder tree with subfolders). In practice, that pushes you toward exactly the workspace-per-project structure that makes sense anyway: one workspace per repository under `~/repositories`, its documents uploaded in one multi-select pass.

<AlertBox variant="tip" title="What you get for the setup effort">
A natural-language question over everything in a workspace, with the source file named in the answer. That single feature is worth the twenty minutes of Docker setup below — it turns "I know I wrote this down somewhere" into an actual answer.
</AlertBox>

## Part 1 — Running AnythingLLM on the Home PC

This is the simple case: AnythingLLM and Ollama live on the same machine, my home PC with 24GB of VRAM to spare.

<AlertBox variant="note" title="Prerequisites">
This assumes Ollama is already running as a Docker container, the way I set it up in <Link to="/blog/ollama-installation">Installing Ollama and get local AI</Link>. Nothing below re-explains that part.
</AlertBox>

### The compose.yaml file

Following my usual habit of one folder per tool under `~/tools`, let's create `~/tools/anythingllm/compose.yaml`:

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

Before starting it, create the `.env` file it references, holding a random secret AnythingLLM uses to sign session tokens:

<Terminal title="user@home-pc: ~/tools/anythingllm">
$ echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
</Terminal>

<AlertBox variant="caution" title="About cap_add: SYS_ADMIN">
AnythingLLM uses a headless Chromium under the hood for some document and web-scraping features, and Chromium wants this capability to run its sandbox inside a container. It's a broader grant of privilege than I'd like to hand out by default — the project has an open discussion about replacing it with a narrower seccomp profile instead, but as of now, `SYS_ADMIN` is what the official image expects. Worth knowing, not worth losing sleep over on a home LAN.
</AlertBox>

`OLLAMA_BASE_PATH` and `EMBEDDING_BASE_PATH` both point at `192.168.0.218` — the same home-server IP address I used in <Link to="/blog/accessing-ollama-across-your-local-network">Accessing Ollama across your local network</Link>. Replace it with your own server's IP. Notice that even though Ollama and AnythingLLM run on the very same machine here, I'm still using the LAN IP rather than `localhost` — that detail matters in Part 2, where it stops being a detail and becomes the whole point.

Pull the embedding model on the Ollama side before starting AnythingLLM — it's small (a few hundred MB) and required for anything to get embedded at all:

<Terminal title="user@home-pc: ~/tools/anythingllm" wrap={true}>
$ docker exec -it ollama ollama pull nomic-embed-text
</Terminal>

Then bring AnythingLLM up:

<Terminal title="user@home-pc: ~/tools/anythingllm">
$ docker compose up --detach

[+] Running 1/1
 ✔ Container anythingllm  Started
</Terminal>

### First-run setup

Browse to `http://localhost:3001` (or `http://192.168.0.218:3001` from another machine on the network). The onboarding wizard asks for:

<StepsCard
  variant="steps"
  title="AnythingLLM onboarding"
  steps={[
    { content: "**LLM Provider** — select Ollama, paste your server's URL (`http://192.168.0.218:11434`), pick the model you already pulled (`qwen2.5:14b-instruct` fits comfortably in 24GB of VRAM alongside the embedding model)" },
    { content: "**Embedding Provider** — select Ollama again, same URL, pick `nomic-embed-text`" },
    { content: "**Vector Database** — leave the default, LanceDB; it's embedded, no extra container to run" },
    { content: "**Create your first workspace** — name it after a real project, not \"test\"" }
  ]}
/>

### Feeding it real documents

Inside the workspace, the upload dialog accepts exactly the mix I described earlier: drop in a `README.md`, a Quarto `.qmd` report, a PDF, a DOCX, an Excel sheet, a PowerPoint deck — multi-select as many as the OS file picker lets you grab at once. AnythingLLM parses each format on its own; you don't need to convert anything first.

Once the documents show a green "embedded" status, ask a real question in the chat panel — something you'd normally have gone digging for. The answer comes back with the source document named next to it, so you can go double-check it instead of taking the model's word for it.

<AlertBox variant="important" title="One workspace per project">
Because bulk-uploading a folder tree isn't supported through the GUI, organize workspaces to mirror your `~/repositories` structure: one workspace per project, documents uploaded in a single multi-select pass. It also keeps the vector space focused — a question about project A won't get diluted by irrelevant chunks from project B.
</AlertBox>

At this point, everything — the documents themselves, their embeddings, the LanceDB files — lives inside the `anythingllm_storage` volume, on the home PC. Fine for this machine. Not fine for what comes next.

## Part 2 — Keeping Documents on the Work PC, Borrowing the Home PC's GPU

Here's the constraint that changes everything: my actual documentation — the stuff under `~/repositories` — lives on my **work** PC, and it's staying there. Not synced, not copied, not uploaded anywhere for convenience.

That rules out the simplest option, which would be "just open `http://192.168.0.218:3001` from my work PC's browser and upload files there." It would technically work — but uploading a file to that page sends its content over the network to the home PC's container, where AnythingLLM stores the parsed text, the vector embeddings, and a cached copy, inside `anythingllm_storage`, on a disk that isn't mine at the office. That's exactly the kind of copy I ruled out. The browser is just the window; the documents themselves land wherever the **server** behind that page is actually running.

So the fix follows directly from that: run the AnythingLLM **server** itself on the work PC — same Docker container, same `compose.yaml` — and only reach out to the home PC for the one thing that doesn't touch document content: the model doing the actual thinking.

```text
Work PC (Docker)                          Home PC
┌─────────────────────────┐               ┌─────────────────────┐
│ anythingllm container    │  inference    │ ollama container      │
│  - documents             │ ────────────► │  - qwen2.5:14b        │
│  - vectors (LanceDB)     │ ◄──────────── │  - nomic-embed-text   │
│  - STORAGE_DIR           │   tokens back │  - 24GB VRAM          │
└─────────────────────────┘               └─────────────────────┘
```

Only prompts and the retrieved text chunks needed to answer them cross the network for that single request — nothing gets stored on the other end.

### What actually changes in the compose file

Nothing structural — it's the exact same `compose.yaml` from Part 1, running through Docker Desktop on the work PC instead. The only thing that changes is which address `OLLAMA_BASE_PATH` and `EMBEDDING_BASE_PATH` point to, and that address depends on where the work PC physically is:

```yaml title="compose.yaml — the two lines that change"
      - OLLAMA_BASE_PATH=http://192.168.0.218:11434      # same LAN, e.g. working from home
      - EMBEDDING_BASE_PATH=http://192.168.0.218:11434
```

When the work PC is sitting on the same home network, that's it — `192.168.0.218` is reachable exactly as it was in <Link to="/blog/accessing-ollama-across-your-local-network">the earlier article</Link>, and the rest of this setup is a copy-paste of Part 1.

### And when it isn't home

Five days a week, that work PC isn't on the home LAN at all. A plain IP address on a private `192.168.x.x` range simply isn't reachable from the office — that's the whole point of a private network.

<AlertBox variant="tip" title="The practical fix: a mesh VPN">
Tools like Tailscale or WireGuard give every device — home PC included — a stable address that stays reachable no matter which network it's actually sitting on, without opening ports on your home router to the internet. Install it on the home PC, install it on the work PC, and the same `OLLAMA_BASE_PATH` pattern above keeps working — just with the VPN-assigned address instead of `192.168.0.218`. That setup deserves its own article rather than a rushed paragraph here, so consider this a preview of one.
</AlertBox>

<AlertBox variant="caution" title="Ollama has no authentication of its own">
Exposing `192.168.0.218:11434` inside a private LAN is one thing; making it reachable from anywhere via a VPN is another step up in exposure. Ollama's API doesn't ask for a password — anyone who can reach that port can query your models. A mesh VPN like Tailscale keeps that surface limited to devices you've explicitly authorized, which is precisely why it's the recommended answer here rather than a router port-forward.
</AlertBox>

### Recreate the workspaces, this time for real

With the container now running on the work PC, redo the onboarding from Part 1 — same LLM provider, same embedding model, pointing at whichever address currently reaches the home PC. Then start creating one workspace per repository under `~/repositories`, feeding each one its own documentation.

This time, the documents never leave the machine you're sitting at. The only thing making the round trip to the home PC is a question and the handful of text chunks needed to answer it — exactly the split I wanted going in.

## Key Takeaways

<StepsCard
  variant="remember"
  title="AnythingLLM + remote Ollama, quick reference"
  steps={[
    { content: "**AnythingLLM is a RAG client, not an LLM** — it needs an LLM Provider, and Ollama qualifies, local or remote" },
    { content: "**Documents live where the container runs**, not where the browser is — that's the detail that decides where to deploy it" },
    { content: "**One workspace per project** — the GUI uploads file-by-file (multi-select, no folder trees), so this structure was going to happen anyway" },
    { content: "**Same compose.yaml everywhere** — only `OLLAMA_BASE_PATH` / `EMBEDDING_BASE_PATH` change between the home-only setup and the work-PC setup" },
    { content: "**Off the home LAN, a mesh VPN (Tailscale/WireGuard) replaces the raw IP** — Ollama has no auth of its own, so keep that surface limited to your own devices" }
  ]}
/>

## Conclusion

What started as "I can never find that one config I wrote down somewhere" turned into a genuinely small amount of Docker work: one `compose.yaml`, pointed at a model I was already running for something else. The part worth remembering isn't the YAML — it's the realization that a web UI's "upload" button is a request to wherever its server happens to live, which is exactly the detail that decides whether your documents stay put or quietly migrate to a machine you didn't intend. Once that clicked, the two-machine setup wasn't a compromise; it was just the obvious shape once GPU and documents don't live in the same place. Now, every time I catch myself about to `grep -r` and hope, I ask the workspace instead.
