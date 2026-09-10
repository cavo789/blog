# 0117 — Bloc « Testé avec / le » : rendre visibles les versions réellement utilisées

- **Priority**: Medium — fort effet de confiance, mais nécessite un remplissage progressif
- **Batch**: blog-article-header
- **Depends**: —
- **Files**: `src/components/Blog/TestedWith/` (à créer), `src/theme/BlogPostItem/index.js`, `CLAUDE.md`, `.claude/skills/blog-post-structure/SKILL.md`

## Problème

L'article d'ActuIA analysé le 2026-09-10 contient une section « Promesses et faits, **à la date du
10 septembre** » : une liste de faits assortis de leur statut de vérification, daté. C'est le procédé
éditorial qui donne sa crédibilité à la page.

L'équivalent sur un blog technique n'est pas un statut de vérification, c'est **l'environnement de
test**. La question numéro un du lecteur d'un tutoriel est « est-ce que ça marche encore chez moi,
aujourd'hui, avec ma version ? ». Aujourd'hui le blog n'y répond nulle part de façon lisible :

- `review_date` existe dans **142 articles sur 255**, mais `src/components/Blog/OldPostNotice/index.tsx`
  ne l'exploite **que pour les articles de plus d'un an** — un article de six mois avec un
  `review_date` frais n'affiche rien du tout. L'information est saisie et invisible.
- Les versions réellement utilisées sont **noyées dans la prose** : un `ARG` dans un Dockerfile
  affiché via `<Snippet>`, une sortie de terminal dans un `<Terminal>`, ou une phrase du corps du
  texte. Exemple vérifié dans `blog/2026/09/03/lazydocker/index.md`, où la version est déléguée à un
  « check the releases page » et à un `ARG` du Dockerfile.

Il n'existe donc aucun endroit où le lecteur lit, en un coup d'œil, sur quoi l'auteur a
effectivement fait tourner ce qu'il décrit.

## Solution

Deux champs de frontmatter, optionnels, et un petit bloc de rendu :

```yaml
tested_on: 2026-09-03
tested_with: ["Docker 27.3", "WSL2 / Ubuntu 24.04", "lazydocker 0.24"]
```

Rendu en bandeau compact **sous le `<TLDR>`**, dans le style d'un `<AlertBox variant="tip">` mais plus
discret — une ligne, icône + « Tested on 3 September 2026 with Docker 27.3 · WSL2 / Ubuntu 24.04 ».
Invisible si les champs sont absents : aucun article existant n'est cassé, et le corpus se remplit au
fil de l'eau (notamment pendant les passages de `/freshness`).

Points d'attention :

- **Parsing de date.** `plugins/frontmatter-loader/index.cjs` sérialise déjà *n'importe quelle*
  instance `Date` (fonction `serialize`), donc `tested_on` traverse sans modification du loader. En
  revanche, côté rendu, la valeur arrive comme chaîne ISO après SSR : toujours passer par
  `new Date(value)`, jamais de concaténation de chaîne — c'est un piège déjà rencontré sur ce blog.
- **Articulation avec `review_date` et `OldPostNotice`.** Ce sont deux affirmations différentes
  (« j'ai relu » vs « j'ai exécuté sur telles versions ») et il ne faut pas les fusionner, mais il
  faut éviter d'afficher deux bandeaux qui disent presque la même chose sur un article ancien. Régle
  à trancher : si `OldPostNotice` affiche déjà sa bannière verte « still accurate », le bloc
  `TestedWith` doit se réduire ou se fondre dedans.
- **Documenter les deux champs** dans `CLAUDE.md` (section frontmatter) et dans le skill
  `blog-post-structure`, sinon ils ne seront jamais remplis sur les nouveaux articles.

## Risque

- **Promesse invérifiable qui vieillit.** Un `tested_with: Docker 27.3` affiché fièrement devient un
  aveu de vétusté deux ans plus tard. C'est acceptable — et même souhaitable, c'est une information
  honnête — mais il faut l'assumer : le bloc doit dire « testé avec », jamais « compatible avec ».
- **Remplissage qui ne vient jamais.** Un champ optionnel non documenté et non rappelé reste vide.
  Sans l'ajout à `CLAUDE.md` et au skill, ce TODO produit un composant que personne n'alimente. Cette
  partie n'est pas optionnelle.
- **Tentation du backfill automatique.** Inférer les versions des 255 articles existants par script
  produirait des affirmations fausses (une version lue dans un `ARG` n'est pas une version testée).
  Remplissage manuel uniquement, au fil des relectures.

## Acceptance

- [ ] Les champs `tested_on` et `tested_with` sont documentés dans `CLAUDE.md` et dans le skill
      `blog-post-structure`
- [ ] Le bloc s'affiche sous le `<TLDR>` quand au moins un des deux champs est présent
- [ ] Un article sans ces champs est rendu strictement à l'identique qu'aujourd'hui
- [ ] `tested_on` est formaté via `new Date(value)` et vérifié en build de production (SSR), pas
      seulement en `yarn start`
- [ ] Le cumul avec la bannière de `OldPostNotice` est vérifié sur un article de plus d'un an
      possédant un `review_date` récent, et le doublon visuel est tranché
- [ ] Au moins 3 articles récents sont réellement renseignés à la main pour valider le rendu
- [ ] `yarn lint && yarn format:check && yarn build` passent
