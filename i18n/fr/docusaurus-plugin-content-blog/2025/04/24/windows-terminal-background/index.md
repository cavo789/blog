---
slug: windows-terminal-background
title: Utiliser une image de fond dans votre console Windows Terminal
date: 2025-04-24
description: Personnalisez votre Windows Terminal ! Suivez ce guide simple, étape par étape, pour définir une belle image de fond dans votre console et abandonner le vieil écran noir barbant.
authors: [christophe]
image: /img/v2/windows_terminal_customization.webp
series: Windows Terminal
mainTag: windows-terminal
tags:
  - customization
  - windows
  - windows-terminal
  - wsl
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnjj5g4ic2v
---

![Utiliser une image de fond dans votre console Windows Terminal](/img/v2/windows_terminal_customization.webp)

<TLDR>
Fatigué de la console noire barbante ? Ce guide rapide vous montre comment personnaliser facilement votre Windows Terminal en définissant une image de fond. Quelques étapes simples pour naviguer dans les paramètres, choisir votre image préférée et ajuster son apparence afin de donner à votre terminal un look neuf et personnalisé.
</TLDR>

Quand on parle de la console MS DOS, tout le monde a en tête un écran noir très austère avec une police à largeur fixe. L'affichage était monochrome, blanc sur noir. Pas très sexy ni très excitant, avouons-le.

Heureusement, nous ne sommes plus dans les années 1980 ou 2000 et, depuis, même sous Windows, on peut faire tellement plus cooooool !

Voyons comment obtenir facilement ce genre de résultat :

![Ma console](./images/console.webp)

<!-- truncate -->

Voici le résultat :

![Sympa non ?](./images/full_image.webp)

J'utilise [Windows Terminal](https://apps.microsoft.com/detail/9n0dx20hk701), un outil gratuit signé Microsoft.

Je l'aime beaucoup parce que, comme dans un navigateur web, je peux travailler avec des onglets. Un des points les plus puissants : on peut l'utiliser pour l'ancien Command Prompt de Windows (MS DOS), pour Powershell, pour Linux (Ubuntu, Debian, ...), pour un <Link to="/blog/windows-terminal-ssh-profile">terminal SSH</Link> et bien plus encore. *L'article <Link to="/blog/windows-terminal">Windows Terminal</Link> couvre les profils et le `settings.json` de manière générale ; ici, on s'intéresse uniquement à l'apparence.*

Mais, pour cet article, concentrons-nous sur l'apparence du terminal.

D'abord, générons (avec <Link to="/blog/ai-image-generation">Recraft.ai</Link> par exemple) une jolie image ou rendez-vous sur [unsplash.com](https://unsplash.com/) si vous préférez réutiliser une image existante. Cliquez sur ce lien pour télécharger [l'image de fond de JackJack](./images/wallpaper.webp), le suricate.

Démarrez une instance de Windows Terminal et, comme illustré sur l'image ci-dessous, cliquez sur la flèche vers le bas et sélectionnez `Settings`.

![Accéder à la page des paramètres](./images/settings.webp)

Dans la partie gauche, sélectionnez le profil souhaité puis, à droite, descendez jusqu'à voir l'accordéon `Appearance` et cliquez dessus.

Descendez jusqu'à la zone de l'image de fond puis cliquez sur `Background image path`. Cliquez sur le bouton `Browse` et allez chercher votre image de fond bien geek.

Cliquez sur le bouton `Save` et voilà !

Vous pouvez aussi, bien sûr, garder deux onglets : un avec une console et le second avec la page Settings ouverte. Ainsi, en modifiant un paramètre comme `Background image -> Background image opacity` ou `Transparency -> Background opacity`, vous voyez les changements immédiatement dans votre premier onglet — le même résultat que celui montré en haut de cet article.

Voilà pour l'image de fond. Si vous voulez savoir comment j'ai obtenu le look&feel global, j'utilise Powerlevel 10k : lisez mon article précédent <Link to="/blog/powerlevel10k_sandbox">Personnalisez votre prompt Linux avec Powerlevel 10k</Link>.

Envie d'aller plus loin dans la personnalisation de Windows Terminal ? Voyez mes articles sur <Link to="/blog/windows-terminal-split-panes">le découpage de la fenêtre en plusieurs panneaux</Link> et <Link to="/blog/windows-terminal-ssh-profile">l'ajout d'un profil SSH en un clic</Link>.
