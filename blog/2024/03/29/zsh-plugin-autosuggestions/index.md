---
slug: zsh-plugin-autosuggestions
title: Autosuggestions in the console using ZSH
date: 2024-03-29
description: Boost your ZSH console efficiency. Install the zsh-autosuggestions plugin easily and get intelligent command suggestions from your history as you type.
authors: [christophe]
image: /img/v2/zsh.webp
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
---
![Autosuggestions in the console using ZSH](/img/v2/zsh.webp)

<TLDR>
This article covers `zsh-autosuggestions`, a Zsh plugin that suggests commands from your shell history as you type, shown in gray text you can accept with <kbd>TAB</kbd>. It explains how to install the plugin by cloning it into your Oh My Zsh custom plugins folder and enabling it in `~/.zshrc`, then shows how to accept, cycle through, or ignore suggestions using <kbd>TAB</kbd> and the arrow keys.
</TLDR>

ZSH supports plugins, and one of the wonders is the [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) one — assuming you've already installed Oh-My-Zsh (see <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> if not).

*Suggestions come from your history, so it's worth knowing how that history is stored and filtered: see <Link to="/blog/linux-history">Linux - Working with the history of your last fired actions</Link>. Another plugin in the same spirit: <Link to="/blog/zsh-plugin-ssh-config-suggestions">SSH - Autosuggestions with ZSH</Link>.*

That one will suggest commands as you type based on your previous history and completions.

The more you use your Linux console, the more valuable this plugin will prove to be, as it will learn from you; it will know which commands you have already executed and will suggest them as soon as you start typing the first characters. No more wondering, "Gee, what were the parameters I used for ...".

<!-- truncate -->

## Installation

Just clone the official repository like below:

<Terminal typewriter>
$ {`git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`}
</Terminal>

Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-autosuggestions` to the list. You'll have f.i. something like:

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Close your console, open a new one (or run `source ~/.zshrc` to load your change) and it's done.

## How to use it

Auto-suggestions will retrieve from the HISTORY the commands you've already used on your computer and will use them as suggestions.

Imagine you've already type, today, yesterday or weeks ago the `docker compose up --detach` command. Today, just by typing `doc` you'll get, in gray, the suggestion. Press <kbd>TAB</kbd> if it's fine for you and it's done.

You can also play with <kbd>UP</kbd> and <kbd>DOWN</kbd> to switch and use other commands that match the keys (*doc* in my example). Auto-suggestions is using the HISTORY of Linux.

![Autosuggestions plugin for ZSH](./images/autosuggestions.webp)
