# 🟦 Bluesky Component

The `Bluesky` component is a dynamic integration for Docusaurus pages that enables interaction with the [Bluesky](https://bsky.app/) social platform. It automatically detects whether the current document has already been promoted on Bluesky — by searching the configured account's own post history for a post linking to this page — and shows either a share button or the full interaction UI (like, repost, comment) accordingly. A `blueskyRecordKey` in frontmatter **is optional and only needed as a manual override**.

## ✨ Features

- 🔗 Share button for posting the current document to a user's Bluesky profile
- 🔍 Automatic detection of an existing Bluesky post for the current page — no frontmatter required
- 💬 Like, repost, and comment interface for existing Bluesky posts
- 📊 Displays number of likes and reposts
- 🗨️ Shows comments or engagement call-to-action
- 🛡️ Fails silently offline or when Bluesky's API is unreachable/blocked — never a JS error or a broken layout
- 🧠 Behavior determined by auto-detection, with an optional frontmatter override

## Example

Out-of-the-box, here is how the component will looks like:

![Example](sample.png)

## 📦 Usage

### 1. (Optional) Override the Detected Post

By default, the component finds the right Bluesky post on its own — nothing to add to frontmatter. Set `blueskyRecordKey` by hand only when you need to force a specific post, typically:

- the article's slug was renamed **after** it was shared on Bluesky (the old post still exists, but its embedded link now points to a URL that no longer matches — auto-detection won't find it any more),
- the article was shared more than once and auto-detection's match isn't the post you want to feature.

```yaml
---
title: "My Awesome Post"
blueskyRecordKey: 3lun2qjuxc22r
---
```

When present, this value always wins over auto-detection. When absent, the component looks it up dynamically (see [How Auto-Detection Works](#-how-auto-detection-works) below); if nothing is found either way, only the share button is shown.

### 2. Configure Your Bluesky Handle

In your `docusaurus.config.js`, add your Bluesky handle under customFields:

```js
const config = {
  // ...
  customFields: {
    bluesky: {
      handle: "avonture.be", // Replace with your actual Bluesky handle
    },
  },
};
```

## 🧪 Example

```jsx
import Bluesky from "@site/src/components/Bluesky";

<Bluesky metadata={props.metadata} />;
```

## 🧾 Props

| Prop                                    | Type   | Required | Default | Description                                                                |
| --------------------------------------- | ------ | -------- | ------- | -------------------------------------------------------------------------- |
| `metadata                               | object | ✅       | —       | Docusaurus document metadata, including frontmatter                        |
| `metadata.frontMatter.blueskyRecordKey` | string | ❌       | —       | Unique key for the associated Bluesky post. Enables full interaction mode. |

## 🔀 Behavior

| Scenario                                                       | Outcome                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `blueskyRecordKey` is present in frontmatter                   | Used as-is (manual override) — displays post interaction UI                |
| `blueskyRecordKey` is absent, a matching post is auto-detected | Displays post interaction UI: like, repost, comment, and engagement data   |
| `blueskyRecordKey` is absent, no matching post found           | Shows a share button to post the document to the user's Bluesky profile    |
| The Bluesky API call fails (offline, blocked, post deleted…)   | Degrades to the share-button state — never an error message, never a crash |

## 🔍 How Auto-Detection Works

When no `blueskyRecordKey` is set, `useBlueskyRecordKey` (in `useBlueskyEngagement.js`) resolves it at runtime, in the visitor's browser:

1. Fetches the configured account's own post history via Bluesky's public `getAuthorFeed` endpoint (paginated, capped at 5 pages — replies excluded).
2. For each post, reads the URL from its `app.bsky.embed.external` link-card embed — the same card the Share button produces — and normalizes it (trailing slash and query string stripped).
3. Looks up the current page's own URL, normalized the same way, in that map.
4. Caches the resulting map in `sessionStorage` for a few minutes, so browsing several un-tagged articles in one visit doesn't re-fetch the whole feed each time.

If any step fails — offline, the request is blocked, the matched post has since been deleted — resolution simply returns "not found", and the UI falls back to the share-button state. Nothing is ever thrown to the page.

Bluesky's `searchPosts` endpoint would have been a better fit (indexed lookup instead of a feed scan) but returns `403 Forbidden` on the public, unauthenticated API — confirmed by testing, not assumed.

## 🔒 Privacy Note

This component talks to Bluesky's public API directly from the visitor's browser — no cookies, no sign-in required, but each call does reach Bluesky's servers and carries the visitor's IP address (same pattern as embedding any third-party widget, e.g. the Google Fonts CDN case). This is disclosed to the reader directly in the rendered block. No new information is sent _to Bluesky itself_ — everything read back (likes, reposts, comments, post text) is already public there.

## 🧩 Internal Components

This component uses the following subcomponents:

- `BlueskyShare` – Share button for user-generated posts
- `BlueskyPost` – Interaction UI for existing posts
- `BlueskyLikes` – Displays like/repost counts
- `BlueskyComments` – Shows comments or engagement CTA
- `useBlueskyRecordKey` (in `useBlueskyEngagement.js`) – Resolves the record key: frontmatter override, or auto-detected from the account's post history

## 🎨 Styling

Wraps content in a `blueskyContainer` class. You can customize styles via your global or module CSS.

## 📄 License

MIT — free to use, modify, and contribute.

## 💬 AI partially generated

This code has been partially generated by Christophe Avonture using AI.
