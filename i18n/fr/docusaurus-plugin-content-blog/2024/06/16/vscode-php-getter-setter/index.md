---
slug: vscode-php-getter-setter
title: Getter et Setter PHP dans VSCode
date: 2024-06-16
description: Implémentez sans effort des Getters et Setters PHP sécurisés dans VSCode. Découvrez les bonnes pratiques pour les propriétés privées de classe et utilisez l'extension recommandée pour les générer instantanément.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - php
  - vscode
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore strtolower -->
![Getter et Setter PHP dans VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article plaide pour des propriétés de classe PHP privées, accessibles uniquement via des getters/setters (afin de pouvoir valider les valeurs, par exemple refuser un prix négatif), et présente l'extension VSCode `PHP Getters & Setters` qui les génère automatiquement via un clic droit sur la propriété — supprimant l'excuse selon laquelle les écrire serait fastidieux.
</TLDR>

Parce que vous êtes un excellent développeur, vous n'autorisez personne à accéder directement aux propriétés de votre classe, mais uniquement via un getter ou un setter.

Autrement dit, dans votre classe PHP, vous n'avez pas de propriétés `public` (c'est le diable) mais exclusivement des `protected` ou mieux, des `private`.

Et grâce aux getters et setters, vous permettez à d'autres objets d'interagir avec vos propriétés privées en les lisant (getters) ou en modifiant leurs valeurs (setters).

*<Link to="/blog/php-rector">Rector</Link> peut repérer les endroits où une propriété aurait dû être privée dès le départ, et <Link to="/blog/vscode-tabnine">Tabnine</Link> devinera souvent le setter complet dès que vous commencez à taper `private function set`.*

Certains diront « Oui, mais c'est fastidieux d'écrire ces fonctions ». Pas du tout.

<!-- truncate -->

## L'extension en action {#see-the-extension-in-action}

Faites un clic droit sur une propriété, choisissez une action, et le code du getter/setter est généré pour vous :

![PHP Getters & Setters](./images/phproberto.webp)

![Getter et Setter PHP dans VSCode](./images/php-getter-setter.gif)

Plus d'excuse pour les ignorer — l'extension [PHP Getters & Setters](https://marketplace.visualstudio.com/items?itemName=phproberto.vscode-php-getters-setters) tape à votre place.

## Le mauvais scénario {#the-bad-scenario}

<Snippet filename="product.php" source="./files/product.php" />

Comme vous le voyez, `$name` est public, donc je peux écrire des choses comme ci-dessous et c'est... OK.

```php
$product = new Product();
$product->name='coMPuteR';
$product->price=-10;
```

Par OK, je veux dire : bon, j'ai utilisé un mélange de minuscules et de majuscules pour le nom et, bon, j'ai dit que je vendais des ordinateurs à -10 €. C'est OK parce que je ne fais aucune validation sur les valeurs, et c'est très mauvais.

En utilisant un setter (une fonction appelée quand la propriété est initialisée), je peux vérifier la valeur et corriger la casse par exemple, ou refuser un prix négatif.

## La bonne approche {#the-good-way}

Créons notre classe avec des propriétés privées :

<Snippet filename="product.php" source="./files/product.part2.php" />

Donc, pour chaque propriété, vous devez écrire une fonction appelée `Getter` pour lire son contenu et une autre appelée `Setter` pour la modifier. Ça pourrait être pénible, mais ça ne l'est pas, grâce à l'extension présentée en haut de cet article : faites juste un clic droit sur une propriété, choisissez l'action souhaitée et lancez-la.

Maintenant, je peux écrire :

```php
$product = new Product();
$product->setName('coMPuteR');
$product->setPrice(-10);
```

Et le code qui utilise la classe :

<Snippet filename="product.php" source="./files/product.part3.php" />

Laisser l'éditeur générer ce code répétitif est une façon de garder votre PHP propre. Le laisser *vérifier* votre code en est une autre : <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link> met en place un environnement prêt à l'emploi avec les linters et l'analyse statique déjà configurés.
