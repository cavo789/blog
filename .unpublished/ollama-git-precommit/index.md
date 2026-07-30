---
slug: ollama-git-precommit
title: "ai-review, ai-secrets, ai-commit: Three zsh Checks Before Every git Commit"
authors: [christophe, claude]
image: /img/v2/clean_code.webp
mainTag: git
tags: [git, ollama, zsh, ai, security, code-quality]
date: 2026-12-31
description: "Three zsh functions that together form a local, offline pre-commit quality gate: ai-review catches SOLID violations and naming issues, ai-secrets separates real hardcoded credentials from false positives, and ai-commit drafts the Conventional Commits message once the diff is actually clean."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-review, ai-secrets, ai-commit: Three zsh Checks Before Every git Commit](/img/v2/clean_code.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-review ai-secrets qwen ollama zshrc SOLID getenv phpstan -->

<TLDR>
This article adds three functions to the "Ollama daily-use functions" series — `ai-review`, `ai-secrets`, and `ai-commit` — that together cover the moment right before a `git commit`. All three read the same `git diff --staged`, so they share a single extracted helper (`_git_staged_diff`) instead of repeating the same guard clauses three times. The workflow is intentional: review first, catch any secrets second, write the commit message last — once the diff is actually what you want it to be.
</TLDR>

The moment right before a `git commit` is probably the most valuable one in the whole development cycle to pause and look at what you've actually written. Not because something is necessarily wrong — usually it isn't — but because that's when the diff is small and bounded. One more minute of review when you can still see every changed line clearly is worth more than an hour of archaeology later.

I already have [pre-commit hooks](/blog/git-precommit) running phpcbf, PHPStan and friends. Those catch *rules*. What they don't catch is judgment: a method that quietly grew three responsibilities, `0.21` on line 20 that should have a name, `$d` that was a lazy parameter name three months ago and is unreadable today — or, more critically, a real database password that slipped into a config diff.

These three functions fill that gap, locally, without a cloud subscription.

<!-- truncate -->

## The Shared Pattern — and the Helper That Makes It Possible

All three functions do the same thing first: check that you're inside a git repo, that something is actually staged, and optionally warn about large diffs. In the original versions, those fifteen lines were copy-pasted into each function — a classic SRP violation hiding in plain sight.

The improved `_ollama.zsh` foundation (introduced in [ai-test](/blog/ollama-test-generator)) now includes a `_git_staged_diff` helper that owns those guard clauses once:

```zsh title="~/.zsh/fns/_ollama.zsh (extract)"
_git_staged_diff() {
  local caller="${1:-ai}"

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "${caller}: not inside a git repository" >&2
    return 1
  fi

  local diff
  diff=$(git diff --staged)

  if [[ -z "$diff" ]]; then
    echo "${caller}: nothing staged — run 'git add' first" >&2
    return 1
  fi

  if (( ${#diff} > 12000 )); then
    echo "${caller}: staged diff is large (${#diff} chars) — output may be less precise." >&2
  fi

  print -- "$diff"
}
```

Every function below calls `_git_staged_diff` and gets back the diff — or exits cleanly with a clear message. One responsibility, one place. Here's the full updated foundation file:

<Snippet filename="~/.zsh/fns/_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />

## Step 1 — `ai-review`: Does This Diff Actually Hold Together?

Run this first, before thinking about the commit message. If the model finds something worth fixing, you'll fix it and re-stage — and `ai-review` will see a cleaner diff the second time.

<Snippet filename="~/.zsh/fns/ai-review.zsh" source="./files/ai-review.zsh" defaultOpen={true} />

The prompt uses five fixed headings and explicitly says "omit a heading if there is nothing to report under it." That constraint matters: a model that finds something under every single heading every single time isn't reviewing your code, it's performing thoroughness. An empty "Naming" section is a fine outcome.

Here's a staged diff with a few deliberate issues planted in it:

<Snippet filename="src/Invoice/InvoiceProcessor.php (staged diff)" source="./files/demo_review.diff" defaultOpen={false} />

<Terminal source="./files/terminal_review.txt" typewriter />

Four genuine issues surfaced, under four of the five headings. "Long functions" is absent — the model decided 26 lines didn't cross that line, and the prompt told it not to invent a section. That restraint is the point.

<AlertBox variant="note" title="Read-only, on purpose">
`ai-review` never touches the diff, never blocks a commit, never writes anything. It prints a review to your terminal. What you do with it is your call.
</AlertBox>

## Step 2 — `ai-secrets`: Is There a Real Credential in This Diff?

After any fixes from the review are re-staged, run this. A plain regex scanner can't tell `'password' => 'Sup3rSecret!'` (a real leak) from `'password' => getenv('DB_PASSWORD')` (the right pattern) — both lines contain "password" next to an `=`. That's exactly the gap the model closes.

<Snippet filename="~/.zsh/fns/ai-secrets.zsh" source="./files/ai-secrets.zsh" defaultOpen={true} />

The two-phase design is deliberate: the regex does the cheap, deterministic part first — if nothing matches, the function returns immediately with zero model calls. The model only runs when there's actually something suspicious to judge.

<Snippet filename="config/database.php (staged diff)" source="./files/demo_secrets.diff" defaultOpen={false} />

<Terminal source="./files/terminal_secrets.txt" typewriter />

Two lines matched the regex, both containing "password." The model correctly separated them: one is a real leak with a concrete fix, the other is the exact `getenv()` pattern that fix should follow — correctly left alone.

<AlertBox variant="caution" title="A safety net, not a guarantee">
This catches what shows up in a text diff. It won't catch a secret split across multiple commits, baked into a binary, or encoded in a way the regex doesn't recognize. Treat it as a second pair of eyes before a commit, not a replacement for a real secrets-scanning tool in CI.
</AlertBox>

## Step 3 — `ai-commit`: Write the Message for the Diff You've Just Cleaned Up

Now the diff is what you actually want to commit. Instead of typing "fix" for the fourth time this week, hand that staged diff to the model — it already contains everything needed to describe what changed.

<Snippet filename="~/.zsh/fns/ai-commit.zsh" source="./files/ai-commit.zsh" defaultOpen={true} />

The function never commits on your behalf. The default answer (pressing Enter) is always "no." You explicitly type `y` to accept the suggestion as-is, or `e` to open it in your `$EDITOR` for the parts only you know — the *why* behind the change, a workaround context, a trade-off call.

<Snippet filename="api/reactions.php (staged diff)" source="./files/demo_commit.diff" defaultOpen={false} />

<Terminal source="./files/terminal_commit.txt" typewriter />

A properly scoped `fix(api):` message with a short explanatory body, generated in the two or three seconds it takes the model to read a four-line diff.

<AlertBox variant="important" title="Nothing commits itself">
`ai-commit` only ever calls `git commit` after an explicit `y` or `e`. Pressing Enter, Escape, or anything else aborts cleanly.
</AlertBox>

## The Workflow in Practice

These three aren't a pipeline — you don't have to run all three, and you don't have to run them in order. But the order makes sense when you do:

```zsh
# 1. Look at the diff for design issues
ai-review

# 2. Fix anything worth fixing, then re-stage
git add -p

# 3. Make sure you haven't accidentally left a real credential
ai-secrets

# 4. Write the commit message for the diff you've now cleaned up
ai-commit
```

Each function is also reachable directly (`ai-review`, `ai-secrets`, `ai-commit`) or via the `ai` dispatcher — type bare `ai`, pick a function from the fzf menu, and if the function needs a parameter the menu collects it interactively before running.

## Registered in the `ai` Menu

All three add themselves with one line each — `AI_COMMANDS[review]=...`, `AI_COMMANDS[secrets]=...`, `AI_COMMANDS[commit]=...` — and declare `AI_PARAMS[...]=none` (they read the staged diff themselves, no argument needed). The dispatcher handles the rest.

## Key Takeaways

<StepsCard
  variant="remember"
  title="Three pre-commit checks — quick reference"
  steps={[
    { content: "**`ai-review` first** — catches SOLID violations, magic constants, naming issues before the commit message is even drafted" },
    { content: "**`ai-secrets` second** — regex finds candidates cheaply; the model judges which ones are real leaks vs. safe patterns a regex can't distinguish" },
    { content: "**`ai-commit` last** — writes the message for the diff you've now actually cleaned up; explicit `y` or `e` required before anything is committed" },
    { content: "**`_git_staged_diff` shared** — one helper owns the guard clauses (git repo check, empty diff, size warning) so none of the three functions repeat them" },
    { content: "**All three register into `ai`** — reachable as `ai review`, `ai secrets`, `ai commit`, or via the interactive fzf menu" }
  ]}
/>

## Conclusion

None of these three functions does anything you couldn't do manually. `ai-review` is a slower version of reading your own diff. `ai-secrets` is a faster version of `grep -i password`. `ai-commit` is a draft of the message you were going to write anyway. The value isn't in the individual capabilities — it's in the fact that all three run locally, take under ten seconds each, and slot into the moment you're already in: staged, ready to commit, just before you actually do. That's the only moment when the cost of "fix it now" is still lower than the cost of "fix it later."
