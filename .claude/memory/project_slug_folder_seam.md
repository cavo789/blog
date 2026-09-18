---
name: project_slug_folder_seam
description: 27 articles ont un dossier dont le nom diffère du slug front-matter ; toute dérivation de slug depuis un chemin casse en silence
metadata:
  node_type: memory
  type: project
  originSessionId: 07a0456c-3790-4a00-89dd-0b3bc5580ec4
  modified: 2026-09-18T14:13:28.971Z
---

Sur `blog/`, **27 articles sur 257** ont un nom de dossier différent de leur `slug:` front-matter
(`blog/2024/02/20/docker-extra-hosts` → slug `docker-network-and-extra-hosts`, `htaccess` →
`apache-htaccess`, `ssh_with_fzf` → `ssh-with-fuzzy-finder`…). C'est légal et voulu.

Le manifeste (`plugins/translations-manifest-plugin`, fonction `articleMetaFor`) indexe **sur le
front-matter**. Tout code qui dérive un slug **depuis un chemin** rate donc ces 27 articles.

**Why:** en 2026-09-18, `scripts/lib/i18n-eligibility.mjs` gatait « cet article est-il traduit ? »
sur le nom de dossier alors que `collectTranslations()` clé sur le slug. 16 articles traduits —
74 snippets — ont été déclarés non traduits et sautés indéfiniment. **Rien n'a échoué** : le
Snippet loader retombe sur le sidecar anglais par design (TODO 0121), donc le seul symptôme était
un lecteur francophone voyant des annotations anglaises, et `--dry-run` répondant sereinement
« every snippet is up to date ». 230 articles sur 257 coïncidant, le bug était invisible.

**How to apply:** ne jamais recalculer un slug depuis un chemin — importer `slugFor()` exporté par
`plugins/translations-manifest-plugin/index.cjs`. Une deuxième copie de « comment obtenir un slug »
est exactement ce qui a produit le bug. Vérification : `node .claude/scripts/eli5_slug_mismatch.mjs`
interroge le vrai gate (pas une ré-implémentation) et sort 1 si la couture recasse — candidat à
`run_ci`. Voir [[project_i18n_architecture]] et [[feedback_verification_discipline]].
