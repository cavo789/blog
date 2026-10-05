---
name: project-questions-triage
description: questions triage (scripts/questions-triage.mjs) — LLM judge replacing manual review of ~2 400 Ask-my-blog questions; stamp-based idempotence; first corpus run planned 2026-09-24
metadata:
  node_type: memory
  type: project
  originSessionId: 4145c012-a173-4b33-ad4a-c82285fdbac3
  modified: 2026-09-23T20:00:27.001Z
---

`questions triage` was built on 2026-09-23 because the author refuses to hand-review ≈ 2 400 questions and chose to trust the LLM's judgment (no manual calibration sample).

- One Ollama call per article (code-quality): the whole article, with its <Snippet>/<Terminal> files inlined (the English folder for FR), plus its numbered questions → answered + heading **by anchor from an enum** (a numeric index was confused by titles like "4. Create the Dockerfile").
- Duplicates are decided WITHOUT the model: a question is rejected when it adds no BM25 term (the site's own tokenizer, ported into the script) that an earlier kept question lacks. Asked to the LLM, the duplicate verdict flip-flopped between EN and FR and threw away useful rephrasings. Measured: only 1 lexical duplicate per corpus, because the generator already prevents them.
- Tested 2026-09-23 as a dry run on 4 articles × EN/FR (tiny, medium, 24 headings, longest): consistent verdicts between the two languages. It **rejects, never deletes** (`rejected` list in the sidecar, `--restore` puts it back), and holds an article when more than 50% would be rejected.
- The ●◐○ AnythingLLM rank is deliberately NOT an input: ○ falsely flagged Q5/Q6 of docker-php-run-script-or-website, which the article answers word for word.
- Idempotence comes from the `triage` stamp (article hash + questions hash), not from the model. It was verified: the 2nd run makes 0 calls and leaves the file byte-identical.
- The script refuses to write while `generate-questions.mjs` runs (lost-update race). A compare-before-write guard was offered but not implemented.

**Why:** a manual review of the whole corpus is not realistic ([[feedback-quality-over-speed]] still applies to the judge's quality).
**How to apply:** the full EN run was planned for 2026-09-24, after the `--all --force` regeneration. If asked about its results, look at the `triage.status` values in the sidecars (`applied` / `held` / `restored`).
