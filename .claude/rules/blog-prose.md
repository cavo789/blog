---
paths:
  - "blog/**/*.md"
  - "blog/**/*.mdx"
  - ".unpublished/**/*.md"
  - ".unpublished/**/*.mdx"
---

# Blog prose — always apply

Full rationale: `writing_style` memory (*No Trial-and-Error Narrative*) and the
`blog-post-structure` skill. This rule exists because the memory alone did not hold: it is read
once at session start, and drifts away during a long editing session — which is exactly when
articles get written.

**The reader wants a guide that works, step after step. Not the story of how we got there.**

- ❌ DON'T: narrate discovery. "I found out the hard way", "turns out", "every other backend I
  tried", "I only know this because", "at first I thought", "that bit me", "worth knowing you are
  doing it". Cut the sentence; keep the fact it was carrying.
- ❌ DON'T: document a bug the reader will never hit because the article already works around it.
  If the fix is in the script, the explanation belongs in the script's **comment**, not in prose
  and never in its own `<AlertBox>`.
- ❌ DON'T: justify your own engineering choices to the reader (why a layer sits where it sits,
  what you rejected, what a number "is not"). That is a code-review conversation, not an article.
- ❌ DON'T: hedge a demonstrated result ("that is a stronger claim than it looks", "this is one
  document, on one version"). It reads as *this may not work for you* — the opposite of the goal.
- ✅ DO: keep first-person **judgment** — "I reach for the light one by reflex" is this blog's
  voice. The line is chronology: a verdict is fine, the journey that produced it is not.
- ✅ DO: state a limitation once, flatly, as a property of the tool — "the standard pipeline can
  drop the last line of a paragraph" — never as something you personally suffered.
- ✅ DO: keep **at most one** failure story per article, and only when it *is* the payoff.

Self-check: `grep -niE "found out|turns out|I tried|hard way|bit me|at first|I expected|I only know" <path>`
Each hit must justify itself or go.
