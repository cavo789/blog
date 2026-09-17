# 0126 — `questions review` ne voit pas les sidecars français

- **Priority**: medium
- **Batch**: i18n-fr
- **Depends**: —
- **Files**: `scripts/questions-review.mjs`, `.devcontainer/scripts/interactive.sh`, `package.json`

## Context

`scripts/questions-review.mjs` code en dur `BLOG_DIR = path.join(projectRoot, "blog")` (ligne 45)
et parcourt `findPosts(BLOG_DIR)`. Les trois actions de relecture — `questions review`,
`questions status`, `questions list` — ne voient donc **que** le corpus anglais. Les sidecars
`.questions.json` générés sous `i18n/fr/docusaurus-plugin-content-blog/` sont inatteignables.

Ce n'est pas un problème de couverture : le hook pre-commit `questions-freshness` signale
correctement les articles français sans sidecar (vérifié le 2026-09-17 — il affiche
« questions coverage (fr): 99 translated article(s) with no sidecar yet »). La génération
fonctionne aussi (`questions --locale fr --all`). C'est **la relecture** qui manque.

L'enjeu : `plugins/questions-index-plugin/index.cjs` ne consulte jamais le champ `reviewed` — il
publie toutes les questions présentes dans un sidecar dès qu'il existe. Une question française
mal formulée part donc en ligne et il n'existe aujourd'hui aucun moyen de la corriger via l'outil
prévu pour ça. À 99 articles à générer, c'est 99 articles sans boucle de contrôle qualité.

Le patron de correction est connu et éprouvé : c'est celui utilisé pour l'indexation AnythingLLM
(TODO 0125) — rendre le répertoire source paramétrable plutôt que de dupliquer le script.
L'exclusion (`x`) fonctionne en vidant le tableau `questions` **et** en posant `excluded: true` ;
le plugin saute les sidecars vides, donc ce mécanisme reste valable en français sans changement.

## Acceptance

- [ ] `questions review --locale fr` parcourt les articles traduits de
      `i18n/fr/docusaurus-plugin-content-blog/` et écrit `reviewed` / `excluded` dans le sidecar
      français correspondant, sans jamais toucher au sidecar anglais du même slug.
- [ ] `questions status --locale fr` et `questions list --locale fr <slug>` répondent sur le même
      corpus.
- [ ] La résolution d'un `<post>` par slug fonctionne en français (aujourd'hui elle résout vers
      `blog/YYYY/MM/DD/<slug>/index.md`, cf. ligne 145).
- [ ] La cheatsheet `questions` perd sa ligne « English corpus only: the reviewer reads blog/,
      never i18n/ » et documente `--locale` côté review, comme elle le fait déjà côté génération.
- [ ] Le corpus anglais reste le défaut : `questions review` sans argument se comporte exactement
      comme aujourd'hui.
