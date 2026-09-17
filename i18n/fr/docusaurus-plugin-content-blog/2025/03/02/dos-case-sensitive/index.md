---
slug: dos-case-sensitive
title: Activer la sensibilité à la casse pour les noms de fichiers sous DOS
date: 2025-03-02
description: Découvrez comment activer la sensibilité à la casse pour les noms de fichiers dans un dossier précis sous Windows, comme sous Linux. Utilisez PowerShell et la commande fsutil.exe.
authors: [christophe]
image: /img/v2/msdos_tips.webp
mainTag: windows
tags: [windows]
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnjvuk5x22v
---
<!-- cspell:ignore fsutil -->
![Activer la sensibilité à la casse pour les noms de fichiers sous DOS](/img/v2/msdos_tips.webp)

<TLDR>
Saviez-vous qu'on peut rendre un dossier Windows sensible à la casse, exactement comme sous Linux ? Ce petit tutoriel vous montre comment activer la sensibilité à la casse des noms de fichiers dans un répertoire précis avec une seule commande. En lançant `fsutil.exe file setCaseSensitiveInfo . enable` dans un PowerShell administrateur, vous pouvez avoir `MyFile.txt` et `myfile.txt` comme deux fichiers distincts dans le même dossier.
</TLDR>

Ceci est juste ... pour le fun.

Comme vous le savez, MS DOS ne fait aucune différence entre `MyFile.txt`, `myfile.txt` et `MYFILE.txt` puisque DOS n'est pas sensible à la casse.

Si vous ne me croyez pas, lancez notepad, tapez quelques caractères et enregistrez votre travail une première fois sous `MyFile.txt`, puis sous `myfile.txt`, puis sous `MYFILE.txt`. Regardez ensuite votre dossier : combien de documents avez-vous ? Un seul.

Sous Linux, vous auriez eu trois fichiers ; pas sous DOS.

Et si on demandait à DOS de changer ses habitudes ?

<!-- truncate -->

Voici le résultat : trois fichiers, même nom, casse différente, cohabitant dans le même dossier Windows.

![La sensibilité à la casse a été activée](./images/case_sensitivity_enabled.webp)

Pour ça, vous devez démarrer <Link to="/blog/windows-terminal">Windows PowerShell</Link> en tant qu'administrateur.

![Démarrer PowerShell en tant qu'administrateur](./images/powershell_admin.webp)

Placez-vous ensuite dans le dossier où vous voulez activer la sensibilité à la casse. Disons C:\Temp.

Dans votre console PowerShell, lancez maintenant `fsutil.exe file setCaseSensitiveInfo . enable` et appuyez sur <kbd>Enter</kbd>. Après quelques secondes, le changement est effectif — le même résultat que celui montré en haut de cet article.

Pour annuler votre changement, lancez `fsutil.exe file setCaseSensitiveInfo . disable` mais, d'abord, vous devrez supprimer au moins deux fichiers car DOS vous empêchera de désactiver la fonctionnalité si cela devait créer des conflits.

*La sensibilité à la casse n'est pas la seule divergence Windows/Linux qui vous piégera quand le même repository est utilisé sur les deux systèmes ; les fins de ligne en sont une autre, et <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link> montre le réglage qui empêche git de les réécrire silencieusement.*
