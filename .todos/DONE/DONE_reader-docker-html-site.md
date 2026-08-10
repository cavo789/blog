# Reader review : docker-html-site

**Détecté :** 2026-08-09
**Article :** blog/2024/08/09/docker-html-site/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **93 %** (preuve ligne 55 sur un corps de 27 lignes).
Drapeaux : aucun drapeau binaire strict (pas d'`apt install`, pas de `<Prerequisite>`) mais la
commande promise dans le TLDR ("just ONE command") n'apparaît qu'en ligne 45, noyée dans une
`<AlertBox>`, après deux étapes de téléchargement/dézippage — et la capture qui la prouve
n'arrive qu'en ligne 55, soit à 93 % d'un corps qui ne fait que 27 lignes.
Redondance : aucune.

Test des 30 secondes : "je pars" — l'article promet "une seule commande" dès le TLDR, mais le
lecteur doit d'abord lire trois étapes de préparation (`curl`, `Expand-Archive`, `cd demo`)
avant de voir cette commande, puis attendre la toute dernière ligne du corps pour voir le
résultat. C'est exactement l'inverse de la promesse du titre.

## Risque

C'est le cas le plus flagrant du lot : l'article vend sa valeur ("ONE COMMAND") mais la
structure actuelle fait tout l'inverse — la commande et sa preuve sont les deux derniers
éléments d'un article très court, alors qu'elles pourraient ouvrir le corps dès la ligne 32.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-29 |
| 2 | La commande + capture du résultat, présentées ensemble comme preuve immédiate | l. 45 (commande) + l. 55 (capture) |
| 3 | Pourquoi ça marche (1-2 puces, sans code) : l'image Apache monte le dossier courant comme docroot, aucune installation locale nécessaire | condensé de l. 49 |
| 4 | Obtenir un site d'exemple à pointer (téléchargement + dézippage) — recadré comme préparation optionnelle, pas comme prérequis bloquant | l. 34-40 |
| 5 | Conclusion (étoffer la ligne de fin actuelle) : récap + liens vers `docker-php-run-script-or-website` et `apache-htaccess` | l. 51, 57 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
