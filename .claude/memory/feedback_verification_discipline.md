---
name: feedback-verification-discipline
description: "Comment vérifier un changement sur ce dépôt : l'artefact, pas le code de retour — et les deux méthodes qui ne trouvent pas les mêmes bugs"
metadata:
  node_type: memory
  type: feedback
---

Leçon de méthode dégagée de la session du 2026-09-16 (chantier i18n, 19 défauts trouvés). Elle
dépasse l'i18n : elle s'applique à tout changement touchant les plugins, la config ou le build.

**`exit=0` ne prouve que la compilation.** Quatre pannes de cette session ont produit un build
vert et un contenu faux : flux RSS vide, zéro miroir Markdown, prose anglaise sous URL française,
pages rendant une locale périmée. Aucune n'a émis le moindre avertissement.

**Deux méthodes de recherche, qui trouvent des choses différentes :**

- **Compter l'artefact** — `<item>` d'un flux, `<loc>` d'un sitemap, fichiers sur disque, `grep`
  du HTML produit. Attrape ce qui produit quelque chose de **faux**. A trouvé 17 des 19.
- **Relire le code** en se demandant, pour chaque chemin manipulé : *d'où vient-il ?* Attrape ce
  qui produit une **absence** — une regex qui ne matche jamais, une comparaison toujours fausse.
  Les 2 derniers, invisibles à toute vérification d'artefact. Un utilisateur ne les signale
  jamais : on ne rapporte pas l'absence d'une fonctionnalité dont on ignore l'existence.

**Préférer un mécanisme à une discipline.** Sur une session longue, la vigilance ne tient pas.
Chaque fois, j'ai commencé par la consigne et fini par le mécanisme, après avoir payé l'erreur :
validateur structurel plutôt que prompt plus long ; épinglage déterministe des ancres plutôt que
règle de rédaction ; `assert old in s` avant chaque remplacement plutôt que relecture du diff ;
[[project_i18n_architecture]] et `.claude/scripts/safe_build.sh` plutôt que « faire attention aux
builds concurrents » — règle écrite après la 1ʳᵉ occurrence, puis enfreinte deux fois.

**Instrumenter avant d'émettre une hypothèse.** Sur un seul bug, quatre hypothèses successives
ont échoué (regex, nom de champ, `siteDir`, concurrence) là où **trois valeurs imprimées** ont
donné la réponse immédiatement. Le réflexe correct au premier résultat surprenant : afficher la
taille de l'ensemble, un échantillon de chaque côté, et la clé calculée.

**Et purger avant de conclure.** `rm -rf .docusaurus build` laisse `node_modules/.cache`, qui
resert les compilations de la locale précédente. Trois faux diagnostics à cause de ça. Toujours
`yarn clear`.
