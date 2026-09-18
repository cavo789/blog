---
name: project-webpack-prod-cache-isolation
description: "node_modules/.cache/webpack est découpé par mode — purger les *-production-* donne un build froid sans toucher au cache du serveur de dev"
metadata:
  type: project
---

Un build de vérification isolé (`DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify
npx docusaurus build --locale en --locale fr --out-dir build-verify`) **ne suffit pas** à
re-compiler un article : le cache persistant de webpack vit dans `node_modules/.cache/webpack/`,
partagé entre tous les builds et le serveur de dev, et il est indépendant du dossier de codegen.

Ce cache est découpé par mode et par locale :

```text
node_modules/.cache/webpack/
  client-development-en     <- le serveur de dev de l'auteur
  client-production-en   server-production-en
  client-production-fr   server-production-fr
```

Donc `rm -rf node_modules/.cache/webpack/*-production-*` force un build à froid **sans toucher**
au cache du serveur de dev — l'alternative sûre au `yarn clear` interdit ici (voir
[[project-build-devserver-clear-clash]]).

**Why:** vérifié le 2026-09-18. Après avoir généré 8 sidecars `.eli5.json`, le build isolé rendait
les snippets **sans aucune annotation** : webpack re-servait la compilation MDX d'avant. Le
diagnostic naturel — « le plugin n'injecte pas » — était faux, et `touch index.md` ne corrige rien
(le build de production invalide par **hash**, pas par mtime). Le sidecar n'est pas une dépendance
déclarée du module : seul le contenu du `.md` compte pour la clé de cache, donc **toute** donnée
lue par un plugin remark à côté de l'article (eli5, questions, traductions) est invisible pour
l'invalidation.

**How to apply:** avant de conclure qu'un plugin remark n'injecte rien, purger les caches
`*-production-*` et rebuilder. Corollaire pour la vérification d'artefact
([[feedback-verification-discipline]]) : un `grep` à zéro sur un build chaud ne prouve rien tant
que le cache n'a pas été purgé.
