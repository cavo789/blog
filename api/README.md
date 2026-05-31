# reactions.php — Per-article reaction API

A lightweight PHP backend that records anonymous 👍 / 👎 reactions for each blog post, returns the aggregate counts, and notifies the author by email when a new vote arrives.

No database required — all data is stored in local JSON files.

## How it works

Each blog post is identified by its **permalink slug** (e.g. `blog/modular-zsh-workflow`). Counts are stored per slug in `reactions-data.json`, which is created automatically on the first vote.

Double-voting prevention is handled client-side via `localStorage`: once a reader votes, their choice is stored in the browser and the vote buttons are replaced by the aggregate counts.

The counter is **per article** and fully independent — voting on one post has no effect on any other.

## Files

| File | Description |
| ---- | ----------- |
| `reactions.php` | The API script |
| `.htaccess` | Blocks direct HTTP access to internal files |
| `reactions-data.json` | Reaction counts (auto-created) |
| `notifications.json` | Throttle timestamps for email notifications (auto-created) |

## Configuration

Edit the constants at the top of `reactions.php` before deploying:

```php
define('ADMIN_EMAIL',             'you@example.com');
define('ADMIN_TOKEN',             'REPLACE_WITH_A_LONG_RANDOM_SECRET');
define('NOTIFY_COOLDOWN_SECONDS',  3600);
define('SITE_URL',                'https://www.your-site.com');
```

| Constant | Description |
| -------- | ----------- |
| `ADMIN_EMAIL` | Address that receives vote notification emails |
| `ADMIN_TOKEN` | Secret token for the admin endpoint and the dashboard |
| `NOTIFY_COOLDOWN_SECONDS` | Minimum gap (in seconds) between two notification emails for the same article |
| `SITE_URL` | Production URL of the site (used in CORS and email links) |

## API reference

### `GET /api/reactions.php?slug=<slug>`

Returns the current reaction counts for a given article.

**Query parameter**

| Name | Type | Description |
| ---- | ---- | ----------- |
| `slug` | string | Permalink of the article, without leading `/` |

**Response** `200 OK`

```json
{ "helpful": 42, "not_helpful": 3 }
```

---

### `POST /api/reactions.php`

Records a vote for a given article.

**Request body** `application/json`

```json
{ "slug": "blog/modular-zsh-workflow", "vote": "helpful" }
```

| Field | Type | Values |
| ----- | ---- | ------ |
| `slug` | string | Permalink without leading `/` |
| `vote` | string | `"helpful"` or `"not_helpful"` |

**Response** `200 OK` — updated counts (same shape as GET)

After recording the vote, the script calls `maybeNotify()` which sends an email to `ADMIN_EMAIL` if no notification has been sent for this article within the last `NOTIFY_COOLDOWN_SECONDS`.

---

### `GET /api/reactions.php?admin=<token>`

Returns the full reaction dataset for **all articles** (admin use only).

**Query parameter**

| Name | Type | Description |
| ---- | ---- | ----------- |
| `admin` | string | Must match `ADMIN_TOKEN` |

**Response** `200 OK`

```json
{
  "blog/modular-zsh-workflow": { "helpful": 42, "not_helpful": 3 },
  "blog/docker-networking":    { "helpful": 17, "not_helpful": 1 }
}
```

Returns `403 Forbidden` if the token is wrong or missing.

---

### Error responses

| Code | Reason |
| ---- | ------ |
| 400 | Missing or empty `slug`, invalid `vote` |
| 403 | Wrong or missing admin token / request origin not allowed |
| 405 | HTTP method other than GET / POST / OPTIONS |

## Email notifications

When a vote is recorded, `maybeNotify()` sends a plain-text email to `ADMIN_EMAIL` containing:

- Article URL
- Vote type
- Current helpful / not-helpful counts
- Approval percentage
- Link to the dashboard

A throttle file (`notifications.json`) records the timestamp of the last notification per article. No email is sent if the previous one for the same article was less than `NOTIFY_COOLDOWN_SECONDS` ago.

## Dashboard

A read-only dashboard is available at `/reactions-dashboard` on the blog.

Access is protected by the `ADMIN_TOKEN`: paste it in the form on the page, or append it directly to the URL as a hash so it is never sent to the server:

```
https://www.avonture.be/reactions-dashboard#YOUR_ADMIN_TOKEN
```

The dashboard shows:

- Total votes, helpful count, not-helpful count, global approval rate
- Per-article table sorted by helpful count (descending)
- Approval bar for each article
- Clickable links to each article

## Data storage

All data is stored in JSON files in the same directory as `reactions.php`.

Example `reactions-data.json`:

```json
{
  "blog/modular-zsh-workflow": { "helpful": 42, "not_helpful": 3 },
  "blog/docker-networking":    { "helpful": 17, "not_helpful": 1 }
}
```

Direct HTTP access to both JSON files and this README is blocked by `.htaccess`.

## Security

| Measure | Details |
| ------- | ------- |
| CORS origin check | Only `SITE_URL` and `http://localhost:3000` are accepted |
| Admin token | Full dataset endpoint requires a secret token |
| Input sanitisation | Slug is stripped to `[a-z0-9\-\/]`, max 200 chars |
| File locking | `flock(LOCK_EX)` prevents data corruption under concurrent writes |
| `.htaccess` | Blocks public access to all JSON files and this README |

> **Note:** vote counts can be incremented by anyone who calls the API directly from an allowed origin. For a personal blog this is an acceptable trade-off. The `localStorage` guard handles accidental double-voting from legitimate readers.

## Deployment

1. Upload `reactions.php` and `.htaccess` to `public_html/api/` via SFTP.
2. Edit `ADMIN_TOKEN`, `ADMIN_EMAIL`, and `SITE_URL` in `reactions.php`.
3. Ensure the `api/` directory is writable by PHP (default on PlanetHoster).
4. `reactions-data.json` and `notifications.json` are created automatically — no manual setup needed.
