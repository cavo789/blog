# TODO — Typo Report Feature

**Status:** Plan approved, not yet implemented
**Estimated effort:** ~3–4h (PHP API + React component + CSS + wiring)

---

## What this feature does

A reader selects text on a blog post → a small floating "✏️ Report typo?" button appears near the selection → clicking opens a mini form → the report is sent to a PHP API → stored server-side → admin receives an email notification.

This mirrors the existing `reactions.php` / `Reaction` component architecture.

---

## Files to create

### `api/typo.php`

New PHP API. Reuses `loadData()`, `saveData()`, `sanitizeSlug()`, `jsonError()` verbatim from `reactions.php`.

**Security layers (in order):**

1. **CORS** — same `$allowedOrigins` as `reactions.php`: `https://www.avonture.be` + `http://localhost:3000`
2. **Method whitelist** — POST + OPTIONS + GET (admin only)
3. **HMAC nonce validation** (new — blocks direct curl attacks):
   * `GET api/typo.php?nonce` returns a self-validating token (no storage needed):

     ```php
     $nonce = hash_hmac('sha256', floor(time() / 900) . '|typo-report', NONCE_SECRET);
     echo json_encode(['nonce' => $nonce]);
     ```

   * Token is valid for current 15-min window + previous window (avoids edge-case expiry)
   * Every POST must include `nonce` in body; validated with `hash_equals()` (timing-safe)
   * No nonce or wrong nonce → `403 Forbidden`
4. **Input validation** (`validateAndSanitize()`):
   * **Honeypot**: if `body['website'] !== ''` → silent `200 OK`, nothing stored
   * Slug: `sanitizeSlug()` (identical to reactions.php)
   * `text`: min 3 / max 150 chars, `preg_match('/^\P{C}+$/u', $text)` (printable Unicode only)
   * `comment`: optional, max 300 chars, same char filter
   * `context`: optional, max 300 chars, trimmed
5. **Global sliding-window rate limit** (60s window, max 20 requests) stored in `typo-ratelimit.json` under key `__global__` — check + write in single `LOCK_EX` block
6. **Per-IP rate limit** — stored in `typo-ratelimit.json` under `hash('sha256', IP_HASH_SALT . $ip)`:
   * max 10 reports/IP/hour (rolling 1h)
   * max 3 reports/IP/article/24h
   * Use `$_SERVER['REMOTE_ADDR']` — NOT `X-Forwarded-For` (avoids spoofing on shared hosting)
   * Merged into single `LOCK_EX` block with global check to avoid lock contention
7. **Deduplication** — `hash('sha256', slug . '|' . mb_strtolower(text))` stored as `text_hash` field; silent skip if hash already present for that slug
8. **Store report** in `typo-data.json` (file-locked write):

   ```json
   {
     "blog/my-post": [
       { "id": "abc123", "text": "…", "text_hash": "…", "context": "…", "comment": "…", "ts": 0, "ip_hash": "…" }
     ]
   }
   ```

9. **Email notification** via `maybeNotifyTypo()` — 6h cooldown per article (throttle in `typo-notifications.json`)

**Admin endpoint:** `GET api/typo.php?admin=ADMIN_TOKEN` → returns full `typo-data.json`

---

### `src/components/TypoReport/index.js`

React component — SSR-safe (all DOM access in `useEffect`).

**State machine:** `idle → selected → confirming → submitting → done | error`

Renders `null` when `idle` (no SSR mismatch risk).

**`useEffect` (on mount, keyed on `slug`):**

1. Fetch nonce: `GET ${apiUrl}?nonce` → store in `nonceRef.current`
2. Find `article` or `.theme-doc-markdown` element
3. Attach `mouseup` → reads `window.getSelection()`, checks selection is inside article, computes tooltip position (`window.scrollY + rect.bottom + 8`, `window.scrollX + rect.left`), sets phase `selected`
4. Attach `mousedown` → if click outside tooltip wrapper → reset to `idle`
5. Cleanup removes both listeners

**Phase `selected`:** floating "✏️ Report typo?" button
On click → `handleOpen`:

* localStorage rate limit: max 5 reports/browser/hour (timestamps array in `typo_reports` key)
* localStorage dedup: FNV-1a hash of `slug+text`, skip if already reported
* → phase `confirming`

**Phase `confirming`:** mini form:

* Read-only selected text preview (max 80 chars shown)
* Optional `<textarea>` for comment (max 300 chars)
* Hidden honeypot `<input name="website">` (CSS: `position:absolute; left:-9999px; opacity:0`)
* Submit / Cancel buttons

**On submit:** POST to `api/typo.php`:

```json
{ "slug": "…", "text": "…", "comment": "…", "context": "…", "website": "", "nonce": "…" }
```

Context = ±100 chars around selected text from `articleEl.innerText`.
On success → `recordLocalSubmission()`, phase `done`. On error → phase `error`.

**LocalStorage helpers:**

```js
const STORAGE_KEY = "typo_reports"; // [{ts, hash}]
const MAX_PER_HOUR = 5;
function isLocalRateLimited() { /* filter ts > now-3600000, check length */ }
function isLocalDuplicate(slug, text) { /* FNV-1a hash check */ }
function recordLocalSubmission(slug, text) { /* prune > 24h, push new */ }
```

---

### `src/components/TypoReport/styles.module.css`

Key classes:

* `.wrapper` — `position: absolute; z-index: 9999`
* `.triggerBtn` — primary color, rounded, box-shadow
* `.form` — 280px card, surface background, border
* `.selectedPreview` — italic, left-border accent, bg emphasis
* `.commentInput` — full-width textarea
* `.honeypot` — `position:absolute; left:-9999px; opacity:0; pointer-events:none`
* `.status` / `.statusError` — inline badge with close button
* Dark mode via `[data-theme="dark"]`

---

## Files to modify

### `api/.htaccess`

Extend `FilesMatch` from:

```apache
<FilesMatch "^(reactions-data\.json|notifications\.json|README\.md)$">
```

to:

```apache
<FilesMatch "^(reactions-data\.json|notifications\.json|typo-data\.json|typo-ratelimit\.json|typo-notifications\.json|README\.md)$">
```

### `api/.env.example`

Add two lines (currently only has `ADMIN_EMAIL` and `ADMIN_TOKEN`):

```ini
IP_HASH_SALT=change-me-to-another-long-random-string
NONCE_SECRET=change-me-to-yet-another-long-random-string
```

> On the production server, generate these with `openssl rand -hex 32`.

### `src/theme/BlogPostItem/index.js`

Add import:

```js
import TypoReport from "@site/src/components/TypoReport";
```

Insert before `<Reaction>` in the `isBlogPostPage` block (line 39):

```jsx
{isBlogPostPage && (
  <>
    <TypoReport metadata={metadata} />   {/* ← new */}
    <Reaction metadata={metadata} />
    <Bluesky metadata={metadata} />
    <RelatedPosts count="6" description="false" />
  </>
)}
```

---

## Known limitations (accepted, documented)

* **Mobile / touch**: `mouseup` doesn't fire on touch — feature absent on mobile (acceptable)
* **Tooltip edge overflow**: if selection near right viewport edge, 280px form can overflow — clamp `left` to `Math.min(left, window.innerWidth - 296)` as polish follow-up
* **No `/typo-dashboard` page yet**: admin endpoint (`?admin=TOKEN`) is complete; the dashboard page can follow the exact `reactions-dashboard.js` pattern as a follow-up
* **`X-Forwarded-For` not trusted**: using `REMOTE_ADDR` only — NAT users share rate limit bucket

---

## Verification checklist

1. `yarn start` dev server
2. Select 5+ chars on a blog post → "✏️ Report typo?" button appears
3. Submit → entry in `api/typo-data.json`, admin email received
4. Submit same text → silent dedup (no duplicate in JSON)
5. Submit 6× from same browser → 6th blocked by localStorage rate limit
6. `POST api/typo.php` with `website: "spam"` → 200 OK, nothing stored
7. `POST api/typo.php` with no nonce → 403 Forbidden
8. `GET api/typo.php?nonce` then POST with that nonce → succeeds
9. Direct access to `api/typo-data.json` in browser → 403 via .htaccess
10. `GET api/typo.php?admin=WRONG` → 403; with correct token → JSON dump

---

## Deployment guide

> **Status:** Implementation complete. Run through these steps before going live.

### 1. Generate secrets on the production server

SSH into the server and generate two independent random secrets:

```bash
openssl rand -hex 32   # → use as IP_HASH_SALT
openssl rand -hex 32   # → use as NONCE_SECRET
```

### 2. Update `api/.env` on the server

The file lives alongside `reactions.php`. Add the two new keys (keep the existing ones):

```ini
ADMIN_EMAIL=your_email@example.com
ADMIN_TOKEN=your-existing-token
IP_HASH_SALT=<output of first openssl command>
NONCE_SECRET=<output of second openssl command>
```

> `.env` must **not** be committed to git — it is already gitignored.

### 3. Upload the new files

These files need to be present on the server (deploy via your usual pipeline or `rsync`):

| File | Notes |
|---|---|
| `api/typo.php` | New API — make sure PHP 8.1+ is available (`declare(strict_types=1)` + `never` return type) |
| `api/typo-data.json` | Empty `{}` — must be writable by the web server user |
| `api/typo-ratelimit.json` | Empty `{}` — must be writable |
| `api/typo-notifications.json` | Empty `{}` — must be writable |
| `api/.htaccess` | Updated — blocks direct HTTP access to the three new JSON files |
| `src/components/TypoReport/index.js` | New React component |
| `src/components/TypoReport/styles.module.css` | New CSS module |
| `src/theme/BlogPostItem/index.js` | Modified — `<TypoReport>` injected before `<Reaction>` |

### 4. Set file permissions

On shared hosting, JSON files written by PHP must be writable by the server process:

```bash
chmod 664 api/typo-data.json api/typo-ratelimit.json api/typo-notifications.json
```

If the web server runs as a different user than the deploy user, you may need `chmod 666` or to adjust group ownership.

### 5. Run the production build

```bash
yarn build
```

Then deploy the `build/` output as usual.

### 6. Smoke-test on production

After deploy, run through items 2–10 of the verification checklist above using the live URL.

**Quick curl test (no browser needed):**

```bash
# Step 1 — get a nonce
NONCE=$(curl -s "https://www.avonture.be/api/typo.php?nonce" | jq -r .nonce)

# Step 2 — submit a test report
curl -s -X POST "https://www.avonture.be/api/typo.php" \
  -H "Content-Type: application/json" \
  -d "{\"slug\":\"test/smoke\",\"text\":\"hello world\",\"comment\":\"\",\"context\":\"\",\"website\":\"\",\"nonce\":\"$NONCE\"}"
# Expected: {"ok":true}

# Step 3 — check admin endpoint
curl -s "https://www.avonture.be/api/typo.php?admin=YOUR_ADMIN_TOKEN" | jq .
# Expected: JSON with "test/smoke" key

# Step 4 — confirm .htaccess blocks direct access
curl -I "https://www.avonture.be/api/typo-data.json"
# Expected: HTTP/1.1 403 Forbidden
```

### 7. Clean up test data

After smoke-testing, clear the test entry from the server:

```bash
echo '{}' > api/typo-data.json
echo '{}' > api/typo-ratelimit.json
echo '{}' > api/typo-notifications.json
```
