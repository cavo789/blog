---
slug: git-bisect
title: "git bisect: Find the Commit That Broke Everything"
authors: [christophe]
image: /img/v2/git_bisect.webp
mainTag: git
draft: true
tags: [git, linux, bash, tips]
date: 2026-12-31
ai_assisted: true
---

![git bisect: Find the Commit That Broke Everything](/img/v2/git_bisect.webp)

<TLDR>
Something works today that didn't work last week. You have 150 commits to blame. `git bisect` runs a binary search through your history: you mark one commit as "broken" and one older commit as "working", then git hands you commits to test one by one — halving the search space each time. You go from 150 candidates to the exact culprit in 7 steps.
</TLDR>

A bug appeared sometime in the last two weeks. The feature worked fine at the end of the last sprint. Now it doesn't. You run `git log --oneline` and count forty, eighty, a hundred and fifty commits since then.

You could checkout each one manually. That would take hours.

Or you could use `git bisect` and find the answer in seven steps.

<!-- truncate -->

## The problem with manual debugging

When a regression appears, the instinct is to look at recent commits and guess which one caused it. For small changes — a one-line fix, a one-file PR — that works fine. For anything larger, it doesn't.

Consider 150 commits over two weeks. Checking each one manually: one checkout, one test, one assessment. Even at two minutes per commit, that's five hours. And you'll still have guessed wrong more than once before narrowing it down.

## Binary search: the math

`git bisect` uses binary search. Instead of checking commits in order, it cuts the search space in half at each step.

With 150 commits to check:

| Step | Remaining candidates |
|------|---------------------|
| Start | 150 |
| Step 1 | 75 |
| Step 2 | 38 |
| Step 3 | 19 |
| Step 4 | 10 |
| Step 5 | 5 |
| Step 6 | 3 |
| Step 7 | **1 — found** |

Seven tests instead of 150. That's the difference between five hours and fifteen minutes.

## A real scenario

Let's make this concrete. Your Docusaurus blog was working fine three weeks ago. Now the build fails with a cryptic TypeScript error that you can't trace to any recent change. You know:

* **Bad**: the current state (`HEAD`) — the build fails
* **Good**: three weeks ago — the build worked

You have 80 commits between those two points.

Here's how to find the exact commit that introduced the problem.

## Step 1 — Start bisect and mark the endpoints

```bash
git bisect start
```

Tell git the current state is broken:

```bash
git bisect bad
```

Tell git when things last worked. You can use a tag, a branch name, or a commit hash. If you tagged releases, use the tag. If not, use `git log --oneline` to find a commit from three weeks ago:

<Terminal>
$ git log --oneline --after="2026-05-01" --before="2026-05-05" | tail -5
3a1f8c2 chore: update dependencies
8d4e1a0 doc: add docker-compose article
c7f2b31 fix: typo in sidebar
1a9e4f7 feat: add search component
0c3d8e5 chore: initial project setup
</Terminal>

That `0c3d8e5` commit from three weeks ago worked fine. Mark it as good:

```bash
git bisect good 0c3d8e5
```

Git immediately responds:

```
Bisecting: 39 revisions left to test after this (roughly 6 steps)
[d2a7c14] feat: add reading time to blog posts
```

Git has checked out a commit halfway between your good and bad endpoints. It tells you roughly how many steps remain.

## Step 2 — Test the current commit

Git has checked out a commit in the middle of your range. Test your build:

<Terminal>
$ npm run build
</Terminal>

Two outcomes:

**The build succeeds** — this commit is fine. The problem was introduced *after* this commit:

```bash
git bisect good
```

**The build fails** — this commit is already broken. The problem was introduced *before or at* this commit:

```bash
git bisect bad
```

Git halves the remaining range and checks out the next candidate. Repeat.

## Step 3 — Repeat until git finds the culprit

After 6–7 iterations, git stops and tells you exactly which commit introduced the problem:

```
d8f3a21 is the first bad commit
commit d8f3a21
Author: Christophe Avonture <cavo789@gmail.com>
Date:   Mon May 19 14:32:10 2026 +0200

    chore: upgrade remark-gfm to v4

 package.json        | 2 +-
 package-lock.json   | 8 ++--
 2 files changed, 5 insertions(+), 5 deletions(-)
```

`remark-gfm v4` introduced a breaking API change. You now know exactly what to investigate — and you found it in seven steps instead of eighty.

## Step 4 — Exit bisect mode

Always exit bisect mode when done. Git has been checking out arbitrary commits; this command restores your working tree to the branch you started from:

```bash
git bisect reset
```

<AlertBox variant="warning" title="Always reset after bisect">
If you forget to run `git bisect reset`, you'll be in a detached HEAD state — no branch is checked out. Your next commits would go nowhere. Make `git bisect reset` a reflex.
</AlertBox>

## Automating bisect with a test script

Manual bisect works well when the test is a visual check or a quick command. But if your test takes longer or needs to be exact, automate it.

Write a script that exits with code `0` if the commit is good, and any non-zero code if it's bad:

```bash
#!/bin/bash
# bisect-test.sh
npm run build > /dev/null 2>&1
exit $?
```

Run bisect with the script:

```bash
git bisect start
git bisect bad
git bisect good 0c3d8e5
git bisect run ./bisect-test.sh
```

Git runs the script at each candidate commit. It marks each commit good or bad based on the exit code — completely unattended. When it finishes, it prints the first bad commit and stops.

This is particularly powerful for:

* Test suites: `git bisect run npm test`
* API endpoint checks: `git bisect run curl -sf http://localhost:3000/api/health`
* File presence: `git bisect run test -f dist/bundle.js`

The only requirement is a deterministic exit code: `0` = good, non-zero = bad.

<AlertBox variant="note" title="Make the test script executable">
Run `chmod +x bisect-test.sh` before using it with `git bisect run`. Otherwise you'll get a permission error at the first step.
</AlertBox>

## Useful commands during a bisect session

### See where you are

```bash
git bisect log
```

Prints all the good/bad marks you've given so far. Useful if you lose track of where you are in a long session.

### Replay a session

If you want to repeat the exact same bisect on another machine or a colleague's repo:

```bash
git bisect log > bisect.log
git bisect replay bisect.log
```

### Skip a commit

Sometimes a commit is untestable — it has an unrelated compile error, or a configuration file was temporarily broken. Skip it:

```bash
git bisect skip
```

Or skip a range:

```bash
git bisect skip v1.2..v1.3
```

Git will find the culprit as long as there are enough testable commits around the skipped ones.

### Visualize the remaining range

If you have `gitk` installed (or any GUI tool):

```bash
git bisect visualize
```

This opens the current candidate set in a visual commit graph — useful for understanding where you are in a large history.

## A Docker-specific scenario

You're maintaining a Docusaurus site served via Docker Compose. The container was building correctly; now `docker compose up` exits immediately with an error in the startup script. You don't know which commit broke it.

```bash
# bisect-docker.sh
#!/bin/bash
docker compose build --quiet > /dev/null 2>&1 && \
docker compose run --rm app node -e "require('./src/index.js')" > /dev/null 2>&1
exit $?
```

```bash
git bisect start
git bisect bad
git bisect good v2.1.0
git bisect run ./bisect-docker.sh
```

Each candidate commit is tested by actually building and running the container. No manual steps.

## Common mistakes

**Marking good and bad backwards** — If you accidentally mark the wrong commit, git will search the wrong half of history. Run `git bisect reset` and start over.

**Testing the wrong thing** — Make sure your test command actually reproduces the bug. A test that always passes (or always fails) will mislead bisect into pointing at a random commit.

**Forgetting to reset** — Running `git bisect reset` at the end is not optional. Leave it out and you're in detached HEAD state.

## Summary

| Command | What it does |
|---------|-------------|
| `git bisect start` | Begin a bisect session |
| `git bisect bad [ref]` | Mark a commit (or HEAD) as broken |
| `git bisect good [ref]` | Mark a commit as working |
| `git bisect run <script>` | Automate the testing step |
| `git bisect skip` | Skip an untestable commit |
| `git bisect log` | Show all marks in this session |
| `git bisect reset` | End the session, restore your branch |

The next time a regression appears and `git log --oneline` returns a wall of commits, resist the urge to guess. Start a bisect session, mark your endpoints, and let git do the math.
