---
slug: aider-ollama
title: "Aider + Ollama: Let a Local LLM Write and Evolve Your Project"
description: "Aider is a terminal coding assistant that creates and edits your files and commits every change to git. Run it in Docker against a local Ollama model, describe a PowerShell photo-library scanner in plain English, add a feature to it, and run the generated script in a sandbox where your photos are strictly read-only."
authors: [christophe, claude]
image: /img/v2/playing_with_ollama.webp
mainTag: ai
tags: [ai, ollama, docker, windows, git]
date: 2026-11-10
draft: true
tried_it: false
ai_assisted: true
language: en
---

![Aider + Ollama: Let a Local LLM Write and Evolve Your Project](/img/v2/playing_with_ollama.webp)

<!-- cspell:ignore aider Aider qwen pwsh EXIF exiftool HEIC heic DateTimeOriginal num_ctx bashrc gitconfig tmpfs -->

<TLDR>
Aider is a command-line pair programmer: describe what you want, and it decides which files to create or edit, writes the changes straight into them, then commits each one to git. Packaged as a Docker image behind a one-function `aider` command and plugged into a local Ollama model, it wrote a PowerShell script that inventories a photo library, then, in a second session, added a per-folder size report. The generated script never touches your photos directly: it runs in a second container, `ps1-sandbox`, where the library is mounted read-only and the network is cut.
</TLDR>

Chatting with an LLM about code always ends the same way for me: copy the answer, paste it in the editor, notice that it rewrote a function I didn't ask it to touch, copy the next answer, lose track of which version actually worked. The model is fine; the copy-paste loop between the chat window and my files is the weak link.

[Aider](https://aider.chat/) removes that loop: it creates and edits the files itself and commits every change, so each step can be read with `git diff` and reverted with one command. Paired with <Link to="/blog/ollama-installation">a local Ollama instance</Link> and wrapped in Docker, it does that for free, offline, without installing anything but Docker, and without ever running AI-written code against your real data.

<!-- truncate -->

## One Prompt, One Working Script

The project is a small photo-library inventory: a JSON configuration file says where the photos live, a PowerShell script scans the folder and writes a CSV. Here is the whole first session, started in an empty folder: no file named, one request in plain English.

<Terminal source="./files/terminal_first_run.txt" typewriter />

Aider offered to create the git repository, chose the two file names itself, asked before creating each one, and committed the result. Then the script runs, in a sandbox that can read the photos but not change them:

<Terminal source="./files/terminal_run_v1.txt" />

The three files with `DateSource` set to `file` show the fallback at work: two videos and a scan carry no capture date, so the file's own date is used, and the column says so.

## Why It Works

- **The repo map replaces the file list.** With every request, Aider sends the model a compact summary of the repository (file names, functions, their signatures). The model answers with the files it needs, and Aider asks your permission before adding or creating any of them.
- **Edits, not prose.** The model must answer with *edit blocks* that Aider applies itself. Files that were never added to the chat are never touched.
- **Every change is a commit**, with a message written by the model, so `git log` reads like a changelog and `/undo` is always one step away.
- **The request carries the constraints.** The first prompt names the language, the mount points, the tool to read EXIF and the expected columns. A local model fills gaps with guesses; one small, precise request per session leaves it none.
- **Generated code never meets your data unprotected.** The script runs in a throwaway container where the photo library is mounted read-only, the container's own filesystem is read-only, and the network does not exist. One empty folder is writable: the one that receives the reports.

## Installing Aider

<Prerequisite name="Docker" install="https://docs.docker.com/get-docker/" check="docker --version" />

Docker is the only thing to install: Ollama, Aider, its Python, PowerShell and exiftool all run in containers.

### The Model

Ollama runs in the `ollama` container described in <Link to="/blog/ollama-installation">installing Ollama with Docker</Link>, which publishes port `11434` on the host. Uncomment the `deploy` block of its `compose.yaml` to give it your NVIDIA GPU (on Linux without Docker Desktop, that block needs the NVIDIA Container Toolkit).

`qwen2.5-coder:14b` is a good trade-off between quality and the memory of an average GPU; the 7b variant works on smaller machines but follows the edit format less reliably.

```bash
docker exec ollama ollama pull qwen2.5-coder:14b
```

The Aider container reaches Ollama through `host.docker.internal:11434`. Check that route once, from a throwaway container, before blaming the model:

```bash
docker run --rm --add-host host.docker.internal:host-gateway curlimages/curl:8.10.1 \
    -s http://host.docker.internal:11434/api/tags
```

The answer is a JSON list that must contain `qwen2.5-coder:14b`. An error means the port is not published: check the `ports` section of the Ollama `compose.yaml`.

<AlertBox variant="info" title="8 GB of RAM, or no GPU">
Pull `qwen2.5-coder:7b` instead and change the model name in `aider.conf.yml` and `aider.model.settings.yml`. Keep only the files you are working on in the chat (`/drop` the others), and lower `num_ctx` to 8192: the context window is paid for in memory, and without a GPU, every extra token is also paid for in time.
</AlertBox>

### The Aider Image

The image is built once, from a folder of its own, and then serves every project. The two configuration files are baked into it as global defaults; `aider.model.settings.yml` is explained in [Under the Hood](#under-the-hood-skip-this-if-you-just-want-to-use-it).

<ProjectSetup folderName="~/tools/aider-ollama">
  <Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />
  <Snippet filename="aider.conf.yml" source="./files/aider.conf.yml" />
  <Snippet filename="aider.model.settings.yml" source="./files/aider.model.settings.yml" />
</ProjectSetup>

```bash
cd ~/tools/aider-ollama
docker build -t aider-ollama:0.86.2 .
```

### The Sandbox Image

A second, much smaller image runs the scripts Aider writes: PowerShell plus exiftool, nothing else.

<ProjectSetup folderName="~/tools/pwsh-sandbox">
  <Snippet filename="Dockerfile" source="./files/sandbox/Dockerfile" defaultOpen={false} />
</ProjectSetup>

```bash
cd ~/tools/pwsh-sandbox
docker build -t pwsh-sandbox:7.5 .
```

### The Two Commands

Add both functions to your shell startup file. `aider` mounts the **current folder**, wherever you are, runs with your own user so the generated files belong to you, and reuses your git identity for the commits. `ps1-sandbox` runs a script from the current folder against a data folder you name, read-only.

<Snippet filename="~/.bashrc" source="./files/aider.bash" />
<Snippet filename="~/.bashrc" source="./files/ps1-sandbox.bash" />

```bash
source ~/.bashrc
```

From now on, both work in any folder: `mkdir photo-inventory && cd photo-inventory && aider`, then type the request of the first section, or your own. When Aider is done, `ps1-sandbox Scan-Photos.ps1 /mnt/c/Photos` (the WSL path of `C:\Photos`) produces the reports in `./reports`. Ollama elsewhere on your network? `export OLLAMA_API_BASE=http://192.168.1.10:11434` before calling `aider`, the function passes it through.

<Details label="The script and configuration Aider generated">

<Snippet filename="photos.config.json" source="./files/photos.config.json" />
<Snippet filename="Scan-Photos.ps1" source="./files/Scan-Photos.ps1" defaultOpen={false} />

</Details>

## Proof That the Sandbox Holds

A script written by a model is a script nobody has read yet. Here is the worst case on purpose: a one-line `Delete-Everything.ps1` that recursively deletes a year of photos, run through the same command.

<Terminal source="./files/terminal_sandbox_proof.txt" />

Every deletion is refused by the kernel, not by PowerShell's good will: the library is mounted read-only, so no command, flag or `-Force` can change it. The worst a broken script can do is fill or empty `./reports`.

## Adding a Feature in a Second Session

The real test of a coding assistant is not the blank page but an existing project. Quit Aider, come back later, run `aider` again in the same folder, and ask for something new: a `folders.csv` with the size of every folder, split between photos and videos, also printed in the console.

<Terminal source="./files/terminal_feature.txt" />

Two things happened without being asked. The model found the file to change from the repo map, and Aider asked before adding it to the chat. Then, instead of rewriting the file, it answered with a `SEARCH`/`REPLACE` block, inserting the new functions and leaving the rest untouched.

<Terminal source="./files/terminal_run_v2.txt" />

<AlertBox variant="tip" title="When the model picks the wrong file">
On a three-file project, the repo map is all a 14b model needs. On a large one, it may suggest the wrong file or none at all. Point it at the right one with `/add Scan-Photos.ps1`, remove a wrong guess with `/drop`, and `/ls` lists what is in the chat. The `aider` function prints that reminder at every launch.
</AlertBox>

## More Commands Worth Knowing

### `/ask`: Talk Without Editing

Not every question deserves a code change. `/ask` turns off editing for one message:

<Terminal source="./files/terminal_ask.txt" />

### `/undo`: Take Back the Last Change

Since each edit is a commit, reverting is one command, and only commits made by Aider can be undone this way:

<Terminal source="./files/terminal_undo.txt" />

### `/run`: Feed an Error Back to the Model

`/run` executes a command inside the Aider container and offers to add its output to the chat. An error message is the best possible prompt. That container only sees the project folder, never your photos, which makes it the right place to test the error paths:

<Terminal source="./files/terminal_run_fix.txt" />

### `CONVENTIONS.md`: Your House Style, Every Time

Drop a `CONVENTIONS.md` in the project folder, and the `aider` function sends it with every request as read-only context: the model follows it, but never edits it.

<Snippet filename="CONVENTIONS.md" source="./files/CONVENTIONS.md" />

<Terminal source="./files/terminal_conventions.txt" />

### Ask for Tests and Docs, Too

The same loop works for what usually gets skipped: ask Aider for Pester tests of `Scan-Photos.ps1`, or for a `README.md` explaining the configuration file. Both are ordinary files, committed like the rest, and the tests run in `ps1-sandbox` like the script itself.

<AlertBox variant="tip" title="Review before you trust">
Aider commits automatically, but nothing is pushed. Read `git diff HEAD~1` after each step the same way you would review a colleague's pull request; the sandbox protects your data, not the quality of the code.
</AlertBox>

## Your Turn

The recipe does not depend on PowerShell or on photos. For any other language, one more function runs the generated script with the same lock as `ps1-sandbox`, using the official image of that language:

<Snippet filename="~/.bashrc" source="./files/sandbox.bash" />

### A Complete Example: Summarize Bank Exports

Say your bank exports are CSV files in `C:\Users\John\Documents\Bank`. Four steps, all copy-paste.

**1.** Create an empty project folder and start Aider in it:

```bash
mkdir ~/bank-summary && cd ~/bank-summary
aider
```

**2.** Paste this request at the Aider prompt, and answer `y` when it asks to create the file:

```text
Write summary.py, Python 3.13, standard library only. Read every CSV file in /data
(semicolon-separated, columns Date, Description, Amount, European number format), and write
/reports/monthly.csv with income, expenses and balance per month, plus /reports/top-expenses.csv
with the 20 largest expenses.
```

**3.** Type `/exit` once Aider has committed the file.

**4.** Run the script against your exports, read-only:

```bash
sandbox python:3.13-slim /mnt/c/Users/John/Documents/Bank python summary.py
```

The two CSV files are in `./reports`. Wrong column name, odd date format? Start `aider` again in the same folder, paste the error, and run step 4 again.

### Five More Ideas, Same Four Steps

Only three things change: the folder name of step 1, the request of step 2 and the command of step 4.

| Idea | Request to paste in step 2 | Command for step 4 |
| --- | --- | --- |
| **PowerShell**: duplicate photos, in the photo project of this article | Add a Find-Duplicates.ps1 script: compute the SHA-256 of every file under /photos, group identical hashes, and write /reports/duplicates.csv with the hash, the size and every path of each group. Print the space that removing the copies would free. | `ps1-sandbox Find-Duplicates.ps1 /mnt/c/Photos` |
| **Bash**: read a web server log | Write analyze-log.sh, Bash 5, with set -o errexit -o nounset -o pipefail, using only BusyBox-compatible options. Read the Nginx access logs in /data (\*.log and \*.log.gz), and write to /reports the 20 most active IPs, the 20 most requested URLs returning 404, and the number of requests per hour. | `sandbox bash:5.2 /var/log/nginx bash analyze-log.sh` |
| **PHP**: audit your projects' dependencies | Write audit-composer.php, PHP 8.4, no Composer package. Find every composer.json under /data, ignoring vendor folders, and write /reports/projects.csv with the project path, the required PHP version and each dependency with its version constraint. Flag constraints that use \* or dev-. | `sandbox php:8.4-cli ~/projects php audit-composer.php` |
| **WSL**: broken links in Markdown notes kept on Windows | Write check-links.py, Python 3.13, standard library only. Scan every .md file under /data, extract the relative links and images, and write /reports/broken-links.csv with the file, the line number and the target of each link pointing to a file that does not exist. | `sandbox python:3.13-slim /mnt/c/Users/John/Documents/Notes python check-links.py` |
| **Bash**: inventory a folder before cleaning it | Write inventory.sh, Bash 5, with set -o errexit -o nounset -o pipefail, using only BusyBox-compatible options. Under /data, write to /reports the 50 largest files, the size per extension, and the files not modified for more than two years, each as a CSV with the size in MB. | `sandbox bash:5.2 ~/Downloads bash inventory.sh` |

Every script only *lists*: what to delete, fix or upgrade stays your decision. For your own idea, keep the shape of these requests: the language and its version, `/data` to read, `/reports` to write, and the exact columns you expect.

## Under the Hood (skip this if you just want to use it)

### What Each Sandbox Flag Blocks

| Flag | What it takes away from the script |
| --- | --- |
| `--volume …:/photos:ro` | Any write, rename or delete in the library, enforced by the kernel |
| `--volume "$PWD:/app:ro"` | Rewriting itself or the configuration |
| `--read-only --tmpfs /tmp` | Writing anywhere in the image; `/tmp` is in memory and vanishes with the container |
| `--network none` | Downloading anything, or sending your file list anywhere |
| `--cap-drop ALL`, `no-new-privileges`, `--user` | Becoming root, or any privileged operation |

Only `/reports` remains writable. Pointing it at an existing folder full of other files would hand them to the script, which is why the function creates an empty `./reports` by default.

### Why exiftool and Not System.Drawing

The usual Windows way to read EXIF in PowerShell, `System.Drawing`, does not exist on Linux. exiftool does the job in the sandbox, reads HEIC and video metadata as well, and is called once for the whole tree rather than once per file. The prompt of the first session says so explicitly, along with the `/photos` and `/reports` mount points, so the model writes for the sandbox from the first line.

### The Context Window Trap

Ollama loads models with a small default context window (a few thousand tokens), and **silently truncates** anything longer. Aider sends its system prompt, the repo map, the conventions and the files with every request: past that limit, the beginning of the payload is cut off and the model starts editing code it can no longer see. `aider.model.settings.yml` raises `num_ctx` for that model; 16384 is a comfortable value for a handful of files, at the price of more memory.

### Whole File vs. Search/Replace

The first session reported `whole edit format`, the second `diff edit format`: for new or tiny files, the model rewrites them entirely; once they grow, Aider switches to `SEARCH`/`REPLACE` blocks, which are cheaper and cannot damage unrelated code, but require the model to copy the `SEARCH` part *exactly*. When a small local model fails at that, Aider reports the mismatch and asks it to try again; if it keeps failing, `/drop` the files you are not working on, or move to a bigger model.

### Global Defaults, Project Overrides

The image ships `~/.aider.conf.yml` with the model, a 2048-token repo map and auto-commits. A `.aider.conf.yml` at the root of a project still wins, so one project can use another model without rebuilding the image.

### `/architect` for Bigger Changes

`/architect` splits a request between two roles: one model plans the change in prose, a second one turns the plan into edits. Both can be the same Ollama model; the split alone tends to help small models, because they no longer have to reason and respect the edit format in the same answer.

## Conclusion

The copy-paste loop between a chat window and my editor is gone: Aider created the scanner, found the right file to extend it a session later, and every step sits in `git log`, ready to be read or undone. Running what it wrote is no act of faith either: `ps1-sandbox` gives the script my photos to read and one empty folder to write to, nothing more.

The weak point is the model, not the tool: what you gain with a bigger or better local model goes straight into the quality of the edits. To pick one, the <Link to="/blog/open-webui-advanced">Open WebUI advanced</Link> article shows how to compare models side by side on the same prompt.
