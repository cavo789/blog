---
slug: zsh-plugin-autosuggestions
title: Autosuggestions in the console using ZSH
authors: [christophe]
image: /img/zsh_social_media.jpg
tags: [customization, linux, wsl, zsh]
enableComments: true
draft: true
---
![Autosuggestions in the console using ZSH](/img/zsh_social_media.jpg)

ZSH supports plugin and one of the wonders is the [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) one.

That one will suggests commands as you type based on your previous history and completions.

<!-- truncate -->

## Installation

Just clone the official repository like below:

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-autosuggestions` to the list. You'll have f.i. something like:

```text
plugins=(
  git
  zsh-autosuggestions
)
```

Close your console, open a new one and it's done.

## How to use it

Auto-suggestions will retrieve from the HISTORY the commands you've already used on your computer and will use them as suggestions.

Imagine you've already type, today, yesterday or weeks ago the `docker compose up --detach` command. Today, just by typing `doc` you'll get, in gray, the suggestion. Press <kbd>TAB</kbd> if it's fine for you and it's done.

You can also play with <kbd>UP</kbd> and <kbd>DOWN</kbd> to switch and use another commands that match with the keys (*doc* in my example). Auto-suggestions is using the HISTORY of Linux.

![Autosuggestions plugin for ZSH](./images/autosuggestions.png)

## Official demo

<a href="https://asciinema.org/a/37390" rel="nofollow"><img src="https://camo.githubusercontent.com/33098ce638a2788133a2bdc91d1757ddc78478d9e88ade5367b23ea4a36830bc/68747470733a2f2f61736369696e656d612e6f72672f612f33373339302e706e67" width="400" data-canonical-src="https://asciinema.org/a/37390.png" /></a>