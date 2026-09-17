---
slug: vba-access-export
title: Exporter les objets MS Access
date: 2025-06-27
description: Versionnez facilement votre base de données MS Access ! Exportez tout le code VBA, les formulaires, modules, requêtes et rapports vers des fichiers plats grâce à un simple script VBS, prêt pour GitHub.
authors: [christophe]
image: /img/v2/msaccess.webp
series: VBA & MS Office automation
mainTag: msaccess
tags:
  - database
  - msaccess
  - vba
language: fr
updates:
  - date: 2026-07-30
    note: "GitHub repo cavo789/vbs_access_export is archived (read-only); VBS script remains functional and downloadable."
blueskyRecordKey: 3lumzv3n42c2r
---
![Exporter les objets MS Access](/img/v2/msaccess.webp)

<TLDR>
Cet article présente un script VBS qui exporte tous les objets — formulaires, modules, requêtes, rapports et macros — d'une base de données Microsoft Access vers des fichiers texte individuels. Les développeurs peuvent ainsi versionner facilement le code source de leur application Access avec des outils comme Git et GitHub. Le script organise automatiquement les fichiers exportés dans un dossier `src` structuré, en créant un fichier distinct par objet. Suivre les changements et conserver un historique de la conception et de la logique de la base devient simple.
</TLDR>

Il y a longtemps, dans une vie antérieure, j'ai développé beaucoup de bases de données MS Access et, contrairement aux outils modernes, il n'était pas possible de versionner le code (modules, macros, requêtes, etc.) dans un outil comme GitHub.

Ces objets font partie intégrante de la base de données, au même titre que les tables et leurs données. Tout est stocké dans le format `.mdb` (ou `.mda` ou `.accdb`). Si vous voulez les versionner, vous devez d'abord les extraire.

*Deux autres articles MS Access sur ce blog : <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link> pour auditer la structure, et <Link to="/blog/msaccess-optimize">How to optimize an existing MS Access database</Link> pour agir sur les résultats.*

Voyons comment faire.

<!-- truncate -->

## Exemple {#sample}

En lançant `cscript vbs_access_export.vbs C:\Christophe\db1.mdb` dans une console DOS, vous obtiendrez ceci :

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />

Une fois terminé, vous aurez un sous-dossier `src` avec un fichier par objet : indirectement, vous disposez donc d'une sauvegarde de votre code 👌.

## Description {#description}

Mon script VBS [https://github.com/cavo789/vbs_access_export](https://github.com/cavo789/vbs_access_export) exporte tous les objets de code (formulaires, macros, modules, requêtes et rapports) d'une base de données / application MS Access vers des fichiers plats sur votre disque.

Vous obtenez ainsi une sauvegarde rapide de votre code et vous pouvez le synchroniser sur une plateforme de versioning comme GitHub.

Le script démarre MS Access (en mode caché), ouvre la base spécifiée, traite chaque objet de code et les exporte un par un dans un dossier `\src\your_database.mdb`.

Le dossier `src` est créé automatiquement si nécessaire et vous y trouverez un sous-dossier portant le même nom que votre fichier (vous pouvez donc avoir plusieurs fichiers exportés dans le même dossier `src`).

## Installation {#install}

Récupérez simplement une copie du script VBS [https://github.com/cavo789/vbs_access_export](https://github.com/cavo789/vbs_access_export), et éventuellement le `.cmd` aussi (pour vous faciliter la vie), puis enregistrez-les dans le même dossier que votre base de données.

## Utilisation {#usage}

Éditez le fichier `.cmd` et vous verrez comment ça fonctionne : il suffit de lancer le `.vbs` avec un seul paramètre, le nom de votre base de données — la même commande que celle montrée en début d'article.

## Conclusion {#conclusion}

Un seul script VBS transforme formulaires, modules, requêtes, rapports et macros — tout ce qui vivait uniquement dans le fichier `.mdb`/`.accdb` — en fichiers plats que vous pouvez committer sur GitHub, comparer et suivre comme n'importe quelle autre base de code. Vous travaillez souvent avec des fichiers bourrés de VBA ? Voyez aussi <Link to="/blog/vba-excel-list-references">MS Excel - Get the list of references used in your modules</Link>, <Link to="/blog/msaccess-optimize">How to optimize an existing MS Access database</Link> et <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link>.
