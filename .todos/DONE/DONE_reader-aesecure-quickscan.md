# Reader review : aesecure-quickscan

**Détecté :** 2026-08-09
**Article :** blog/2024/08/01/aesecure-quickscan/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **43 %** (preuve ligne 66 sur un corps de 67 lignes).
Drapeaux : aucun drapeau binaire strict, mais la toute première section après le `<!-- truncate
-->` (`## Demo`, l. 39-41) annonce que la démo en ligne n'existe plus — un accueil négatif avant
toute preuve.
Redondance : aucune.

Test des 30 secondes : "je pars" — la première chose lue après la coupure est "la démo n'est
plus disponible". C'est un anti-teaser : l'article a une capture d'écran convaincante de l'outil
(l. 66) mais la place à 43 % du corps, après une déception et une section de téléchargement.

## Risque

La capture de la page d'accueil du scanner (l. 66) est la preuve la plus parlante que l'outil
existe et fonctionne. La faire précéder d'une section "Demo" qui annonce une absence casse
l'élan du lecteur dès la première ligne utile.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-36 |
| 2 | Capture de la page d'accueil du scanner, comme preuve immédiate | l. 66 |
| 3 | Pourquoi ça marche (2-3 puces, sans code) : whitelist par hash, seuls les fichiers inconnus sont scannés | condensé de l. 86-98 |
| 4 | Récupérer le scanner (télécharger + déposer `scan.php` sur le site) | l. 43-60 |
| 5 | Lancer le scan (les 4 boutons, walkthrough) | l. 62-84 |
| 6 | Sous le capot (à sauter si vous voulez juste l'utiliser) : détection de version, fichier JSON de hash, limite de 500 fichiers | l. 86-98 |
| 7 | Conclusion (nouvelle section) : mentionner que la démo en ligne est hors service, pointer vers le dépôt AFUJ pour captures à jour | l. 41 (note déplacée), l. 100-104 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
