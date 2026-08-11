# Reader review : docker-joomla

**Détecté :** 2026-08-11
**Article :** blog/2023/12/22/docker-joomla/index.mdx
**Verdict :** RESTRUCTURE

## Problème

Time to value : **30 %** (première preuve réelle — la capture `joomla_installation_screen.webp`
l. 208 — sur un corps de 518 lignes, truncate l. 51).
Aucun des trois `<Terminal>` antérieurs n'est une preuve : `terminal-15.txt` (l. 106) est un
`ls -alh` qui montre un unique `compose.yaml`, `terminal-14.txt` (l. 129) et `terminal-13.txt`
(l. 133) sont des logs de `docker compose pull` — de l'installation, pas un résultat.

Drapeaux : **install-avant-preuve** — `## Before starting` (l. 57) ouvre le corps sur un
`<StepsCard variant="prerequisites">`, suivi de `## Docker compose` (l. 72), 17 lignes de théorie
sur le rôle d'un fichier `compose.yaml`, avant toute image.

Redondance : 🟢 pour un article de cette taille (chaque section couvre un terrain distinct).
Landing : absente — l'article se termine l. 569 sur une `<AlertBox variant="caution">` à propos des
numéros de port, dans la section bonus. Pas de Conclusion, pas de renvoi explicite vers la partie 2
de la série.

Test des 30 secondes : *« je reste, mais de justesse »* — le sujet est clair, seulement on me fait
lire une leçon sur Docker Compose avant de me montrer un Joomla qui tourne.

## Risque

C'est l'article le plus long du blog sur Joomla, et il contient déjà tout ce qu'il faut pour
convaincre en dix secondes : un `<ProjectSetup>` copiable (l. 93-105) qui écrit le `compose.yaml`
et dit « lance `docker compose up -d` puis va sur `http://localhost:8080` », et deux captures
imparables — l'écran d'installation de Joomla (l. 208) et le tableau de bord administrateur
(l. 256).

Le lecteur d'une minute ne voit ni l'un ni l'autre : il voit une carte de prérequis qui lui
apprend qu'un CMS a besoin d'un serveur web, d'une base de données et de PHP — ce qu'il sait déjà
s'il cherche « Joomla Docker ».

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Two minutes, one file, your Joomla is running` — le `<ProjectSetup>` copiable, `docker compose up --detach`, puis la capture `joomla_installation_screen.webp` et le tableau de bord `admin_dashboard.webp` | l. 93-105 + l. 112 + l. 208 + l. 256 |
| 2 | `## What just happened` — les trois puces (réseau créé, conteneur base, conteneur Joomla), sans les logs de pull | l. 135-141 |
| 3 | `## Before starting` + `## Docker compose` — la théorie, désormais en explication *après* la preuve | l. 57-88 |
| 4 | `## Download images` — les logs de pull, l'AlertBox `ERR_EMPTY_RESPONSE`, le `depends_on` | l. 106-176 (moins ce qui remonte en 1) |
| 5 | `## Docker images` / `## Docker containers` | l. 177-209 |
| 6 | `## Install Joomla` — le pas-à-pas de l'installateur, sans re-montrer les deux captures remontées en 1 | l. 210-259 |
| 7 | Suite inchangée : RAM, `## Play with containers`, synchronisation, CLI, alias, port, PostgreSQL/MariaDB, extra, bonus | l. 260-568 |
| 8 | `## Conclusion` — récap + lien explicite vers `/blog/docker-joomla-part-2` et `/blog/docker-adminer-pgadmin-phpmyadmin` | nouveau |

Note : la section `## Bonus - Install Joomla with a CLI one-liner` (l. 545-568) fait double emploi
avec le point 1 une fois celui-ci remonté — la fusionner dans le point 1 ou la réduire à un renvoi.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
