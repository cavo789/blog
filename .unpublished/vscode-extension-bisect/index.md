---
slug: vscode-extension-bisect
title: "Extension Bisect: Binary Search for a Misbehaving VSCode Extension"
authors: [christophe, claude]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags: [vscode]
date: 2026-12-31
description: "VSCode ships a built-in binary search over your installed extensions to find the one causing a slowdown or a weird bug — the same idea as git bisect, applied to extensions instead of commits."
language: en
ai_assisted: true
draft: true
---

![Extension Bisect: Binary Search for a Misbehaving VSCode Extension](/img/v2/vscode_tips.webp)

<TLDR>
VSCode has a built-in **Extension Bisect** tool that binary-searches your installed extensions to find the one causing a slowdown, a UI glitch, or a weird editor behavior — disable half, check if the problem's gone, repeat. It's the exact same idea as `git bisect` from <Link to="/blog/git-bisect">my other draft on this</Link>, just pointed at a list of extensions instead of a list of commits.
</TLDR>

Across the [18-plus VSCode articles](/tags/vscode) on this blog, that's a lot of extensions installed over time — and every so often, something feels subtly off: a laggy keystroke, a tooltip that shouldn't be there, a feature that stopped working after some update. The instinct is to start disabling extensions one by one, from memory, roughly in the order I suspect them. That's exactly the manual, linear approach <Link to="/blog/git-bisect">the git bisect article</Link> argues against for finding a broken commit — and VSCode has the same fix built in, for this exact situation.

<!-- truncate -->

<!-- TODO(author): capture a real screenshot of the Good/Bad Extension Bisect prompt here before publishing — not reproducible in this session (requires a live VSCode GUI). -->

## Starting a Bisect

Open the Command Palette and run **Help: Start Extension Bisect**. VSCode disables roughly half of your installed extensions and asks a single question: is the problem still happening?

<StepsCard
  variant="steps"
  title="The bisect loop"
  steps={[
    { content: "**Reproduce the issue.** With half your extensions disabled, try to trigger the problem again." },
    { content: "**Answer the prompt.** VSCode asks whether the problem is still there — \"Good\" (gone) or \"Bad\" (still happening)." },
    { content: "**Repeat.** Each answer halves the remaining candidates, re-enabling or disabling roughly half of what's left, the same way `git bisect` narrows down commits." },
    { content: "**Get the culprit.** After a handful of rounds, VSCode names the single extension responsible and offers to disable it for you." }
  ]}
/>

<AlertBox variant="tip" title="Same math as git bisect">
<Link to="/blog/git-bisect">The git bisect article</Link> shows 150 commits resolving in 7 steps because binary search halves the field every round. Extension Bisect is the identical trade — even a few dozen extensions resolve in well under 10 rounds, instead of disabling them one at a time from the top of the list.
</AlertBox>

## When This Actually Earns Its Keep

Not every glitch is extension-related — plenty of bugs are VSCode core, or the file itself, or an actual bug in your code. Extension Bisect is worth reaching for specifically when the symptom is performance-shaped (typing lag, high CPU from the extension host, slow startup) or UI-shaped (a stray icon, a broken hover, a keybinding that fires the wrong command) — the categories an extension is actually capable of causing.

<AlertBox variant="note" title="It only touches extensions, nothing else">
Bisect only toggles which extensions are active — it doesn't touch settings, themes, or keybindings. If disabling every extension via bisect still reproduces the problem, the cause is somewhere else entirely, and bisect has still saved you the time of suspecting your extensions for nothing.
</AlertBox>

## Stopping Early

If reproducing the issue reliably turns out to be the hard part rather than narrowing the list, `Help: Stop Extension Bisect` exits at any point and restores every extension to its normal enabled/disabled state, no side effects left behind.

## Key Takeaways

<StepsCard
  variant="remember"
  title="Extension Bisect quick reference"
  steps={[
    { content: "**`Help: Start Extension Bisect`** — Command Palette, no configuration needed" },
    { content: "**Answer Good/Bad, not a specific extension** — the tool narrows the field for you, same principle as `git bisect`" },
    { content: "**Best for performance and UI symptoms** — the categories an extension can actually cause" },
    { content: "**`Help: Stop Extension Bisect`** restores everything cleanly if reproduction turns out to be unreliable" }
  ]}
/>

## Conclusion

It's a small, easy-to-forget corner of VSCode precisely because it only matters on the rare day something feels wrong and the cause isn't obvious — but it's the same binary-search shortcut <Link to="/blog/git-bisect">git bisect</Link> already earned a permanent spot for, just aimed at a different kind of haystack. Now, the next time something feels subtly broken, the answer is a handful of Good/Bad clicks away instead of a guessing game through the extensions list.
