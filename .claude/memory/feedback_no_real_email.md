---
name: feedback-no-real-email
description: Never write the author's real email in the repo; use no-reply@gmail.com (OCI labels, git log samples, articles)
metadata:
  type: feedback
---

Never write the author's real email address in any file of the repo (OCI `org.opencontainers.image.authors` label, sample `git log` output in articles, docs). Use `no-reply@gmail.com`.

**Why:** the repo and blog are public; on 2026-11-04 the author found the address exposed in clear and had it replaced everywhere (CLAUDE.md, Dockerfile, docker-review command, a draft).

**How to apply:** when generating a Dockerfile label, a git author line or any contact field, use the placeholder. Related: [[user_profile]].
