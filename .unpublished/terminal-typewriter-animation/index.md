---
slug: docusaurus-terminal-typewriter
title: "Bring Your CLI Tutorials to Life with a Typewriter Terminal"
date: 2026-06-13
authors: [christophe]
image: /img/v2/docusaurus_component.webp
description: Add a typewriter animation to your Docusaurus Terminal component — command lines typed character-by-character, output lines appearing in sequence, with a blinking cursor and a click-to-skip escape hatch. Three new props, zero breaking changes.
mainTag: docusaurus
tags:
  - docusaurus
  - component
  - react
  - ux
language: en
ai_assisted: true
draft: true
---

![Bring Your CLI Tutorials to Life with a Typewriter Terminal](/img/v2/docusaurus_component.webp)

<TLDR>
Static code blocks explain what to run. An animated terminal shows it *happening*. This article extends the existing `Terminal` component with a `typewriter` prop: command lines (those starting with `$` or `#`) are typed character-by-character with a blinking cursor; output lines appear whole after a short pause. Three new props control speed and pacing. The change is fully backward-compatible — every existing `<Terminal>` block stays identical unless you opt in. Implementation is pure React state + `setTimeout`, no library dependency.
</TLDR>

CLI tutorials are dense. A reader follows along, copy-pasting commands, hoping the output they see matches what you wrote. But when the article just shows a static block of text, the sequence of events — the command, the pause, the response — collapses into a single wall of monospace.

A typewriter animation restores that sequence. The command appears letter by letter, as if someone is actually typing it. Then the output follows. The reader's eye is guided through the interaction naturally, without any extra explanation.

<!-- truncate -->

## The existing Terminal component

The blog already ships a `Terminal` component that renders a dark, macOS-style terminal window with a copy button:

```jsx
<Terminal title="user@machine: ~/project">
  {`$ docker compose up -d
[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started`}
</Terminal>
```

This renders everything instantly. Useful, but flat.

## The new `typewriter` prop

Add `typewriter` to opt into the animation:

```jsx
<Terminal title="user@machine: ~/project" typewriter>
  {`$ docker compose up -d
[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started`}
</Terminal>
```

Here is what happens, frame by frame:

1. `$` appears, then `d`, then `o`, then `c`… the command types itself out character by character
2. A blinking green `▋` cursor tracks the current position
3. Once the command is fully typed, a brief pause lets it settle
4. `[+] Running 3/3` appears as a complete line
5. Each output line follows in sequence
6. The cursor disappears when the animation ends

**Click anywhere on the terminal to skip to the end** — useful for readers who have already seen the animation and just want to copy the commands.

## Animation starts only when visible

A terminal buried at the bottom of a long article would finish its animation before the reader ever reached it. The component solves this with the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): the typewriter effect starts only when at least 10 % of the terminal enters the viewport. Scroll past it and the animation greets you exactly when you arrive.

## Speed scales automatically with line count

Two additional props let you fine-tune pacing, but you rarely need them — the component auto-scales based on the number of lines:

| Lines | `typewriterSpeed` | `typewriterLineDelay` | Approx. total duration |
|-------|-------------------|-----------------------|------------------------|
| ≤ 5   | 40 ms/char        | 400 ms/line           | ~2 s                   |
| 6–10  | 25 ms/char        | 200 ms/line           | ~2.5 s                 |
| 11–20 | 20 ms/char        | 150 ms/line           | ~3.5 s                 |
| > 20  | 12 ms/char        | 100 ms/line           | ~3.5 s                 |

A 30-line session completes in roughly the same time as a 3-line one. The animation stays engaging without becoming a waiting game.

Override only when you need a specific feel — a slow, deliberate introduction to a new tool:

```jsx
<Terminal typewriter typewriterSpeed={60} typewriterLineDelay={600}>
  {`$ fzf --version
0.54.3 (brew)`}
</Terminal>
```

## How the lines are classified

The animation distinguishes two types of lines by looking at the first non-whitespace characters:

- **Command lines** — start with `$` or `#`. Typed character-by-character at `typewriterSpeed` ms/char.
- **Output lines** — everything else. Revealed as a complete line after `typewriterLineDelay` ms.
- **Blank lines** — appear after an 80 ms pause, preserving the visual breathing room of the original content.

This means you don't need to annotate your content in any special way. Write the terminal session naturally; the component infers the structure.

## Zero breaking changes

Every existing `<Terminal>` block in the codebase continues to render exactly as before. The `typewriter` prop defaults to `false`, so the static behavior is the default.

If you want to enable the animation everywhere in one step, a global search-and-replace on `<Terminal` → `<Terminal typewriter` across the `blog/` directory is all it takes:

```bash
grep -rl "<Terminal" blog/ | xargs sed -i 's/<Terminal\b/<Terminal typewriter/g'
```

## Implementation sketch

The component holds three pieces of state during animation:

```
revealedLines  — lines fully shown so far (string[])
lineIdx        — which line is currently being animated (number)
charIdx        — how many characters of that line are visible (number)
```

A single `useEffect` drives the animation tick. On each render it decides which timeout to schedule next:

- If the current line is a command and `charIdx < line.length` → schedule `setCharIdx(c => c + 1)` after `typewriterSpeed` ms
- Otherwise (output line, or command fully typed) → schedule the move to the next line after `typewriterLineDelay` ms

When `lineIdx` reaches the end of the lines array, `animDone` is set to `true` and the component switches back to rendering the original `{children}` React node — so any syntax highlighting or rich markup in the children is preserved after the animation completes.

The blinking cursor is a single CSS animation:

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor {
  display: inline-block;
  color: #00ff00;
  animation: blink 1s step-end infinite;
}
```

No external library. No canvas. Just state and timers.
