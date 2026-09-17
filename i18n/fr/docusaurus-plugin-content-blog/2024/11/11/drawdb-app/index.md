---
slug: drawdb-app
title: Drawdb-app - Rendez votre modèle de base de données en png, markdown, mermaid, ...
date: 2024-11-11
description: Visualisez et documentez facilement votre modèle de base de données avec DrawDB-app. Importez des fichiers SQL, générez des diagrammes et exportez en PNG, Markdown, Mermaid et plus encore.
authors: [christophe]
image: /img/v2/diagrams.webp
series: Diagrams as code
mainTag: database
tags:
  - database
  - doc-as-code
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore drawdb,xinsodev -->
![Drawdb-app - Rendez votre modèle de base de données](/img/v2/diagrams.webp)

<TLDR>
Cet article présente drawdb-app, un outil gratuit qui génère un diagramme ER visuel à partir d'un fichier `.sql` importé (ou construit de zéro) et l'exporte en PNG, JSON, Mermaid ou en documentation Markdown générée automatiquement (tables, colonnes, relations) — également auto-hébergeable via Docker (`xinsodev/drawdb`).
</TLDR>

Dans mon flux RSS récemment, je suis tombé sur une autre excellente application qui permet de créer un modèle de base de données de zéro, c'est-à-dire de créer les tables une par une et d'établir les liens entre elles.

Mais il y a une autre option que je trouve vraiment sympa : vous pouvez obtenir en quelques secondes une vue des tables et des relations de n'importe quelle application existante à partir d'un fichier .sql que vous importez dans drawdb-app. *Récupérer ce dump `.sql` depuis un container qui tourne se fait en un clic avec <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Adminer, pgadmin ou phpmyadmin</Link>.*

Voyons rapidement comment cela fonctionne.

<!--truncate-->

En ouvrant le site [https://www.drawdb.app/editor](https://www.drawdb.app/editor), la première chose qu'on vous demande est de choisir le format de base de données cible. Par exemple, choisissons PostgreSQL (Situation : *je développe une application Laravel qui utilise PostgreSQL et je veux voir les relations de ma DB dans une jolie image*).

Je pense que l'usage le plus courant que je pourrais personnellement en faire est de charger un fichier SQL. Pour cela, cliquez simplement sur le menu `File`, choisissez `Import from SQL` et, enfin, récupérez un fichier .sql créé précédemment sur votre disque dur.

## Créer et importer un fichier sql de test {#create-and-import-a-dummy-sql-file}

Si vous n'avez pas un tel fichier, je vous suggère d'en copier un depuis [https://www.sqltutorial.org/sql-sample-database/](https://www.sqltutorial.org/sql-sample-database/). Ci-dessous, vous trouverez le contenu PostgreSQL pris sur ce site ([lien direct](https://www.sqltutorial.org/wp-content/uploads/2020/04/postgresql.txt)) — ou vous pouvez prendre n'importe quel fichier `.sql` valide trouvé sur Internet.

<Snippet filename="create_db.sql" source="./files/create_db.sql" />

Copiez/collez donc ce SQL dans Notepad, sauvegardez-le sur votre disque et retournez sur [https://www.drawdb.app/editor](https://www.drawdb.app/editor) ; `File` -> `Import from SQL`.

Et laissez la magie se produire :

![Le modèle](./images/model.webp)

<AlertBox variant="info" title="L'image ci-dessus a été réalisée avec la fonctionnalité `File` -> `Export as`." />

### Vous pouvez auto-héberger l'application grâce à Docker si vous le souhaitez {#you-can-self-host-the-application-thanks-to-docker-if-you-want}

En visitant [https://hub.docker.com/search?q=drawdb-io](https://hub.docker.com/search?q=drawdb-io), vous trouverez quelques images Docker pour drawdb-app. Par exemple [https://hub.docker.com/r/xinsodev/drawdb](https://hub.docker.com/r/xinsodev/drawdb).

Pour la lancer, exécutez simplement `docker run --name some-drawdb -p 81:80 -d xinsodev/drawdb` et accédez à l'interface sur `http://localhost:81`.

## Jouons avec la fonctionnalité d'exportation {#playing-with-exportation-feature}

Maintenant, prenez le temps de regarder les fonctionnalités d'export ; cliquez à nouveau sur le menu `File` puis sur `Export as`.

![Export](./images/export.webp)

C'est vraiment cool de pouvoir exporter aussi facilement un fichier SQL en JSON, mais c'est encore plus cool de l'exporter en markdown. *Cet export Mermaid s'intègre directement dans le pipeline décrit dans <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link>, et drawDB rejoint la liste des outils de <Link to="/blog/docker-diagram-as-code">Docker - Diagrams as code</Link>.*

## Sous le capot (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<AlertBox variant="highlyImportant" title="Contenu généré automatiquement ci-dessous">
Le reste de cet article a été généré par drawDB.app ; un outil vraiment utile pour aider les développeurs à documenter leur base de données ! Vous trouverez ci-dessous deux tables représentatives — `employees` (la plus chargée, avec trois clés étrangères) et `regions` (la plus simple) — parmi les sept produites par l'export complet, ainsi que les relations entre toutes.
</AlertBox>

### Structure des tables {#table-structure}

#### employees {#employees}

| Nom        | Type          | Paramètres                      | Références                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **employee_id** | SERIAL | 🔑 PK, not null  |  | |
| **first_name** | BLOB | not null  |  | |
| **last_name** | BLOB | not null  |  | |
| **email** | BLOB | not null  |  | |
| **phone_number** | BLOB | not null  |  | |
| **hire_date** | DATE | not null  |  | |
| **job_id** | INTEGER | not null  | employees_job_id_fk | |
| **salary** | NUMERIC(8,2) | not null  |  | |
| **manager_id** | INTEGER | not null  |  | |
| **department_id** | INTEGER | not null  | employees_department_id_fk | |


#### regions {#regions}

| Nom        | Type          | Paramètres                      | Références                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **region_id** | SERIAL | 🔑 PK, not null  |  | |
| **region_name** | BLOB | not null  |  | |

### Relations {#relationships}

- **countries vers regions** : many_to_one
- **locations vers countries** : many_to_one
- **departments vers locations** : many_to_one
- **employees vers jobs** : many_to_one
- **employees vers departments** : many_to_one
- **dependents vers employees** : many_to_one

## Conclusion {#conclusion}

Importez un fichier `.sql`, récupérez un diagramme ER rendu en quelques secondes, et exportez-le en PNG, JSON, Mermaid ou en documentation Markdown prête à l'emploi — le tout sans rien installer, ou en auto-hébergé via l'image Docker `xinsodev/drawdb` si vous préférez garder ça en interne. L'export Mermaid s'insère directement dans <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link>, et drawDB est lui-même une entrée de plus dans la boîte à outils de <Link to="/blog/docker-diagram-as-code">Docker - Diagrams as code</Link>.
