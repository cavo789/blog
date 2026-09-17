---
slug: github-retrieve-email
title: GitHub - Comment trouver l'adresse email de la plupart des utilisateurs
date: 2024-02-18
description: Trouvez rapidement l'adresse email d'un utilisateur GitHub. Découvrez trois méthodes efficaces avec un outil web, l'API publique ou en inspectant un commit grâce à l'astuce .patch.
authors: [christophe]
image: /img/v2/github_tips.webp
mainTag: github
tags:
  - github
  - linux
language: fr
review_date: 2026-07-30
---
![GitHub - Comment trouver l'adresse email de la plupart des utilisateurs](/img/v2/github_tips.webp)

<TLDR>
Cet article montre trois façons de trouver l'adresse email d'un utilisateur GitHub quand elle n'est pas publique sur son profil : avec l'outil web [emailaddress.github.io](https://emailaddress.github.io/), en interrogeant l'API des événements publics via `api.github.com/users/xxxxxx/events/public`, ou en ajoutant `.patch` à l'URL d'un commit pour révéler l'email de son auteur — sachant que cela ne fonctionne que si l'utilisateur n'a pas rendu son email privé.
</TLDR>

Vous aimeriez contacter un utilisateur GitHub mais, par exemple, vous ne voulez pas poser votre question sous forme d'issue parce que, par exemple, elle ne concerne pas un repository précis mais reste générique.

Du coup, le problème se résume à *comment trouver l'adresse email liée à un compte GitHub*.

Récemment, j'ai eu ce besoin pour contacter quelqu'un dont le blog [Docusaurus](https://docusaurus.io/) proposait une fonctionnalité que je n'arrivais pas à trouver documentée sur le web. Son blog n'était pas sur GitHub, mais ses autres repos l'étaient.

<AlertBox variant="note" title="Il n'est pas toujours possible de récupérer l'email associé.">
En effet, GitHub propose, entre autres, une option pour rendre l'email privé dans la page des paramètres utilisateur.

</AlertBox>

<!-- truncate -->

## Via une interface web {#using-web-interface}

Un tel outil existe sur le web, comme [https://emailaddress.github.io/](https://emailaddress.github.io/). Il suffit d'y copier/coller le nom et, peut-être, le système renverra les emails utilisés associés à ce compte.

## Via une URL paramétrée {#using-parametrized-url}

GitHub fournit, dans son API publique, la liste des événements publics d'un utilisateur donné.

Vous pouvez récupérer l'email avec l'URL suivante : `https://api.github.com/users/xxxxxx/events/public`. Remplacez simplement `xxxxxx` par le nom d'utilisateur GitHub dont vous voulez l'email. La réponse est un tableau JSON — passez-la dans <Link to="/blog/linux-jq">jq</Link> pour filtrer les champs `author.email` et garder une sortie lisible.

## À partir d'un dernier commit {#based-on-a-last-commit}

La première chose à faire, évidemment, c'est d'aller sur un repository public maintenu par cette personne et de trouver un commit, n'importe lequel en fait, qu'elle a réalisé.

Sur la page principale du repo, repérez par exemple l'ID du dernier commit qu'elle a fait :

![Last commit ID](./images/find_any_commit.webp)

Cliquez sur l'ID et vous arrivez sur une nouvelle page web avec une URL du type `https://github.com/<USERNAME>/<REPONAME>/commit/<LONG_COMMIT_ID>`. Modifiez l'URL et ajoutez-y simplement le suffixe `.patch` (l'URL devient donc `https://github.com/<USERNAME>/<REPONAME>/commit/<LONG_COMMIT_ID>.patch`).

Avant l'ajout du suffixe, voici à quoi ressemblait la page :

![Before adding the suffix](./images/before.webp)

Et une fois ajouté :

![Once the .patch suffix has been added](./images/after.webp)

Comme vous le voyez, l'adresse email associée au compte GitHub utilisé pour envoyer le commit est maintenant affichée.

<AlertBox variant="tip" title="Le revers de la médaille">
Ça fonctionne parce que vos propres commits portent aussi votre email. Si vous préférez ne pas publier votre adresse professionnelle sur vos projets perso, <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link> montre comment utiliser une identité différente par dossier.
</AlertBox>
