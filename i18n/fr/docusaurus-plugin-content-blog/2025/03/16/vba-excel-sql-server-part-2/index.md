---
slug: vba-excel-sql-server-part-2
title: MS Excel - Se connecter à une base de données SQL Server, exécuter une requête et récupérer les résultats - Pas à pas
date: 2025-03-16
description: Connectez MS Excel VBA à SQL Server avec ce tutoriel pas à pas. Apprenez à exécuter des requêtes SQL, récupérer les données et afficher les résultats dans votre feuille de calcul. Configuration Docker incluse.
authors: [christophe]
image: /img/v2/mssql.webp
series: MS Excel - Connect to a SQL Server database
mainTag: excel
tags:
  - database
  - docker
  - excel
  - vba
language: fr
updates:
  - date: 2026-07-30
    note: "SA_PASSWORD env var deprecated since SQL Server 2022 CU14+; use MSSQL_SA_PASSWORD. GitHub repo cavo789/vba_excel_sql archived (Nov 2021) — code still functional."
blueskyRecordKey: 3lvnkdmwmwk2v
---
![MS Excel - Se connecter à une base de données SQL Server, exécuter une requête et récupérer les résultats - Pas à pas](/img/v2/mssql.webp)

<TLDR>
Ce tutoriel détaillé, pas à pas, vous apprend à connecter Microsoft Excel à une base de données SQL Server via VBA. Il couvre tout : mettre en place une instance SQL Server avec Docker, créer une base d'exemple, puis écrire le code VBA qui exécute les requêtes et importe les données dans votre feuille de calcul. Vous verrez comment configurer la connexion, utiliser une classe VBA maison pour récupérer les données, et écrire les résultats directement dans votre feuille, avec ou sans connexion vivante pour rafraîchir les données.
</TLDR>

En avril 2024, j'ai écrit un petit <Link to="/blog/vba-excel-sql-server">blog post</Link> à propos d'un script VBA qui se connecte à une base MS SQL, exécute une requête SELECT pour récupérer des données et les place dans une feuille Excel.

Réécrivons cet article sous la forme d'un tutoriel complet. Nous allons installer et lancer une base de données SQL Server avec Docker, télécharger MS SQL Server Management Studio, nous connecter à notre SQL Server, créer une nouvelle base avec des données bidon et, enfin, récupérer la liste de nos clients dans Excel.

*Excel est un front-end confortable, mais un mauvais endroit pour stocker de gros volumes de données. Quand le volume grandit, <Link to="/blog/python-pandas-merge">Pandas - Merge two or more files and create a merged one</Link> explique pourquoi, et quoi faire à la place.*

<!-- truncate -->

Voici le résultat : une requête en direct contre SQL Server, dont les lignes atterrissent directement dans une feuille Excel.

![Vous avez la liste des clients](./images/worksheet.webp)

## Pourquoi ça fonctionne {#why-it-works}

- Une seule classe VBA (`clsData`) encapsule ADO : chaque sous-routine lui demande simplement un recordset au lieu de bricoler une chaîne de connexion à chaque fois.
- `CopyToSheet` copie les données une fois — rapide, mais aucun lien vivant avec la base.
- `AddQueryTable` garde au contraire la connexion active : l'utilisateur final peut faire *Données → Actualiser* dans Excel à tout moment pour obtenir des données fraîches.

## Télécharger SQL Server et créer une base de données bidon {#download-sql-server-and-create-a-dummy-database}

Vous pouvez sauter cette étape si vous disposez déjà d'une instance SQL Server à laquelle vous connecter.

Lisez l'article complet <Link to="/blog/docker-mssql-server">Play with Microsoft SQL Server 2022 using Docker</Link> pour plus d'informations sur la façon de faire tourner votre propre instance SQL Server.

En bref :

- Ouvrez une console (DOS, PowerShell ou Linux),
- Exécutez `docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=2Secure*Password2" -p 1433:1433 --name sqlserverdb -h mysqlserver -d mcr.microsoft.com/mssql/server:2022-latest` pour télécharger SQL Server et en lancer une instance dans un container Docker,
- Téléchargez [SQL Server Management Studio](https://learn.microsoft.com/en-us/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16#download-ssms) si vous ne l'avez pas encore. C'est gratuit.
- Une fois installé, démarrez SQL Server Management Studio.

Utilisez les valeurs ci-dessous pour l'authentification :

<ConnectionInfo
  items={[
    { label: "Nom du serveur", value: "localhost,1433" },
    { label: "Authentification", value: "SQL Server Authentication" },
    { label: "Login", value: "SA" },
    { label: "Mot de passe", value: "2Secure*Password2" },
  ]}
/>

Vous voilà dans SSMS. Nous allons créer une base bidon. À l'aide d'une IA, j'ai demandé un script, le voici :

<Snippet filename="create_db.sql" source="./files/create_db.sql" />

![Le script de création](./images/creation_sql.webp)

Il suffit de cliquer sur le bouton `Execute` ou d'appuyer sur <kbd>F5</kbd> pour l'exécuter, c'est-à-dire pour créer notre base `SampleDB`.

Maintenant, faites un clic droit sur le nœud `Databases` (dans l'arborescence en haut à gauche) et vous verrez : notre DB est là.

![La base SampleDB](./images/customers.webp)

## La partie Excel {#the-excel-part}

Rendez-vous sur [https://github.com/cavo789/vba_excel_sql](https://github.com/cavo789/vba_excel_sql) pour récupérer mon code VBA. Ce code est une classe VBA pour Excel qui rend vraiment simple l'accès aux enregistrements stockés dans SQL Server et leur affichage dans une feuille Excel, en gardant ou non la connexion active (vous pouvez donc faire un Refresh à tout moment).

<AlertBox variant="info">
Le repository GitHub est archivé (lecture seule depuis novembre 2021). Le code VBA reste parfaitement fonctionnel ; aucune mise à jour n'est prévue.
</AlertBox>

Démarrez Excel et créez un nouveau classeur.

![Nouveau classeur](./images/new_workbook.webp)

Appuyez sur <kbd>ALT</kbd>+<kbd>F11</kbd> pour ouvrir l'interface VBE.

Faites un clic droit sur *Microsoft Excel Objects* dans le volet de gauche *Project - VBAProject* et insérez une nouvelle classe.

![Insertion d'une nouvelle classe](./images/insert_class.webp)

Allez sur [https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/clsData.cls](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/clsData.cls) et cliquez sur le bouton *Copy raw file*

![Copy raw file](./images/copy_raw_file.webp)

Collez le contenu dans l'éditeur VBE et supprimez les premières lignes comme montré ci-dessous.
Ensuite, dans le volet *Properties* en bas à gauche, cliquez sur le champ *(Name)* et tapez `clsData` comme nouveau nom.

![clsData](./images/clsData.webp)

Créez maintenant un nouveau module.

![Insertion d'un nouveau module](./images/insert_module.webp)

Allez sur [https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/test.bas](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/test.bas) et cliquez sur le bouton *Copy raw file*.

Collez le contenu dans l'éditeur VBE et supprimez la première ligne comme montré ci-dessous. Ensuite, dans le volet *Properties* en bas à gauche, cliquez sur le champ *(Name)* et tapez `test` comme nouveau nom.

![Module test](./images/test.webp)

Toujours dans le module `test`, faites attention aux toutes premières lignes :

![Initialisation du module](./images/initialization.webp)

Vous devrez adapter ces valeurs aux vôtres. Si vous avez créé l'instance SQL Server comme expliqué plus haut, utilisez ces valeurs :

<Snippet filename="clsData.bas" source="./files/clsData.bas" />

![Avec l'initialisation](./images/initialization_done.webp)

Toujours dans le VBA, cliquez sur le menu `Tools` puis sélectionnez `References`

![Tools -> References](./images/tools_references.webp)

Dans la liste, faites défiler jusqu'à trouver `Microsoft ActiveX Data Objects 2.8 Library` et, une fois trouvé, sélectionnez-le.

![Microsoft ActiveX Data Objects 2.8 Library](./images/activex_data_objects.webp)

### Jouons avec CopyToSheet {#lets-play-with-copytosheet}

Toujours dans l'interface VBE, sélectionnez le module `test` et descendez jusqu'à la sous-routine `CopyToSheet`.

![CopyToSheet](./images/copy_to_sheet.webp)

<AlertBox variant="caution" title="Nous devons fournir nos identifiants SQL Server">
Comme illustré sur l'image ci-dessus, aucun nom d'utilisateur ni mot de passe n'a été fourni. Dans cet état, la connexion se ferait avec notre compte Windows mais, dans cet article, nous n'avons pas fait la configuration nécessaire pour cela.

Nous avons néanmoins un compte SQL appelé `SA` : nous allons l'utiliser.

</AlertBox>

Mettez à jour la sous-routine et ajoutez deux lignes :

<Snippet filename="module.bas" source="./files/module.bas" />

Nous sommes prêts. Placez votre curseur dans la fonction `CopyToSheet`, n'importe où, et appuyez sur <kbd>F5</kbd> pour l'exécuter.

Rien ne s'est passé ? Vous en êtes sûr ?

Passez de l'interface VBE à votre feuille Excel et tadaaa — le même résultat que celui déjà montré en haut de cet article.

## La liste des fonctionnalités (approfondissement optionnel — code complet de chaque sous-routine) {#the-list-of-features-optional-deep-dive--full-code-for-each-subroutine}

<AlertBox variant="danger">
SI UN NOM D'UTILISATEUR ET UN MOT DE PASSE ONT ÉTÉ FOURNIS, CES INFORMATIONS SERONT ENREGISTRÉES EN CLAIR DANS LA CHAÎNE DE CONNEXION ! Cela vaut pour `AddQueryTable` comme pour `RunSQLAndExportNewWorkbook` ci-dessous, dès que `bPersist` vaut `True`.

</AlertBox>

### Sous-routine CopyToSheet {#copytosheet-subroutine}

#### Description {#description}

Récupère un recordset depuis la base et l'écrit dans une feuille. Cette fonction fait une copie, pas un lien => il n'y a aucun lien avec la base, aucun moyen de faire un refresh.

#### Avantages {#advantages}

Rapide

#### Inconvénient {#drawback}

Ne conserve aucun lien avec la DB, les enregistrements sont copiés dans Excel

Exemple de code :

<Snippet filename="module.bas" source="./files/module.part2.bas" />

### Sous-routine AddQueryTable {#addquerytable-subroutine}

#### Description {#description-1}

Crée une query table dans une feuille : crée la connexion, la query table, lui donne un nom et récupère les données.

#### Avantages {#advantages-1}

Garde la connexion active. L'utilisateur final pourra faire un Données -> Actualiser pour obtenir une mise à jour de la feuille.
Si l'utilisateur n'a pas accès à la base, les enregistrements resteront bien visibles mais sans aucune possibilité de les rafraîchir

#### Inconvénient {#drawback-1}

Si le paramètre bPersist vaut True, la chaîne de connexion sera en clair dans le fichier (=> évitez ceci si vous utilisez un login / mot de passe).

#### Paramètres {#parameters}

- `sSQL` : instruction à utiliser (une instruction SQL valide comme `SELECT ... FROM ...` ou `EXEC usp_xxxx`)
- `sQueryName` : nom interne qui sera donné à la querytable
- `rngTarget` : destination du recordset retourné (p.ex. `Sheet1!$A$1`)
- `bPersist` : si true, la chaîne de connexion sera stockée et l'utilisateur pourra alors rafraîchir la requête

Exemple de code

<Snippet filename="module.bas" source="./files/module.part3.bas" />

### Sous-routine RunSQLAndExportNewWorkbook {#runsqlandexportnewworkbook-subroutine}

#### Description {#description-2}

Cette fonction appelle la fonction AddQueryTable de cette classe mais crée d'abord un nouveau classeur, récupère les données et met en forme la feuille (ajoute un titre, affiche la date/heure de « Last extracted date » dans le rapport, ajoute les filtres automatiques, la mise en page et plus encore.

Le classeur obtenu sera prêt à être envoyé à quelqu'un.

#### Paramètres {#parameters-1}

- `sSQL` : instruction à utiliser (une instruction SQL valide comme `SELECT ... FROM ...` ou `EXEC usp_xxxx`)
- `sReportTitle` : titre de la feuille
- `bPersist` : si true, la chaîne de connexion sera stockée et l'utilisateur pourra alors rafraîchir la requête

Exemple de code

<Snippet filename="module.bas" source="./files/module.part4.bas" />

## Conclusion {#conclusion}

Une classe VBA, un container SQL Server, et Excel passe du tableur statique à une véritable surface de requête — copiez les données une fois avec `CopyToSheet`, ou gardez-les rafraîchissables avec `AddQueryTable`. Voyez la <Link to="/blog/vba-excel-sql-server">première version, plus courte, de cet article</Link> si vous voulez juste le snippet minimal sans toute la mise en place Docker + SSMS.
