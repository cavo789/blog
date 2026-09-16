---
slug: docling
title: Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated
authors: [christophe, claude]
image: /img/v2/docling.webp
mainTag: markdown
tags: [docker, markdown, python, ai, doc-as-code]
date: 2026-09-17
description: 'A Docker batteries-included setup for Docling, IBM''s document-conversion library: PDF, Word, PowerPoint, Excel and HTML files converted into clean Markdown, with GPU acceleration for machines with spare VRAM. A companion to my Markitdown article — same idea, a heavier engine underneath.'
language: en
ai_assisted: true
---
![Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated](/img/v2/docling.webp)

<!-- cspell:ignoreCase docling markitdown nvidia cudnn -->

<TLDR>
This article does for [Docling](https://github.com/docling-project/docling) exactly what <Link to="/blog/markitdown">my Markitdown article</Link> did for Markitdown: a Docker batteries-included image and a global `docling-convert` wrapper script, so converting a document to clean Markdown is one command from any folder. **The difference is what's under the hood — Docling uses dedicated layout, table-structure and OCR models instead of format-specific parsers, runs on GPU if you have one, and is built from the ground up for exactly the "sensitive document, must stay local" scenario this blog keeps coming back to.**
</TLDR>

A friend who was reading <Link to="/blog/markitdown">my Markitdown article</Link> suggested I try [Docling](https://docling.ai/) instead — Microsoft-adjacent open-source project, IBM this time, same "convert office documents to Markdown" pitch, but built around actual layout-understanding models rather than per-format parsers. I have 24GB of VRAM sitting mostly idle on my AI server; if a tool can put it to work turning a badly-scanned PDF into something readable, that's worth ten minutes of testing.

<!-- truncate -->

## Converting Five Formats

Once the image and the global wrapper are in place (we'll cover this below), converting a document is one command:

<Terminal source="./files/terminal-1.txt" typewriter />

PDF, DOCX, PPTX, XLSX and HTML, five separate `docling-convert` calls, five clean `.md` files sitting right next to their originals — no manual export-to-Markdown step in Word or PowerPoint, no online converter to trust with the content.

## What Docling Does Differently

<AlertBox variant="info" title="Same output, a very different engine">
**For every format in this article except PDF** — `.docx`, `.xlsx`, `.pptx` and `.html` — Docling does what every other converter does: it reads the file with a format-specific Python library and walks the result. Nothing exotic, no model loaded, and **nothing that needs a GPU** — `--pipeline vlm` is simply ignored on those four.

The PDF path is where it diverges. A PDF has no structure to walk: it is a bag of glyphs at coordinates, and every converter has to *infer* where the paragraphs, headings and tables were. Docling infers it with models — one for page layout, one for table structure, one for OCR, and optionally a vision-language model that reads the rendered page the way a person would. That last one is the reason this article has a GPU in it at all.
</AlertBox>

As always, I'll build a Docker image first — no Python, no `pip`, nothing installed globally on my machine.

## Installation

### Create our Docker image

Let's create a new folder and jump into it: `mkdir -p /tmp/docling && cd $_`

Then please create a new file called `Dockerfile`:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

`ARG DOCLING_VERSION` pins the exact release rather than letting `pip` grab whatever is newest at build time — Docling ships a new version every few days, and an unpinned build is a different image every time you rebuild it. Bump that `ARG` when you actually want the newer one.

<AlertBox variant="note" title="One package name, a whole shopping list behind it">
Since spring 2026, `docling` on PyPI is a thin metapackage: installing it pulls `docling-slim[standard]`, and *that* is what brings in the PDF, DOCX, PPTX, XLSX and HTML backends, PyTorch and the layout models. So a plain `pip install docling` still covers the five formats this article is about, with no extras to remember — but it is also why the image is heavy. If you only ever convert, say, `.docx`, `pip install "docling-slim[cli,format-docx,models-local]"` gives you a much smaller image; the full extras list is in [the project's PyPI page](https://pypi.org/project/docling-slim/).
</AlertBox>

### Build the image

Unlike <Link to="/blog/markitdown">Markitdown</Link>, this setup needs no `compose.yaml`: the container is never run through Compose. Conversions go through the wrapper script below, which has to mount whichever directory you are standing in — something a Compose file sitting in `/tmp/docling` cannot do. So a plain build is all there is:

<Terminal wrap={true} typewriter>
$ docker build -t docling .
</Terminal>

Expect this one to take noticeably longer than Markitdown's: PyTorch, its bundled CUDA libraries and the four baked-in models add up to an 8.3 GB image here. Those models are the part worth paying attention to — they are downloaded once, at build time, and they live *in* the image, so a `--rm` container starts with everything it needs and fetches nothing.

Optionally, if you want to test it to make sure the image is correct, just run `docker run --rm docling --help` — [the documentation](https://docling-project.github.io/docling/) covers every flag it lists.

### Create the global wrapper

Same pattern as `md-convert`, adapted for Docling's actual CLI shape. Run `sudo vi /usr/local/bin/docling-convert` and paste the content below in it:

<Snippet filename="/usr/local/bin/docling-convert" source="./files/docling-convert.sh" />

Make it executable: `sudo chmod +x /usr/local/bin/docling-convert`.

<AlertBox variant="note" title="Why a wrapper?">
The script probes `docker info` for the NVIDIA runtime before adding `--gpus all`. That check is not decoration: `docker run --gpus all` doesn't degrade politely on a machine without the toolkit, it refuses to start the container at all. With the probe in place, the same script works on my GPU server and on my laptop — slower on the laptop, that's all, and nothing to configure on either. Setting that runtime up is optional and comes at the end of this article.
</AlertBox>

Left alone, Docling narrates every run — engine selection, model loading, token counts, twenty-odd `INFO` lines to convert a single page — which is why the wrapper passes `--quiet`. That is not a dead end: Docling ignores `--quiet` as soon as `-v` is present, so `docling-convert report.pdf -v` brings the whole log back on the day something actually goes wrong. The two `TRANSFORMERS_*` and `HF_HUB_*` variables in the Dockerfile finish the job, silencing the model stack underneath, which has its own opinions about progress bars.

### First conversion

Time to check the whole chain holds together. The five files used throughout this article are here — one document, a short delivery note, expressed five ways, so you can see what each format costs on the way to Markdown rather than compare five unrelated things:

<DownloadButton file="/files/docling/samples.zip" label="samples.zip — the five files" title="report.pdf, contract.docx, slides.pptx, budget.xlsx, page.html" />

Prefer to stay in the terminal? The archive sits at a fixed URL, so `curl` fetches it straight into the `/tmp/docling` folder we created earlier — unzipped into a `samples` subfolder, to keep the five documents apart from the `Dockerfile` already there:

<Terminal title="The first real conversion" source="./files/terminal-first-run.txt" typewriter />

`report.md` lands next to `report.pdf`, title and paragraphs intact — no output folder to name, no redirection to remember.

Two things are worth noticing there. The first is that `docling-convert report.pdf` has taken fourteen seconds. The second is the list of flags printed under the result: it shows up under every PDF conversion, options you already passed drop off it, the other four formats get no hint at all, and `DOCLING_CONVERT_NO_TIP=1` stops it for good.

Which leaves the obvious question: what do those fourteen seconds buy?

### Why the slow pipeline is the default

Docling can read a PDF two ways. The standard pipeline detects regions, pulls the text out of each, and reassembles them. The `vlm` pipeline hands the rendered page to a small vision-language model — GraniteDocling, 258M parameters — and asks it to describe the structure, the way a person reading the page would. That is the one the wrapper uses, and here is `report.pdf` — four justified paragraphs under a display-font title — through both:

<Terminal title="Standard pipeline vs VLM, same file" source="./files/terminal-pipelines.txt" wrap={false} />

Look at the standard pipeline's first line. `Quarterly Delivery Note d titiitl iltil`, followed by a stray `yy` — the OCR stage fired on the large title and hallucinated letters that are in no version of that document. Then it broke the first clause in two, stranding `which is intended to replace it entirely.` on its own line. The VLM produced neither the invented text nor the orphan. Fourteen seconds against eight is the price, and it buys a file you can hand to someone without reading it first.

The fast path does not fail loudly: it invents, and invented text is only caught by re-reading the output.

<AlertBox variant="caution" title="One real difference from md-convert">
Markitdown prints Markdown to stdout, so `md-convert file.docx > file.md` is how you capture it. Docling's CLI writes `<basename>.md` straight into the output directory instead — there's no stdout mode. `docling-convert file.docx` produces `file.md` next to it directly; no `>` redirection needed, and none will work.
</AlertBox>

### A word on images

Docling renders anything the layout model classifies as a picture — and on a title set in a display font, that can be the title itself. Left alone it then embeds each one in the Markdown as a base64 `data:` URI, which keeps the file self-contained and inflates it enormously. The wrapper passes `--image-export-mode referenced` instead: the pictures land as real PNG files in a `budget_artifacts/` folder next to `budget.md`, linked relatively, so the two travel together.

The other two modes are one flag away. `--image-export-mode placeholder` *drops* the images and leaves a `<!-- image -->` marker where each one was — the right choice when the Markdown is going to feed a model rather than a person. `--image-export-mode embedded` brings the base64 file back, for when you want a single self-contained document. One thing to know if you ever call Docling without the wrapper: those links are relative because of `--output .`, and an absolute `--output` writes the container's own paths instead, which resolve to nothing outside it.

## Optional — Putting a GPU Behind the PDF Pipeline

Everything above works without a GPU, and this section is skippable — twice over:

- **You only convert `.docx`, `.xlsx`, `.pptx` or `.html`?** Then it buys you strictly nothing. Those four formats never load a model, so there is nothing to accelerate; `--gpus` changes neither the speed nor the output.
- **You convert PDFs on a machine with no NVIDIA card?** Then it still works. `--device auto` settles on the CPU, the same VLM pipeline runs, and the same Markdown comes out — it just takes longer. The wrapper prints the elapsed time on every run, so your own hardware will tell you how much longer.

Recommended for PDFs, pointless for the other four, mandatory for nobody.

### Why a toolkit is needed at all

A container does not see your graphics card. The card, its VRAM and the NVIDIA *driver* live on the host; a container gets neither `/dev/nvidia*` in its device list nor the driver's libraries in its filesystem. The CUDA libraries that `pip` installed in our image — the `torch` wheel carries its own, which is why the Dockerfile starts from a plain `python:3.12-slim-trixie` and not from an `nvidia/cuda` base — are only the *upper* half of that stack: they talk to the driver, they do not replace it. With the lower half missing, PyTorch reports no CUDA device and computes on the CPU.

The [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) is the piece that joins the two halves: it registers a hook in the Docker daemon which, each time a container starts with `--gpus`, injects the host's GPU device nodes and driver libraries into it. That is the whole reason it appears in this article — **no toolkit, no VRAM**. Install it on the Docker host, never in the image, then confirm the GPU is visible from inside a container:

<Terminal title="Verifying GPU passthrough" source="./files/terminal-gpu-check.txt" typewriter wrap={false} />

That table is the host's card read from *inside* a container: 24 GB of VRAM, driver version, what is currently using it. The `nvidia/cuda` image there is just a convenient carrier for `nvidia-smi` — our own image doesn't need it.

### If that table doesn't show up

Nothing is broken: `docling-convert` keeps converting, on the CPU, exactly as it did through the whole article. If you do want the GPU, three failures cover nearly every case:

| What you get instead                                           | What it means                                                                                                 | What to do                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `could not select device driver "" with capabilities: [[gpu]]` | Docker has no GPU hook: the toolkit is either not installed, or installed and never wired into the daemon     | Install the toolkit from [NVIDIA's package repository](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html), then run the two commands below |
| `nvidia-smi` fails **on the host too**, outside any container  | The driver itself is missing or broken — Docker isn't in play yet                                             | Install the driver and reboot until `nvidia-smi` works on the host. On WSL2 that driver is a **Windows** driver: install it on Windows, never inside the distribution                |
| `Failed to initialize NVML: Unknown Error`                     | The hook ran, but the container was refused the device — a daemon still running its pre-toolkit configuration | The two commands below                                                                                                                                                               |

Two of those three are the same fix, because the package only puts the hook on disk — the daemon still has to be told about it:

<Terminal title="Wiring the toolkit into Docker" source="./files/terminal-gpu-fix.txt" wrap={false} />

That last command is the exact probe the wrapper script runs before adding `--gpus all`: once `nvidia` appears among Docker's runtimes, the next PDF goes through the GPU with nothing else to change.

## What the Five Files Cost

Every number in this article was measured on the files you unzipped earlier, and the five commands from the very first terminal run on them as written. On my machine the four office formats land in four to five seconds each, almost all of it process start-up, and `report.pdf` takes fourteen with the GPU in play. That gap is the whole story: only the PDF needs the models.

<AlertBox variant="note" title="What the spreadsheet actually shows">
Merged cells are not collapsed, they are *repeated*: the title comes out once per column it spanned, and so does each section row. Nothing is lost, but do not expect Markdown to reproduce the visual merge. And Docling reads formulas, not their results — a spreadsheet written by a script and never opened in Excel converts with every total empty. `budget.xlsx` stores computed values for that reason.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="docling-convert quick reference"
  steps={[
    { content: "**GPU is optional** — `--device auto` falls back to CPU cleanly if passthrough isn't configured" },
    { content: "**One package, five formats** — `pip install docling` pulls `docling-slim[standard]`, which covers PDF, DOCX, PPTX, XLSX and HTML" },
    { content: "**Models are baked in** — downloaded at build time, so a read-only unprivileged container never has to fetch anything" },
    { content: "**Writes files, not stdout** — `docling-convert file.pdf` produces `file.md` directly, no `>` redirection" },
    { content: "**Slow on purpose** — `--pipeline vlm` keeps paragraphs and titles intact; add `--pipeline standard` when speed matters more" },
    { content: "**Only PDFs need the models** — `.docx`/`.xlsx`/`.pptx`/`.html` go through a plain parser, no GPU and no model involved" }
  ]}
/>

## Conclusion

Between this and <Link to="/blog/markitdown">Markitdown</Link>, I now have two Docker images that turn office documents into Markdown without a single byte leaving my machine — a light one I reach for by reflex, and this heavier one for when a PDF's structure matters enough to spend twenty seconds and a GPU on it. And since both output plain Markdown, either one slots straight into the kind of pipeline I described in <Link to="/blog/anythingllm-chat-with-your-docs">Chat with your documents using AnythingLLM</Link> — or into the next article in the "Ollama daily use" series, where that Markdown becomes the input to a local translation and summarization pipeline for documents that were never meant to touch the cloud in the first place.
