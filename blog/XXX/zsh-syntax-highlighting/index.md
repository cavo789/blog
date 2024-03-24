---
slug: zsh-syntax-highlighting
title: Syntax highlighting in the console using ZSH
authors: [christophe]
image: /img/zsh_social_media.jpg
tags: [customization, linux, wsl, zsh]
enableComments: true
draft: true
---
![Syntax highlighting in the console using ZSH](/img/zsh_social_media.jpg)

[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/) is another gem for ZSH.

## Installation

Just clone the official repository like below:

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```
Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-autosuggestions` to the list. You'll have f.i. something like:

```text
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

Close your console, open a new one and it's done.

## How to use it

In fact, nothing has to be done.

From now, when you'll type a command like f.i. `cat` or `head`, the command will appears in green meaning this is a valid one, correctly typed and executable.

![Highlight in green](./images/head.png)

As the opposite, it'll appears in red when the command contains a typo i.e. isn't an executable one:

![Hightlight in red](./images/docker_dompose.png)