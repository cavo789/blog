---
slug: linux-exa
title: Let's revisit the ls command thanks to exa 
authors: [christophe]
image: /img/linux_tips_social_media.jpg
tags: [customization, linux]
enableComments: true
draft: true
---
![Let's revisit the ls command thanks to exa](/img/linux_tips_banner.jpg)

Which CLI command would you say you use most on Linux? Most definitely `ls` to display the list of files in the current directory.

I don't know about you, but I rarely use ls "on its own" without any parameters. Almost without thinking, I add `-alh` every time. It's become mechanical.

And then you'll say to me, well, all you have to do is create an alias `alias ls="ls -alh"`; of course, but let's go further and revisit this ultra-basic command and add some functionality to it.

<!-- truncate -->

`exa` is a modern replacement for `ls` as stated on their website: [https://the.exa.website/](https://the.exa.website/).

## Install exa

The installation is simple, you just need to run `sudo apt-get update && sudo apt-get install exa`; nothing more.

From now, simply run `exa` on the command line and you'll get the list of files with all the defaults presets.

On my computer, I've chosen for this list of parameters: `--all --long --group --group-directories-first --icons --header --time-style long-iso` and, for sure, I've update by `~/.bashrc` file by adding an alias:

```bash
alias ls='exa --all --long --group --group-directories-first --icons --header --time-style long-iso'
```

And, now, by just typing `ls`, I'll get this:

![exa](./images/exa.png)
