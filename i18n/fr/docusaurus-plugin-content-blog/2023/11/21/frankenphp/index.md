---
slug: frankenphp-docker-joomla
title: "FrankenPHP : un serveur d'applications moderne pour PHP"
date: 2023-11-21
description: Apprenez à mettre en place un site Joomla avec Docker et FrankenPHP, un serveur PHP moderne jusqu'à 3,5 fois plus rapide que PHP-FPM. Avec un compose.yaml tout simple.
authors: [christophe]
image: /img/v2/frankenphp.webp
series: Create your joomla website using Docker
mainTag: joomla
tags:
  - docker
  - joomla
  - php
language: fr
updates:
  - date: 2025-01-12
    note: "Docker image available on hub.docker.com"
  - date: 2026-07-30
    note: "FrankenPHP has reached stable v1.11+ and is production-ready; the 'fairly young for production' caveat in the body no longer applies."
---
![FrankenPHP](/img/v2/frankenphp.webp)

<!-- markdownlint-disable MD036 -->

<TLDR>
Cet article teste FrankenPHP, un serveur d'applications PHP moderne annoncé comme jusqu'à 3,5 fois plus rapide que PHP-FPM, en lançant une installation Joomla prête à l'emploi (signée Alexandre Elisé) via `docker compose pull && docker compose up`. On y voit la lente montée en route de la connexion MySQL au premier lancement, puis l'accès au site Joomla en HTTPS sur un port attribué dynamiquement.
</TLDR>

D'après [leur documentation](https://speakerdeck.com/dunglas/the-php-revolution-is-underway-frankenphp-1-dot-0-beta), [FrankenPHP](https://frankenphp.dev/) est 3,5 fois plus rapide que PHP FPM. Il a atteint une release stable depuis, et il vaut clairement la peine d'être testé en développement local.

Alors, à quoi ressemble un vrai site dessus ? Lançons une installation Joomla complète pour le découvrir.

<!-- truncate -->

## Ce que FrankenPHP vous apporte {#what-frankenphp-gives-you}

Un site Joomla complet, en https, servi par FrankenPHP, démarré en deux commandes :

<BrowserWindow url="https://localhost:54408">
  ![Joomla is now running on FrankenPHP](./images/frankenphp_joomla_homepage.webp)
</BrowserWindow>

Vous ne verrez peut-être pas de gain de vitesse spectaculaire sur votre machine puisque vous êtes le seul visiteur, mais c'est agréable de se dire qu'on surfe aussi vite en local.

Maintenant, la partie honnête du contrat, avant de vous lancer :

<AlertBox variant="highlyImportant" title="Aïe, c'est terriblement lent à démarrer">
Pour être honnête, avant de pouvoir voir la page d'accueil de mon Joomla en localhost, j'ai attendu plus de 15 minutes (la première fois). Je n'aurais jamais attendu aussi longtemps si je n'avais pas dû terminer ce chapitre.
</AlertBox>

## Pourquoi ça fonctionne {#why-it-works}

- FrankenPHP est un serveur d'applications PHP moderne construit sur le serveur web Caddy : un seul processus sert PHP *et* gère le https, au lieu du classique duo *« le serveur web parle à PHP-FPM »*.
- Comme il garde le runtime PHP vivant entre les requêtes, ses auteurs le mesurent jusqu'à 3,5 fois plus rapide que PHP-FPM.
- Vous n'avez rien à assembler : [Alexandre Elisé](https://github.com/alexandreelise) publie une image FrankenPHP + Joomla prête à l'emploi, donc toute la mise en place tient dans un fichier `compose.yaml` et un `docker compose up`.

## Le mettre en route {#getting-it-running}

<Vars port="80" labels={{ port: "Port HTTP de l'host" }} />

Je vous invite à jouer avec sur votre machine de développement (sauf si vous avez vos propres serveurs ; vous ne pourrez certainement pas utiliser FrankenPHP chez votre hébergeur).

Rendez-vous par exemple dans votre dossier `/tmp/joomla` et créez le fichier `compose.yaml` ci-dessous. La source du projet est [https://github.com/alexandreelise/frankenphp-joomla](https://github.com/alexandreelise/frankenphp-joomla) et le fichier readme `Getting Started` d'Alexandre couvre les autres façons de le lancer.

<AlertBox variant="info" title="Ne construisez pas l'image vous-même">
Ma suggestion est de remplacer le fichier `compose.yaml` par celui ci-dessous. Ainsi, vous réutiliserez l'image publiée par Alexandre et vous n'aurez pas besoin de la construire vous-même (beaucoup plus rapide) :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

</AlertBox>

En lançant `docker compose pull`, Docker va télécharger les deux images ; celle avec FrankenPHP et Joomla et celle pour MySQL. Selon la vitesse de votre connexion Internet, cela prendra quelques secondes ; uniquement la première fois.

Ensuite, il ne vous reste plus qu'à créer les containers basés sur les images en lançant `docker compose up`.

## Ce qui se passe pendant ces longues minutes {#what-happens-during-those-long-minutes}

Vous allez commencer à recevoir des messages de logs dans la console *(parce qu'ici, pour l'illustration, vous n'avez pas utilisé le flag `--detach`)* :

![Running FrankenPHP](./images/running_frankenphp.webp)

<AlertBox variant="highlyImportant" title="Patientez jusqu'à ce que MySQL soit prêt">
Vous devez maintenant attendre **quelques minutes** avant que la connexion à la base de données ne soit prête. Vous aurez l'impression que l'installation échoue à cause des nombreuses lignes `[ERROR] Connection refused`, mais patientez.
</AlertBox>

La raison est que Joomla va essayer de se connecter à MySQL alors que le container MySQL n'est pas prêt à accepter les connexions. Vous verrez donc défiler beaucoup de `[ERROR] Connection refused`. Restez patient et, après un moment, vous obtiendrez ceci :

![Joomla has been installed](./images/frankenphp_joomla_installed.webp)

<AlertBox variant="note" title="Les logs peuvent différer dans votre version">
Selon la version des images Docker utilisées, des scripts et de la version de Joomla, les lignes de logs peuvent varier dans le temps.

</AlertBox>

Quand tout s'est bien déroulé, rendez-vous simplement sur `https://localhost:443` pour voir votre site Joomla tourner sur FrankenPHP. Pour accéder à la page d'administration, allez sur `https://localhost:443/administrator`. Les identifiants à utiliser se retrouvent dans les logs, comme indiqué par la flèche rouge sur l'image ci-dessus. Vous pouvez aussi les récupérer avec cette commande : `docker compose logs | grep -i "Here are your Joomla credentials:"`.

<AlertBox variant="note" title="FrankenPHP utilise SSL et donc https">
Notez que FrankenPHP sert votre site en `https`. Vu la façon dont Alexandre a construit son script, le numéro de port n'est pas fixe. Pour déterminer quel port utiliser, ouvrez une nouvelle console Linux et lancez `docker container list` pour obtenir la liste des containers en cours d'exécution. Vous verrez le port à utiliser pour accéder à votre site FrankenPHP dans la colonne `PORTS`. C'est aussi affiché dans l'application Windows `Docker Desktop` ; allez dans la liste des containers pour obtenir le port.

</AlertBox>

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

Ces lignes `Connection refused` ne sont pas un problème FrankenPHP : c'est l'erreur classique du *« mon container est démarré, donc mon service est prêt »*. Un container démarré n'est pas une base de données qui accepte les connexions, et rien dans `docker compose up` ne fait la différence.

*C'est exactement le problème que les healthchecks résolvent ; <Link to="/blog/docker-healthy">Get health information from your running containers</Link> montre comment savoir si un container est vraiment prêt, et pas seulement démarré.*

## Conclusion {#conclusion}

Pour une machine de développement locale, FrankenPHP vaut le détour : une seule image, du https directement, et un runtime PHP qui reste chaud entre les requêtes. Le prix à payer, c'est un premier démarrage qui prend un bon quart d'heure ; après ça, `docker compose up` est instantané.

Si vous préférez avoir un site Joomla qui tourne tout de suite avec la stack classique Apache + PHP-FPM, <Link to="/blog/docker-joomla-right-to-the-point">Start Joomla with Docker in just a few clicks</Link> vous y amène en deux minutes.
