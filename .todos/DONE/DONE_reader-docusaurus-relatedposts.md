# Reader review : docusaurus-relatedposts

**Détecté :** 2026-08-08
**Article :** blog/2025/09/03/docusaurus-relatedposts/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (preuve — la capture `The final result` — en ligne 119, soit la
toute dernière ligne d'un corps de 84 lignes après `<!-- truncate -->`).
Drapeaux : **abstraction-avant-preuve** — trois `<Snippet>` de code (l.62, l.68, l.82) sont lus
avant toute confirmation visuelle que le composant fonctionne.
Redondance : aucune notable.

Test des 30 secondes : "on me fait créer un composant Card ailleurs, un utilitaire
`posts.js`, un composant `RelatedPosts`, puis on swizzle `BlogPostItem` — et la seule image
d'un résultat qui marche est la toute dernière ligne de l'article." Un lecteur qui veut
juste voir si ça vaut le coup construit tout un theme override à l'aveugle.

## Risque

L'image `./images/final.webp` (l.119) est déjà la preuve la plus convaincante de l'article —
elle existe, elle est prête — mais elle arrive après cinq sections d'implémentation. L'image
`./images/related.webp` (l.33) est bien placée dans l'accroche (avant `<!-- truncate -->`),
mais rien ne la reprend juste après la coupure : le corps repart directement en mode
implémentation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Rappel du résultat visé juste après `<!-- truncate -->` : reprendre `./images/final.webp` (déplacée) avec une légende expliquant ce que fait le composant | l.119 (image déplacée) |
| 2 | `## Why it works` — 3-4 puces sans code : matching par `mainTag`, réutilisation du `Card`, override du thème plutôt que fork complet | nouveau texte, condensé depuis l.37, l.64-72 |
| 3 | `## We need a Card component` (prérequis) | l.37-43 |
| 4 | `## We need a way to extract information from blog posts` + Snippet `posts.js` | l.45-62 |
| 5 | `## Our RelatedPosts component` + Snippet | l.64-68 |
| 6 | `## Overriding the BlogPostItem template` + Snippet + AlertBox restart | l.70-90 |
| 7 | `## Editing our blog posts` — pourquoi rien ne s'affiche, `mainTag`/`tags` requis, exemple de frontmatter | l.92-117 |
| 8 | `## Conclusion` — à ajouter, l'article n'en a pas actuellement | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
