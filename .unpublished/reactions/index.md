---
slug: docusaurus-reactions
title: Adding Reader Reactions to Your Docusaurus Blog
authors: [christophe]
image: /img/v2/docusaurus_like_button.webp
mainTag: docusaurus
tags: [docusaurus, php, react]
date: 2026-12-31
description: Build a fully working "Was this article helpful?" widget for your Docusaurus blog. Step-by-step guide covering the PHP backend, React component, CSS module, Docusaurus swizzle, and an admin dashboard — everything you need to reproduce it from scratch.
draft: true
language: en
title: Adding Reader Reactions to Your Docusaurus Blog
slug: reactions
authors: [christophe]
ai_assisted: true
blueskyRecordKey:
---

![Adding Reader Reactions to Your Docusaurus Blog](/img/v2/docusaurus_like_button.webp)

<TLDR>
This guide walks through building a "Was this article helpful?" widget for a Docusaurus blog — from scratch, end to end. You will create a lightweight PHP script that stores votes in a JSON file and sends throttled email notifications, a React component that reads and writes those votes, a CSS module that blends seamlessly with any Docusaurus theme, and a swizzle of `BlogPostItem` to inject the widget at the bottom of every post. A bonus admin dashboard page lets you monitor approval rates across all articles at a glance.
</TLDR>

Reader feedback is one of those things that looks simple from the outside but hides a surprising amount of moving parts once you start building it. I wanted something unobtrusive — no third-party services, no cookies, no sign-up required. Just a small "Was this article helpful?" widget at the bottom of every post, a JSON file on the server, and an email in my inbox when a reader votes.

What followed was a self-contained system: a 160-line PHP backend, a React component, a CSS module, and a single swizzle. Everything lives in your own repository and under your own hosting. No external dependencies, no privacy implications, no recurring costs.

In this article I'll walk you through every file, every decision, and every line that matters — so you can reproduce it on your own Docusaurus blog and adapt it to your needs.

<!-- truncate -->

## The Big Picture

Before diving in, here is what we are going to build and how the pieces fit together:

```
Browser                          Your Server
  │                                   │
  ├─ GET /api/reactions.php?slug=...  ─▶  reactions-data.json (read)
  │◀─ { helpful: 12, not_helpful: 3 } ─┤
  │                                   │
  ├─ POST /api/reactions.php          ─▶  reactions-data.json (write)
  │  { slug, vote }                   │   + email notification
  │◀─ { helpful: 13, not_helpful: 3 } ─┤
  │                                   │
  └─ GET /api/reactions.php?admin=... ─▶  reactions-data.json (full dump)
```

**Five files are involved:**

| File | Role |
|---|---|
| `api/reactions.php` | PHP backend: stores votes, sends emails |
| `src/components/Reaction/index.js` | React component rendered at the bottom of every post |
| `src/components/Reaction/styles.module.css` | CSS module for the widget |
| `src/theme/BlogPostItem/index.js` | Swizzled Docusaurus component that injects the widget |
| `src/pages/reactions-dashboard.js` | Admin page to visualize all votes |

Two JSON files are created at runtime by the backend:

* `api/reactions-data.json` — the vote store, one entry per article slug
* `api/notifications.json` — throttle timestamps, one entry per article slug

Let's build them one by one.

---

## Step 1 — The PHP backend

Create the file `api/reactions.php` at the root of your web server (next to, or inside, your Docusaurus output folder). The PHP script does not need to be inside the Docusaurus source tree at all; it just needs to be reachable by the browser.

### 1.1 — Configuration

```php title="api/reactions.php"
<?php
declare(strict_types=1);

define('ADMIN_EMAIL',            'you@example.com');
define('ADMIN_TOKEN',            'replace-with-a-long-random-string');
define('NOTIFY_COOLDOWN_SECONDS', 3600);
define('SITE_URL',               'https://www.your-site.com');
```

Four constants, four decisions to make:

* **`ADMIN_EMAIL`** — where email notifications go. Use your own address.
* **`ADMIN_TOKEN`** — a long random string (32+ characters). This protects the admin endpoint that returns all votes. Generate one with `openssl rand -base64 24` in your terminal and never commit it to a public repository.
* **`NOTIFY_COOLDOWN_SECONDS`** — the minimum number of seconds between two notification emails *for the same article*. The default is 3 600 (one hour). This prevents your inbox from being flooded when an article goes viral.
* **`SITE_URL`** — your public domain, used to build clickable links in the notification email and to validate CORS origins.

### 1.2 — CORS

```php title="api/reactions.php"
$allowedOrigins = [
    SITE_URL,
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

The CORS block does two things.

First, it rejects any request that does not originate from your site or from `localhost:3000` (the Docusaurus dev server). Without this check, anyone could POST fake votes from any origin. The check is strict (`in_array` with the third argument `true`): no substring matching, no wildcards.

Second, it echoes the validated origin back in the `Access-Control-Allow-Origin` header. This is more correct than the wildcard `*` approach because it works with credentials and explicitly tells browsers which origin is allowed — and the `Vary: Origin` header ensures that caches respect per-origin responses.

The `OPTIONS` branch handles the browser preflight that precedes any cross-origin POST with a `Content-Type: application/json` header.

<AlertBox variant="info" title="Why localhost:3000?">
During development, `yarn start` serves Docusaurus on `http://localhost:3000`. Without adding it to the allowed origins list, every vote from your dev environment would be silently rejected by the browser before even reaching the server.
</AlertBox>

### 1.3 — Helper functions

```php title="api/reactions.php"
function loadData(string $file): array
{
    if (!file_exists($file)) {
        return [];
    }
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveData(string $file, array $data): void
{
    $fp = fopen($file, 'c+');
    if (!$fp) {
        return;
    }
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function sanitizeSlug(string $raw): string
{
    $slug = preg_replace('/[^a-z0-9\-\/]/', '', strtolower(trim($raw)));
    return substr($slug, 0, 200);
}

function jsonError(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}
```

**`loadData`** simply reads the JSON file and decodes it. If the file does not exist yet (first ever vote), it returns an empty array. The `?: []` fallback also covers a corrupted or empty file.

**`saveData`** uses PHP's advisory file locking (`flock`) to prevent race conditions. Without locking, two simultaneous votes on the same article could read the same count, each increment it independently, and write it back — resulting in one lost vote. The `LOCK_EX` flag blocks until the lock is acquired, so saves are serialized safely.

**`sanitizeSlug`** strips everything that is not a lowercase letter, digit, hyphen, or forward slash. This turns whatever the browser sends into something safe to use as a JSON key. The 200-character limit caps the key size regardless of what someone sends.

**`jsonError`** is a tiny helper that sets the HTTP status code, writes a JSON error body, and terminates the script. Returning `never` (PHP 8.1+) tells static analyzers that no code after a call to this function can be reached.

### 1.4 — Email notification with per-article throttling

```php title="api/reactions.php"
function maybeNotify(string $slug, string $vote, array $counts): void
{
    $throttleFile = __DIR__ . '/notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl   = SITE_URL . '/' . $slug;
    $dashboardUrl = SITE_URL . '/reactions-dashboard';
    $total        = $counts['helpful'] + $counts['not_helpful'];
    $ratio        = $total > 0 ? round($counts['helpful'] / $total * 100) : 0;

    $subject = "[Blog] New reaction on: $slug";
    $body    = implode("\n", [
        "A reader just reacted to one of your blog posts.",
        "",
        "Article     : $articleUrl",
        "Vote        : $vote",
        "Helpful     : {$counts['helpful']}",
        "Not helpful : {$counts['not_helpful']}",
        "Approval    : {$ratio}%",
        "",
        "View full dashboard: $dashboardUrl",
    ]);
    $headers = implode("\r\n", [
        "From: noreply@your-site.com",
        "Reply-To: noreply@your-site.com",
        "Content-Type: text/plain; charset=utf-8",
    ]);

    if (@mail(ADMIN_EMAIL, $subject, $body, $headers)) {
        $throttle[$slug] = time();
        saveData($throttleFile, $throttle);
    }
}
```

The throttle check is the key line: `time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS`. If the last email for this article was sent less than `NOTIFY_COOLDOWN_SECONDS` ago, the function returns immediately without sending anything. The throttle timestamp is only saved when `mail()` actually succeeds, so a failed send does not block the next attempt.

The notification email includes the vote type, the running totals, and the approval ratio — enough context to decide whether an article needs attention without having to open the dashboard.

<AlertBox variant="tip" title="Adjust the cooldown to your traffic">
On a low-traffic blog, a one-hour cooldown is reasonable. If you ever end up on a high-traffic aggregator, consider bumping `NOTIFY_COOLDOWN_SECONDS` to `86400` (24 hours) temporarily. The votes are never lost, you just receive fewer emails about them.
</AlertBox>

### 1.5 — Routing: GET and POST

```php title="api/reactions.php"
$method = $_SERVER['REQUEST_METHOD'];
$slug   = '';
$vote   = '';

if ($method === 'GET') {
    // Admin request: return all reaction data
    if (array_key_exists('admin', $_GET)) {
        if (($_GET['admin'] ?? '') !== ADMIN_TOKEN) {
            jsonError(403, 'Forbidden');
        }
        echo json_encode(loadData(__DIR__ . '/reactions-data.json'));
        exit;
    }
    $slug = sanitizeSlug($_GET['slug'] ?? '');
} elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $slug = sanitizeSlug($body['slug'] ?? '');
    $vote = $body['vote'] ?? '';
} else {
    jsonError(405, 'Method not allowed');
}

if ($slug === '') {
    jsonError(400, 'Missing slug');
}
```

The GET branch handles two cases.

When the `admin` query parameter is present, the script checks it against `ADMIN_TOKEN`. A matching token returns the full contents of `reactions-data.json` — the data consumed by the dashboard. A non-matching token returns a `403 Forbidden`.

When `admin` is absent, the script reads the `slug` query parameter. This is the public endpoint the React component calls on page load to get the current vote counts for a specific article.

The POST branch reads the request body as JSON (the React component sends `Content-Type: application/json`). It extracts `slug` and `vote`. Both go through validation in the next section.

```php title="api/reactions.php"
$dataFile = __DIR__ . '/reactions-data.json';
$data     = loadData($dataFile);

if (!isset($data[$slug])) {
    $data[$slug] = ['helpful' => 0, 'not_helpful' => 0];
}

if ($method === 'POST') {
    if ($vote === 'helpful') {
        $data[$slug]['helpful']++;
    } elseif ($vote === 'not_helpful') {
        $data[$slug]['not_helpful']++;
    } else {
        jsonError(400, 'Invalid vote value');
    }
    saveData($dataFile, $data);
    maybeNotify($slug, $vote, $data[$slug]);
}

echo json_encode($data[$slug]);
```

On first access, the slug entry is created with zeroed counters. The POST branch increments the right counter, saves the file, and triggers the throttled notification. Any `vote` value other than `helpful` or `not_helpful` is rejected immediately. The final line echoes the (updated or unchanged) counts for this slug, whatever the method.

### 1.6 — The complete file

<Snippet filename="api/reactions.php" source="api/reactions.php" defaultOpen={false} />

---

## Step 2 — The React component

Create the folder `src/components/Reaction/` and the file `index.js` inside it.

### 2.1 — Imports and setup

```javascript title="src/components/Reaction/index.js"
import { useState, useEffect, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function Reaction({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/reactions.php`;
  const storageKey = `reaction_${slug}`;
```

`metadata` is the object that Docusaurus passes to every blog post component. We use `metadata.permalink` — the URL path of the article — as the slug. The two `replace` calls strip the leading and trailing slashes so the slug matches what `sanitizeSlug` on the PHP side produces: `blog/my-article`, not `/blog/my-article/`.

`siteConfig.url` is your production URL from `docusaurus.config.js`. The component builds the API URL from it dynamically, which means it also works correctly in development (where `url` will point to `http://localhost:3000` if you configure it that way, but in practice the component is only mounted after Docusaurus resolves the site config).

`storageKey` gives every article its own entry in `localStorage` (`reaction_blog-my-article`), preventing a vote on one article from affecting another.

### 2.2 — State

```javascript title="src/components/Reaction/index.js"
  const [counts, setCounts] = useState(null);
  const [voted, setVoted] = useState(() => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  });
```

`counts` holds the `{ helpful, not_helpful }` object returned by the API. It starts as `null` (not yet loaded).

`voted` holds the previous vote for this article, read from `localStorage` on first render. The lazy initializer (the function form of `useState`) runs only once and is wrapped in a `try/catch` because `localStorage` can throw in private browsing modes or when storage is full. If there is no previous vote, `localStorage.getItem` returns `null`, which is exactly what we want.

<AlertBox variant="note" title="SSR compatibility">
Docusaurus uses server-side rendering. The lazy initializer inside `useState` only runs in the browser, never on the server, so there is no need to guard it with `typeof window !== "undefined"`. For anything outside `useState`, `useEffect`, or event handlers, always add that guard or you will get a build error.
</AlertBox>

### 2.3 — Loading counts on mount

```javascript title="src/components/Reaction/index.js"
  useEffect(() => {
    if (!slug) return;
    fetch(`${apiUrl}?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setCounts(data); })
      .catch(() => {});
  }, [slug, apiUrl]);
```

On mount, the component fetches the current counts for this article. The `encodeURIComponent` call ensures the slug is safe in a URL query string. If the fetch fails for any reason (network error, server down, non-OK status), the error is swallowed silently — the widget simply stays in its initial state, which is fine.

### 2.4 — Sending a vote

```javascript title="src/components/Reaction/index.js"
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

`handleVote` POSTs `{ slug, vote }` as JSON. On success, it updates the displayed counts with the fresh values returned by the server, sets `voted` to the chosen value (switching the UI from "vote buttons" to "thank you" state), and saves the vote to `localStorage`.

`useCallback` memoizes the function so it does not get recreated on every render, which is important since it is passed as an `onClick` prop.

### 2.5 — Rendering

```javascript title="src/components/Reaction/index.js"
  if (!slug) return null;

  return (
    <div className={styles.container}>
      {!voted ? (
        <>
          <span className={styles.question}>Was this article helpful?</span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("helpful")}
              aria-label="Yes, this was helpful"
            >
              👍 Helpful
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("not_helpful")}
              aria-label="No, this was not helpful"
            >
              👎 Not really
            </button>
          </div>
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "helpful" ? "Glad it helped! 🙌" : "Thanks for the feedback!"}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span title={`${counts.helpful} found this helpful`}>
                👍 {counts.helpful}
              </span>
              <span title={`${counts.not_helpful} did not find this helpful`}>
                👎 {counts.not_helpful}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

Reaction.propTypes = {
  metadata: PropTypes.shape({
    permalink: PropTypes.string,
  }).isRequired,
};
```

The rendering has two states. Before voting (`!voted`): the question and two buttons. After voting (`voted` is set): a thank-you message personalized to the vote choice, plus the vote counts — which are now visible since the reader has expressed their opinion.

The `aria-label` attributes make the buttons accessible to screen readers: emoji-only labels like "👍 Helpful" are not always read correctly by screen readers, so an explicit label helps.

The `PropTypes` definition at the bottom documents the expected shape of the `metadata` prop and produces a console warning in development if something is wrong.

### 2.6 — The complete file

<Snippet filename="src/components/Reaction/index.js" source="src/components/Reaction/index.js" defaultOpen={false} />

---

## Step 3 — The CSS module

```css title="src/components/Reaction/styles.module.css"
.container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  margin: 1.5rem 0 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  background: var(--ifm-background-surface-color);
}
```

The outer `container` is a flex row with wrapping, so it collapses gracefully on narrow screens. The colors use Docusaurus CSS custom properties (`--ifm-*`), which means the widget automatically adapts to light mode, dark mode, and any custom Docusaurus theme without writing a single media query or duplicate rule.

```css title="src/components/Reaction/styles.module.css"
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 6px;
  background: transparent;
  color: var(--ifm-color-content);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn:hover {
  background-color: var(--ifm-color-primary);
  border-color: var(--ifm-color-primary);
  color: #fff;
}

.btnNeutral:hover {
  background-color: var(--ifm-color-emphasis-400);
  border-color: var(--ifm-color-emphasis-400);
  color: #fff;
}
```

The "Helpful" button turns the primary theme color on hover; the "Not really" button turns a neutral grey. The 0.15 s transition makes the hover feel responsive without being flashy.

### The complete file

<Snippet filename="src/components/Reaction/styles.module.css" source="src/components/Reaction/styles.module.css" defaultOpen={false} />

---

## Step 4 — Injecting the widget via swizzling

**Swizzling** is Docusaurus's mechanism for replacing a built-in theme component with your own version. We want to inject `<Reaction />` at the bottom of every blog post page — and the right place to do that is `BlogPostItem`, the component that wraps the content and footer of every post.

### 4.1 — Run the swizzle command

```bash
yarn run swizzle @docusaurus/theme-classic BlogPostItem --wrap
```

<AlertBox variant="tip" title="Wrap vs. Eject">
The `--wrap` flag creates a thin wrapper around the original component rather than copying the entire source. However, for `BlogPostItem` we want fine-grained control over the layout (to place `<Reaction />` exactly where we want it, between the content and the footer). In practice, you will likely eject, not wrap. Run the command without `--wrap` and Docusaurus will ask you to confirm; choose **Eject**.
</AlertBox>

This creates `src/theme/BlogPostItem/index.js` with the original source. Open it.

### 4.2 — Modify the swizzled file

You need to make three changes: import the component, detect whether we are on a single-post page, and render `<Reaction />` conditionally.

Here is the relevant portion:

```javascript title="src/theme/BlogPostItem/index.js" {1,8,17-23}
import Reaction from "@site/src/components/Reaction";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? "margin-bottom--xl" : undefined;
}

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />

      {isBlogPostPage && (
        <Reaction metadata={metadata} />
      )}
    </BlogPostItemContainer>
  );
}
```

The key guard is `isBlogPostPage`. Docusaurus renders `BlogPostItem` in two contexts:

1. **Blog list pages** — where article cards are shown in a grid or feed.
2. **Single post pages** — where the full article is displayed.

Without the guard, a reaction widget would appear under every article card on the blog homepage, which is not what we want. `isBlogPostPage` is `true` only when you are reading a single post, so the widget shows up in exactly the right place.

<AlertBox variant="note" title="Placement matters">
If you have other custom components (a Bluesky share button, related posts, etc.), the order here defines the visual order at the bottom of every post. Adjust to your preference.
</AlertBox>

### 4.3 — The complete swizzled file

<Snippet filename="src/theme/BlogPostItem/index.js" source="src/theme/BlogPostItem/index.js" defaultOpen={false} />

---

## Step 5 — The admin dashboard

The dashboard is a standard Docusaurus page (not a blog post) that calls the admin endpoint of `reactions.php` and presents the data in a table with per-article approval bars.

Create `src/pages/reactions-dashboard.js`:

### 5.1 — Authentication

The page reads the admin token from the URL hash (`/reactions-dashboard#your-token`). If no hash is present, it renders an input form to enter the token manually. The token is never sent in the URL path or stored in `localStorage`.

```javascript title="src/pages/reactions-dashboard.js"
const [token, setToken] = useState(() => {
  if (typeof window === "undefined") return "";
  return window.location.hash.slice(1);
});
```

Passing the token in the hash is a practical choice: the hash is never sent to the server in the HTTP request, so it does not appear in server logs, and you can bookmark the URL.

### 5.2 — Data loading

```javascript title="src/pages/reactions-dashboard.js"
const fetchData = useCallback(async (t) => {
  if (!t) return;
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`${apiUrl}?admin=${encodeURIComponent(t)}`);
    if (res.status === 403) { setError("Invalid token."); setData(null); return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setData(await res.json());
  } catch (e) {
    setError(`Failed to load data: ${e.message}`);
    setData(null);
  } finally {
    setLoading(false);
  }
}, [apiUrl]);
```

A `403` means the token is wrong and gets a clear "Invalid token." message. Any other non-OK status is treated as a generic error. The `finally` block always clears the loading state.

### 5.3 — Aggregation

```javascript title="src/pages/reactions-dashboard.js"
function computeTotals(data) {
  let totalHelpful = 0;
  let totalNot = 0;

  const rows = Object.entries(data)
    .map(([slug, counts]) => {
      const helpful    = counts.helpful    ?? 0;
      const notHelpful = counts.not_helpful ?? 0;
      const total      = helpful + notHelpful;
      const ratio      = total > 0 ? Math.round((helpful / total) * 100) : 0;
      totalHelpful += helpful;
      totalNot     += notHelpful;
      return { slug, helpful, notHelpful, total, ratio };
    })
    .sort((a, b) => b.helpful - a.helpful || b.total - a.total);

  const grandTotal = totalHelpful + totalNot;
  const approval   = grandTotal > 0 ? Math.round((totalHelpful / grandTotal) * 100) : 0;

  return { rows, totalHelpful, totalNot, grandTotal, approval };
}
```

`computeTotals` iterates over every article in `reactions-data.json`, computes a per-article approval ratio, and sorts by helpful count descending (ties broken by total votes). The grand totals at the end power the summary cards at the top of the page.

### 5.4 — The complete file

<Snippet filename="src/pages/reactions-dashboard.js" source="src/pages/reactions-dashboard.js" defaultOpen={false} />

---

## All Files at a Glance

Here is the full set of files involved, grouped for easy installation.

<ProjectSetup folderName="Reaction widget">
  <Snippet filename="api/reactions.php" source="api/reactions.php" defaultOpen={false} />
  <Snippet filename="src/components/Reaction/index.js" source="src/components/Reaction/index.js" defaultOpen={false} />
  <Snippet filename="src/components/Reaction/styles.module.css" source="src/components/Reaction/styles.module.css" defaultOpen={false} />
  <Snippet filename="src/theme/BlogPostItem/index.js" source="src/theme/BlogPostItem/index.js" defaultOpen={false} />
  <Snippet filename="src/pages/reactions-dashboard.js" source="src/pages/reactions-dashboard.js" defaultOpen={false} />
</ProjectSetup>

---

## Security Considerations

A few things to keep in mind before deploying:

**Change the `ADMIN_TOKEN`.**  The example in the repository uses a placeholder. Generate your own with `openssl rand -base64 32` and update the constant before deploying. Anyone with this token can read every vote ever recorded.

**`reactions-data.json` and `notifications.json` should not be publicly accessible.**  If your web server serves the `api/` folder directly, make sure these JSON files are not downloadable by just navigating to them. Add an `.htaccess` rule to block direct access to `*.json` files inside that directory:

```apacheconf title="api/.htaccess"
<FilesMatch "\.json$">
    Require all denied
</FilesMatch>
```

**The PHP script does not authenticate voters.**  Anyone can POST multiple votes for the same article from different clients. `localStorage` only prevents double voting from the same browser, not from scripts or different devices. For a personal blog, this is an acceptable trade-off — you get signal, not precision polling data.

**File permissions.**  Make sure `api/reactions-data.json` and `api/notifications.json` are writable by the web server user. The script creates them on first use, so the `api/` directory itself must be writable. On Linux: `chmod 775 api/` and ensure the web server user owns or is in the group of that folder.

---

## Testing It

Once the files are in place:

1. **Start the Docusaurus dev server**: `yarn start`
2. Open any blog post. You should see the "Was this article helpful?" widget at the bottom.
3. Click one of the buttons. The widget should switch to the thank-you state.
4. Refresh the page. The widget should still show the thank-you state (loaded from `localStorage`).
5. Open a different browser (or an incognito window) and reload the same article. The vote counts from step 3 should be visible after voting.
6. Visit `/reactions-dashboard` and enter your admin token. The article you just voted on should appear in the table.

<AlertBox variant="info" title="The dashboard URL">
You can bookmark `/reactions-dashboard#your-token` to open the dashboard directly. The token in the hash fragment is never sent to the server in the HTTP request, so it does not appear in server access logs.
</AlertBox>

---

## Conclusion

The entire system is about 250 lines of code across five files, has no external dependencies beyond what Docusaurus already ships, and requires nothing on the infrastructure side except a server capable of running PHP.

What I like most about this approach is that every byte of data lives in your own files, under your own control. Votes are stored in a plain JSON file you can open with any text editor, back up with any tool, and migrate to any other system whenever you want. No SaaS subscription to cancel, no API key to renew, no privacy policy to update because someone else's SDK added a tracker.

If you build on this and add features — per-section reactions, reader questions, outdated flags — the same pattern scales naturally: one PHP file per feature, one React component, one JSON store.
