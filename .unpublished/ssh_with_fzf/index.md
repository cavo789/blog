---
slug: ssh-with-fuzzy-finder
title: Master your ssh command and select the host from a list
date: 2025-12-12
description:
authors: [christophe]
image: /img/v2/linux_tips.webp
mainTag: linux
tags: [bash, customization, fzf, linux, tips]
language: en
draft: true
blueskyRecordKey:
---
![Master your ssh command and select the host from a list](/img/v2/linux_tips.webp)

On my machine, I've more and more hosts in my `~/.ssh/config` file and even I was using <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions</Link>, it became difficult to manage.

So, instead of a big `~/.ssh/config` file, I've created smaller ones, one by project but, then the ZSH plugin didn't work anymore.

Let's see how to use <Link to="/blog/linux-fzf-introduction">Fuzzy Finder</Link> with the SSH command to get an improved experience.

<!-- truncate -->

## Install FZF

Read my previous Fuzzy Finder blog post if you need more detailled information but, otherwise, simply run the command below and finalize the installation by answering Yes to all questions. And follow instructions given on the console.

<Terminal wrap={true}>
$ git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf ; ~/.fzf/install
</Terminal>

So, from now, if you press <kbd>CTRL</kbd>+<kbd>R</kbd> you'll get a much easier access to your console history.

## SSH configuration

The idea in this article is to have a smarter file, let's create the `~/.ssh/conf.d` folder and create your configuration there.

So, for instance, create a `~/.ssh/conf.d/amazing.conf` file with this content:

```conf
Host MyAmazingApp_PROD
    Hostname 1.2.3.4
    User usr_app_prod

Host MyAmazingApp_TEST
    Hostname 6.7.8.9
    User usr_app_test

Host YourAmazingApp
    Hostname 1.2.3.4
    User you
```

and a second file called `~/.ssh/conf.d/legacy.conf` with this content

```conf
Host LegacyApp
    Hostname 1.2.3.4
    User legacy
``

Now, in your `~/.ssh/config` file, simply do this:

```conf
Include conf.d/amazing.conf
Include conf.d/legagy.conf
```

The idea here is just to group hosts by projects; nothing more.

## Add the sshf function

Edit your `~/.bashrc` file (or `~/.zshrc` one) and add this function:

```bash
sshf() {
    local host
    host=$(grep -hE '^Host ' ~/.ssh/config ~/.ssh/conf.d/* 2>/dev/null | \
           grep -v '*' | cut -d ' ' -f 2- | fzf --query="$1")

    if [ -n "$host" ]; then
        ssh "$host"
    fi
}
```

Save and load the file by running `source ~/.bashrc`.

From now on, simply type `sshf` and press <kbd></kbd>

You'll get the list of hosts defined in a list. By pressing some letters on your keyboard, you'll start to apply filters.  Simply type `prod` f.i. to filter on production servers.

Easy no?

## Go one step further

So we've a list of hosts... In my case a long list of hosts.  Not really easy to know on wich host I need to connect for ... (a specific project, database, ...) so let's improve the function.

<Snippet filename="~/.sshf.zsh" source="./files/sshf.zsh" defaultOpen={false} />

Now, just edit your `.zshrc` file, go to the end and add this line: `[ -f ~/.sshf.zsh ] && source ~/.sshf.zsh`

Run `source ~/.sshf.zsh` to load the function right now.

### Using filtering options

So, now, by running `sshf` (followed by <kbd>Enter<kbd>), you'll display the list of known SSH hosts and, in the right pane, you'll get the docblock you've typed in the configuration file.

Edit your `~/.ssh/conf.d/amazing.conf` file like this:

```conf
# MyAmazingApp - Production Environment
#
# https://my.amazing_app.be
#     /var/www/amazing
#     pgsql: host=1.2.3.4 port=5438 dbname=amazing username=christophe
#
# https://new.my.amazing_app.be
#     /var/www/html/amazing_new
#     pgsql: host=1.2.3.4 port=5438 dbname=amazing_newx username=christophe
Host MyAmazingApp_PROD
    Hostname 1.2.3.4
    User usr_app_prod

Host MyAmazingApp_TEST
    Hostname 6.7.8.9
    User usr_app_test

Host YourAmazingApp
    Hostname 1.2.3.4
    User you
```

Save the file and run `sshf` again.

Now just type f.i. `pgsql` and bingo, you're filtering the list of hosts not only on their name but, too, on your comments.

### Readme

# sshf - Interactive SSH Launcher

`sshf` is a productivity tool designed for developers and sysadmins who manage a large number of SSH hosts. It provides a lightning-fast interactive interface to search through your SSH configurations and connect instantly.

## 🚀 Key Features

* **Deep Search**: Filters instantly by alias, hostname, or any keywords found in your comments (e.g., search for *production*, *database*, *pgsql*, *postgREST*, ...).
* **Rich Documentation**: Supports custom HTML-like tags to color-code your SSH configuration notes.
* **Smart Parsing**: Automatically aggregates multi-line comments located above your `Host` definitions.
* **Clean Interface**: Keeps your list view minimal while displaying detailed notes in a side preview pane.

## 🛠 Installation

### 1. Prerequisites

Ensure you have the following tools installed:

* **zsh** (The shell)
* **fzf** (Command-line fuzzy finder)
* **perl** (Usually installed by default on Linux/macOS)

### 2. Setup

1. Create a directory for your ZSH scripts if you haven't already:

   ```bash
   mkdir -p ~/.zsh
   ```

2. Save the `sshf.zsh` file into `~/.zsh/sshf.zsh`

3. Add the following line to your `~/.zshrc`:

    ```bash
    [[ -f ~/.zsh/sshf.zsh ]] && source ~/.zsh/sshf.zsh
    ```

4. Reload your shell configuration: `source ~/.zshrc`

## 📖 How to Use

Simply type `sshf` in your terminal to open the interactive list. You can also pass a query directly

```bash
sshf project-name
```

### Organizing your Config

To keep things modular, it is recommended to use `Include` in your main `~/.ssh/config`:

    ```conf
    Include conf.d/*.conf
    ```

### Adding Documentation Tags

You can beautify your preview pane by using the following tags in your SSH comments:
| Tag | Effect |
| --- | --- |
| `<red>text</red>` | `<font color="red">Red text</font>` |
| `<green>text</green>` | `<font color="green">Green text</font>` |
| `<yellow>text</yellow>` | `<font color="yellow">Yellow text</font>` |
| `<bg-red>text</bg-red>` | White text on Red background |
| `<bg-yellow>text</bg-yellow>` | Black text on Yellow background |
| `<bold>text</bold>` | Bold text |

### Example

```conf
# API Server - Production
#
# <yellow>Backend:</yellow> PHP 8.5
# <green>Note:</green>    Part of TremendousApp.
#
# <bg-red>  CRITICAL  </bg-red> - This is a production server!
# <bg-yellow>    INFO    </bg-yellow> - Database is <green>PostgreSQL</green>
Host prod-api-01
    Hostname 1.2.3.4
    User christophe
    IdentifyFile ~/.ssh/id_ed25519
```
