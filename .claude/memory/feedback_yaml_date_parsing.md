---
name: feedback-yaml-date-parsing
description: YAML date fields in Docusaurus frontmatter arrive as ISO strings after SSR serialization — always use new Date(value) directly
metadata:
  node_type: memory
  type: feedback
  originSessionId: e040a813-7b8a-4b45-8a44-172a380c1ba7
---

Never concatenate `+ 'T12:00:00'` or similar to a frontmatter date value before passing it to `new Date()`.

**Why:** YAML parses bare dates (`2026-07-30`) as `Date` objects, but Docusaurus serializes frontmatter to JSON for SSR hydration. By the time the value reaches a React component, it is a string like `"2026-07-30T00:00:00.000Z"`. Concatenating `'T12:00:00'` produces `"2026-07-30T00:00:00.000ZT12:00:00"` → `Invalid Date`.

**How to apply:** Always use `new Date(value)` directly — it handles `Date` objects, ISO strings, and timestamps without extra logic. This is what the rest of `OldPostNotice` already does with `new Date(lastUpdated)`. Confirmed in the `review_date` fix (2026-07-30).
