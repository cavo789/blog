# Internal link opportunities — TERMINÉ

Généré par `scripts/internal-link-opportunities.mjs` le 2026-07-27, traité intégralement le même jour.

## Problème

Le maillage interne du blog était faible : 102 articles sur 238 (43 %) ne pointaient
vers aucun autre article. Le script listait, pour chaque article, les sujets déjà
nommés dans la prose mais jamais liés.

## Résultat

**159 articles traités**, ~230 liens internes ajoutés en trois passes.

| Métrique                       | Avant                  | Après                  |
| ------------------------------ | ---------------------- | ---------------------- |
| Liens internes `<Link to=...>` | 220                    | 697                    |
| Liens internes Markdown        | 23                     | 24                     |
| **Total interne**              | **243** (1,02/article) | **721** (3,03/article) |
| Liens externes                 | 669                    | 668                    |
| Ratio externe : interne        | 2,75 : 1               | 0,93 : 1               |
| Articles liant vers un autre   | 136 / 238 (57 %)       | 232 / 238 (97 %)       |
| **Articles orphelins**         | **102 (43 %)**         | **6 (3 %)**            |

`npx docusaurus build` validé après chaque lot : aucun lien cassé.

## Méthode retenue (à réutiliser)

Les suggestions du script sont un **indice, pas une spécification** : le classement
se base sur des mots et tags partagés, donc il propose souvent des paires faibles
(`docker image` matchant quatre articles PHP sans rapport) tout en ratant le lien
évident que la prose réclame. Lire l'article, lier le concept réellement nommé —
un outil, un prérequis, une suite — et placer le lien **inline, là où le terme
apparaît**, jamais en liste de liens en fin d'article.

Les liens réciproques (A→B et B→A) ont été systématisés par familles : les trois
articles diagram-as-code, les deux qui swizzlent `BlogPostItem/Content`, les trois
façons d'avoir une GUI Linux sous Windows, le trio `.env`, la famille Quarto, etc.

## Les 6 articles restants sans lien sortant

Ils n'apparaissaient pas dans le rapport (aucune suggestion pertinente trouvée par
le script). Rien à faire, ce sont des articles trop courts ou trop isolés
thématiquement pour qu'un lien soit naturel.

## Pour régénérer un rapport frais

```bash
node scripts/internal-link-opportunities.mjs --stats
node scripts/internal-link-opportunities.mjs --out .todos/internal-link-opportunities.md
```
