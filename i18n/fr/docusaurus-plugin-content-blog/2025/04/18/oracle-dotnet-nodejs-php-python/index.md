---
slug: oracle-dotnet-nodejs-php-python
title: Accéder à une base de données Oracle avec .Net, NodeJS, PHP et Python
date: 2025-04-18
description: Guide pas à pas pour accéder à un container de base de données Oracle avec .Net, Node.js, PHP et Python. Inclut le Dockerfile et des exemples de code complets pour chaque langage.
authors: [christophe]
image: /img/v2/oracle.webp
series: Running Oracle Database Server as a Docker container
mainTag: oracle
tags:
  - docker
  - oracle
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnjmthgj22v
---
![Accéder à une base de données Oracle avec .Net, NodeJS, PHP et Python](/img/v2/oracle.webp)

<TLDR>
Ce guide pas à pas montre comment se connecter à une base de données Oracle depuis .Net, Node.js, PHP et Python. Pour chaque langage, vous trouverez un exemple complet, prêt à l'emploi, avec le `Dockerfile` permettant de construire un container contenant toutes les dépendances nécessaires, ainsi qu'un script d'exemple pour interroger la base. Cet article fournit un template de démarrage rapide pour toute personne devant intégrer une base Oracle dans son application, quel que soit le langage de programmation.
</TLDR>

Dans un article précédent (<Link to="/blog/docker-oracle-database-server">Running Oracle Database Server as a Docker container</Link>), nous avons créé un container Docker appelé `oracle-db` dans lequel tourne une base de données « Human Resources ».

Cette fois, amusons-nous avec .Net, NodeJS, PHP et Python pour y accéder et afficher des enregistrements.

Pour chaque langage, nous allons construire une image Docker avec tout le nécessaire, comme l'Oracle Instant Client, puis nous écrirons un petit script pour nous connecter à la table `employees` et afficher les enregistrements.

L'idée est de fournir un squelette très rapide pour démarrer un projet dans ces langages lorsque vous avez besoin de vous connecter directement à une base Oracle.

*Si vous préférez ne pas écrire de connecteur du tout, <Link to="/blog/docker-oracle-ords">Transform an Oracle DB as OpenData using Oracle REST Data Services</Link> expose les mêmes tables sous forme d'API REST que n'importe quel langage peut consommer avec un simple appel HTTP.*

<!-- truncate -->

Voici le résultat, quel que soit le langage choisi ci-dessous : un petit container Docker qui se connecte et affiche la table des employés.

![Utiliser .Net pour accéder à la liste des employés](./images/using_dotnet.webp)

Dans l'article <Link to="/blog/docker-oracle-database-server">Running Oracle Database Server as a Docker container</Link>, nous avons créé un container Docker appelé `oracle-db` dans lequel tourne une base de données « Human Resources ».

Merci de lire cet article et d'en suivre les étapes afin d'avoir, avant de continuer ici, un container Docker fonctionnel tel que décrit ci-dessous.

## Quelques prérequis {#some-prerequisites}

<StepsCard
  title="Avant de commencer, assurez-vous que..."
  variant="prerequisites"
  steps={[
    "Vous avez un container Docker en cours d'exécution appelé `oracle-db`,",
    "Le container tourne donc sur votre `localhost`,",
    "Le numéro de port pour accéder à votre base de données est `1521`,",
    "Les identifiants à utiliser sont `SYS` (ou `SYSTEM`) et `admin` comme mot de passe,",
    "Le container contient une base de données appelée `ORCLPDB1` (aussi appelée nom de service) qui est l'exemple Human Resources d'Oracle (voir l'article mentionné) et",
    "Notre base `oracle-db` tourne sur un réseau appelé `oracle`.",
  ]}
/>

## Les exemples de code ont été largement créés avec l'IA {#the-code-samples-were-largely-created-using-ai}

Parce que c'est rapide et aussi parce que je ne connais pas .Net et très peu NodeJS, j'ai utilisé Google Gemini pour construire mes exemples ci-dessous. Parfois, comme pour .Net, c'était presque prêt à l'emploi. Parfois, comme pour PHP, c'était plus compliqué et il m'a fallu pas mal de bidouillage pour trouver la bonne configuration.

L'objectif de cet article était néanmoins de fournir le minimum de fichiers pour se connecter à une base Oracle, exécuter une requête SELECT et afficher les résultats ; pas d'avoir une base de code exemplaire.

## Accéder à notre container Oracle DB avec .Net {#access-our-oracle-db-container-using-net}

Premier langage par ordre alphabétique ; jouons avec un container .Net :

<Terminal typewriter>
$ mkdir -p /tmp/oracle/dotnet && cd $_
</Terminal>

Créez aussi ce répertoire :

<Terminal typewriter>
$ mkdir -p /tmp/oracle/dotnet/OracleConnector
</Terminal>

Créons un Dockerfile :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Passons maintenant à la partie DotNet. Nous avons besoin de deux fichiers : `OracleConnector/OracleConnector.csproj` et `OracleConnector/main.cs`.

<Snippet filename="OracleConnector/OracleConnector.csproj" source="./files/OracleConnector.csproj" />

<Snippet filename="OracleConnector/main.cs" source="./files/main.cs" />

Voici à quoi ressemble votre projet dans VSCode :

![Projet .Net dans VSCode](./images/vscode_dotnet.webp)

Toujours dans la console, dans le dossier `/tmp/oracle/dotnet`, construisez l'image Docker et lancez le container (et donc le script) : `clear ; docker build -t oracle-dotnet . && docker run --rm -it --network oracle oracle-dotnet`.

Et voilà — le même résultat que celui affiché en haut de cet article, notre code .Net a bien accédé à la liste.

## Accéder à notre container Oracle DB avec NodeJS {#access-our-oracle-db-container-using-nodejs}

Deuxième par ordre alphabétique, jouons avec un container NodeJS :

<Terminal typewriter>
$ mkdir -p /tmp/oracle/nodejs && cd $_
</Terminal>

Créons un Dockerfile :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

Nous avons aussi besoin de ces fichiers :

<Snippet filename="package.json" source="./files/package.json" />

<Snippet filename="main.js" variant="js">

<!-- cspell:disable -->

```js
// cspell:ignore orclpdb1, oracledb

const oracledb = require("oracledb");

async function run() {
  let connection;

  try {
    const dbHost = process.env.ORACLE_HOST || "oracle-db";
    const dbPort = process.env.ORACLE_PORT || "1521";
    const dbService = process.env.ORACLE_SERVICE || "orclpdb1";
    const dbUser = process.env.ORACLE_USER || "SYSTEM";
    const dbPassword = process.env.ORACLE_PASSWORD || "admin";

    const connectConfig = {
      user: dbUser,
      password: dbPassword,
      connectString: `${dbHost}:${dbPort}/${dbService}`,
    };

    connection = await oracledb.getConnection(connectConfig);

    const result = await connection.execute(
      `SELECT employee_id, first_name, last_name, email FROM employees WHERE ROWNUM <= 25`, // Assuming your table is named 'EMPLOYEES'
    );

    console.log(
      "\nEmployee ID | First Name           | Last Name             | Email",
    );
    console.log(
      "------------|----------------------|-----------------------|-------------------------",
    );

    for (const row of result.rows) {
      const employeeId = row[0];
      const firstName = row[1];
      const lastName = row[2];
      const email = row[3];
      console.log(
        `${employeeId.toString().padEnd(12)}| ${firstName.padEnd(21)}| ${lastName.padEnd(21)}| ${email}`,
      );
    }
  } catch (err) {
    console.error("Error connecting to or querying Oracle:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

run();
```

<!-- cspell:enable -->

</Snippet>

Toujours dans la console, dans le dossier `/tmp/oracle/nodejs`, construisez l'image Docker et lancez le container (et donc le script) : `clear ; docker build -t oracle-nodejs . && docker run --rm -it --network oracle oracle-nodejs`.

![Utiliser NodeJS pour accéder à la liste des employés](./images/using_nodejs.webp)

Sympa ! Comme vous pouvez le voir, on accède assez facilement à notre base Oracle avec NodeJS.

## Accéder à notre container Oracle DB avec PHP {#access-our-oracle-db-container-using-php}

Et, dernier par ordre alphabétique ; terminons avec un container PHP :

<Terminal typewriter>
$ mkdir -p /tmp/oracle/php && cd $_
</Terminal>

Et là, créons un Dockerfile :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part3" />

Créons ensuite un script PHP (*généré avec l'IA*)

<!-- cspell:disable -->

<Snippet filename="main.php" source="./files/main.php" />

Toujours dans la console, dans le dossier `/tmp/oracle/php`, construisez l'image Docker et lancez le container (et donc le script) : `clear ; docker build -t oracle-php . && docker run --rm -it --network oracle oracle-php`.

![Utiliser PHP pour accéder à la liste des employés](./images/using_php.webp)

## Accéder à notre container Oracle DB avec Python {#access-our-oracle-db-container-using-python}

Créons maintenant un script Python :

<Terminal typewriter>
$ mkdir -p /tmp/oracle/python && cd $_
</Terminal>

Et son Dockerfile ; la seule chose dont nous avons besoin (à part Python) est d'installer la dépendance `oracledb`. Plutôt simple.

<Snippet filename="Dockerfile" source="./files/Dockerfile.part4" />

Créons ensuite un script Python (*généré avec l'IA*)

<!-- cspell:disable -->

<Snippet filename="main.py" source="./files/main.py" />

Toujours dans la console, dans le dossier `/tmp/oracle/python`, construisez l'image Docker et lancez le container (et donc le script) : `clear ; docker build -t oracle-python . && docker run --rm -it --network oracle oracle-python`.

![Utiliser Python pour accéder à la liste des employés](./images/using_python.webp)

Sympa ! Comme vous pouvez le voir, on accède assez facilement à notre base Oracle avec Python.

## Conclusion {#conclusion}

Vous savez quoi ? J'ai plus de 15 ans d'expérience avec PHP et seulement 6 mois avec Python et, si on regarde le Dockerfile des deux langages, aucun doute possible : celui de Python est tellement plus simple à lire et à configurer. J'ai eu beaucoup de mal à faire fonctionner celui de PHP, et aucune difficulté avec Python puisqu'il s'agit d'une seule dépendance à installer, et c'est tout.

Et si on compare le code PHP et le code Python, ils sont assez similaires mais, je dois l'admettre, celui de Python a ma préférence : pas besoin de vérifier les erreurs à plusieurs endroits, on peut définir plus facilement les types de données des variables, l'instruction echo est plus lisible, ...
