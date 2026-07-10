---
slug: docusaurus-easter-eggs
title: "Meerkat Mischief: Sprinkling Easter Eggs Across a Docusaurus Blog"
authors: [christophe, claude]
image: /img/v2/docusaurus_component.webp
mainTag: docusaurus
tags: [docusaurus, react, component]
date: 2026-12-31
description: "A tour of seven small, discoverable easter eggs added to this Docusaurus blog — a Konami-code sprite run, a console.log wink, a tab-away favicon swap, rotating 404 messages, a hidden sitemap comment and more — plus the real bugs (key-repeat, an AZERTY keyboard mismatch, a wrong emoji, a postBuild race condition, a blurry favicon) caught along the way."
ai_assisted: true
language: en
draft: true
blueskyRecordKey:
---

![Meerkat Mischief: Sprinkling Easter Eggs Across a Docusaurus Blog](/img/v2/docusaurus_component.webp)

<!-- cspell:ignore Konami konami keydown postBuild urlset avonture nginx meerkats KONAMI AZERTY azerty -->

<TLDR>
Beyond the meerkat mascot already visible on this blog, we added seven small, deliberately hidden easter eggs: a `console.log` wink, rotating 404 messages, a Konami-code sprite run, a tab-away title/favicon swap, an `X-Powered-By` HTTP header, a print-stylesheet footer, and a hidden comment in `sitemap.xml`. This article walks through every one of them with the actual source code, and — more usefully — the real bugs we shipped and caught along the way: a key-repeat race in the Konami handler, an AZERTY keyboard mismatch a real user (not our tests) found, a wrong emoji codepoint, a Docusaurus `postBuild` concurrency gotcha, and a favicon that was unreadable until we redesigned the crop.
</TLDR>

You already know this site has a mascot: a meerkat that shows up on the 404 page, rides the "scroll to top" button, and hides in an [ASCII-art HTML comment](/blog/docusaurus-ascii-art) on every page. That last one got me thinking: if a comment in the page source is fun, what else could a curious visitor stumble upon?

So, one afternoon, I asked myself — and Claude Code — a simple question: how far can we take this without it becoming annoying? The answer turned into seven small, independent additions, each following the same rule: **if you're not looking for it, you'll never see it.** No pop-ups, no confetti on page load, nothing that gets in a reader's way. Just quiet rewards for the curious.

<!-- truncate -->

<AlertBox variant="note" title="The one rule behind all of this">
Every easter egg on this list lives in the console, the source, the response headers, or a state the visitor has to trigger on purpose (leaving the tab, printing a page, typing a secret code). None of them ever appear in the normal reading flow.
</AlertBox>

## 1. A console.log wink for DevTools visitors

The easiest one. If you open your browser's DevTools console on this blog, you'll see this:

<Snippet filename="src/theme/Root.js (excerpt)" source="./files/root-console-egg.js" defaultOpen={true} />

Nothing fancy: a styled `console.log` call (the `%c` directive lets you apply CSS to console output) that fires once per full page load. It also doubles as a hint, pointing curious readers toward the Konami code below.

<AlertBox variant="tip" title="Why useEffect(..., [])">
An empty dependency array means this effect runs once when the component mounts — not on every client-side route change. Since `Root` wraps the whole app and survives navigation between pages, this is the right place for a "once per visit" easter egg.
</AlertBox>

## 2. A 404 page with a sense of humor

The 404 page already showed a meerkat illustration and a message. We turned the message into a small pool of five, picked at random on every load:

<Snippet filename="src/theme/NotFound/index.js" source="src/theme/NotFound/index.js" defaultOpen={false} />

`useState(() => …)` with a function initializer ensures the random pick happens exactly once per mount, not on every re-render — important here since `NotFound` doesn't need to re-roll the message while the user reads it.

## 3. The star of the show: a Konami code easter egg

Type `↑ ↑ ↓ ↓ ← → ← → B A` anywhere on this site (not in a text field) and a meerkat sprints across your screen. This is the one worth the most detail, because it's also the one that taught us the most.

### Finding a "running" sprite without generating anything

We already had a sprite sheet of meerkat poses (`static/img/meerkat/suricate_positions_4.webp`) sitting in the repo from an earlier post. Instead of asking an image generator for a new asset, we cropped the existing "running" pose out of it with ImageMagick and made the background transparent:

<Terminal title="user@machine: ~/blog" wrap={true}>
$ convert suricate_positions_4.webp -crop 400x300+300+430 +repage crop.png
$ convert crop.png -fuzz 8% -transparent "$(convert crop.png -format '%[pixel:p{2,2}]' info:)" -trim +repage suricate_running.png
$ convert suricate_running.png -define webp:lossless=true suricate_running.webp
</Terminal>

<AlertBox variant="tip" title="Check your sprite sheets before generating new art">
If your mascot already has a set of illustrated poses, there's a good chance the pose you need is already sitting in one of them. `identify` to get the dimensions, then `convert -crop` and `-transparent` to lift exactly the piece you want — much faster than round-tripping through an image generator.
</AlertBox>

### The component

<Snippet filename="src/components/KonamiEasterEgg/index.js" source="src/components/KonamiEasterEgg/index.js" defaultOpen={true} />

The logic keeps a `useRef` cursor into a `KONAMI_CODE` array of [`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) values (not `.key` — `.code` reflects the physical key position, so the sequence works the same on an AZERTY keyboard as on a QWERTY one). Each keydown either advances the cursor, resets it, or — on a full match — mounts a runner `<img>` for 3 seconds:

<Snippet filename="src/components/KonamiEasterEgg/styles.module.css" source="src/components/KonamiEasterEgg/styles.module.css" defaultOpen={false} />

It's mounted once, globally, from `src/theme/Root.js`:

```jsx title="src/theme/Root.js (excerpt)"
import KonamiEasterEgg from '@site/src/components/KonamiEasterEgg';

// ...

return (
  <>
    {children}
    <KonamiEasterEgg />
  </>
);
```

<AlertBox variant="tip" title="Try it right now">
Seriously — click anywhere on this page to make sure it has focus, then type `↑ ↑ ↓ ↓ ← → ← → B A`. This exact component is running on the page you're reading.
</AlertBox>

### The bug that nearly killed the fun

After shipping this, real-world testing turned up a genuine bug: typed slowly and deliberately, the sequence sometimes just... didn't trigger. The cause was auto-repeat. Hold `ArrowUp` even a fraction of a second too long — which is very natural when you're carefully recalling a sequence — and the browser fires several `keydown` events with `repeat: true` before you release the key. Since the sequence needs `ArrowUp` **twice in a row**, one held press can inject an extra `ArrowUp` event right when the handler expects `ArrowDown`, silently resetting the whole thing.

The fix is one guard clause:

```jsx title="src/components/KonamiEasterEgg/index.js (excerpt)"
const handleKeyDown = (event) => {
  // Ignore auto-repeated keydowns fired while a key is held down: a
  // slightly-too-long "ArrowUp" press would otherwise inject extra
  // events and break a sequence that has two of the same key in a row.
  if (event.repeat) return;

  // ...
};
```

We verified the fix with [Playwright](https://playwright.dev/) rather than just eyeballing it — dispatching a synthetic `keydown` with `repeat: true` confirmed the handler now ignores it, and a full quick-tap run of the sequence still triggers the animation. If your easter egg (or any keyboard shortcut, really) involves two identical keys back-to-back, don't skip this check.

### The bug a real user found that automated testing missed

The key-repeat fix shipped, tests were green — and the feature still didn't work for a real visitor. The report: "I try the combination but nothing happens." The cause turned out to be the keyboard, not the code: on a Belgian AZERTY keyboard, the physical key printed **A** sits exactly where a QWERTY keyboard has **Q** (and vice-versa). The original implementation matched on [`event.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code), which reports the *physical position* of the key on a QWERTY reference layout — so pressing the keycap labeled "A" on an AZERTY keyboard produced `code: 'KeyQ'`, not `'KeyA'`. The user's own diagnosis nailed it: typing what looked like "B, Q" on their keyboard worked, because that physical position maps to `KeyA`.

The fix is to match on [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) instead — the actual character produced, which respects whatever layout the visitor has configured:

```jsx title="src/components/KonamiEasterEgg/index.js (excerpt)"
// event.code reflects the physical key position on a QWERTY reference
// layout, so on an AZERTY keyboard the key printed "A" reports 'KeyQ'.
// event.key reflects the actual character produced, which matches what
// players see printed on their own keycaps regardless of layout.
const normalizeKey = (key) => (key.length === 1 ? key.toLowerCase() : key);

// ...

const key = normalizeKey(event.key);
if (key === expectedKey) { /* ... */ }
```

Arrow keys were never affected — `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` are identical strings for both `.code` and `.key` on every layout. The bug only bit the two letter keys at the end of the sequence, and only for the roughly [15–20% of keyboards worldwide](https://en.wikipedia.org/wiki/Keyboard_layout) that aren't QWERTY.

<AlertBox variant="important" title="Lesson">
Our Playwright test caught the key-repeat regression because it dispatched real, sequential events — but it never caught the layout bug, because Playwright's virtual keyboard defaults to QWERTY. Automated tests validate the logic you thought to test; they don't replace a human with different hardware. If a feature involves typed input, `.key` is almost always the right choice over `.code` — reserve `.code` for cases where you deliberately want physical key position (game movement controls, for instance, where WASD should stay in the same physical spot regardless of layout).
</AlertBox>

## 4. Tab-away easter egg: title and favicon swap

Leave this tab and come back — the title changes to "Come back, the meerkat is on watch! 👀" and the favicon swaps to a dozing meerkat. Both revert the instant the tab regains focus:

<Snippet filename="src/theme/Root.js (excerpt)" source="./files/root-titlebar-egg.js" defaultOpen={true} />

The `visibilitychange` event and `document.hidden` are the standard way to detect this — no polling needed. `useBaseUrl` (a Docusaurus hook) resolves the favicon path correctly regardless of the site's configured base URL, the same helper used elsewhere on this site for image sources.

The sleeping favicon itself didn't exist yet when we built this — we generated it afterward with Gemini, using a prompt written to match the mascot's existing flat-vector style:

<AlertBox variant="info" title="Prompt used for the sleeping favicon">
"Flat vector cartoon illustration of a cute meerkat mascot, in the style of a simple app icon, cropped tightly to the character, centered, on a transparent background. Sleepy/dozing pose, eyes closed, small 'Z' above its head, sitting upright. Bold black outlines, warm orange and cream color palette, soft rounded shapes, big rounded ears, minimal detail so it stays readable at 32x32px. Square 512x512 canvas, character fills most of the frame with small margin."
</AlertBox>

The first pass at turning that image into a favicon was a straight `-trim` and `-resize 32x32` of the full sitting pose — and it was unusable: at 32px, a whole-body illustration collapses into an indistinct blob, unrecognizable as anything. The fix was to crop tightly to just the **face** (where the bold black outlines and the closed-eye expression live), then resize with a sharper filter and a touch of unsharp masking:

<Terminal title="user@machine: ~/blog" wrap={true}>
$ convert sleeping.webp -crop 620x620+200+150 +repage face_crop.png
$ convert face_crop.png -trim +repage -bordercolor none -border 4% face_trimmed.png
$ convert face_trimmed.png -filter Lanczos -resize 64x64 -unsharp 0x1 \
    -background none -gravity center -extent 64x64 favicon-sleeping.png
</Terminal>

<AlertBox variant="tip" title="Favicons are a different design problem than illustrations">
A full-body mascot pose reads fine at banner size but turns to mud at 32px. For a favicon, crop to the single most recognizable feature (usually the face) and lean on bold outlines and high contrast — detail that reads as "cute" at 512px just reads as noise at 32px. Bump the output to 48px or 64px if you can; modern browsers scale favicons down happily, and it buys real sharpness on high-DPI tab bars.
</AlertBox>

## 5. A wink in the HTTP headers

This one is invisible unless you check the Network tab or run `curl -I`. It lives in `nginx.conf`, right in the HTTPS server block:

<Snippet filename="nginx.conf" source="nginx.conf" defaultOpen={false} />

`add_header X-Powered-By "Meerkat-Sentry/1.0" always;` — a small, harmless header for anyone who inspects response headers out of habit.

## 6. Print stylesheet easter egg

Print an article (`Ctrl+P`) and a small footer note appears on the printed page:

<Snippet filename="src/css/custom.css (excerpt)" source="./files/print-easter-egg.css" defaultOpen={false} />

`@media print` only applies its rules when the browser is generating a print preview or an actual printout — it's invisible in the normal browsing experience, which is exactly the point.

## 7. Sitemap.xml gets a comment too

The least likely to ever be found, and the one that produced the most interesting bug. The idea: slip a small XML comment as the first child of `<urlset>` in the generated `sitemap.xml`. A comment there is valid XML and ignored by every sitemap parser and crawler, so it can't break indexing.

<Snippet filename="plugins/sitemap-easter-egg/index.mjs" source="plugins/sitemap-easter-egg/index.mjs" defaultOpen={true} />

Registered the same way as the [ASCII-art injector](/blog/docusaurus-ascii-art):

<Snippet filename="docusaurus.config.js (excerpt)" source="./files/docusaurus.config.js" defaultOpen={false} />

### The bug: postBuild hooks don't run in registration order

The first version of this plugin simply did `await fs.readFile(sitemapPath)` in its `postBuild` hook and failed every time with `ENOENT`. The assumption was that Docusaurus runs plugin `postBuild` hooks sequentially, in the order they're registered — so the official `@docusaurus/plugin-sitemap` (loaded via the classic preset, earlier in the pipeline) would always finish writing `sitemap.xml` before our plugin's `postBuild` even started.

That assumption is wrong. Docusaurus fires every plugin's `postBuild` hook concurrently. The build log made this obvious once we looked at it: our plugin's warning appeared **before** the sitemap plugin had written anything, interleaved with unrelated plugin output.

<AlertBox variant="important" title="If your plugin depends on another plugin's postBuild output">
Don't assume ordering. Poll for the file (or whatever state you depend on) with a short retry loop instead:
</AlertBox>

```js title="plugins/sitemap-easter-egg/index.mjs (excerpt)"
async function readWhenReady(filePath) {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT" || attempt === POLL_ATTEMPTS - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}
```

Fifteen attempts at 300ms apart — a 4.5-second budget — was more than enough in practice, and it degrades gracefully (a warning, not a build failure) if the file genuinely never shows up.

We validated the result wasn't just "probably fine" by parsing the generated `sitemap.xml` with Python's `xml.dom.minidom` after the build — a one-line sanity check that the injected comment didn't corrupt anything:

<Terminal title="user@machine: ~/blog">
$ python3 -c "import xml.dom.minidom as md; md.parse('build/sitemap.xml'); print('VALID XML')"
VALID XML
</Terminal>

## A silly bug an automated test caught (that eyeballing wouldn't have)

While browser-testing the Konami code fix with Playwright, we captured the console output to confirm the "accepted" message fired — and noticed the emoji rendering as a kangaroo (🦘) instead of the intended meerkat stand-in (🦫). The code used `\u{1F998}` — which is `U+1F998 KANGAROO` — instead of `\u{1F9AB}` (`U+1F9AB BEAVER`, the closest thing to a "meerkat" emoji Unicode actually offers). Three call sites had the same typo: the console wink, the Konami success message, and the print-stylesheet footer.

<AlertBox variant="note" title="Lesson">
Nobody proofreads raw `\u{...}` escapes by eye and catches a wrong codepoint — they look like noise. Printing the actual rendered string during testing (`console.log('\u{1F998}')` → 🦘, not 🦫) is what surfaced it. If you use numeric Unicode escapes in source instead of pasting the literal character, add a step — even a manual one — where you actually look at the rendered output before shipping.
</AlertBox>

## What we ended up with

<StepsCard
  variant="remember"
  title="The seven easter eggs"
  steps={[
    "**Console.log wink** — a styled message for anyone with DevTools open",
    "**Rotating 404 messages** — five random, mascot-flavored variants",
    "**Konami code** — `↑ ↑ ↓ ↓ ← → ← → B A` sends a meerkat running across the screen",
    "**Tab-away swap** — title and favicon change while the tab is hidden, and revert on return",
    "**X-Powered-By header** — a wink in the HTTP response headers",
    "**Print stylesheet** — a small footer note on printed pages",
    "**Sitemap.xml comment** — a hidden, XML-valid comment as the first child of `<urlset>`",
  ]}
/>

None of these change how a single reader reads a single article. That was the whole point — a blog's job is still to be read, not to perform tricks at the reader. But for the developers, the crawlers, the DevTools-curious, and the people who actually print articles or inspect response headers, there's now a little more personality hiding just under the surface. So cool no?

If you're running your own Docusaurus blog and have a mascot, a logo, or even just a favorite color: pick one or two of these — they're all small, self-contained, and none of them require touching your actual content. Start with the one that matches where your readers already are (DevTools console if your audience is developers, HTTP headers if it's other bloggers who poke at things, print CSS if people print your recipes or tutorials) and grow from there.
