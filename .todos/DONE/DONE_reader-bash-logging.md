# Reader review : bash-logging

**Détecté :** 2026-08-09
**Article :** blog/2024/05/01/bash-logging/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **54 %** (preuve ligne 55 sur un corps de 41 lignes, T=33, E=74).
Drapeaux : abstraction-avant-preuve (deux `<Snippet>` — `run.sh` l. 43 et `log.sh` l. 49 —
arrivent avant la capture montrant le résultat, l. 55).
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"j'abandonne peut-être"* — juste après le `<!-- truncate -->`, le
lecteur doit lire deux scripts complets (le script exemple et la librairie de logging)
avant de voir à quoi ressemble le résultat (capture d'écran "Using log", l. 55).

## Risque

La capture qui prouve que la librairie fonctionne (console + trace d'appel dans le log)
existe déjà mais arrive après tout le code source. Le lecteur ne peut juger l'intérêt de
copier deux fichiers avant d'avoir vu ce que ça donne à l'écran.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 23-31 |
| 2 | "The result" : capture `logging.webp` + explication de la trace d'appel | l. 51-55, 59-74 |
| 3 | "Your script" : `Snippet` `run.sh` | l. 37-43 |
| 4 | "The log helper" : `Snippet` `log.sh` | l. 45-49 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
