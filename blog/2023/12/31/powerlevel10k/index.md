---
slug: powerlevel10k_sandbox
title: Customize your Linux prompt with Powerlevel10k
date: 2023-12-31
description: Test and customize the Powerlevel10k Zsh theme for your Linux or WSL prompt in a safe Docker sandbox environment before committing to a full installation.
authors: [christophe]
image: /img/v2/customization_prompt.webp
mainTag: customization
tags: [customization, docker, tips, wsl, zsh]
language: en
---
![Customize your Linux prompt with Powerlevel10k](/img/v2/customization_prompt.webp)

When you're working with Linux (also working with WSL thus), there are many ways to personalize your prompt. One of the simplest solutions is to use [Powerlevel10k](https://github.com/romkatv/powerlevel10k) and its wizard.

In this article we're going to use a Docker container just to : *test and discard*.  The Docker container will only be used to install Powerlevel10k, configure it and play with it. After that, it's up to you to see whether you like the interface and, if you do, to redo the installation on your machine rather than in Docker.

The tip comes from [https://github.com/romkatv/powerlevel10k/blob/master/README.md](https://github.com/romkatv/powerlevel10k/blob/master/README.md#try-it-in-docker)

<!-- truncate -->

By running the single command below, you'll download a very small Linux Alpine image then start some initializations like installing `git`, `nano`, `zsh`, ... The Powerlevel10k repository will be downloaded from Github and its wizard will be started.

<Terminal>
$ docker run -e TERM -e COLORTERM -e LC_ALL=C.UTF-8 -it --rm alpine sh -uec '
  apk add git zsh nano vim
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k
  echo "source ~/powerlevel10k/powerlevel10k.zsh-theme" >>~/.zshrc
  cd ~/powerlevel10k
  exec zsh'
</Terminal>

So, inside a Docker container, you'll install Powerlevel10k, see how it's looks like, ... and decide if you want to adopt it or not.

<AlertBox variant="note" title="Everything is done in RAM; nothing on your disk">
Running the `docker run` command here above will download a Docker Alpine Linux image on your disk (less than 7 MB) then will install binaries inside the running container so, by leaving the container using the `exit` command, nothing will stay on your disk. Ideal for testing.

</AlertBox>

When you exit the Docker container, everything will be lost but, now, you know if you like it or not. And, if you like it, just proceed on the installation of Powerlevel10k by following his [installation guide](https://github.com/romkatv/powerlevel10k#installation).

What I particularly like:

* You can always see the name of the git branch you're working on,
* The connected user name (like `root` f.i.),
* When an instruction is finished, the new prompt displays the time taken by the instruction, useful when you're trying to optimize a command,
* On the right, you can see immediately if the instruction has failed, with a red display and the error code (`exitcode`),
* And, of course, the visual aspect, which is pretty cool.

And also, because I work in Docker containers on a daily basis, using Powerlevel10k locally gives me a strong visual indication to remind me at all times whether I'm local or in a container.
