# Reader review : docker-inspect

**Détecté :** 2026-08-11
**Article :** blog/2023/12/27/docker-inspect/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **23 %** (premier bloc `json` de sortie l. 49, truncate l. 29, corps de 88 lignes).
Mais la vraie réponse utile — `docker inspect phpinfo | jq -r '.[0].NetworkSettings.Networks'` et son
JSON court — n'arrive qu'à la l. 88, soit **67 %**.

Drapeaux :

- **install-avant-preuve** : la toute première section du corps s'appelle `## Some preparation work`
  (l. 31) et demande `mkdir`, la création d'un `index.php`, puis un `docker run` complet avant
  d'avoir rien montré ;
- **abstraction-avant-preuve** : `<Snippet filename="index.php">` l. 39, avant toute sortie.

Redondance : 🟢.
Landing : absente — l'article s'arrête sur une `<AlertBox>` expliquant où installer `jq`.

Test des 30 secondes : *« je décroche »* — on me demande de construire un conteneur de démonstration
avant de m'avoir montré ce que `docker inspect` me rapporte.

## Risque

Le lecteur qui arrive ici a déjà un conteneur qui tourne : il cherche l'IP ou le nom du réseau,
maintenant. La section « preparation work » ne le concerne pas, et pourtant elle occupe tout le
premier écran. Le one-liner `jq` qui répond littéralement à sa question existe déjà (l. 88) —
il est simplement à la fin.

Second effet : cet article est référencé depuis `docker-adminer-pgadmin-phpmyadmin` précisément
pour cette information. Un lecteur qui arrive par ce lien atterrit sur du montage de décor.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Get the network name in one line` — la commande `jq` + son JSON de sortie | l. 88-113 |
| 2 | La phrase de conclusion « le nom du réseau se lit dans `NetworkSettings.Networks` » | l. 84-86 |
| 3 | `## The full inspect output` — le dump JSON complet annoté, présenté comme *ce qu'il y a derrière* | l. 45-83 |
| 4 | `<AlertBox variant="info" title="jq">` remontée juste sous le one-liner du point 1 | l. 114-117 |
| 5 | `## Reproduce this on your machine (skip if you already have a container)` — repliée dans un `<Details>` | l. 31-44 |
| 6 | `## Conclusion` — récap + liens vers `/blog/linux-jq` et `/blog/docker-adminer-pgadmin-phpmyadmin` | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
