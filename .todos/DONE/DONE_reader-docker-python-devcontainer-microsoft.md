# Reader review : docker-python-devcontainer-microsoft

**Détecté :** 2026-08-09
**Article :** blog/2024/12/02/docker-python-devcontainer-microsoft/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **53 %** (preuve l. 68 sur un corps de 43 lignes après le truncate en l. 45).
Drapeaux : aucun red flag mécanique strict (pas de `<Prerequisite>`/`apt install`/`## Prerequisites`
après le truncate), mais le contenu qui suit immédiatement le truncate est un second
`<StepsCard>` (le déroulé pas-à-pas de l'assistant VSCode, l. 47-64) — donc une procédure à
suivre avant toute preuve visuelle.
Redondance : aucune.

Test des 30 secondes : le TLDR promet déjà "aucune création manuelle de fichier" ; mais après le
truncate, le lecteur retombe sur une nouvelle liste d'étapes à suivre avant de voir quoi que ce
soit se produire — la seule preuve que la promesse est tenue (le fichier généré automatiquement,
puis le script qui tourne) arrive respectivement à 53 % et à la toute dernière ligne de l'article.

## Risque

Le vrai argument de vente de cet article — "l'assistant VSCode fait tout, zéro fichier à créer
à la main" — n'est démontré qu'après avoir lu tout le déroulé des clics. Le lecteur pressé ne
voit jamais la capture la plus convaincante (le script `main.py` qui tourne et affiche
`Hello from your Python Devcontainer!`, l. 82-88) car elle clôt l'article au lieu de l'ouvrir.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat final : script `main.py` exécuté avec succès (capture "Running the script") | l. 82-88 |
| 2 | Déroulé de l'assistant VSCode (Command Palette → wizard Python) | l. 47-64 |
| 3 | Preuves intermédiaires : fichier `devcontainer.json` généré, terminal, version Python | l. 66-80 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
