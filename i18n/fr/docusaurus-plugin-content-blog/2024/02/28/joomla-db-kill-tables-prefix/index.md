---
slug: joomla-db-kill-tables-prefix
title: Joomla - supprimer les tables de votre base de données selon un certain préfixe
date: 2024-02-28
description: Nettoyez votre base de données Joomla en supprimant facilement les tables inutiles à partir d'un préfixe donné. Suivez ce guide pas à pas pour utiliser un petit utilitaire PHP en toute sécurité.
authors: [christophe]
image: /img/v2/joomla.webp
mainTag: joomla
tags:
  - database
  - joomla
language: fr
review_date: 2026-07-30
---
![Joomla - supprimer les tables de votre base de données selon un certain préfixe](/img/v2/joomla.webp)

<TLDR>
Cet article partage un petit script PHP qui supprime les tables de la base de données Joomla correspondant à un préfixe donné (par exemple les restes d'un ancien composant désinstallé). Vous l'uploadez à côté de `configuration.php`, vous le lancez depuis le navigateur pour sélectionner et supprimer les tables correspondantes, puis vous le retirez immédiatement du serveur — et surtout, faites une sauvegarde de la base avant.
</TLDR>

Un [post](https://forum.joomla.fr/forum/joomla-4-x-aa/questions-g%C3%A9n%C3%A9rales-aa/2060596-deux-pr%C3%A9fixes-de-tables) récent sur le forum français de Joomla demandait comment supprimer des tables présentes dans la base de données Joomla ; celles qui utilisent un préfixe donné comme `old_` ou quelque chose du genre.

En effet, de temps en temps, il peut être utile de jeter un œil à la liste des tables de votre base de données et peut-être que vous y trouverez des tables préfixées par exemple `old_` ou par un vieil outil utilisé il y a des années (avec le bon préfixe mais un composant supprimé depuis, du genre `joomla_oldcomp`).

Il y a quelques années, j'ai écrit un utilitaire PHP pour ça ; voyons comment l'utiliser.

<!-- truncate -->

## À quoi ressemble l'utilitaire {#what-the-utility-looks-like}

![Kill tables](./images/kill_tables.webp)

Tapez un préfixe dans le champ texte et l'utilitaire liste immédiatement toutes les tables de votre base Joomla qui correspondent. Cochez celles dont vous voulez vous débarrasser, cliquez sur `Kill selected tables`, et elles sont supprimées. Le bouton `Remove this script` à droite supprime l'utilitaire de votre serveur quand vous avez terminé.

C'est tout l'outil : un écran, un champ texte, aucun fichier de configuration.

## Comment l'utiliser {#how-to-use-it}

1. Cliquez sur le lien [https://github.com/cavo789/joomla_free/blob/master/src/kill_db_tables/kill_db_tables.php](https://github.com/cavo789/joomla_free/blob/master/src/kill_db_tables/kill_db_tables.php) pour obtenir une copie de mon utilitaire PHP,
2. Copiez/téléchargez le script et, avec votre client FTP (<Link to="/blog/winscp-synchronize-both">WinSCP</Link> par exemple), uploadez-le sur votre site Joomla, dans le même répertoire que votre fichier `configuration.php`. Nommez le script par exemple `delete_tables.php`,
3. Ouvrez votre navigateur, allez sur l'URL de votre site et accédez à `delete_tables.php`, donc par exemple `https://yoursite.com/delete_tables.php`
4. Dans le champ texte, commencez simplement à taper votre préfixe et vous obtiendrez la liste des tables utilisant ce préfixe. Quand vous êtes sûr, cliquez sur le bouton `Kill selected tables`.
5. Enfin, pensez bien à cliquer sur le bouton `Remove this script` car le script ne doit pas rester là.

<AlertBox variant="highlyImportant" title="Pensez bien à cliquer sur `Remove this script`." />

<AlertBox variant="highlyImportant" title="Assurez-vous de savoir ce que vous faites et d'avoir une sauvegarde de la base de données, au cas où." />

## Conclusion {#conclusion}

Un préfixe `old_` ou `joomla_oldcomp` oublié, c'est le genre de bazar qu'on remarque une fois par an sans jamais prendre le temps de le nettoyer, parce que le faire à la main dans phpMyAdmin veut dire cocher trente cases sans être certain de rien. Ce script fait la sélection pour vous, en un seul écran, puis se supprime lui-même.

Avant de supprimer quoi que ce soit, prenez le temps de **regarder** ce que contiennent ces tables : <Link to="/blog/joomla-show-table">Joomla - Run a SQL statement outside Joomla and display a nice HTML table</Link> est le pendant en lecture seule de cet utilitaire.
