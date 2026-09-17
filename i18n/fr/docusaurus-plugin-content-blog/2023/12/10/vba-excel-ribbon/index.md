---
slug: vba-excel-ribbon
title: MS Office - Comment créer un ruban dans Excel
date: 2023-12-10
description: Guide pas à pas pour créer un ruban Excel personnalisé en VBA. Utilisez XML et VBA pour ajouter vos propres onglets, groupes, boutons et fonctionnalités à vos classeurs Excel.
authors: [christophe]
image: /img/v2/ribbon.webp
series: VBA & MS Office automation
mainTag: excel
tags:
  - excel
  - vba
  - vscode
language: fr
updates:
  - date: 2026-07-30
    note: "Updated two dead links: imageMso PNG download (hintdesk 404 → GitHub christianarielli/ImageMso) and Office Control Identifiers (MS Download 2010 404 → OfficeDev/office-fluent-ui-command-identifiers)."
---
![MS Office - Comment créer un ruban dans Excel](/img/v2/ribbon.webp)

<TLDR>
Cet article montre comment construire un ruban Excel personnalisé avec l'outil gratuit `CustomOfficeUIEditor` et du XML écrit à la main (le manifeste `customUI14.xml`) : définir des onglets, des groupes et des contrôles comme des boutons ou des zones de saisie, relier leurs événements `onAction`/`onChange` à des subroutines VBA de callback, et trouver les identifiants d'icônes standard `imageMso` à utiliser sur les boutons.
</TLDR>

Dans cet article, nous allons apprendre à créer un ruban (c'est-à-dire une barre d'outils) dans Microsoft Excel.

Nous allons créer notre ruban personnalisé pour un fichier Excel et l'enregistrer dans le fichier, afin que nos utilisateurs disposent d'une interface agréable et intuitive pour travailler avec notre feuille de calcul.

*Un ruban n'est utile que si ses boutons font quelque chose d'intéressant. Pour un exemple concret, <Link to="/blog/vba-excel-sql-server-part-2">MS Excel - Se connecter à une base de données SQL Server, exécuter une query et récupérer les résultats</Link> vous donne le VBA derrière un bouton « Rafraîchir les données ».*

<!-- truncate -->

## Ce que nous allons construire {#what-were-going-to-build}

Voici le résultat final : notre propre onglet, dans Excel, avec un bouton et un champ de saisie.

![Smiley_and_edit](./images/Smiley_and_edit.webp)

Le bouton est relié à une subroutine VBA : cliquer dessus exécute votre code.

![Button clicked](./images/Button_clicked.webp)

L'ensemble tient dans une quinzaine de lignes de XML stockées dans le classeur. Quiconque ouvre votre fichier `.xlsm` obtient le ruban ; il n'y a rien à installer sur sa machine.

## Pourquoi ça fonctionne {#why-it-works}

- Un fichier `.xlsx` / `.xlsm` n'est pas un blob binaire : c'est une archive ZIP contenant des fichiers et des dossiers. Vous pouvez en ouvrir un avec 7-Zip et regarder ce qu'il y a dedans.
- Ajouter un ruban revient à ajouter un fichier à cette archive : un manifeste appelé `customUI14.xml`, qui décrit en XML les onglets, les groupes et les contrôles.
- Quand MS Office ouvre le classeur, il lit ce manifeste, dessine le ruban et, à chaque clic, appelle la subroutine VBA nommée dans l'attribut `onAction` du contrôle. Votre macro et votre interface sont donc stockées dans un seul et même fichier.

## Téléchargez l'éditeur gratuitement {#download-the-editor-for-free}

Pour pouvoir créer « facilement » un ruban dans MS Office *(dans une interface qui n'est pas WYSIWYG)*, j'utilise un outil très ancien appelé `CustomOfficeUIEditor`. *Jusqu'ici, je n'ai trouvé aucun autre outil gratuit pour faire ça.*

L'outil peut être téléchargé depuis [https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm](https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm).

`CustomOfficeUIEditor` est un outil externe (en dehors de MS Office) qui peut ouvrir un fichier Office et y ajouter les fichiers nécessaires à la création d'un ruban. Il est possible de le faire sans éditeur, par exemple avec un logiciel comme 7-Zip, puisqu'un fichier `.xlsx` / `.xlsm` est une archive avec des fichiers et des dossiers.

Pour cet exercice, extrayez tous les fichiers et dossiers dans votre dossier `C:\tmp\ribbon` (créez-le).

## Créez un fichier vide {#create-an-empty-file}

Comme support pour cet article, créez un nouveau fichier vide dans Excel, appelé `Ribbon.xlsm`, dans votre dossier `C:\tmp\ribbon` (ou ailleurs).

![Excel Ribbon.xlsm](./images/Excel_empty_file.webp)

<AlertBox variant="info" title="Créez juste un fichier vide">
Pour l'instant, rien d'autre à faire que Fichier - Nouveau - Enregistrer sous - Type de fichier - Classeur Excel (prenant en charge les macros).

</AlertBox>

## Ajoutez un ruban dans MS Office {#add-a-ribbon-in-ms-office}

L'outil `CustomOfficeUIEditor` n'est pas très convivial : vous devrez taper vous-même le XML du ruban. Ce XML est aussi appelé *le fichier manifeste*.

Par défaut, un document MS Office standard ne contient aucun ruban. Donc, quand vous ouvrez un tel fichier avec l'outil `CustomOfficeUIEditor`, vous obtenez un document vide.

*Outlook est l'exception : là, aucun XML n'est nécessaire puisque la boîte de dialogue intégrée `Personnaliser le ruban` peut héberger un bouton de macro, comme dans <Link to="/blog/outlook-vba-pdf">Microsoft Outlook - VBA - Save emails as PDF</Link>.*

Démarrez `CustomOfficeUIEditor` et ouvrez votre fichier `Ribbon.xlsm` :

![UI - Open Ribbon.xlsm](./images/UI_open.webp)

<AlertBox variant="caution" title="Fermez-le d'abord s'il est encore ouvert dans Excel">
Quand vous utilisez l'éditeur, le fichier ne peut pas être ouvert dans Excel en même temps ! Imaginez la situation suivante : le classeur est ouvert à la fois dans l'éditeur et dans Excel. Vous faites beaucoup de modifications dans Excel, passez à l'éditeur et changez le manifeste. En sauvegardant le fichier dans l'éditeur, vous perdrez toutes les modifications faites dans Excel donc... prudence.

</AlertBox>

La première fois, vous devrez ajouter un nouveau ruban : cliquez sur le menu `Insert` et sélectionnez `Office 2010 Custom UI Part`.

![Insert](./images/UI_Editor_Insert.webp)

Vous obtiendrez alors un écran comme celui-ci :

![Office 2010 Custom UI Part](./images/UI_Editor_Insert_UI14.webp)

Quand `customUI14.xml` est sélectionné (comme illustré ci-dessus), cliquez quelque part dans le volet de droite et commencez à écrire votre XML.

Maintenant, dans le volet de droite, copiez/collez simplement la source XML ci-dessous :

<Snippet filename="customUI14.xml" source="./files/customUI14.xml" />

![Manifest added](./images/UI_Editor_Added_UI14.webp)

Avant d'enregistrer votre fichier, n'oubliez pas de cliquer sur le bouton `Validate` : un contrôle est effectué pour vérifier la qualité du contenu.

![Check](./images/UI_Editor_Check.webp)

Le ruban étant correct, enregistrez le fichier et ouvrez-le dans Excel. Si tout se passe bien, vous obtiendrez ceci :

![Sample](./images/UI_Editor_Sample.webp)

<AlertBox variant="info" title="Votre ruban a été créé">
Félicitations, vous avez ajouté un ruban à votre classeur. Ce n'était pas trop difficile, je crois.

</AlertBox>

## Sous le capot — le manifeste, balise par balise (sautez ceci si vous voulez juste un ruban) {#under-the-hood--the-manifest-tag-by-tag-skip-this-if-you-just-want-a-ribbon}

Il est temps de comprendre ce qui s'est passé...

### Le nœud racine customUI et le namespace {#the-root-customui-node-and-the-namespace}

<Snippet filename="customUI14.xml" source="./files/customUI14.part2.xml" />

Le manifeste est un contenu XML et doit être valide. Vous devez définir votre contenu dans un nœud `<customUI>` (obligatoire) et spécifier l'attribut `xmlns` (pour `namespace`) (obligatoire).

Le fichier de `namespace` définit quels attributs existent, obligatoires ou non, pour chaque type de nœud. L'URL référencée est la `Document Type Definition` (aussi appelée *DTD*).

Par exemple, quand l'utilisateur cliquera sur le bouton de votre ruban, vous voudrez pouvoir capter le clic et démarrer une subroutine que vous avez codée en VBA. L'« événement on click » doit être défini dans l'attribut `onAction`, comme prévu par la DTD. *Microsoft maintient la documentation ici : [https://msdn.microsoft.com/en-us/library/dd909370(v=office.12).aspx](https://msdn.microsoft.com/en-us/library/dd909370(v=office.12).aspx).*

Donc, si vous savez que l'attribut est `onAction`, vous pouvez ajouter votre propre subroutine en écrivant quelque chose comme `onAction="OnButtonClicked"`.

Le rôle de la DTD est de s'assurer que la syntaxe de votre manifeste est correcte ; l'attribut `xmlns="http://schemas.microsoft.com/office/2009/07/customui"` est donc bel et bien obligatoire.

### Définir le ruban {#define-the-ribbon}

Le ruban doit être défini dans le nœud `<ribbon>`, mais pas immédiatement, car un ruban est en fait toujours défini dans un onglet.

Ci-dessous, on voit le ruban standard d'Excel avec beaucoup d'onglets : `Fichier`, `Insertion`, `Mise en page`, `Formules`, `Données`, `Révision`, `Affichage`, ...

![Tabs](./images/Tabs.webp)

Chaque onglet propose des fonctionnalités (boutons, cases à cocher, ...). Pour l'onglet `Insertion`, nous avons d'abord un groupe de trois boutons dans un groupe appelé `Tableaux` :

![Insert - Group Tables](./images/Tab_Insert_Tables.webp)

Donc, pour un ruban, il faut :

1. Le définir dans un onglet (le vôtre ou un onglet existant)
2. Ajouter des fonctionnalités dans un ou plusieurs groupes (vos groupes ou des groupes existants)

Voici notre manifeste à présent, avec la définition du ruban.

<Snippet filename="customUI14.xml" source="./files/customUI14.part3.xml" />

### Définir l'onglet {#define-the-tab}

Vous devez donner un identifiant à l'onglet (dans l'attribut `id`) : votre propre code pour un nouvel onglet ou l'id d'un onglet existant.

Les noms standard sont :

- `TabHome`
- `TabInsert`
- `TabPageLayoutExcel`
- `TabFormulas`
- `TabData`
- `TabReview`
- `TabView`
- `TabDeveloper`

Donc, si vous voulez ajouter un bouton à l'onglet Accueil, utilisez simplement `TabHome` comme valeur de `id`, par exemple :

<Snippet filename="customUI14.xml" source="./files/customUI14.part4.xml" />

Le XML ci-dessous va, en une ligne :

1. Créer un nouvel onglet puisque l'id `customTab` n'est pas un id existant,
2. Placer le nouvel onglet après l'onglet `Affichage` existant (utilisez `insertBeforeMso` pour l'ajouter avant),
3. Et lui donner `Tab` comme libellé.

<Snippet filename="customUI14.xml" source="./files/customUI14.part5.xml" />

Voici notre onglet ajouté :

![Add_new_tab](./images/Add_new_tab.webp)

### Implémenter notre ruban {#implement-our-ribbon}

Dans la déclaration `<tab>`, vous devez définir au moins un `<group>`. Et ici aussi, vous devrez définir l'identifiant : un identifiant existant pour, par exemple, ajouter un bouton dans un groupe existant, ou un nouveau pour créer un nouveau groupe.

Le XML ci-dessous va :

1. Créer un nouveau groupe puisque l'id est nouveau (`customGroup`),
2. Et lui donner `Group` comme nom.

<Snippet filename="customUI14.xml" source="./files/customUI14.part6.xml" />

Notre onglet avec son groupe :

![Just a group defined](./images/Group_is_required.webp)

Comme vous le voyez ci-dessus, ajouter un groupe ne suffit pas : vous devez définir quelles fonctionnalités (boutons, cases à cocher, ...) doivent être ajoutées dans le groupe.

### Ajouter des fonctionnalités {#add-features}

Le XML ci-dessous va ajouter deux choses : un bouton et une zone de saisie.

<Snippet filename="customUI14.xml" source="./files/customUI14.part7.xml" />

Le XML ci-dessous va créer un bouton :

1. Avec un `id` initialisé à `customButton`,
2. Son libellé (le texte affiché sous le bouton) défini à `Button`,
3. Utilisant l'image standard `HappyFace` (`imageMso` est en effet la manière de réutiliser une image standard, tandis que `image` vous permet de définir la vôtre),
4. La taille du bouton sera `large` (un grand bouton),
5. L'action assignée sera la fonction VBA appelée `OnButtonClicked`.

<Snippet filename="customUI14.xml" source="./files/customUI14.part8.xml" />

Ce qui donne ceci :

![Smiley](./images/Smiley.webp)

`OnButtonClicked` est le callback VBA : pour le faire fonctionner, ajoutez un module dans votre fichier Excel et créez une subroutine comme celle-ci :

```vbnet
Public Sub OnButtonClicked(control As IRibbonControl)
    MsgBox "You've clicked on the button", vbInformation
End Sub
```

Pour ce faire, dans MS Excel, appuyez sur <kbd>ALT</kbd>-<kbd>F11</kbd>, puis dans l'**Explorateur de projet**, faites un clic droit sur l'entrée **VBAProject (Ribbon.xlsm)** (1), sélectionnez **Insertion** (2) puis **Module** (3).

![Insert a module](./images/VBE_insert_module.webp)

Un `Module1` sera ajouté et, dans le volet de droite, copiez/collez le code donné ci-dessus puis enregistrez le fichier.

![Add code](./images/VBE_add_code.webp)

Maintenant, vous pouvez fermer la fenêtre *Microsoft Visual Basic for Application*, revenir à la fenêtre Excel habituelle et cliquer sur le bouton smiley : vous obtiendrez la boîte de message montrée dans la deuxième capture d'écran en haut de cet article.

Et nous pouvons ajouter d'autres fonctionnalités, comme une zone de saisie :

<Snippet filename="customUI14.xml" source="./files/customUI14.part9.xml" />

Enregistrez, réouvrez le fichier, et votre onglet ressemble maintenant à la toute première capture d'écran de cet article.

La liste des propriétés dépend du type : pour un bouton, nous avons un attribut `onAction`, alors que c'est `onChange` pour un editBox.

## Liste des objets {#list-of-objects}

Comme défini de manière exhaustive dans le `namespace du ruban`, voici la liste des objets valides :

- `box`,
- `button`,
- `buttonGroup`,
- `checkBox`,
- `control`,
- `comboBox`,
- `dropDown`,
- `dynamicMenu`,
- `editBox`,
- `gallery`,
- `labelControl`,
- `menu`,
- `splitButton` et
- `toggleButton`

**Attention** : le XML est sensible à la casse, `editBox` est la seule syntaxe valide, `editbox` ou `EditBox` ne le sont pas.

Chaque objet a ses propres attributs, certains obligatoires, les autres optionnels.

## Trouver des images {#find-images}

En ajoutant un bouton par exemple, vous lui assignerez une image.

Vous utiliserez très probablement une image standard existante. C'est possible avec l'attribut `imageMso`, en indiquant à Office quelle image utiliser ; par exemple `AddFolderToFavorites` :

![Favorites](./images/Favorites.webp)

Le manifeste est celui-ci :

<Snippet filename="customUI14.xml" source="./files/customUI14.part10.xml" />

Mais ... **comment récupérer la liste des images ?**

Microsoft maintient des fichiers Excel avec la liste des IDs existants utilisables comme icônes dans notre ruban. Les Office Fluent User Interface Control Identifiers sont maintenus sur le [repository GitHub OfficeDev](https://github.com/OfficeDev/office-fluent-ui-command-identifiers) (versions actuelles pour toutes les éditions d'Office). Vous obtiendrez des fichiers Excel, un par application (Access, Excel, Outlook, ...).

Cela vous donnera la liste des IDs existants en texte brut, mais vous ne verrez pas les images associées.

Vous pouvez télécharger toutes les images (en PNG) pour MS Office depuis le [repository GitHub ImageMso](https://github.com/christianarielli/ImageMso) (8 899 icônes, avec un Add-In Excel intégré pour les parcourir).

## Assigner des callbacks {#assign-callbacks}

Ce terme signifie : quel code (du VBA dans ce cas) doit être déclenché quand un événement est levé.

Quand l'utilisateur clique sur un bouton du ruban, quelle subroutine doit être appelée ?

Le code XML ci-dessous assigne la subroutine `OnButtonClicked` à l'événement `onAction` du bouton.

<Snippet filename="customUI14.xml" source="./files/customUI14.part11.xml" />

Donc, si nous voulons capturer cet événement, nous devrons ajouter une subroutine publique dans notre fichier Excel. Cette subroutine peut être placée dans n'importe quel module, doit être publique et doit s'appeler `OnButtonClicked`.

Mais... selon les callbacks (click, change, toggle state, change, ...), la définition de la subroutine n'est pas la même.

Pour un bouton, le VBA ressemblera à ceci :

```vbnet
Public Sub OnButtonClicked(control As IRibbonControl)
    ' YOUR CODE
End Sub
```

Pour une zone de saisie et l'événement `onChange`, le callback est différent :

<Snippet filename="customUI14.xml" source="./files/customUI14.part12.xml" />

```vbnet
Public Sub OnEditBoxTextChanged(control As IRibbonControl, sText As String)
    ' YOUR CODE
End Sub
```

La déclaration des callbacks se trouve sur le site officiel :
[How can I determine the correct signatures for each callback procedure?](
https://docs.microsoft.com/en-us/previous-versions/office/developer/office-2007/aa722523(v=office.12)#how-can-i-determine-the-correct-signatures-for-each-callback-procedure). Faites attention aux colonnes `Signatures` ; vous devez chercher `VBA`.

## Conclusion {#conclusion}

Un classeur où il fallait auparavant *« ouvrir l'éditeur VBA, trouver la macro, l'exécuter »* a maintenant son propre onglet avec de vrais boutons ; et tout est stocké dans le fichier `.xlsm`, donc ça suit le classeur partout. Les deux choses à retenir : le manifeste est `customUI14.xml` dans l'archive, et chaque contrôle pointe vers une subroutine VBA publique via `onAction` (ou `onChange`).

Une fois votre ruban en place, une étape suivante fréquente consiste à alimenter un de ses contrôles (comme une liste déroulante) avec des données issues directement de votre feuille de calcul — voir <Link to="/blog/vba-excel-ribbon-load">MS Office - Load dropdown from Excel's range</Link>. Et pour donner à vos boutons quelque chose qui vaille le clic, <Link to="/blog/vba-excel-sql-server-part-2">MS Excel - Connect to a SQL Server database</Link> est un bon endroit pour continuer.
