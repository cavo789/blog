# Reader review : docker-volume

**Détecté :** 2026-08-11
**Article :** blog/2023/11/03/docker-volume/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **38 %** (capture `localhost_is_forbidden.webp` l. 51 sur un corps de
63 lignes) — et cette capture est une page d'erreur *Forbidden*, la preuve qu'Apache répond,
pas la preuve du sujet. La vraie preuve — le fichier `index.php` créé **sur le disque** qui
s'affiche dans le navigateur **depuis le conteneur** (`hello_world.webp`) — est en **l. 71**,
soit **70 %**.

Drapeaux : aucun `<Prerequisite>` ni `apt install` ; le `<Snippet>` `index.php` (l. 67) arrive
après la première capture, donc pas d'abstraction-avant-preuve stricte.

Redondance : 🟢. Corps de 647 mots, **aucun titre `##`** — impossible à survoler.

Pas de landing : l'article s'arrête sur l'explication du flag `-u ${UID}:${GID}`. Pas de
Conclusion, pas de récapitulatif, pas de prochaine étape (les deux liens internes existants sont
en plein milieu du texte).

Test des 30 secondes : **je continue, mais de justesse** — la commande `docker run` copiable
arrive 11 lignes après le `<!-- truncate -->`, ce qui sauve l'article ; mais ce qu'elle produit à
ce stade est un « Forbidden », et il faut lire jusqu'aux trois quarts pour voir le partage de
fichiers réellement fonctionner.

## Risque

Le titre promet « partager des données entre le conteneur et l'ordinateur ». Le lecteur d'une
minute voit d'abord une AlertBox sur les scripts malveillants, puis une commande, puis une page
d'erreur. Le « Hello world! » servi depuis un fichier écrit sur son propre disque — le moment où
l'idée devient évidente — existe déjà, en l. 71, avec sa capture.

Le mécanisme le plus utile de l'article (`-u ${UID}:${GID}` pour ne pas se retrouver avec des
fichiers `root` sur son disque) est en toute dernière ligne : c'est précisément ce qu'un lecteur
revient chercher trois mois plus tard, et rien ne le signale.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | inchangé, jusqu'au `<!-- truncate -->` | l. 1-27 |
| 2. Le résultat | `## What `-v` Does For You` : le one-liner `docker run … -v $(pwd):/var/www/html`, le `index.php` créé sur le disque, et la capture `hello_world.webp` | l. 38-40 + l. 67-71 |
| 3. Pourquoi ça marche | 3 puces sans code : sans `-v` tout vit en RAM et disparaît · `-v` synchronise **dans les deux sens** · `-u` décide qui possède les fichiers créés | l. 33-36 + l. 73-77 + l. 90 |
| 4. Installation / mise en place | `mkdir /tmp/docker-volume`, la commande complète, l'explication des trois flags, la note Windows `%CD%` | l. 36-49 |
| 5. Plus de démos | la page *Forbidden* comme moitié « avant » d'une paire avant/après : conteneur sans `index.php` → Forbidden, puis fichier créé sur le disque → Hello world | l. 51-53 |
| 6. Sous le capot *(à sauter si vous voulez juste l'utiliser)* | l'AlertBox « exécuter un script malveillant sans volume », l'AlertBox propriété `root`, et le `-u ${UID}:${GID}` en détail | l. 29-33 + l. 79-90 |
| 7. Conclusion | **à écrire** : bind mount vs volume géré, et lien de sortie vers `docker-volumes` (déjà lié en l. 77) | l. 77 |

Ajouter les titres `##` : l'article n'en a aucun.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
