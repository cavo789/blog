# Reader review : linux-jq

**Détecté :** 2026-08-11
**Article :** blog/2023/12/13/linux-jq/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **24 %** (la paire avant/après se referme l. 63, sur un corps de 151 lignes,
truncate l. 27).

Drapeaux : **install-avant-preuve** — la toute première ligne du corps (l. 29) est
`sudo apt-get update && sudo apt-get install jq`. Le lecteur doit installer avant d'avoir vu
la moindre sortie.

Poids mort : le JSON prettifié occupe **68 lignes** (l. 62-131) pour illustrer une seule
idée — « c'est indenté maintenant ». L'article sait pourtant déjà tronquer proprement : la
l. 150 utilise `[...]` pour abréger le même objet.

Redondance : « `jq` embellit et filtre le JSON » énoncé **4 fois** — TLDR (l. 20), l. 25,
l. 33, l. 54. 🟠

Test des 30 secondes : **je reste, mais à contrecœur** — on me demande un `apt-get install`
en ligne 1 du corps, et il faut scroller à travers 68 lignes de JSON avant d'arriver à ce qui
m'intéresse vraiment (le filtrage `.results[0].name`).

## Risque

Le lecteur d'une minute repart avec « jq indente du JSON » alors que la vraie valeur de
l'article — la section `## Filtering the output` (l. 133-172), qui explique comment lire la
structure puis construire l'expression `.results[0].name` — est à 70 % de la page, après le
dump.

Rien n'est à jeter : la paire avant/après (curl brut l. 44-52 vs `curl | jq` l. 58-63) est
exactement la bonne preuve, elle est simplement noyée et précédée d'une demande d'effort.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse, `<!-- truncate -->` | l. 23-27 (inchangé) |
| 2 | **Le résultat** : `curl` brut (une ligne illisible) puis `curl \| jq` — sortie prettifiée **tronquée à ~15 lignes** avec `[...]`, comme l. 150 | l. 42-52 + l. 54-63, dump l. 64-130 raccourci |
| 3 | Le filtrage — la vraie valeur : structure du JSON, puis `jq '.results[0].name'` et son résultat | l. 133-172 (`## Filtering the output`) |
| 4 | Installation, repliée dans un `<AlertBox variant="tip">` ou un `<Prerequisite name="jq" …/>` | l. 29 |
| 5 | Le terrain de jeu : API randomuser, liste des API libres, `<AlertBox>` « nouvel objet à chaque appel » | l. 35-40 |
| 6 | Conclusion + liens sortants (doc jq, docker-networking-troubleshooting, json-crack / json-lint / json-faker) | l. 174-178 |

Le dump complet, si tu veux le garder, va dans un `<Details label="La sortie complète">` au
mouvement 5 — présent, mais pas déplié au visage du lecteur.

Supprimer une des 4 occurrences de « embellit et filtre » : la phrase l. 33 (« `jq` peut être
utilisé sans argument, la sortie sera prettifiée ») est celle qui apporte le fait neuf,
garder celle-là ; l. 25 répète le TLDR.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
