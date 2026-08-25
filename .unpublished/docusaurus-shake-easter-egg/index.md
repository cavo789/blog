---
slug: docusaurus-shake-easter-egg
title: "Shake Your Phone, Startle the Meerkat"
authors: [christophe, claude]
image: /img/v2/easter_eggs.webp
mainTag: docusaurus
tags: [docusaurus, react, component]
date: 2026-09-08
description: "A ninth easter egg for this blog, built for readers on a phone: shake it — in Chrome or in the installed PWA — and the meerkat mascot takes over the full screen, startled, for about two seconds. Covers the devicemotion 'jerk' math behind shake detection, the three-phase overlay animation, how to test it from a desktop DevTools console with no accelerometer at all, and a real bug caught along the way — an AI image generator that drew a transparent-background placeholder as literal opaque pixels instead of real alpha."
language: en
ai_assisted: true
draft: true
series: Creating Docusaurus components
---

<!-- cspell:ignore devicemotion accelerationIncludingGravity avonture RGBA meerkat's -->

![Shake Your Phone, Startle the Meerkat](/img/v2/easter_eggs.webp)

<TLDR>
This blog already hides [eight small easter eggs](/blog/docusaurus-easter-eggs), but every one of them assumes a keyboard or an open DevTools panel — no use to a reader on a phone. This adds a ninth: shake the phone and the mascot appears full-screen, startled, for about two seconds. Covers the shake-detection math (a "jerk" threshold computed between consecutive `devicemotion` samples), the three-phase overlay animation (pop in, tremble, fade out), how to trigger and test it from a desktop DevTools console with no accelerometer involved, and a real bug caught along the way: an AI image generator that drew the checkerboard pattern used to *represent* transparency as literal opaque pixels, caught by reading the raw PNG bytes rather than trusting a preview. Android only for now — iOS Safari's motion-permission prompt needs a tap and is left for a follow-up article.
</TLDR>

Every easter egg on this blog so far assumes a keyboard: <kbd>CTRL</kbd>+<kbd>U</kbd> to view source, a ten-key Konami sequence, a `console.log` that only shows up with DevTools open. All reasonable on a laptop — and invisible to anyone reading on a phone, which on a technical blog is still a meaningful share of the traffic. A phone has no arrow keys, but it has something a laptop doesn't: an accelerometer, sitting one `window.addEventListener("devicemotion", …)` away, on any page served over HTTPS.

So: shake the phone, and the mascot reacts.

<!-- truncate -->

## Shake Your Phone, See What Happens

Visit this blog on Android — in Chrome, or in the installed PWA — and give the phone a real shake. This is what shows up, full screen, for about two seconds:

<BrowserWindow url="https://www.avonture.be/">
  ![A startled meerkat filling the screen after a phone shake](./images/shake_overlay.webp)
</BrowserWindow>

No page reload, nothing to opt into first — the phone's own motion sensor did all the work. Here's how little code that actually takes.

<AlertBox variant="tip" title="Nothing happening when you shake?">
Check that this site is allowed to read **Motion sensors** — tap the icon left of the address bar → Permissions. Chrome for Android can silently block this per site; see [How to Debug If the Shake Does Nothing](#how-to-debug-if-the-shake-does-nothing) below.
</AlertBox>

## Why It Works

- **Shake detection needs one number, not three.** A `devicemotion` event reports acceleration on three axes (x, y, z); comparing each to a threshold barely works, because ordinary handling already wobbles all three constantly. What actually marks a deliberate shake is *how fast* those three numbers change between two consecutive readings — summed across axes and normalized by the time between samples, that collapses to a single "jerk" value with one clean threshold to tune.
- **Android has no `requestPermission()` prompt; iOS does.** iOS Safari 13+ requires an explicit `DeviceMotionEvent.requestPermission()` call tied to a tap — it cannot be requested proactively on page load — so this version ships Android-only on purpose; the iOS permission flow is a follow-up. Android's story turned out to have its own wrinkle, covered in [How to Debug If the Shake Does Nothing](#how-to-debug-if-the-shake-does-nothing).
- **A cooldown, not a boolean flag, stops the retrigger.** The overlay stays on screen for over two seconds; without a minimum gap between triggers, the tail end of the same shake gesture would relaunch it immediately. Comparing timestamps is simpler than a lock, and it can't get stuck "on" if a cleanup step is ever skipped.
- **It's one component, mounted once, globally** — [the same pattern already used for the Konami code and the tab-away favicon swap](/blog/docusaurus-easter-eggs): no new route, no per-page wiring, one more line in `Root.js`.
- **The haptic buzz is a bonus, not a requirement.** A short `navigator.vibrate()` call adds a physical "yelp" alongside the visual one — and on browsers that silently ignore it outside a user gesture (which a sensor event isn't), the easter egg still works fine, just without the buzz.

## Installation

The whole thing is two files plus one import. Given a transparent-background image of the mascot looking startled — more on how that image was actually produced, and the mistake that nearly shipped, in [Under the Hood](#under-the-hood-skip-this-if-you-just-want-to-use-it) below — the detection and the overlay live entirely in `index.js`:

<Snippet filename="src/components/ShakeEasterEgg/index.js" source="src/components/ShakeEasterEgg/index.js" />

And the full-screen overlay, its pop-in/tremble/fade animation, and the `prefers-reduced-motion` fallback live in the CSS module:

<Snippet filename="src/components/ShakeEasterEgg/styles.module.css" source="src/components/ShakeEasterEgg/styles.module.css" defaultOpen={false} />

Mounted once, globally, from `src/theme/Root.js` — right next to the Konami code component it borrows its shape from:

```jsx title="src/theme/Root.js (excerpt)"
import ShakeEasterEgg from "@site/src/components/ShakeEasterEgg";

// ...

return (
  <>
    {children}
    <KonamiEasterEgg />
    <ShakeEasterEgg />
  </>
);
```

That's it — no new route, no config flag, no build step.

## Testing It Without Shaking Anything

Standing up from a desk to physically shake a phone, twenty times in a row, to check a CSS timing tweak, gets old fast. `devicemotion` is just an event — nothing stops sending one synthetically from a browser console, on desktop, with no sensor anywhere in the loop:

<Snippet filename="Paste in DevTools console" source="./files/test-shake-in-console.js" defaultOpen={false} />

Two calls, 150 ms apart, with a large enough jump between the two acceleration readings to cross the jerk threshold — that's the entire "physical" gesture, reduced to two numbers. This is also, honestly, how the screenshot above was produced: a headless browser, a mobile viewport, and this exact snippet dispatched through the page — not a real phone.

## How to Debug If the Shake Does Nothing

Two checks, in order — both take under a minute and neither requires touching the code.

### 1. Allow Motion sensors for the site

Chrome for Android has its own per-site **Motion sensors** permission, separate from anything this component controls. Tap the icon left of the address bar (padlock, "i", or a warning triangle if the certificate is self-signed) → **Permissions** → make sure **Motion sensors** is set to *Allow*, not *Block*. If it's not listed there, check **Chrome ⋮ → Settings → Site settings → Motion sensors** for a global block instead. Reload the page after changing it — this alone was the fix the one real device this was tested on needed.

### 2. Watch the raw sensor data

When step 1 doesn't explain it, a small standalone diagnostic page settles the rest — no build step, no remote DevTools setup, just live numbers on the phone's own screen:

<Snippet filename="static/shake-debug.html" source="static/shake-debug.html" defaultOpen={false} />

Visit `/shake-debug.html` on the same origin as the rest of the site and it reports, live: whether `DeviceMotionEvent` exists at all, `navigator.permissions.query({ name: "accelerometer" })`'s state (`"granted"` / `"denied"` / `"prompt"`), a running count of events received, the live `x`/`y`/`z` readings, and the computed jerk value against the current threshold. Three distinct failure signatures to read off it:

- **No events at all, count stuck at 0** — the browser or OS is blocking the sensor entirely, or `DeviceMotionEvent` isn't supported (iOS without the permission flow, see the limitation above).
- **Events arrive, but `x`/`y`/`z` stay `null`** — this is the Motion sensors permission from step 1, confirmed: the browser fires the event out of habit but withholds the data.
- **Real numbers, but the max jerk never crosses the threshold** — not a bug, just a threshold calibrated for a different hand; see the tuning note below.

This is also, worth admitting plainly, how the bug in step 1 was actually found in the first place: the shake did nothing on a real phone, this page showed events climbing with `x`/`y`/`z` stuck at `null`, and the permission query spelled out exactly why in one word — `"denied"`.

## Under the Hood (skip this if you just want to use it)

### The image was the hard part, not the code

The component itself came together in one pass. Getting a **real** transparent-background image of a startled meerkat took three tries — and the failure is worth knowing about if you're generating art with an AI image tool for anything that needs to composite over other content.

The site's mascot art is [generated with Google Gemini](/blog/gemini-meerkat), feeding an existing reference image so new poses stay visually consistent. The first two attempts, asked for a "transparent background," came back as JPEG and WebP files that *looked* transparent in a preview — right up until the gray-and-white checkerboard pattern used by every image editor to *represent* transparency turned out to be drawn as literal, opaque pixels. The model had taken the on-screen convention for "nothing here" and painted it as if it were part of the scene.

Two format facts made this easy to catch for certain, rather than guess from a preview:

- JPEG cannot store transparency at all, structurally — no amount of re-exporting fixes that.
- A WebP or PNG file can carry an alpha channel, but doesn't have to. PNG stores this as one byte in its `IHDR` chunk: `6` means RGBA with a real alpha channel, `2` means plain RGB with none. Reading that byte — or just sampling a corner pixel and checking whether its alpha is actually `0` — settles the question without opening an editor.

Both checks came back negative on the first two attempts: no alpha channel, full opacity, a checkerboard baked in as pixels. Asking Gemini to export as PNG specifically, with a one-line warning not to render the transparency convention as content, produced a file that finally passed both checks — corners at alpha `0`, character fully opaque, verified pixel by pixel rather than by eye.

### Tuning the jerk threshold on a real phone

The first value shipped for `SHAKE_JERK_THRESHOLD` (`28`) was picked by feel, with a note admitting it hadn't been measured on a physical device. It didn't survive first contact with one: on a real Android phone, a quick *tilt* — no shaking involved — was already enough to cross it. Raising it to `60` made a deliberate shake necessary, which is the whole point of a shake-triggered egg. There's no formula that gets this right from a desk; a "jerk" threshold has to be walked up against a real accelerometer, on a real phone, until a quick tilt stops firing it and an actual shake still does.

## Conclusion

A ninth easter egg, and the first one this blog built for a phone rather than a keyboard: shake detection reduced to one "jerk" number, a full-screen overlay that respects `prefers-reduced-motion` and a tap to dismiss, and a way to test all of it without leaving a desk. The real lesson wasn't in the shake-detection code — it was in not trusting an image preview: a file can *look* transparent and still be fully opaque, and the only way to know for sure is to check the bytes.

iOS is deliberately out of scope here — `DeviceMotionEvent.requestPermission()` needs its own tap-triggered flow, and that's a follow-up once this one has had a chance to run on Android for a while. If you're running your own Docusaurus blog with a mascot of its own, the [Konami code and tab-away favicon swap](/blog/docusaurus-easter-eggs) are the desktop-side siblings of this one — same "mount once in `Root.js`" shape, no sensor required.

<StepsCard
  variant="remember"
  title="What to tune"
  steps={[
    "**`SHAKE_JERK_THRESHOLD`** (default `60`, raised from an initial `28` that fired on a mere tilt) — raise it further if the egg still fires too easily, lower it if a deliberate shake does nothing",
    "**`COOLDOWN_MS`** (default `4000`) — minimum time between two triggers",
    "**`VISIBLE_DURATION_MS`** (default `2200`) / **`EXIT_DURATION_MS`** (default `250`) — how long the overlay stays up and how fast it fades; keep the CSS `overlay-out` duration in sync with the latter",
    "All four live at the top of `src/components/ShakeEasterEgg/index.js`",
  ]}
/>
