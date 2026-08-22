---
slug: zsh-syntax-highlighting
title: Syntax highlighting in the console using ZSH
date: 2024-03-29
description: Enhance your Zsh console with syntax highlighting! See commands turn green (valid) or red (invalid) as you type. Quick installation guide for zsh-syntax-highlighting.
authors: [christophe]
image: /img/v2/zsh.webp
series: Customize your shell with ZSH
mainTag: zsh
tags:
  - customization
  - linux
  - wsl
  - zsh
language: en
updates:
  - date: 2026-02-04
    note: updated plugins array; show only installed plugins
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![Syntax highlighting in the console using ZSH](/img/v2/zsh.webp)

<TLDR>
This article introduces `zsh-syntax-highlighting`, a Zsh plugin that colors commands in your terminal as you type: green for valid, executable commands and red for typos or unknown ones. It walks through cloning the plugin into your Oh My Zsh custom plugins folder and adding it to the `plugins=(...)` list in `~/.zshrc`, with no further configuration needed to start using it.
</TLDR>

[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/) is another gem for ZSH — assuming you've already installed Oh-My-Zsh (see <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> if not).

As you type, you'll be able to tell from the colors that, for example, something isn't quite right.

If you type `head` followed by a space, ZSH will display this word in green: this command exists and is valid.  If you type `heat` there, the word will appear in red: this command does not exist.

It sounds simple, but it's so practical.

<!-- truncate -->

## What Syntax Highlighting Looks Like

Type a command like `cat` or `head` and it turns green: the command exists, it's correctly typed and it's executable.

![Highlight in green](./images/head.webp)

Make a typo and the very same word turns red before you even press <kbd>ENTER</kbd>:

![Highlight in red](./images/docker_compose.webp)

That color appears **while you type**, not after the command has failed. You know you've mistyped `docekr` before losing a second to a `command not found`. <!-- spellchecker:disable-line -->

## How to use it

In fact, nothing has to be done: there is no configuration file, no option to set, no alias to define. Install the plugin, reload your shell, and the coloring is simply there from the next character you type.

## Seeing It in Action with Docker

No history to seed, no config to write — this plugin needs nothing but itself, which makes it a
perfect one-command Docker test.

<AlertBox variant="tip" title="Why Docker first?">
The Dockerfile below installs Oh-My-Zsh and the plugin, and enables it in `~/.zshrc` — the exact
two steps from the "Installation" section, done for you. Nothing on your own machine changes.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Build and run it:

<Terminal title="user@machine: ~/syntax-demo">
$ docker build -t syntax-demo .
[+] Building 18.4s (7/7) FINISHED
 ✔ exporting to image

$ docker run --rm -it syntax-demo
🐳 root ~ # head
</Terminal>

Type `head` and the word turns green as you finish typing it — the command exists. Backspace it,
type `heat` or `docekr` instead, and it turns red before you even press <kbd>ENTER</kbd>: same
scene as the two screenshots above, live in your own terminal.

## Installation

Just clone the official repository like below:

<Terminal typewriter>
$ {`git clone https://github.com/zsh-users/zsh-syntax-highlighting \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`}
</Terminal>

Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-syntax-highlighting` to the list. You'll have f.i. something like:

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Close your console, open a new one (or run `source ~/.zshrc` to load your change) and it's done.

## Conclusion

Two lines of setup and your terminal starts proofreading you: green means "this will run", red means "fix me first". It's the kind of tiny feedback loop you stop noticing after a week — until you sit at a machine without it and start typing blind again.

Its natural companion is <Link to="/blog/zsh-plugin-autosuggestions">Autosuggestions in the console using ZSH</Link>: this one tells you whether what you're typing is valid, the other saves you from typing it at all.
