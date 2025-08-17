---
slug: git-config
title: Git - Some tips for your .gitconfig file
authors: [christophe]
image: /img/git_tips_social_media.jpg
mainTag: git
tags: [git, tips, wsl]
enableComments: true
---
![Git - Some tips for your .gitconfig file](/img/git_tips_banner.jpg)

<!-- cspell:ignore autocrlf,committerdate,customising,gitdir,sooooooo -->

In this article, we're going to explore some tips for using Git more easily by customising the `~/.gitconfig` file.

We'll create a new `git undo` command to abandon the last local commit.

We'll see how to share Windows Credentials manager with Linux, to have multiple credentials based on your folders structure, ...

We'll also see how to better works with branches like sorting them by commit date instead of their name, to automatically prune (remove) old branches or to force the creation of a new branch on the remote.

<!-- truncate -->

If you're using Linux (or WSL), your Git configuration file is located here: `~/.gitconfig`. You can edit the file using vi or vscode (`vi ~/.gitconfig` or `code ~/.gitconfig`).

:::tip Using command line
You can edit your global configuration by running `git config --global --edit` in the console.

The default editor will be started (`vi` or perhaps `nano` if you've that one). If you prefer vscode, run `git config --global core.editor "code --wait"` in the console first. Now, you've associated git to use vscode also for, f.i., editing your commit message.
:::

## Aliases

But how many times have I tried a `git undo` to hop, hop, delete everything I've done locally and start again from the last commit that was done on the remote repository.

For example, I'm doing some refactoring work and ouch, no, I'm not happy and wish to undo my last local commit (=I've done `git add ... && git commit ...` but not `git push`).

Would be nice to run `git undo` for this no? This is where the notion of aliases comes into play.

Just add the two lines below in your `~/.gitconfig`:

<Snippets filename="~/.gitconfig`">

```text
[alias]
    undo = "!f() { git reset --hard $(git rev-parse --abbrev-ref HEAD)@{${1-1}}; }; f"
```

</Snippets>

:::tip Using command line
Instead of updating the file manually, you can obtain the exact same results by running `git config --global alias.undo '!f() { git reset --hard $(git rev-parse --abbrev-ref HEAD)@{${1-1}}; }; f'` in the console.
:::

[source: https://github.com/git-tips/tips](https://github.com/git-tips/tips?tab=readme-ov-file#alias-git-undo)

## Branches

### Create the new branch on the remote automatically

When working on a new feature, most probably you'll first do `git checkout -b myNewFeature` to create the `myNewFeature` branch on your computer.

Then you'll do some coding works and the time will come to push towards git using f.i. `git add . ; git commit -m "wip" ; git push` but it'll not directly work.

Indeed, git will complain that `myNewFeature` didn't exist remotely and that you need first to create the branch.

You can git rid of this but adding the two lines below in your `~/.gitconfig`:

<Snippets filename="~/.gitconfig`">

```text
[push]
    autoSetupRemote = true
```

</Snippets>

Now, if the local branch didn't exist remotely, git push will create it automatically for you.

### Cleaning dead branches

By default, git will remember every branch name that existed at a given time, even if the branch has been deleted from the remote repository in the meantime.

So, after several months, if you run `git branch --list --all` on your computer, you may get branch names that no longer exist on the remote repository.

Just add the two lines below in your `~/.gitconfig` file to ask git to make automatic cleaning when running `git fetch`:

<Snippets filename="~/.gitconfig`">

```text
[fetch]
    prune = true
```

</Snippets>

:::tip Using command line
Instead of updating the file manually, you can obtain the exact same results by running `git config --global fetch.prune true` in the console.
:::

### Sorting branches on the last commit date

At work, we're using Git on a very large codebase and thus, we're creating branches to add new functionalities.

By running `git branch --list --all` (or, shortly, `git branch -a`), git returns the list of branches in an alphabetical order which really isn't very useful.

It would be better to sort the list on the last commit made in the branch so, at the top of the list, we've the last used branches and, at the bottom, inactive ones.

To do this, just add the block below to your `~/.gitconfig` file:

<Snippets filename="~/.gitconfig`">

```text
[branch]
    sort = -committerdate
```

</Snippets>

:::tip Using command line
Instead of updating the file manually, you can obtain the exact same results by running `git branch --sort=-committerdate` in the console.
:::

## Credentials

### Sharing Windows credentials manager with Linux

If you're on WSL2, you can reuse credentials you already have filled in in Windows. Indeed, you can use `git` both in a DOS environment or in a Linux console.

To share credentials between the two environments, just add the two lines below in your `~/.gitconfig` file:

<Snippets filename="~/.gitconfig`">

```text
[credential]
    helper = /mnt/c/Program\\ Files/Git/mingw64/bin/git-credential-manager-core.exe
```

</Snippets>

### Using multiple credentials on the same computer

As you know, during the installation of Git, you need to provide your name and your email. These two information are given on the console using command like below:

```bash
git config --global user.email "me@work.be"
git config --global user.name "Christophe Avonture"
```

But this isn't very practical when you're working on several types of projects, e.g. for work and for your third-party projects. Let's say you're putting professional work in a given parent folder like `~/work_repositories` while your side projects are in `~/private_repositories`.

When your `~/.gitconfig` looks like below, every time you'll push to Git, the published commit will comes from `me@work.be`.

<Snippets filename="~/.gitconfig`">

```text
[user]
    email = me@work.be
    name = Christophe Avonture
```

</Snippets>

And, with the configuration below, now, if you're pushing a repository located in the `~/private_repositories`, this time the author will be `me@private.be`; no more your professional email.

<Snippets filename="~/.gitconfig`">

```text
[user]
    email = me@work.be
    name = Christophe Avonture

[includeIf "gitdir:~/private_repositories/"]
    email = me@private.be
```

</Snippets>

## Force SSH instead of HTTPs

Even if you've cloned a repository using `git clone https://...` you can force, globally, to use SSH instead.

So, for instance, if you've cloned your project using `git clone https://github.com/you/your_repo.git` (`https` thus), every time you'll push to it, you'll perhaps be prompted to provide your login and password. Really painful.

But, if you already have created a SSH key for your Github profile, then, you can stop to use https and force ssl by adding the two lines below in your `~/.gitconfig`:

<Snippets filename="~/.gitconfig`">

```text
[url "git@github.com"]
    insteadOf = https://github.com/
```

</Snippets>

:::tip Using command line
You can edit your global configuration by running `git config --global url.'git@github.com:'.insteadOf 'https://github.com/'` in the console.
:::

From now, even if the repository is still configured to use `https` (as you can check in the `.git/config` file of that project on your hard disk), you've globally forced SSL.

## Prevent auto replacing LF with CRLF

If you're working on Windows and not in Linux/WSL, git, under Windows, will always try to replace the LF character to CRLF and that's **sooooooo bad**.

Don't allow this by adding the next configuration item in your `~/.gitconfig`:

<Snippets filename="~/.gitconfig`">

```text
[core]
    autocrlf = false
```

</Snippets>

:::tip Using command line
You can edit your global configuration by running `git config --global core.autocrlf false` in the console.
:::

[source: https://github.com/git-tips/tips](https://github.com/git-tips/tips?tab=readme-ov-file#prevent-auto-replacing-lf-with-crlf)
