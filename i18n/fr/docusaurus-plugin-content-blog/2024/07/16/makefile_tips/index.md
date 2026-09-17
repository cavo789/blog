---
slug: makefile_tips
title: Makefile - Tutoriel et astuces
date: 2024-07-16
description: Astuces essentielles pour automatiser avec un Makefile. Apprenez à vérifier l'existence d'un fichier, lancer des targets dépendantes, utiliser des conditions, ignorer les erreurs et intégrer Docker dans vos scripts.
authors: [christophe]
image: /img/v2/makefile.webp
mainTag: makefile
tags:
  - linux
  - makefile
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore ifeq,ifneq,ifdef,Oups,phplint,infile,recipeprefix,sonarqube,testme,findstring,toplevel,concat,outfile -->
<!-- cspell:ignore runsql,regexes -->

![Makefile - Tutoriel et astuces](/img/v2/makefile.webp)

<TLDR>
Voici une grande référence personnelle d'astuces Makefile accumulées au fil du temps : vérifier l'existence d'un fichier ou d'un dossier, chaîner des targets dépendantes, masquer l'affichage des commandes, écrire des conditions, ignorer les erreurs, forcer Bash au lieu de `/bin/sh`, substituer des variables, les pièges tabulations-vs-espaces, les paramètres nommés, étendre une target avec `::`, lire des valeurs depuis un fichier `.env`, basculer en mode verbeux, des targets utilitaires pour git, une vérification de fraîcheur du dossier `vendor` pour les projets Composer, et une target `make help` auto-documentée.
</TLDR>

Quand j'apprends, je prends généralement des notes. Je trouve que c'est l'une des meilleures façons de retenir ce que j'ai vu et de pouvoir y revenir à tout moment.

Voici une note que j'ai prise et révisée plusieurs fois quand j'ai pris le temps de créer mes premiers fichiers `.make`.

*Deux articles compagnons : <Link to="/blog/makefile-using-make">Linux Makefile - When to use a makefile</Link> pour le *pourquoi*, et <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link> pour la target `make` auto-documentée qui rend toutes ces astuces découvrables par vos collègues.*

<!-- truncate -->

<Details label="`make` n'est pas encore installé ? Cliquez pour déplier.">

Lancez simplement les commandes suivantes pour installer l'exécutable `Make` sur votre machine hôte :

<Terminal typewriter>
$ sudo apt-get update && sudo apt-get -y install make
</Terminal>

</Details>

## Comment vérifier si un fichier existe ou non {#how-to-check-if-a-file-exists-or-not}

Vous pouvez utiliser l'instruction `test -s` comme ci-dessous :

<Snippet filename="makefile" source="./files/makefile" />

Contrairement à l'instruction `ifeq`, `test` doit être indenté.

On peut utiliser la notation `{ ... }` si on doit lancer plus d'une commande ; par exemple :

<Snippet filename="makefile" source="./files/makefile.part2" />

On peut aussi faire ça avant, par exemple, d'inclure un fichier externe :

<Snippet filename="makefile" source="./files/makefile.part3" />

Bien sûr, on peut aussi faire simple, c'est-à-dire juste utiliser le `-` avant la commande pour ignorer les erreurs ; ainsi, ci-dessous, si le fichier n'existe pas, aucune erreur ne sera levée et le script continuera.

<Snippet filename="makefile" source="./files/makefile.part4" />

## Comment vérifier si un dossier existe ou non {#how-to-check-if-a-folder-exists-or-not}

Vous pouvez utiliser l'instruction `ifeq` avec une commande shell Linux comme ci-dessous :

<Snippet filename="makefile" source="./files/makefile.part5" />

Contrairement à l'instruction `test`, `ifeq` doit être utilisé sans indentation. Directement à la colonne zéro.

## Lancer des targets dépendantes {#running-dependent-targets}

En lançant `make php-cs-fixer`, on va d'abord lancer `vendor` puis `update-them`, et enfin `php-cs-fixer` ; autrement dit, on peut définir une liste de targets dépendantes.

<Snippet filename="makefile" source="./files/makefile.part6" />

<Terminal typewriter>
$ make php-cs-fixer
First get vendors
Then update vendors
And finally run php-cs-fixer
</Terminal>

### Arrêter le job si une target échoue {#stop-the-job-if-a-target-fails}

Si l'une d'elles échoue, le script s'arrête. Dans l'exemple ci-dessous, `php-cs-fixer` n'affichera jamais `And finally run php-cs-fixer`.

<Snippet filename="makefile" source="./files/makefile.part7" />

Lancer `make php-cs-fixer` affichera ceci :

<Terminal typewriter>
First get vendors
Then update vendors
And finally run php-cs-fixer
</Terminal>

## Utiliser la commande shell find pour récupérer toutes les dépendances {#using-shell-find-option-to-get-all-dependencies}

Imaginez que vous avez beaucoup de fichiers `.md` dans le répertoire. Si l'un change, on les concatène à nouveau. Si rien ne change, rien à faire.

Ça se fait avec une commande shell pour la dépendance :

<Snippet filename="makefile" source="./files/makefile.part8" />

(source [https://tech.davis-hansson.com/p/make/#specifying-inputs](https://tech.davis-hansson.com/p/make/#specifying-inputs))

## Ne pas afficher la commande {#dont-echo-the-command}

Lancer `make helloWorld` comme ci-dessous affichera deux lignes dans la console.

<Snippet filename="makefile" source="./files/makefile.part9" />

Et la sortie dans la console :

<Terminal typewriter>
$ echo "Hello world"
Hello world
</Terminal>

Pour éviter la première, c'est-à-dire l'affichage de l'instruction lancée, préfixez-la simplement d'une arobase (`@`).

<Snippet filename="makefile" source="./files/makefile.part10" />

Maintenant, seule la sortie est affichée ; plus l'instruction elle-même.

## Utiliser des conditions {#using-conditional-statements}

On peut écrire une condition comme ceci mais attention à l'indentation :

<Snippet filename="makefile" source="./files/makefile.part11" />

`make init SET_PHP_VERSION=7.4` affichera le message de downgrade tandis que `make init SET_PHP_VERSION=8.1` affichera celui d'upgrade.

Un autre exemple :

<Snippet filename="makefile" source="./files/makefile.part12" />

## Ignorer une erreur {#ignore-error}

Ne pas s'arrêter en cas d'erreur : ajoutez un `-` avant la ligne, comme ceci : `-php --lint index.php`

<Snippet filename="makefile" source="./files/makefile.part13" />

En cas d'erreur de linting dans `index.php`, on n'arrête pas l'exécution du script et on passe à la commande suivante.

Note : make peut éventuellement afficher un message comme `make: [makefile:114: up] Error 1 (ignored)` pour informer l'utilisateur qu'une erreur s'est produite mais a été ignorée. Si vous n'en voulez pas du tout (sortie silencieuse), voici comment faire :

<Snippet filename="makefile" source="./files/makefile.part14" />

Cette commande va créer un nouveau réseau Docker appelé `my_network` et, en cas d'erreur (le réseau existe déjà, par exemple), on s'en fiche et on ne veut voir aucune sortie.

## Assurez-vous d'utiliser Bash {#make-sure-youre-using-bash}

Par défaut, `make` utilise `/bin/sh`. On peut changer ça en ajoutant cette affectation en haut du `makefile` :

<Snippet filename="makefile" source="./files/makefile.part15" />

(source : [https://tech.davis-hansson.com/p/make/#always-use-a-recent-bash](https://tech.davis-hansson.com/p/make/#always-use-a-recent-bash))

## Définir la target par défaut {#set-the-default-target}

Par défaut, la première target définie dans le fichier sera celle par défaut, c'est-à-dire celle lancée quand l'utilisateur tape simplement `make` en ligne de commande.

<Snippet filename="makefile" source="./files/makefile.part16" />

## Substitution {#substitution}

Prenons `make convert INFILE=readme.md`

<Snippet filename="makefile" source="./files/makefile.part17" />

La syntaxe `outfile=$(INFILE:.md=.pdf)` remplace `.md` par `.pdf` ; dans cet exemple, on peut donc déduire le fichier de sortie à partir du fichier d'entrée.

## Tabulation, pas espace {#tab-not-space}

L'indentation à utiliser dans un `makefile` est la tabulation ; pas les espaces. Utiliser des espaces casse le fichier.

<Snippet filename="makefile" source="./files/makefile.part18" />

Il est toutefois possible d'adapter ce comportement avec `.RECIPEPREFIX` :

<Snippet filename="makefile" source="./files/makefile.part19" />

(source : [https://tech.davis-hansson.com/p/make/#dont-use-tabs](https://tech.davis-hansson.com/p/make/#dont-use-tabs))

## Utiliser des paramètres {#using-parameters}

Lancer une target avec un paramètre se fait via des paramètres nommés, comme ceci :

<Terminal typewriter>
$ make hello firstname="Christophe"
</Terminal>

Ça crée une variable appelée `firstname`, que l'on peut ensuite utiliser :

<Snippet filename="makefile" source="./files/makefile.part20" />

### Vérifier que les paramètres sont bien définis {#make-sure-parameters-are-set}

Imaginons qu'on veuille lancer `make runsql SQL='SELECT * FROM users LIMIT 10'` : l'argument `SQL` doit être défini, sinon on a un problème.

<Snippet filename="makefile" source="./files/makefile.part21" />

## Travailler avec Docker {#working-with-docker}

Dans un makefile, on peut s'arrêter tôt si on a besoin qu'un container Docker donné soit démarré.

L'instruction `if` ci-dessous vérifie que le container `sonarqube` tourne ; si ce n'est pas le cas, parce qu'il n'a pas encore été créé ou qu'il est arrêté par exemple, une instruction d'erreur sera exécutée et le script sera arrêté.

<Snippet filename="makefile" source="./files/makefile.part22" />

Le `if` ci-dessous vérifie si le container existe et, si non, le crée.
Le `else` sait donc que le container existe, mais va s'assurer qu'il tourne.

<Snippet filename="makefile" source="./files/makefile.part23" />

## Configurer Visual Studio Code {#configure-visual-studio-code}

### Ajouter l'extension makefile {#add-the-makefile-extension}

[https://marketplace.visualstudio.com/items?itemName=ms-vscode.makefile-tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.makefile-tools)

### Ajouter le fichier .editorconfig {#add-the-editorconfig-file}

Assurez-vous que votre fichier `Makefile` est correctement formaté ; ajoutez un fichier appelé `.editorconfig` dans votre répertoire racine.

<Snippet filename=".editorconfig" source="./files/.editorconfig" />

## Quelques astuces {#some-tips}

### Comment étendre une target {#how-to-extend-a-target}

Vous avez une target existante, disons `hello` dans notre exemple, et vous souhaitez l'étendre en ajoutant des actions supplémentaires.

`hello` peut être définie dans le même makefile ou dans un fichier inclus, mais illustrons ça avec un exemple simple : on souhaite ajouter la sortie *Nice to meet you*.

<Snippet filename="makefile" source="./files/makefile.part24" />

Si on lance ce fichier, voici la sortie.

<Terminal typewriter>
$ make hello
makefile:198: warning: overriding recipe for target 'hello'
makefile:195: warning: ignoring old recipe for target 'hello'
Nice to meet you
</Terminal>

La solution : utiliser `::` (on parle de *règle explicite*) et non un simple `:` après la recette ; voyez l'exemple suivant :

<Snippet filename="makefile" source="./files/makefile.part25" />

Si on lance ce fichier, voici la sortie.

<Terminal typewriter>
$ make hello
Hello world
Nice to meet you
Do you have any plans for this weekend?
</Terminal>

Les recettes sont simplement étendues, la deuxième est ajoutée à la première et ainsi de suite ; l'ordre est donc important.

### Récupérer le répertoire courant dans une variable {#getting-the-current-directory-into-a-variable}

<Snippet filename="makefile" source="./files/makefile.part26" />

### Récupérer une liste de fichiers et initialiser une variable {#get-a-list-of-files-and-initialize-a-variable}

Prenons un cas réel : scanner un dossier appelé `.docker` et récupérer la liste des fichiers `compose*.yaml` qui s'y trouvent.

L'objectif est d'initialiser une variable d'environnement appelée `COMPOSE_FILE` (voir [https://docs.docker.com/compose/environment-variables/envvars/#compose_file](https://docs.docker.com/compose/environment-variables/envvars/#compose_file)) pour qu'en lançant `docker compose` on puisse utiliser tous les fichiers d'un coup (c'est-à-dire sans ajouter `--file file1.yml --file file2.yml` et ainsi de suite).

Récupérer la liste des `compose*.yaml` se fait donc comme ceci :

<Snippet filename="makefile" source="./files/makefile.part27" />

La première ligne retournera par exemple `compose.yaml compose.override.yaml compose.mysql.yaml`.

La deuxième instruction remplacera l'espace par un deux-points (`:`).

On obtiendra donc `compose.yaml:compose.override.yaml:compose.mysql.yaml`.

Maintenant, pour lancer `docker compose config` par exemple, il suffit de faire ceci : déclarer d'abord la variable d'environnement `COMPOSE_FILE` puis lancer l'action souhaitée.

<Snippet filename="makefile" source="./files/makefile.part28" />

### Récupérer des informations depuis le fichier .env {#getting-information-from-the-env-file}

Récupérer une valeur depuis un fichier `.env` est facile : incluez-le puis utilisez les variables :

<Snippet filename=".env" source="./files/.env" />

<Snippet filename="makefile" source="./files/makefile.part29" />

Cette astuce de l'`include` fonctionne avec n'importe quel fichier définissant une variable et sa valeur.

On peut parfaitement avoir un fichier appelé `Make.config`, pas `.env`.

#### Définir une variable à partir des variables d'environnement du .env {#define-variable-based-on-env-environment-variables}

Imaginons que vous avez une variable appelée `APP_ENV` dans votre fichier `.env`.

Cette variable peut valoir `local`, `test` ou ce que vous voulez. Elle vaudra `production` quand l'application tourne en environnement de production.

À partir de cette variable, on peut donc définir une variable comme ceci :

<Snippet filename="makefile" source="./files/makefile.part30" />

Ça veut dire : si on ne tourne pas en production, chaque commande sera lancée dans notre container Docker. Si on tourne en production, la commande sera exécutée directement.

Voici un exemple :

<Snippet filename="makefile" source="./files/makefile.part31" />

#### Utiliser une valeur par défaut si la variable n'est pas définie {#use-a-default-value-if-the-variable-is-not-defined}

Si la variable d'environnement système `PHP_VERSION` n'est pas définie, mettre sa valeur par défaut à `8.1`

<Snippet filename="makefile" source="./files/makefile.part32" />

Un autre exemple : imaginez que vous avez un fichier `.env` avec la variable `DOCKER_APP_HOME`. Mais si la variable n'est pas définie, la syntaxe ci-dessous permet de fixer une valeur par défaut.

<Snippet filename="makefile" source="./files/makefile.part33" />

Ça permet des choses comme ci-dessous : cibler une version personnalisée d'une image Docker selon la version de PHP sélectionnée.

<Snippet filename="makefile" source="./files/makefile.part34" />

##### Surcharger une variable {#override-a-variable}

Même si la variable est déjà définie, vous pouvez la surcharger en la passant en ligne de commande :

<Terminal typewriter>
$ make yamllint PHP_VERSION=8.1
</Terminal>

Ça lancera la target `yamllint` avec `PHP_VERSION` à `8.1` même si la variable est déjà définie et vaut, par exemple, `7.4`.

### Comment vérifier si une variable commence par une valeur donnée ? {#how-to-check-if-a-variable-starts-with-a-given-value}

Le cas d'usage : on a une variable appelée `PHP_VERSION` et on doit détecter si on a affaire à du code PHP 7 ou à du PHP 8 ou supérieur.

<Snippet filename="makefile" source="./files/makefile.part35" />

Comme Makefile ne supporte pas les expressions régulières, on s'appuie sur le `shell` pour exécuter la regex et retourner une chaîne non vide si l'expression correspond. Dans ce cas, la variable `IS_PHP_7` est définie et la construction `ifdef` sera vérifiée.

### Mode verbeux {#verbose-mode}

L'idée : ne pas afficher de message informatif lors de l'exécution de certaines targets.

Le code ci-dessous vérifie la présence de l'argument / valeur `--quiet` dans la variable standard `$ARGS`.

Exemple de code pour montrer comment activer/désactiver le mode verbeux dans un makefile.

En utilisant l'argument "--quiet" dans ARGS.

- Mode verbeux : lancez `make testme` en ligne de commande
- Mode silencieux : lancez `make testme ARGS="--quiet"` en ligne de commande

<Snippet filename="makefile" source="./files/makefile.part36" />

Le code ci-dessus définit une variable globale `QUIET` qui vaudra `true` ou `false` selon la présence du mot-clé `--quiet` dans `ARGS`.

Ensuite, utilisez la structure conditionnelle `ifeq` pour afficher (ou masquer) le message informatif.

En lançant `make testme ARGS="--quiet"`, seul *This is an important message* sera affiché.

### Travailler avec git {#working-with-git}

#### Récupérer quelques informations importantes {#retrieve-some-important-information}

Récupérer quelques variables importantes depuis le shell :

<Snippet filename="makefile" source="./files/makefile.part37" />

#### Quelques targets git {#some-git-targets}

Une fois les variables initialisées, on peut faire des choses comme ceci :

<Snippet filename="makefile" source="./files/makefile.part38" />

#### Git - Travail en cours {#git---work-in-progress}

Lancez `make git_wip` pour pousser rapidement vos changements vers le repository distant et sauter les hooks locaux :

<Snippet filename="makefile" source="./files/makefile.part39" />

### Travailler avec un projet PHP et les vendors {#working-with-php-project-and-vendors}

#### Mettre à jour le dossier vendor seulement quand c'est nécessaire {#updating-the-vendor-folder-only-when-needed}

Avoir une target comme ci-dessous (appelée `vendor`) permet de répondre à la question *Faut-il mettre à jour vendor ou non ?*. Ça se fait en lançant d'abord la target `composer.lock`. L'idée est ensuite de comparer la date/heure de ce fichier et celle de `composer.json`. S'il y a une différence, l'outil `Make` lancera `composer update` et générera une nouvelle version de `composer.lock` et donc une nouvelle version de `vendor` aussi.

Si aucun changement n'a été fait dans le fichier `composer.json`, il n'y a rien à faire puisque `vendor` est considéré à jour.

Plutôt simple.

<Snippet filename="makefile" source="./files/makefile.part40" />

Pour jouer le scénario, lancez simplement `make vendor`.

#### PHP - Contrôles qualité {#php---quality-checks}

La portion ci-dessous peut simplement être copiée/collée dans votre propre `Makefile` pour ajouter des fonctionnalités de contrôle qualité basées sur l'image Docker [https://github.com/jakzal/phpqa](https://github.com/jakzal/phpqa).

<Snippet filename="makefile" source="./files/makefile.part41" />

## Quelques fonctions {#some-functions}

### Nettoyer des dossiers {#clean-folders}

<Snippet filename="makefile" source="./files/makefile.part42" />

On peut aussi d'abord tester l'existence du dossier :

<Snippet filename="makefile" source="./files/makefile.part43" />

### Ouvrir un navigateur web {#open-a-web-browser}

<Snippet filename="makefile" source="./files/makefile.part44" />

C'est plutôt pratique quand vous travaillez avec des repositories git :

<Snippet filename="makefile" source="./files/makefile.part45" />

### Makefile auto-documenté {#self-documenting-makefile}

Vous pouvez utiliser une astuce pour créer une target comme `help`. L'idée est de scanner le `makefile` courant et d'extraire la liste de tous les verbes et leur description.

![Makefile auto-documenté](./images/help.webp)

Il y a plusieurs façons d'y arriver. J'ai déjà écrit un article de blog à ce sujet : <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link>.

La complexité vient quand vous ajoutez des fichiers via `include` (comme le fichier `.env`) et que la structure peut être un peu différente de celle de votre `makefile`.

La solution donnée ici fonctionne pour moi.

## Tutoriels {#tutorials}

- [Makefile cheatsheet](https://devhints.io/makefile)
- [https://makefiletutorial.com/](https://makefiletutorial.com/)
- [Hello, and welcome to makefile basics](https://gist.github.com/isaacs/62a2d1825d04437c6f08)
- [GNU make](https://www.gnu.org/software/make/manual/html_node/index.html)
