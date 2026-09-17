---
slug: docker-html-site
title: Lancer un site HTML en quelques secondes avec Docker
date: 2024-08-09
description: Lancez n'importe quel site web statique en quelques secondes avec UNE seule commande Docker. Évitez le casse-tête de l'installation et de la configuration d'Apache ou Nginx pour un setup local rapide.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - windows
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lzxdp44mw223
---
<!-- cspell:ignore easyphp,wamp,pffffiou,htdocs,lzxdp -->

![Lancer un site HTML en quelques secondes avec Docker](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre la façon la plus rapide de servir un site HTML statique en local : pas besoin d'installer Apache/Nginx, une seule commande — `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine` — lancée depuis le dossier du site, puis rendez-vous sur `http://localhost:8080`.
</TLDR>

Imaginez la situation suivante : vous avez un site HTML sur votre ordinateur et vous aimeriez le lancer. Mais comment ? Faut-il installer Apache ou Nginx ? Oui, il le faudrait... ou alors lancer exactement **UNE COMMANDE** pour démarrer Docker.

Il y a quelques années, pour ouvrir un site en local, il fallait installer par exemple EasyPhp ou Wamp, configurer un tas de choses, redémarrer l'ordinateur, s'assurer qu'EasyPhp ou Wamp tournait bien en arrière-plan et... pffffiou.

Cette époque est heureusement révolue, définitivement.

<!-- truncate -->

Pour changer, cet article utilisera PowerShell, mais j'aurais évidemment pu utiliser DOS ou Linux. Jouons donc avec PowerShell.

## Résultat {#result}

Une seule commande, lancée depuis le dossier qui contient votre site statique : `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine`.

Une fois fait, démarrez votre navigateur préféré et surfez sur `http://localhost:8080`. Bingo !

<BrowserWindow url="http://localhost:8080">
  ![Votre site web local](./images/localhost.webp)
</BrowserWindow>

Vous avez un site parfaitement fonctionnel. Dingue, non ?

## Pourquoi ça marche {#why-it-works}

- L'image `httpd:alpine` monte le dossier courant (`-v .:/usr/local/apache2/htdocs/`) comme docroot d'Apache : tout le HTML déjà présent sur votre disque est servi immédiatement.
- Docker télécharge Apache pour vous la première fois ; rien à installer, à configurer ou à laisser tourner en arrière-plan.

*Deux suites naturelles : votre site est servi par un vrai Apache, donc chaque directive de <Link to="/blog/apache-htaccess">Apache .htaccess file</Link> fonctionne ici ; et si vos pages ne sont pas du HTML pur mais du PHP, utilisez plutôt <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link>.*

## Pas encore de site sous la main pour tester ? {#dont-have-a-site-to-try-this-on-yet}

Pour l'illustration, je vais télécharger un site statique gratuit depuis [https://github.com/toidicode/template](https://github.com/toidicode/template). Jetez un œil aux démos et [téléchargez simplement un ZIP](https://github.com/toidicode/template?tab=readme-ov-file#demo-and-download).

Je vais me placer dans mon dossier `C:\temp` et télécharger le zip. Pour cela, j'exécute la commande suivante : `curl https://github.com/toidicode/template/raw/master/src/100-cookingschool.zip -o demo.zip` (oui, curl est aussi disponible pour PowerShell).

L'étape suivante consiste à décompresser le fichier. Je peux évidemment le faire avec l'explorateur Windows mais je suis un gars de la console, alors lançons `Expand-Archive demo.zip -DestinationPath demo`.

Ok, nous avons maintenant un dossier `demo` contenant un site statique. Entrons dedans : `cd demo`, puis lancez la commande ci-dessus dans ce dossier.

## Conclusion {#conclusion}

Un `docker run`, aucune installation d'Apache/Nginx, aucun fichier de configuration à toucher : voilà toute la
recette. Pointez-la vers n'importe quel dossier de HTML statique et il est servi en quelques secondes — jetez le container
avec `docker rm -f static-site` quand vous avez terminé et votre disque est exactement dans l'état d'origine.
