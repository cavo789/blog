# Reader review : docker-run-linux-gui

**Détecté :** 2026-08-09
**Article :** blog/2024/09/06/docker-run-linux-gui/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **29 %** (preuve ligne 48 sur un corps de 62 lignes).
Drapeaux : abstraction-avant-preuve (le `<Snippet>` du Dockerfile en ligne 38 précède la
capture xeyes en ligne 48).
Redondance : aucune, chaque section (xeyes / Firefox / Chrome / GIMP) est indépendante.

Test des 30 secondes : "je reste, mais j'hésite" — le lecteur doit lire un Dockerfile complet
avant de voir la moindre preuve que ça marche, alors que la capture existe déjà (ligne 48) et
pourrait servir d'accroche.

## Risque

Le lecteur ne sait pas si l'effort (construire une image xeyes) vaut la peine avant d'avoir lu
tout le Dockerfile. La capture d'écran, qui prouve immédiatement que "faire tourner un GUI
Linux depuis un conteneur et l'afficher sur l'hôte" fonctionne vraiment, est reléguée après le
code — alors qu'elle existe déjà et pourrait ouvrir l'article.

Pas de section `## Conclusion` : l'article s'arrête net après la capture GIMP (ligne 92), sans
récapitulatif ni lien vers la suite de la série.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-29 |
| 2 | Aperçu : capture xeyes en fenêtre, comme preuve immédiate | l. 48 |
| 3 | Pourquoi ça marche (2-3 puces, sans code) : partage de `DISPLAY` + du socket `/tmp/.X11-unix` avec le conteneur | nouveau, condensé de l. 34-44 |
| 4 | Construire l'image xeyes (Dockerfile, build, run) | l. 34-46 |
| 5 | Firefox / Chrome / GIMP — même schéma pour chacun (intro → Dockerfile → build/run → capture) | l. 52-92 |
| 6 | Conclusion (nouvelle section) : récap + lien vers l'article suivant (`docker-lubuntu` pour un bureau complet) | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
