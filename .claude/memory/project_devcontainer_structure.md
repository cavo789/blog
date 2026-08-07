---
name: project-devcontainer-structure
description: "Structure et rôle de chaque fichier dans .devcontainer/ — scripts, Dockerfile COPY paths, points de montage"
metadata:
  node_type: memory
  type: project
  originSessionId: 6316ff08-57bd-46a0-9626-965801747012
---

## Structure `.devcontainer/`

```
.devcontainer/
  compose.yaml                  # service "docusaurus" + service "languagetool"
  devcontainer.json             # config VS Code Dev Container
  devcontainer-lock.json
  docker-entrypoint.sh          # ENTRYPOINT du Dockerfile racine
  history/                      # .bash_history persisté (bind-mount depuis l'hôte)
  mkcert-ca/                    # certificats TLS locaux
  scripts/
    interactive.sh              # cheatsheet dynamique, sourcé dans .bashrc
```

## Chemins critiques à tenir synchronisés

| Source (repo) | Destination (image) | Mécanisme |
|---|---|---|
| `.devcontainer/scripts/interactive.sh` | `/usr/local/bin/interactive.sh` | `COPY --chmod=755` dans `Dockerfile` (ligne ~139) |
| `.devcontainer/docker-entrypoint.sh` | `ENTRYPOINT` | `COPY` dans `Dockerfile` |

## Points de wiring

- **`docker-entrypoint.sh`** — source `/usr/local/bin/interactive.sh` au démarrage du container.
- **`devcontainer.json` `postCreateCommand`** — ajoute `source /opt/docusaurus/.devcontainer/scripts/interactive.sh` dans `/home/node/.bashrc` (pour les sessions bash interactives VS Code).
- **`devcontainer.json` `initializeCommand`** — crée `.devcontainer/history/` et `.devcontainer/history/.bash_history` sur l'hôte avant le build.
- **Bind-mount** : `.devcontainer/history/.bash_history` → `/home/node/.bash_history` (persistance de l'historique bash entre rebuilds).

## Why: implication pour les renommages

Si `scripts/interactive.sh` est renommé, mettre à jour simultanément :
1. La ligne `COPY` dans `Dockerfile` (~ligne 139)
2. La ligne `source` dans `docker-entrypoint.sh`
3. Le `postCreateCommand` dans `devcontainer.json`

Voir [[feedback-file-rename-completeness]].
