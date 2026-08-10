# Reader review : vscode-php-getter-setter

**Détecté :** 2026-08-09
**Article :** blog/2024/06/16/vscode-php-getter-setter/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **67 %** (preuve ligne 65 sur un corps de 48 lignes, T=33, E=81).
Drapeaux : abstraction-avant-preuve (le `<Snippet>` `product.php` en l. 37 arrive avant la
capture montrant l'extension en action, l. 61 et 65).
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"j'abandonne probablement"* — juste après le `<!-- truncate -->`, le
lecteur tombe sur du code PHP (le "mauvais" scénario) avant de savoir ce que l'extension
VSCode fait concrètement ; le GIF qui montre l'extension générer le getter/setter en un
clic n'arrive qu'aux deux tiers de l'article.

## Risque

Le lecteur ne voit la vraie valeur de l'article (un clic droit dans VSCode génère le
boilerplate) qu'à 67 % du corps. Avant ça, il doit lire du code PHP "mauvaise pratique"
sans savoir pourquoi ça compte. Le GIF (l. 65) est la preuve la plus forte de l'article et
elle est déjà écrite — juste mal placée.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 17-31 |
| 2 | "Voir l'extension en action" : le GIF + la capture montrant le clic droit → génération instantanée | l. 61-65 |
| 3 | "The bad scenario" : le `Snippet` `product.php` (propriétés publiques) et l'exemple de mauvais usage | l. 35-49 |
| 4 | "The good way" : classe avec propriétés privées, `Snippet` `product.part2.php`, lien vers l'extension | l. 51-59 |
| 5 | Code final utilisant les setters + `Snippet` `product.part3.php` + lien de clôture | l. 69-81 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
