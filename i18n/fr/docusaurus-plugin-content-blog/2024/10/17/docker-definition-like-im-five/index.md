---
slug: docker-definition-like-im-five
title: Docker - Explique-moi comme si j'avais cinq ans - À quoi sert Docker ?
date: 2024-10-17
description: "Qu'est-ce que Docker ? On utilise une analogie avec une recette de cuisine pour donner une définition simple, façon « explique-moi comme si j'avais cinq ans », des images et des containers Docker."
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - devcontainer
  - docker
  - python
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore Wépion,telework -->

![Docker - Explique-moi comme si j'avais cinq ans : à quoi sert Docker ?](/img/v2/docker_tips.webp)

<TLDR>
Cet article explique Docker à un public non technique avec une analogie de recette de cuisine : plutôt que de tendre à quelqu'un une liste fragile d'ingrédients et d'instructions (spécifications techniques et dépendances) qui reproduit rarement le même résultat, une image Docker c'est le gâteau fini, prêt à consommer — `docker pull` le récupère, `docker run` le sert, et tout le monde obtient exactement le même résultat, isolé de ce qui est installé par ailleurs sur la machine.
</TLDR>

Mais c'est quoi Docker au fond ? Avec les mots les plus simples possibles, comment expliquer à quoi sert Docker ?

Prenons le cas d'une recette de cuisine comme point de départ.

<!-- truncate -->

## Analogie culinaire {#culinary-analogy}

Imaginons un instant que vous deviez écrire une recette. C'est moi qui écris la recette et c'est vous (vous êtes très, très nombreux) qui devez refaire la même chose et, à coup sûr, votre gâteau sera aussi beau et aussi bon que le mien. Exactement comme le mien, jusqu'à la dernière miette.

J'écris donc la recette sur une feuille de papier : il vous faut tant de grammes de ceci ; tant de grammes de cela. Vous devez aller acheter tout ça (une liste d'ingrédients à donner le vertige) et vous devez acheter certaines variétés (par exemple des [fraises de Wépion](https://en.wikipedia.org/wiki/W%C3%A9pion_strawberry) belges et pas, évidemment, celles produites industriellement et bourrées de pesticides), et ainsi de suite.

Vous recevez de moi une très longue liste et vous devez, absolument, avoir les mêmes ingrédients que moi.

Dans ma recette, je vous dis quoi préparer en premier, puis quoi ajouter ; à quel moment précis et en quelle quantité précise. Je vous demande de cuire au même nombre de degrés, parfois au four, avec ou sans chaleur tournante, parfois à la poêle.

Voilà ; à vous de jouer.

![Recette culinaire](./images/culinary_recipe.webp)

Bien sûr, 95 % d'entre vous vont échouer (**moi aussi**). Parce que vous n'avez pas le temps d'aller tout acheter ; parce que vous n'avez pas les bonnes quantités ou les bonnes qualités (des fraises belges, hein ?) ; parce que vous n'avez pas le temps de courir de magasin en magasin.

## Revenons au monde de l'informatique {#lets-go-back-to-the-it-world}

Ma liste d'ingrédients devient une liste de spécifications techniques (il vous faut telle version du système d'exploitation), il vous faut telles versions d'une liste délirante de dépendances ; il faut que tel logiciel soit configuré de telle manière pour pouvoir communiquer avec tel autre logiciel (par exemple Joomla doit communiquer avec MySQL sur tel port) ; il vous faut évidemment les bons droits d'accès aux fichiers, il vous faut...

Là encore, malgré une liste de spécifications parfaitement écrite, plus de 95 % d'entre vous n'arriveront pas à faire mon gâteau (**moi aussi**). Et pourtant j'ai pris beaucoup de temps pour vous donner une recette exhaustive.

Dans le monde du logiciel, vous pourriez dire *OK, pas de souci, mets-moi tout ça sur une clé USB*. Au lieu de vous envoyer une recette, je vous envoie à tous une clé USB. Peut-être que ça règlerait le problème, non ?

![Clé USB](./images/usb.webp)

Eh bien non, mis à part le fait que ça va me coûter très cher et que ce n'est vraiment pas pratique, comment faire tourner Linux, Joomla, MySQL et plein d'autres choses sur une simple clé USB ? Avoir un bouton quelque part qui dit « Démarrer le programme » et la magie de ce bouton fait que, par exemple, Joomla tourne et que je peux accéder à mon site local.

## ... et Docker {#-and-docker}

Docker simplifie tout. C'est un peu comme une machine virtuelle, mais pas vraiment.

Vous pourriez essayer de dire que Docker c'est un peu *je télétravaille, je suis chez moi et je me connecte à distance à un ordinateur chez mon employeur* ; c'est presque ça, mais c'est très différent.

![Télétravail](./images/telework.webp)

C'est presque la même chose, mais c'est tellement différent. Sur votre ordinateur à la maison, vous n'avez pas les logiciels professionnels que vous utilisez, vous n'avez pas votre messagerie professionnelle, etc. La comparaison (retrouver des logiciels et des applications que vous utilisez chez vous) est très différente. Mais la comparaison (retrouver des logiciels et des configurations que vous n'avez pas sur votre PC) s'arrête là.

Docker va *virtualiser* un nouveau système d'exploitation sur votre ordinateur (que ce soit Linux, macOS ou Windows) : grâce à Docker, vous allez pouvoir faire tourner un Linux (Debian, Ubuntu 24.04, etc.) sur votre ordinateur Windows : si vous avez besoin d'accéder à des fichiers depuis Linux, ce seront ceux de votre ordinateur (contrairement à l'exemple ci-dessus avec votre PC professionnel). Si vous avez besoin d'utiliser une webcam, ce sera celle de votre PC, votre webcam, votre carte son, votre imprimante, etc.

![Concept de virtualisation](./images/virtualization.webp)

C'est votre ordinateur, mais dans un environnement un peu spécial : une image Docker qui tourne en RAM.

Mais qu'est-ce qu'une **image Docker** ? C'est mon gâteau ! Non seulement j'ai écrit la recette de mon gâteau, mais surtout, je vous le donne (sous forme d'image Docker). Je l'ai mise à disposition sur internet et il vous suffit de la récupérer (`docker pull`) et de l'utiliser (`docker run`).

*Prêt à y goûter pour de vrai ? <Link to="/blog/install-docker">Install Docker and play with PHP</Link> est la toute première étape, et <Link to="/blog/docker-volume">Share data between your running Docker container and your computer</Link> est la deuxième — parce qu'un gâteau qu'on ne peut pas sortir du four ne sert pas à grand-chose.*

Vous pouvez tous utiliser mon image. Que vous soyez un, dix, mille, un million, tout le monde aura exactement la même image que moi et elle sera prête à l'emploi. Vous n'aurez rien à faire, vraiment rien, à part l'utiliser. Je mettrai mon image à jour (une nouvelle recette, encore meilleure) ; vous la récupérez (docker pull de la nouvelle version) et c'est tout.

Qu'est-ce que vous y gagnez ? Aucun ingrédient à acheter, préparer ou cuire. Juste quelques secondes pour télécharger l'image et vous pouvez manger.

Qu'est-ce qu'on y gagne ? Tout le monde a exactement le même environnement ; si ça marche chez moi, ça marchera chez vous. Comme tout est préconfiguré, le programme qui tourne dans un environnement Docker tournera de la même façon pour tout le monde.

![It works on my machine](./images/it_works_on_my_machine.webp)

## ... et avec un exemple comme Joomla {#-and-to-an-example-such-as-joomla}

Vous avez compris : si quelqu'un (moi ou n'importe qui) crée une image Docker pour faire tourner Joomla ; il vous suffit de récupérer l'image ; d'attendre quelques secondes et vous êtes prêt à l'utiliser. Il ne reste qu'à lancer quelques commandes (`docker run` ou `docker compose` selon la documentation officielle de l'image) et c'est parti.

Pour Joomla, l'image officielle est ici : [https://hub.docker.com/_/joomla](https://hub.docker.com/_/joomla). Les instructions sont expliquées dans le chapitre « How to use this image ».

![Joomla en cours d'exécution](./images/running_joomla.webp)

## Quelques informations en plus {#some-more-information}

Une image Docker tourne en mémoire RAM, donc si j'éteins l'ordinateur, je perds tout. Ce n'est pas tout à fait vrai parce que Docker a un mécanisme pour stocker les informations dans des « volumes ». Si je rallume mon ordinateur, je retrouverai tout (= selon la configuration programmée).

Avec Docker, tout est isolé : je peux installer un MySQL 5.x et un vieux PHP 7.x ainsi qu'un Joomla 3.x et, pourquoi pas, avoir un deuxième site Joomla qui serait sur MySQL 5.4, PHP 8.1 et Joomla 4.4.8 et... un troisième site qui serait un WordPress et ainsi de suite. Il n'y aura aucun conflit entre versions parce que chacun sera dans « son propre espace ». Pensez juste à la misère d'avoir à installer différentes versions de PHP sur votre ordinateur... Ce n'est plus le cas avec Docker, qui rend ça super simple.

Aujourd'hui, fin 2024, il est presque possible de tout faire tourner dans Docker ; Linux bien sûr, mais aussi [Windows](https://hub.docker.com/r/dockurr/windows) ou [macOS](https://hub.docker.com/r/dockurr/macos).

Vous pouvez aussi jouer à [Doom](https://github.com/CallumHoughton18/Doom-In-Docker), travailler avec [Gimp](https://hub.docker.com/r/gimp/gimp/), utiliser [Firefox](https://hub.docker.com/r/linuxserver/firefox) sans avoir à l'installer...

Personnellement, j'utilise Docker tous les jours pour développer ([Linux bash](https://hub.docker.com/_/alpine), [Python](https://hub.docker.com/_/python), [PHP](https://hub.docker.com/_/php), [Node](https://hub.docker.com/search?q=node), ...), pour mes bases de données ([postgres](https://hub.docker.com/_/postgres), [MySQL](https://hub.docker.com/_/mysql) et même, pour le fun, [Microsoft SQL Server](/blog/docker-mssql-server)), pour maintenir mon blog ([Docusaurus](/blog/docusaurus-docker-own-blog)), ...

Je n'installe plus rien sur mes machines à part Docker.

![Au revoir](./images/goodbye.webp)
