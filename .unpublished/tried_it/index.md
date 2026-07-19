---
slug: docusaurus-tried-it-widget
title: Adding a "Did It Work?" Button to Your Docusaurus Tutorials
authors: [christophe, claude]
image: /img/v2/docusaurus_like_button.webp
mainTag: docusaurus
tags: [docusaurus, php, react]
date: 2026-07-05
description: Build a "Did you try the steps in this article?" widget for tutorial posts — separate from a generic helpfulness vote, it tracks whether the actual commands still work, and emails you only when a tutorial's failure rate crosses a threshold. PHP backend, React component, an opt-out frontmatter switch, and the reasoning behind every one of those choices.
language: en
ai_assisted: true
blueskyRecordKey:
draft: true
---

<!-- cspell:ignore TriedIt didnt tried_it -->

![Adding a "Did It Work?" Button to Your Docusaurus Tutorials](/img/v2/docusaurus_like_button.webp)

<TLDR>
This article documents the `TriedIt` widget I added to this blog: a "Did you try the steps in this article? ✅ It worked! / ❌ Didn't work for me" button shown at the bottom of tutorial posts. It reuses the same JSON-on-a-server philosophy as my existing `Reaction` widget, but asks a narrower, more useful question — and instead of emailing me on every vote, it stays silent until a tutorial's failure rate crosses 30% with at least 10 votes, at which point it sends a single "this tutorial may be broken" alert. I also cover a decision I got wrong on the first pass: making the widget opt-in through frontmatter would have meant editing close to 300 existing posts, so I flipped it to opt-out instead.
</TLDR>

Like you know me well enough by now, I already have a `<Reaction>` widget asking "Was this article helpful?" at the bottom of every post. It works well for opinion pieces, retrospectives, and anything qualitative. But for tutorials — the Docker setups, the WSL configs, the copy-this-command-and-run-it posts — "helpful" isn't really the question that matters.

An article can be beautifully written, clearly explained, and still fail the moment a reader actually runs the commands. A flag gets renamed in a new version, an environment behaves slightly differently, a step I tested eighteen months ago quietly stops working. Tutorials rot in ways opinion pieces don't, and "helpful" won't tell me that's happening — a reader can find an article well-written and still not manage to reproduce it.

So I built a second, narrower widget: `TriedIt`. Same backend philosophy as `Reaction` — no database, no third-party service, just a JSON file and a PHP script — but it asks a functional question instead of a qualitative one, and it only emails me when there's an actual signal worth acting on.

<!-- truncate -->

## The Big Picture

```text
Browser                          Your Server
  │                                   │
  ├─ GET /api/tried-it.php?slug=...   ─▶  tried-it-data.json (read)
  │◀─ { worked: 34, didnt_work: 7 }   ─┤
  │                                   │
  ├─ POST /api/tried-it.php           ─▶  tried-it-data.json (write)
  │  { slug, vote }                   │   + alert email IF failure ratio > 30%
  │◀─ { worked: 35, didnt_work: 7 }   ─┤
  │                                   │
  └─ GET /api/tried-it.php?admin=...  ─▶  tried-it-data.json (full dump)
```

**Four files are involved:**

| File | Role |
| --- | --- |
| `api/tried-it.php` | PHP backend: stores `worked` / `didnt_work` votes, sends alert emails |
| `src/components/TriedIt/index.js` | React widget shown on tutorial posts |
| `src/components/TriedIt/styles.module.css` | CSS module for the widget |
| `src/theme/BlogPostItem/index.js` | Already-swizzled component, extended with one import and one conditional line |

Two JSON files are created at runtime by the backend:

- `api/tried-it-data.json` — the vote store, one entry per article slug
- `api/tried-it-notifications.json` — alert throttle timestamps, kept in its **own** file so `TriedIt` never touches `Reaction`'s `notifications.json`

## Why Not Just Reuse `<Reaction>`?

Because the two widgets measure different things, even though they look almost identical on the surface:

| Aspect | `Reaction` | `TriedIt` |
| --- | --- | --- |
| Question | Is the article globally useful? | Do the commands/steps actually work? |
| Nature | Qualitative | Functional / reproducible |
| Shown on | Every article | Tutorials only |
| Email trigger | Every vote (throttled hourly) | Only when the failure ratio crosses a threshold (throttled for 6 hours) |

A reader can vote "helpful" on a tutorial and still have failed to reproduce step 4 — the article taught them something even though the exact commands didn't work on their machine. Conflating the two signals would have made both less useful. Two small, single-purpose widgets beat one confusing one.

## Step 1 — The PHP Backend

`api/tried-it.php` is a near-clone of `api/reactions.php` for the boilerplate (CORS, file locking, slug sanitization) and diverges in exactly two places: the vote values, and the notification logic.

### 1.1 — Configuration

```php title="api/tried-it.php"
define('ADMIN_EMAIL',             $_envVars['ADMIN_EMAIL'] ?? '');
define('ADMIN_TOKEN',             $_envVars['ADMIN_TOKEN'] ?? '');
define('NOTIFY_COOLDOWN_SECONDS', 21600); // 6h — minimum gap between alert emails per article
define('ALERT_MIN_VOTES',         10);    // minimum votes before the failure ratio is meaningful
define('ALERT_FAILURE_RATIO',     0.30);  // send an alert once didn't-work votes exceed this share
define('SITE_URL',                'https://www.avonture.be');
```

Two new constants show up that `reactions.php` doesn't have:

- **`ALERT_MIN_VOTES`** — below this many total votes, a failure ratio is just noise. Three failures out of four votes is 75%, but it's also nothing to act on yet.
- **`ALERT_FAILURE_RATIO`** — the share of `didnt_work` votes that has to be exceeded before an alert is worth sending. I picked 30% as a starting point: enough to filter out the occasional "I fat-fingered a command" vote, low enough to catch a genuinely broken tutorial early.

`NOTIFY_COOLDOWN_SECONDS` is also six times longer than `reactions.php`'s (6 hours instead of 1). `Reaction` notifies on every vote, so a short cooldown just avoids spam during a traffic spike. `TriedIt` only notifies when something is *already* wrong — there's no reason to re-notify every few minutes while the ratio stays bad.

Configuration is read from the same `api/.env` file as every other script here (`ADMIN_EMAIL`, `ADMIN_TOKEN`), so there's nothing new to provision if `reactions.php` or `typo.php` are already deployed.

### 1.2 — CORS, helpers, and everything else that didn't change

The CORS block, `loadData()`, `saveData()`, `sanitizeSlug()`, and `jsonError()` are copied verbatim from `reactions.php`. I won't re-explain them here — see the [Reader Reactions article](/blog/reactions) if you want the line-by-line breakdown of file locking and CORS validation. The short version: `flock(LOCK_EX)` prevents two simultaneous votes from corrupting the JSON file, and the origin check rejects anything that isn't `SITE_URL` or `http://localhost:3000`.

### 1.3 — The alert function: only speak up when it matters

This is the one function that's genuinely new:

```php title="api/tried-it.php"
function maybeAlert(string $slug, array $counts): void
{
    $total = $counts['worked'] + $counts['didnt_work'];
    if ($total < ALERT_MIN_VOTES) {
        return;
    }

    $failureRatio = $counts['didnt_work'] / $total;
    if ($failureRatio <= ALERT_FAILURE_RATIO) {
        return;
    }

    $throttleFile = __DIR__ . '/tried-it-notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl  = SITE_URL . '/' . $slug;
    $successRate = round((1 - $failureRatio) * 100);

    $subject = "[Blog] \xE2\x9A\xA0\xEF\xB8\x8F Tutorial may be broken: $slug";
    $body    = implode("\n", [
        "Readers are struggling to reproduce the steps in one of your tutorials.",
        "",
        "Article      : $articleUrl",
        "Success rate : {$successRate}% ({$counts['didnt_work']} failures out of $total attempts)",
        "",
        "Consider reviewing the steps.",
    ]);
    // ...headers and mail() call, identical pattern to reactions.php
}
```

Three early returns, three guards, in order:

1. **Not enough data yet.** Fewer than `ALERT_MIN_VOTES` total votes and the function does nothing.
2. **Not failing badly enough.** The failure ratio is at or below `ALERT_FAILURE_RATIO` and the function does nothing.
3. **Already alerted recently.** An email for this exact slug went out less than `NOTIFY_COOLDOWN_SECONDS` ago and the function does nothing.

Only when all three guards pass does an email actually go out, and the subject line's `\xE2\x9A\xA0\xEF\xB8\x8F` is just the UTF-8 byte sequence for the ⚠️ emoji — spelled out as escaped bytes rather than typed directly, so the PHP file stays plain ASCII and doesn't depend on the editor or the filesystem preserving a multi-byte character correctly.

<AlertBox variant="tip" title="Why 30% and not, say, 10%?">
A lower threshold would catch problems earlier but also flag tutorials over normal noise — readers who skipped a prerequisite, ran the wrong OS, or simply misread a step. 30% is a deliberate starting guess, not a measured number; if it turns out to be too sensitive (or not sensitive enough) once real votes come in, it's a one-line constant to change.
</AlertBox>

### 1.4 — Routing: GET and POST

Same shape as `reactions.php`, with `worked` / `didnt_work` instead of `helpful` / `not_helpful`:

```php title="api/tried-it.php"
if ($method === 'POST') {
    if ($vote === 'worked') {
        $data[$slug]['worked']++;
    } elseif ($vote === 'didnt_work') {
        $data[$slug]['didnt_work']++;
    } else {
        jsonError(400, 'Invalid vote value');
    }
    saveData($dataFile, $data);
    maybeAlert($slug, $data[$slug]);
}
```

Note that `maybeAlert()` runs on *every* POST, not just failures — it needs the full picture (`worked` + `didnt_work`) to compute a ratio, and its own guards decide whether that's worth acting on.

### 1.5 — The complete file

<Snippet filename="api/tried-it.php" source="api/tried-it.php" defaultOpen={false} />

---

## Step 2 — The React Component

`src/components/TriedIt/index.js` follows the exact same shape as `Reaction`: read `localStorage` on mount, fetch the current counts, POST a vote on click.

### 2.1 — Identity and avoiding a hydration mismatch

```javascript title="src/components/TriedIt/index.js"
const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
const apiUrl = `${siteConfig.url}/api/tried-it.php`;
const storageKey = `tried_it_${slug}`;

const [counts, setCounts] = useState(null);
// null until the client-side effect runs — avoids SSR/hydration mismatch (#418).
const [voted, setVoted] = useState(null);

useEffect(() => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) setVoted(stored);
  } catch {}
}, [storageKey]);
```

Docusaurus pre-renders pages on the server, where `localStorage` doesn't exist. If `voted` were initialized straight from `localStorage.getItem(...)` inside `useState`, the server-rendered markup would always show the "not voted yet" state, while the client's first render could immediately show the "thanks" state — a genuine mismatch between what the server sent and what React expects to find, which Docusaurus's build previously flagged. Starting `voted` at `null` and only reading `localStorage` inside a `useEffect` (which only ever runs in the browser) sidesteps the problem entirely: the very first client render matches the server's output, and the "already voted" state is applied a beat later, after hydration completes.

### 2.2 — Fetching counts, sending a vote

Unchanged in spirit from `Reaction`:

```javascript title="src/components/TriedIt/index.js"
useEffect(() => {
  if (!slug) return;
  fetch(`${apiUrl}?slug=${encodeURIComponent(slug)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => { if (data) setCounts(data); })
    .catch(() => {});
}, [slug, apiUrl]);

const handleVote = useCallback(async (vote) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, vote }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setCounts(data);
    setVoted(vote);
    try { localStorage.setItem(storageKey, vote); } catch {}
  } catch {}
}, [slug, apiUrl, storageKey]);
```

Both fetches fail silently (`catch(() => {})`). If the network is down or the endpoint isn't reachable, the widget just stays in its current state rather than showing an error — for a low-stakes vote button, silent degradation is the right call.

### 2.3 — Rendering

```javascript title="src/components/TriedIt/index.js"
{!voted ? (
  <>
    <span className={styles.question}>Did you try the steps in this article?</span>
    <div className={styles.buttons}>
      <button onClick={() => handleVote("worked")} aria-label="Yes, I tried this and it worked">
        ✅ It worked!
      </button>
      <button onClick={() => handleVote("didnt_work")} aria-label="No, it didn't work for me">
        ❌ Didn't work for me
      </button>
    </div>
  </>
) : (
  <div className={styles.thanks}>
    <span>{voted === "worked" ? "Awesome, glad it worked! 🎉" : "Thanks for letting us know!"}</span>
    {counts && (
      <span className={styles.counts}>
        <span title={`${counts.worked} readers had it work`}>✅ {counts.worked}</span>
        <span title={`${counts.didnt_work} readers could not reproduce it`}>❌ {counts.didnt_work}</span>
      </span>
    )}
  </div>
)}
```

The wording is deliberately specific — "Did you try the steps in this article?" rather than a generic "Rate this post" — because the whole point of the widget is to ask about reproducibility, not opinion.

### 2.4 — The complete file

<Snippet filename="src/components/TriedIt/index.js" source="src/components/TriedIt/index.js" defaultOpen={false} />

---

## Step 3 — The CSS Module

`src/components/TriedIt/styles.module.css` is, on purpose, almost byte-for-byte identical to `Reaction`'s stylesheet — same flex container, same button treatment, same use of `--ifm-*` custom properties so the widget adapts to light mode, dark mode, or a custom Docusaurus theme without a single media query. A second flex-row-with-two-buttons widget didn't need a new design language; readers shouldn't be able to tell, visually, that these are two different components.

<Snippet filename="src/components/TriedIt/styles.module.css" source="src/components/TriedIt/styles.module.css" defaultOpen={false} />

---

## Step 4 — Wiring It Into the Existing Swizzle

`src/theme/BlogPostItem/index.js` was already swizzled on this blog — `Reaction`, `TypoReport`, and a few other components already inject themselves there. Adding `TriedIt` meant touching exactly two lines: one import, one conditional render.

```javascript title="src/theme/BlogPostItem/index.js" {2,7}
import Reaction from "@site/src/components/Reaction";
import TriedIt from "@site/src/components/TriedIt";
import TypoReport from "@site/src/components/TypoReport";
// ...
{isBlogPostPage && (
  <>
    <TypoReport metadata={metadata} />
    <Reaction metadata={metadata} />
    {frontMatter.tried_it !== false && <TriedIt metadata={metadata} />}
    <Bluesky metadata={metadata} />
    <RelatedPosts count="6" description="false" />
  </>
)}
```

The `frontMatter.tried_it !== false` condition is the interesting part — and it wasn't what I shipped first.

## Step 5 — From Opt-In to Opt-Out

My first pass gated the widget behind `frontMatter.tried_it && <TriedIt ... />` — the widget would only show up on a post that explicitly declared `tried_it: true`. That felt safe: nothing changes on any existing post until I say so.

Except this blog has close to 300 published articles. Making the widget opt-in meant I'd have to go back and edit every single tutorial's frontmatter, one file at a time, to turn the feature on where it actually belonged. For a feature whose entire pitch is "show this on tutorials," that's a lot of manual toil for something that should mostly be the default.

So I flipped the condition to `frontMatter.tried_it !== false`. The widget now shows by default on every post; a specific article opts *out* with:

```yaml
tried_it: false
```

That inverts the editing burden completely: instead of adding a field to ~290 tutorial posts, I only need to add one to the handful of posts where "did you try the steps" genuinely doesn't apply — welcome posts, New Year greetings, retrospectives, curated roundups, that kind of thing.

To find those, I scanned every post's title and description for non-procedural signals (no "Learn how to...", no "Install...", no "Step by step", but plenty of "my favorite," "how I built," or a title that's just a name and no verb). Out of roughly 235 posts, seven came back as genuine candidates for `tried_it: false` — two with high confidence (a "Welcome" post and a "Happy New Year" post have no steps to try at all), and five more borderline ones (a behind-the-scenes post about how this blog's own images were generated, a curated list of favorite Quarto extensions, a first-impressions OS review, an architecture case study, and a celebratory tool announcement written in a personal, non-procedural tone).

<AlertBox variant="note" title="Opt-out only works because the majority is procedural">
This trade-off is specific to a tutorial-heavy blog. If most of your posts were essays or announcements, opt-in would be the right default — you'd be editing the minority either way, so you might as well edit the one that keeps the widget off by default. The right default is whichever list is shorter.
</AlertBox>

## No Dashboard (Yet)

`Reaction` ships with an admin dashboard (`/reactions-dashboard`) that reads the `?admin=<token>` endpoint and renders a sortable table with approval bars. `tried-it.php` exposes the exact same `?admin=<token>` endpoint — the data is already there — but I haven't built the dashboard page for it yet. For now, checking the numbers means calling the admin endpoint directly:

```bash
curl "https://www.avonture.be/api/tried-it.php?admin=YOUR_ADMIN_TOKEN"
```

Since the endpoint shape already matches `reactions.php`'s, a `tried-it-dashboard.js` page would mostly be a copy-paste-and-rename job of the existing one. I'm leaving it out until I actually have enough votes to make a dashboard worth looking at.

---

## Security Considerations

Nothing here is new compared to `Reaction` — same threat model, same mitigations:

**`ADMIN_TOKEN` gates the full data dump.** Anyone with the token can read every vote ever recorded for every article. Generate a long random one with `openssl rand -base64 32` and keep it out of version control (it lives in `api/.env`, which is gitignored).

**The two new JSON files must not be publicly downloadable.** `api/.htaccess` already blocks direct access to `reactions-data.json`, `notifications.json`, `typo-data.json`, and friends — I added `tried-it-data.json` and `tried-it-notifications.json` to the same `<FilesMatch>` block:

```apacheconf title="api/.htaccess"
<FilesMatch "^(reactions-data\.json|notifications\.json|typo-data\.json|typo-ratelimit\.json|typo-notifications\.json|tried-it-data\.json|tried-it-notifications\.json|README\.md)$">
    Require all denied
</FilesMatch>
```

**No voter authentication.** Anyone who can reach the endpoint from an allowed origin can POST a vote. `localStorage` prevents accidental double-voting from the same browser, nothing more. For a personal blog, that's an acceptable trade-off — the goal is a rough signal, not a tamper-proof poll.

**File permissions.** `api/tried-it-data.json` and `api/tried-it-notifications.json` need to be writable by the web server user, same as the `Reaction` and typo-report data files.

---

## Testing It Locally — the one gotcha that isn't obvious

Getting the widget to *render* locally is easy. Getting it to actually *talk to the backend* locally is where I tripped, so it's worth spelling out.

**1. The widget only renders where enabled.** With the opt-out default, it now shows on every post unless `tried_it: false` is set — so a plain `npm run build` (or `npm start`) is enough to see it appear on any tutorial.

**2. `npm run serve` doesn't recompile.** It only serves whatever is already in `build/`. Any frontmatter or code change needs a fresh `npm run build` first (or use `npm start` for hot reload while iterating).

**3. The API URL is always the production one.** The component builds its endpoint from `siteConfig.url`, which is `https://www.avonture.be` in `docusaurus.config.js` — not `localhost`, regardless of how you're serving the site locally. That means:

- Clicking a vote button locally sends a real request to the production `tried-it.php` — which will silently fail (swallowed by `catch(() => {})`) until that file is actually deployed there.
- Once deployed, local testing genuinely exercises the real backend — useful, but worth knowing before you wonder why nothing happens on click.

To exercise the PHP logic in isolation, without touching production and without deploying first:

```bash
php -S localhost:8888 -t api
curl -X POST http://localhost:8888/tried-it.php \
  -H "Content-Type: application/json" \
  -d '{"slug":"blog/test-post","vote":"worked"}'
curl "http://localhost:8888/tried-it.php?slug=blog/test-post"
```

That validates the counting and alert-threshold logic directly, no frontend or CORS involved.

<AlertBox variant="info" title="Why not point apiUrl at localhost automatically?">
It's tempting to branch on `process.env.NODE_ENV` and swap in a local API URL during development. I didn't, on purpose: the whole point of `siteConfig.url` is that the component behaves identically regardless of environment, and a self-hosted PHP script is cheap enough to just deploy early and test against the real thing.
</AlertBox>

---

## All Files at a Glance

<ProjectSetup folderName="TriedIt widget">
  <Snippet filename="api/tried-it.php" source="api/tried-it.php" defaultOpen={false} />
  <Snippet filename="src/components/TriedIt/index.js" source="src/components/TriedIt/index.js" defaultOpen={false} />
  <Snippet filename="src/components/TriedIt/styles.module.css" source="src/components/TriedIt/styles.module.css" defaultOpen={false} />
  <Snippet filename="src/theme/BlogPostItem/index.js" source="src/theme/BlogPostItem/index.js" defaultOpen={false} />
</ProjectSetup>

---

## Conclusion

`TriedIt` is a small feature — one PHP file, one component, one CSS module, two lines in an already-swizzled theme file — but the interesting part was never the code. It was realizing that "helpful" and "it worked" are two different questions, and that a widget answering the wrong one would have quietly collected data I didn't actually need. The opt-in-to-opt-out flip was the same lesson from a different angle: the right default isn't the safest-looking one, it's the one that matches how the majority of your content actually reads. If you're building something similar and it only applies to a subset of your posts, count both lists — the minority you'd have to tag either way — before picking a default.
