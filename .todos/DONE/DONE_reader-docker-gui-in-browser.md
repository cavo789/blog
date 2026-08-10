# Reader review : docker-gui-in-browser

**Détecté :** 2026-08-09
**Article :** blog/2024/09/05/docker-gui-in-browser/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **35 %** (preuve ligne 38 sur un corps de 34 lignes).
Drapeaux : aucun drapeau binaire (pas d'installation, pas de Snippet d'implémentation) mais le
`<Terminal>` qui précède la preuve (ligne 34) ne montre qu'une commande à copier-coller, pas un
résultat — ce n'est donc pas une preuve au sens strict.
Redondance : aucune.

Test des 30 secondes : "je reste, mais l'article demande de copier une longue commande `docker
run` avant de savoir si le résultat vaut le coup" — la capture d'écran qui prouve que Firefox
tourne bien dans le navigateur (ligne 38) existe déjà et pourrait ouvrir la section.

## Risque

La commande `docker run` (12 lignes avec ses options) est lue avant que le lecteur sache à quoi
elle sert visuellement. Inverser l'ordre — capture d'abord, commande ensuite — transforme la
commande en "comment reproduire ce que vous venez de voir" plutôt qu'en acte de foi.

Pas de section `## Conclusion` : l'article s'arrête après la capture GIMP (ligne 58), sans
récapitulatif ni lien vers la suite (l'article `docker-run-linux-gui` est déjà cité en haut,
mais rien ne referme la boucle en bas).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-25 |
| 2 | Capture Firefox tournant dans le navigateur, comme preuve immédiate | l. 38 |
| 3 | La commande à copier-coller pour reproduire ce résultat | l. 34 |
| 4 | Variante DOS/Edge (capture + commande) | l. 40-46 |
| 5 | GIMP : même schéma (capture d'abord, commande ensuite) | l. 58, l. 54 |
| 6 | Conclusion (nouvelle section) : récap + lien vers `docker-run-linux-gui` pour des fenêtres natives au lieu du navigateur | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
