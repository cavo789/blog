# Reader review : docker-docusaurus-prod

**Détecté :** 2026-08-09
**Article :** blog/2024/04/28/docker-docusaurus-prod/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **78 %** (preuve ligne 200 sur un corps de 202 lignes, T=43, E=245).
Drapeaux : abstraction-avant-preuve (plusieurs `<Snippet>` de `Dockerfile` en l. 75-133,
bien avant la capture du site tournant, l. 200) ; les `<Terminal>` des l. 57 et 145 ne
montrent que des étapes de préparation (créer un blog factice, résumé des fichiers), pas
le résultat final.
Redondance : aucune, pas de répétition notable.

Test des 30 secondes : *"j'abandonne"* — l'article promet d'encapsuler tout un site
Docusaurus dans une image Docker, mais le lecteur doit lire quatre morceaux de `Dockerfile`
et un `.dockerignore` avant de voir à quoi ressemble le résultat (capture "Homepage of your
running Docusaurus instance", l. 200 sur 202).

## Risque

La preuve la plus convaincante de l'article (le site qui tourne réellement depuis l'image
Docker, l. 200) est enterrée dans les tout derniers pourcents du corps. Le lecteur qui
hésite à investir dans la lecture des quatre parties du `Dockerfile` n'a, avant ça, que des
étapes de préparation (créer un blog factice, résumé des fichiers) sans savoir si le
résultat final vaut l'effort.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + TLDR (inchangé) | l. 21-41 |
| 2 | "And use it" : build + run + capture "Homepage of your running Docusaurus instance" + "Our blog" + "Docker Desktop" | l. 184-227 |
| 3 | "Create a dummy blog if needed" (inchangé, pour qui n'a pas encore de blog) | l. 45-59 |
| 4 | "Prepare our Docusaurus installation for Docker" : les 4 parties du `Dockerfile` + `.dockerignore` | l. 61-139 |
| 5 | "Small summary" | l. 141-145 |
| 6 | "Build our Docker image" | l. 147-183 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
