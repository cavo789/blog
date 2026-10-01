---
name: project-ssh-config-tips-publication
description: "Article ssh-config-tips prévu jeudi 2026-10-02, config 5 sections après fix devcontainer ProxyJump"
metadata:
  node_type: memory
  type: project
  originSessionId: f194a2e8-f147-4cff-9134-a7928cac5ed1
---

Article `.unpublished/ssh-config-tips/index.md` prévu le **2026-10-02** (jeudi).

Fix intégré 2026-09-29 : la config est passée de 4 à 5 sections :
- Section 4 (nouvelle) : exceptions explicites avec `ProxyJump none` avant `Host *`
- Section 5 (ex-4) : wildcard `Host * !%%vmIp%%` — conserve le `!bastion`

**Why:** `code.bosa.fgov.be` n'était pas dans les exclusions → SSH essayait un ProxyJump via `ABO-VMHYP-DEV01` non résolvable dans le devcontainer.

**How to apply:** à la publication, penser à vérifier que `draft: true` est bien retiré du frontmatter.
