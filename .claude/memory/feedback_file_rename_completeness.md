---
name: feedback-file-rename-completeness
description: "When moving or renaming a file, always grep the entire project for every reference before declaring done — a missed reference breaks the Docker build"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6316ff08-57bd-46a0-9626-965801747012
---

Quand un fichier est renommé ou déplacé, **toutes** les références à l'ancien nom doivent être mises à jour dans la même opération, avant de marquer la tâche comme terminée.

**Why:** En migrant `.devcontainer/bash_helpers.sh` vers `.devcontainer/scripts/interactive.sh`, les références dans le `Dockerfile` (ligne `COPY`), `docker-entrypoint.sh` (ligne `source`) et `devcontainer.json` (`postCreateCommand`) ont été oubliées — ce qui a cassé le build Docker et a obligé Christophe à corriger manuellement.

**How to apply:**

1. Avant toute opération de renommage/déplacement, lancer `grep -r "ancien_nom" . --include="*.sh" --include="Dockerfile*" --include="*.json" --include="*.yaml" --include="*.yml" --include="*.md"` pour établir la liste exhaustive des références.
2. Mettre à jour **toutes** les occurrences dans la même session, y compris :
   - Lignes `COPY` dans le `Dockerfile`
   - Lignes `source` dans les scripts d'entrée (`docker-entrypoint.sh`)
   - Commandes `postCreateCommand`/`postStartCommand` dans `devcontainer.json`
   - Lignes `source` dans `.bashrc` (si ajoutées par un hook)
3. "Terminé" signifie que `docker compose build` réussit — pas seulement que le fichier a été déplacé.
4. Pour les fichiers d'infrastructure devcontainer, une erreur est particulièrement coûteuse car elle n'est détectée qu'au rebuild de l'image.

**Exception:** Les références dans les articles de blog (`blog/**/files/`) sont des fichiers d'exemple — ne pas les modifier.
