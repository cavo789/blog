# Reader review : docker-postgrest

**Détecté :** 2026-08-11
**Article :** blog/2024/01/06/docker-postgrest/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **48 %** (première vraie sortie — le bloc ```json` du `curl /todos` — ligne 136
sur un corps de 219 lignes, `T = 31`).
Drapeaux : **install-avant-preuve** (`docker run … postgres` l. 65, puis le téléchargement du
binaire `curl -o postgrest-v14.16-linux-static-x86-64.tar.xz` l. 90) et
**abstraction-avant-preuve** (`create_db.sql` l. 79, `tutorial.conf` l. 98).
Redondance : 🟠 — « PostgREST transforme votre base PostgreSQL en API REST » énoncé **4 fois**
(TLDR l. 21, citation officielle l. 33, `<AlertBox>` « Will return JSON » l. 37, `<AlertBox>`
« PostgREST is magic » l. 42).

Test des 30 secondes : *j'abandonne* — les 30 premières lignes du corps sont deux `<AlertBox>`
consécutives qui expliquent le même concept, puis on me demande de lancer un conteneur
PostgreSQL et de télécharger une archive `.tar.xz` avant d'avoir vu la moindre réponse JSON.

## Risque

Le lecteur d'une minute rate exactement l'argument qui vend l'outil : `curl
http://localhost:3000/todos | jq` renvoie du JSON prêt à consommer **sans une ligne de code
backend**. Ce bloc existe déjà (l. 130-153), il est juste à mi-article, derrière une
installation en trois étapes.

Deux problèmes secondaires à traiter au passage :

- Les deux `<AlertBox>` d'introduction (l. 37 et l. 42) portent le même message. La seconde
  contient en plus un exemple `axios` — du code frontend avant même la première requête.
- La section `## Illustration of some calls` (l. 203-250) interroge des tables `citizens`,
  `workers`, `levels`, `translations`, `generic_profiles` qui **n'existent pas** dans la base du
  tutoriel (laquelle ne contient que `todos`). Aucune phrase ne prévient le lecteur que ces
  exemples viennent d'un autre projet — il va copier-coller et obtenir une 404.
- Pas de `## Conclusion` : l'article se termine sur une puce « Cast the ID as string ».

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook inchangé + `<!-- truncate -->` | l. 21-31 |
| 2 | `## What PostgREST Does For You` — le `curl http://localhost:3000/todos \| jq` et sa réponse JSON, plus la phrase « aucune ligne de code backend » | l. 130-155 |
| 3 | `## Why It Works` — 3 puces sans code : les contraintes et permissions de la base *sont* l'API ; réponse JSON native ; plus de modèles ni de requêtes à écrire. Fusionne les deux AlertBox actuelles, l'exemple `axios` descend en movement 5 | l. 33-56, condensé |
| 4 | `## Setting It Up` — Step 1 (conteneur PostgreSQL + `create_db.sql`) et Step 2 (binaire PostgREST + `tutorial.conf`), inchangés | l. 57-124 |
| 5 | `## More Queries` — filtres, full-text search, sélection de champs, puis l'exemple `axios` récupéré de l'AlertBox | l. 156-183 + l. 46-54 |
| 6 | `## Under the Hood (skip this if you just want to use it)` — permissions, OpenAPI / Swagger UI, arrêt des conteneurs | l. 185-201 |
| 7 | `## Illustration of some calls` — **précédée d'une phrase d'avertissement** : ces requêtes viennent du dépôt `cavo789/postgrest`, pas de la base `todos` créée ici | l. 203-250 + nouveau |
| 8 | `## Conclusion` — ce que le lecteur peut faire maintenant, + les liens existants (`docker-oracle-ords`, `docker-adminer-pgadmin-phpmyadmin`, `linux-jq`) | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
