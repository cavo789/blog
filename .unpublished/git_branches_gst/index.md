---
slug: git-branches-gst
title: Showing the last 3 updated branches when you jump in a git repo
authors: [christophe]
image: /img/v2/git_branches_status.webp
mainTag: git
draft: true
tags: [git, zsh]
date: 2026-12-31
---

![Showing the last 3 updated branches when you jump in a git repo](/img/v2/git_branches_status.webp)

Damned, once again, it happens: I've worked on a specific projects (which was composed of several repositories); push my work in production (so I was working on the `main` branch); I've started some code refactoring (in a branch called `wip`) in some of them then I've worked on another projects.

Months later, coming back to my project, I've made some improvements on the `main` branch during a few days and, damned!!!, the latest branch was not `main` but `wip`.  Aaaargh... No I've to managed conflicts while merging the new `main` to my `wip` branch.  So stupid.

How can we try to avoid such situations?

<!-- truncate -->

Because I'm a terminal man, I really need some notifications when I'm jumping in my project's folder or when I run a `git status` instruction.

Here is the idea: when I do a `cd my_project`, I would like, **immediately**, to see the list of the last 3 active branches and the last update date/time. So, when coming back to my previous project, immediately, I can see *Oh yes, I was working on `wip`.* and switch to that branch.  And, same idea with `gst` i.e. the alias I'm using instead of `git status`.

And, in fact, it's so simple to do.

Just edit your `~/.zshrc` file and add this block at the end:

<Snippet filename="~/.zshrc" source="./files/zshrc" />

## What it does?

The function `_display_recent_git_context` run `git rev-parse --is-inside-work-tree` to verify you are actually inside a Git directory. If you are not, it silently stop any process. If inside a repo, run `git rev-parse HEAD` to check if the repository is completely empty. If yes, nothing to do, it stop.

If not empty, the function will retrieve the active branch name then run a `git for-each-ref` for each branches of your repo and store the list by the date of their last commit in descending order (`--sort=-committerdate`).

The script will also define (or override if already existing) a `gst` Bash alias. The new `gst` command will call our function and call the native `git status` command.

And, finally, since we're on ZSH, we can use a standard hook called `chpwd` (for *changing current working directory*). That hook is called by OS commands like `cd` or `pushd`.

## Back to real use case.

On my disk, I've a lot of projects and a huge list of repositories. From now, when I do a `cd` hop, automatically I'll get the last three branches. Nothing to do:

```bash
❯ cd project/subproject

=== Recent Local Branches ===
  feature_logging - 1 month ago
  main - 2 weeks ago
* wip - 2 months ago
```

## Last word

It works only for local branches i.e. if a colleague has created a new branch and push it to the central repo, while you've not yet updated your local codebase (with `git fetch`), you'll not see "his" branch and that's pretty cool to me.

I want to be notified on my own work, to remember "Oh yes, last month, I've worked on ... and I need to finish it / merge it to the `main` branch".