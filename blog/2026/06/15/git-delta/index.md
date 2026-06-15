---
slug: git-delta
title: "delta: a Syntax-Highlighted Pager for git diff"
authors: [christophe]
image: /img/v2/git-delta.webp
mainTag: git
tags: [git, linux, bash]
ai_assisted: true
date: 2026-06-15
description: Stop squinting at raw git diff outputs. Learn how to install and configure Delta to add syntax highlighting and side-by-side views in under 5 minutes.
language: en
blueskyRecordKey: 3mnrw7ah2kc2o
---


![delta: a Syntax-Highlighted Pager for git diff](/img/v2/git-delta.webp)

<TLDR>
`git diff` output is functional but hard to read: no syntax highlighting, no side-by-side view, line numbers buried in `@@ -47,6 +47,8 @@` noise. `delta` is a drop-in pager replacement that transforms every `git diff`, `git show`, and `git log -p` into a syntax-highlighted, side-by-side view with word-level diffs — with zero changes to your git commands.
</TLDR>

You've been staring at `git diff` output for thirty seconds trying to figure out what actually changed. The plus and minus lines blur together, every file looks the same shade of red and green, and the line numbers are buried in a header that takes conscious effort to parse.

`delta` fixes it in five minutes.

<!-- truncate -->

## What is delta?

[delta](https://github.com/dandavison/delta) is a syntax-highlighting pager that sits between git and your terminal. It intercepts raw diff output and renders it with:

* Syntax highlighting per language — a TypeScript change looks like TypeScript, a YAML change looks like YAML
* Side-by-side view — old version on the left, new version on the right, aligned line by line
* Word-level diff — highlights the exact characters that changed within a line, not the entire line
* Line numbers — always visible, consistently aligned
* Navigation — jump between diff hunks with `n` and `N`

The key point: **you don't change a single git command**. You still type `git diff`, `git show`, `git log -p`. Delta intercepts the output automatically.

## Install

<Terminal>
$ sudo apt install git-delta
</Terminal>

Verify:

<Terminal>
$ delta --version
delta 0.18.2
</Terminal>

<AlertBox variant="note" title="On older Ubuntu/Debian releases">
The package might be named `delta` rather than `git-delta`. If `apt install git-delta` fails, try `sudo apt install delta` — or install the latest binary from the [GitHub releases page](https://github.com/dandavison/delta/releases).
</AlertBox>

## Configure git to use delta

Delta works as a `core.pager` replacement. Open your `~/.gitconfig` and add:

```ini
[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    navigate = true
    side-by-side = true
    line-numbers = true
    syntax-theme = Dracula

[merge]
    conflictstyle = diff3

[diff]
    colorMoved = default
```

Save the file. No shell restart required — the pager is invoked per-command.

Let's look at what each option does.

<StepsCard
  variant="remember"
  title="Configuration reference"
  steps={[
    {
      content: "**`core.pager = delta`** — tells git to pipe all paginated output through delta instead of `less`. This covers `git diff`, `git show`, `git log -p`, `git stash show -p`, and more.",
    },
    {
      content: "**`interactive.diffFilter = delta --color-only`** — applies delta's color rendering inside interactive commands like `git add -p`, without breaking the input handling.",
    },
    {
      content: "**`navigate = true`** — press `n` to jump to the next changed file, `N` to go back. Essential when reviewing a diff with many files.",
    },
    {
      content: "**`side-by-side = true`** — displays the old and new versions in two columns. The single biggest readability improvement.",
    },
    {
      content: "**`line-numbers = true`** — shows line numbers in a dedicated column on each side. No more parsing `@@ -47,6 +47,8 @@` headers.",
    },
    {
      content: "**`syntax-theme = Dracula`** — sets the color theme for syntax highlighting. Change this to match your terminal's theme. Run `delta --list-syntax-themes` to see all options.",
    },
    {
      content: "**`merge.conflictstyle = diff3`** — when combined with delta, shows all three versions during a merge conflict (ours, theirs, and the common ancestor). Much easier to resolve.",
    }
  ]}
/>

## Before and after

### A changed line without delta

```diff
-  const expiry = token.exp * 1000;
+  const expiry = token.exp * 1000 + TOKEN_GRACE_MS;
```

Everything is the same weight. You scan the entire line looking for the difference.

### The same line with delta

Delta highlights `+ TOKEN_GRACE_MS` at the character level — the rest of the line stays dim. Your eye goes straight to the change, not to the unchanged context around it.

This word-level diff is especially valuable when:

* A variable was renamed (`getUserById` → `findUserById`)
* A string had a typo fixed
* A flag was added or removed from a long function call

Without word-level diff, each of those scenarios produces a fully-red removed line and a fully-green added line. With delta, only the changed word is highlighted.

## Side-by-side mode

With `side-by-side = true`, delta splits each changed file into two columns:

* **Left** — the old version, with removed lines in red
* **Right** — the new version, with added lines in green
* **Both** — unchanged context lines are shown on both sides, aligned

For a renamed function called in ten places, you no longer read two interleaved streams of red and green. You read the before on the left and the after on the right, like a code review tool.

If your terminal is narrow and the two columns become cramped, you can toggle off side-by-side for a single command:

```bash
git -c delta.side-by-side=false diff
```

Or add a short alias to `.gitconfig`:

```ini
[alias]
    dw = -c delta.side-by-side=false diff
```

`git dw` gives you single-column mode; `git diff` keeps the default.

## Themes

Delta uses the same theme engine as `bat` and `syntect`. To list all available themes:

<Terminal>
$ delta --list-syntax-themes
</Terminal>

To preview a theme without changing your config:

<Terminal>
$ git diff | delta --syntax-theme=gruvbox-dark
</Terminal>

Good starting points:

| Terminal background | Theme |
|---|---|
| Dark | `Dracula`, `gruvbox-dark`, `TwoDark`, `Nord` |
| Light | `GitHub`, `Monokai Extended Light`, `OneHalfLight` |

## Navigation between hunks

With `navigate = true`, delta adds keyboard navigation inside the pager:

| Key | Action |
|---|---|
| `n` | Jump to the next changed file |
| `N` | Jump to the previous changed file |
| `q` | Quit |
| `Space` | Page down |

This is most useful with `git log -p` or `git diff HEAD~10` where the diff spans many files.

## Delta works everywhere git does

Once `core.pager = delta` is set, delta applies to every git command that pages output:

```bash
git show HEAD           # last commit, with highlighting
git log -p              # full history with diffs
git stash show -p       # what's in a stash entry
git diff HEAD~3         # compare to 3 commits ago
git diff main...feature # compare branches
```

No extra flags. No wrapper functions. It just works.

## Going further

If you also use <Link to="/blog/gitconfig-tips-and-tricks">`git diff` aliases in your `.gitconfig`</Link>, those aliases automatically benefit from delta since the pager is applied at the output stage, not the command stage.

For an even richer TUI git experience, delta works as the diff renderer inside [lazygit](https://github.com/jesseduffield/lazygit) and [tig](https://github.com/jonas/tig) — both TUI git clients that respect `core.pager`.
