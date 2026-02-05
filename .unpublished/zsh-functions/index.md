---
slug: zsh-functions
title: ZSH Functions - Customizing Your Shell for Docker Management
description: A collection of ZSH functions to enhance your terminal experience, including interactive Docker container management with fzf. Start new sessions, stop containers, and more with ease.
authors: [christophe]
image: /img/v2/zsh.webp
mainTag: zsh
tags: [customization, linux, zsh]
draft: true
date: 2026-12-31
---
![ZSH Functions - Customizing Your Shell for Docker Management](/img/v2/zsh.webp)

A few ZSH functions that I use on a daily basis and that I find useful. These functions can be added to your `~/.zshrc` file to enhance your terminal experience while working with Docker.

<!-- truncate -->

This function relies on `fzf` to provide an interactive interface for selecting the container. If you don't have `fzf` installed, you can install it using your package manager (e.g., `sudo apt-get install fzf` on Debian-based systems).

## Start a new terminal session in a running Docker container

The `dex` function allows you to start a new terminal session in a running Docker container. Highly useful when you want to quickly access a container without having to remember its name or ID.

<AlertBox variant="note" title="You should have fzf installed on your system">
</AlertBox>

Simply run `dex` in your terminal, and it will list all running Docker containers. You can then select the container you want to access, and it will open a new terminal session inside that container.  Press <kbd>Enter</kbd> to select the container and start the session or press <kbd>Ctrl</kbd>+<kbd>E</kbd> to get the command in your prompt for editing (usefull if you want to modify the command before running it like disabling the entrypoint, using another user, ...).

<Snippet filename="dex.zsh" source="./files/dex.zsh" defaultOpen={false} />

## Stop one or more running Docker containers

Look at the `dstop` function, it allows you to stop one or more running Docker containers. It also uses `fzf` to provide an interactive interface for selecting the containers you want to stop.

<Snippet filename="dstop.zsh" source="./files/dstop.zsh" defaultOpen={false} />

## Access to logs of a running Docker container

The `dlogs` function allows you to access the logs of a running Docker container. It also uses `fzf` to provide an interactive interface for selecting the container whose logs you want to view.

<Snippet filename="dlogs.zsh" source="./files/dlogs.zsh" defaultOpen={false} />

## Make some cleaning, remove unused Docker containers, images, volumes and networks

The `dnuke` function allows you to stop and remove all running Docker containers. This can be useful when you want to quickly clean up your Docker environment.

<Snippet filename="dnuke.zsh" source="./files/dnuke.zsh" defaultOpen={false} />

## One to rule them all

The `dops` function is a wrapper around the other functions. It allows you to quickly access the other functions by using a single command. Simply run `dops` in your terminal, and it will list all the available functions. You can then select the function you want to use, and it will execute the corresponding command.

<Snippet filename="~/.zsh/docker.zsh" source="./files/docker.zsh" defaultOpen={false} />

Now, edit your `~/.zshrc` file and add the following line to source the `docker.zsh` file: `[[ -f ~/.zsh/docker.zsh ]] && source ~/.zsh/docker.zsh`. This will make the functions available in your terminal.
