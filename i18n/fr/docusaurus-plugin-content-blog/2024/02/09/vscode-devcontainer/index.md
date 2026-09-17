---
slug: vscode-devcontainer
title: Développement PHP dans un devcontainer avec des outils de qualité de code préinstallés
date: 2024-02-09
description: Arrêtez de vous battre avec les problèmes de qualité de code. Mettez en place un environnement de développement PHP cohérent instantanément ! Ce guide pas à pas vous montre comment configurer un devcontainer VSCode avec des outils de qualité et d'analyse préinstallés.
authors: [christophe]
image: /img/v2/devcontainer.webp
series: Coding using a devcontainer
mainTag: php
tags:
  - code-quality
  - devcontainer
  - docker
  - php
  - vscode
language: fr
updates:
  - date: 2024-02-23
    note: Install Rector automatically
  - date: 2024-02-29
    note: Install [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) and [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
  - date: 2026-07-30
    note: "PHP_CodeSniffer moved from squizlabs to [PHPCSStandards/PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer) (Dec 2023); PHP-CS-Fixer is now v3.89.2 — Dockerfile example pins v3.46.0, update to current release"
blueskyRecordKey: 3lymrewibzk2l
---
![Développement PHP dans un devcontainer avec des outils de qualité de code préinstallés](/img/v2/devcontainer.webp)

<TLDR>
Ce long article pas à pas construit un devcontainer VSCode pour PHP avec un ensemble complet d'outils de qualité de code préinstallés : PHP-CS-Fixer et PHPCBF/PHPCS pour le formatage automatique à la sauvegarde, SonarLint et Intelephense pour la détection de bugs en temps réel, et Rector pour la mise à niveau automatisée du code et les suggestions de refactoring — tout est configuré une fois dans `devcontainer.json` et `Dockerfile`, pour que chaque membre de l'équipe obtienne un environnement identique.
</TLDR>

Imaginons une des situations suivantes :

1. Vous travaillez à plusieurs sur le même projet PHP et vous remarquez qu'une personne ou une autre ne respecte pas vos critères de qualité concernant la mise en forme du code. Vous aimez utiliser quatre espaces pour l'indentation, vous voulez que l'accolade qui marque le début d'une fonction soit sur la ligne, vous ne voulez plus voir d'espaces inutiles en fin de ligne, ... et zut ! vous constatez que certains s'en fichent complètement.

2. Vous travaillez seul sur un projet et vous ne voulez pas perdre de temps à configurer votre VSCode. Vous souhaitez démarrer très vite avec beaucoup d'outils déjà installés dans VSCode, pour vous concentrer sur le code, pas sur l'éditeur.

La solution ultime : utiliser un `devcontainer` dans VSCode.

En utilisant un **devcontainer**, vous (et vos collègues) utiliserez un environnement préinstallé et tout le monde aura exactement le même. Vous gagnerez beaucoup de temps en évitant de configurer votre système, et vous pourrez coder tout de suite, épaulé par toute une série d'outils d'analyse de qualité.

<!-- truncate -->

## Ce qu'un devcontainer fait pour vous {#what-a-devcontainer-does-for-you}

Voici un fichier PHP tel que je l'ai enregistré, avec mes pires habitudes bien visibles — indentation aléatoire, espaces en fin de ligne (affichés en points), accolades posées n'importe où :

![Index php avec du code mal écrit](./images/index_php_bad_formatting.webp)

Maintenant le même fichier, après un simple <kbd>CTRL</kbd>+<kbd>S</kbd> dans le devcontainer. Je n'ai rien changé ; j'ai juste enregistré :

![Votre script a été correctement formaté cette fois](./images/index_php_correctly_formatted.webp)

Rien n'a été installé sur ma machine pour obtenir ça — ni PHP, ni Composer, ni binaire de formatage. Et le collègue qui clone le repository obtient exactement le même comportement, sans qu'on lui demande de configurer quoi que ce soit.

## Pourquoi ça fonctionne {#why-it-works}

- **L'image Docker embarque les outils.** PHP-CS-Fixer, PHPCS/PHPCBF et Composer sont téléchargés lors du build de l'image, donc ils existent dans le container et nulle part ailleurs.
- **`devcontainer.json` embarque l'éditeur.** Il liste les extensions VSCode à installer et les réglages à appliquer — y compris « formate ce fichier à la sauvegarde, avec ce binaire, en utilisant ce fichier de configuration ».
- **VSCode s'attache au container.** Votre éditeur continue de tourner sur votre machine, mais tout ce qu'il exécute se passe dans le container. C'est pour ça qu'un chemin comme `/usr/local/bin/php-cs-fixer.phar` est parfaitement valide même s'il n'existe pas sur votre disque.

<AlertBox variant="info" title="Vous voulez juste l'environnement prêt à l'emploi ?">
Alors sautez tout ce tutoriel et allez voir <Link to="/blog/php-devcontainer">Install a PHP Docker environment in a matter of seconds</Link> : même résultat, trois commandes, aucune explication.

</AlertBox>

## Récupérer les fichiers {#get-the-files}

Cet article est écrit sous forme de tutoriel pas à pas. Si vous ne voulez pas prendre le temps de créer les fichiers de configuration vous-même et préférez les télécharger directement, lancez les commandes ci-dessous dans une console Linux. Vous obtiendrez tous les fichiers et, chaque fois que le tutoriel ci-dessous vous demandera de créer un fichier, vous l'aurez déjà.

<Terminal typewriter source="./files/terminal-4.txt" />

<AlertBox variant="note" title="Télécharger la toute dernière version">
Le repository php_devcontainer va évoluer avec le temps. Si vous souhaitez télécharger la dernière version et non celle figée pour cet article, utilisez les commandes suivantes et non celles ci-dessus :

<Terminal typewriter source="./files/terminal-3.txt" />


</AlertBox>

## 1. Créer le projet {#1-create-the-project}

Démarrons tout de suite un nouveau projet en créant un répertoire temporaire avec `mkdir /tmp/devcontainer_php && cd $_`.

Comme nous allons créer quelques fichiers, lancez `code .` pour démarrer Visual Studio Code (alias *VSCode*).

Créez un nouveau fichier appelé `index.php` avec le code PHP ci-dessous :

<Snippet filename="index.php" source="./files/index.php" />

C'est le fichier montré au début de cet article, dans son état *avant* : VSCode l'a enregistré exactement tel quel, **avec une mise en forme tout simplement dégueulasse**, espaces superflus compris.

On peut exécuter ce script dans un navigateur avec `docker run -d -p 80:80 -u $(id -u):$(id -g) -v .:/var/www/html php:8.2-apache` (lisez l'article <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link> si une remise à niveau est nécessaire).

Comme prévu, le script tourne très bien :

![Exécution de la page index dans un navigateur](./images/browser_index.webp)

<AlertBox variant="danger" title="Arrêtez de lire ici si ...">
... vous êtes du genre à penser *Le script fonctionne, non ? Alors pourquoi tout ce bruit ?*, **éteignez votre ordinateur et promettez de ne plus jamais toucher une seule ligne de code**. Même si le code *fonctionne* ... il pue.

</AlertBox>

Dans cet article, nous allons apprendre à configurer Visual Studio Code pour qu'il arrive avec des extensions préinstallées et configurées pour la version de PHP que vous ciblez (ce sera 8.2 mais vous pouvez changer ça très facilement).

<AlertBox variant="caution" title="La technique que nous allons utiliser s'appelle devcontainer.">
**Un devcontainer est un environnement de développement isolé et préconfiguré qui tourne dans un container Docker, offrant les mêmes outils et réglages sur différentes machines.**

</AlertBox>

## 2. Installer d'abord l'extension VSCode ms-azuretools.vscode-docker {#2-install-first-the-ms-azuretoolsvscode-docker-vscode-extension}

Dans VSCode, appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>X</kbd> pour ouvrir le panneau `Extensions` et recherchez l'extension Docker de Microsoft appelée `ms-azuretools.vscode-docker` ; si vous ne l'avez pas encore, installez-la et activez-la.

## 3. Créer le fichier devcontainer.json {#3-create-the-devcontainerjson-file}

L'étape suivante consiste à créer un dossier appelé `.devcontainer` et, dedans, un fichier appelé `devcontainer.json` avec le contenu ci-dessous.

Dans la suite de cet article, nous reviendrons sur ce fichier.

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

## 4. Créer le fichier Dockerfile {#4-create-the-dockerfile-file}

Continuons et créons un second fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

## 5. Réouvrir dans le container {#5-reopen-in-the-container}

Nous avons donc maintenant trois fichiers : un `index.php` dégueulasse, `.devcontainer/devcontainer.json` et `.devcontainer/Dockerfile`.

Ce que nous allons faire maintenant, c'est *sauter* dans un container Docker. Regardez en bas à gauche de votre écran :

![Exécution dans WSL](./images/running_in_wsl.webp)

Vous verrez quelque chose comme, dans mon cas, `WSL: Ubuntu-20.04`. *Cela peut être différent sur votre ordinateur selon votre système d'exploitation.* Ce que VSCode dit ici, c'est *je code sur ma machine*.

Cliquez sur ce statut ou, autre possibilité, appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> pour ouvrir la *Command Palette* puis cherchez `Reopen in Container` et appuyez sur <kbd>Enter</kbd>.

![Reopen in Container](./images/reopen_in_container.webp)

Visual Studio Code va faire beaucoup de choses et, la première fois, cela peut prendre quelques minutes.

![Maintenant, vous êtes dans le container](./images/dev_container_vscode.webp)

## 6. Travailler dans le container {#6-working-in-the-container}

Et voilà la magie : réouvrez le fichier `index.php` si mal formaté et enregistrez-le **sans aucune modification**. Appuyez juste sur <kbd>CTRL</kbd>+<kbd>S</kbd> et tadaaa 🎉🎉🎉 — vous obtenez le fichier reformaté montré au début de cet article.

<AlertBox variant="info" title="Comment est-ce possible ?">
C'est parce que nous avons appris à VSCode à utiliser un formateur spécifique pour nos fichiers PHP et que nous lui avons dit de formater le fichier à chaque sauvegarde. Et savez-vous où nous avons fait ça ? Dans nos fichiers `.devcontainer/devcontainer.json` et `.devcontainer/Dockerfile`, bien sûr !

**C'est pour ça que nous travaillons dans un devcontainer !** La configuration est faite une fois pour toutes, il n'y a plus qu'à la réutiliser, quel que soit le projet PHP.

</AlertBox>

## Les outils (prenez ceux dont vous avez besoin) {#the-tools-pick-the-ones-you-need}

Les cinq sections ci-dessous sont indépendantes les unes des autres : chacune couvre un outil déjà installé dans le container, ce qu'il détecte, et où il a été déclaré. Lisez celles qui vous intéressent et sautez le reste — l'environnement fonctionne de toute façon avec tous activés.

### Le premier outil utilisé ici est PHP-CS-Fixer {#the-first-tool-weve-used-here-is-php-cs-fixer}

Quand nous enregistrons un fichier dans VSCode, nous avons configuré un *formateur* qui va adapter la mise en forme du fichier selon les règles que nous avons définies. Par exemple, le nombre d'espaces pour l'indentation ou le fait que les accolades doivent être alignées (et bien d'autres choses). Cet outil est [PHP-CS-Fixer](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer).

Mais voyons quand `PHP-CS-Fixer` a été installé...

Réouvrez votre fichier `.devcontainer/devcontainer.json` et regardez les lignes surlignées ci-dessous :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.part2.json" />

Nous demandons donc à VSCode de lancer, pour les fichiers PHP, un `formatter` quand le fichier est enregistré, et l'outil à utiliser pour le formatage est `junstyle.php-cs-fixer`. Regardez directement à la fin, dans la section `extensions` : nous demandons à VSCode d'installer cette extension.

Nous demandons aussi à VSCode d'enregistrer automatiquement le fichier dès que le focus change, par exemple si nous sélectionnons un autre fichier, si nous cliquons ailleurs (plus dans l'éditeur), ...

Enfin, `junstyle.php-cs-fixer` demande quelques réglages à initialiser comme par exemple `php-cs-fixer.executablePath`.

Là, vous pouvez vous dire : *Attendez une minute, je n'ai pas le fichier `/usr/local/bin/php-cs-fixer.phar` sur mon ordinateur.* Et vous avez probablement raison, mais réfléchissez : codez-vous *sur votre ordinateur* ou êtes-vous *dans un container Docker* ?

En exécutant VSCode dans un container, vous n'êtes *plus* sur votre machine.

Et maintenant, il faut regarder le troisième fichier que nous avons créé : `Dockerfile`.

Réouvrez le fichier `.devcontainer/Dockerfile` et regardez les lignes surlignées ci-dessous :

<Snippet filename=".devcontainer/Dockerfile" source="./files/Dockerfile.part2" />

Ce fichier va demander à VSCode de télécharger une image Docker `php:8.2-fpm` et d'installer `PHP-CS-Fixer` (puisque `PHPCSFIXER_INSTALL` a été mis à `true`).

La version `3.46.0` de l'exécutable `PHP-CS-Fixer` sera téléchargée et stockée, dans l'image Docker, sous `usr/local/bin/php-cs-fixer.phar`. C'est pour ça que, dans notre `devcontainer.json`, nous pouvons écrire `"php-cs-fixer.executablePath": "/usr/local/bin/php-cs-fixer.phar",` : parce que nous avons déjà téléchargé et installé l'exécutable.

<AlertBox variant="info" title="Besoin de vérifier ?">
Toujours dans VSCode, ouvrez un terminal en appuyant sur <kbd>CTRL</kbd>+<kbd>´</kbd> et, dans le prompt, tapez `ls -l /usr/local/bin`. Comme vous le voyez, `php-cs-fixer.phar` est bien là. *Il a été téléchargé et installé par VSCode quand vous avez sauté dans le container.*

![Le binaire php-cs-fixer.phar est bien là](./images/php-cs-fixer-phar.webp)

</AlertBox>

#### PHP-CS-FIXER - Fichier de configuration {#php-cs-fixer---configuration-file}

Le fichier `.devcontainer/devcontainer.json` contient aussi cette ligne : `"php-cs-fixer.config": "/var/www/html/.config/.php-cs-fixer.php"`.

Nous pouvons donc avoir notre propre fichier de configuration pour `PHP-CS-Fixer` (avec nos propres règles) et ce fichier doit être créé dans un dossier appelé `.config` et nommé `.php-cs-fixer.php`.

Essayons, et cette fois nous allons nous assurer que tous nos fichiers PHP auront un bloc d'en-tête avec notre copyright, nos informations de licence ou autre.

Dans VSCode, créez le dossier `.config` et dedans le fichier `.php-cs-fixer.php` avec ce contenu :

<Snippet filename=".config/.php-cs-fixer.php" source="./files/.php-cs-fixer.php" />

Créez aussi un second fichier appelé `licenseHeader.txt` avec le contenu que vous voulez, par exemple :

<Snippet filename=".config/licenseHeader.txt" source="./files/licenseHeader.txt" />

Maintenant, réouvrez votre fichier `index.php` et appuyez simplement sur <kbd>CTRL</kbd>+<kbd>S</kbd> pour l'enregistrer à nouveau et tadaaa...

![Un bloc de licence est automatiquement ajouté par php-cs-fixer](./images/license.gif)

Comme vous le voyez, lors du formatage du fichier, `PHP-CS-Fixer` va désormais aussi injecter notre en-tête.

<AlertBox variant="info" title="Beaucoup d'options sont expliquées ici">
Rendez-vous sur [https://mlocati.github.io/php-cs-fixer-configurator](https://mlocati.github.io/php-cs-fixer-configurator) ou [https://github.com/PHP-CS-Fixer/PHP-CS-Fixer](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer) pour en savoir plus sur les options du fichier de configuration de php-cs-fixer.

</AlertBox>

#### PHP-CS-FIXER - Corriger tous les fichiers d'un coup {#php-cs-fixer---fix-all-files-at-once}

Un pas de plus : est-il possible de lancer `PHP-CS-Fixer` non seulement sur le fichier en cours d'édition dans VSCode mais sur tous les fichiers de votre repository ? **Oui, bien sûr.**

Dans VSCode, appuyez sur <kbd>CTRL</kbd>+<kbd>´</kbd> (ou cliquez sur le menu `View` puis `Terminal`) pour ouvrir un terminal. Assurez-vous d'être dans le dossier `/var/www/html` (lancez `cd /var/www/html` si besoin) et exécutez la commande suivante :

<Terminal typewriter>
$ /usr/local/bin/php-cs-fixer.phar fix --config /var/www/html/.config/.php-cs-fixer.php .
</Terminal>

Cela va lancer `PHP-CS-Fixer` sur tout votre code (`.`). Si vous voulez exclure certains dossiers, ouvrez le fichier `.config/.php-cs-fixer.php` et mettez à jour le tableau `exclude`.

### Le deuxième jeu d'outils, ce sont PHPCBF et PHPCS {#the-second-set-of-tools-is-phpcbf-and-phpcs}

Notre `Dockerfile` a été configuré pour télécharger et installer les outils [PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer) appelés `phpcbf` et `phpcs`.

`phpcbf` est un outil de `Code beautifier` : tout comme `PHP-CS-Fixer`, `phpcbf` va apporter quelques modifications mineures à vos fichiers selon les règles activées.

Par exemple, mettez à jour votre script `index.php` avec ce contenu :

<Snippet filename="index.php" source="./files/index.part2.php" />

Qu'est-ce qui ne va pas avec cette syntaxe ? Presque rien mais ... le standard (`PSR12`) demande de mettre un espace après le mot-clé `if` et un espace avant et après `else`.

<AlertBox variant="note" title="PHP-CS-Fixer sera appelé quand vous enregistrerez le fichier">
Vous avez remarqué ? Vous avez copié/collé le script ci-dessous où il n'y avait pas d'espaces avant et après le mot-clé `else`. Mais dès que vous enregistrez le fichier, boum, le fichier est refactoré par `PHP-CS-Fixer` et, entre autres, des espaces ont été ajoutés avant et après `else` mais pas pour `if`. C'est parce que, en réalité, il n'y a pas UN OUTIL MAGIQUE pour tout. Parfois `PHP-CS-Fixer` ne peut pas faire certaines modifications alors que `PHPCBF` oui, ou l'inverse.

</AlertBox>

Comme pour `PHP-CS-Fixer`, nous avons déjà installé `PHPCBF` et `PHPCS` dans notre container. Voyez votre fichier `.devcontainer/devcontainer.json` :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.part3.json" />

Et les deux exécutables `/usr/local/bin/phpcbf.phar` et `/usr/local/bin/phpcs.phar` ont été téléchargés grâce à votre `Dockerfile`. Jetez-y un œil si besoin.

#### PHPCS et PHPCBF - Fichier de configuration {#phpcs-and-phpcbf---configuration-file}

Dans VSCode, créez dans le dossier `.config` un fichier appelé `phpcs.xml` avec ce contenu :

<Snippet filename=".config/phpcs.xml" source="./files/phpcs.xml" />

Maintenant que nous avons défini notre standard de codage (`PSR12` ici), affichez à nouveau le script `index.php` :

![PHPCS dans VSCode](./images/vscode_phpcs.webp)

Ouvrez un terminal en appuyant sur <kbd>CTRL</kbd>+<kbd>´</kbd> (ou en cliquant sur le menu `View` puis `Terminal`) et lancez cette commande :

<Terminal typewriter>
$ /usr/local/bin/phpcs.phar --standard=/var/www/html/.config/phpcs.xml /var/www/html/index.php
</Terminal>

Et vous obtiendrez cette sortie :

<Terminal source="./files/terminal-2.txt" />

Il y a un avertissement et une erreur concernant une *violation de convention de codage* et le plus sympa, c'est que **phpcbf peut en corriger certaines**.

Maintenant, lancez presque la même commande mais plus avec `phpcs` (pour détecter les violations), avec `phpcbf` (pour les corriger — celles qui peuvent l'être automatiquement).

<Terminal typewriter>
$ /usr/local/bin/phpcbf.phar --standard=/var/www/html/.config/phpcs.xml /var/www/html/index.php
</Terminal>

Vous obtiendrez ceci :

<Terminal source="./files/terminal-1.txt" />

Et effectivement, si vous regardez votre script PHP, il y a maintenant un espace après le mot-clé `if`.

#### PHPCS et PHPCBF - Tous les fichiers d'un coup {#phpcs-and-phpcbf---all-files-at-once}

Vous avez probablement déjà compris la syntaxe. Utilisez simplement le `.` pour scanner tout le code :

1. Pour corriger les violations, lancez `/usr/local/bin/phpcbf.phar  --standard=/var/www/html/.config/phpcs.xml .`
2. Pour scanner les violations restantes, lancez `/usr/local/bin/phpcs.phar  --standard=/var/www/html/.config/phpcs.xml .`.

### Le troisième outil est SonarLint {#the-third-tool-is-sonarlint}

Ici aussi, SonarLint était déjà installé dans notre container Docker grâce à notre fichier `.devcontainer/devcontainer.json` :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.part4.json" />

<AlertBox variant="note" title="Ce n'est qu'une extension VSCode">
SonarLint n'a pas besoin d'outil externe ; c'est une extension VSCode autonome, donc rien à prévoir dans notre `Dockerfile`.

</AlertBox>

Réouvrez donc le fichier `index.php` que vous avez, et faites attention à la ligne `echo sayHello()` :

<Snippet filename="index.php" source="./files/index.part3.php" />

![SonarLint voit quelque chose](./images/sonarlint_underline.webp)

Déplacez le curseur de la souris sur la variable `sayHello()` et obtenez des informations supplémentaires de SonarLint dans une popup. Vous pouvez aussi appuyer sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>M</kbd> pour afficher le panneau `Problems` (ou menu `View` puis `Problems`) et obtenir la liste de tous les problèmes SonarLint rencontrés dans le fichier courant et, aussi, dans tout fichier que vous ouvrirez désormais.

![SonarLint expliqué](./images/sonarlint_explained.webp)

Une solution serait de mettre à jour le prototype de `sayHello` comme ceci : `function sayHello($firstname = "")`.

<AlertBox variant="caution" title="SonarLint évite les bugs !">
Contrairement aux outils vus plus haut, il ne s'agit plus de formatage, **mais d'alerter le développeur sur des bugs potentiels et des erreurs fatales pendant qu'il écrit son code.**

</AlertBox>

### Le quatrième outil est Intelephense {#the-fourth-tool-is-intelephense}

À côté de `SonarLint`, il y a aussi `Intelephense` qui va lui aussi détecter un certain nombre de bugs potentiels.

Dans l'exemple précédent, quand le prototype était `function sayHello($firstname)`, `Intelephense` alertait aussi le développeur sur le paramètre manquant.

<Snippet filename="index.php" source="./files/index.part4.php" />

![Intelephense en action](./images/intelephense.webp)

<AlertBox variant="caution" title="Nous avons besoin de plusieurs outils">
Cet exemple illustre bien le point : à ce jour, en février 2024, il faut encore jongler avec plusieurs extensions et outils pour obtenir un code propre et sans bug.

</AlertBox>

### Le meilleur pour la fin, le cinquième outil est Rector {#the-best-for-last-the-fifth-tool-is-rector}

Rector est une application formidable pour scanner et mettre à niveau automatiquement votre code vers une version donnée de PHP, et cela signifie aussi inspecter votre façon de coder.

Peut-être utilisez-vous encore une manière de programmer digne de PHP 5.4 mais indigne d'un développeur moderne à jour sur les dernières évolutions.

<AlertBox variant="info" title="Rector est mon coach personnel">
J'ADORE vraiment Rector puisqu'il m'aide à apprendre de nouvelles fonctionnalités de PHP. Quand je le lance sur n'importe lequel de mes projets, je vois où je peux améliorer mon code en refactorant certaines parties et faire mieux.

**J'ADORE VRAIMENT RECTOR.**

</AlertBox>

Cette fois, il va falloir installer Rector pour notre projet et pour cela, nous allons suivre la documentation officielle : [https://github.com/rectorphp/rector?tab=readme-ov-file#install](https://github.com/rectorphp/rector?tab=readme-ov-file#install) mais ... c'est déjà fait dans notre fichier `.devcontainer/devcontainer.json`.

Si vous le réouvrez, regardez le nœud `postCreateCommand` :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.part5.json" />

Rector sera ajouté au fichier `composer.json` (et le fichier sera créé s'il n'existe pas encore).

<AlertBox variant="info" title="`Composer` a été installé dans notre `Dockerfile`">
Si vous pensez *Oui, mais je n'ai pas installé composer...*, eh bien c'est faux. Nous l'avons installé dans notre container. Revoyez votre `.devcontainer/Dockerfile` si besoin.

</AlertBox>

#### Rector - fichier de configuration {#rector---configuration-file}

<AlertBox variant="caution" title="Sautez ce chapitre si vous avez déjà téléchargé les fichiers de configuration" />

La deuxième étape du guide d'installation nous demande de lancer la commande ci-dessous. À l'invite, répondez `yes` pour créer votre fichier de configuration `rector.php`.

<Terminal typewriter>
$ vendor/bin/rector
</Terminal>

Enfin, ouvrez le fichier de configuration `rector.php` et mettez-le à jour comme ceci :

<Snippet filename="rector.php" source="./files/rector.php" />

<AlertBox variant="caution" title="Dites à Rector quelle version de PHP vous utilisez">
Rector va vous suggérer des changements mais pour cela, il doit savoir quelle version de PHP vous utilisez. En effet, Rector ne suggérera pas une syntaxe PHP 8.2 par exemple si vous tournez encore sur une version plus ancienne (voir [PHP Version Features](https://getrector.com/documentation/php-version-features)).

</AlertBox>

<AlertBox variant="info" title="De mon côté, je préfère mettre tous les fichiers de configuration dans un dossier .config">
Vous avez remarqué que Rector a créé son fichier de configuration à la racine de votre projet. Je préfère le déplacer dans le dossier `.config`.

</AlertBox>

#### Lancer Rector {#run-rector}

Pour illustrer ce que Rector peut faire, éditez le `index.php` avec ce contenu, une fois de plus :

<Snippet filename="index.php" source="./files/index.part5.php" />

Dans un terminal, lancez `vendor/bin/rector process index.php --dry-run --config .config/rector.php` comme précédemment.

![Rector simplifie notre fonction sayHello](./images/rector_say_hello.webp)

Regardez l'image ci-dessus. En rouge, votre code actuel et, oui, on le savait, n'est-ce pas, la qualité du code est mauvaise.

En effet, un des concepts du clean code est d'éviter l'instruction conditionnelle `if ... else ...`. Très probablement, nous n'avons pas besoin de `else` (voir [https://phpmd.org/rules/cleancode.html#elseexpression](https://phpmd.org/rules/cleancode.html#elseexpression)).

Rector suggère de supprimer complètement l'expression `if .. else ...` et d'utiliser une [expression ternaire](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#simplifyifelsetoternaryrector). Et aussi, de retourner directement la valeur au lieu d'utiliser une variable `$text` inutile.

Et c'est correct, nous pouvons écrire `return $firstname == "" ? "Hello World!" : "Hello " . $firstname;` pour obtenir exactement la même chose.

Et si vous pensez que c'est fini, vous vous trompez. Rector regarde maintenant le paramètre de notre fonction et comprend que c'est une chaîne, donc il va suggérer d'[ajouter un type hint](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#strictstringparamconcatrector) et, aussi, d'[ajouter un type de retour](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#returntypefromstrictscalarreturnexprrector) pour la même raison.

Puisque nous avons analysé les suggestions de Rector et que nous sommes d'accord, relancez la même commande mais, cette fois, sans le flag `--dry-run`.

<Terminal typewriter>
$ vendor/bin/rector process index.php --config .config/rector.php
</Terminal>

Rector a mis à jour notre fichier `index.php` ! **Maintenant, notre fonction tient sur une seule ligne et non plus sept. Belle amélioration !**

Notre nouveau code, amélioré, est maintenant :

<Snippet filename="index.php" source="./files/index.part6.php" />

Rector est **absolument brillamment puissant**. Apprenez-en plus en lisant attentivement son site de documentation : [https://getrector.com/documentation/](https://getrector.com/documentation/).

<AlertBox variant="info" title="Le programmeur a le dernier mot, mais pour combien de temps encore ?">
Nous pouvons faire une amélioration de plus en extrayant le préfixe `Hello`. Rector ne l'a pas encore vu, mais pour combien de temps ?

<Snippet filename="index.php" source="./files/index.part7.php" />


</AlertBox>

#### Rector - Tous les fichiers d'un coup {#rector---all-files-at-once}

Retournez dans votre terminal et lancez la commande ci-dessous pour scanner tout votre code.

<Terminal typewriter>
$ vendor/bin/rector process . --dry-run --config .config/rector.php
</Terminal>

##### Dry-run signifie qu'aucune modification n'est faite, juste affichée {#dry-run-means-no-changes-are-made-just-displayed}

Quand vous lancez Rector avec `vendor/bin/rector process . --dry-run --config .config/rector.php`, aucun fichier ne sera réécrit. Rector se contentera de suggérer des changements.

Si vous autorisez Rector à modifier vos fichiers, lancez plutôt `vendor/bin/rector process . --config .config/rector.php` mais, là, vous devez être sûr que c'est OK.

<AlertBox variant="info" title="Versionner son code avec par exemple GitHub">
Si vous utilisez un système de versioning, vous pouvez pousser votre code actuel sur GitHub, créer une nouvelle branch comme par exemple `refactoring` puis lancer Rector sans risque sur votre disque. Si quelque chose casse, vous pouvez toujours récupérer vos sources d'avant les modifications.

</AlertBox>

### Et on peut ajouter d'autres outils {#and-we-can-add-more-tools}

Il existe encore plusieurs outils d'analyse de code pour PHP :

- [phpstan](https://phpstan.org/),
- [psalm](https://psalm.dev/),
- [PHP Copy/Paste Detector](https://github.com/sebastianbergmann/phpcpd),
- [PHP Magic Number Detector](https://github.com/povils/phpmnd),
- ...

Vous pouvez certainement aussi les ajouter à votre container.

### Extensions {#extensions}

Certaines extensions seront installées automatiquement :

- [bmewburn.vscode-intelephense-client](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) - PHP code intelligence for Visual Studio Code,
- [junstyle.php-cs-fixer](https://marketplace.visualstudio.com/items?itemName=junstyle.php-cs-fixer) - PHP CS Fixer extension for VS Code, php formatter, php code beautify tool, format html,
- [ms-azuretools.vscode-docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) - Makes it easy to create, manage, and debug containerized applications,
- [sonarsource.sonarlint-vscode](https://marketplace.visualstudio.com/items?itemName=sonarsource.sonarlint-vscode) - Linter to detect & fix coding issues locally in JS/TS, Python, PHP, Java, C, C++, C#, Go, IaC. Use with SonarQube & SonarCloud for optimal team performance.,
- [streetsidesoftware.code-spell-checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) - Spelling checker for source code,
- [usernamehw.errorlens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) - Improve highlighting of errors, warnings and other language diagnostics,
- [ValeryanM.vscode-phpsab](https://marketplace.visualstudio.com/items?itemName=ValeryanM.vscode-phpsab) - PHP Sniffer & Beautifier for Visual Studio Code and
- [zobo.php-intellisense](https://marketplace.visualstudio.com/items?itemName=zobo.php-intellisense) - Advanced Autocompletion and Refactoring support for PHP

## Conclusion {#conclusion}

Souvenez-vous du collègue du début de cet article, celui qui n'indente pas comme vous. Il n'y a plus rien à lui demander. Les règles ne sont plus dans une page de wiki ou dans un commentaire de code review, elles sont dans deux fichiers versionnés — `devcontainer.json` et `Dockerfile` — et elles s'appliquent dès l'ouverture du projet, sur chaque machine, à l'identique.

C'est vraiment là le changement : l'environnement n'est plus quelque chose que chaque développeur construit, mais quelque chose que le repository fournit.

Si vous préférez lancer ces outils à la demande plutôt que de les intégrer dans une image, voyez <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link>. Et pour être sûr qu'aucun de ces outils de développement ne se retrouve dans votre image de production, lisez <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers - The Clean Way</Link>.
