# Reader review : linux-eza

**Détecté :** 2026-08-09
**Article :** blog/2024/07/23/linux-eza/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (la seule preuve — la capture d'écran `eza.webp` — est la toute
dernière ligne du corps, l. 59 sur un corps de 27 lignes, l. 32-59).
Drapeaux : **installation-avant-preuve** — la section `## Install eza` (l. 45) et la commande
`sudo apt-get install eza` (l. 47) précèdent la seule preuve de l'article.

Test des 30 secondes : "j'installe un paquet avant même de savoir ce que ça change visuellement" —
rien ne montre le rendu `eza` avant l'instruction d'installation.

## Risque

L'article promet une meilleure expérience `ls` mais demande une installation avant de montrer à
quoi ressemble le résultat. L'image finale (icônes, groupement des dossiers, colonnes) est
justement l'argument qui donnerait envie d'installer l'outil — elle doit précéder l'installation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + présentation d'`eza` (inchangé) | l. 34-43 |
| 2 | Le résultat : capture `eza.webp` (avec l'alias déjà expliqué en une phrase) | l. 57-59 |
| 3 | Installation : `## Install eza`, `apt-get install`, mise en place de l'alias | l. 45-55 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
