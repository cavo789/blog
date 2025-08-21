---
slug: zsh-plugin-ssh-config-suggestions
title: SSH - Autosuggestions with ZSH
authors: [christophe]
image: /img/zsh_tips_social_media.jpg
mainTag: ssh
tags: [customization, linux, ssh, wsl, zsh]
enableComments: true
blueSkyRecordKey: 3lwgca4zqh22i
---
![SSH - Autosuggestions with ZSH](/img/zsh_tips_banner.jpg)

A few weeks ago, I've posted a [SSH - Launch a terminal on your session without having to authenticate yourself](/blog/linux-ssh-scp#using-the-config-file) article about the `ssh` command in Linux.

I'm pretty sure, like me, you are tired to use command line like `ssh christophe@1.2.3.4` to start a ssh connection because ... you know, you don't need to connect on a server; no, you need to connect to the server where the application is running; you know the name of the *MyAmazingApp* application but certainly not the name of the server or its IP.

That's the case for me anyway.

So, I need to connect to my vault, in which I list all the information about applications, server names, credentials to be used, ...

It would be pretty cool to run `ssh MyAmazingApp` no?

<!-- truncate -->

It should be really nice to be able to run `ssh AmazingApp` and hop, I'm connected on the server.

This is where the `~/.ssh/config` is so helpful (please refer to this [article](/blog/linux-ssh-scp#using-the-config-file)) but we can go one step further: it would be so great to type `ssh` and by some magic, Linux will show you the list of aliases defined in the `~/.ssh/config` file.

## Installation of the zsh-ssh-config-suggestions plugin

If you've a ZSH user, please surf to [https://github.com/yngc0der/zsh-ssh-config-suggestions](https://github.com/yngc0der/zsh-ssh-config-suggestions) and follow installation's instructions.

In short:

1. First run this command `git clone https://github.com/yngc0der/zsh-ssh-config-suggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-ssh-config-suggestions` to get a local copy of the plugin in your `Oh-my-zsh` plugin folder.
2. Edit your `~/.zshrc` file, search the line with the `plugins=(` declaration and just add `zsh-ssh-config-suggestions` in the list.
3. Close and save your changes.
4. Run `source ~/.zshrc` to reload that file so your change can be taken into account.

## Use it

Imagine I've this content in my `~/.ssh/config`:

<Snippet filename="~/.ssh/config">

```bash
Host MyAmazingApp_PROD
    Hostname 1.2.3.4
    User usr_app_prod

Host MyAmazingApp_TEST
    Hostname 6.7.8.9
    User usr_app_test

Host YourAmazingApp
    Hostname 1.2.3.4
    User you

Host LegacyApp
    Hostname 1.2.3.4
    User legacy
```

</Snippet>

Now, I really don't need to remember anything and I don't even need to know the names of the aliases any more!

I just need to type (it's important): <kbd>ssh </kbd> followed by <kbd>TAB</kbd>

![Using ssh-config-suggestions](./images/zsh-plugin-ssh-config-suggestions.gif)

:::caution You should add a space character after `ssh`
To make it working, please note: you should add a space character after having typed `ssh` and before pressing <kbd>tab</kbd>.
:::

As you can see, the system will display the list of hosts defined in my configuration file! I can then edit the file, add a new application and hop, next time, I'll get his name in the list. I don't need anymore to connect to my vault. Nice no?
