# Reader review : docker-oracle-database-server

**Détecté :** 2026-08-09
**Article :** blog/2025/04/04/docker-oracle-database-server/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **66 %** (preuve ligne 302 "Database is ready to use" sur un corps de 405
lignes, `<!-- truncate -->` en ligne 33).
Drapeaux : **installation-avant-preuve** — le corps ouvre directement sur
`## Download a Docker image for OracleDB` (l. 35) avec une checklist de compte Oracle, un
`docker pull`, une capture d'un message d'erreur (l. 51-54, ce n'est pas une preuve de valeur
mais une illustration d'échec) puis des concepts CDB/PDB avant la moindre preuve que le
conteneur fonctionne.
Redondance : aucune notable.

Test des 30 secondes : le titre promet "Running Oracle Database Server as a Docker container"
mais les 250 premières lignes du corps sont exclusivement de la configuration (compte Oracle,
token, licence, fichiers de démarrage, volume Docker) — aucune preuve visuelle que ça tourne
avant 66 % de l'article. "J'abandonne" — c'est le cas d'usage Oracle le plus dense de la série et
celui qui retarde le plus sa preuve.

## Risque

La capture `container_db_is_ready.webp` (l. 302, "DATABASE IS READY TO USE!") est la preuve la
plus forte de l'article et elle arrive après : création de compte Oracle, génération de token,
acceptation de licence, configuration Docker, téléchargement de l'image (2,2 Go), création des
scripts de peuplement, création du volume. Tout ce contenu reste nécessaire mais doit suivre la
preuve, pas la précéder.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 25-31 |
| 2 | **Résultat d'abord** : capture `container_db_is_ready.webp` (l. 302) + capture `sql_dev_get_data.webp` ou `getting_employees_as_json_curl`-équivalent montrant des données interrogées | l. 302 et environs |
| 3 | `## Download a Docker image for OracleDB` (compte, token, licence — marquer clairement comme la partie "installation") | l. 35-154 |
| 4 | `## Important concepts to consider when working with Oracle v12 and after` (marquer comme approfondissement optionnel : "skip if you just want to run it") | l. 156-169 |
| 5 | `## Create an Oracle database container` (fichiers de config, volume, `docker run`) | l. 171 et suivantes |
| 6 | Connexion via SQL*Plus / SQL Developer, exploration des données | reste de l'article |
| 7 | `## Going further` (déjà présente, sert de landing) | l. 436 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
