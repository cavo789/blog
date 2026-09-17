---
slug: cpanel-spam
title: "Exterminez-les tous : combattez le spam directement chez votre hébergeur"
date: 2024-01-23
description: "Stoppez le spam à la source ! Découvrez comment utiliser SpamAssassin de cPanel pour blacklister et whitelister des domaines, avec une méthode avancée : éditer directement le fichier user_prefs via FTP."
authors: [christophe]
image: /img/v2/fighting_against_spam.webp
mainTag: self-hosted
tags:
  - linux
  - self-hosted
language: fr
review_date: 2026-07-30
---
![Exterminez-les tous : combattez le spam directement chez votre hébergeur](/img/v2/fighting_against_spam.webp)

<TLDR>
Cet article montre comment combattre le spam à la source avec SpamAssassin de cPanel : définir des motifs de domaines en blacklist et en whitelist depuis l'interface web, ou éditer directement le fichier `.spamassassin/user_prefs` via FTP pour gérer les règles `blacklist_from`/`whitelist_from` en masse, triées et dédoublonnées.
</TLDR>

Si votre hébergeur web vous donne accès à cPanel, vous y trouverez un outil appelé *SpamAssassin*.

Là, vous avez deux options principales : le *Spam filter* et une *White list*.

Avec la première, vous pouvez définir des motifs d'adresses comme `*@hair.com`, ce qui signifie : tuer immédiatement ces emails sur le serveur. La seconde fait exactement l'inverse, par exemple `*@my-own-company.com` pour dire que vous faites confiance à ce domaine.

<AlertBox variant="info" title="PlanetHoster - N0C">
Si vous êtes hébergé chez PlanetHoster sur l'infrastructure N0C, lisez plutôt <Link to="/blog/planethoster-n0c-spam">Exterminate them all, fight spam directly at PlanetHoster - N0C</Link>.

</AlertBox>

<!-- truncate -->

Mon cas d'usage personnel : même si je n'aime pas les raccourcis sur mon bureau, j'en ai un pour `https://(my_host_company)/xxxxx/mail/spam/index.html#/blacklist`, c'est-à-dire un accès direct à la page où je peux ajouter mes filtres anti-spam. Et ça marche plutôt bien.

*Cliquer dans une interface web ne passe pas à l'échelle, cependant. <Link to="/blog/planethoster-n0c-spam-roundcube-action">Exterminate them all, kill spam using GitHub Actions</Link> génère les règles depuis une liste JSON et les déploie automatiquement.*

![Filtres anti-spam](./images/spam_filters.webp)

Mais saviez-vous qu'il existe une autre manière de faire ?

Avec votre client FTP, allez dans le répertoire home de votre utilisateur. Si votre hébergeur a activé SpamAssassin, vous verrez un dossier appelé `.spamassassin` et, dans ce dossier, un fichier appelé `user_prefs`. Ouvrez ce fichier.

Ce fichier peut ressembler à ceci :

<Snippet filename=".spamassassin/user_prefs" source="./files/user_prefs" />

Comme vous pouvez vous y attendre, vous y trouverez deux règles : `blacklist_from` et `whitelist_from`, avec les motifs que vous avez saisis dans l'interface web SpamAssassin de votre hébergeur :

<AlertBox variant="info" title="Emplacement des filtres anti-spam">
Vous pouvez aussi manipuler les entrées une par une depuis l'interface web. Allez dans votre cPanel, cherchez `Spam Filters` et cliquez sur `Additional Configurations (For Advanced Users)`.

</AlertBox>

Vous pouvez maintenant manipuler la liste avec par exemple VSCode : la trier par ordre alphabétique, simplifier les règles, supprimer les doublons (après refactoring), ...

J'aime vraiment combattre le spam directement chez mon hébergeur car, sinon, je reçois le spam sur toutes mes machines (mes différents ordinateurs et mon smartphone) et, sur mon smartphone, quand je clique sur *Ceci est un spam*, je n'apprends ça qu'à mon smartphone, pas à mes autres machines... Et je n'identifie que cet expéditeur-là (comme `<buy-it@hair.com>`) ; je continuerai à recevoir du spam depuis n'importe quelle autre adresse du type `really-but-it@hair.com`.

Le combat ne s'arrête pas là — la suite, <Link to="/blog/planethoster-n0c-spam">combattre le spam directement chez PlanetHoster - N0C</Link>.
