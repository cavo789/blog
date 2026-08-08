# Reader review : docusaurus-go-top

**Détecté :** 2026-08-08
**Article :** blog/2025/09/12/docusaurus-go-top/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (aucune preuve visuelle dans tout le corps, sur 50 lignes).
Drapeaux : abstraction-avant-preuve (les deux `<Snippet>` du composant, l. 39-41, arrivent
immédiatement après le sous-titre, sans qu'aucun rendu ne soit montré).
Redondance : aucune (article court, une seule répétition normale sur "restart Docusaurus").

Test des 30 secondes : le lecteur sait qu'un bouton "back to top" existe quelque part sur ce
blog (l. 29 le décrit en mots) mais ne le voit jamais capturé — il doit scroller lui-même la
page en cours pour vérifier que ça marche vraiment. J'abandonne si je ne suis pas déjà motivé,
faute d'une preuve visuelle immédiate du résultat.

## Risque

Le lecteur ne peut pas juger en un coup d'œil si le petit gadget (l'icône animée, son
comportement au clic) vaut la peine d'ajouter deux fichiers et de swizzler `BlogPostItem`. La
preuve existe déjà — cet article même en est un exemple vivant — mais elle n'est jamais capturée
ni montrée dans le texte.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 25-29 |
| 2 | **Nouveau** : capture d'écran (ou GIF) du bouton "back to top" en action (icône visible en bas à droite, clic → retour en haut) — à produire | — |
| 3 | How it works (inchangé) | l. 33-48 |
| 4 | Overriding the BlogPostItem page (inchangé) | l. 50-75 |
| 5 | You can do this for other pages for sure (inchangé, sert de conclusion/ouverture) | l. 77-81 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** ce RESTRUCTURE nécessite une capture qui n'existe pas encore — à produire avant
d'implémenter, sinon l'article reste à 100 % de TTV même réordonné.
