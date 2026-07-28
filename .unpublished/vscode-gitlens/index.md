---
slug: vscode-gitlens
title: "GitLens: Git Blame and History Without Leaving the Editor"
authors: [christophe, claude]
image: /img/v2/git_branches_status.webp
mainTag: git
tags: [git, vscode]
date: 2026-12-31
description: "GitLens puts git blame, file history and branch comparison directly inline in VSCode, so answering 'who wrote this and why' never requires a terminal alt-tab. This article covers the daily-use features worth turning on — and the one (CodeLens) worth turning off."
language: en
ai_assisted: true
draft: true
---

![GitLens: Git Blame and History Without Leaving the Editor](/img/v2/git_branches_status.webp)

<!-- cspell:ignoreCase gitlens codelens -->

<TLDR>
[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) puts `git blame`, file history, and branch/commit comparison directly inline in VSCode — a faded annotation at the end of the current line, a hover for the full commit message, a dedicated sidebar for history and comparisons. It's the piece my Git workflow (<Link to="/blog/git-worktree">worktrees</Link>, <Link to="/blog/git-delta">delta</Link> for diffs) was still missing: everything so far happens in the terminal, but "who wrote this line, and why" is a question that starts in the editor, and GitLens is what answers it there instead of sending you back to a terminal to type a file path by hand.
</TLDR>

My terminal-side Git workflow is in good shape by now: <Link to="/blog/git-worktree">worktrees</Link> for parallel branches, <Link to="/blog/git-delta">delta</Link> for readable diffs. But there's a specific moment none of that covers — I'm reading a function I don't remember writing, and the question in my head isn't "what changed" (that's a diff), it's "who touched this, and what was the commit message." Answering that meant alt-tabbing to a terminal and typing `git blame path/to/file.php` with the exact path, every single time.

<!-- truncate -->

## Installing It

Search for **GitLens** in the Extensions view (`eamodio.gitlens`) and install it — no separate binary, no Docker container, it's a pure VSCode extension.

## Inline Blame, Where You're Actually Looking

The single feature that earns GitLens a permanent spot: **current line blame**. Move your cursor onto any line, and a faded annotation appears at the end of it — author, relative date, and the start of the commit message. Hover over that annotation for the full message, the commit hash, and a diff of what that commit actually changed.

<AlertBox variant="tip" title="No more manual git blame">
This is the exact question "who wrote this and why" answered without leaving the file, without knowing the path by heart, and without a terminal window at all.
</AlertBox>

## The One Feature Worth Turning Off

GitLens also ships **CodeLens** — a small "X changes, Y authors" annotation floating above every function and class definition. It sounds useful in theory; in practice, on a file with a long history, it's a line of visual noise above every single symbol, competing with the actual code for attention. I turn it off and rely on current-line blame instead, which only shows up where the cursor already is.

<Snippet filename=".vscode/settings.json" source="./files/settings.json" defaultOpen={true} />

<AlertBox variant="note" title="hovers.currentLine.over: line">
By default, the hover only triggers over the blame annotation itself, at the far end of the line. Setting this to `"line"` lets the hover trigger anywhere on the line — useful on long lines where the annotation is off-screen to the right.
</AlertBox>

## File History and Line History

Right-click any file (or a text selection) and choose **GitLens: Open File History** (or **Open Line History** for the selection) to open a dedicated view: every commit that touched that file — or that exact range of lines — in one scrollable list, each one a click away from its full diff.

<AlertBox variant="tip" title="Line history beats blame for refactored code">
Current-line blame shows you the *last* commit that touched a line. Line History shows you *every* commit that ever touched it — the one you actually want when a line has been through three refactors and blame only shows the most recent, least interesting one.
</AlertBox>

## Comparing Branches and Commits

The GitLens sidebar adds a **Search & Compare** view: pick any two branches, tags, or commits, and get a full diff between them — the same comparison `git diff branch-a..branch-b` gives you in a terminal, but browsable file-by-file with syntax highlighting, no `cd` into the right repo required first.

## Key Takeaways

<StepsCard
  variant="remember"
  title="GitLens quick reference"
  steps={[
    { content: "**Current line blame** — the core feature; hover for the full commit message and diff" },
    { content: "**Turn CodeLens off** — `gitlens.codeLens.enabled: false`; current-line blame already covers the same need with less visual noise" },
    { content: "**Line History over File History** for a line that's survived several refactors — it doesn't stop at the most recent commit" },
    { content: "**Search & Compare** replaces `git diff branch-a..branch-b` with a browsable, syntax-highlighted view" }
  ]}
/>

## Conclusion

None of this replaces the terminal-side workflow from <Link to="/blog/git-worktree">worktrees</Link> or <Link to="/blog/git-delta">delta</Link> — it answers a different question, at a different moment: not "what changed between these two states" but "who wrote this line, right now, while I'm staring at it." Now, every time I'm about to alt-tab to ask git blame something, the answer's already sitting at the end of the line.
