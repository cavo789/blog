---
slug: git-interactive-rebase
title: "git rebase -i — Fix Your Commit History Before Anyone Sees It"
description: "git rebase -i lets you rewrite your local commit history before pushing: squash WIP commits, fix typos in messages, drop accidental commits, and reorder changes. Your branch, clean — before it becomes anyone else's problem."
authors: [christophe, claude]
image: /img/v2/git.webp
mainTag: git
draft: true
tags: [git, linux]
date: 2026-09-01
ai_assisted: true
---

![git rebase -i — Fix Your Commit History Before Anyone Sees It](/img/v2/git.webp)

<TLDR>
`git rebase -i HEAD~n` opens an editor showing your last `n` commits with a verb in front of each. Change the verb — `squash` to merge commits together, `fixup` to merge silently, `reword` to rename, `drop` to delete — and git rewrites the history when you save. The golden rule: only rebase commits that haven't been pushed to a shared branch.
</TLDR>

Your local branch tells the story of your thought process. `WIP`, `debug temp`, `fix the fix`, `this time for real`, `revert my revert`. That's how work actually happens. But it's not what your teammates need to see in `git log`.

`git rebase -i` lets you clean up that story before sharing it. Merge the five WIP commits into one. Fix the typo in yesterday's message. Drop the accidental `node_modules` commit. All before anyone else sees it.

<!-- truncate -->

## Seeing It in Action with Docker

`git` needs no installing. What's worth trying risk-free is the rebase itself — a real editor
session, on a real repo, where messing it up costs nothing.

<AlertBox variant="tip" title="Why Docker first?">
The Dockerfile below builds the exact "A typical cleanup" scenario further down — 7 commits, one
feature buried under `wip`/`more wip`/`fix build` noise — and sets `nano` as the editor plus
`autosquash`/`autostash`, matching the "Useful git config additions" section. Nothing on your own
repos is touched.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Build and run it:

<Terminal title="user@machine: ~/rebase-demo">
$ docker build -t rebase-demo .
[+] Building 11.2s (6/6) FINISHED
 ✔ exporting to image

$ docker run --rm -it rebase-demo
🐳 root ~/demo # git log --oneline
</Terminal>

```
fix test
add tests
actually working now
more wip
wip
fix build
feat: add user profile page
chore: initial project setup
```

Exactly the 7 messy commits from "A typical cleanup" below, on top of one base commit. Now run
the real thing:

<Terminal title="🐳 root ~/demo #">
$ git rebase -i HEAD~7
</Terminal>

`nano` opens with the 7 `pick` lines. Change the verbs exactly as described further down —
`fixup` on `fix build`, `wip`, `more wip` and `actually working now`; `pick` stays on `feat: add
user profile page` and `add tests`; `fixup` on `fix test` — save with <kbd>Ctrl</kbd>+<kbd>O</kbd>,
exit with <kbd>Ctrl</kbd>+<kbd>X</kbd>. `git log --oneline` afterward shows exactly two clean
commits, the noise gone for good.

## The interactive editor

`git rebase -i` opens a text editor showing your recent commits with a one-word instruction in front of each:

<Terminal>
git rebase -i HEAD~5
</Terminal>

The editor shows something like:

```
pick a1b2c3d feat: add user authentication
pick b2c3d4e fix typo in README
pick c3d4e5f WIP: working on email validation
pick d4e5f6a fix email validation (for real)
pick e5f6g7b debug: temp logging

# Rebase f6g7h8i..e5f6g7b onto f6g7h8i (5 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# d, drop <commit> = remove commit
```

Change the verbs, save, close. Git does the rest.

## The six verbs

### pick — keep as-is

The default. Leave `pick` on a commit to keep it unchanged.

### reword — fix the message only

```
reword a1b2c3d feat: add user authentification   ← typo to fix
```

Git will pause and open the editor again just for this commit's message. Everything else stays the same.

### squash — merge into previous, keep message

```
pick c3d4e5f WIP: working on email validation
squash d4e5f6a fix email validation (for real)
```

These two commits become one. Git opens the editor with both messages combined — you edit the final message that represents both.

### fixup — merge into previous, discard message

```
pick c3d4e5f feat: add email validation
fixup d4e5f6a fix email validation (for real)
fixup e5f6g7b debug: temp logging
```

The last two commits are silently absorbed into the first. No editor prompt — the final commit keeps only the first message. This is the most common operation: you're cleaning up, not narrating.

### drop — delete a commit entirely

```
drop e5f6g7b debug: temp logging
```

The commit and all its changes disappear from history. Use this for accidental commits (test files, credentials, temporary debugging code).

<AlertBox type="warning" title="drop removes the changes, not just the message">
Dropping a commit removes its diff from history. If that commit introduced useful changes mixed with the noise, use `squash` or `fixup` instead — merge it into the commit where it belongs rather than losing the changes.
</AlertBox>

### edit — pause for amending

```
edit b2c3d4e fix: user authentication
```

Git applies the commit and pauses. You can run `git add`, `git commit --amend`, split the commit into multiple ones, or do anything else. Then `git rebase --continue` to proceed.

## A typical cleanup

Here's a realistic before-and-after. Your branch before pushing:

```
pick f1a2b3c feat: add user profile page
pick g2b3c4d fix build
pick h3c4d5e wip
pick i4d5e6f more wip
pick j5e6f7g actually working now
pick k6f7g8h add tests
pick l7g8h9i fix test
```

You want to present this as two clean commits: the feature and its tests. Edit the file to:

```
pick f1a2b3c feat: add user profile page
fixup g2b3c4d fix build
fixup h3c4d5e wip
fixup i4d5e6f more wip
fixup j5e6f7g actually working now
pick k6f7g8h test: add profile page coverage
fixup l7g8h9i fix test
```

Save, close. Git produces two commits:

```
feat: add user profile page   ← all the WIP absorbed, one clean diff
test: add profile page coverage
```

## The autosquash pattern

When you know upfront that a commit is a fixup for an earlier one, mark it at commit time:

<Terminal>
# You committed something that needs a fix-up for commit abc1234
git add .
git commit --fixup=abc1234
</Terminal>

This creates a commit automatically named `fixup! feat: add user authentication` (prefixed with `fixup!`). Later, when you rebase:

<Terminal>
git rebase -i --autosquash HEAD~10
</Terminal>

Git automatically moves the `fixup!` commit to just after its target and sets the verb to `fixup` — no manual editing required. Works with `squash!` prefix for squash operations.

To always use autosquash (recommended), add to your `~/.gitconfig`:

```ini
[rebase]
    autosquash = true
```

With this, `git rebase -i HEAD~n` always honors `fixup!` and `squash!` prefixes automatically.

## Handling conflicts

If two commits being merged touched the same lines, git pauses with a conflict:

<Terminal>
CONFLICT (content): Merge conflict in src/auth/user.php
error: could not apply d4e5f6a... fix email validation
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
</Terminal>

The usual conflict resolution flow:
1. Open the conflicted files and resolve the markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. `git add` the resolved files
3. `git rebase --continue`

To abandon the entire rebase and return to exactly where you started:

<Terminal>
git rebase --abort
</Terminal>

Nothing is lost. Your branch returns to its pre-rebase state.

## The golden rule

**Never rebase commits that have already been pushed to a shared branch.**

When you rebase, git creates new commits with new hashes. Anyone who has pulled the original commits will have a diverged history, and merging becomes painful. The rule is simple:

- Local-only commits: rebase freely
- Pushed to your personal feature branch (only you work on it): rebase, then force-push — but communicate with your team
- Pushed to `main`, `develop`, or any shared branch: never rebase

<AlertBox type="danger" title="Force push on shared branches causes real problems">
`git push --force` after a rebase replaces the remote history. On a shared branch, this erases other people's commits or forces them into complex merge situations. Use `git push --force-with-lease` at minimum (it fails if someone else pushed since you last fetched), but avoid this pattern on shared branches entirely.
</AlertBox>

## Useful git config additions

```ini
[core]
    editor = nano   # or vim, code --wait, etc.

[rebase]
    autosquash = true   # honor fixup! and squash! prefixes automatically
    autostash = true    # stash uncommitted changes before rebase, restore after
```

`autostash = true` means you can start a rebase even with uncommitted changes — git stashes them, rebases, and unstashes automatically.

## How this fits with other git tools

`git rebase -i` cleans up your history before sharing. <Link to="/blog/git-delta">`delta`</Link> makes reading that history more pleasant — syntax highlighting, side-by-side diffs, word-level changes. <Link to="/blog/git-worktree">Git worktrees</Link> let you work on two branches simultaneously without switching — useful when you want to rebase a feature branch while keeping your main branch available.

For finding *when* a bug was introduced in that cleaned-up history, `git bisect` (draft post coming) uses binary search across commits — the cleaner your history, the more readable the bisect output.

## Conclusion

`git rebase -i` is the difference between a commit history that reads as a coherent story and one that documents every false start. Once your branch is clean, reviewers can focus on the logic instead of untangling the noise.

The three operations you'll use 90% of the time: `fixup` to absorb cleanup commits, `reword` to fix messages, and `drop` to remove mistakes. Learn those three, and the rest follows naturally.
