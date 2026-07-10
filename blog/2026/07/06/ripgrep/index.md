---
slug: ripgrep
title: "ripgrep — The Search Tool That Changed My WSL2 Workflow"
description: "Discover ripgrep, the blazingly fast grep alternative written in Rust. Installation on Ubuntu/WSL2, ZSH configuration, practical shell functions, and real-world use cases that will transform how you search code every day."
authors: [christophe, claude]
image: /img/v2/ripgrep.webp
mainTag: zsh
tags: [zsh, wsl, bash, linux, fzf]
date: 2026-07-06
ai_assisted: true
language: en
---

![ripgrep — The Search Tool That Changed My WSL2 Workflow](/img/v2/ripgrep.webp)

<!-- cspell:ignore ripgrep gitignore rgtodo rgenv rgdocker rgf rgphp smartcase filesize RIPGREP fzf rgyaml rgbash rgts rgmd -->

<TLDR>
ripgrep (`rg`) is a line-oriented search tool written in Rust that dramatically outperforms traditional grep — especially on large codebases. It respects `.gitignore` by default, skips binary files, and handles Unicode natively. This article covers installation on Ubuntu/WSL2, a `~/.ripgreprc` configuration file, ZSH aliases and functions for your `~/.zshrc` and `~/.zsh/fns/` directory, and real-world use cases that will make you wonder how you ever lived without it.
</TLDR>

Damn. I have typed that command so many times I could do it in my sleep: `grep -rn --include="*.php" "getUser" . | grep -v vendor`. It works — grep is a classic, it gets the job done. But over the years I have accumulated so many flags, so many aliases, so many muscle-memory workarounds for grep's quirks... At some point, you have to ask yourself: is there something better out there?

<AlertBox variant="note" title="What does that command actually do?">
  `grep -rn --include="*.php" "getUser" .` breaks down as: `-r` searches recursively through all subdirectories, `-n` prints the line number of each match, `--include="*.php"` restricts the search to `.php` files only, `"getUser"` is the pattern to find, and `.` means start from the current directory. The trailing `| grep -v vendor` pipes the results through a second grep that filters OUT (`-v`) any line containing `vendor` — a common workaround to exclude the `vendor/` dependencies folder that grep has no built-in way to skip.
</AlertBox>

There is. It is called [ripgrep](https://github.com/BurntSushi/ripgrep), and once you start using it, there is no going back.

<!-- truncate -->

## What is ripgrep?

ripgrep (`rg` on the command line) is a line-oriented search tool built in Rust by Andrew Gallant (BurntSushi). Speed is its headline feature — benchmarks consistently show it outperforming grep, ag (the Silver Searcher), and ack by a wide margin on large codebases. But raw speed is only part of the story.

What makes ripgrep genuinely better for day-to-day use is its **smart defaults**:

* It automatically respects `.gitignore`, `.ignore`, and `.rgignore` files — so `vendor/`, `node_modules/`, `dist/`, and `.git/` are skipped without any `--exclude-dir` gymnastics.
* It skips binary files by default.
* It colors and groups output by filename out of the box.
* It uses Unicode by default — no more garbled output on accented filenames or content.
* It supports modern regex syntax, including PCRE2 with the `-P` flag.
* It searches hidden files only when you explicitly ask for it (`--hidden`).

That last output behavior is underrated. Readable, grouped, colorized results — right away, no configuration required. So cool, no?

## Installation on Ubuntu / WSL2

ripgrep ships in Ubuntu's default package repositories, so getting it is a one-liner:

<Prerequisite
  name="ripgrep"
  install="sudo apt update && sudo apt install ripgrep -y"
  installOutput={`\nReading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`}
  check="rg --version"
  checkOutput={`\nripgrep 14.1.0\n-rev 0 (rev 4649aa9700 2024-03-30)\nfeatures: +SIMD +AVX (compiled), +SIMD +AVX (runtime)`}
  typewriter
/>

<AlertBox variant="tip" title="Want the latest version?">
  The Ubuntu repositories sometimes lag a few releases behind upstream ripgrep. For the most recent version, grab the latest `.deb` package directly from the [GitHub releases page](https://github.com/BurntSushi/ripgrep/releases) and install it with `sudo dpkg -i ripgrep_*.deb`. From version 14 onwards you also benefit from improved PCRE2 support and faster directory traversal.
</AlertBox>

## ripgrep vs grep — A Side-by-Side Look

Let me show you why ripgrep clicks so immediately. Here are the same searches expressed in both tools:

<Columns>
<Column>

**With grep:**

```bash
grep -rn --include="*.php" "getUser" . \
  | grep -v vendor
```

</Column>
<Column>

**With ripgrep:**

```bash
rg "getUser" --type php
```

</Column>
</Columns>


<Columns>
<Column>

**With grep:**

```bash
grep -rn -i "TODO" . \
  --include="*.py" \
  --include="*.pyi" \
  --exclude-dir=.venv \
  --exclude-dir=dist
```

</Column>
<Column>

**With ripgrep:**

```bash
rg -i "TODO" --type py
```

</Column>
</Columns>


<Columns>
<Column>

**With grep:**


```bash
grep -rn "DB_PASSWORD" . \
  --include="*.env" \
  --include="*.yml" \
  --include="*.yaml"
```

</Column>
<Column>

**With ripgrep:**

```bash
rg "DB_PASSWORD" -t yaml -t sh
```

</Column>
</Columns>
For sure, grep's flags are powerful once you know them by heart. But ripgrep's syntax is just cleaner — and by default it already ignores `vendor/`, `node_modules/`, and everything in your `.gitignore`, without any extra flags.

## Configuration — ~/.ripgreprc

Like most Unix tools, ripgrep can be configured via a dedicated file. You point to it with the `RIPGREP_CONFIG_PATH` environment variable. Here an example of a `~/.ripgreprc` file:

<Snippet
  filename="~/.ripgreprc"
  source="./files/.ripgreprc"
  defaultOpen={true}
/>

Each line is a default flag applied to every `rg` invocation. A few highlights worth explaining:

* `--hidden` makes ripgrep search inside hidden files and folders (anything prefixed with a dot). Combined with the `--glob=!.git/*` exclusion, this means you can search `.env` files, `.zshrc`, `.gitignore`, and similar without opening the entire `.git/` internals.
* `--max-filesize=10M` silently skips very large files (log dumps, generated assets) that would otherwise flood your results.
* `--smart-case` is probably the most impactful setting: searches are case-insensitive by default, but the moment your pattern contains an uppercase letter ripgrep switches to exact case matching — exactly the behavior I want 95% of the time.

## ZSH Setup — ~/.zshrc

With the config file in place, I add the environment variable, the function loader, and a handful of type-specific aliases to my `~/.zshrc`:

<Snippet
  filename="~/.zshrc (ripgrep section)"
  source="./files/zshrc_snippet.zsh"
  defaultOpen={true}
/>

The `for fn_file in ~/.zsh/fns/*.zsh` loop sources every function file in that directory automatically — so adding a new function is as simple as dropping a new `.zsh` file there, no need to touch `~/.zshrc` again.

The type-specific aliases (`rgp` for PHP, `rgt` for TypeScript, `rgm` for Markdown, and so on) save keystrokes when you know exactly what kind of file you are looking in. I reach for `rgp "getUser"` or `rgm "## Installation"` dozens of times per day.

## ZSH Functions — ~/.zsh/fns/

Now this is where it gets fun. Here are three functions I have installed in my `~/.zsh/fns/` directory, each solving a real problem.

### rgf — Interactive Search with fzf

I covered this combination in detail in a dedicated article: [FZF + ripgrep: Interactive Code Search with Live Preview](/blog/fzf-ripgrep). The short version: pipe `rg` into `fzf` with a `bat` preview panel and you get an interactive fuzzy finder that searches file *content*, previews matches with syntax highlighting, and opens your editor at the exact matching line. If you have not read that article yet, it is worth the detour.

### rgtodo — Surface All Technical Debt at Once

Every codebase has them lurking in comments: `TODO`, `FIXME`, `HACK`, `NOTE`, `XXX`. This function brings them all to the surface:

<Snippet
  filename="~/.zsh/fns/rgtodo.zsh"
  source="./files/rgtodo.zsh"
  defaultOpen={false}
/>

Run `rgtodo` at the root of any project and you get a sorted, colorized list of every comment marker. Run `rgtodo src/` to narrow it to a specific folder. Eye-opening on codebases that have been around for a while.

<Terminal source="./files/terminal_rgtodo.txt" typewriter />

### rgenv — Track Down Environment Variable Usage

In Docker-heavy projects, environment variables end up scattered across `.env` files, `compose.yml`, PHP bootstraps, and Python configs. This function searches all of them in one shot:

<Snippet
  filename="~/.zsh/fns/rgenv.zsh"
  source="./files/rgenv.zsh"
  defaultOpen={false}
/>

`rgenv DB_PASSWORD` instantly shows every file that references that variable — whether it is defining it, consuming it, or passing it as a Docker secret. Invaluable when debugging configuration drift in complex multi-container setups.

<Terminal source="./files/terminal_db_password.txt" wrap={true} typewriter />

## Real-World Use Cases

Let me walk through the searches I run most often in my day-to-day WSL2 workflow.

### Finding a Function Definition Across a PHP Project

```bash
rg "function getUser" --type php
```

Without ripgrep: add `--include="*.php"`, `--exclude-dir=vendor`, `-rn`. With ripgrep: just type it. The `vendor/` directory is already excluded because it is in `.gitignore`.

### Searching All Docker Compose Files for an Image Reference

```bash
rgy "image:"
```

That is our `rgy` alias (`rg --type yaml`). Useful when auditing a repository for outdated image references or finding all services that share a base image.

### Context Lines — Understanding Code Around a Match

The `-C N` flag shows N lines of context around each match — a feature I use constantly:

<Terminal source="./files/terminal_dbhost.txt" typewriter />

You can also use `-A N` (after) and `-B N` (before) separately, exactly like with grep.

A more common scenario: a teammate leaves `console.log()` calls in JavaScript before pushing to production. Without context, you only see the line itself — you know it exists, but not how serious it is. With `-C 2`:

<Terminal source="./files/terminal_consolelog.txt" typewriter />

Now you can tell the difference. The first match logs a JWT token in plain text — that is a security issue, not just noise. The second sits inside a `for` loop over a cart: one checkout call would flood the console with hundreds of lines. The context turns a list of matches into actionable information.

### Counting Occurrences Per File

```bash
rg -c "console.log" --type js
```

This outputs the match count per file — perfect for identifying which source files still have debug statements before a release.

### Bulk Rename with rg + sed

ripgrep is intentionally read-only (no `-i` in-place mode), but it pairs cleanly with `sed` for bulk refactoring:

<Terminal typewriter>
$ rg -l "oldFunctionName" --type php | xargs sed -i 's/oldFunctionName/newFunctionName/g'
</Terminal>

`rg -l` lists only the filenames with matches. Piping to `xargs sed -i` then rewrites exactly those files — nothing more, nothing less. Much safer than a raw `find | xargs sed` that has no idea which files actually match.

### Searching Multiple File Types at Once

```bash
rg "API_KEY" -t php -t yaml -t sh
```

Multiple `-t` flags work together — ripgrep searches all matching types in a single pass, with unified colored output.

### Limiting Search Depth

```bash
rg "FROM" --glob "Dockerfile*" --max-depth 3
```

`--max-depth` is great when you want to stay close to the current directory without diving into every nested subdirectory.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ripgrep quick reference"
  steps={[
    { content: "**Install** — `sudo apt install ripgrep` on Ubuntu/WSL2" },
    { content: "**Configure** — create `~/.ripgreprc` and point to it via `RIPGREP_CONFIG_PATH` in `~/.zshrc`" },
    { content: "**Type flags** — `-t php` instead of `--include=\"*.php\"` — shorter and smarter" },
    { content: "**Smart case** — `--smart-case` gives you case-insensitive searches that auto-switch to exact when you use uppercase" },
    { content: "**gitignore-aware** — `vendor/`, `node_modules/`, `.git/` are excluded automatically; no flags needed" },
    { content: "**Context lines** — `-C 3` shows 3 lines above and below each match" },
    { content: "**File list mode** — `rg -l` returns filenames only; pipe to `xargs` for bulk operations" },
    { content: "**Interactive mode** — `rgf \"pattern\"` combines ripgrep with fzf for live-preview search; full setup in [FZF + ripgrep](/blog/fzf-ripgrep)" }
  ]}
/>

## Conclusion

At the beginning of this article, I mentioned typing that `grep -rn --include="*.php" ... | grep -v vendor` command so many times it became muscle memory. Now, every time I open a terminal in WSL2, I reach for `rg` without even thinking. The `vendor/` exclusion is automatic, the output is readable without any flags, and the search is genuinely faster on large codebases. Between the `~/.ripgreprc` configuration, the type aliases in `~/.zshrc`, functions like `rgtodo` and `rgenv` in `~/.zsh/fns/`, and the `rgf` interactive search covered in [a dedicated article](/blog/fzf-ripgrep), ripgrep has stopped being a tool I consciously choose and started being the invisible backbone of how I navigate code every day. If you are still on bare grep in your WSL2 environment, give yourself twenty minutes with ripgrep — that is all it takes.
