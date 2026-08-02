---
name: feedback-article-weight
description: "Christophe rejects long failure post-mortems in articles — a post must make the reader want to try, not brace for trouble"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 730b1c8e-8d59-42ba-a3e3-c1eb15e1cb6b
  modified: 2026-08-01T17:44:47.812Z
---

Do not stack "here is how it failed and why" post-mortems in an article. On the `ai-test` post (2026-08-03) Christophe reacted to a "Cause 1 / Cause 2 / Cause 3" breakdown with *"tout ça est tellement lourd et complique tellement l'article. On a envie d'abandonner en fait."* Same verdict on a bespoke `Dockerfile` built just to make a demo pass: *"c'est lourd ; ce n'est pas piece of cake ; pas standard."*

**Why:** the goal of a post is to make the reader want to try the thing. Every extra failure analysis and every non-standard setup step reads as "this will be painful", and the reader gives up before reaching the payoff.

**How to apply:**

- Keep **at most one** failure story per article, and only when it is the article's payoff (e.g. "the generated test suite caught a real bug"). Compress the rest into a short `<AlertBox>`.
- Prefer the **standard, official image or tool**. If a demo only works with a custom `Dockerfile`, a patched image or an exotic flag, that is a signal to change the demo, not to document the workaround.
- When a demo script is what drags the article down, **simplify the script**. Christophe explicitly authorized this: *"Si les scripts Bash utilisés comme exemple sont trop compliqués; alors on les simplifie."* Removing a dependency on `date`/GNU coreutils from the example killed three sections at once.
- First demo should **just work** (green run). Save the interesting failure for a later demo.

Related: [[writing-style]], [[feedback-post-creation]].
