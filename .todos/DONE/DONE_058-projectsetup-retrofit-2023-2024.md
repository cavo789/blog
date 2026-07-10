# 058 — ProjectSetup non rétrofité sur des articles de 2023-2024 créant plusieurs fichiers

**Priority:** Low
**Category:** component-reuse

## Problem

`<ProjectSetup>` (créé 2026-01-03) enveloppe une série de `<Snippet>`/`<Guideline>` dans une boîte
pliable avec script d'installation en un clic + téléchargement ZIP. `PARTIAL_051` a déjà identifié
et partiellement traité ce retrofit pour 3 articles de `blog/2025`. L'audit `/review_blog` complet
a trouvé la même opportunité sur des articles plus anciens (2023-2024), tous substantiellement
retouchés après janvier 2026 (donc le composant existait bien au moment des dernières éditions) :

- `blog/2023/12/04/docker-ssl-encrypt/index.md:24-46` — 4 fichiers scripts (encrypt.sh/decrypt.sh/
  encrypt.cmd/decrypt.cmd)
- `blog/2023/12/07/docker-init/index.md:54,64,87,124` — compose.yaml/Dockerfile/index.php/
  .dockerignore
- `blog/2023/11/29/docker-python/index.md:30,64` — Hello.py/Hangman.py
- `blog/2023/11/28/docker-java/index.md:27,66` — Main.java/API.java
- `blog/2024/01/03/quarto-revealjs-tips/index.md` — assets/style.css + assets/custom.js
- `blog/2024/01/05/docker-mssql-server/index.md` — create_db.sql + connect.ps1
- `blog/2024/01/06/docker-postgrest/index.md` — create_db.sql + tutorial.conf
- `blog/2024/02/04/docusaurus-docker/index.md` — Dockerfile + .dockerignore + compose.yaml

## Proposed solution

Envelopper chaque séquence de création de fichiers dans `<ProjectSetup folderName="..."
createFolder={true}>...</ProjectSetup>`, sur le modèle des retrofits déjà faits dans
`quarto-devcontainer`/`running-docusaurus-using-docker` (voir `PARTIAL_051`). Vérifier au cas par
cas qu'aucun contenu pédagogique (AlertBox, StepsCard, paragraphe explicatif) n'est intercalé entre
les Snippets — sinon appliquer le même raisonnement que pour `docker-prod-devcontainer` (laissé de
côté dans `PARTIAL_051`) et ne pas envelopper.

## Affected posts

`docker-ssl-encrypt`, `docker-init`, `docker-python`, `docker-java` (2023) ;
`quarto-revealjs-tips`, `docker-mssql-server`, `docker-postgrest`, `docusaurus-docker` (2024).

## Relationship to existing TODOs

Étend [[051]] (`PARTIAL_051-projectsetup-underused-for-multi-file-creation`) à des années
antérieures à 2025. Noter aussi que `PARTIAL_051` lui-même devrait être complété avec 3 articles
supplémentaires trouvés dans son propre périmètre (`blog/2025`, non listés à l'origine) :
`docusaurus-go-top` (index.js+styles.module.css), `docusaurus-snippets` (idem),
`updated_component` (idem) — mêmes fichiers simples sans contenu interstitiel, retrofit sûr.
