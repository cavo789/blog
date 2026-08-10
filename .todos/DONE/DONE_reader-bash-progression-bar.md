# Reader review : bash-progression-bar

**Détecté :** 2026-08-09
**Article :** blog/2024/10/07/bash-progression-bar/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **83 %** (preuve ligne 66 — le GIF de la barre en action — sur un corps de
36 lignes, entre les lignes 36 et 72).

Drapeaux : abstraction-avant-preuve — deux scripts complets à créer par copier/coller
(`demo.sh`, l. 42 ; `progress_bar.sh`, l. 60) avant de voir le résultat.

Redondance : aucune, l'article est court.

Test des 30 secondes : « j'abandonne » — juste après le `<!-- truncate -->`, on demande de créer
un dossier puis de copier/coller un premier script, sans avoir montré à quoi ressemble une
barre de progression en console. Le GIF qui est justement la preuve la plus parlante de
l'article (l. 66) arrive après les deux scripts.

## Risque

Le GIF (`./images/progression_bar.gif`) est déjà la démonstration idéale — animée, donc plus
convaincante qu'une capture statique — mais il est enterré aux trois quarts de l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : le GIF de la barre de progression en action | l. 66 (image) |
| 2 | Pourquoi ça marche (`source progress_bar.sh`, `echo Progress=N` pilote la barre) | l. 46-52, reformulé sans code |
| 3 | Créer `demo.sh` | l. 38-44 |
| 4 | Créer `progress_bar.sh` | l. 54-60 |
| 5 | Lancer le script (rappel bref — le résultat est déjà montré au 1) | l. 62-64 |
| 6 | Cas réel (CSV + appel API + log) | l. 68-72 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
