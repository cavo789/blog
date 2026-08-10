# Reader review : docusaurus-series

**Détecté :** 2026-08-08
**Article :** blog/2025/09/09/docusaurus-series/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **42 %** (preuve ligne 153 sur un corps de 267 lignes).
Drapeaux : abstraction-avant-preuve — quatre `<Snippet>` d'implémentation (l. 85-136 : deux
helpers, le composant `SeriesPosts`, sa CSS, puis le fichier `BlogPostItem`) précèdent la
première image de résultat (l. 153, "Our component is now running").
Redondance : "restart Docusaurus" énoncé une fois par swizzle (2 fois sur l'article, l. 138 et
implicite Part 2) — acceptable pour un article en 3 parties, pas de drapeau rouge ici.

Test des 30 secondes : le lecteur est prévenu très tôt (l. 37-40, "Spoiler alert") qu'il peut
cliquer sur `/series` pour voir le résultat en vrai — bon réflexe — mais ce n'est qu'un lien
sortant, pas une preuve montrée dans l'article. Une fois la lecture commencée après le
`<!-- truncate -->`, il enchaîne sur 110 lignes de création de fichiers avant la première
capture d'écran.

## Risque

C'est un article "pilier" volontairement long (3 parties, page `/series` complète), donc une
bonne partie du corps restera nécessairement de l'implémentation — le risque n'est pas la
longueur mais l'ordre : le lecteur investit dans 4 fichiers avant de voir le tout premier
résultat visuel, alors que la capture existe déjà plus loin dans le fichier (l. 153) et pourrait
ouvrir le mouvement 2.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + spoiler alert (inchangé) | l. 29-40 |
| 2 | **Déplacé devant** : capture "Our component is now running" + une phrase annonçant que la Part 2 ajoute la page `/series` (capture l. 237 en teaser) | l. 153, 237 |
| 3 | Part 1 - Creation of the SeriesPosts component (inchangé, code complet) | l. 53-151 |
| 4 | Part 2 - Adding a navigation to series (inchangé) | l. 166-280 |
| 5 | Part 3 - Adding a /src/data/series.js file (inchangé) | l. 282-301 |
| 6 | Conclusion (inchangée) | l. 303-309 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
