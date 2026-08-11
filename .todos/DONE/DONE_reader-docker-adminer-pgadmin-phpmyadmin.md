# Reader review : docker-adminer-pgadmin-phpmyadmin

**Détecté :** 2026-08-11
**Article :** blog/2023/12/27/docker-adminer-pgadmin-phpmyadmin/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **13 % en surface, 76 % pour la vraie preuve** (l. 104 sur un corps de 101 lignes,
truncate l. 27).
Le `<Terminal>` de la l. 40 n'est pas une preuve : c'est un `docker container list` qui sert à
*collecter un prérequis* (le nom du conteneur), pas à montrer le résultat promis. Même piège que
`docker-network-and-extra-hosts` (preuve mécanique sur un `ls`). La seule preuve réelle — la
capture d'Adminer affichant la base — arrive l. 104, soit à 76 % du corps.

Drapeaux : effort-avant-preuve (la première phrase du corps est *« Before being able to start the
command, you should provide some information »*, suivie de deux chasses au renseignement :
nom du conteneur, puis nom du réseau via `docker inspect | jq`).
Redondance : 🟢 (aucun fait répété plus de 2 fois).
Landing : absente — l'article se termine sur deux captures phpmyadmin, sans Conclusion ni lien de
sortie.

Test des 30 secondes : *« je décroche »* — on me demande de faire deux commandes de reconnaissance
avant de m'avoir montré à quoi ressemble l'outil que le titre me promet.

## Risque

Le lecteur d'une minute vient pour une chose : voir sa base MySQL dans un navigateur sans installer
phpMyAdmin. La capture qui prouve exactement ça (`./images/adminer.webp`) existe déjà, mais elle est
à 76 % de la page. Ce lecteur voit d'abord un tableau de conteneurs, puis un dump JSON de
`docker inspect`, et repart avec l'impression qu'il faut du travail préparatoire pour rien.

La commande `docker run` d'Adminer est de plus déjà autonome : le nom du réseau est le *seul*
paramètre à connaître, et il se déduit en une ligne. Ce préambule mérite d'être un détail
d'exécution, pas la porte d'entrée.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## One command, your database in a browser` — le `docker run` Adminer + la capture `adminer.webp` juste dessous | l. 72-83 (commande) + l. 104 (capture) |
| 2 | Une phrase de transition : « il ne manque qu'une information, le nom du réseau » | nouveau (2 lignes) |
| 3 | `## Find your container and its network` — `docker container list` puis `docker inspect \| jq` | l. 29-67 inchangé |
| 4 | `## Options` — le flag `-p` et l'hyperlien paramétré | l. 84-103 (les deux AlertBox) |
| 5 | `## Run pgadmin` | l. 106-109 |
| 6 | `## Run phpmyadmin` | l. 110-128 |
| 7 | `## Conclusion` — récap (un `docker run`, trois outils au choix) + lien vers `/blog/docker-inspect` et `/blog/docker-joomla` | nouveau |

Cible : time to value < 15 % **sur la vraie preuve**. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
