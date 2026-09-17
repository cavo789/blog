---
slug: laravel_events
title: Travailler avec les events Laravel
date: 2023-11-23
description: Découvrez la puissance des events Laravel pour un code propre et découplé. Ce guide donne un exemple pratique, étape par étape, de création et de dispatch d'un event avec son listener.
authors: [christophe]
image: /img/v2/laravel.webp
mainTag: laravel
tags:
  - laravel
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Removed link to cavo789/event_thephpleague_learning (GitHub repository no longer exists)."
---
![Travailler avec les events Laravel](/img/v2/laravel.webp)

<TLDR>
Cet article montre comment utiliser le système d'events/listeners de Laravel pour garder un code découplé : un `SampleEvent` transporte un objet `Employee`, un `SampleListener` (enregistré dans `EventServiceProvider`) y réagit et met à jour le nom de l'employé. Retirez le listener et le flux de base continue de fonctionner — c'est toute l'idée : les events permettent à une fonctionnalité future de se brancher sur du code existant sans le modifier. Un exemple en PHP pur avec `League\Event` est également mentionné.
</TLDR>

Quand j'ai commencé à développer pour le <Link to="/blog/docker-joomla-right-to-the-point">Joomla CMS</Link> (c'était il y a 15 ans, en 2009), l'une des choses que j'ai le plus appréciées était la notion d'events.

Par exemple *Un article est sur le point d'être publié*, *Un article a été publié*, *Un utilisateur s'est enregistré* : ce sont des actions annoncées par le CMS et auxquelles vous pouvez réagir.

Quand *Un article est sur le point d'être affiché* est généré, vous pouvez avoir un (ou plusieurs) morceaux de code qui interagissent avec cet event. Vous pouvez ajouter du contenu dynamique, vous pouvez aussi empêcher l'affichage de l'article si certaines conditions ne sont pas remplies.

<!-- truncate -->

## Ce qu'un event vous apporte concrètement {#what-an-event-actually-buys-you}

Voici une route Laravel qui crée un employé et affiche son nom. Un listener est branché sur l'event qu'elle déclenche :

<Terminal typewriter source="./files/terminal-2.txt" />

Maintenant exactement la même route, avec ce listener commenté. Même URL, même code appelant, pas une ligne changée dans le controller :

<Terminal typewriter source="./files/terminal-1.txt" />

L'employé retrouve son nom par défaut, et rien n'a planté. C'est toute la promesse des events : une fonctionnalité peut être ajoutée ou retirée sans que le code qui déclenche l'event en sache quoi que ce soit.

## Pourquoi ça fonctionne {#why-it-works}

1. La route crée un nouvel `employee` basé sur la classe `Employee`, puis déclenche un `SampleEvent` qui transporte cet objet.
2. Tout listener enregistré reçoit l'event et, à travers lui, ce même objet employé ; il peut le modifier.
3. La route affiche ensuite le prénom et le nom de l'employé, sans jamais savoir si un listener a fait quelque chose ou non.

<AlertBox variant="info" title="En fait, vous ne savez jamais">
Vous ne savez jamais, parce que votre logiciel aura sa propre vie, parce qu'au fil des années d'autres fonctionnalités seront ajoutées et d'autres développeurs le modifieront. Si vous travaillez avec des events, il sera très facile pour n'importe qui d'ajouter du code du type « OK, quand un nouvel utilisateur s'enregistre, je dois... » ; quelque chose que vous ne pouviez pas prévoir. Les events sont idéaux pour simplifier l'ajout de nouvelles fonctionnalités.

</AlertBox>

## La mise en place {#building-it}

Quatre petits fichiers et une ligne de câblage. Suivons le flux, en commençant par le point d'entrée.

Pour notre exemple, votre `routes/web.php` peut ressembler à ceci :

<Snippet filename="routes/web.php" source="./files/web.php" defaultOpen={false} />

Cette classe va initialiser notre employé et fournir un setter et un getter. Par défaut, notre employé s'appellera `John Doe (cavo789)`.

<Snippet filename="app/Employee.php" source="./files/Employee.php" defaultOpen={false} />

Notre event va recevoir un employé et le stocker dans une propriété privée :

<Snippet filename="app/Events/SampleEvent.php" source="./files/SampleEvent.php" defaultOpen={false} />

La logique de notre listener. `SampleListener` va recevoir le `SampleEvent` en paramètre et, donc, a accès à toutes ses méthodes publiques. Nous allons ici mettre à jour le prénom et le nom, mais pas le pseudo :

<Snippet filename="app/Listeners/SampleListener.php" source="./files/SampleListener.php" defaultOpen={true} />

Et enfin le câblage, c'est-à-dire le fichier qui dit à Laravel quel listener répond à quel event :

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.php" defaultOpen={false} />

Pour reproduire le second terminal montré en haut de cet article, commentez le listener dans ce fichier :

<Snippet filename="app/Providers/EventServiceProvider.php" source="./files/EventServiceProvider.part2.php" defaultOpen={false} />

## Sous le capot (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

Les trois setters de l'event sont publics volontairement : c'est la seule raison pour laquelle un listener, qui vit dans un fichier totalement différent, a le droit de mettre à jour le prénom et le nom.

Le pseudo, lui, est seulement initialisé et jamais mis à jour par le listener ; c'est la partie de l'objet qui reste sous le contrôle du code qui a déclenché l'event. Décider ce qu'un listener peut toucher ou pas, c'est exactement le travail de conception qu'une classe d'event vous demande.

## La même idée en dehors de Laravel {#the-same-idea-outside-laravel}

Les events ne sont pas une invention de Laravel. En PHP pur, la librairie `League\Event` ([https://event.thephpleague.com/](https://event.thephpleague.com/)) vous donne le même couple dispatcher/listener, sans aucun framework.

## Conclusion {#conclusion}

Tout se résume aux deux sorties de terminal du début : une fonctionnalité a été retirée et le code appelant ne s'en est pas aperçu. Écrivez des events même dans votre propre code, même quand vous êtes sûr de savoir quoi en faire, parce que dans deux ans, quelqu'un (probablement vous) voudra y brancher quelque chose.

*Les events sont, par nature, invisibles : ils sont déclenchés quelque part et quelque chose se passe ailleurs. <Link to="/blog/laravel-telescope">Laravel Telescope</Link> les rend à nouveau visibles, ce qui aide vraiment pour déboguer une application découplée comme celle-ci.*

<AlertBox variant="note">
Ceci est, en partie, une copie d'un article que j'ai publié précédemment sur [https://dev.to/cavo789/working-with-laravel-events-2i6m](https://dev.to/cavo789/working-with-laravel-events-2i6m)

</AlertBox>
