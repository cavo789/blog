---
slug: git-branches-gst
title: Showing the last 3 updated branches when you jump in a git repo
description: Learn how to configure ZSH to automatically display your most recently updated Git branches whenever you enter a repository or check its status.
authors: [christophe]
image: /img/v2/git_branches_status.webp
mainTag: git
tags: [git, zsh]
date: 2026-04-06
blueskyRecordKey: 3misnmd2jqs2f
---

![Showing the last 3 updated branches when you jump in a git repo](/img/v2/git_branches_status.webp)

<TLDR>Returning to an old project often leads to accidentally working on the wrong Git branch and causing merge conflicts. To prevent this, you can add a custom script to your Zsh configuration that automatically displays the three most recently modified local branches. This function hooks into directory changes and the git status command to instantly remind you of your previous working context.</TLDR>

Damn, it happened again: I was working on a major project (composed of several repositories), pushed my work to production (on the `main` branch), and then started some code refactoring in a branch called `wip`. Afterward... I switched to other projects, as I always do.

Months later, upon returning to the project, I spent a few days making improvements on the `main` branch. And then—damn! You guessed it—the latest active branch wasn't `main`, but `wip`. Aaaargh... This meant I now had two divergent branches, `main` and `wip`, and had to manage merge conflicts. So frustrating, especially since I was the only developer on the project.

How can we avoid such situations?

<!-- truncate -->

Since I spend most of my time in the terminal, I need a notification whenever I jump into a project's folder or run a `git status` command.

Here's the idea: when I run `cd my_project`, I want to **immediately** see the list of the 3 most recently active branches along with their last update date and time. This way, when returning to an old project, I instantly realize, *"Oh yes, I was working on `wip`"*, and can switch to the correct branch. I want the exact same behavior with `gst`, the alias I use for `git status`.

And it turns out, it's incredibly simple to do.

Just edit your `~/.zshrc` file and add this block at the end:

<Snippet filename="~/.zshrc" source="./files/zshrc" />

## How it works

The `_display_recent_git_context` function runs `git rev-parse --is-inside-work-tree` to verify you are actually inside a Git repository. If you are not, it silently stops. If you are inside a repo, it runs `git rev-parse HEAD` to check if the repository is completely empty. If it is, there's nothing to do, so it stops.

If the repository isn't empty, the function retrieves the active branch name, then runs `git for-each-ref` to iterate over your **local* branches, sorting them by the date of their last commit in descending order (`--sort=-committerdate`).

The script also defines (or overrides) a `gst` ZSH alias. The new `gst` command calls our custom function before executing the native `git status` command.

Finally, since we're using ZSH, we can leverage a standard hook called `chpwd` (which triggers when *changing the current working directory*). This hook is called automatically by OS commands like `cd` or `pushd`.

## Back to real use case

## A real-world example

My disk is full of projects and a huge list of repositories. Now, whenever I `cd` into one of them, I automatically get the last three branches. No extra effort required:

```bash
❯ cd project/subproject

=== Recent Local Branches ===
  feature_logging - 1 month ago
* main - 3 months ago
  wip - 2 months ago
```

*(`*` indicates the active branch)*

## Local Branches Only

It is important to note that this script exclusively queries your local Git repository. It deliberately avoids executing a `git fetch` command to check the remote server for updates.

Triggering a network request every time you change directories would introduce unacceptable latency and severely slow down your terminal workflow. Because it reads strictly from your local Git references —which is distinct from the Git staging area that tracks your uncommitted file modifications— the script executes instantly.

If a teammate pushes a new branch to the remote repository, it will not appear in your recent branches list automatically. You maintain full control over network operations; whenever you want to update your local repository with the latest remote activity, you simply run git fetch manually.

## Conclusion

Now, every single time I do a `cd` command and jump in a Git project, I don't have to run additional command, I immediately get the required info; the name of the last active branches.
