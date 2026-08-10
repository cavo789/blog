# Reader review : php-jakzal-phpqa

**Détecté :** 2026-08-09
**Article :** blog/2024/04/07/php-jakzal-phpqa/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **46 %** (preuve ligne 77 sur un corps de 98 lignes, l. 32-130).
Drapeaux : **abstraction-avant-preuve** — les deux `<Snippet filename="composer.json">`
(l. 54 et 58, illustrant un JSON mal ordonné) apparaissent avant la première image de résultat
réel (`composer_unused.webp`, l. 77).
Redondance : aucune détectée.

Test des 30 secondes : « la section "Composer normalize" me montre deux exemples de JSON à
comparer, mais aucun résultat d'outil réellement exécuté — je dois attendre la section suivante
("Composer unused") pour voir une vraie capture d'écran d'un outil qui tourne. »

## Risque

La section "Composer unused" contient la preuve la plus forte de l'article (une capture d'écran
d'un outil `jakzal/phpqa` détectant une vraie dépendance inutilisée), mais elle est placée après
la section "Composer normalize" qui, elle, ne montre que des extraits JSON d'exemple sans
capture du résultat de la commande.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Intro : aucune installation nécessaire | l. 34 |
| 2 | Aparté rappel Docker CLI | l. 36-46 |
| 3 | `## Composer unused` (preuve réelle : `composer_unused.webp`) | l. 71-84 |
| 4 | `## Composer normalize` (Snippets d'exemple `composer.json`) | l. 48-69 |
| 5 | `## PHP-Parallel-lint` (Terminal réel, 823 fichiers scannés) | l. 86-98 |
| 6 | `## PHP-CS-FIXER` / `## PHP_CodeSniffer` | l. 100-110 |
| 7 | Autres outils + prochaines étapes (pre-commit, CI) | l. 112-116 |
| 8 | Changer de version PHP | l. 118-130 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
