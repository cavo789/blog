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
    interactive.sh              # LAUNCHER seul, sourcé dans .bashrc — ne contient plus aucune commande
    helpers/                    # une commande par catégorie du cheatsheet (TODO 0123)
      _cheatsheet.sh            # welcome() + le double awk qui parse @cat/@cmd/@desc
      server.sh                 # start, start_fr, static
      maintenance.sh            # build, upgrade, check, format
      metadata.sh               # tags, yaml, links
      ollama.sh                 # eli5, faq, questions
      anythingllm.sh            # ai-index, ai-search, ai-index-fr, ai-search-fr
      ci.sh                     # run_ci, _run_ci_links
      translation.sh            # translate
```

Le launcher résout `helpers/` **relativement à lui-même** (`INTERACTIVE_SCRIPTS_DIR`), jamais en
dur : c'est ce qui fait marcher les deux chemins de chargement ci-dessous. `welcome()` scanne
`"${INTERACTIVE_SCRIPTS_DIR}"/helpers/*.sh` — **tous** les modules, plus lui-même — et non plus son
seul `${BASH_SOURCE[0]}` comme avant l'éclatement, ce qui viderait le cheatsheet.

## Chemins critiques à tenir synchronisés

| Source (repo) | Destination (image) | Mécanisme |
|---|---|---|
| `.devcontainer/scripts/` (le **dossier**) | `/usr/local/bin/interactive.sh` + `/usr/local/bin/helpers/*.sh` | `COPY --chmod=755` dans `Dockerfile` (ligne ~144) |
| `.devcontainer/docker-entrypoint.sh` | `ENTRYPOINT` | `COPY` dans `Dockerfile` |

`.dockerignore` exclut tout `.devcontainer/` : les ré-inclusions `!.devcontainer/scripts/interactive.sh`,
`!.devcontainer/scripts/helpers` et `!.devcontainer/scripts/helpers/*.sh` sont ce qui met les modules
dans le contexte de build. Sans elles, l'image embarque un launcher sans modules et **tout shell de
l'image démarre sur un cheatsheet vide**.

## Points de wiring

- **`docker-entrypoint.sh`** — source `/usr/local/bin/interactive.sh` au démarrage du container.
- **`devcontainer.json` `postCreateCommand`** — ajoute `source /opt/docusaurus/.devcontainer/scripts/interactive.sh` dans `/home/node/.bashrc` (pour les sessions bash interactives VS Code).
- **`devcontainer.json` `initializeCommand`** — crée `.devcontainer/history/` et `.devcontainer/history/.bash_history` sur l'hôte avant le build.
- **Bind-mount** : `.devcontainer/history/.bash_history` → `/home/node/.bash_history` (persistance de l'historique bash entre rebuilds).

## Why: implication pour les renommages

Si `scripts/interactive.sh` (ou `scripts/helpers/`) est renommé ou déplacé, mettre à jour
simultanément :
1. La ligne `COPY` dans `Dockerfile` (~ligne 144) — elle copie le **dossier**, pas le fichier
2. Les ré-inclusions `!.devcontainer/scripts/...` dans `.dockerignore`
3. La ligne `source` dans `docker-entrypoint.sh`
4. Le `postCreateCommand` dans `devcontainer.json`

Test le plus rapide après coup : `welcome` doit lister **19 commandes en 7 catégories**
(`bash -c 'source .devcontainer/scripts/interactive.sh'`), et la même chose depuis
`/usr/local/bin/interactive.sh` dans une image fraîchement construite.

Voir [[feedback-file-rename-completeness]].
