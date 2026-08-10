# Reader review : linux-inotifywait

**Détecté :** 2026-08-09
**Article :** blog/2024/11/24/linux-inotifywait/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **86 %** (preuve l. 80 — le gif "Running a monitor" — sur un corps de 56 lignes
après le truncate en l. 32).
Drapeaux : install-avant-preuve (`sudo apt-get install ... inotify-tools`, l. 65, avant la
preuve) et abstraction-avant-preuve (`Dockerfile`, `script.py`, `monitor.sh`, l. 45-63, tous
avant la preuve).
Redondance : aucune.

Test des 30 secondes : le TLDR promet un "compteur live" pendant qu'un script Python génère des
fichiers — mais le corps enchaîne Dockerfile, script Python, script `monitor.sh` puis
installation d'`inotify-tools` avant de montrer le fameux compteur. Le gif qui prouve la
promesse arrive au tout dernier tiers de l'article — cas typique de "la démo existe mais
personne ne l'atteint".

## Risque

Le lecteur qui veut juste savoir "est-ce que ça vaut le coup d'installer inotify-tools" ne voit
la preuve qu'après avoir déjà dû lire tout l'environnement Docker/Python de démo — alors que ce
n'est même pas nécessaire pour utiliser `inotifywait` sur un dossier existant.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Gif de démo : le compteur qui tourne en direct | l. 74-80 |
| 2 | Environnement Python de démo (Dockerfile) — marqué "skippable si Python déjà installé" | l. 34-51 |
| 3 | Script `script.py` générateur de fichiers | l. 53-57 |
| 4 | Script `monitor.sh` + installation d'inotify-tools | l. 59-72 |
| 5 | Conclusion | l. 82-88 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
