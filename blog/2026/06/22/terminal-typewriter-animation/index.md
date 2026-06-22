---
slug: docusaurus-terminal-typewriter
title: "Bring Your CLI Tutorials to Life with a Typewriter Terminal"
date: 2026-06-22
authors: [christophe]
image: /img/v2/typewriter_terminal.webp
description: Add a typewriter animation to your Docusaurus Terminal component — command lines typed character-by-character, output lines appearing in sequence, with a blinking cursor and a click-to-skip escape hatch. Three new props, zero breaking changes.
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - react
language: en
ai_assisted: true
blueskyRecordKey: 3mouavfuwqs2g

---

![Bring Your CLI Tutorials to Life with a Typewriter Terminal](/img/v2/typewriter_terminal.webp)

<TLDR>
Static code blocks explain what to run. An animated terminal shows it *happening*. This article extends the existing `Terminal` component with a `typewriter` prop: command lines (those starting with `$` or `#`) are typed character-by-character with a blinking cursor; output lines appear whole after a short pause. Three new props control speed and pacing. The change is fully backward-compatible — every existing `<Terminal>` block stays identical unless you opt in. Implementation is pure React state + `setTimeout`, no library dependency.
</TLDR>

CLI tutorials are dense. A reader follows along, copy-pasting commands, hoping the output they see matches what you wrote. But when the article just shows a static block of text, the sequence of events — the command, the pause, the response — collapses into a single wall of monospace.

A typewriter animation restores that sequence. The command appears letter by letter, as if someone is actually typing it. Then the output follows. The reader's eye is guided through the interaction naturally, without any extra explanation.

<!-- truncate -->

If you're a regular reader of my blog, you know that I've developed a component called `Terminal` that lets me list a series of commands I've run in a Linux-style console—and it looks pretty similar.  Here's an example:

<Terminal title="user@machine: ~/project">
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>

However, it's a little lacking in “life”; let's see how we can make it look pretty cool with a typewriter-style animation.

The Terminal output here above has been obtained using this block in my Markdown content:

```jsx
<Terminal title="user@machine: ~/project">
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>
```

Docusaurus will then do the rendering during the preview of this post or during the HTML generation.

## The new `typewriter` prop

Add `typewriter` to opt into the animation:

```jsx
<Terminal typewriter>
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>
```

Here is what happens, frame by frame:

1. `$` appears, then `d`, then `o`, then `c`… the command types itself out character by character
2. A blinking green `▋` cursor tracks the current position
3. Once the command is fully typed, a brief pause lets it settle
4. `[+] Running 3/3` appears as a complete line
5. Each output line follows in sequence
6. The cursor disappears when the animation ends

<AlertBox variant="tip" title="Skip the animation">
Click anywhere on the terminal to skip to the end. Useful for readers who have already seen the animation and just want to copy the commands.
</AlertBox>

<Terminal typewriter>
$ docker compose up -d

[+] Running 3/3
 ✔ Network myapp_default   Created
 ✔ Container myapp-db-1    Started
 ✔ Container myapp-web-1   Started

</Terminal>

Another examples:

<Terminal typewriter>
$ npm install

added 347 packages, and audited 348 packages in 12s

42 packages are looking for funding
  run "npm fund for details

found 0 vulnerabilities
</Terminal>

<Terminal typewriter>
$ npm run build

✓ frontend@1.0.0 build
✓ vite build

vite v6.2.1 building for production...
✓ 124 modules transformed.
dist/index.html                  0.58 kB
dist/assets/index-8af3d2.js    215.43 kB
✓ built in 2.14s

$ npm run preview

✓ frontend@1.0.0 preview
✓ vite preview

➜  Local:   http://localhost:4173/
➜  Network: http://192.168.1.42:4173/
</Terminal>

<Terminal typewriter>
$ git status

On branch feature/authentication
Changes not staged for commit:
  modified: src/auth/login.ts
  modified: src/auth/session.ts

$ git add .

$ git commit -m "feat(auth): add session refresh"

[feature/authentication 7c1f2ab] feat(auth): add session refresh
 2 files changed, 48 insertions(+), 12 deletions(-)

$ git push origin feature/authentication

Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Writing objects: 100% (8/8), 1.24 KiB | 1.24 MiB/s, done.
Total 8 (delta 4), reused 0 (delta 0)

To github.com:company/project.git
   e1a9c2f..7c1f2ab  feature/authentication -> feature/authentication
</Terminal>

<Terminal typewriter>
$ docker compose up -d

[+] Running 4/4
 ✔ Network api_default          Created
 ✔ Container api-db-1           Started
 ✔ Container api-redis-1        Started
 ✔ Container api-backend-1      Started

$ docker compose ps

NAME              STATUS         PORTS
api-db-1          Up 3 seconds   5432/tcp
api-redis-1       Up 3 seconds   6379/tcp
api-backend-1     Up 2 seconds   0.0.0.0:8080->8080/tcp

$ docker compose logs backend --tail=10

backend-1 | Connecting to PostgreSQL...
backend-1 | Database connection established
backend-1 | Redis connection established
backend-1 | HTTP server listening on :8080
</Terminal>

<Terminal title="root@server: ~" typewriter>
$ apt update

Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]

Fetched 126 kB in 1s

$ apt upgrade -y

Reading package lists...
Building dependency tree...
Calculating upgrade...

12 upgraded, 0 newly installed, 0 to remove.

$ systemctl restart nginx

$ systemctl status nginx

● nginx.service - nginx web server
     Loaded: loaded
     Active: active (running)

$ df -h

Filesystem      Size  Used Avail Use%
/dev/sda1        80G   41G   36G  54%
</Terminal>

## Animation starts only when visible

A terminal buried at the bottom of a long article would finish its animation before the reader ever reached it. The component solves this with the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API): the typewriter effect starts only when at least 10 % of the terminal enters the viewport. Scroll past it and the animation greets you exactly when you arrive.

<AlertBox variant="tip">
Want to check this? Simply reload this page (<kbd>CTRL</kbd>+<kbd>F5</kbd>) and just press End to jump to the conclusion of this post. Then, scroll up.  Animations will start. Just because the Terminal component is now in the visible part of the page.
</AlertBox>

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
$ fzf --version

0.54.3 (brew)
</Terminal>
```

## How the lines are classified

The animation distinguishes two types of lines by looking at the first non-whitespace characters:

* **Command lines** — start with `$` or `#`. Typed character-by-character at `typewriterSpeed` ms/char.
* **Output lines** — everything else. Revealed as a complete line after `typewriterLineDelay` ms.
* **Blank lines** — appear after an 80 ms pause, preserving the visual breathing room of the original content.

This means you don't need to annotate your content in any special way. Write the terminal session naturally; the component infers the structure.

## Zero breaking changes

Every existing `<Terminal>` block in the codebase continues to render exactly as before. The `typewriter` prop defaults to `false`, so the static behavior is the default.

If you want to enable the animation everywhere in one step, a global search-and-replace on `<Terminal` → `<Terminal typewriter` across the `blog/` directory is all it takes:

```bash
grep -rl "<Terminal" blog/ | xargs sed -i 's/<Terminal\b/<Terminal typewriter/g'
```

## Implementation sketch

The component holds three pieces of state during animation:

```plaintext
revealedLines  — lines fully shown so far (string[])
lineIdx        — which line is currently being animated (number)
charIdx        — how many characters of that line are visible (number)
```

A single `useEffect` drives the animation tick. On each render it decides which timeout to schedule next:

* If the current line is a command and `charIdx < line.length` → schedule `setCharIdx(c => c + 1)` after `typewriterSpeed` ms
* Otherwise (output line, or command fully typed) → schedule the move to the next line after `typewriterLineDelay` ms

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

## Create the component

You'll need to create three new files to your own Docusaurus site. The fourth file is optional and this is the component's documentation:

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>
  <Snippet filename="src/components/Terminal/index.js" source="src/components/Terminal/index.js" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/icon.svg" source="src/components/Terminal/icon.svg" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/styles.modules.css" source="src/components/Terminal/styles.modules.css" defaultOpen={false} />
  <Snippet filename="src/components/Terminal/readme.md" source="src/components/Terminal/readme.md" defaultOpen={false} />
</ProjectSetup>

Then edit (or create) the `src/theme/MDXComponents.js` file. If the file already exists, just add the highlighted lines below. If not yet present, create the file with the content below:

<Snippet filename="src/theme/MDXComponents.js" >

```js
// At the top of your file, add this line:

// highlight-next-line
import Terminal from "@site/src/components/Terminal";

// Then in your export section, add this line too:
export default {
  // Reusing the default mapping
  ...MDXComponents,

  // [...]

  // highlight-next-line
  Terminal
};

```

</Snippet>

From now one, you can use the `<Terminal>` component in your posts. Enjoy!
