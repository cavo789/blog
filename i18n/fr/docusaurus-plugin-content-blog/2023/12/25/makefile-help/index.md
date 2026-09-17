---
slug: makefile-help
title: Linux Makefile - Ajouter un écran d'aide
date: 2023-12-25
description: Implémentez un écran d'aide clair et élégant dans votre Makefile Linux. Un guide simple pour lister automatiquement toutes les targets, leurs descriptions, et créer des sections groupées.
authors: [christophe]
image: /img/v2/makefile.webp
mainTag: makefile
tags:
  - linux
  - makefile
language: fr
review_date: 2026-07-30
---
![Linux Makefile - Ajouter un écran d'aide](/img/v2/makefile.webp)

<TLDR>
Cet article montre comment ajouter un écran d'aide auto-documenté à un Makefile : ajoutez une target `default: help` pour que `make` seul l'affiche, définissez une target `help:` qui analyse les commentaires préfixés par `##` après chaque nom de target pour en afficher la description, et groupez les targets liées sous des en-têtes `##@ Section Name` pour obtenir une liste de commandes propre et catégorisée.
</TLDR>

Avec un makefile, comme vous le savez déjà, vous pouvez rassembler au même endroit une foule d'*actions* comme `make bash`, `make build`, `make deploy`, ... exactement comme je le fais pour ce blog (voyez mon makefile sur https://github.com/cavo789/blog/blob/main/makefile). *Pas encore convaincu qu'il vous en faut un ? Lisez d'abord <Link to="/blog/makefile-using-make">Linux Makefile - When to use a makefile</Link>.*

Ce qui est vraiment sympa, c'est de pouvoir taper `make` en ligne de commande, sans aucune autre option, et d'obtenir un écran avec la liste des commandes existantes et une courte explication d'une ligne.

C'est ce que nous allons voir dans cet article.

<!-- truncate -->

## Ce que vous allez obtenir {#what-you-will-get}

Tapez `make`, tout seul, et voici l'écran que votre projet affichera à la fin de cet article :

<Terminal typewriter wrap={false} source="./files/terminal-1.txt" />

Chaque target, sa description d'une ligne, groupée sous des en-têtes de section — et tout cela lu depuis le makefile lui-même, donc impossible que ce soit un jour désynchronisé des commandes documentées.

Trois ingrédients suffisent : une target `default:`, une target `help:` qui analyse le fichier, et un commentaire `##` après chaque nom de target.

## Le point de départ {#the-starting-point}

Pour la démo, ouvrez un shell Linux et lancez `mkdir -p /tmp/makefile && cd $_` pour créer un dossier appelé `makefile` dans votre dossier temporaire Linux et vous y rendre.

Créez ensuite un nouveau fichier appelé `makefile` avec ce contenu :

<Snippet filename="makefile" source="./files/makefile" />

<AlertBox variant="danger">
L'indentation dans un makefile **DOIT** être faite avec des tabulations et non des espaces, c'est crucial. Donc si votre fichier ne fonctionne pas, vous savez quoi vérifier.

</AlertBox>

Ce fichier contient quelques *targets* (= actions) et une simple instruction `printf` pour afficher un texte. À part écrire quelque chose dans la console, ce `makefile` ne fait rien.

<Details label="`make` n'est pas encore installé ?">

Nous allons utiliser `GNU make`, il vous faut donc l'avoir.

Lancez `which make` dans votre console Linux pour vérifier si `make` est déjà installé. Si oui, vous obtiendrez par exemple `/usr/bin/make` comme résultat.

Si vous obtenez `make not found`, lancez `sudo apt-get update && sudo apt-get -y install make` pour l'installer.

</Details>

## Ajouter l'action par défaut {#adding-the-default-action}

Nous sommes prêts à commencer l'implémentation.

Il y a trois choses à faire :

1. Ajouter une action `default: help`
2. Ajouter une target `help:` (une target est, dans le vocabulaire de Make, une action)
3. Éditer chaque target et ajouter une petite description.

### Étape 1 - Ajouter l'action par défaut {#step-1---adding-the-default-action}

En l'absence d'une action `default:` définie dans le fichier, comme dans votre exemple, c'est la première action qui sera exécutée.

Donc, pour l'instant, si vous lancez `make` (sans autre argument), vous obtiendrez le message *Start an interactive shell...* — c'est le résultat de la target `bash:`, la première du fichier.

<Terminal typewriter>
$ make
Start an interactive shell in the Docker container; type exit to quit
</Terminal>

Éditez le fichier et ajoutez la ligne surlignée ci-dessous :

<Snippet filename="makefile" source="./files/makefile.part2" />

### Étape 2 - Ajouter la target help {#step-2---adding-the-help-target}

Toujours dans votre éditeur, ajoutez le bloc surligné ci-dessous ; l'endroit où vous le collez n'a pas d'importance mais, logiquement, plaçons cette nouvelle action en premier puisque c'est celle qui sera exécutée par défaut.

<Snippet filename="makefile" source="./files/makefile.part3" />

Maintenant, si vous tapez `make` dans votre console, vous obtiendrez ceci :

<Terminal typewriter wrap={false}>
Usage:
  make \<target>

  help                  Show the help with the list of commands
</Terminal>

### Étape 3 - Ajouter une description pour chaque target {#step-3---add-a-description-for-each-target}

Regardez votre nouvelle target `help` : la description *Show the help with the list of commands* est préfixée par un double `#`. C'est comme cela qu'on ajoute une description.

<Snippet filename="makefile" source="./files/makefile.part4" />

Il vous reste donc à éditer votre makefile une dernière fois et, pour chaque target, ajouter un texte `## une petite description d'une ligne` ; comme ci-dessous, notre fichier final :

<Snippet filename="makefile" source="./files/makefile.part5" />

Et maintenant, en lançant `make`, vous obtenez un bel écran d'aide :

<Terminal typewriter wrap={false} source="./files/terminal-2.txt" />

Comme vous le voyez, l'ordre des targets respecte l'ordre dans votre fichier. `help` s'affiche en premier parce que c'est la première target du fichier ; pensez donc à réordonner les targets dans votre fichier selon votre logique (par ordre alphabétique, par exemple).

## Étape 4 - Ajouter un sous-titre entre chaque « section principale » {#step-4---add-a-subtitle-between-each-main-section}

Imaginez que vous ayez des dizaines de targets... Ce serait bien de les grouper en sections : tout ce qui concerne votre application, tout ce qui touche à votre base de données, les actions de type analyse de code, et ainsi de suite.

Pour cela, il suffit d'ajouter une ligne avec cette syntaxe : `##@ My project` comme illustré ci-dessous :

<Snippet filename="makefile" source="./files/makefile.part6" />

Et voici le résultat final — l'écran d'aide groupé montré au début de cet article.

## Jetez un œil au mien, celui de ce blog {#take-a-look-on-mine-for-this-blog}

Ce blog est maintenu avec un makefile de ce genre ; vous pouvez en récupérer une copie ici : https://github.com/cavo789/blog/blob/main/makefile

## Conclusion {#conclusion}

L'écran d'aide n'est pas un gadget, c'est ce qui rend le makefile fiable : une target sans description `##` n'apparaît tout simplement pas, donc documenter une commande fait partie de son écriture. Personne n'a à maintenir une section de README séparée qui finit lentement par ne plus correspondre à la réalité.

Envie d'aller plus loin avec Make ? <Link to="/blog/makefile_tips">Makefile - Tutorial and Tips & Tricks</Link> couvre les variables, `.PHONY`, le passage d'arguments aux targets et quelques autres choses que j'utilise au quotidien.
