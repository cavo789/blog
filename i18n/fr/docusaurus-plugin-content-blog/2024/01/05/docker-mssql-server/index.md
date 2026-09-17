---
slug: docker-mssql-server
title: Jouer avec Microsoft SQL Server 2022 avec Docker
date: 2024-01-05
description: Lancez facilement MSSQL Server 2022 avec Docker. Ce guide pas à pas vous montre comment installer le container, vous connecter avec SSMS et commencer à interroger votre base de données.
authors: [christophe]
image: /img/v2/mssql.webp
mainTag: database
tags:
  - database
  - docker
language: fr
updates:
  - date: 2026-07-30
    note: "SA_PASSWORD deprecated; updated to MSSQL_SA_PASSWORD (required from SQL Server 2022 CU 14+ onwards)."
---
![Jouer avec Microsoft SQL Server 2022 avec Docker](/img/v2/mssql.webp)

<TLDR>
Cet article montre comment lancer Microsoft SQL Server 2022 dans Docker, s'y connecter avec SQL Server Management Studio (SSMS) et créer une base de données et une table d'exemple. Il se termine par un petit script PowerShell qui se connecte à la base et exécute une query : un aller-retour complet en local, du container aux résultats.
</TLDR>

Et oui, rien de moins. Nous allons installer un **Microsoft SQL Server 2022** sur notre machine, installer aussi **SQL Server Management Studio** et nous amuser avec un petit script PowerShell ; le tout avec Docker, évidemment. *Si c'est Oracle qu'il vous faut, j'ai aussi écrit <Link to="/blog/docker-oracle-database-server">Running Oracle Database Server as a Docker container</Link>.*

<!-- truncate -->

Le repository Docker officiel de Microsoft SQL Server se trouve sur [https://hub.docker.com/_/microsoft-mssql-server](https://hub.docker.com/_/microsoft-mssql-server).

<Vars port="1433" name="sqlserverdb" labels={{ port: "Port de l'host", name: "Nom du container" }} />

Commençons par télécharger et lancer une instance de SQL Server 2022 avec l'instruction suivante :

<Terminal typewriter>
$ docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=2Secure*Password2" -p %%port=1433%%:1433 --name %%name=sqlserverdb%% -h mysqlserver -d mcr.microsoft.com/mssql/server:2022-latest
</Terminal>

Avec la commande ci-dessus, nous acceptons les termes du *End-User License Agreement* et nous définissons le mot de passe de l'utilisateur `SA` à `2Secure*Password2`.

Le port que nous utiliserons sur notre host est le port <Var name="port">1433</Var> (mappé sur le port `1433` du container), notre instance SQL Server s'appellera <Var name="name">sqlserverdb</Var> (nom interne utilisé par Docker) et nous nommerons notre host `mysqlserver`.

Nous pouvons vérifier la liste des containers en cours d'exécution grâce à docker container list :

<Terminal typewriter>
$ docker container list

[...] IMAGE                                       [...] NAMES
[...] mcr.microsoft.com/mssql/server:2022-latest  [...] %%name=sqlserverdb%%
</Terminal>

<AlertBox variant="info" title="La sortie ci-dessus a été simplifiée">
Pour plus de clarté, la sortie de `docker container list` a été simplifiée ici ; toutes les colonnes n'ont pas été reprises dans l'article.

</AlertBox>

Maintenant, si vous n'avez pas encore **SQL Server Management Studio** (aussi appelé **SSMS**) sur votre machine, téléchargez-le gratuitement depuis [https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16).

Lancez le programme d'installation et attendez qu'il soit installé sur votre machine.

![Installation de SQL Server Management Studio](./images/download_ssms.webp)

Démarrez maintenant SSMS (vous le trouverez dans votre menu `Start` de Windows) :

![Ouverture de SSMS](./images/opening_ssms.webp)

Utilisez les valeurs ci-dessous pour l'authentification :

<ConnectionInfo
  items={[
    { label: "Nom du serveur", value: "localhost,1433" },
    { label: "Authentification", value: "SQL Server Authentication" },
    { label: "Login", value: "SA" },
    { label: "Mot de passe", value: "2Secure*Password2" },
  ]}
/>

<AlertBox variant="info" title="Pourquoi ces valeurs ?">
<Var name="port">1433</Var> est le numéro de port que nous avons déclaré dans notre instruction `docker run`, l'utilisateur *admin* par défaut est `SA` et le mot de passe a été initialisé plus tôt à `2Secure*Password2` (voir la variable d'environnement `MSSQL_SA_PASSWORD` dans notre commande `docker run`.)

</AlertBox>

![Authentification](./images/authentication.webp)

Cliquez sur le bouton `Connect` et SSMS sera connecté à votre instance Docker. Il est temps de créer notre base de données.

<AlertBox variant="tip" title="Pas de client Windows ?">
SSMS ne fonctionne que sous Windows. Pour une alternative dans le navigateur qui fonctionne avec presque tous les moteurs, voyez <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Using Adminer, pgadmin or phpmyadmin to access your Docker database container</Link>.
</AlertBox>

## Créer la base de données, la table et ajouter quelques enregistrements {#create-the-database-the-table-and-add-some-records}

Une fois connecté dans SSMS, exécutez la query suivante pour créer une base de données d'exemple `MyDB`, créer une table appelée `dbo.Person` et ajouter quelques enregistrements.

Pour ce faire, cliquez sur le bouton `New Query` (ou pressez <kbd>CTRL</kbd>-<kbd>N</kbd>), collez le SQL ci-dessous puis cliquez sur le bouton `Execute` (ou pressez <kbd>F5</kbd>).

![Créer la base de données](./images/create_database.webp)

<Snippet filename="create_db.sql" source="./files/create_db.sql" />

Félicitations, vous avez créé une base de données `MyDB` avec une table `dbo.Person` :

![La base de données a été créée](./images/database_created.webp)

<AlertBox variant="info" title="Pensez à rafraîchir l'`Object Explorer`">
Si, après avoir lancé la query, vous ne voyez pas encore votre base de données dans le panneau `Object Explorer`, pensez à le rafraîchir. Cliquez n'importe où dans le panneau et pressez <kbd>F5</kbd> ou faites un clic droit sur l'élément racine <Code>localhost, <Var name="port">1433</Var></Code> et choisissez `Refresh` dans le menu contextuel.

</AlertBox>

## Écrire un script PowerShell et se connecter à la base de données {#write-a-powershell-script-and-connect-to-the-database}

*Ce n'est probablement pas la meilleure façon d'interroger une base SQL Server, l'exemple vient de Stack Overflow... Si vous êtes plutôt du genre Excel, voyez <Link to="/blog/vba-excel-sql-server">MS Excel - Connect to a SQL Server database, run a query and get the results</Link>.*

Comme exemple, nous allons créer un script PowerShell appelé `connect.ps1` pour illustrer comment interroger notre nouvelle base de données :

<Snippet filename="connect.ps1" source="./files/connect.ps1" />

Lancez une console DOS ou PowerShell et exécutez cette commande : `powershell -executionpolicy bypass -File .\connect.ps1`.

![Exécution du script PowerShell](./images/run_powershell.webp)

Nous avons maintenant validé que votre base de données est fonctionnelle et accessible. À vous de vous approprier cet exemple !
