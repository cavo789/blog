---
slug: install-docker
title: Installer Docker et jouer avec PHP
date: 2023-11-03
description: Installez Docker et lancez PHP avec Apache instantanément grâce aux containers. Apprenez à passer facilement d'une version de PHP à l'autre (comme 7.4 et 8.1) sans conflits locaux pénibles.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: php
tags:
  - docker
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Updated PHP examples from php:8.3-apache (EOL Dec 2022) to php:8.3-apache and php:8.4-apache (EOL Nov 2024) to php:8.4-apache."
---
<!-- cspell:ignore wamp -->
![Installer Docker et jouer avec PHP](/img/v2/docker_tips.webp)

<TLDR>
Cet article de démarrage installe Docker Desktop et fait tourner un site PHP+Apache sans aucune installation locale de PHP/Apache : `docker run --detach --name step_1_1a -p 80:80 php:8.3-apache`, puis création d'un `index.php` dans le container via `docker exec`. Il montre à quel point il est trivial de changer de version de PHP (par exemple vers `php:8.4-apache` sur un autre port) comparé à la jonglerie des versions avec EasyPHP ou WAMP.
</TLDR>

Docker peut être installé gratuitement pour un usage personnel ou à petite échelle : [https://www.docker.com/products/personal/](https://www.docker.com/products/docker-desktop/).

Vous pouvez l'installer sur Linux, Mac ou Windows.

Sous Windows, le plus simple est d'utiliser [Docker Desktop](https://www.docker.com/products/docker-desktop/).

<!-- truncate -->

## Une commande, un serveur PHP fonctionnel {#one-command-a-working-php-server}

<Vars
  name_a="step_1_1a"
  port_a="80"
  name_b="step_1_1b"
  port_b="801"
  labels={{ name_a: "Container PHP 8.3", port_a: "Port PHP 8.3", name_b: "Container PHP 8.4", port_b: "Port PHP 8.4" }}
/>

Ouvrez une nouvelle console (DOS, Powershell ou Linux) et lancez ceci :

<Terminal typewriter>
$ docker run --detach --name %%name_a=step_1_1a%% -p %%port_a=80%%:80 php:8.3-apache
</Terminal>

Déposez-y un fichier `index.php` qui appelle `phpinfo()` (nous verrons comment plus bas), rendez-vous sur <Code>http://127.0.0.1:<Var name="port_a">80</Var></Code>, et voilà un serveur PHP 8.3 qui répond sur votre machine :

<BrowserWindow url="http://127.0.0.1:%%port_a=80%%/">
  <img
    alt="phpinfo - PHP 8.3"
    src={require("./images/phpinfo_8_3.webp").default}
  />
</BrowserWindow>

Apache tourne, PHP tourne, et aucun des deux n'a été installé sur votre ordinateur.

## Pourquoi les images Docker {#why-docker-images}

- Les images sont la plupart du temps du plug-and-play : une fois téléchargées, elles sont prêtes à l'emploi. Vous ajouterez sans doute quelques éléments de configuration mais, le plus souvent, ce n'est même pas nécessaire.
- Sur [Docker Hub](https://hub.docker.com), vous trouverez un nombre énorme d'images pour faire tourner PHP, PHP+Apache, MySQL et bien d'autres encore ; toutes complètement gratuites, publiques ou privées, et vous pouvez publier les vôtres. Si le concept même de Docker reste flou pour vous, <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five</Link> est une bonne introduction en douceur.
- À l'ancienne, avant de faire tourner une page web en local, vous installiez d'abord un serveur web (Apache par exemple) et l'interpréteur PHP, puis vous vous battiez pour changer leurs versions. Ici, la version est un mot dans une ligne de commande.

Dans cet article, nous utiliserons les images PHP disponibles sur [https://hub.docker.com/_/php](https://hub.docker.com/_/php)

## La mise en place {#setting-it-up}

Sous Windows, le plus simple est d'utiliser [Docker Desktop](https://www.docker.com/products/docker-desktop/). Une fois installé, la commande montrée plus haut suffit ; la première fois, Docker téléchargera PHP `8.3` (Apache inclus) puis, une fois le téléchargement terminé, démarrera l'image.

<AlertBox variant="info">
Lors des exécutions suivantes, l'image PHP est déjà présente : elle n'est donc plus téléchargée. Et les commandes utilisées dans cette étape seront les mêmes que vous soyez sous Linux, Mac ou Windows.

</AlertBox>

Explication des arguments utilisés dans notre commande <Code>docker run --detach --name <Var name="name_a">step_1_1a</Var> -p <Var name="port_a">80</Var>:80 php:8.3-apache</Code>

- `--detach` : par défaut, `docker run` exécute le container et le ferme dès que le travail est terminé. Si l'image était un antivirus, `docker run` lancerait un scan et fermerait le container une fois le scan terminé. Ici, nous voulons que notre site reste « à l'écoute »,
- `--name` <Var name="name_a">step_1_1a</Var> : par simplicité, donnons un nom à notre container. C'est une pratique recommandée pour identifier clairement les containers,
- <Code>-p <Var name="port_a">80</Var>:80</Code> : notre image PHP+Apache tourne sur le port `80`, nous voulons donc mapper ce port « interne » vers le port <Var name="port_a">80</Var> de notre ordinateur. Cela nous permet d'accéder au site web.
- `php:8.3-apache` : le nom de l'image utilisée. Nous demandons php+apache, version 8.3.

![Le container PHP tourne](./images/php_container_is_running.webp)

On voit que l'image PHP est maintenant présente dans Docker Desktop, et qu'une application (un `container` en langage Docker) tourne. On obtient aussi ces deux informations en ligne de commande, avec `docker image list` et `docker container list`.

### Créer notre script PHP {#creating-our-php-script}

Avec l'instruction ci-dessous, nous pouvons lancer une console Linux et afficher le contenu de l'image *comme si* c'était un dossier de notre disque dur :

<Terminal typewriter>
$ docker exec -it %%name_a=step_1_1a%% /bin/bash
</Terminal>

Une fois dans la console, créons rapidement un fichier `index.php` et quittons la console ; nous n'en aurons plus besoin.

<Terminal typewriter>
$ echo "\<\?php" > index.php
$ echo "phpinfo();" >> index.php
$ exit
</Terminal>

Retour au navigateur et... Bingo ! Notre première instance Docker qui exécute un script PHP, c'est-à-dire la capture montrée au début de cet article.

## Changer de version de PHP en un mot {#changing-the-php-version-in-one-word}

Avez-vous déjà essayé de changer votre version de PHP avec EasyPHP, WAMP ou un autre logiciel : c'est une vraie galère ! Avec Docker, vous changez un mot.

En allant sur la page [https://hub.docker.com/_/php?tab=tags](https://hub.docker.com/_/php?tab=tags) et en cherchant les images `-apache`, vous trouverez toutes les versions publiées. Remplaçons `8.3` par `8.4` et, par exemple, utilisons un autre port (nous prendrons `801` cette fois).

<Terminal typewriter>
$ docker run --detach --name %%name_b=step_1_1b%% -p %%port_b=801%%:80 php:8.4-apache
</Terminal>

<Terminal typewriter>
$ docker exec -it %%name_b=step_1_1b%% /bin/bash
</Terminal>

<Terminal typewriter>
$ echo "\<\?php" > index.php
$ echo "phpinfo();" >> index.php
$ exit
</Terminal>

<BrowserWindow url="http://127.0.0.1:%%port_b=801%%/">
  <img
    alt="phpinfo - PHP 8.4"
    src={require("./images/phpinfo_8_4.webp").default}
  />
</BrowserWindow>

***Aucun mal de tête et zéro conflit !*** Nous avons installé une nouvelle version de PHP en quelques secondes, et les deux versions tournent côte à côte, chacune sur son port.

<AlertBox variant="info">
C'est juste dingue. Pensez aux bénéfices : vous développez un script PHP et voulez vérifier s'il fonctionne avec différentes versions de PHP. C'est un jeu d'enfant.

</AlertBox>

## Sous le capot (sautez ceci si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

Avant la création du fichier `index.php`, le site répond, mais avec une page *Forbidden* :

<BrowserWindow url="http://127.0.0.1:%%port_a=80%%/">
  ![localhost-is-forbidden](./images/localhost_is_forbidden.webp)
</BrowserWindow>

Ça fonctionne dans le sens où *quelque chose écoute et a répondu*, mais rien ne s'affiche puisque nous n'avons encore rien mis en place : Apache est prêt, il n'y a simplement pas encore de fichier `index.php`. C'est toute la différence entre « le container tourne » et « le site fonctionne ».

<AlertBox variant="note">
Dans ce chapitre, à mesure que nous découvrons Docker, nous avons utilisé des numéros de port différents à chaque fois pour accéder à notre site local (<Var name="port_a">80</Var> puis <Var name="port_b">801</Var>). C'est uniquement pour garder les deux containers en vie en même temps ; deux containers ne peuvent pas publier le même port sur votre machine.

</AlertBox>

Notez aussi que l'`index.php` que nous avons créé vit **à l'intérieur** du container : supprimez le container et le fichier part avec lui. C'est l'étape suivante.

## Conclusion {#conclusion}

<StepsCard
  title="À la fin de ce chapitre, nous venons d'apprendre :"
  variant="remember"
  steps={[
    "comment utiliser Docker,",
    "définir la version de PHP que nous voulons utiliser,",
    "comment nommer nos containers,",
    "définir des ports différents pour des containers différents."
  ]}
/>

Passons maintenant au niveau supérieur et synchronisons les fichiers de notre disque dur avec le container : <Link to="/blog/docker-volume">Share data between your running Docker container and your computer</Link>, pour que votre code reste sur votre disque au lieu d'être dans le container, puis <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link>, qui combine les deux en une seule commande.

Cette même approche « zéro installation locale » fonctionne pour à peu près n'importe quel langage — je l'ai depuis appliquée à <Link to="/blog/docker-python">Python</Link>, <Link to="/blog/docker-pascal">Pascal</Link>, <Link to="/blog/docker-assembly">Assembly</Link> et <Link to="/blog/docker-java">Java</Link>.
