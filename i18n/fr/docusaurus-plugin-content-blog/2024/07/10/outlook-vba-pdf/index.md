---
slug: outlook-vba-pdf
title: Microsoft Outlook - VBA - Enregistrer des emails en PDF
date: 2024-07-10
description: Découvrez comment mettre en place une macro VBA dans Microsoft Outlook pour enregistrer facilement les emails sélectionnés sous forme de fichiers PDF sur votre disque dur, avec les instructions d'installation et d'utilisation pas à pas.
authors: [christophe]
image: /img/v2/outlook_vba.webp
series: VBA & MS Office automation
mainTag: windows
tags:
  - vba
  - windows
language: fr
review_date: 2026-07-30
---
![Microsoft Outlook - VBA - Enregistrer des emails en PDF](/img/v2/outlook_vba.webp)

<TLDR>
Cet article partage une macro VBA pour le client Outlook de bureau qui enregistre un ou plusieurs emails sélectionnés en fichiers PDF, ajoutée au Ribbon comme bouton personnalisé via l'éditeur VBA. À l'exécution, elle demande le dossier de destination, si les emails doivent être supprimés d'Outlook après l'export, et si chaque PDF doit être nommé manuellement ou d'après le sujet de l'email.
</TLDR>

Vous aurez peut-être besoin, vous aussi, de sélectionner plusieurs emails dans Microsoft Outlook et de les enregistrer en <Link to="/blog/markitdown">fichiers PDF</Link> sur votre disque dur.

Dans mon cas, c'était à l'époque où j'étais indépendant à titre complémentaire. Je devais garder une trace des commandes reçues et des factures envoyées. Enregistrer mes commandes en PDF me permettait de les conserver comme archives, même en cas de panne de mon serveur mail.

Cet article va vous expliquer comment créer une telle macro pour Outlook.

<!-- truncate -->

## Résultat {#result}

Sélectionnez un ou plusieurs emails, cliquez sur le bouton, et la macro vous guide à travers trois questions :

![Cinq emails sélectionnés](./images/five_emails_selected.webp)

1. Une confirmation pour continuer avec les emails sélectionnés.
2. Un sélecteur de dossier — où les PDF doivent être enregistrés.
3. Faut-il supprimer les emails d'Outlook ensuite, et faut-il nommer chaque PDF manuellement ou réutiliser le sujet de l'email.

À la fin, chaque email sélectionné est enregistré sur votre disque dur en PDF.

## Prérequis {#prerequisites}

Vous devez avoir Microsoft Office sur votre disque dur, et Outlook ainsi que Word doivent être installés.

La macro ne fonctionnera pas avec Office en ligne.

## Étapes d'installation {#installation-steps}

<StepsCard
  title="Étapes d'installation"
  variant="steps"
  steps={[
    'Démarrez simplement votre client Microsoft Outlook (le logiciel installé sur votre disque dur ; pas la version dans votre navigateur),',
    'Appuyez sur <kbd>ALT</kbd>+<kbd>F11</kbd> pour ouvrir la fenêtre `Visual Basic Editor` (aussi appelée `VBE`),',
    'Cliquez sur le menu `Insert` puis `Module`,',
    'Cliquez sur le lien <a href="https://github.com/cavo789/vba_outlook_save_pdf/blob/master/module.bas">https://github.com/cavo789/vba_outlook_save_pdf/blob/master/module.bas</a> pour ouvrir mon repository sur GitHub, puis cliquez sur le bouton `Copy raw file` pour copier le code source dans le presse-papiers',
    'Revenez dans Outlook et appuyez sur <kbd>CTRL</kbd>+<kbd>V</kbd> dans l’éditeur pour y coller le code,',
    'Fermez le `Visual Basic Editor` et revenez à Outlook,',
    'Cliquez n’importe où sur le Ribbon et choisissez `Customize the Ribbon...`',
    'Dans la nouvelle boîte de dialogue, cliquez sur le bouton `New Group`',
    'Dans *Choose commands from*, sélectionnez `Macros` ; vous devriez voir la macro `SaveAsPDFFile` comme illustré ci-dessous.',
    'Glissez-déposez la macro dans votre nouveau groupe.',
    'Cliquez sur le bouton `OK` pour fermer la boîte de dialogue.',
  ]}
/>

Vous devriez voir <Link to="/blog/vba-excel-ribbon">votre nouveau groupe</Link> ; dans mon cas, je l'ai créé dans `Home`, tout à gauche en première position, ce qui donne ceci :

![Le nouveau groupe](./images/ribbon_macro.webp)

## Les boîtes de dialogue de dossier et de nommage {#the-folder-and-naming-dialogs}

La confirmation, le sélecteur de dossier et les questions de nommage sont décrits en début d'article. Le sélecteur de dossier ressemble à ceci :

![Où enregistrer les emails ?](./images/where_to_save.webp)
