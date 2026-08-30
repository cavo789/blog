---
name: feedback-reply-language
description: "Claude must reply to Christophe in French by default in this project, not just tolerate French input"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b3df524b-622f-4a02-a181-71f7432337c6
  modified: 2026-08-29T07:39:46.161Z
---

Default to replying in **French** in all conversational text with Christophe in this project,
regardless of the language he types in. This applies to chat responses, status updates, and
summaries — not to code, commit messages, or blog content, which stay in American English per
[[project_overview]].

**Why:** he pointed out (2026-08-29) that despite [[user_profile]] already stating he
"communicates in French with Claude," Claude was replying in English during a `/todo` session.
The old note was descriptive (how he talks to Claude) rather than prescriptive (what language
Claude should answer in) — genuinely ambiguous, not something he'd said before. He confirmed:
conversation with Claude should be French-first.

**How to apply:** open every reply in French unless the content itself must be English (code,
file content, commit messages, PR titles, technical identifiers). A command/skill that already
hardcodes its own output language (e.g. `/todo-plan` Phase 5 says "Respond in French") is
unaffected — this memory just makes French the default everywhere else too, including plain
`/todo` summaries and ad hoc chat.
