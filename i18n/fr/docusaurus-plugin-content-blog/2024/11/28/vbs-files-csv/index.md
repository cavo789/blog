---
slug: vbs-files-csv
title: VBS - Obtenir la liste des fichiers et générer un CSV
date: 2024-11-28
description: Besoin d'une liste de fichiers au format CSV ? Utilisez ce VBScript pour scanner un dossier, sous-dossiers inclus, et sortir les détails des fichiers comme la taille, la date et le propriétaire pour une analyse facile.
authors: [christophe]
image: /img/v2/vbs.webp
series: VBA & MS Office automation
mainTag: vba
tags:
  - vba
  - windows
language: fr
review_date: 2026-07-30
---
![VBS - Obtenir la liste des fichiers et générer un CSV](/img/v2/vbs.webp)

<TLDR>
Cet article partage un VBScript (`files2csv.vbs`) qui parcourt récursivement un dossier Windows et exporte les détails des fichiers — chemin, nom, dates de création/d'accès/de modification, taille, type et propriétaire — vers un fichier CSV, prêt à être analysé dans Excel ou avec Python/Pandas.
</TLDR>

Il y a six ans, j'avais besoin d'un script DOS capable de récupérer la liste de tous les fichiers d'un dossier sur une machine Windows et de générer un fichier `.csv` avec cette liste.

Une fois le fichier `.csv` généré, je pouvais le traiter dans MS Excel, par exemple, et le trier/filtrer ou, pourquoi pas, dans Python avec <Link to="/blog/python-pandas-merge">la librairie Pandas</Link>.

<!-- truncate -->

Voici ce que produit ce script : un fichier CSV listant tous les fichiers d'un dossier, avec les dates, la taille, le type et le propriétaire.

```csv
"FilePathAndName";"ParentFolder";"Name";"DateCreated";"DateLastAccessed";"DateLastModified";"Size";"Type";"Suffix";"Owner";
"C:\temp\test\test.csv";"C:\temp\test";"test.csv";"21-01-24 09:07:44";"21-01-24 09:09:08";"21-01-24 09:09:08";"472";"CSV Microsoft Excel File";"csv";"Christophe";
"C:\temp\test\test.vbs";"C:\temp\test";"test.vbs";"21-01-24 08:43:49";"21-01-24 09:09:03";"21-01-24 09:09:03";"3246";"VBScript File";"vbs";"Christophe";
```

Voici le script qui le génère. Copiez/collez la source ci-dessous et enregistrez-la dans un fichier, disons `c:\files2csv.vbs`. Ouvrez une console DOS, lancez `cd c:\` puis `cscript files2csv.vbs`. Quand le travail est terminé, vous obtenez le listing dans `files2csv.csv`.

<Snippet filename="files2csv.vbs" source="./files/files2csv.vbs" />

<AlertBox variant="info" title="Vous aviez besoin d'un séparateur tabulation ?">
Si oui, faites simplement un rechercher/remplacer pour changer `";"` en `vbTab` partout.

</AlertBox>
