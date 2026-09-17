---
slug: linux-xmlstarlet
title: L'utilitaire xmlstarlet pour Linux
date: 2023-12-13
description: Maîtrisez la manipulation de données XML en ligne de commande avec xmlstarlet. Ce guide montre comment embellir une sortie XML et filtrer des nœuds avec des expressions XPath
authors: [christophe]
image: /img/v2/bash.webp
series: Modern CLI tools for your terminal
mainTag: linux
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![L'utilitaire xmlstarlet pour Linux](/img/v2/bash.webp)

<TLDR>
Cet article présente `xmlstarlet`, l'équivalent de `jq` pour le XML : formater un XML minifié avec `xmlstarlet format --indent-spaces 4`, et extraire ou filtrer des nœuds avec des expressions XPath via `xmlstarlet sel -t -v`, y compris des filtres sur attribut comme `//book[@category='children']/title`.
</TLDR>

`xmlstarlet` est un utilitaire puissant pour Linux qui permet de manipuler des données XML depuis la ligne de commande et qui s'intègre dans vos scripts shell. *Il est au XML ce que <Link to="/blog/linux-jq">`jq`</Link> est au JSON.*

Avec `xmlstarlet`, vous pouvez embellir une sortie XML mais aussi la filtrer, par exemple pour n'afficher qu'un nœud donné.

<!-- truncate -->

## Un mur de XML en entrée, un mot en sortie {#a-wall-of-xml-in-one-word-out}

Voici le fichier avec lequel nous allons jouer, `data.xml`, exactement tel qu'une machine l'aurait écrit : tout sur une seule ligne, aucun formatage.

<Snippet filename="data.xml" source="./files/data.xml" />

Posons-lui maintenant une question : *donne-moi le titre du livre classé dans la catégorie `children`*.

<Terminal typewriter>
$ cat "data.xml" | xmlstarlet sel -t -v "//book[@category='children']/title"

Harry Potter
</Terminal>

Une commande, une réponse, et pas une seule ligne de code de parsing.

## Embellir le fichier {#beautifying-the-file}

La deuxième chose que vous utiliserez tous les jours : rendre ce mur lisible, grâce à l'action `format`.

<Terminal typewriter>
$ cat "data.xml" | xmlstarlet format --indent-spaces 4
</Terminal>

<Snippet title="La sortie de l'action format" source="./files/data.part2.xml" />

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant d'installer quoi que ce soit, essayez les deux commandes ci-dessus dans un container jetable — `data.xml`, exactement le même fichier que celui montré en haut de cet article, vous attend déjà dans le répertoire de travail.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `xmlstarlet` et écrit `data.xml` pour vous. Rien à créer, coller ou télécharger — il n'y a plus qu'à envoyer le fichier dans `xmlstarlet`.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez l'image et lancez-la :

<Terminal title="user@machine: ~/xmlstarlet-demo">
$ docker build -t xmlstarlet-demo .
[+] Building 9.4s (6/6) FINISHED
 ✔ exporting to image

$ docker run --rm -it xmlstarlet-demo
🐳 root ~/demo # cat data.xml | xmlstarlet sel -t -v "//book[@category='children']/title"

Harry Potter
</Terminal>

Même fichier, même filtre, même réponse — pas de `mkdir`, pas de copier-coller de XML dans un nouveau fichier. Essayez ensuite `cat data.xml | xmlstarlet format --indent-spaces 4` pour voir la version embellie, ou modifiez l'expression XPath pour récupérer un autre nœud.

## Installer xmlstarlet {#installing-xmlstarlet}

Pour vérifier si `xmlstarlet` est déjà installé sur votre système, lancez simplement `which xmlstarlet`. Si vous obtenez `xmlstarlet not found` comme réponse :

<Prerequisite
  name="xmlstarlet"
  install="sudo apt-get update && sudo apt-get -y install xmlstarlet"
  check="xmlstarlet --version"
  checkOutput={`\n1.6.1`}
  typewriter
/>

## À vous de jouer {#lets-play}

Pour reproduire les deux commandes ci-dessus sur votre machine, ouvrez un shell Linux et lancez `mkdir -p /tmp/xmlstarlet && cd $_`, puis créez un fichier `data.xml` avec le contenu affiché en haut de cet article.

## Comprendre l'expression XPath {#understanding-the-xpath-expression}

Une expression XPath n'est qu'un chemin dans l'arbre. Notre nœud racine s'appelle `bookstore`, ensuite nous avons un ou plusieurs `book` et chaque livre a un `title` :

<Snippet title="Comment notre XML est construit" source="./files/data.part3.xml" />

Parcourez ce chemin depuis la racine et vous obtenez tous les titres du fichier :

<Terminal typewriter source="./files/terminal-1.txt" />

L'expression utilisée au début de cet article, `//book[@category='children']/title`, en est la version filtrée : donne-moi chaque `book`, peu importe où le nœud se trouve (c'est le préfixe `//`), mais uniquement s'il possède un attribut nommé `category` dont la valeur est `children`. Puis, si trouvé, affiche son `title`.

## Conclusion {#conclusion}

Deux actions couvrent l'essentiel des besoins quotidiens : `format` pour rendre un fichier XML lisible par un humain, et `sel -t -v` avec une expression XPath pour en extraire exactement le nœud voulu. Les deux s'utilisent dans un pipe, donc les deux s'utilisent dans un script shell.

Consultez la [documentation officielle](https://xmlstar.sourceforge.net/docs.php) pour en apprendre plus sur xmlstarlet, et si votre prochain fichier est un `.json`, <Link to="/blog/linux-jq">l'utilitaire jq pour Linux</Link> raconte exactement la même histoire avec une syntaxe différente.
