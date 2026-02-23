---
slug: zsh-plugin-ssh-config-suggestions
title: SSH - Autosuggestions with ZSH
date: 2025-02-13
description: Get instant SSH autosuggestions in ZSH. Learn to install the zsh-ssh-config-suggestions plugin and display all your ~/.ssh/config aliases with a simple TAB press.
authors: [christophe]
image: /img/v2/ssh.webp
mainTag: ssh
tags: [customization, linux, ssh, wsl, zsh]
language: en
updates:
  - date: 2026-02-04
    note: updated plugins array; show only installed plugins
blueskyRecordKey: 3lwgca4zqh22i
---
![SSH - Autosuggestions with ZSH](/img/v2/ssh.webp)

<TLDR>
Stop memorizing server IPs and SSH commands. This article shows you how to streamline your SSH workflow with `zsh-ssh-config-suggestions`, a ZSH plugin that provides autosuggestions for your SSH connections. By leveraging your `~/.ssh/config` file, this plugin allows you to simply type `ssh ` and press Tab to see a list of all your configured server aliases. Learn how to install and configure this handy plugin to make connecting to your servers faster and more efficient.
</TLDR>

A few weeks ago, I've posted a <Link to="/blog/linux-ssh-scp#using-the-config-file">SSH - Launch a terminal on your session without having to authenticate yourself</Link> article about the `ssh` command in Linux.

I'm pretty sure, like me, you are tired to use command line like `ssh christophe@1.2.3.4` to start a ssh connection because ... you know, you don't need to connect on a server; no, you need to connect to the server where the application is running; you know the name of the *MyAmazingApp* application but certainly not the name of the server or its IP.

That's the case for me anyway.

So, I need to connect to my vault, in which I list all the information about applications, server names, credentials to be used, ...

It would be pretty cool to run `ssh MyAmazingApp` no?

<!-- truncate -->

It should be really nice to be able to run `ssh AmazingApp` and hop, I'm connected on the server.

This is where the `~/.ssh/config` is so helpful (please refer to this <Link to="/blog/linux-ssh-scp#using-the-config-file">article</Link>) but we can go one step further: it would be so great to type `ssh` and by some magic, Linux will show you the list of aliases defined in the `~/.ssh/config` file.

## Installation of the zsh-ssh-config-suggestions plugin

Just clone the official repository by running this command: `git clone https://github.com/yngc0der/zsh-ssh-config-suggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-ssh-config-suggestions`. You'll get a local copy of the plugin in your `Oh-my-zsh` plugin folder.

Then edit the `~/.zshrc` file, search for `plugins=(` and add `zsh-ssh-config-suggestions` to the list. You'll have f.i. something like:

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Close your console, open a new one (or run `source ~/.zshrc` to load your change) and it's done.

## Use it

Imagine I've this content in my `~/.ssh/config`:

<Snippet filename="~/.ssh/config" source="./files/config" />

Now, I really don't need to remember anything and I don't even need to know the names of the aliases any more!

I just need to type (it's important): <kbd>ssh </kbd> followed by <kbd>TAB</kbd>

![Using ssh-config-suggestions](./images/zsh-plugin-ssh-config-suggestions.gif)

<AlertBox variant="highlyImportant" title="You should add a space character after `ssh`">
To make it working, please note: you should add a space character after having typed `ssh` and before pressing <kbd>tab</kbd>.
</AlertBox>

As you can see, the system will display the list of hosts defined in my configuration file! I can then edit the file, add a new application and hop, next time, I'll get his name in the list. I don't need anymore to connect to my vault. Nice no?
