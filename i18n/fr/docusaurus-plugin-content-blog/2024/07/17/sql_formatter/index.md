---
slug: sql-formatter
title: SQL - Outil de formatage
date: 2024-07-17
description: Nettoyez facilement du code SQL legacy illisible avec un simple outil de formatage. Rendez vos requêtes SQL immédiatement lisibles et démarrez votre revue de code.
authors: [christophe]
image: /img/v2/sql_format.webp
series: code quality
mainTag: self-hosted
tags:
  - code-quality
  - database
  - self-hosted
language: fr
review_date: 2026-07-30
---
![SQL - Outil de formatage](/img/v2/sql_format.webp)

<TLDR>
Cet article présente l'outil SQL Formatter de l'auteur, gratuit et self-hosted (sources sur GitHub, démo hébergée sur sql-formatter.avonture.be). Il transforme des requêtes SQL legacy illisibles écrites sur une seule ligne en instructions correctement indentées et lisibles — une première étape utile avant de relire du vieux code de base de données.
</TLDR>

Face à du code legacy, il est souvent utile de le reformater pour le rendre lisible. Et à partir de là, l'étude du code peut commencer.

Il existe énormément d'outils de reformatage pour <Link to="/blog/json-lint">json</Link>, <Link to="/blog/online-php-linter">php</Link>, javascript et d'autres langages, mais beaucoup moins pour une requête écrite en SQL.

Copiez/collez simplement `SELECT LAT_N, CITY, TEMP_F FROM STATS, STATION WHERE MONTH = 7 AND STATS.ID = STATION.ID ORDER BY TEMP_F` dans l'outil et vous obtenez

```sql
SELECT
    LAT_N,
    CITY,
    TEMP_F
FROM
    STATS,
    STATION
WHERE
    MONTH = 7
    AND STATS.ID = STATION.ID
ORDER BY
    TEMP_F
```

<!-- truncate -->

Récupérez mon outil **SQL Formatter** et ses sources sur [https://github.com/cavo789/sql_formatter](https://github.com/cavo789/sql_formatter).

L'outil est accessible en ligne : [https://sql-formatter.avonture.be/](https://sql-formatter.avonture.be/)

![Demo](./images/sql_formatter_demo.gif)

J'ai créé quelques autres outils self-hosted du même genre, chacun dédié à une seule tâche : <Link to="/blog/json-lint">JSON - Online linter</Link> et <Link to="/blog/excel-formatter">Excel Formula Beautifier</Link>.
