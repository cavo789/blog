---
slug: laravel-filament
title: Laravel Filament
date: 2023-11-27
description: Découvrez Laravel Filament, une collection de superbes composants full-stack pour construire des interfaces d'administration avec la stack TALL. Une alternative gratuite à Laravel Nova.
authors: [christophe]
image: /img/v2/laravel.webp
mainTag: laravel
tags:
  - laravel
  - php
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-30
    note: "Expanded the article with a section on why Filament is worth adopting in a real project (rapid CRUD scaffolding, no separate frontend/API to maintain, Laravel-native authorization, plugin ecosystem) and a proper conclusion."
---
<!-- cspell:ignore ailwind,lpine,aravel,ivewire -->
![Laravel Filament](/img/v2/laravel.webp)

<TLDR>
Cet article présente Laravel Filament, un ensemble gratuit de composants full-stack basés sur la stack TALL (Tailwind, Alpine, Laravel, Livewire) pour construire rapidement des interfaces d'administration — une alternative gratuite au Laravel Nova payant — et explique pourquoi il vaut le coup dans un vrai projet : des écrans CRUD générés depuis une seule classe PHP, pas d'API ni de frontend séparé à maintenir, et une autorisation qui réutilise vos policies Laravel existantes.
</TLDR>

Filament est une *collection de superbes composants full-stack. Le point de départ parfait pour votre prochaine application.* C'est un ensemble de composants **gratuits** qui promet de nous permettre de construire rapidement de belles interfaces d'administration.

Le concurrent de Filament est l'officiel [Laravel Nova](https://nova.laravel.com/), un logiciel payant.

Filament est construit avec les technologies les plus récentes : la stack **TALL**. Cet acronyme résume les technologies utilisées : **T**ailwind, **A**lpine, **L**aravel et **L**ivewire.

<!-- truncate -->

Il existe aussi une [démo en ligne](https://demo.filamentphp.com/) pour voir rapidement les bénéfices de Filament si vous devez développer une interface de gestion avec Laravel.

<BrowserWindow url="http://localhost/">
  ![Filament Demo](./images/filament_demo.webp)
</BrowserWindow>

## Pourquoi s'embêter avec Filament dans un vrai projet {#why-bother-with-filament-in-a-real-project}

Tout projet Laravel finit par avoir besoin d'un *petit* back-office : un écran pour gérer les utilisateurs, éditer des produits, contrôler des commandes, modérer du contenu. Construire ça à la main — routes, contrôleurs, vues Blade, validation de formulaires, pagination, recherche — c'est le même boilerplate à chaque fois. C'est exactement le problème que Filament résout :

- **Du CRUD depuis une seule classe.** Une « Resource » Filament est une seule classe PHP qui décrit les champs de formulaire et les colonnes de tableau d'un modèle Eloquent ; les écrans de liste, création, édition et suppression en sont générés — pas de vues Blade écrites à la main dans le cas courant.
- **Pas de frontend ni d'API séparés à maintenir.** Comme il repose sur Livewire, le panneau d'administration est du PHP rendu côté serveur qui réagit comme une SPA. Pas d'application React/Vue, pas de couche REST ou GraphQL à exposer et à sécuriser juste pour qu'un panneau interne puisse accéder à vos données.
- **L'autorisation que vous avez déjà écrite.** Filament lit les [policies](https://laravel.com/docs/authorization) de Laravel pour décider qui peut voir, créer, modifier ou supprimer une ressource — pas de système de permissions parallèle à garder synchronisé avec le reste de l'application.
- **Des relations, pas juste des champs.** Les relations belongs-to, has-many et many-to-many disposent de widgets dédiés (select, repeater, tables pivot) d'office, et c'est en général la partie la plus longue à écrire à la main.
- **Un écosystème de plugins pour le reste.** Import/export, impersonation, permissions spatie, logs d'activité, multi-tenancy — la plupart de ce dont un back-office a besoin au-delà du CRUD basique existe déjà sous forme de [plugin communautaire](https://filamentphp.com/plugins), donc vous partez rarement d'une page blanche.
- **Gratuit**, contrairement à Laravel Nova, et activement maintenu — ce qui compte pour quelque chose que vous garderez probablement des années.

En bref : si l'alternative consiste à passer un sprint à construire un panneau d'administration interne de zéro, Filament vous y amène généralement en une après-midi, et vous rend ce temps pour les parties du projet qui font vraiment la différence.

Pour en savoir plus : [https://filamentphp.com/](https://filamentphp.com/) et [https://github.com/filamentphp/filament](https://github.com/filamentphp/filament)

## Conclusion {#conclusion}

Filament ne remplacera pas une interface client soigneusement conçue, mais pour l'outillage interne dont toute application Laravel finit par avoir besoin, il supprime l'essentiel du travail répétitif : pas de CRUD écrit à la main, pas d'API séparée juste pour alimenter un panneau d'administration, et une autorisation qui réutilise les policies que vous avez déjà. Avec la [démo en ligne](https://demo.filamentphp.com/), ça vaut le coup d'essayer la prochaine fois qu'un projet a besoin « juste d'un petit back-office rapide » — qui reste en général bien au-delà du « rapide ».

*Deux autres articles Laravel sur ce blog : <Link to="/blog/laravel_events">Working with Laravel events</Link> et <Link to="/blog/laravel-telescope">Laravel Telescope</Link>, inestimable pour voir ce qu'un panneau d'administration généré fait vraiment à votre base de données.*
