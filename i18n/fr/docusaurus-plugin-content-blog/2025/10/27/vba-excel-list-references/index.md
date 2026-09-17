---
slug: vba-excel-list-references
title: MS Excel - Obtenir la liste des références utilisées dans vos modules
date: 2025-10-27
description: Développeur VBA ? Arrêtez de vérifier les références à la main ! Utilisez ce script VBS pour récupérer automatiquement la liste de toutes les références VBA dans plusieurs fichiers Excel .xlsm ou .xlam.
authors: [christophe]
image: /img/v2/excel.webp
series: VBA & MS Office automation
mainTag: excel
tags:
  - excel
  - vba
language: fr
updates:
  - date: 2026-07-30
    note: "GitHub repo cavo789/vbs_xls_list_references is archived (read-only); VBS script remains functional."
blueskyRecordKey: 3m45z7onhnc2o
---
![MS Excel - Obtenir la liste des références utilisées dans vos modules](/img/v2/vba_export_xlsm.webp)

<TLDR>
Cet article présente un script VBS qui automatise la récupération des références VBA dans plusieurs fichiers Excel `.xlsm` ou `.xlam`. Plutôt que de vérifier chaque classeur à la main, il suffit de lancer un simple script `run.vbs` dans le dossier cible. Le script ouvre les fichiers, désactive les macros et affiche la liste de toutes les références trouvées.
</TLDR>


Vous êtes développeur VBA et vous avez créé beaucoup de classeurs Excel `.xlsm` (ou `.xlam`), c'est-à-dire des fichiers contenant des modules VBA — pensez à ceux construits dans <Link to="/blog/vba-excel-ribbon">MS Office - How to create a ribbon in Excel</Link> ou <Link to="/blog/vba-excel-sql-server-part-2">MS Excel - Connect to a SQL Server database</Link>.

Comment récupérer la liste des références utilisées par un de vos fichiers ? Bien sûr, vous pouvez ouvrir le classeur, ouvrir l'éditeur VBE, cliquer sur le menu `Tools` puis `References` pour obtenir la boîte de dialogue avec la liste des références. Oui, c'est possible.

Ou vous pouvez utiliser mon script [https://github.com/cavo789/vbs_xls_list_references](https://github.com/cavo789/vbs_xls_list_references) pour automatiser ça — le même genre de petit script d'automatisation VBS que dans <Link to="/blog/vba-access-export">Export MS Access objects</Link>.

<!-- truncate -->

Voici ce que vous obtenez, pour chaque fichier `.xlam` ou `.xlsm` d'un dossier :

<Terminal typewriter source="./files/terminal-1.txt" />

Repérez un dossier sur votre disque dur contenant un ou plusieurs fichiers `.xlam` ou `.xlsm`.

Créez-y simplement un fichier appelé `run.vbs` et copiez/collez le code ci-dessous dedans :

<Snippet filename="run.vbs" source="./files/run.vbs" />

Maintenant, ouvrez une console DOS ou Powershell, allez dans ce dossier et lancez `cscript run.vbs`. C'est tout. Le script va récupérer tous les fichiers `.xlam` ou `.xlsm` et automatiser l'ouverture d'Excel, l'ouverture du fichier (en désactivant l'exécution des macros) et la récupération de la liste des références — la même sortie que celle montrée en haut de cet article.
