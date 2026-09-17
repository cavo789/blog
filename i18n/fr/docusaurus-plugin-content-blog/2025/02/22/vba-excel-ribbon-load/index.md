---
slug: vba-excel-ribbon-load
title: MS Office - Charger une liste déroulante depuis une plage Excel
date: 2025-02-22
description: Chargez une plage Excel dans votre contrôle liste déroulante d'un ruban VBA personnalisé. Ce tutoriel pas à pas couvre le code VBA, le XML Custom UI et les plages nommées nécessaires à une solution dynamique.
authors: [christophe]
image: /img/v2/ribbon.webp
series: VBA & MS Office automation
mainTag: excel
tags:
  - excel
  - vba
  - vscode
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lwgc3uymnc2i
---
![MS Office - Charger une liste déroulante depuis une plage Excel](/img/v2/ribbon.webp)

<TLDR>
Apprenez à créer un menu déroulant dynamique dans un ruban Excel personnalisé, alimenté par les valeurs d'une plage de feuille de calcul. Ce guide pas à pas vous accompagne sur tout le processus : nommer votre plage de données dans Excel, définir la disposition du ruban en XML avec le Custom UI Editor, et écrire les fonctions de callback VBA nécessaires pour charger les éléments, gérer la sélection et écrire la valeur choisie dans une cellule précise. Cette technique permet des interfaces souples et agréables dans vos projets VBA.
</TLDR>

Dans cet article, nous allons voir comment charger très facilement une plage Excel dans un ruban et l'afficher dans une liste déroulante. *Si vous n'avez encore jamais construit de ruban personnalisé, commencez par <Link to="/blog/vba-excel-ribbon">MS Office - How to create a ribbon in Excel</Link>.*

L'idée est de proposer une liste de valeurs dans un ruban sans devoir coder ces valeurs en dur : il suffit de pointer vers une plage, n'importe où dans votre classeur.

J'ai utilisé cette technique dans beaucoup de mes applications Excel (c.-à-d. des fichiers Excel contenant du code VBA).

Pour cet article, nous allons créer une liste de périodes (YYYYMM) dans une feuille de calcul et charger cette liste dans notre ruban personnalisé.

De cette façon, nous pouvons offrir une meilleure expérience utilisateur en proposant une liste et en exécutant, par exemple, <Link to="/blog/vba-excel-sql-server-part-2">une requête vers une base de données</Link> pour récupérer les données de cette période (ou tout autre traitement).

<!-- truncate -->

Voici le résultat : la liste déroulante chargée directement depuis la plage de la feuille, et la valeur sélectionnée réécrite dans une cellule.

![Demo](./images/demo.webp)

## Pourquoi ça fonctionne {#why-it-works}

- Les éléments de la liste déroulante proviennent d'une **plage nommée** (`_rngParamsPeriod`), pas de valeurs codées en dur dans le XML — modifiez la plage dans la feuille et la liste du ruban suit.
- Un callback VBA (`getItemCount`, déclaré dans le XML du ruban) fait la lecture ; sélectionner une valeur dans le ruban l'écrit directement dans une cellule nommée (`_Period`) ailleurs dans le classeur.

## C'est parti {#lets-play}

Créez d'abord un classeur vide. Créez ensuite une nouvelle feuille appelée par exemple `Params` avec une liste de valeurs. Pour cet article, créons une liste de périodes :

![The range](./images/range.webp)

Rien de compliqué pour l'instant. Pour rester souple, sélectionnez la plage et nommez-la : `_rngParamsPeriod`. C'est quand même mieux que de coder en dur une plage comme `$A$2:$A$14`, non ?

La deuxième chose à faire est de prévoir une cellule dans votre feuille où la valeur sélectionnée sera écrite : quand l'utilisateur choisit une valeur dans la liste, nous allons demander à Excel d'y placer la valeur sélectionnée. Pour cela, cliquez sur la cellule où vous souhaitez voir la période sélectionnée et nommez cette cellule `_Period`. Sur l'image ci-dessous, je choisis la cellule `$C$2` dans la même feuille, mais elle peut se trouver ailleurs.

![The period range](./images/selected_period.webp)

Il est temps d'enregistrer votre fichier Excel une première fois, disons dans `c:\temp\ribbon.xlsx`, puis de fermer le classeur.

## Ajouter un ruban {#adding-a-ribbon}

Passons à l'ajout de notre ruban. Pour cela, téléchargez cet outil gratuit : [https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm](https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm). Vous y trouverez un exécutable appelé `CustomUIEditor.exe`. Double-cliquez dessus pour démarrer l'éditeur puis ouvrez votre fichier `c:\temp\ribbon.xlsx` :

![Custom UI editor](./images/editor.webp)

Cliquez sur le menu Insert puis sélectionnez `Office 2010 Custom UI Part`.

Collez le XML ci-dessous dans la fenêtre de l'éditeur :

<Snippet filename="customui.xml" source="./files/customui.xml" />

Vous obtiendrez ceci :

![Custom UI editor](./images/xml.webp)

Enregistrez vos modifications et quittez l'éditeur.

## Place à notre code VBA {#time-to-add-our-vba-code}

Depuis l'explorateur, double-cliquez sur votre fichier `c:\temp\ribbon.xlsx` pour démarrer Excel et rouvrir le classeur.

Vous obtiendrez un message d'erreur et c'est parfaitement normal : il nous reste du code VBA à ajouter. Cliquez simplement sur **Ok**.

![Error](./images/missing_code.webp)

<AlertBox variant="info">
Dans notre ruban, nous avons écrit, entre autres, ceci : `getItemCount="modToolbar_cbxPeriod.getItemCount"`. Excel essaie donc d'exécuter une fonction appelée `getItemCount` depuis un module appelé `modToolbar_cbxPeriod` et… il n'existe pas encore.

</AlertBox>

Appuyez sur <kbd>ALT</kbd>-<kbd>F11</kbd> pour ouvrir l'éditeur VBE.

Comme illustré ci-dessous, faites un clic droit sur le projet `VBEProject` et insérez un nouveau module.

![Inserting a new module](./images/insert_module.webp)

Cela fait, cliquez sur le module ajouté et, en bas à gauche, donnez-lui un nom, par exemple `modToolbar_cbxPeriod`.

Dans la partie principale de l'écran, à droite, collez ce code :

<Snippet filename="module.bas" source="./files/module.bas" />

Nous y sommes presque : il faut donner un nom à la feuille où se trouve la plage. Si vous vous souvenez du début de cet article, nous avons créé la plage dans une feuille appelée `Params`. Dans l'éditeur VBE, sélectionnez donc la feuille `Params` comme illustré ci-dessous (voir 1.) et nommez la feuille `shParams` (voir 2).

![Naming the sheet](./images/shParams.webp)

<AlertBox variant="caution" title="Vous devez maintenant utiliser l'extension .xlsm">
Enregistrez le classeur Excel mais, cette fois, avec l'extension `.xlsm` puisqu'il contient du code VBA.

</AlertBox>

Testons notre fonctionnalité : fermez le classeur et rouvrez-le. Cette fois, votre liste est remplie et, en sélectionnant une valeur, celle-ci sera injectée dans votre feuille de calcul, prête à être utilisée — exactement le résultat montré en début d'article.

## Conclusion {#conclusion}

Une plage nommée, un peu de XML Custom UI et un module de callback VBA : voilà toute la recette d'une liste déroulante de ruban dont les valeurs ne seront plus jamais codées en dur — modifiez la plage, et tous les classeurs qui utilisent ce ruban suivent. <Link to="/blog/vba-excel-ribbon">Envie de continuer à jouer avec les rubans ? Jetez un œil à mes autres articles sur le sujet.</Link>
