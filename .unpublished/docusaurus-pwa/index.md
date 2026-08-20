---
slug: docusaurus-pwa
title: "From Browser Tab to Home Screen: Making a Docusaurus Blog Installable"
authors: [christophe, claude]
image: /img/v2/docusaurus_tips.webp
series: Discovering Docusaurus
mainTag: docusaurus
tags: [docusaurus]
date: 2026-09-01
description: Turn a Docusaurus blog into an installable Progressive Web App — a real home-screen icon, a web app manifest, a service worker, and a homepage that still loads with no network at all. Every file involved, and the reasoning behind each setting.
language: en
ai_assisted: true
draft: true
---

<!-- cspell:ignore webmanifest globIgnores swCustom Workbox LiteSpeed maskable -->

![From Browser Tab to Home Screen: Making a Docusaurus Blog Installable](/img/v2/docusaurus_tips.webp)

<TLDR>
This blog now installs like a real app: a home-screen icon, its own window with no browser
chrome, and a homepage that still loads with the network off. Getting there took a web app
manifest, a generated icon set, a service worker via the official `@docusaurus/plugin-pwa`, and
a handful of deliberate scoping decisions to keep the whole thing small and safe — nothing here
touches the write endpoints, and nothing ships more than a homepage's worth of data to a phone
that installs the app.
</TLDR>

On my phone, my own blog was just another browser tab. Same address bar, same back button, same
fate as every other tab I close without thinking twice about. Meanwhile, sites a fraction as
useful as mine were showing up with a proper icon on the home screen, launching in their own
window, still answering when the network dropped for a second in a tunnel or an elevator.

There was no reason my blog couldn't do the same. It's a static site — no user accounts, no
database, nothing dynamic that a service worker could get wrong. What follows is everything I
added to turn it into a real, installable Progressive Web App: the icon set, the manifest, the
service worker, and the small pieces of polish that make the whole thing actually discoverable.

<!-- truncate -->

## Proof First: Is It Actually a PWA?

Before touching any code, here's what "installable" means in practice — the same two requests
a browser makes before it will ever offer to install a site, run against this very blog:

<Terminal source="./files/pwa-check.txt" />

A manifest, served with the right content type. A service worker, present and reachable. That's
the entire technical bar a browser checks before it considers a site installable — everything
else in this article is either building those two files correctly, or making sure a visitor
actually notices they exist. On an Android phone, the result is an "avonture.be" icon on the
home screen that opens into its own window, no address bar in sight, and a homepage that still
renders with the phone in airplane mode.

## Why It Works

- **A browser only needs two things to consider a site installable**: a valid manifest (name,
  icons, a `start_url`, `display: "standalone"`) and a registered service worker that answers
  the network. Nothing about caching is required for installability itself — a service worker
  that does nothing at all still satisfies the check.
- **Two different name fields serve two different UI spots.** The manifest's `name` shows up in
  fuller contexts (an install confirmation dialog); `short_name` is what actually gets printed
  under the icon on the home screen, which is why it has a practical length limit.
- **An icon needs a safe zone, not just a size.** Android can mask a "maskable" icon into a
  circle, a squircle, or a rounded square depending on the launcher — artwork that fills the
  whole canvas gets its edges clipped. The fix is padding the artwork inward before shipping it,
  once, at build time.
- **Chrome no longer prompts to install on its own.** The automatic "Add to Home Screen" banner
  on Android was scaled back in favor of letting the site provide its own prompt — a site that
  only relies on the old automatic banner is, in practice, invisible as an installable app.
- **Caching is a choice, not a side effect of adding a service worker.** Everything a service
  worker touches here is deliberately scoped — this blog's 248 articles and their banner images
  add up to well over 100 MB, and none of that ships to a phone just because it installed the
  app.

## Step 1 — Generate a Real App Icon Set

Android wants at least a 192×192 and a 512×512 icon, plus a "maskable" variant with safe-zone
padding; iOS wants its own 180×180 with an opaque background. Hand-exporting four sizes every
time the mascot artwork changes is exactly the kind of thing worth scripting once.

This blog already had [sharp](https://sharp.pixelplumbing.com/) as a dependency (via
`@docusaurus/plugin-ideal-image`), so no new tool was needed — just a script that takes the
mascot artwork, pads it onto a square canvas, and writes out every size the platforms expect:

<Snippet
  filename="scripts/generate-pwa-icons.mjs"
  source="scripts/generate-pwa-icons.mjs"
  defaultOpen={false}
/>

Run once — and again any time the source artwork changes — with a plain `yarn` script:

<Terminal>
$ yarn pwa:icons

Wrote icon-192.png (192x192)
Wrote icon-512.png (512x512)
Wrote icon-maskable-512.png (512x512, content within 410x410 safe zone)
Wrote apple-touch-icon.png (180x180)
Icon set written to static/img/icons
</Terminal>

The output is committed straight into `static/img/icons/` — there's no build-time generation
step, so the icon set stays reviewable like any other asset in the repository.

## Step 2 — Write the Manifest, and Point Every Page at It

The manifest is a small JSON file describing the app: its two names, its start page, how it
should be displayed once launched, and the icon set from Step 1:

<Snippet
  filename="static/manifest.webmanifest"
  source="static/manifest.webmanifest"
  defaultOpen={true}
/>

`theme_color` is kept in sync with this blog's own Infima primary color (`--ifm-color-primary`
in `src/css/custom.css`) rather than an arbitrary hex value — it's what colors the Android
status bar once the app is installed.

A manifest sitting in `static/` does nothing on its own; a browser only finds it through a
`<link rel="manifest">` tag, which on this blog goes into `docusaurus.config.js`'s global
`headTags` array, alongside the tags that make each platform behave:

```js title="docusaurus.config.js"
headTags: [
  // Chrome only offers the install prompt once it finds a manifest with
  // name/short_name/start_url/display and an icon ≥ 192px.
  {
    tagName: "link",
    attributes: { rel: "manifest", href: "/manifest.webmanifest" },
  },
  // Safari never reads the manifest's icons at all — without this tag,
  // "Add to Home Screen" falls back to a screenshot thumbnail.
  {
    tagName: "link",
    attributes: {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/img/icons/apple-touch-icon.png",
    },
  },
  // Colors the Android status bar and task switcher to match the app.
  {
    tagName: "meta",
    attributes: { name: "theme-color", content: "#2e8555" },
  },
  // iOS ignores display: "standalone" from the manifest and needs its own
  // opt-in to open without Safari's browser chrome.
  {
    tagName: "meta",
    attributes: { name: "apple-mobile-web-app-capable", content: "yes" },
  },
  {
    tagName: "meta",
    attributes: { name: "apple-mobile-web-app-title", content: "avonture.be" },
  },
  // ...the rest of this blog's existing headTags
],
```

<AlertBox variant="note" title="iOS stays a second-class citizen">
Safari never shows an automatic install prompt — a visitor has to find "Add to Home Screen"
in the share sheet themselves. With the tags above in place, at least the icon and the title
they land on are correct. There's no way around the rest from the web app's side.
</AlertBox>

## Step 3 — Serve Both Files With the Right Headers

This blog's `static/` folder — the same place a `.htaccess` or `robots.txt` file
<Link to="/blog/docusaurus-docker-own-blog">already lives</Link> — is also where the manifest
and the icon set from Step 1 end up, copied verbatim into the build output. Two small
`.htaccess` corrections make the difference between "technically present" and "actually
working":

```apache title="static/.htaccess"
# Without this, Apache serves manifest.webmanifest as the generic
# application/octet-stream, and Chrome silently ignores a manifest whose
# Content-Type it doesn't recognize — no install prompt, no error either.
AddType application/manifest+json .webmanifest
```

The manifest also needs to be excluded from this blog's existing "cache forever" rule for
hashed static assets — its filename never changes, but its content can, so it belongs with the
other non-hashed files that are always revalidated:

```apache title="static/.htaccess"
<FilesMatch "\.(html|md|json|webmanifest)$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>
```

The service worker itself (`sw.js`, added in the next step) needs the exact same treatment, and
for the exact same reason — a fixed filename whose content changes on every deploy. Left under
the generic rule for `.js` files, it would get cached for a year, and a reader's installed app
would never learn about a new version:

```apache title="static/.htaccess"
<Files "sw.js">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
```

## Step 4 — Register a Service Worker

This is the second half of the installability check, and the part that makes a homepage
reachable with no network at all. Rather than hand-writing one, the official
`@docusaurus/plugin-pwa` — versioned to match `@docusaurus/core` — generates and registers it:

<Terminal>
$ yarn add @docusaurus/plugin-pwa
</Terminal>

```js title="docusaurus.config.js"
[
  "@docusaurus/plugin-pwa",
  {
    debug: false,

    // Offline behavior only activates for a reader who installed the app or
    // is running it standalone — a visitor just passing through the site
    // never pays for a runtime cache they didn't ask for.
    offlineModeActivationStrategies: ["appInstalled", "standalone"],

    // Scopes what gets cached at install time to the app shell only —
    // the homepage document, the manifest, and this blog's small
    // "Ask my blog" search index. Everything else (every article, every
    // banner image) is deliberately left out: this blog's 248 articles add
    // up to well over 100 MB, and none of that should ship to a phone just
    // because it installed the app.
    injectManifestConfig: {
      globIgnores: [
        "blog/**",
        "img/**",
        "assets/**",
        // ...every other top-level content directory
      ],
    },
  },
],
```

<AlertBox variant="important" title="Caching every article isn't the goal here">
This deliberately does **not** cache individual articles as a reader browses. Doing that
reliably — "the article I already read stays readable offline" — needs a proper runtime-caching
strategy, more machinery than a plugin config file, and a real answer to "how much storage is
this allowed to use on someone's phone". That's a project of its own, not a checkbox on this
one. What ships today is honest about its scope: the shell works offline, articles don't — yet.
</AlertBox>

The plugin's caching model is a strict allow-list — nothing that isn't explicitly kept ever gets
touched — so this blog's write endpoints (`api/reactions.php`, the backend behind
<Link to="/blog/docusaurus-reactions">the reactions widget</Link>, plus a typo-report and a
"tried it" endpoint) are safe by construction: they live outside the build output entirely, so
they can never end up in a cache manifest that only ever lists files the build actually
produced.

## Step 5 — Make Search Fail Honestly When Offline

This blog has two search entry points that fetch a build-time index over the network: full-text
search (Pagefind) and a "?" command-palette mode that searches a Q&A index. Both already had to
handle "the index isn't there yet" for local development, so extending that same code path to
also cover "the network just isn't there" was a small, natural addition — instead of silently
returning zero results (which reads as "nothing matches" rather than "search is unavailable"),
a failed fetch now shows an explicit "isn't available right now" message.

Small, but it matters: a search box that goes quiet without saying why is far more confusing
offline than a box that plainly says it can't reach its index right now.

## Step 6 — Make the Install Option Visible

Here's the part that's easy to miss until someone actually tries the finished result: since
Chrome no longer shows its install banner automatically, a manifest and a service worker being
technically correct doesn't mean anyone will ever see an install prompt. The site has to ask.

The fix is to listen for the browser's own `beforeinstallprompt` event, take control of it, and
show a small, dismissible pill instead of hoping Chrome's own (increasingly rare) banner shows
up on its own:

<Snippet
  filename="src/components/InstallPwaHint/index.js"
  source="src/components/InstallPwaHint/index.js"
  defaultOpen={false}
/>

Mounted once, alongside this blog's other always-present widgets (an old-post warning banner,
a command palette — see
<Link to="/blog/docusaurus-old-notice">how the old-post notice does the same kind of global
mount</Link> for the pattern):

```js title="src/theme/Layout/index.js"
import InstallPwaHint from "@site/src/components/InstallPwaHint";

export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      {props.children}
      {/* ...this blog's other global widgets... */}
      <InstallPwaHint />
    </Layout>
  );
}
```

It shows up once per browser, ever — the same "shown at most once" localStorage pattern this
blog already uses for its Ctrl+K search hint — and disappears the moment the reader installs
the app or dismisses it.

<AlertBox variant="tip" title="Chromium-only, by design">
`beforeinstallprompt` only exists on Chrome and Edge. Safari and Firefox never fire it, so this
pill simply never appears there — not a bug, just the current state of browser support for
this API.
</AlertBox>

## All Files at a Glance

| File | Role |
|---|---|
| `scripts/generate-pwa-icons.mjs` | Generates the icon set from the mascot artwork |
| `static/manifest.webmanifest` | The web app manifest |
| `static/img/icons/*.png` | The generated icon set (committed, not built) |
| `static/.htaccess` | MIME type + cache headers for the manifest and the service worker |
| `docusaurus.config.js` | `headTags` wiring + `@docusaurus/plugin-pwa` configuration |
| `src/components/InstallPwaHint/` | The custom install pill |
| `src/theme/Layout/index.js` | Where the install pill (and other global widgets) get mounted |

## Testing It on a Real Phone

The one check that actually matters happens on a phone, not in a browser's dev tools:

1. Visit the site on Chrome for Android.
2. Confirm the install pill from Step 6 shows up (or use Chrome's ⋮ menu → "Install app" as a
   manual fallback — proof the underlying manifest and service worker are valid, even without
   the pill).
3. Install it, then open the newly added home-screen icon: it should launch in its own window,
   no address bar.
4. Turn on airplane mode and relaunch the app from the home screen — the homepage should still
   render.

That last step is the one that actually validates the service worker rather than just the
manifest: a manifest alone gets you the icon and the standalone window, but only a working
service worker keeps the homepage answering with zero network.

## Under the Hood (skip this if you just want to use it)

**`globPatterns` looks configurable — it isn't.** `@docusaurus/plugin-pwa`'s own `postBuild`
step spreads the config object passed to it and then unconditionally re-sets `globPatterns` to
its own broad default (every `.js`/`.json`/`.css`/`.html` file, plus every image and font, in
the whole build output) afterwards — so passing a custom `globPatterns` is silently discarded.
`globIgnores`, used in Step 4, is the option that actually gets honored, which is why scoping
the precache means listing what to *exclude* rather than what to *include*.

**The maskable icon's safe zone is a practical convention, not a strict spec.** The generation
script scales the mascot artwork down to fit inside 80% of the canvas before compositing it
onto a full-size background — matching the same rule of thumb tools like Maskable.app use, not
a hard requirement enforced anywhere. Skip it and Android's circular mask can crop straight
through the artwork on some launchers.

**A stuck service worker is the one thing a redeploy can't fix by itself.** An installed app
keeps running whichever service worker it last activated until it notices `sw.js` changed byte
for byte — normally invisible, since the plugin ships a "New version available" reload prompt
for exactly that moment. If it ever needs a manual reset, DevTools → Application → Service
Workers → Unregister, plus Clear site data, is documented directly in this
site's `README.md` for whenever that comes up again.

## Conclusion

None of this needed a rewrite, a new backend, or even much new code — a manifest, a generated
icon set, one official plugin, and a handful of scoping decisions turned a plain browser tab
into something a reader can actually plant on their home screen. The two guardrails worth
remembering if you're doing this on your own Docusaurus blog: keep the service worker's cache
scoped to what it genuinely needs (a manifest and a service worker are all installability
requires — caching everything is a choice, and an expensive one to make by accident), and don't
assume a browser will advertise the feature for you. Chrome won't ask on its own anymore; your
site has to.

My blog now has an icon next to my other apps, launches in its own window, and still shows its
homepage the moment the network drops. That's a small thing to look at — and, for a site that's
just a folder of Markdown files and a build step, a surprisingly complete one to have earned.
