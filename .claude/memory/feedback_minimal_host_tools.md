---
name: feedback-minimal-host-tools
description: l'auteur évite d'installer des outils sur sa machine (pas de npm/Node sur l'hôte) — proposer d'abord la voie intégrée (commande VS Code, container)
metadata:
  type: feedback
---

L'auteur n'a pas npm/Node sur son poste et évite au maximum d'installer des outils sur l'hôte.

**Why:** remarque explicite du 2026-11-08 quand l'article devcontainer-tips proposait `npm install --global @devcontainers/cli`.

**How to apply:** dans un article ou une consigne, proposer d'abord ce qui est déjà là (commande de la palette VS Code, binaire livré par une extension, `docker run`), et ne garder un gestionnaire de paquets que comme alternative (CI, image qui l'a déjà). Voir aussi [[feedback-article-weight]].
