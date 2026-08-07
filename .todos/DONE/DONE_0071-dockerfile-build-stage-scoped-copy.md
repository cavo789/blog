# 0071 — Remplacer le COPY blanket dans le stage build par des COPY ciblés

- **Priority**: High
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`, `.dockerignore`

## Problème

Le stage `build` (ligne 201 du Dockerfile) utilise `COPY --chown=... . .` — une copie générique de
tout le contexte. Même avec le `.dockerignore` corrigé, cette instruction envoie des fichiers non
nécessaires dans une couche intermédiaire (ex. `nginx.conf`, `localhost.pem`, `localhost-key.pem`,
`config.yaml`, `api/`, `scripts/`, etc.).

## Risque

Augmentation de la taille de l'image, surface d'attaque inutilement large, et risque résiduel que
des fichiers non anticipés entrent dans le build si le `.dockerignore` est un jour mal maintenu.

## Solution

Remplacer le `COPY . .` par des COPY explicites pour exactement ce dont Docusaurus a besoin :

```dockerfile
# Contenu et configuration Docusaurus
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" blog/           ./blog/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" src/            ./src/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" static/         ./static/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" plugins/        ./plugins/
COPY --chown="${OS_USERNAME}":"${OS_USERNAME}" docusaurus.config.js sidebars.js ./
# À vérifier : config/, scripts/, api/, config.yaml sont-ils nécessaires pour yarn build ?
```

Vérifier que `yarn build` passe sans erreur après le changement. Documenter dans ce TODO les
répertoires finalement inclus vs exclus.
