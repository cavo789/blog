---
slug: docusaurus-typo-report-component
title: "Let Readers Report Typos — A Full-Stack Docusaurus Component"
date: 2026-06-13
authors: [christophe]
image: /img/v2/docusaurus_component.webp
description: Build a secure, SSR-safe typo-report feature for your Docusaurus blog — text selection tooltip, PHP API with HMAC nonce, rate limiting, deduplication, and email notifications.
mainTag: docusaurus
tags:
  - docusaurus
  - component
  - php
  - react
  - security
language: en
ai_assisted: true
draft: true
---

![Let Readers Report Typos — A Full-Stack Docusaurus Component](/img/v2/docusaurus_component.webp)

<TLDR>
A reader spots a typo. They have no way to tell you. They move on. You look unprofessional. This article builds a complete typo-reporting feature from scratch: readers select text, a floating "✏️ Report typo?" button appears, they optionally add a comment, and the report lands in a JSON file on your server — with an email notification. The PHP API is hardened with HMAC nonces, honeypot, rate limiting, and deduplication. The React component is SSR-safe, uses a clean state machine, and stores local rate limits in `localStorage`. No database, no third-party service, no npm dependency beyond what Docusaurus already ships.
</TLDR>

Your blog is your public face. A stray typo costs you credibility every time someone hits that paragraph. The problem is that most readers will not bother opening a GitHub issue or sending an email. But if you make it trivially easy — one click, right where they are — a surprising number will.

This article builds that mechanism end to end.

<!-- truncate -->

## Architecture overview

The feature has two independent halves that mirror the pattern used by the [Reaction component](/blog/docusaurus-reactions) (like / dislike votes):

```
Reader selects text
  └─ mouseup fires on <article>
       └─ floating button appears (phase: selected)
            └─ reader clicks → form opens (phase: confirming)
                 └─ POST api/typo.php
                      └─ validates nonce, honeypot, rate limits, dedup
                           └─ writes typo-data.json
                                └─ emails admin (6h cooldown)
```

**Files created or modified:**

| File | Role |
|---|---|
| `api/typo.php` | PHP API — nonce, validation, storage, email |
| `api/typo-data.json` | Persistent store (file-locked writes) |
| `api/typo-ratelimit.json` | Global + per-IP rate limit counters |
| `api/typo-notifications.json` | Per-article email throttle |
| `api/.env` | Secrets (`IP_HASH_SALT`, `NONCE_SECRET`) |
| `api/.htaccess` | Blocks direct HTTP access to JSON files |
| `src/components/TypoReport/index.js` | React component |
| `src/components/TypoReport/styles.module.css` | CSS module |
| `src/theme/BlogPostItem/index.js` | Mount point (swizzled theme file) |

---

## Part 1 — The PHP API

### Why PHP?

Docusaurus produces a static site. It has no server-side runtime. If you host on shared hosting (OVH, Infomaniak, o2switch…), a small PHP script sitting next to your static files is the lowest-friction backend you can have — no Node process to manage, no Docker container, no serverless cold starts.

### File structure on the server

```
public_html/
  api/
    .env                   ← secrets (never committed)
    .env.example           ← template committed to git
    .htaccess              ← protects JSON files
    typo.php               ← the API
    typo-data.json         ← reports (writable by web server)
    typo-ratelimit.json    ← counters
    typo-notifications.json ← email throttle
```

### Security design — layer by layer

Before writing a single line, let's think through what can go wrong and how each layer addresses it.

**Layer 1 — CORS**

Only `https://www.yourdomain.com` and `http://localhost:3000` (dev) are allowed as `Origin`. Any other origin gets a silent `403`. Same-origin requests carry no `Origin` header and are allowed through — they are legitimate browser navigations.

**Layer 2 — Method whitelist**

The API only responds to `GET` (nonce + admin), `POST` (submit), and `OPTIONS` (preflight). Everything else gets `405 Method Not Allowed`.

**Layer 3 — HMAC nonce**

This is the most important layer. Without it, anyone who knows your API URL can submit arbitrary reports with a simple `curl` command. The nonce is a time-keyed HMAC token:

```php
$nonce = hash_hmac('sha256', floor(time() / 900) . '|typo-report', NONCE_SECRET);
```

The token is valid for the current 15-minute window and the previous one (to avoid edge-case expiry when a user fetches the nonce at minute 14 and submits at minute 15). There is no storage — the token is self-validating. Every `POST` must include this value in the body.

**Layer 4 — Input validation and honeypot**

The honeypot is a hidden `<input name="website">` that is invisible to humans but filled in by bots. If `website !== ""`, the API returns `200 OK` without storing anything — the bot believes it succeeded.

Real input is then validated:

- `slug` — alphanumeric, hyphens, slashes, max 200 chars
- `text` — 3 to 150 chars, printable Unicode only (`\P{C}` — no control characters)
- `comment` — optional, max 300 chars, same character filter
- `context` — optional, max 300 chars, trimmed

**Layer 5 — Global rate limit**

A sliding 60-second window with a max of 20 requests across all IPs. This protects against sudden bursts (e.g. a bot that found the nonce by intercepting browser traffic). The window state is stored under a `__global__` key in `typo-ratelimit.json`, updated inside a single `LOCK_EX` block.

**Layer 6 — Per-IP rate limits**

Two limits tracked independently, both stored in `typo-ratelimit.json`:

- Max 10 reports per IP per rolling hour
- Max 3 reports per IP per article per 24 hours

IP addresses are never stored raw. They are hashed with a secret salt: `hash('sha256', IP_HASH_SALT . $ip)`. This is one-way — you cannot recover the original IP — but consistent, so you can aggregate across requests.

Why `REMOTE_ADDR` and not `X-Forwarded-For`? Because on shared hosting, the `X-Forwarded-For` header can be spoofed by the client, allowing a single IP to impersonate thousands of IPs and bypass per-IP limits.

**Layer 7 — Deduplication**

A SHA-256 hash of `slug + "|" + lowercase(text)` is stored as `text_hash` on every report. Before writing, we scan the existing reports for that slug. If the hash is already present, we return `200 OK` without storing. This silently absorbs duplicate submissions (refreshed page, double-click, etc.).

**Layer 8 — File-locked writes**

PHP on shared hosting is multi-process. Two requests arriving simultaneously could both read the JSON, both modify it, and one would overwrite the other's changes. Every write uses `fopen` + `flock(LOCK_EX)` + `ftruncate` + `rewind` + `fwrite` + `flock(LOCK_UN)` + `fclose`. The rate-limit check and write happen in the same lock to avoid TOCTOU races.

**Layer 9 — Email throttle**

You do not want an inbox flood if a popular article gets 50 reports in one hour. The notification system checks `typo-notifications.json` for the last email timestamp per article. A new email is only sent if more than 6 hours have elapsed since the last one.

### Full implementation

Create `api/typo.php`:

```php
<?php
declare(strict_types=1);

$_envVars = file_exists(__DIR__ . '/.env')
    ? (parse_ini_file(__DIR__ . '/.env') ?: [])
    : [];

define('ADMIN_EMAIL',            $_envVars['ADMIN_EMAIL']    ?? '');
define('ADMIN_TOKEN',            $_envVars['ADMIN_TOKEN']    ?? '');
define('IP_HASH_SALT',           $_envVars['IP_HASH_SALT']   ?? '');
define('NONCE_SECRET',           $_envVars['NONCE_SECRET']   ?? '');
define('SITE_URL',               'https://www.yourdomain.com');

define('NONCE_COOLDOWN_SECONDS', 900);
define('NOTIFY_COOLDOWN_SECONDS', 21600);
define('GLOBAL_WINDOW',   60);
define('GLOBAL_MAX',      20);
define('IP_HOURLY_MAX',   10);
define('IP_ARTICLE_MAX',  3);

// ── CORS ──────────────────────────────────────────────────────────────────────
$allowedOrigins = [SITE_URL, 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403); exit;
}

header('Content-Type: application/json; charset=utf-8');
if ($origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Shared helpers (identical to reactions.php) ───────────────────────────────
function loadData(string $file): array {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveData(string $file, array $data): void {
    $fp = fopen($file, 'c+');
    if (!$fp) return;
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function sanitizeSlug(string $raw): string {
    return substr(preg_replace('/[^a-z0-9\-\/]/', '', strtolower(trim($raw))), 0, 200);
}

function jsonError(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// ── Nonce ─────────────────────────────────────────────────────────────────────
function makeNonce(int $window): string {
    return hash_hmac('sha256', $window . '|typo-report', NONCE_SECRET);
}

function validateNonce(string $candidate): bool {
    $now = (int) floor(time() / NONCE_COOLDOWN_SECONDS);
    return hash_equals(makeNonce($now), $candidate)
        || hash_equals(makeNonce($now - 1), $candidate);
}

// ── Input validation ──────────────────────────────────────────────────────────
function validateAndSanitize(array $body): array {
    if (($body['website'] ?? '') !== '') return []; // honeypot

    $slug = sanitizeSlug($body['slug'] ?? '');
    if ($slug === '') jsonError(400, 'Missing slug');

    $text = trim($body['text'] ?? '');
    if (mb_strlen($text) < 3 || mb_strlen($text) > 150
        || !preg_match('/^\P{C}+$/u', $text)) jsonError(400, 'Invalid text');

    $comment = trim($body['comment'] ?? '');
    if ($comment !== '' && (mb_strlen($comment) > 300
        || !preg_match('/^\P{C}+$/u', $comment))) jsonError(400, 'Invalid comment');

    $context = mb_substr(trim($body['context'] ?? ''), 0, 300);

    return compact('slug', 'text', 'comment', 'context');
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
function checkRateLimits(string $slug): void {
    $file  = __DIR__ . '/typo-ratelimit.json';
    $ip    = $_SERVER['REMOTE_ADDR'] ?? '';
    $ipKey = hash('sha256', IP_HASH_SALT . $ip);
    $now   = time();

    $fp = fopen($file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) { fclose($fp); return; }

    $raw  = stream_get_contents($fp);
    $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];

    // Global sliding window
    $g = $data['__global__'] ?? ['window_start' => $now, 'count' => 0];
    if ($now - $g['window_start'] > GLOBAL_WINDOW) $g = ['window_start' => $now, 'count' => 0];
    if (++$g['count'] > GLOBAL_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }
    $data['__global__'] = $g;

    // Per-IP hourly
    $ipData = $data[$ipKey] ?? ['hourly' => [], 'articles' => []];
    $ipData['hourly'] = array_values(array_filter($ipData['hourly'], fn($ts) => $ts > $now - 3600));
    if (count($ipData['hourly']) >= IP_HOURLY_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }

    // Per-IP per-article (24h)
    $artKey  = $ipKey . '|' . $slug;
    $artData = array_values(array_filter($data[$artKey] ?? [], fn($ts) => $ts > $now - 86400));
    if (count($artData) >= IP_ARTICLE_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }

    $ipData['hourly'][] = $now;
    $artData[]          = $now;
    $data[$ipKey]       = $ipData;
    $data[$artKey]      = $artData;

    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    flock($fp, LOCK_UN); fclose($fp);
}

// ── Dedup + store ─────────────────────────────────────────────────────────────
function isDuplicate(string $slug, string $text): bool {
    $hash = hash('sha256', $slug . '|' . mb_strtolower($text));
    foreach (loadData(__DIR__ . '/typo-data.json')[$slug] ?? [] as $r) {
        if (($r['text_hash'] ?? '') === $hash) return true;
    }
    return false;
}

function storeReport(array $f): void {
    $ip   = $_SERVER['REMOTE_ADDR'] ?? '';
    $data = loadData(__DIR__ . '/typo-data.json');
    $fp   = fopen(__DIR__ . '/typo-data.json', 'c+');
    if (!$fp) return;
    if (flock($fp, LOCK_EX)) {
        $raw  = stream_get_contents($fp);
        $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];
        $data[$f['slug']][] = [
            'id'        => bin2hex(random_bytes(6)),
            'text'      => $f['text'],
            'text_hash' => hash('sha256', $f['slug'] . '|' . mb_strtolower($f['text'])),
            'context'   => $f['context'],
            'comment'   => $f['comment'],
            'ts'        => time(),
            'ip_hash'   => hash('sha256', IP_HASH_SALT . $ip),
        ];
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function maybeNotifyTypo(string $slug, string $text): void {
    $file    = __DIR__ . '/typo-notifications.json';
    $throttle = loadData($file);
    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) return;

    $subject = "[Blog] Typo report on: $slug";
    $body    = "Article: " . SITE_URL . "/$slug\nText: $text";
    $headers = "From: noreply@yourdomain.com\r\nContent-Type: text/plain; charset=utf-8";

    if (@mail(ADMIN_EMAIL, $subject, $body, $headers)) {
        $throttle[$slug] = time();
        saveData($file, $throttle);
    }
}

// ── Router ────────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (array_key_exists('nonce', $_GET)) {
        echo json_encode(['nonce' => makeNonce((int) floor(time() / NONCE_COOLDOWN_SECONDS))]);
        exit;
    }
    if (array_key_exists('admin', $_GET)) {
        if (ADMIN_TOKEN === '' || ($_GET['admin'] ?? '') !== ADMIN_TOKEN) jsonError(403, 'Forbidden');
        echo json_encode(loadData(__DIR__ . '/typo-data.json'));
        exit;
    }
    jsonError(400, 'Missing parameter');
}

if ($method !== 'POST') jsonError(405, 'Method not allowed');

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$nonce  = $body['nonce'] ?? '';
if ($nonce === '' || !validateNonce($nonce)) jsonError(403, 'Invalid nonce');

$fields = validateAndSanitize($body);
if ($fields === []) { echo json_encode(['ok' => true]); exit; } // honeypot hit

['slug' => $slug, 'text' => $text] = $fields;

checkRateLimits($slug);

if (isDuplicate($slug, $text)) { echo json_encode(['ok' => true]); exit; }

storeReport($fields);
maybeNotifyTypo($slug, $text);

echo json_encode(['ok' => true]);
```

### Protect the JSON files

Add this to `api/.htaccess` (or extend the existing `FilesMatch` block if you have one):

```apache
# Disable directory listing
Options -Indexes

<FilesMatch "^(typo-data\.json|typo-ratelimit\.json|typo-notifications\.json)$">
    Require all denied
</FilesMatch>
```

Without this, anyone can `GET https://yourdomain.com/api/typo-data.json` and read every report.

### Environment variables

Add to `api/.env.example` (and set real values in `api/.env` on the server):

```ini
ADMIN_EMAIL=your_email@example.com
ADMIN_TOKEN=change-me-to-a-long-random-string
IP_HASH_SALT=change-me-to-another-long-random-string
NONCE_SECRET=change-me-to-yet-another-long-random-string
```

Generate the secrets:

```bash
openssl rand -hex 32   # IP_HASH_SALT
openssl rand -hex 32   # NONCE_SECRET
```

---

## Part 2 — The React component

### SSR safety first

Docusaurus renders pages server-side (Node.js) before hydrating them in the browser. Any code that touches `window`, `document`, or `localStorage` will crash the SSR pass if it runs at the module level or inside the component body.

The rules:
1. All DOM access goes inside `useEffect` — it only runs in the browser.
2. State is initialized to `null` or `"idle"`, not to a value read from the browser.
3. The component returns `null` when idle — no DOM, no SSR mismatch.

### State machine

Five phases, linear with one fork:

```
idle
  └─ user selects text → selected
       └─ user clicks button → confirming
            └─ form submitted → submitting
                 ├─ success → done
                 └─ error   → error
```

Both `done` and `error` show a dismissible badge that resets to `idle`. Both `selected` and `confirming` reset to `idle` if the user clicks outside the tooltip.

### localStorage helpers

Before the form ever opens, two client-side guards run:

1. **Rate limit** — max 5 submissions per browser per hour. Timestamps are stored as a JSON array in `localStorage` under `"typo_reports"`. Entries older than 24 hours are pruned on every write.

2. **Deduplication** — a FNV-1a hash of `slug + "|" + lowercase(text)` is stored alongside the timestamp. If the same text was already reported from this browser, the component skips straight to `done` (silent accept, no network request).

FNV-1a is used instead of `crypto.subtle.digest` because it is synchronous and the collision risk is acceptable for this use case.

```js
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}
```

### Capturing context

When the user selects text, the component records ±100 characters of surrounding text from `article.innerText`. This context is sent to the API so you can locate the exact sentence without opening the post:

```js
const fullText = article.innerText || "";
const idx = fullText.indexOf(text);
if (idx !== -1) {
  contextRef.current = fullText.slice(Math.max(0, idx - 100), idx + text.length + 100);
}
```

### Tooltip positioning

The tooltip appears just below the selection. `window.scrollY + rect.bottom + 8` puts it 8px below the selected text's bottom edge. To prevent the 280px-wide form from overflowing the right edge of the viewport, the left position is clamped:

```js
const left = Math.min(window.scrollX + rect.left, window.innerWidth - 296);
```

### Full implementation

Create `src/components/TypoReport/index.js`:

```jsx
import { useState, useEffect, useRef, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

// ── LocalStorage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "typo_reports";
const MAX_PER_HOUR = 5;

function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function isLocalRateLimited() {
  const now = Date.now();
  return getStored().filter((r) => r.ts > now - 3_600_000).length >= MAX_PER_HOUR;
}

function isLocalDuplicate(slug, text) {
  return getStored().some((r) => r.hash === fnv1a(slug + "|" + text.toLowerCase()));
}

function recordLocalSubmission(slug, text) {
  const now = Date.now();
  const pruned = getStored().filter((r) => r.ts > now - 86_400_000);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      ...pruned,
      { ts: now, hash: fnv1a(slug + "|" + text.toLowerCase()) }
    ]));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TypoReport({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const slug   = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/typo.php`;

  const [phase, setPhase]           = useState("idle");
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [comment, setComment]       = useState("");

  const nonceRef   = useRef(null);
  const wrapperRef = useRef(null);
  const contextRef = useRef("");

  useEffect(() => {
    if (!slug) return;

    // Prefetch nonce so it is ready when the user submits.
    fetch(`${apiUrl}?nonce`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.nonce) nonceRef.current = d.nonce; })
      .catch(() => {});

    const article = document.querySelector("article")
      || document.querySelector(".theme-doc-markdown");
    if (!article) return;

    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (text.length < 3) return;

      const range = sel.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer)) return;

      const rect    = range.getBoundingClientRect();
      const fullText = article.innerText || "";
      const idx     = fullText.indexOf(text);
      contextRef.current = idx !== -1
        ? fullText.slice(Math.max(0, idx - 100), idx + text.length + 100)
        : "";

      setSelectedText(text);
      setTooltipPos({
        top:  window.scrollY + rect.bottom + 8,
        left: Math.min(window.scrollX + rect.left, window.innerWidth - 296),
      });
      setPhase("selected");
    }

    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setPhase("idle");
      }
    }

    article.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      article.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [slug, apiUrl]);

  const handleOpen = useCallback(() => {
    if (isLocalRateLimited()) { setPhase("error"); return; }
    if (isLocalDuplicate(slug, selectedText)) { setPhase("done"); return; }
    setComment("");
    setPhase("confirming");
  }, [slug, selectedText]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPhase("submitting");

    // Re-fetch nonce if expired or missing.
    let nonce = nonceRef.current;
    if (!nonce) {
      try {
        const r = await fetch(`${apiUrl}?nonce`);
        const d = r.ok ? await r.json() : null;
        nonce = d?.nonce ?? null;
        nonceRef.current = nonce;
      } catch {}
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          text:    selectedText,
          comment,
          context: contextRef.current,
          website: e.target.elements["website"]?.value ?? "",
          nonce:   nonce ?? "",
        }),
      });
      if (!res.ok) { setPhase("error"); return; }
      recordLocalSubmission(slug, selectedText);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }, [slug, selectedText, comment, apiUrl]);

  if (phase === "idle") return null;

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ top: tooltipPos.top, left: tooltipPos.left }}
    >
      {phase === "selected" && (
        <button className={styles.triggerBtn} onClick={handleOpen}>
          ✏️ Report typo?
        </button>
      )}

      {phase === "confirming" && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.selectedPreview}>
            "{selectedText.length > 80 ? selectedText.slice(0, 80) + "…" : selectedText}"
          </div>
          <textarea
            className={styles.commentInput}
            placeholder="Optional comment (max 300 chars)"
            maxLength={300}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {/* Honeypot — invisible to humans, filled by bots */}
          <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>Send</button>
            <button type="button" className={styles.btnSecondary} onClick={() => setPhase("idle")}>Cancel</button>
          </div>
        </form>
      )}

      {phase === "submitting" && <div className={styles.status}>Sending…</div>}

      {phase === "done" && (
        <div className={styles.status}>
          Thanks! ✓
          <button className={styles.dismissBtn} onClick={() => setPhase("idle")} aria-label="Dismiss">✕</button>
        </div>
      )}

      {phase === "error" && (
        <div className={styles.statusError}>
          Could not send.
          <button className={styles.dismissBtn} onClick={() => setPhase("idle")} aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  );
}

TypoReport.propTypes = {
  metadata: PropTypes.shape({ permalink: PropTypes.string }).isRequired,
};
```

---

## Part 3 — The CSS module

Create `src/components/TypoReport/styles.module.css`:

```css
.wrapper {
  position: absolute;
  z-index: 9999;
  max-width: 280px;
}

.triggerBtn {
  padding: 6px 12px;
  background: var(--ifm-color-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  transition: background 0.15s;
}
.triggerBtn:hover { background: var(--ifm-color-primary-dark); }

.form {
  width: 280px;
  padding: 12px;
  background: var(--ifm-background-surface-color);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selectedPreview {
  font-style: italic;
  font-size: 0.82rem;
  color: var(--ifm-color-emphasis-700);
  border-left: 3px solid var(--ifm-color-primary);
  padding-left: 8px;
  background: var(--ifm-color-emphasis-100);
  border-radius: 0 4px 4px 0;
  word-break: break-word;
}

.commentInput {
  width: 100%;
  min-height: 60px;
  resize: vertical;
  padding: 6px 8px;
  font-size: 0.82rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background: var(--ifm-background-color);
  color: var(--ifm-font-color-base);
  font-family: inherit;
  box-sizing: border-box;
}
.commentInput:focus { outline: none; border-color: var(--ifm-color-primary); }

.honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

.actions { display: flex; gap: 8px; justify-content: flex-end; }

.btnPrimary {
  padding: 5px 14px;
  background: var(--ifm-color-primary);
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btnPrimary:hover { background: var(--ifm-color-primary-dark); }

.btnSecondary {
  padding: 5px 14px;
  background: transparent;
  color: var(--ifm-color-emphasis-700);
  border: 1px solid var(--ifm-color-emphasis-400);
  border-radius: 5px;
  font-size: 0.82rem;
  cursor: pointer;
}

.status, .statusError {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.status      { background: #e6f4ea; color: #1a7f37; }
.statusError { background: #fde8e8; color: #c0392b; }

.dismissBtn {
  margin-left: auto;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: inherit;
  opacity: 0.7;
  padding: 0 2px;
}
.dismissBtn:hover { opacity: 1; }

/* Dark mode */
[data-theme="dark"] .form      { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); }
[data-theme="dark"] .selectedPreview { background: var(--ifm-color-emphasis-200); }
[data-theme="dark"] .status      { background: #1a3d2a; color: #6fcf97; }
[data-theme="dark"] .statusError { background: #3d1a1a; color: #eb5757; }
```

The CSS uses Docusaurus CSS custom properties exclusively (`--ifm-*`) so it adapts automatically to any theme — no hardcoded colors except the dark mode overrides.

---

## Part 4 — Wiring into Docusaurus

This is where Docusaurus swizzling comes in. Rather than modifying the upstream theme file directly, Docusaurus lets you copy any theme component into `src/theme/` and override it. If you have not already swizzled `BlogPostItem`, run:

```bash
yarn swizzle @docusaurus/theme-classic BlogPostItem --wrap
```

This creates `src/theme/BlogPostItem/index.js`. Open it and add the import and the component:

```js
// existing imports…
import TypoReport from "@site/src/components/TypoReport";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  // …

  return (
    <>
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />

        {isBlogPostPage && (
          <>
            <TypoReport metadata={metadata} />   {/* ← new */}
            {/* your other post-page components */}
          </>
        )}
      </BlogPostItemContainer>
    </>
  );
}
```

The `isBlogPostPage` guard is critical — without it, the component would also mount on the blog list page, where there is no article element and the `mouseup` listener would silently do nothing (best case) or throw (worst case).

---

## Part 5 — Deployment

### PHP version requirement

The API uses:
- `declare(strict_types=1)` — PHP 7.0+
- `never` return type on `jsonError()` — **PHP 8.1+**
- Named arguments via `compact()` — PHP 5.3+

Make sure your server runs PHP 8.1 or newer. Check with:

```bash
php -v
```

### File permissions

The three JSON files must be writable by the web server process. On most shared hosting:

```bash
chmod 664 api/typo-data.json api/typo-ratelimit.json api/typo-notifications.json
```

### Smoke test with curl

Once deployed, verify the full round-trip before announcing the feature:

```bash
# 1. Fetch a nonce
NONCE=$(curl -s "https://yourdomain.com/api/typo.php?nonce" | jq -r .nonce)

# 2. Submit a test report
curl -s -X POST "https://yourdomain.com/api/typo.php" \
  -H "Content-Type: application/json" \
  -d "{\"slug\":\"test/smoke\",\"text\":\"hello world\",\"comment\":\"\",\"context\":\"\",\"website\":\"\",\"nonce\":\"$NONCE\"}"
# → {"ok":true}

# 3. Confirm the admin endpoint
curl -s "https://yourdomain.com/api/typo.php?admin=YOUR_TOKEN" | jq .
# → {"test/smoke": [...]}

# 4. Confirm .htaccess is protecting the file
curl -I "https://yourdomain.com/api/typo-data.json"
# → HTTP/1.1 403 Forbidden

# 5. Confirm POST without nonce is rejected
curl -s -X POST "https://yourdomain.com/api/typo.php" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","text":"hello world","comment":"","context":"","website":""}'
# → {"error":"Invalid nonce"}
```

Clean up after testing:

```bash
echo '{}' > api/typo-data.json
echo '{}' > api/typo-ratelimit.json
echo '{}' > api/typo-notifications.json
```

---

## Known limitations

**Mobile / touch devices**

`mouseup` does not fire reliably on touch screens. The feature is silently absent on mobile. This is an acceptable trade-off: touch selection is awkward for text, and the typical person who bothers reporting a typo is at a desk. A future iteration could add a `touchend` listener.

**Tooltip overflow on the right edge**

The `Math.min(left, window.innerWidth - 296)` clamp prevents the 280px-wide form from going off-screen on the right. A left overflow (selection near the left edge of very narrow viewports) is not clamped — it is rare enough to leave as a follow-up.

**No dashboard UI**

The admin endpoint (`GET ?admin=TOKEN`) returns raw JSON. Building a `/typo-dashboard` React page — a table with article slug, selected text, comment, timestamp — follows the exact same pattern as a reactions dashboard and can be added later without touching any of the code written here.

**Shared hosting NAT**

Users behind the same NAT (e.g. office WiFi) share the same `REMOTE_ADDR`. If three different people from the same office report typos on the same article within 24 hours, the fourth will be rate-limited. This is an acceptable trade-off given the shared-hosting constraint.

---

## Summary

In about 300 lines of PHP and 150 lines of React (plus CSS), you have a complete typo-reporting system:

- **Zero new dependencies** — PHP's standard library, React hooks you already use
- **No database** — file-locked JSON writes, safe under concurrent load
- **Defense in depth** — CORS, HMAC nonce, honeypot, global rate limit, per-IP rate limit, deduplication, all independently effective
- **SSR-safe** — returns `null` until the browser loads, no hydration mismatch
- **Dark mode ready** — Docusaurus CSS variables do the work

The architecture is deliberately simple. Every piece can be understood, debugged, and modified by reading the file. There is no framework magic to unravel when something goes wrong at 2 AM.
