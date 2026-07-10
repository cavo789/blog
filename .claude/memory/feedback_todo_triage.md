---
name: feedback_todo_triage
description: "User rejects reader-engagement features (polls, questions, share/bookmark, counters) as WONT_DO due to low traffic"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 85838d8c-eb86-435d-af17-0b7596f1b2e7
---

Christophe systematically marks reader-engagement TODO proposals as WONT_DO (moved to `.todos/WONT_DO/`) when they require ongoing interaction or add UI surface for a small audience.

**Why:** He has too few visitors to justify the effort/maintenance cost of these features (his own words: "j'ai trop peu de visiteurs pour perdre du temps à cette feature" / "trop peu d'intérêt"). For live-reply features specifically, he also can't commit to answering visitors in real time.

Confirmed WONT_DO so far:
- 002 — Interactive polls (`<Poll />` component)
- 004 — Reader question widget (live Q&A form) — redundant with the existing typo/suggestion popup, and he can't answer visitors live
- 006 — Code block copy counter
- 008 — Reading list / bookmarks (localStorage)
- 012 — Share highlight (Twitter/X share + Text Fragment API)

**How to apply:** When triaging or proposing new `.todos/*.md` ideas, be skeptical of anything in the "visitor engagement / social feature / analytics gimmick" family (polls, live chat/Q&A, share widgets, bookmarking, vanity counters). Don't pitch these proactively — he already has a lightweight typo/suggestion popup covering feedback needs. Favor TODOs that improve content quality, DX, or SEO/reach instead of interactive widgets requiring an audience or live response.
