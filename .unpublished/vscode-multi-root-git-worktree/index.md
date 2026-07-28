---
slug: vscode-multi-root-git-worktree
title: "One VSCode Window, Every Worktree: Multi-Root Workspaces"
authors: [christophe, claude]
image: /img/v2/project_setup.webp
mainTag: git
tags: [git, vscode]
date: 2026-12-31
description: "git worktree gives you parallel branches without stashing, but each one so far opened in its own separate VSCode window. A multi-root .code-workspace file puts every active worktree in one window instead, each with its own labeled folder in the sidebar."
language: en
ai_assisted: true
draft: true
---

![One VSCode Window, Every Worktree: Multi-Root Workspaces](/img/v2/project_setup.webp)

<TLDR>
<Link to="/blog/git-worktree">My git worktree article</Link> ended with "open a worktree folder in a new VS Code window" — one window per worktree. That works, but it means N windows to keep track of on the taskbar, each one indistinguishable from the others until you actually click into it. A multi-root `.code-workspace` file solves that: every active worktree, as a separate labeled folder, inside one single window.
</TLDR>

<Link to="/blog/git-worktree">Worktrees</Link> solved the actual hard problem — parallel branches, no stashing, independent Docker stacks per branch. The one loose end left at the end of that article was the editor side: `code ../my-blog-hotfix` opens a perfectly good, independent VSCode window — but do that for a feature branch, a hotfix, and the main branch, and you've got three windows on the taskbar that all look identical until you click into one and read the title bar.

<!-- truncate -->

## What a Multi-Root Workspace Actually Is

A `.code-workspace` file is a small JSON file listing multiple folders — each with its own display `name` — that VSCode opens together, in one window, as one workspace. The sidebar shows each folder as its own labeled root instead of a single flat file tree, so "which worktree is this file even in" stops being a question you have to answer by reading a full path.

<Snippet filename="my-blog.code-workspace" source="./files/my-blog.code-workspace" defaultOpen={true} />

Using the exact naming convention from <Link to="/blog/git-worktree">the worktree article</Link> (`<repo-name>-<branch-slug>`), each entry's `path` points at a sibling folder, and `name` is whatever you want to actually see in the sidebar — a branch name reads better than a folder name.

Open it with:

<Terminal typewriter>
$ code my-blog.code-workspace
</Terminal>

## One Window, Three Independent Contexts

Each folder in the sidebar behaves as its own root: its own file tree, its own Source Control panel entry (so the Git panel shows *three* separate repositories — well, three worktrees of the same repository — each with its own branch and changes), and its own integrated terminal working directory when you open one scoped to that folder.

<AlertBox variant="tip" title="Per-folder settings still work">
The `"settings"` block in a `.code-workspace` file applies workspace-wide, but each individual folder can still carry its own `.vscode/settings.json` for folder-specific overrides — exactly as if it were opened standalone.
</AlertBox>

## Keeping the Workspace File in Sync with `gwt`

<Link to="/blog/git-worktree">The `gwt` ZSH function</Link> already creates worktrees on demand — `gwt feature/dark-mode` creates one and `cd`s into it. The one manual step this article adds: when a worktree gets created or removed, the `.code-workspace` file's `folders` array needs the matching addition or removal. It's a two-line JSON edit, not automated here — a natural next step for `gwt` itself, if this pattern earns its keep over the next few worktrees.

<AlertBox variant="note" title="Not a replacement for separate windows">
Nothing here retires `code ../my-blog-hotfix` as an option — for a single quick hotfix, a dedicated window is still the faster path. The workspace file earns its keep specifically when two or more worktrees are genuinely active at once and worth comparing side by side.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="Multi-root workspace quick reference"
  steps={[
    { content: "**One `.code-workspace` file, one window** — every active worktree as its own labeled folder instead of one window per worktree" },
    { content: "**`name` in the JSON is what shows in the sidebar** — use the branch name, not the folder name, for it to actually mean something at a glance" },
    { content: "**Each folder gets its own Source Control entry** — the Git panel treats every worktree as independent, which it is" },
    { content: "**Still a manual sync with `gwt`** — creating or removing a worktree means a matching one-line edit to the workspace file's `folders` array" }
  ]}
/>

## Conclusion

The worktree article closed the branch-switching problem; this one closes the window-management problem that solution quietly introduced. Three worktrees no longer means three indistinguishable windows to hunt through on the taskbar — it means one window, three clearly labeled folders, and a Git panel that already knows they're three different branches without you having to remember which title bar belongs to which.
