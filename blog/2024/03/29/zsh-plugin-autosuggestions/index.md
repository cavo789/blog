---
slug: zsh-plugin-autosuggestions
title: Autosuggestions in the console using ZSH
date: 2024-03-29
description: Boost your ZSH console efficiency. Install the zsh-autosuggestions plugin easily and get intelligent command suggestions from your history as you type.
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
    note: added a Docker-first demo with a pre-seeded history to try before installing
---
![Autosuggestions in the console using ZSH](/img/v2/zsh.webp)

<TLDR>
This article covers `zsh-autosuggestions`, a Zsh plugin that suggests commands from your shell history as you type, shown in gray text you can accept with <kbd>TAB</kbd>. It explains how to install the plugin by cloning it into your Oh My Zsh custom plugins folder and enabling it in `~/.zshrc`, then shows how to accept, cycle through, or ignore suggestions using <kbd>TAB</kbd> and the arrow keys.
</TLDR>

ZSH supports plugins, and one of the wonders is the [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) one — assuming you've already installed Oh-My-Zsh (see <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> if not).

That one will suggest commands as you type, based on your previous history and completions. Three keystrokes, and the forty-character command you painfully assembled last month is sitting there, waiting for a <kbd>TAB</kbd>.

<!-- truncate -->

## Three Characters, and the Command Is Already There

Imagine you've already typed, today, yesterday or weeks ago, the `docker compose up --detach` command. Today, you type `doc` and here is what your console shows:

![Autosuggestions plugin for ZSH](./images/autosuggestions.webp)

The gray part is the suggestion. Press <kbd>TAB</kbd> and the whole line is yours; keep typing and the suggestion updates at every character; ignore it and nothing happens.

You can also play with <kbd>UP</kbd> and <kbd>DOWN</kbd> to switch to other commands matching the same keys (*doc* in my example).

## Why it works

- Suggestions come straight from your Linux HISTORY: no index to build, no configuration, nothing to teach the plugin.
- The more you use your console, the better the suggestions get — it learns from you and only from you.
- No more wondering, "Gee, what were the parameters I used for ...".

## Seeing It in Action with Docker

You don't need Oh-My-Zsh already running on your machine to see the plugin work — a throwaway
container does the job.

<AlertBox variant="tip" title="Why Docker first?">
The Dockerfile below installs Oh-My-Zsh, clones the plugin, enables it in `~/.zshrc`, and — the
part that matters — pre-seeds a shell history containing `docker compose up --detach`. Type `doc`
and the exact scenario from the screenshot above appears, with nothing to configure yourself.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Build and run it:

<Terminal title="user@machine: ~/autosuggestions-demo">
$ docker build -t autosuggestions-demo .
[+] Building 19.8s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it autosuggestions-demo
🐳 root ~ #
</Terminal>

Now just type `doc` (don't press <kbd>ENTER</kbd> yet) and the exact scene from the screenshot at
the top of this article plays out: `docker compose up --detach` fills in as gray, ghosted text
right after your cursor — read straight from the pre-seeded history. Press <kbd>TAB</kbd> to
accept it, or <kbd>↑</kbd>/<kbd>↓</kbd> to cycle to the other two `docker compose` commands also
sitting in that history.

## Installation

Just clone the official repository like below:

<Terminal typewriter>
$ {`git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`}
</Terminal>

Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-autosuggestions` to the list. You'll have f.i. something like:

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Close your console, open a new one (or run `source ~/.zshrc` to load your change) and it's done.

## Conclusion

One `git clone`, one line in `~/.zshrc`, and your terminal stops asking you to remember flags you typed three weeks ago. Because everything is read from your history, the plugin is worth more every day you use it.

Since suggestions are only as good as what's stored, it's worth knowing how that history is kept and filtered: see <Link to="/blog/linux-history">Linux - Working with the history of your last fired actions</Link>. And for a plugin in the same spirit, dedicated to your SSH hosts: <Link to="/blog/zsh-plugin-ssh-config-suggestions">SSH - Autosuggestions with ZSH</Link>.
