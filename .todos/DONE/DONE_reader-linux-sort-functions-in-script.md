# Reader review : linux-sort-functions-in-script

**Détecté :** 2026-08-09
**Article :** blog/2024/07/28/linux-sort-functions-in-script/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **18 %** (preuve ligne 42 sur un corps de 100 lignes, l. 24-124).
Drapeaux : **abstraction-avant-preuve** — un `<Snippet>` (`console.sh`, l. 30) crée un fichier de
test avant toute preuve.
Redondance : aucune (le concept "trier les fonctions" est expliqué une seule fois par angle : la
commande, le script `order.sh`, le résultat).

Test des 30 secondes : le lecteur crée un fichier de démonstration (des fonctions vides, sans
rapport avec son propre code) avant de voir le vrai intérêt de l'article — le diff côte-à-côte qui
révèle les fonctions mal triées (images "Bad sorter" l. 62, "Congratulations" l. 86).

## Risque

La vraie preuve de valeur — le comparatif visuel `diff --side-by-side` qui distingue en un coup
d'œil un script bien trié d'un script mal trié — est enterrée après la création du fixture et
l'extraction basique de la liste des fonctions. C'est ce comparatif, pas la simple liste triée,
qui donne envie de lire la suite (le script `order.sh` industrialisé).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 22 |
| 2 | Le résultat : comparatif `diff --side-by-side` avec les images "Bad sorter" / "Almost correct" / "Congratulations" | l. 46-88 |
| 3 | Mise en place : créer `console.sh`, extraire la liste des fonctions (`grep`/`awk`/`sort`) | l. 26-42 |
| 4 | Industrialiser : `order.sh` pour scanner un dossier entier | l. 90-124 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
