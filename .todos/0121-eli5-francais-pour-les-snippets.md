# 0121 — ELI5 : explications de code en français

- **Priority**: Medium — même famille que 0120, à traiter **après 0120** (décision de l'auteur, 2026-09-17)
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `.devcontainer/scripts/interactive.sh`, `scripts/generate-eli5.mjs`, `scripts/bulk-eli5.mjs`, `scripts/check-eli5-freshness.mjs`, `plugins/remark-snippet-loader/index.cjs`, `scripts/lib/eli5-hash.mjs`

## Problème

Les annotations ELI5 — le résumé sous un `<Snippet>` et les explications ligne par ligne —
restent **en anglais** sur un article traduit. Le lecteur francophone lit un article français,
puis une explication anglaise du code qu'il vient de voir.

C'est le même motif que 0120 (« Ask my blog ») : **du contenu dérivé, généré par IA depuis la
source anglaise, qui n'a pas de contrepartie française.** Les deux TODO partagent les mêmes
décisions de conception, énoncées ici une fois pour les deux.

## Comment ça marche aujourd'hui

- `scripts/generate-eli5.mjs` produit un `<source>.eli5.json` **à côté du fichier source**, pas à
  côté de l'article : `blog/…/files/Dockerfile.eli5.json`. Le fichier décrit du **code**, pas de
  la prose.
- Schéma : `{ version, model, generated, source, sourceHash, lang, summary, explanations }`.
  `lang` est le **langage du code** (`yaml`, `bash`), pas la langue du texte — attention au
  contresens au moment d'ajouter une locale.
- `explanations` est un dictionnaire `{ "numéro de ligne": "texte" }`.
- `plugins/remark-snippet-loader/index.cjs:163` injecte le sidecar s'il existe à côté du fichier.

## Ce qui rend ce cas différent de 0120

**Les fichiers de `files/` ne sont jamais dupliqués sous `i18n/`** — c'est l'invariant posé par
`plugins/remark-i18n-assets`. Le sidecar ELI5 ne peut donc pas simplement « suivre la traduction
de l'article », puisqu'il vit à côté d'un fichier de code qui, lui, reste unique et anglais.

## Solution

- [ ] Choisir la convention de nommage. Recommandé : **`<source>.eli5.<locale>.json`** à côté du
      fichier de code (`Dockerfile.eli5.fr.json`), avec `<source>.eli5.json` conservé comme
      version par défaut. Ça garde le sidecar collé à ce qu'il décrit et évite de dupliquer
      `files/` — l'alternative (un miroir sous `i18n/`) casserait l'invariant ci-dessus.
- [ ] `generate-eli5.mjs` : accepter `--locale fr`. Le **code source reste l'entrée** (il est
      identique dans les deux langues) ; seule la langue de sortie change. Contrairement à 0120,
      il n'y a pas de « générer depuis le fichier traduit » — le fichier décrit du code.
- [ ] Ajouter un champ `textLang` au schéma plutôt que de réutiliser `lang`, qui désigne déjà le
      langage du code. Deux sens pour une même clé est une erreur qui se paie plus tard.
- [ ] **Brancher la génération sur `translate`** (`.devcontainer/scripts/interactive.sh`), pas
      sur une commande séparée. Une fois l'article traduit avec succès, `translate` génère les
      sidecars `fr` de ses snippets, en réutilisant `i18n-eligibility.mjs` et le `sourceHash`.
      Si le code n'a pas changé, aucun appel d'API. Sans ce branchement, il faudrait penser à
      lancer une deuxième commande à la main, et les sidecars français prendraient du retard.
      Le coût ELI5 doit apparaître dans l'estimation affichée par `translate` avant confirmation.
      `--force` ne doit **pas** regénérer un ELI5 dont le code est inchangé : on retraduit
      l'article, pas le code.
- [ ] `remark-snippet-loader` : charger `<source>.eli5.<locale>.json` s'il existe, **sinon
      afficher le sidecar anglais** (décision de l'auteur, 2026-09-17). Un lecteur de blog
      technique lit l'anglais ; ne rien afficher lui retirerait de l'information pour le seul
      bénéfice de l'uniformité visuelle. Avec la génération branchée sur `translate`, ce repli
      ne sert qu'en cas de trou (génération échouée, snippet ajouté après la traduction).
- [ ] `check-eli5-freshness.mjs` : étendre aux sidecars localisés. `sourceHash` porte déjà sur le
      fichier de code, donc la mécanique de fraîcheur fonctionne sans changement — seul
      l'énumération des fichiers est à élargir.
- [x] **Garde-fou écrit — ne pas réimplémenter le filtre.**
      `scripts/lib/i18n-eligibility.mjs` applique les trois conditions : article réellement
      traduit, sidecar anglais déjà présent, sidecar localisé absent ou périmé. Un générateur
      `--locale` doit **consommer ce module**, pas recoder la logique.
      `yarn i18n:budget` affiche ce qui serait touché et ce que ça coûterait, avant de dépenser.
      Mesuré le 2026-09-16 avec 4 articles traduits : **34 fichiers ELI5 éligibles sur 798**,
      **4 index de questions sur 257** — 0,54 $ au lieu de 20,83 $ sans le filtre.
      Note (2026-09-17) : les questions sont générées par Ollama en local, donc gratuites ;
      le montant ne concerne en pratique que les ELI5.
      Une case à cocher est une discipline ; ce module est un mécanisme.

## Risque

**Volume.** `yarn lint:snippets` compte **1280 snippets sur 311 fichiers**. Générer l'ELI5
français de tout le corpus serait bien plus coûteux que la traduction des articles elle-même.
À ne faire que pour les articles traduits, et seulement pour les snippets qui ont déjà un ELI5
anglais — beaucoup n'en ont pas.

**Modèle.** Les ELI5 existants ont été générés avec `claude-haiku-4-5` (voir le champ `model`).
Garder le même pour la cohérence de ton, sauf raison contraire.

## Critère d'acceptation

- Sur un article traduit par `translate`, le résumé sous chaque `<Snippet>` et les infobulles
  de ligne sont en français, sans aucune commande supplémentaire.
- Quand un sidecar français manque (article non traduit servi sous `/fr/`, ou trou ponctuel),
  les annotations anglaises s'affichent. On n'affiche jamais une zone vide.
- Relancer `translate` sur un article dont le code n'a pas changé ne produit aucun appel ELI5.
- Le code lui-même n'est jamais modifié.
