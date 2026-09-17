---
slug: vscode-github-dev
title: Démarrer vscode depuis github.com
date: 2023-11-27
description: "Saviez-vous que vous pouvez ouvrir VSCode pour n'importe quel repository GitHub instantanément ? Découvrez le raccourci secret : appuyez simplement sur la touche point (.). Commencez à coder en ligne dès maintenant !"
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - github
  - vscode
language: fr
review_date: 2026-07-30
---
![Démarrer vscode depuis github.com](/img/v2/vscode_tips.webp)

<TLDR>
Cet article partage une astuce rapide : appuyer sur la touche <kbd>.</kbd> sur n'importe quelle page de repository GitHub (ou remplacer `.com` par `.dev` dans l'URL) ouvre ce repository dans VSCode en ligne (vscode.dev/github.dev) — pratique pour faire une petite modification ou corriger une faute de frappe depuis un téléphone ou une machine sans clone local.
</TLDR>

Ce n'est pas nouveau, mais ce n'est probablement pas assez connu : en parcourant **n'importe quel** repository GitHub comme par exemple [https://github.com/cavo789/blog](https://github.com/cavo789/blog), il suffit d'appuyer sur <kbd>.</kbd> (la touche point) de votre clavier pour lancer VS Code en ligne et voir le repository courant dans vscode.dev.

<!-- truncate -->

Voici le blog dans vscode.dev : [https://github.dev/cavo789/blog](https://github.dev/cavo789/blog).

*C'est la plus légère des trois façons de coder sans VSCode local. Les deux autres : <Link to="/blog/vscode-code-server">un VSCode complet dans votre navigateur via Docker</Link> et <Link to="/blog/vscode-remote-ssh">SSH Remote development with VSCode</Link>.*

<AlertBox variant="info" title="Changez l'extension de domaine en github.dev">
Vous pouvez obtenir le même résultat en modifiant l'URL et en remplaçant l'extension `.com` par `.dev`

</AlertBox>

## Mais à quoi ça sert ? Pourquoi en aurais-je besoin {#but-whats-the-point-why-would-i-need-it}

Imaginez que vous n'êtes pas chez vous, sur votre propre ordinateur, et que vous voulez modifier votre repository ?

Ou encore que vous êtes dans un bus/train/avion et que vous voulez corriger une faute de frappe que vous venez de repérer.

Vous pouvez aussi vouloir faire une toute petite mise à jour, comme modifier votre fichier readme.md. C'est vraiment plus rapide de le faire en ligne que de devoir cloner/mettre à jour le projet sur votre ordinateur, faire la modification, puis add/commit/push.

Cette astuce est toutefois limitée aux repositories GitHub. Si vous avez besoin d'un vrai éditeur complet sur une machine où VSCode n'est pas installé, lancez-le plutôt comme un container : <Link to="/blog/vscode-code-server">Do I need VSCode on my machine to use it?</Link>.

![Utiliser un smartphone](./images/smartphone_view.webp)

Rendez-vous simplement sur votre repository avec votre smartphone, rien de plus qu'un navigateur web basique, changez l'extension en `.dev` et bingo, vous pouvez commencer à éditer votre repository (ou celui de quelqu'un d'autre si vous voulez proposer une Pull request (alias une `PR`)).

Pour en savoir plus : [https://github.com/github/dev](https://github.com/github/dev) ou [https://docs.github.com/en/codespaces/the-githubdev-web-based-editor](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor).
