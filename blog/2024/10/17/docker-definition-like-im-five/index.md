---
slug: docker-definition-like-im-five 
title: Docker - Explain me like I'm five 
authors: [christophe] 
image: /img/docker_tips_social_media.jpg 
tags: [devcontainer, docker, python] 
enableComments: true
draft: true 
---
![Docker - Explain me like I'm five](/img/docker_tips_banner.jpg)

Mais au fait, c'est quoi Docker? En termes les plus simples possibles, comment expliquer à quoi sert Docker?

## Analogie culinaire

Imaginons un instant devoir faire une recette de cuisine.  Je suis celui qui écrit la recette et vous êtes ceux (vous êtes nombreux; très nombreux) qui doivent refaire la même chose et, pour sûr, que votre gâteau soit aussi excellent que le mien.

J'écris donc la recette sur un bout de papier: il faut autant de grammes de ceci; autant de cela. Il faut aller acheter ça (beaucoup de choses) et impérativement telle variété (des fraises belges de Wépion pour sûr et pas d'Espagne), etc.

Vous recevez une liste très longue de ma part et vous devez, c'est une obligation totale, avoir les mêmes ingrédients que moi.

Dans ma recette, je vous dis ce qu'il faut d'abord préparer, puis ce qu'il faut incorporer; à quel moment précis et en quelle quantité précise. Je vous demande de cuire à autant de degrés et, parfois ce sera au four, mais pas toujours, quelquefois ce sera à la poêle.

Voilà; à vous de jouer.

Vous serez 95% au moins à ne pas réussir; bien évidemment.  Parce que vous n'avez pas le temps d'aller tout acheter; parce que vous n'aurez pas les bonnes quantités ou qualités (fraises belges n'est-ce pas?), parce que vous n'aurez pas le temps de courir dans différents magasins ...

Parce que vous n'aurez pas tout lu non plus; que vous n'avez pas le four ultra moderne que j'utilise dans ma recette, parce que vous n'avez pas fait attention à la température ni à la durée ...

Parce que vous avez mis le double de sucre; au mauvais moment.

Votre gâteau ne sera pas le même que le mien.

## Revenons dans le monde informatique

Ma liste d'ingrédients devient une liste de spécifications (il faut telle version de l'operating system), il faut avoir telles versions de (une liste de dépendances); il faut que tel logiciel soit configuré de telle manière pour que la communication puisse se faire avec tel autre logiciel (p.ex. Joomla devant communiquer avec MySQL); il faut bien évidemment que les droits d'accès aux fichiers soient corrects ...

Ici encore, malgré une liste de spécifications parfaitement rédigées, vous serez encore plus de 80% à ne pas réussir à faire mon gâteau.

Dans le monde logiciel, on pourrait alors dire "Ok, pas de souci, je mets tout ça sur une clef USB". Au lieu de vous envoyer une recette, je vous envoie à tous une clef USB. Cela pourrait peut-être résoudre le problème non ?

Bah non parce que comment peut-on faire tourner Linux, Joomla, MySQL et plein d'autres choses encore sur une seule clef USB?

## ... et à Docker

Docker vient simplifier tout cela. C'est un peu comme une machine virtuelle, mais pas vraiment.

On pourrait tenter de dire que Docker c'est un peu comme "Je télétravaille, je suis à la maison et je me connecte à distance sur un ordinateur chez mon employeur"; c'est presque ça, mais c'est surtout faux.

Docker va "virtualiser" un nouvel operating system: si mon PC tourne sur Windows, je peux, grâce à Docker, exécuter une machine Linux sur mon PC (virtualisation), mais; c'est toujours bien mon PC: si depuis Linux je dois accéder à des fichiers, ce sont ceux de mon ordinateur. Si je dois utiliser une webcam, c'est celle de mon PC. Si je veux écouter de la musique, c'est bien avec ma carte son.  

Il s'agit de mon ordinateur, mais un environnement un peu spécial: une image Docker qui tourne en mémoire vive (RAM).

Mais qu'est-ce qu'une image ? Mais c'est mon gâteau !!! J'ai non seulement écrit la recette de mon gâteau, mais surtout, je vous donne mon gâteau (=une image Docker).  Je vous la mets à disposition et vous n'avez qu'à la récupérer (`docker pull`) et à l'utiliser (`docker run`).

Vous utilisez mon image tous autant que vous êtes. Que vous soyez un, dix, mille, un million, tout le monde aura strictement la même image que moi et elle sera prête à l'emploi. Vous n'aurez rien, vraiment rien à faire d'autre que de l'utiliser.  Je mettrais à jour mon image (une nouvelle recette, encore meilleure); vous la récupérez (`docker pull` de la nouvelle version) et voilà, c'est tout bon.

Votre intérêt? Aucun ingrédient à acheter, ni à préparer, ni à cuisiner. Juste quelques secondes pour vous le temps de télécharger l'image et vous passez déjà à table.

## ... et à un exemple tel que Joomla

Vous avez compris: si quelqu'un (moi ou n'importe quoi) crée une image Docker pour faire tourner Joomla; vous n'avez qu'à récupérer l'image; attendre quelques secondes et vous êtes prêts à l'utiliser. Il suffit, pour vous de lancer quelques commandes (`docker run` ou `docker compose` selon la documentation officielle de l'image) et cela fonctionne.

Pour Joomla, l'image officielle est ici: [https://hub.docker.com/_/joomla](https://hub.docker.com/_/joomla). Le mode d'emploi est expliqué dans le chapitre "How to use this image".

## Encore quelques informations

Une image Docker s'exécute en mémoire RAM donc, si j'éteins l'ordinateur, je perds tout. Ce n'est pas tout à fait vrai parce que Docker a un mécanisme de conservation des informations dans des "volumes".

Mais, il est tout à fait exact de penser que: puisque mon image tourne en RAM, je peux donc installer un MySQL 5.x et un vieux PHP 7.x ainsi qu'un Joomla 3.x et, pourquoi pas, avoir un deuxième site Joomla qui lui serait sur MySQL 5.4, PHP 8.1 et Joomla 4.4.8 et ... un troisième site avec PHP 8.4 et Joomla 5.2. Et c'est parfaitement correct parce que tout est isolé. Il n'y aura aucun conflit de versions puisque chacun sera dans "son espace".

Aujourd'hui, fin 2024, il est presque possible de tout faire tourner dans Docker; Linux évidemment, mais aussi [Windows](https://hub.docker.com/r/dockurr/windows) ou [macOS](https://hub.docker.com/r/dockurr/macos).

Vous pouvez aussi jouer à [Doom](https://github.com/CallumHoughton18/Doom-In-Docker), travailler sous [Gimp](https://hub.docker.com/r/gimp/gimp/), utiliser [Firefox](https://hub.docker.com/r/linuxserver/firefox) sans avoir à l'installer ...

À titre personnel, j'utilise Docker chaque jour pour développer ([Linux bash](https://hub.docker.com/_/alpine), [Python](https://hub.docker.com/_/python), [PHP](https://hub.docker.com/_/php), [Node](https://hub.docker.com/search?q=node), ...), pour mes bases de données ([postgres](https://hub.docker.com/_/postgres), [MySQL](https://hub.docker.com/_/mysql) et même pour le fun [Microsoft SQL Server](https://localhost:3000/blog/docker-mssql-server)), pour tenir mon blog ([Docusaurus](https://localhost:3000/blog/docusaurus-docker-own-blog)), ...

Je n'installe plus rien sur mes machines si ce n'est Docker.