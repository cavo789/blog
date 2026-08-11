# Reader review : docker-limesurvey

**Détecté :** 2026-08-11
**Article :** blog/2024/02/01/docker-limesurvey/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **43 %** (preuve ligne 69, `./images/homepage.webp`, sur un corps de 87 lignes après le
`<!-- truncate -->` l. 32).

Drapeaux : **abstraction-avant-preuve** — `<Snippet filename="compose.yaml">` l. 40 arrive avant toute
démonstration. Le `<Terminal source="./files/terminal-1.txt">` l. 50 montre bien une sortie, mais c'est
celle de `docker container list` : ça prouve que deux conteneurs tournent, pas que LimeSurvey est
utilisable.

Redondance : 🟢. Deux `AlertBox` traitent de l'attente au démarrage (l. 52 « output simplified » et
l. 61 « look at the logs ») mais elles disent des choses différentes — pas de doublon réel.

Landing : **absente**. L'article se termine l. 119 sur « congratulations, you have a local LimeSurvey
v3.22.6 website », c'est-à-dire sur la section la plus marginale de toutes (installer une **vieille**
version avec MySQL 5.7 end-of-life). Aucun `## Conclusion`, aucun retour sur le sujet principal.

Test des 30 secondes : *je reste, mais je scrolle* — le titre est clair, la section s'appelle « Let's
play », mais on me demande `mkdir`, un `compose.yaml`, un `docker compose up`, puis d'attendre « une ou
deux minutes » avant de voir quoi que ce soit. Trois captures m'attendent plus bas et je ne le sais pas.

## Risque

Le lecteur d'une minute rate les trois captures qui répondent à sa seule question — « à quoi ça
ressemble une fois installé ? » : `homepage.webp` (l. 69), `admin.webp` (l. 73) et `dashboard.webp`
(l. 77). Elles existent déjà et sont bonnes.

Second risque, propre à cet article : il se **termine** sur `mysql:5.7` end-of-life. Un lecteur qui
arrive par la fin (ou qui scanne) repart avec l'image d'un tutoriel qui recommande une base de données
non maintenue, alors que l'AlertBox `danger` (l. 115) dit précisément le contraire.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 1-32 |
| 2 | **`## LimeSurvey, Running in Two Minutes`** — `dashboard.webp` (ou `homepage.webp`) précédée d'une phrase : « un fichier `compose.yaml`, une commande, et voici ce que vous obtenez sur `http://localhost:8080` » | l. 69 ou l. 77 |
| 3 | `## Let's play` — `mkdir`, le `compose.yaml`, `docker compose up --detach`, le `docker container list` | l. 34-51 |
| 4 | L'attente et les logs — l'AlertBox « output simplified », la phrase sur `service_healthy`, l'AlertBox « look at the logs », `ERR_CONNECTION_REFUSED` | l. 52-67 |
| 5 | `## First Login` — `admin.webp` + les identifiants `admin`/`admin`, puis `homepage.webp` si non utilisée en mouvement 2 | l. 69-78 |
| 6 | `## Using volumes` — persister les données | l. 79-91 |
| 7 | `## Download an old version` — **avec l'AlertBox `danger` MySQL 5.7 remontée en tête de section**, pas en pied | l. 93-118, AlertBox l. 115 déplacée avant l. 95 |
| 8 | `## Conclusion` — **à créer** : ce qu'on retient (compose + `service_healthy` = LimeSurvey local jetable), et un renvoi vers un article volumes / Docker existant | — |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
