---
slug: docker_uptime_kuma
title: Outil de monitoring auto-hébergé
date: 2023-12-05
description: Découvrez comment installer facilement Uptime Kuma, un outil de monitoring de sites web gratuit et auto-hébergé, avec une simple commande Docker. Suivez la disponibilité de vos sites, assurez la persistance des données et configurez les notifications.
authors: [christophe]
image: /img/v2/docker_playing_with_app.webp
series: Self-host your own services
mainTag: docker
tags:
  - docker
  - self-hosted
language: fr
updates:
  - date: 2026-07-30
    note: "Demo URL updated (old port-27000 URL is down); Uptime Kuma v2.0 released Oct 2025 — use louislam/uptime-kuma:2 for the new version (MariaDB support, Vue 3, rootless Docker)"
---
<!-- cspell:ignore kuma,louislam -->
![Outil de monitoring auto-hébergé](/img/v2/docker_playing_with_app.webp)

<TLDR>
Cet article montre comment auto-héberger Uptime Kuma, un dashboard gratuit de monitoring de sites web, avec une seule commande `docker run` (en montant un volume pour conserver les sites surveillés entre les redémarrages), puis comment configurer les vérifications site par site et les notifications (par exemple via Mattermost ou par email) quand un site tombe.
</TLDR>

Imaginez : vous êtes développeur web ou vous travaillez dans une agence web et vous aimeriez garder un œil, gratuitement, sur les sites que vous avez développés pour vos clients. Ces sites sont-ils en ligne en ce moment, ou sont-ils down ?

C'est le travail des plateformes de monitoring de sites. Pouvez-vous en installer une sur votre machine ? Bien sûr !

<!-- truncate -->

Il existe des tonnes d'*outils de monitoring auto-hébergés* ; l'un d'eux est [Uptime Kuma](https://github.com/louislam/uptime-kuma). Vous pouvez jouer avec le site de démonstration ici : [https://demo.kuma.pet/](https://demo.kuma.pet/). Créez simplement un compte admin (gratuitement) et vous êtes prêt à ajouter vos premiers sites.

Comme indiqué dans la [documentation officielle](https://github.com/louislam/uptime-kuma#-docker), vous pouvez le démarrer facilement avec la commande ci-dessous.

<Vars port="3001" name="uptime-kuma" labels={{ port: "Port de l'host", name: "Nom du container" }} />

<Terminal typewriter>
$ {`docker run -d --restart=always -p %%port=3001%%:3001 -v \${PWD}:/app/data --name %%name=uptime-kuma%% louislam/uptime-kuma:1`}
</Terminal>

<BrowserWindow url="http://localhost:%%port=3001%%">
  ![Dashboard](./images/dashboard.webp)
</BrowserWindow>

<AlertBox variant="info" title="N'oubliez pas d'ajouter un volume">
Le flag `-v ${PWD}:/app/data` (un <Link to="/blog/docker-volume">volume</Link>) est important si vous voulez conserver les sites que vous ajouterez au dashboard (c'est-à-dire si vous redémarrez l'outil). Si vous voulez juste jouer une fois avec l'interface, vous pouvez l'omettre : rien ne sera écrit sur le disque.

</AlertBox>

Dans la page des paramètres, site par site, vous pouvez définir de nombreuses actions, comme ce que l'outil de monitoring doit faire quand le site est down. Par exemple, vous envoyer une notification sur *Mattermost*, un email ou ...

![Notification via Mattermost](./images/notification.webp)

<AlertBox variant="info" title="Il y a tellement de paramètres à configurer">
En plus des éléments de configuration site par site, vous trouverez aussi dans la page *Profile -> Settings* un grand nombre de paramètres globaux, comme le choix de la langue de l'interface (le français est disponible).

</AlertBox>

Uptime Kuma surveille vos sites **depuis l'extérieur**. Pour ce qui se passe sur votre propre machine, <Link to="/blog/docker-healthy">Get health information from your running containers</Link> fait le même travail pour vos containers. Et une fois que vous auto-hébergez quelques outils de ce genre, <Link to="/blog/heimdall-dashboard">Heimdall</Link> est une chouette façon de les rassembler sur une seule page d'accueil.
