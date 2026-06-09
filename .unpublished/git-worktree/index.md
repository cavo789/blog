---
slug: git-worktree
title: "git worktree: Work on Two Branches at the Same Time"
authors: [christophe]
image: /img/v2/git_worktree.webp
mainTag: git
draft: true
tags: [git, linux, bash, workflow, zsh]
date: 2026-12-31
ai_assisted: true
---

![git worktree: Work on Two Branches at the Same Time](/img/v2/git_worktree.webp)

<TLDR>
You're deep in a feature branch — half-written code, running Docker containers, open files everywhere. Then: "urgent hotfix needed on main." With the usual workflow, you stash everything, switch branches, fix, commit, push, then unstash and hope nothing explodes. With `git worktree`, you check out a second branch into a separate folder. Both branches exist simultaneously, as real directories, with their own terminals and their own Docker stacks.
</TLDR>

It's 3pm on a Thursday. You've been working on a new feature for two days. The Docker containers are running, your editor has eight files open, and you're in the middle of a refactor that's not compiling yet.

Your phone buzzes. Production is broken. A fix needs to go out on `main` in the next thirty minutes.

What do you do?

<!-- truncate -->

## The stash workflow and its pain

The classic approach:

```bash
git stash push -m "WIP: feature/user-notifications"
git checkout main
git pull
# ... fix the bug ...
git commit -m "fix: correct invoice calculation"
git push
git checkout feature/user-notifications
git stash pop
```

It works. Most of the time. But:

* Your Docker containers are now pointing at the wrong codebase — you need to restart them
* Your editor has lost context — all those open files are gone or pointing at main's versions
* If `git stash pop` has a conflict, you now have a three-way mess to resolve while still stressed from the hotfix
* You can only have one active branch at a time

The deeper issue: a git stash is fragile state. It's not a branch. It has no history. It can conflict. And it disappears once you pop it.

## What git worktree does

A git worktree is a second (or third, or fourth) working directory linked to the same git repository.

Instead of one folder with one checked-out branch, you get:

```
~/projects/my-blog/                     ← main branch (original)
~/projects/my-blog-hotfix/              ← hotfix/invoice-fix branch (worktree)
~/projects/my-blog-feature-auth/        ← feature/auth branch (worktree)
```

Each folder is a **real directory** with its own files, its own terminal, its own running processes. They share the same `.git` database (commits, objects, history), but each has an independently checked-out branch.

You never leave your feature branch. The hotfix lives next door.

## The basic commands

### Add a worktree

```bash
git worktree add <path> [branch]
```

Create a new directory at `<path>` with `[branch]` checked out:

```bash
git worktree add ../my-blog-hotfix hotfix/invoice-fix
```

If the branch doesn't exist yet, create it at the same time:

```bash
git worktree add -b hotfix/invoice-fix ../my-blog-hotfix main
```

This creates `hotfix/invoice-fix` branching off `main`, checked out into `../my-blog-hotfix`.

### List all worktrees

```bash
git worktree list
```

Output:

```
/home/christophe/projects/my-blog              a4b2c1d [main]
/home/christophe/projects/my-blog-hotfix       e8f3d2a [hotfix/invoice-fix]
```

### Remove a worktree

```bash
git worktree remove ../my-blog-hotfix
```

This deletes the folder and unregisters the worktree. The branch itself (`hotfix/invoice-fix`) still exists — you can delete it separately with `git branch -d`.

## The hotfix scenario, step by step

Back to Thursday afternoon. Here's the same situation handled with worktrees.

### 1. You're on your feature branch, in the middle of work

```bash
# Current state
$ git branch
* feature/user-notifications
  main
$ git status
On branch feature/user-notifications
Changes not staged for commit:
  modified: src/components/Notifications.tsx
  modified: src/api/notifications.ts
```

You don't touch this. You don't stash anything.

### 2. Create a hotfix worktree next to your project

```bash
git worktree add -b hotfix/invoice-fix ../my-blog-hotfix main
```

<Terminal>
Preparing worktree (new branch 'hotfix/invoice-fix')
HEAD is now at a4b2c1d chore: update dependencies
</Terminal>

### 3. Open a new terminal, cd into the hotfix folder

```bash
cd ../my-blog-hotfix
```

This directory has `main`'s files. Your feature branch directory is untouched, still running, still open in your editor.

### 4. Fix the bug and push

```bash
# Inside ../my-blog-hotfix
vim src/billing/invoice.ts
git add src/billing/invoice.ts
git commit -m "fix: correct VAT calculation for EU invoices"
git push origin hotfix/invoice-fix
# open PR, merge, done
```

### 5. Clean up the worktree

```bash
# Back in the original repo
git worktree remove ../my-blog-hotfix
git branch -d hotfix/invoice-fix
```

### 6. Back to your feature branch — nothing changed

```bash
cd ~/projects/my-blog
# Docker containers: still running
# Editor: still open on the same files
# git status: exactly as you left it
```

No stash, no conflicts, no context switch.

## One constraint: a branch can only be in one worktree at a time

Git enforces this. If `feature/user-notifications` is checked out in your main directory, you cannot add a second worktree with the same branch. Attempting it gives:

```
fatal: 'feature/user-notifications' is already checked out at '/home/christophe/projects/my-blog'
```

This is intentional — two directories writing to the same branch simultaneously would corrupt the working tree. Each worktree gets its own branch.

## Docker + worktrees: each branch gets its own stack

This is where worktrees become genuinely powerful for a Docker workflow.

Each worktree is a separate directory. Each directory can have its own `.env` file and its own running Docker Compose stack, as long as you avoid port conflicts.

A practical convention: use a different port per worktree. Keep the ports in `.env`, which is `.gitignore`d:

```bash
# ~/projects/my-blog/.env
APP_PORT=3000
DB_PORT=5432

# ~/projects/my-blog-hotfix/.env
APP_PORT=3001
DB_PORT=5433
```

Now you can run both stacks simultaneously:

```bash
# Terminal 1 — feature branch
cd ~/projects/my-blog
docker compose up

# Terminal 2 — hotfix branch
cd ~/projects/my-blog-hotfix
docker compose up
```

Both servers are running at the same time. You can test the hotfix at `http://localhost:3001` without stopping your feature development at `http://localhost:3000`.

<AlertBox variant="note" title="Named Compose projects">
Docker Compose uses the folder name as the default project name. Since your worktrees are in different folders, Compose creates separate networks and container sets automatically — no additional configuration needed.
</AlertBox>

## A ZSH function to navigate between worktrees

If you follow the <Link to="/blog/modular-zsh-workflow">modular ZSH workflow</Link> pattern, you can add an interactive worktree navigator using <Link to="/blog/linux-fzf-introduction">fzf</Link>:

```bash
# ~/.zsh/fns/gwt
# git worktree navigator — select a worktree with fzf and cd into it

gwt() {
  local worktrees selected dir

  worktrees=$(git worktree list 2>/dev/null) || {
    echo "Not inside a git repository."
    return 1
  }

  if [[ -z "$1" ]]; then
    # Interactive: pick a worktree with fzf
    selected=$(echo "$worktrees" \
      | fzf --prompt="Worktree > " \
            --preview="ls -la {1}" \
            --height=40%)
    [[ -z "$selected" ]] && return 0
    dir=$(echo "$selected" | awk '{print $1}')
  else
    # Direct: create a new worktree for the given branch
    local branch="$1"
    dir="${$(git rev-parse --show-toplevel)}-${branch//\//-}"
    git worktree add -b "$branch" "$dir" main || return 1
    echo "Created worktree at $dir"
  fi

  cd "$dir"
}
```

Usage:

```bash
gwt                         # fzf picker — select any active worktree and cd into it
gwt feature/dark-mode       # create + cd into a new worktree for that branch
```

## Practical tips

### Name worktrees consistently

A predictable naming scheme avoids confusion:

```bash
# Pattern: <repo-name>-<branch-slug>
git worktree add ../my-blog-hotfix-invoice hotfix/invoice-fix
git worktree add ../my-blog-feat-auth      feature/auth
```

### Worktrees work with VS Code

Open a worktree folder in a new VS Code window:

```bash
code ../my-blog-hotfix
```

Each window operates independently, with its own open files and terminal sessions.

### Prune stale worktrees

If you manually delete a worktree folder (instead of using `git worktree remove`), git may still think it exists. Clean up the stale references:

```bash
git worktree prune
```

## Summary: stash vs worktree

| | `git stash` | `git worktree` |
|---|---|---|
| Branch switch | Yes, required | No — branches coexist |
| Docker containers | Must restart | Run independently |
| Editor context | Lost | Preserved |
| Parallel development | No | Yes |
| Conflict risk | On `stash pop` | None |
| Cleanup | Automatic on pop | Manual `worktree remove` |

Stash remains useful for tiny, quick things — saving half a line of typing before a `git pull`. For anything that involves running services, an editor session, or more than five minutes of work, a worktree is cleaner.

The first time you handle a hotfix without leaving your feature branch, you'll wonder how you ever worked any other way.
