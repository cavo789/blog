---
slug: laravel-telescope
title: Laravel Telescope
date: 2025-03-22
description: "Laravel Telescope est votre assistant de débogage ultime : il offre une vue en temps réel des queries, exceptions, du cache et des logs de votre application. Comprenez et corrigez les problèmes plus vite."
authors: [christophe]
image: /img/v2/laravel.webp
mainTag: laravel
tags:
  - laravel
  - php
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnkgebz3c2v
---
![Laravel Telescope](/img/v2/laravel.webp)

<TLDR>
Laravel Telescope est un élégant assistant de débogage pour vos applications Laravel. Cet article présente Telescope et explique comment il donne une vue claire, en temps réel, des rouages internes de votre application. De l'inspection des queries et des exceptions au suivi de l'utilisation du cache et des logs, Telescope vous donne le contexte nécessaire pour comprendre et résoudre les problèmes rapidement. C'est un outil indispensable en développement local comme pour surveiller une application sur un serveur de test, ce qui permet d'identifier et de corriger les problèmes de façon proactive.
</TLDR>

Je ne travaille pas si souvent avec Laravel (l'un des frameworks PHP les plus connus), du coup je perds un peu mes réflexes quand il s'agit de déboguer le code : par exemple retrouver les queries exécutées, les exceptions levées, la liste des clés créées ou lues depuis le cache Redis, etc.

En installant [Laravel Telescope](https://laravel.com/docs/master/telescope), on obtient des informations en temps réel sur le cache, les logs, les queries et les modèles, les exceptions, ... et cela aide énormément à comprendre comment l'application fonctionne et ce qui s'exécute.

Telescope est une aide précieuse pour déboguer et comprendre votre application, et il s'installe comme une dépendance de dev.

La dernière fois que j'ai développé une application Laravel et que je l'ai installée sur le serveur de test, j'ai pu suivre en temps réel ce que faisait mon utilisateur, voir les exceptions qu'il rencontrait et les corriger ... avant même qu'il ne me les signale.

Grâce à Telescope, non seulement j'avais une vue parfaite de ce qui était collecté, mais j'avais aussi tout le contexte : l'utilisateur n'a pas eu à me dire « Ça ne marche pas... » (sans le moindre détail) ; j'avais tout sous la main.

<!-- truncate -->

![Dashboard](./images/telescope-dashboard.webp)

Pour un modèle Eloquent par exemple, on retrouvera dans Telescope (l'URL par défaut est `http://your_site/telescope`) le SQL brut : facile à copier/coller et à exécuter directement dans <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">pgadmin</Link> par exemple.

Pour le cache Redis par exemple, on verra les clés et si elles ont été lues (`hits`) ou créées (`set`).

Laravel Telescope peut aussi être installé sur un serveur de test pour voir ce que fait l'utilisateur et obtenir tout le contexte de chaque requête. Ainsi, quand une exception est levée, on peut la retrouver dans le log, avec le message d'exception, les données POST, l'URL utilisée et bien plus encore.

Telescope représente une vraie avancée pour le débogage d'une application Laravel. Consultez la [documentation officielle](https://laravel.com/docs/master/telescope) pour apprendre à l'installer et à l'utiliser.

Deux autres articles Laravel sur ce blog : <Link to="/blog/laravel_events">Working with Laravel events</Link> — et il se trouve que Telescope vous montre chaque événement déclenché, ce qui en fait un excellent compagnon pendant l'apprentissage — et <Link to="/blog/laravel-filament">Laravel Filament</Link>.
