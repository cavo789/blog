# Reader review : makefile-using-make

**Détecté :** 2026-08-11
**Article :** blog/2023/12/27/makefile-using-make/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **89 %** (preuve l. 95 — le `<Terminal source="./files/terminal-1.txt">` qui montre
enfin `make phpmyadmin` en action — sur un corps de 73 lignes, truncate l. 30).

Drapeaux :

- **install-avant-preuve** : `## Install make` (l. 55) et son `sudo apt-get -y install make`
  arrivent 40 lignes avant la moindre sortie ;
- **abstraction-avant-preuve** : `<Snippet filename="makefile">` l. 68, avant toute exécution.

Redondance : 🟢.
Landing : faible — l'article se termine sur « Feel free to add your own make instructions; can be
multiline », sans récapitulatif ni retombée.

Test des 30 secondes : *« je décroche »* — on m'énumère neuf commandes Docker, puis on me fait
installer `make`, alors que je n'ai toujours pas vu ce que `make` remplace concrètement.

## Risque

La démonstration parfaite est déjà écrite, dans `./files/terminal-1.txt` : `make phpmyadmin` d'un
côté, la commande `docker run --name phpmyadmin -d --link joomladb:db --network kingsbridge_default
-p 8089:80 phpmyadmin` de l'autre. C'est un avant/après auto-suffisant : un mot contre une ligne de
120 caractères. Il est à 89 % de la page.

Le lecteur d'une minute, lui, lit une liste à puces de commandes Docker qui ne sont pas les siennes
(elles viennent d'un autre article de la série) et un paragraphe sur `which make`. Rien ne lui
prouve que ça vaut vingt minutes.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## One word instead of that command` — le contenu de `terminal-1.txt` présenté en avant/après | l. 95 |
| 2 | Trois lignes : « voici ce qu'il y a dans le makefile pour obtenir ça » + le `<Snippet>` | l. 68-73 |
| 3 | `## Why bother` — la liste des commandes Docker à retenir, comme justification *après* la preuve | l. 40-54 |
| 4 | `<AlertBox>` « spécifique à chaque projet », `printf`, aide, `danger` sur les tabulations | l. 61-67, 74-94 |
| 5 | `## Install make` — repliée dans un `<Details label="make is not installed?">` | l. 55-60 |
| 6 | `<AlertBox variant="note">` Linux/WSL seulement, remontée juste avant l'install | l. 32-38 |
| 7 | `## Conclusion` — récap + liens vers `/blog/makefile-help` et `/blog/makefile_tips` | l. 98-103 étoffées |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
