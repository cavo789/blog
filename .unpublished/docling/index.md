---
slug: docling
title: "Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated"
authors: [christophe, claude]
image: /img/v2/markdown.webp
mainTag: markdown
tags: [docker, markdown, python]
date: 2026-12-31
description: "A Docker batteries-included setup for Docling, IBM's document-conversion library: PDF, Word, PowerPoint, Excel and HTML files converted into clean Markdown, with GPU acceleration for machines with spare VRAM. A companion to my Markitdown article — same idea, a heavier engine underneath."
language: en
ai_assisted: true
draft: true
---

![Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated](/img/v2/markdown.webp)

<!-- cspell:ignoreCase docling markitdown nvidia cudnn -->

<TLDR>
This article does for [Docling](https://github.com/docling-project/docling) exactly what [my Markitdown article](/blog/markitdown) did for Markitdown: a Docker batteries-included image and a global `docling-convert` wrapper script, so converting a document to clean Markdown is one command from any folder. The difference is what's under the hood — Docling uses dedicated layout, table-structure and OCR models instead of format-specific parsers, runs on GPU if you have one, and is built from the ground up for exactly the "sensitive document, must stay local" scenario this blog keeps coming back to.
</TLDR>

Someone reading [my Markitdown article](/blog/markitdown) suggested I try [Docling](https://docling-project.github.io/docling/) instead — Microsoft-adjacent open-source project, IBM this time, same "convert office documents to Markdown" pitch, but built around actual layout-understanding models rather than per-format parsers. I have 24GB of VRAM sitting mostly idle on my AI server; if a tool can put it to work turning a badly-scanned PDF into something readable, that's worth ten minutes of testing.

<!-- truncate -->

## Converting Five Formats

Once the image and the global wrapper are in place (covered below), converting a document is one command:

<Terminal source="./files/terminal-1.txt" typewriter />

PDF, DOCX, PPTX, XLSX and HTML, five separate `docling-convert` calls, five clean `.md` files sitting right next to their originals — no manual export-to-Markdown step in Word or PowerPoint, no online converter to trust with the content.

## Docling vs Markitdown — Why Bother With a Second Tool

<AlertBox variant="info" title="Same output, different engine">
Both tools produce Markdown from office documents. Markitdown is lightweight — a handful of format-specific Python parsers, small image, CPU-only, fast. Docling runs a real layout-detection model, a table-structure model, and optionally a vision-language model over the document — heavier, GPU-friendly, and noticeably better on complex PDFs (multi-column layouts, dense tables, scanned pages) where Markitdown's simpler parsing sometimes loses structure. If your documents are straightforward `.docx`/`.xlsx` files, [Markitdown](/blog/markitdown) is still the faster, simpler choice — keep both images around and pick per document.
</AlertBox>

As always, I'll build a Docker image first — no Python, no `pip`, nothing installed globally on my machine.

## Installation

### Prerequisite — GPU Passthrough

<AlertBox variant="important" title="Only needed for GPU acceleration">
Docling works fine CPU-only (`--device cpu`, or just leave `--device auto` and let it fall back). This step is only required if, like me, you want to actually use your VRAM.
</AlertBox>

Install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) on the Docker host, then confirm the GPU is visible from inside a container:

<Terminal title="Verifying GPU passthrough" source="./files/terminal-gpu-check.txt" typewriter wrap={true} />

If that table doesn't show up, fix GPU passthrough before going further — the Dockerfile below will still build without it, but every conversion will silently fall back to CPU.

### Create our Docker image

Let's create a new folder and jump into it: `mkdir -p /tmp/docling && cd $_`

Then please create a new file called `Dockerfile`:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="info" title="Why no builder/final split this time?">
The [Markitdown Dockerfile](/blog/markitdown) uses a two-stage build to keep the final image small — it copies only an isolated `/python` prefix into a slim final stage. That trick doesn't help here: the CUDA runtime base image itself is already several gigabytes, so a second stage would just be copying the same weight around for no size benefit. One stage, kept as clean as the base image allows.
</AlertBox>

<AlertBox variant="note" title="No format-specific extras needed">
Unlike Markitdown's `markitdown[docx,xlsx,pdf]` extras syntax, a plain `pip install docling` already covers PDF, DOCX, PPTX, XLSX and HTML — Docling doesn't split format support into opt-in extras.
</AlertBox>

### Create an orchestration file

Same reasoning as the Markitdown setup: a `compose.yaml` bakes in the security hardening and, here, the GPU reservation too, so the final command stays short.

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

The one addition worth calling out: `docling-models`, a named volume mounted at `$HF_HOME`. Docling downloads its layout/table/OCR models from Hugging Face the first time it needs them — without a persistent volume, a `--rm` container would silently re-download several hundred megabytes on every single run.

### Build the image

Run `docker compose build` to build the image — expect this one to take noticeably longer than Markitdown's, since it's pulling a CUDA base image plus PyTorch.

Test it with `docker compose run --rm docling --help`.

### Create the global wrapper

Same pattern as `md-convert`, adapted for Docling's actual CLI shape:

<Snippet filename="/usr/local/bin/docling-convert" source="./files/docling-convert.sh" />

Make it executable: `sudo chmod +x /usr/local/bin/docling-convert`.

<AlertBox variant="caution" title="One real difference from md-convert">
Markitdown prints Markdown to stdout, so `md-convert file.docx > file.md` is how you capture it. Docling's CLI writes `<basename>.md` straight into the output directory instead — there's no stdout mode. `docling-convert file.docx` produces `file.md` next to it directly; no `>` redirection needed, and none will work.
</AlertBox>

## More Demos

<AlertBox variant="tip" title="Table quality is where this actually shows">
Run the same spreadsheet or a table-heavy PDF through both tools and compare the two `.md` files. This is the case where the extra weight of Docling's dedicated table-structure model earns its keep — Markitdown's output is readable, but Docling's tends to keep merged cells and multi-row headers intact where Markitdown flattens them.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="docling-convert quick reference"
  steps={[
    { content: "**GPU is optional** — `--device auto` falls back to CPU cleanly if passthrough isn't configured" },
    { content: "**No format extras** — `pip install docling` covers PDF, DOCX, PPTX, XLSX and HTML out of the box" },
    { content: "**Persist the model cache** — the `docling-models` named volume avoids re-downloading on every run" },
    { content: "**Writes files, not stdout** — `docling-convert file.pdf` produces `file.md` directly, no `>` redirection" },
    { content: "**Pick per document** — Markitdown for straightforward files, Docling for complex tables and layouts" }
  ]}
/>

## Conclusion

Between this and [Markitdown](/blog/markitdown), I now have two Docker images that turn office documents into Markdown without a single byte leaving my machine — one fast and light for the routine `.docx` a colleague sends over, one heavier and GPU-accelerated for the PDF with a table that actually matters. And since both output plain Markdown, either one slots straight into the next article in the "Ollama daily use" series, where that Markdown becomes the input to a local translation and summarization pipeline for documents that were never meant to touch the cloud in the first place.
