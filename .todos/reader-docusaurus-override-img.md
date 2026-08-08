# Reader review : docusaurus-override-img

**Détecté :** 2026-08-08
**Article :** blog/2025/08/21/docusaurus-override-img/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — la seule preuve visuelle prévue par l'auteur est **désactivée** :
lignes 89-95, le rendu réel du composant `<Image>` (avec bordures, hover, lazy loading) est
enfermé dans un commentaire HTML (`<!-- ... -->`) et ne s'affiche donc jamais publié. Les lignes
71-78 qui ressemblent à des preuves (`![A happy meerkat]`) sont en fait du texte à l'intérieur
d'un bloc ```` ```html ```` illustrant la syntaxe, pas un rendu réel.
Drapeaux : abstraction-avant-preuve (les `<Snippet>` du composant et de sa CSS, l. 45-63,
précèdent — de très loin — la démonstration, qui de toute façon n'existe pas dans la version
publiée).

Test des 30 secondes : le lecteur lit "As you can see, the image is centered, has a hover
effect..." (l. 93) mais ne voit jamais cette image, car le bloc juste au-dessus est commenté.
C'est le pire des scénarios du guide de structure : un article "comment le construire" sans
jamais "voici à quoi ça ressemble" — et ici, en plus, la preuve prévue est un bug de rédaction
(oubli de décommenter).

## Risque

Au-delà du time-to-value, c'est un défaut de contenu : la preuve que l'auteur avait manifestement
l'intention de montrer (l. 89-95) est invisible pour tout lecteur du site publié. Personne n'a
jamais vu le composant `<Image>` de cet article rendu.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 27-33 |
| 2 | **Décommenter et déplacer devant** : le rendu réel de `<Image>` (bloc l. 89-95, actuellement en commentaire) devient la première preuve montrée, juste après le hook | l. 89-95 (à décommenter) |
| 3 | 1. Creation of our Image component (inchangé) | l. 39-55 |
| 4 | 2. Tell Docusaurus about our component (inchangé) | l. 57-65 |
| 5 | 3. Using the Image component — comparaison de syntaxe avant/après (inchangé) | l. 67-87 |
| 6 | 4. Writing and registering a plugin (marquer "optional, only if you have 250+ articles like me") | l. 108-131 |
| 7 | Conclusion (inchangée) | l. 133-137 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** la ligne 89-95 doit d'abord être décommentée et vérifiée (l'image `happy.jpg` existe-t-
elle bien dans `./images/` ou faut-il l'ajouter ?) avant de la faire remonter en haut de l'article.
