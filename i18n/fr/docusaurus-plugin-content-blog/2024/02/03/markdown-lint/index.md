---
slug: markdown-lint
title: Markdown linter - corriger les problèmes de formatage dans les fichiers md
date: 2024-02-03
description: Corrigez automatiquement les problèmes de formatage Markdown avec l'outil markdownlint et Docker. Apprenez à vérifier, configurer et utiliser le flag --fix pour des fichiers .md propres et cohérents.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - makefile
  - markdown
  - vscode
language: fr
review_date: 2026-07-30
---
![Markdown linter - corriger les problèmes de formatage dans les fichiers md](/img/v2/clean_code.webp)

<TLDR>
Cet article montre comment linter et corriger automatiquement des fichiers Markdown avec l'image Docker `peterdavehello/markdownlint` : scanner un projet, ignorer des dossiers comme `vendor` ou `node_modules` via `.markdownlint_ignore`, désactiver certaines règles via `.markdownlint.json`, et appliquer les corrections automatiques avec le flag `--fix`, le tout branché sur un target `make lint`.
</TLDR>

Vous écrivez des fichiers Markdown `.md` (et vous avez bien raison) et vous voulez juste vérifier (et corriger automatiquement) quelques problèmes comme plusieurs lignes vides d'affilée, un mélange de types de puces (`-` et `*` dans le même document), un titre `#` suivi d'un `###` (autrement dit, vous avez oublié le niveau `##`) et bien d'autres.

Il existe un outil pour ça : Markdown lint et une image Docker `peterdavehello/markdownlint`.

Voyons comment l'utiliser.

*Comme tout linter, il est surtout utile quand vous n'avez plus à y penser : <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> liste un hook `markdownlint` qui s'exécute à chaque commit.*

<!-- truncate -->

En lançant `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint .`, vous scannez votre dossier courant (récursivement), à la recherche de tous les fichiers Markdown, et vous obtenez la liste des erreurs éventuelles.

Et la liste peut être énorme si vous utilisez des dépendances comme, pour PHP, le dossier `vendor` ou `node_modules` pour npm/yarn. Il suffit de les ignorer.

## Ignorer certains fichiers/dossiers {#ignore-some-filesfolders}

Créez un fichier appelé `.markdownlint_ignore` à la racine de votre projet avec ce contenu :

<Snippet filename=".markdownlint_ignore" source="./files/.markdownlint_ignore" />

Cette fois, lancez `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint --ignore-path .markdownlint_ignore .`.

La liste sera probablement plus courte et ne contiendra que vos fichiers.

## Ignorer certaines erreurs {#ignore-some-errors}

Vous pouvez ignorer certaines erreurs détectées, comme l'utilisation de HTML inline, en créant un fichier appelé `.markdownlint.json`. Vous trouverez un exemple sur [https://github.com/DavidAnson/markdownlint/blob/main/.markdownlint.json](https://github.com/DavidAnson/markdownlint/blob/main/.markdownlint.json). Voir [https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) pour plus d'informations.

Pour utiliser votre fichier de configuration, lancez maintenant `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint --config .markdownlint.json --ignore-path .markdownlint_ignore .`.

## Certaines erreurs peuvent être corrigées automagiquement {#some-errors-can-be-fixed-automagically}

Certaines erreurs peuvent être corrigées automagiquement, comme les lignes vides multiples ou les espaces superflus en fin de ligne.

Le flag ici est `--fix` mais attention : puisque les corrections modifient les fichiers, vous devez aussi ajouter le flag `--user $(id -u):$(id -g)` pour que les fichiers soient mis à jour tout en restant votre propriété.

## On assemble le tout {#put-all-together}

L'instruction finale devient : `docker run --rm --user $(id -u):$(id -g) -v .:/md peterdavehello/markdownlint markdownlint --fix --config .markdownlint.json --ignore-path .markdownlint_ignore .` et c'est celle que je lance chaque fois que je publie sur ce blog.

## Se simplifier la vie {#make-it-easy}

Vous n'avez évidemment pas besoin de retenir la commande entière. Avec un <Link to="/blog/tags/makefile">Makefile</Link> dans votre projet, vous pouvez créer un nouveau `target` qui contient la commande.

Pour ce blog par exemple, je lance `make lint` dans mon processus de déploiement. Vous pouvez le voir [ici](https://github.com/cavo789/blog/blob/main/makefile#L42-L45).
