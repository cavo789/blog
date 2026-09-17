---
slug: php-obfuscator
title: Obfusquez votre code PHP
date: 2024-04-09
description: Protégez votre code PHP grâce à l'obfuscation. Découvrez comment fonctionne le script php_obfuscator et si des outils d'IA comme Copilot arrivent encore à désobfusquer votre code source propriétaire.
authors: [christophe]
image: /img/v2/obfuscated_code.webp
mainTag: php
tags:
  - ai
  - code-quality
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Updated PHP Docker image from php:7.4-fpm (EOL Nov 2022) to php:8.3-fpm in all examples."
---
<!-- cspell:ignore ctype, fgets, ppmb, ppmc, ppms, ppmu, ppmw, ppmx, ppnc, ppnt, ppnx, ppny, ppnz, strlen, strpos, strtolower -->

![Obfusquez votre code PHP](/img/v2/obfuscated_code.webp)

<TLDR>
Cet article teste si l'obfuscation de code PHP (avec le script `php_obfuscator` de l'auteur, qui supprime les espaces et renomme les identifiants en chaînes aléatoires) protège encore le code propriétaire à l'ère de l'IA. Un jeu du pendu généré par Gemini est obfusqué et continue de fonctionner correctement, mais Copilot arrive ensuite à le désobfusquer entièrement, en code lisible et commenté — de quoi se demander si l'obfuscation vaut encore la peine.
</TLDR>

Il y a quelques années, je vendais un logiciel appelé aeSecure, un Web Application Firewall. Pour éviter que mon code propriétaire soit récupéré par quelqu'un qui pourrait ensuite le revendre, par exemple, j'avais développé un script d'obfuscation.

Depuis, j'ai publié une version réutilisable de ce script : [https://github.com/cavo789/php_obfuscator](https://github.com/cavo789/php_obfuscator).

Et si, aujourd'hui, avec l'intelligence artificielle, ce type de code n'avait plus aucun intérêt ? L'objectif de cet article est de voir s'il est toujours pertinent de rendre son code illisible.

<!-- truncate -->

## Obtenir un code qui n'existait pas encore : demandez à Gemini {#obtaining-a-previously-non-existent-code-ask-gemini}

Juste pour disposer d'un peu de code PHP en exemple pour cet article, créons un jeu du pendu avec l'intelligence artificielle.

![Demander à Gemini](./images/gemini.webp)

Voici le code proposé par [Gemini](https://gemini.google.com/). Enregistrez-le sur votre disque sous le nom `hangman.php` :

<Snippet filename="hangman.php" source="./files/hangman.php" />

Pour jouer, il suffit de lancer `docker run -it -v ${PWD}:/src -w /src php:8.3-fpm php hangman.php` (voyez <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link> si cette commande vous semble cryptique).

Comme vous allez le voir, le script fonctionne très bien sans aucune modification !

![En train de jouer](./images/playing.webp)

## Obfusquer {#obfuscate}

Maintenant, nous allons rendre ce code illisible en supprimant les espaces et les retours à la ligne inutiles, et en remplaçant les noms par des lettres aléatoires. Par exemple, remplacer le nom de fonction `playHangman` par une chaîne aléatoire comme `ppny`. Et pour rendre le code encore plus illisible, je ne choisirai que des chaînes du type `ppmx`, `ppnx`, `ppny` et ainsi de suite.

Pour réaliser cette obfuscation, téléchargez simplement mon script [https://github.com/cavo789/php_obfuscator/blob/main/src/minify.php](https://github.com/cavo789/php_obfuscator/blob/main/src/minify.php) et enregistrez-le sur votre disque sous le nom `minify.php`. Créez aussi un fichier appelé `settings.json` avec ce contenu :

<Snippet filename="settings.json" source="./files/settings.json" />

À ce stade, vous avez trois fichiers dans votre dossier :

<Terminal typewriter source="./files/terminal-1.txt" />

Il est temps de rendre le fichier `hangman.php` illisible en lançant `docker run -it -v ${PWD}:/src -w /src php:8.3-fpm php minify.php input=hangman.php output=hangman_minify.php`.

![Obfusquer votre code PHP](./images/obfuscate.webp)

Vous avez maintenant un nouveau fichier appelé `hangman_minify.php` :

<Snippet filename="hangman_minify.php" source="./files/hangman_minify.php" />

Ce que vous voyez ici, c'est la nouvelle version du fichier `hangman.php`, et elle fonctionne toujours. Vous pouvez le vérifier en lançant `docker run -it -v ${PWD}:/src -w /src php:8.3-fpm php hangman_minify.php`.

## Rendre le code lisible à nouveau : demandez à Copilot {#make-the-code-readable-again-ask-copilot}

![Demander à Copilot](./images/copilot.webp)

La première fois, [Copilot](https://copilot.microsoft.com/) a conservé mes noms de fonctions minifiés. En lui demandant *Can you suggest another version?*, Copilot propose ce code :

![Réécriture du code](./images/copilot_rewritting.webp)

<Snippet filename="hangman.php" source="./files/hangman.part2.php" />

L'intelligence artificielle a réussi à comprendre l'objectif du script (un jeu du pendu) et a réécrit le code pour le rendre lisible. Non seulement le code est lisible, les noms de fonctions aussi, mais elle a également écrit des commentaires. Tout simplement incroyable !

L'obfuscation mise à part, si vous cherchez des outils plus classiques pour la qualité du code PHP, jetez un œil à <Link to="/blog/php-jakzal-phpqa">l'image Docker qui regroupe les outils d'analyse statique</Link>.
