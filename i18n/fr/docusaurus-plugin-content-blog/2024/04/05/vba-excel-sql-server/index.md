---
slug: vba-excel-sql-server
title: MS Excel - Se connecter à une base de données SQL Server, exécuter une requête et récupérer les résultats
date: 2024-04-05
description: Connectez MS Excel à SQL Server avec VBA. Exécutez des requêtes SQL, injectez les résultats directement dans votre feuille de calcul et conservez la mise en forme. Découvrez la meilleure méthode pour rafraîchir les données ou les partager en toute sécurité.
authors: [christophe]
image: /img/v2/mssql.webp
series: MS Excel - Connect to a SQL Server database
mainTag: excel
tags:
  - database
  - excel
  - vba
language: fr
blueskyRecordKey: 3lvnkbm63nc2v
updates:
  - date: 2026-07-30
    note: "GitHub repo cavo789/vba_excel_sql archived May 2025 (read-only); VBA code remains functional and can still be copied from the repository."
---
![MS Excel - Se connecter à une base de données SQL Server, exécuter une requête et récupérer les résultats](/img/v2/mssql.webp)

<TLDR>
Cet article renvoie vers le projet GitHub `vba_excel_sql` de l'auteur, qui fournit du code VBA pour exécuter une requête SQL sur une base de données SQL Server directement depuis Excel et injecter les résultats dans une feuille tout en conservant sa mise en forme. Deux méthodes d'injection sont proposées : `AddQueryTable` (garde la connexion active pour un rafraîchissement en un clic) et `CopyToSheet` (supprime la connexion et les identifiants, plus sûr pour le partage).
</TLDR>

<AlertBox variant="info">
Lisez plutôt mon nouvel article <Link to="/blog/vba-excel-sql-server-part-2">MS Excel - Connect to a SQL Server database, run a query and get the results - Step by step</Link>, bien plus complet que celui-ci.

</AlertBox>

Imaginez que vous puissiez exécuter une requête comme `SELECT customer_id, first_name, last_name, email FROM customers ORDER BY last_name ASC;` dans votre feuille Excel et qu'Excel se connecte à votre <Link to="/blog/docker-mssql-server">base de données Microsoft SQL Server</Link>, y exécute la requête, récupère le résultat et place les données directement dans votre feuille. Sympa, non ?

Imaginez que votre feuille ait déjà une belle mise en page avec des couleurs, des titres avec filtres activés et, par exemple, un nom (comme `rngMyCustomers`). Ce serait bien que les données mises à jour conservent toute la mise en page et étendent simplement la plage nommée, non ?

Arrêtez d'imaginer, c'est vraiment très simple !

<!-- truncate -->

Il y a des années, j'ai publié [https://github.com/cavo789/vba_excel_sql](https://github.com/cavo789/vba_excel_sql) pour ça.

Vous trouverez dans mon repository GitHub toutes les explications pour y arriver, c'est-à-dire un code VBA à ajouter dans votre fichier Excel ([accès rapide](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/clsData.cls)) et une [démo](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/test.bas).

Cette fois, je ne vais pas réécrire toute l'explication sous forme d'article parce que tout est déjà listé sur GitHub ; suivez ce lien : [https://github.com/cavo789/vba_excel_sql](https://github.com/cavo789/vba_excel_sql)

<AlertBox variant="info" title="AddQueryTable ou CopyToSheet">
Vous verrez qu'il y a deux méthodes : `AddQueryTable` et `CopyToSheet`. Avec la première, les données sont injectées dans votre feuille Excel sous forme de *query table*, ce qui offre d'énormes possibilités, comme celle de relancer la requête. Autrement dit, la prochaine fois, il suffit de faire un clic droit sur votre tableau et de choisir `Refresh` dans le menu contextuel : hop, la requête est réexécutée sur SQL Server et vous obtenez la mise à jour en quelques secondes.

Avec `CopyToSheet`, vous perdez la connectivité : la feuille peut être envoyée à quelqu'un d'autre sans risque. Les identifiants nécessaires pour se connecter au serveur ne sont pas conservés dans la feuille, contrairement à la méthode `AddQueryTable`.

</AlertBox>
