---
slug: ssh-with-fuzzy-finder
title: Master your ssh command and select the host from a list
date: 2026-04-27
authors: [christophe]
image: /img/v2/sshf.webp
description: Build an interactive, searchable SSH host selector using FZF. Learn to modularize your SSH configurations, add rich documentation, and trigger advanced custom actions via a fast Terminal User Interface.
mainTag: linux
tags:
  - bash
  - customization
  - fzf
  - linux
language: en
blueskyRecordKey: 3mkhfxskcdk2z
---
![Master your ssh command and select the host from a list](/img/v2/sshf.webp)

<TLDR>Managing dozens of server connections in a monolithic `~/.ssh/config` file quickly becomes unmaintainable and relies too heavily on memorization. This post demonstrates a cleaner approach by breaking your configuration into project-specific files within a `~/.ssh/conf.d/` directory, allowing you to attach rich, styled documentation directly above your host definitions. To tie it all together, you will implement a custom shell function (sshf) powered by FZF. This creates a fast, searchable Terminal User Interface (TUI) that lets you instantly filter hosts by name, project, or metadata. It also goes a step further by introducing custom keybindings, enabling you to trigger advanced contextual actions—like pinging servers, modifying configurations, or generating system inventories—directly from the search menu.</TLDR>

On my machine, I've accumulated more and more hosts in my `~/.ssh/config` file. While I can type `ssh server4` (see <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions</Link>) to jump to that server, I still have to remember the list of available servers. This is manageable when dealing with just a few, but I currently have around 50 servers, and relying solely on memory is no longer practical.

It would be much more convenient to view the full list of hosts through a TUI (*Terminal User Interface*), select the desired host, and simply press <kbd>Enter</kbd>. Furthermore, it would be extremely helpful to access contextual information—such as the URL hosted on that server, whether a database is running, the PHP version, and more.

Additionally, creating one `.conf` file per project would eliminate the need to maintain a massive, monolithic configuration file containing all 50 servers. Let's explore how to achieve this setup in this post.

<!-- truncate -->

Before diving into the technical details, here is a preview of the final result:

![Our sshf TUI](./images/tui.webp)

On the left side, there is a search box (allowing me to type `amazing` to filter on that pattern) above a list of hosts. On the right side, contextual information about the selected host is displayed.

Once a host is selected, I simply press <kbd>Enter</kbd> to open an SSH terminal session on that host—without having to enter my credentials manually.

Let's get started...

## Install FZF

Check out my previous <Link to="/blog/linux-fzf-introduction">Fuzzy Finder</Link> blog post if you need more detailed information. Otherwise, simply run the command below and complete the installation by answering "Yes" to all prompts, following the instructions displayed in your terminal.

<Terminal wrap={true}>
$ git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf ; ~/.fzf/install
</Terminal>

While this isn't strictly related to SSH, you can now press <kbd>CTRL</kbd>+<kbd>R</kbd> to enjoy much easier access to your console history. This is just one of the great features of FZF.

## SSH configuration

The goal here is to organize your configuration more intelligently. Let's create an `~/.ssh/conf.d` folder where your configuration files will reside.

<Terminal wrap={true}>
$ mkdir -p ~/.ssh/conf.d
</Terminal>

For instance, create an `~/.ssh/conf.d/amazing.conf` file with the following content:

<Snippet filename="amazing.conf" source="./files/amazing.conf" defaultOpen={false} />

Then, create a second file named `~/.ssh/conf.d/legacy.conf` with this content:

<Snippet filename="legacy.conf" source="./files/legacy.conf" defaultOpen={false} />

Now, update your main `~/.ssh/config` file to include these new files:

```conf
Include conf.d/amazing.conf
Include conf.d/legacy.conf
```

This approach simply allows you to group hosts by project, making them easier to manage.

### Look at the amazing.conf file

We've defined three `Host` entries: `MyAmazingApp_PROD`, `MyAmazingApp_TEST`, and `YourAmazingApp`.

Notice that we've added some comments immediately before the first two `Host` lines (the placement is crucial).

This "doc-block" is plain text, so you can write whatever you like. For convenience, it supports markers like `blue`, `green`, `red`, `yellow`, `bg-red`, `bg-yellow`, and `bold`.

When the `MyAmazingApp_PROD` host is selected in the TUI, its associated doc-block will be displayed automatically.

## Add the sshf function

Edit your `~/.bashrc` (or `~/.zshrc`) file and append this function:

<Snippet source="./files/sshf.zsh" defaultOpen={false} />

Save the file and apply the changes by running `source ~/.bashrc` (or `source ~/.zshrc`).

Return to your terminal, type `sshf`, and press <kbd>Enter</kbd>. The magic will now unfold.

You will see the complete list of defined hosts. By typing a few letters, you will instantly apply filters. For example, simply type `prod` to filter the list and show only production servers.

Easy, isn't it?

## Using filtering options

You can filter based on any pattern. For instance, if you type `php`:

![Filtering on PHP servers](./images/php.webp)

FZF searches across all available data, not just the hostnames.

## My real use case

At work, I've taken this well beyond simply displaying a list of hosts. FZF supports custom keybindings, which means you can assign actions to keys other than just <kbd>Enter</kbd>. You can define actions triggered by <kbd>CTRL</kbd>+<kbd>A</kbd>, <kbd>CTRL</kbd>+<kbd>I</kbd>, or even a single letter like <kbd>E</kbd>.

This is where it gets truly powerful!

* For <kbd>CTRL</kbd>+<kbd>A</kbd>, I’ve set up a secondary screen that displays a list of actions to execute on the selected host.
* For <kbd>CTRL</kbd>+<kbd>I</kbd>, I run an inventory management script that scans all my hosts (or just the filtered ones) and generates a web page with an up-to-date inventory of installed software (such as PHP, Python, PostgreSQL versions).
* For <kbd>E</kbd>, you could, for example, open an editor to directly modify the configuration file of the selected host.

<Snippet source="./files/sshf_actions.zsh" defaultOpen={false} />

![Using Key bindings](./images/tui_with_actions.webp)

Your imagination is the only limit!
