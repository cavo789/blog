---
slug: navi
title: "navi — Your Command-Line Memory, Searchable with fzf"
description: "navi is an interactive cheatsheet tool. Browse community cheatsheets or write your own .cheat files, filter with fzf, and paste the exact command into your terminal — variables filled in interactively."
authors: [christophe, claude]
image: /img/v2/repo_with_fzf.webp
mainTag: linux
draft: true
tags: [bash, fzf, linux, zsh]
date: 2026-08-18
ai_assisted: true
---

![navi — Your Command-Line Memory, Searchable with fzf](/img/v2/repo_with_fzf.webp)

<TLDR>
`navi` is an interactive cheatsheet tool that uses fzf to search and execute commands. You write `.cheat` files with descriptions and variable placeholders — navi presents them in a fuzzy-searchable list, asks for variable values interactively, and loads the final command into your prompt. Think of it as a searchable, executable bookmark system for your most-used commands.
</TLDR>

You know the `docker inspect` command exists. You can't remember whether the format flag uses `--format` or `--fmt`, whether the template syntax is `{{.Config.Env}}` or `{{.Env}}`, and what quotes to use around the whole thing.

So you open a browser, search, find a Stack Overflow answer, copy the command, adapt it. It works. Next week you do the same thing again.

`navi` breaks this loop.

<!-- truncate -->

## What navi is

[`navi`](https://github.com/denisidoro/navi) is a command-line cheatsheet tool that uses fzf for searching. You write `.cheat` files with named commands, descriptions, and variable placeholders. Selecting one prompts for any variable values and loads the completed command onto your shell prompt — ready to edit or run.

## First run — browse community cheatsheets

Launch navi without arguments:

<Terminal>
navi
</Terminal>

On the first run, navi offers to download community cheatsheets from the [cheatsheets repository](https://github.com/denisidoro/cheats). Accept. This gives you hundreds of ready-to-use commands for `git`, `docker`, `kubectl`, `curl`, `ssh`, and more.

The fzf interface opens. Type to filter — navi searches both command descriptions and the commands themselves:

```
> docker logs
  docker, containers
  Follow logs of a container (last 50 lines)
  docker logs -f --tail 50 <container>
──────────────────────────────────────────
```

Press `Enter` on a command that has variables — navi prompts for each one. For `<container>`, it runs `docker ps` and presents the results in a second fzf picker. Select the container, press `Enter`, and the completed command lands on your prompt:

```
$ docker logs -f --tail 50 my_api_container█
```

You can edit it before running, or just press `Enter`.

The key difference from a simple alias: navi handles variables interactively, pulling live data (a running container, in this example) into the picker instead of making you type it from memory.

## Install

**With cargo (Rust toolchain required):**

<Terminal>
cargo install navi
</Terminal>

**As a static binary (no Rust needed):**

<Terminal>
# Download the latest release for Linux x86_64
curl -L https://github.com/denisidoro/navi/releases/latest/download/navi-x86_64-unknown-linux-musl.tar.gz \
  | tar -xz -C ~/.local/bin
</Terminal>

**With Homebrew (macOS / Linux):**

<Terminal>
brew install navi
</Terminal>

Verify:

<Terminal>
navi --version
</Terminal>

```
navi 2.23.0
```

## The .cheat file format

Cheatsheets are plain text files with a simple structure:

```
% tags, separated, by, commas

# Description of the command
the actual command with <variable_placeholders>

$ variable_name: command that produces the list of valid values
```

Three elements:
1. `%` line: comma-separated tags that group commands in the search results
2. `#` line: human-readable description (this is what you search by)
3. Command line: the actual command, with `<angle_bracket>` placeholders for variables
4. `$` line (optional): for each placeholder, a shell command that produces the list of values to pick from

## Writing your own cheatsheet

Store your cheatsheets in `~/.local/share/navi/cheats/`. Create a file for Docker:

<Snippet source="./files/docker.cheat" language="bash" />

A few things to note:

- The `$ container:` line runs `docker ps` and shows the output as a picker when `<container>` is needed. The user selects one running container from the live list.
- The `$ image:` line does the same for `<image>`.
- The `$ service:` line queries `docker compose config --services` — so it works only from a directory with a `compose.yaml`.
- Commands without `$` variables (like `docker container prune -f`) run directly with no prompts.

## ZSH integration — CTRL+G

The most useful setup: bind navi to a keyboard shortcut so it's accessible from any shell context.

Add to your `~/.zshrc`:

```bash
# navi widget — press CTRL+G to search cheatsheets from anywhere
_navi_widget() {
  local selected
  selected=$(navi --print 2>/dev/null)
  if [[ -n "$selected" ]]; then
    LBUFFER="$selected"
    zle redisplay
  fi
}
zle -N _navi_widget
bindkey '^G' _navi_widget
```

Now press `CTRL+G` from any command prompt. The fzf picker opens, you filter and select, and the command appears in-place on your current line — with your cursor at the end, ready to run or edit.

This is the workflow: start typing a command, forget a flag, press `CTRL+G`, find the right version, press `Enter`, continue.

<AlertBox type="tip" title="navi --print vs direct execution">
`navi --print` outputs the filled command to stdout instead of running it. The widget above uses `--print` and places the result on the prompt line, giving you one last chance to review before pressing Enter. Without `--print`, navi executes immediately.
</AlertBox>

## Organizing cheatsheets

All `.cheat` files in `~/.local/share/navi/cheats/` are loaded automatically. You can create subdirectories:

```
~/.local/share/navi/cheats/
  docker.cheat
  git.cheat
  ssh.cheat
  work/
    gitlab-ci.cheat
    internal-tools.cheat
```

To add community repositories on top of your own:

<Terminal>
navi repo add https://github.com/denisidoro/cheats
navi repo add https://github.com/nicknisi/dotfiles  # any public repo with .cheat files
</Terminal>

## navi vs aliases

Both solve the "I forget commands" problem. The difference:

| | Aliases | navi |
|--|---------|------|
| Handles variables | No (or manual) | Yes, with fzf pickers |
| Searchable | No | Yes, full-text |
| Needs a description | No | Yes (the `#` line) |
| Survives across machines | If you sync dotfiles | `.cheat` files in a repo |
| Discoverable | Only if you remember the alias | Always |

Aliases win for very short, fixed commands (`alias ll='ls -la'`). Navi wins for anything with parameters, or anything you run rarely enough to forget.

## Where to go from here

The <Link to="/blog/linux-fzf-introduction">fzf introduction</Link> covers the fundamentals of fuzzy finding that power navi's search. For terminal-based code search where you already know what you're looking for, <Link to="/blog/fzf-ripgrep">FZF + ripgrep</Link> is the complementary tool — find code by content, not by command name.

Your <Link to="/blog/zsh-docker-functions">ZSH Docker functions</Link> (`dex`, `dstop`, `dlogs`) already automate some of what navi's Docker cheatsheet covers. The two approaches complement each other: ZSH functions for your most-used one-liners, navi for the commands you run every few weeks and can never quite remember.

## Conclusion

`navi` is the missing link between knowing a command exists and actually being able to use it. The `.cheat` format is simple enough to write in two minutes, the fzf integration makes searching fast, and the variable system makes it genuinely useful — not just a static text file you have to look up and adapt yourself.

Write your first `.cheat` file, bind `CTRL+G`, and see how long it takes before you wonder how you worked without it.
