# 0114 — Régénérer le corpus ELI5 (`blog/`) pour ajouter le champ `summary`

- **Priority**: Medium
- **Batch**: eli5-verbose
- **Depends**: 0113
- **Files**: `blog/**/*.eli5.json` (~875 sidecars existants sous `blog/`, régénérés via
  `scripts/bulk-eli5.mjs` — script lui-même non modifié, seulement exécuté)

## Contexte

TODO 0113 (DONE) a ajouté un champ `summary` au schéma `.eli5.json` (prompt Claude étendu dans
`generate-eli5.mjs` et `bulk-eli5.mjs`), condition pour que le nouveau bloc Show/Hide s'affiche
sous un `<Snippet>`. Seul l'article pilote (`gitlab-runner-ssh-key/files/.gitlab-ci.yml`) a été
régénéré avec ce nouveau champ pendant 0113 — c'est actuellement le **seul** fichier du corpus à
avoir un bloc Show/Hide fonctionnel.

## État du corpus (vérifié le 2026-09-01)

- 869 usages de `<Snippet source="...">` dans `blog/`.
- 875 sidecars `.eli5.json` existants sous `blog/` : 807 déjà présents avant cette session, 68
  générés par l'auteur le jour-même via `yarn eli5` (avec `--dir .`, donc racine du repo plutôt
  que `blog/` — voir note ci-dessous) avec l'**ancien** schéma (pas de `summary`).
- 1 seul fichier (le pilote) a le nouveau champ `summary`.
- `.unpublished/` : 36 usages de `<Snippet source="...">` mais **0** sidecar existant —
  volontairement hors scope ici, voir Non-goals.

## Action

```bash
yarn eli5:bulk --force
```

`--dir` par défaut est déjà `blog/` — ne pas repasser `--dir .` (racine). Le scan par défaut
couvre aussi les sources référencées depuis `blog/*.md` même si elles vivent hors de `blog/`
(ex. certains fichiers `.claude/`, `src/components/`, déjà repérés dans le corpus existant) : ce
sont des références légitimes depuis des articles, `--dir blog` les régénère correctement sans
ratisser tout le repo comme l'a fait le `--dir .` du 2026-09-01 (qui avait accroché des docs
`.claude/` sans lien avec un article, en faux positif potentiel — à vérifier au passage si ce
correctif touche aussi ces fichiers-là ou s'ils doivent être retirés séparément).

## Non-goals

- `.unpublished/` n'est pas régénéré ici : ce sont des brouillons non publiés, pas de bloc
  Show/Hide à activer avant publication. Si un jour on veut du ELI5 sur les drafts, ce sera un
  TODO séparé.
- Le polish visuel du bloc Show/Hide (repéré en aparté le 2026-09-01 : bloc visible même Snippet
  replié, poids visuel du toggle trop proche de l'en-tête) est traité indépendamment — pas un
  prérequis technique pour cette régénération, mais mieux vaut l'avoir mergé avant de publier des
  captures d'écran du résultat.

## Risque

- **~875 appels API Claude Haiku** — pas de coût significatif au tarif du modèle, mais compter
  20-30 minutes en série. Pas d'urgence : l'auteur l'exécute quand il a ce créneau.
- **Diff massif en un coup** (jusqu'à 875 fichiers modifiés) — commit dédié, séparé de tout autre
  travail, message explicite (pas noyé dans un commit "misc").
- Qualité du nouveau champ `summary` non vérifiée à grande échelle (un seul article pilote validé
  visuellement) — un échantillon post-génération reste nécessaire avant de considérer le corpus
  fiable.

## Acceptance

- [ ] `yarn eli5:bulk --force` exécuté (pas `--dir .`)
- [ ] Compte de fichiers avec `"summary"` vérifié avant/après
      (`grep -rl '"summary"' blog --include="*.eli5.json" | wc -l`) — doit approcher 875
- [ ] Échantillon de 5-10 articles (tailles/langages variés) vérifié visuellement : bloc Show/Hide
      s'affiche, texte cohérent et utile, pas de troncature ni de JSON mal formé
- [ ] `yarn lint && yarn format:check && yarn build` passent après coup
- [ ] Commit dédié à cette régénération, séparé de tout autre changement en cours
