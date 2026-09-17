---
slug: vscode-php-refactoring
title: Refactoring de code PHP dans VSCode
date: 2024-02-27
description: Maîtrisez le refactoring de code PHP dans VSCode avec ce guide. Utilisez l'extension gratuite PHP Refactor Tool pour renommer sans risque symboles et classes, et extraire de nouvelles méthodes.
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: php
tags:
  - code-quality
  - php
  - vscode
language: fr
review_date: 2026-07-30
---
![Refactoring de code PHP dans VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article traite du refactoring PHP dans VSCode avec les extensions gratuites `PHP Refactor Tool` et `PHP Refactoring` : renommer un symbole ou une classe avec <kbd>F2</kbd> (ce qui met à jour automatiquement chaque utilisation dans tous les fichiers) et extraire un bloc de code vers une nouvelle méthode, avec détection automatique des variables locales qui doivent devenir des paramètres.
</TLDR>

Actuellement, fin février 2024, il n'existe pas beaucoup d'extensions de refactoring gratuites pour PHP sous VSCode. Nous allons regarder [PHP Refactor Tool](https://marketplace.visualstudio.com/items?itemName=st-pham.php-refactor-tool) et [PHP Refactoring](https://marketplace.visualstudio.com/items?itemName=marsl.vscode-php-refactoring).

Nous allons apprendre à renommer un symbole, une classe et, encore mieux, à extraire une portion d'une longue méthode vers une nouvelle.

*Ces extensions refactorisent ce que vous leur désignez. Pour des refactorings suggérés — et appliqués — automatiquement sur tout un code source, voir <Link to="/blog/php-rector">Rector 1.0.0, my friend, my coach</Link>.*

<!-- truncate -->

## Créer les fichiers d'exemple {#create-sample-files}

Pour la démo, lancez un shell Linux et exécutez `mkdir -p /tmp/refactor && cd $_` pour créer un dossier `refactor` dans votre dossier temporaire Linux et vous y rendre.

Créez deux fichiers php. Le premier s'appellera `index.php` et contiendra ce code :

<Snippet filename="/tmp/refactor/index.php" source="./files/index.php" />

Le second fichier, `Product.php`, contiendra :

<Snippet filename="/tmp/refactor/Product.php" source="./files/Product.php" />

### Lancer l'exemple {#run-the-example}

Exécutez `docker run -it --rm -v "${PWD}":/project -w /project php:8.2 php index.php` pour lancer notre exemple dans la console.

Vous obtiendrez, comme prévu :

<Terminal typewriter>
$ docker run -it --rm -v "$PWD":/project -w /project php:8.2 php index.php
The name is keyboard cost 125 €
</Terminal>

## Refactoring {#refactoring}

Assurez-vous que `PHP Refactor Tool` est installé. Allez dans la liste des extensions de VSCode (appuyez sur <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>X</kbd>) et recherchez `PHP Refactor Tool`. Installez celle de `Son Tung PHAM` (l'auteur).

### Renommer un symbole {#rename-a-symbol}

L'illustration ci-dessous montre un script `index.php` d'exemple utilisant une classe définie dans `Product.php`.

Tout fonctionne bien mais, oui, les fonctions s'appellent `getProductName` et `getProductPrice` et c'est assez redondant : notre objet est `$product` donc, oui, `$product->getProductName()` et `$product->getProductPrice()` peuvent être réécrits en `$product->getName()` et `$product->getPrice()`. Plus court, c'est mieux.

Nous devons donc renommer nos fonctions.

En ouvrant notre fichier `Product.php`, nous pourrions le faire à la main mais... ne faites pas ça : vous devriez mettre à jour manuellement chaque fichier utilisant votre classe `Product` et si vous oubliez ne serait-ce qu'une utilisation, votre code sera cassé.

La fonctionnalité de renommage sert exactement à ça. Il vous suffit de sélectionner une propriété comme `productName` comme illustré dans l'animation, d'appuyer sur <kbd>F2</kbd> et de la renommer.

Faisons-le et voyons comment ça fonctionne :

1. Ouvrez le fichier `Product.php`, placez le curseur sur le mot `productName` à la ligne 7 `private string $productName = '';`,
2. Appuyez sur <kbd>F2</kbd> (ou choisissez Rename Symbol dans la palette de commandes (appuyez sur <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd>)) et tapez le nouveau nom, par exemple `name` (au lieu de `productName`),
3. VSCode affichera une petite liste en haut de l'écran, validez simplement, c'est-à-dire sélectionnez `Update Getter name and Setter name`.
4. Faites de même pour `productPrice` et renommez-le en `price`.

Le nouveau fichier `Product.php` est maintenant :

<Snippet filename="/tmp/refactor/Product.php" source="./files/Product.part2.php" />

Mais le plus sympa, c'est que `index.php` a été mis à jour automatiquement. Ouvrez `index.php` et vérifiez :

<Snippet filename="/tmp/refactor/index.php" source="./files/index.part2.php" />

En exécutant `docker run -it --rm -v "${PWD}":/project -w /project php:8.2 php index.php`, ça fonctionne toujours.

<AlertBox variant="info" title="Vous avez refactorisé notre code sans le casser. Félicitations !" />

La même chose en images :

![Renommer un symbole](./images/rename_symbol.gif)

### Renommer une classe {#rename-a-class}

Pour l'exemple, réouvrez le fichier `Product.php` et, à la ligne 5, placez le curseur sur le mot `Product`. Appuyez sur <kbd>F2</kbd> et renommez en `Products` (au pluriel).

Comme on pouvait s'y attendre, le nom de la classe a été mis à jour, mais le nom du fichier aussi. Et, une fois encore, si vous ouvrez le fichier `index.php`, vous verrez que `$product = new Product();` est devenu parfaitement `$product = new Products();`.

![Renommer une classe](./images/rename-a-class.webp)

<AlertBox variant="info" title="Vous pouvez aussi renommer depuis index.php">
Repérez la ligne `$product = new Product();` dans votre fichier `index.php`. Placez le curseur sur le mot `Product`, appuyez sur <kbd>F2</kbd> et renommez-le. Ça fonctionne aussi, c'est-à-dire que la classe sera également mise à jour dans `Products.php` (puisque le fichier a été renommé lui aussi). Sympa !

</AlertBox>

![Renommer une classe](./images/rename_class.gif)

<AlertBox variant="caution" title="Ne renommez pas le fichier">
Renommer le fichier depuis l'explorateur ne refactorisera pas le code. Donc, n'allez pas dans l'`Explorer`, cliquer sur `Product.php` et le renommer. Cela ne refactorisera pas le code. À éviter !

</AlertBox>

### Extraire vers une nouvelle méthode {#extract-to-a-new-method}

La troisième méthode très pratique est `Extract method` de [PHP Refactoring](https://marketplace.visualstudio.com/items?itemName=marsl.vscode-php-refactoring).

Prenons l'exemple suivant (le code ne tourne pas, c'est juste pour l'illustration). Créez un nouveau fichier appelé `Pandoc.php` avec ce contenu :

<Snippet filename="/tmp/refactor/Pandoc.php" source="./files/Pandoc.php" />

La fonction `download` ne respecte pas le principe de responsabilité unique. Nous y faisons quelques initialisations et assertions. Peut-on faire mieux ? Oui : nous pouvons extraire les lignes concernant le navigateur et créer une nouvelle fonction `sendToBrowser` mais, au lieu de le faire à la main, nous allons utiliser la fonctionnalité `Extract`.

Voyez l'animation ci-dessous :

![Extraire vers une nouvelle méthode](./images/extract-new-method.gif)

<AlertBox variant="info" title="Avez-vous remarqué l'usage des paramètres d'entrée ?">
Dans les lignes que nous déplaçons, il y a des variables comme `contentType` et `filename` qui ne font pas partie de la nouvelle méthode. Ces variables restent locales à notre première méthode, `download`.

Et, comme vous pouvez le voir, lors de la création de la nouvelle méthode, ces deux variables locales ont été ajoutées à la définition de la nouvelle fonction. Très bonne fonctionnalité.

</AlertBox>

## Autres extensions {#other-extensions}

- 💀 😒 [PHP Refactor](https://marketplace.visualstudio.com/items?itemName=tintrinh.php-refactor) existe également mais la dernière mise à jour par l'auteur date de 2019, il y a cinq ans, et la fonctionnalité d'extraction ne fonctionne pas bien ; passez votre chemin.
- 💲😒 [PHP Tools for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode) de **DEVSENSE** est une extension freemium (les fonctionnalités de refactoring ne sont que dans la version payante). Le renommage de symbole est payant alors qu'il est gratuit avec [PHP Refactor Tool](https://marketplace.visualstudio.com/items?itemName=st-pham.php-refactor-tool). **N'installez pas `PHP Tools for Visual Studio Code` car il écrasera la fonction <kbd>F2</kbd> de `PHP Refactor Tool` et la cassera.** (voir mon issue [Devsense - All-In-One conflicts](https://github.com/st-pham/php-refactor-tool/issues/16))

Renommer et extraire des méthodes n'est qu'une partie du travail pour garder un code PHP sain ; pour l'analyse statique et le formatage automatisés, voir <Link to="/blog/php-jakzal-phpqa">l'image Docker regroupant des outils d'analyse statique</Link> et <Link to="/blog/online-php-linter">formater du code PHP mal formaté</Link>.
