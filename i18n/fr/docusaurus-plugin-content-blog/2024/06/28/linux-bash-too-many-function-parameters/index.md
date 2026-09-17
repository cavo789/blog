---
slug: linux-bash-too-many-function-parameters
title: "Clean code - Linux Bash - Réduire au maximum le nombre de paramètres d'une fonction"
date: 2024-06-28
description: "Appliquez le Clean Code à vos scripts Linux Bash. Découvrez comment éviter d'avoir trop de paramètres de fonction grâce à une solution simple et robuste : le tableau associatif."
authors: [christophe]
image: /img/v2/bash.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - linux
language: fr
review_date: 2026-07-30
---
![Clean code - Linux Bash - Réduire au maximum le nombre de paramètres d'une fonction](/img/v2/bash.webp)

<TLDR>
Cet article applique à Bash le principe de clean code qui consiste à limiter le nombre de paramètres d'une fonction. En Bash, on ne peut pas passer un objet : on passe donc un seul tableau associatif (`declare -A arr=()`) à la fonction. L'appelant n'a plus à se soucier de l'ordre des arguments positionnels, et de nouveaux champs peuvent être ajoutés plus tard sans casser les appels existants.
</TLDR>

Un des concepts du clean code est d'éviter d'avoir trop de paramètres de fonction (je dirais que quatre paramètres, c'est déjà trop).

Quand vous programmez dans un langage plus évolué que Linux Bash, il est facile de contourner le problème. Par exemple, en PHP, si je dois appeler une fonction et lui passer plusieurs paramètres, je vais créer un objet qui sera mon seul paramètre et cet objet aura alors plusieurs propriétés.

Ainsi, par exemple, si je dois passer des données comme un nom, un prénom, une date de naissance, un genre, etc., je vais créer un objet `person`, définir mes propriétés et voilà, je n'ai plus qu'un seul paramètre à passer à ma fonction. Dans la plupart des cas, c'est une très bonne solution.

Mais comment faire en Linux Bash ? Impossible de passer un objet... je vais donc lui passer un tableau associatif.

<!-- truncate -->

L'astuce, pour un script Bash, est de définir un tableau associatif (créé avec la commande `declare -A arr=()`) et de passer ce tableau en paramètre à la fonction.

Voici un exemple :

<Snippet filename="curl.sh" source="./files/curl.sh" />

Un des gros avantages, c'est que vous n'avez plus à vous préoccuper de la position des arguments (ah oui, donc le premier paramètre c'est l'url, le deuxième la méthode HTTP, le troisième c'est, euh ? le proxy ? ah non, mince).

De nouveaux paramètres peuvent aussi être créés plus tard sans impacter les scripts existants.

Tout est beaucoup plus propre avec un tableau associatif, et plus robuste aussi.

Deux autres habitudes qui gardent une base de code Bash propre : <Link to="/blog/linux-sort-functions-in-script">trier vos fonctions</Link> pour les retrouver facilement, et <Link to="/blog/bats-unit-tests">les couvrir avec des tests unitaires bats</Link> pour qu'un refactoring comme celui-ci se fasse sans retenir votre souffle.
