---
slug: vbs-msaccess-get-fields
title: VBS - Récupérer la liste des champs d'une base de données MS Access
date: 2024-03-09
description: Utilisez un VBScript pour récupérer facilement la liste détaillée des champs de votre base de données MS Access. Analysez la taille, le type et la longueur réelle des valeurs pour optimiser la structure de votre base.
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
    note: "GitHub repo cavo789/vbs_access_get_fields_list archived Mar 2024 (read-only); scripts remain functional and can still be copied from the repository."
---
![VBS - Récupérer la liste des champs d'une base de données MS Access](/img/v2/msaccess.webp)

<TLDR>
Cet article partage un script VBS qui parcourt toutes les tables d'une base MS Access et exporte vers Excel un rapport détaillé des champs — nom, type, taille définie et valeur la plus courte/la plus longue réellement présente dans les données. De quoi repérer d'un coup d'œil les champs surdimensionnés (par exemple un champ de 255 caractères qui n'en contient jamais plus de 10) qu'il vaut la peine de réduire.
</TLDR>

Il y a des années, j'ai écrit un script .vbs qui analyse une base de données MS Access, boucle sur chaque table et, pour chacune d'elles, récupère la liste des champs.

Pour chaque champ, beaucoup d'informations sont récupérées (liste non exhaustive) : son nom, sa taille, son type, ... ainsi que la taille de la plus petite et de la plus grande valeur (pour les champs texte et mémo). Par exemple, si un champ texte est trouvé, le script récupère sa taille (p.ex. 255 caractères max) et examine tous les enregistrements de la table pour trouver, pour ce champ, la plus petite taille (p.ex. 10) et la plus grande (p.ex. 50). Donc, si la taille maximale constatée est de 50 et que la taille définie est de 255, le développeur MS Access peut sans doute ramener sans risque cette taille de 255 à 50.

<!-- truncate -->

## Le rapport que vous obtenez {#the-report-youll-get}

Double-cliquez sur un fichier `.cmd`, patientez quelques secondes, et Excel s'ouvre tout seul sur ceci :

![MS Access Get fields list](./images/get_fields_list.webp)

Une ligne par champ, pour chaque table de la base, avec côte à côte les deux colonnes qui comptent pour l'optimisation : `FieldSize` (ce que la table autorise) et `LongestSize` (ce que les données utilisent réellement).

## Comprendre le rapport {#understand-the-report}

- Filename : le nom du fichier MS Access (absolu)
- TableName : le nom de la table
- FieldName : le nom du champ trouvé dans cette table
- FieldType : le type de données (integer, string, date, ...)
- FieldSize : la taille maximale définie dans la table (p.ex. 255 signifie que ce champ peut contenir jusqu'à 255 caractères)
- ShortestSize : lorsque la table contient des enregistrements, l'info ShortestSize répond à « quelle est la plus petite information stockée dans ce champ ? » (exemple : si le champ est un prénom, de taille 255, mais que le prénom le plus court est `Paul`, alors `ShortestSize` vaudra 4)
- LongestSize : lorsque la table contient des enregistrements, l'info `LongestSize` répond à « quelle est la plus grande information stockée dans ce champ ? » (exemple : si le champ est un prénom, de taille 255, mais que le prénom le plus long est `Christophe`, alors `LongestSize` vaudra 10)
- Position : la position de ce champ dans la structure de la table (est-ce le premier champ défini, le deuxième, ...)
- Occurrences : combien de fois ce `FieldName` précis apparaît dans toute la base. Si vous avez beaucoup de tables, le champ appelé `CustomerID` est peut-être utilisé dans la table `Customers` et aussi dans la table `Orders` : `Occurrences` vaudra donc 2 dans ce cas.

## Comment le reproduire {#how-to-reproduce-it}

1. Copiez/collez le code source des deux scripts (voir ci-dessous) et enregistrez-les dans des fichiers texte (avec Notepad). Le premier fichier à créer sera `access_get_fields_list.vbs`, le second `access_get_fields_list.cmd`,
2. Avant d'enregistrer `access_get_fields_list.cmd`, éditez bien le fichier et indiquez le nom complet de votre base de données,
3. Vous êtes prêt : depuis l'Explorateur de fichiers, double-cliquez simplement sur `access_get_fields_list.cmd`. Le script d'analyse s'exécute et Excel s'ouvre à la fin.

*Si tout se passe bien, vous verrez une fenêtre DOS et, après quelques secondes (selon la taille et la complexité de la base), vous aurez le rapport dans Excel, ouvert automatiquement.*

### access_get_fields_list.vbs {#access_get_fields_listvbs}

Récupérez le code source sur ma page GitHub : [https://github.com/cavo789/vbs_access_get_fields_list/blob/master/access_get_fields_list.vbs](https://github.com/cavo789/vbs_access_get_fields_list/blob/master/access_get_fields_list.vbs).

Copiez le code dans Notepad par exemple, puis enregistrez-le sur votre disque, p.ex. sous le nom `access_get_fields_list.vbs`.

### access_get_fields_list.cmd {#access_get_fields_listcmd}

Procédez de la même manière pour le script [https://github.com/cavo789/vbs_access_get_fields_list/blob/master/access_get_fields_list.cmd](https://github.com/cavo789/vbs_access_get_fields_list/blob/master/access_get_fields_list.cmd). Copiez/collez la ligne dans Notepad et pensez à changer le nom de la base (plus `C:\temp\my_db.accdb` mais la vôtre).

Enregistrez le fichier sur votre disque dur sous le nom `access_get_fields_list.cmd`. Vous pouvez ensuite quitter Notepad.

## Que faire de ces chiffres {#what-to-do-with-the-numbers}

Dans un contexte d'optimisation (voir aussi <Link to="/blog/msaccess-optimize">How to optimize an existing MS Access database</Link>) :

- Veillez à ne pas utiliser une taille de champ trop grande. Par défaut, MS Access propose une taille de 255 pour les champs texte, mais pour un champ nom ou prénom, 40 caractères suffisent.
- Regardez la propriété `LongestSize` : si vous voyez p.ex. une taille de 4, c'est que vous stockez probablement un code (un code postal fait au maximum 4 chiffres en Belgique). Si `FieldSize` vaut 50, vous savez que vous pouvez réduire cette taille à 4.

## Conclusion {#conclusion}

Deux scripts, un double-clic, et la structure d'une base héritée s'affiche sous forme de feuille Excel triable. L'écart entre `FieldSize` et `LongestSize`, c'est là que se cache l'espace gaspillé, et le lire prend une minute plutôt que d'ouvrir trente tables en mode création.

Même esprit « auditer une base existante », angle différent : <Link to="/blog/vba-access-export">Export MS Access objects</Link> sort vos formulaires, requêtes et modules sous forme de fichiers texte, prêts à être comparés avec un diff.
