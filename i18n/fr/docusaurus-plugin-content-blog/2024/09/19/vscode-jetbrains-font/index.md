---
slug: vscode-jetbrains-font
title: Utiliser la police JetBrains Mono dans vscode
date: 2024-09-19
description: Améliorez votre expérience de code ! Apprenez à installer la police JetBrains Mono, gratuite et très lisible, et à activer de superbes ligatures dans VSCode grâce à ce guide de configuration rapide.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - customization
  - vscode
language: fr
review_date: 2026-07-30
---
![Utiliser la police JetBrains Mono dans vscode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article montre comment installer la police gratuite JetBrains Mono (qui distingue clairement O/0 et I/l, et gère les ligatures de code) et comment configurer VSCode pour l'utiliser via les paramètres `editor.fontFamily` et `editor.fontLigatures` dans `settings.json`.
</TLDR>

Comme vous le savez, VSCode est très personnalisable : vous pouvez installer <Link to="/blog/vscode-export-list-of-extensions">une multitude d'extensions</Link>, changer le thème par défaut et utiliser la police de votre choix.

*La même police, installée en variante Nerd Font, est ce qui permet aux icônes de <Link to="/blog/powerlevel10k_sandbox">Powerlevel10k</Link> et de <Link to="/blog/linux-eza">eza</Link> de s'afficher correctement dans votre terminal — ça vaut donc la peine de la configurer aussi dans <Link to="/blog/windows-terminal">Windows Terminal</Link>.*

Jetez donc un œil à la police **JetBrains Mono**. C'est une police gratuite, pour un usage commercial comme non commercial.

<!-- truncate -->

## Pourquoi cette police {#why-this-font}

- Elle est gratuite, pour un usage commercial comme non commercial.
- Elle est particulièrement lisible : un O (la lettre) et un 0 (le chiffre), un I (i majuscule) et un l (L minuscule) sont clairement distincts — plus besoin de devineriez dans un terminal ou un diff.
- Elle propose de belles ligatures : les séquences comme `!=`, `=>` ou `->` sont affichées comme un seul glyphe, plus propre, au lieu de caractères séparés.

Rendez-vous sur [https://www.jetbrains.com/lp/mono/](https://www.jetbrains.com/lp/mono/) pour voir le potentiel de cette police.

## Installer la police JetBrains Mono {#install-jetbrains-mono-font}

C'est simple : allez sur [https://www.jetbrains.com/lp/mono/#how-to-install](https://www.jetbrains.com/lp/mono/#how-to-install) et cliquez sur le bouton `Download font`.

Une fois le téléchargement terminé, allez dans votre dossier de téléchargements, décompressez le fichier puis entrez dans le dossier `JetBrainsMono` qui vient d'être créé et allez dans `fonts/ttf`. Vous y trouverez plusieurs sous-dossiers. Sous Windows, ouvrez simplement le premier dossier, sélectionnez tous les fichiers et faites un clic droit. Dans le menu contextuel, choisissez `Install` comme ci-dessous :

![Installer la police JetBrains Mono](./images/install_font.webp)

## Configurer VSCode pour utiliser la police JetBrains Mono {#configure-vscode-to-use-jetbrains-mono-font}

- Appuyez sur <kbd>CTRL</kbd>+<kbd>,</kbd> pour ouvrir la page des paramètres
- Dans la section `Text Editor --> Font`, saisissez `JetBrains Mono` comme famille de police.

Mais la méthode la plus simple est celle-ci :

- Appuyez sur <kbd>CTRL</kbd>+<kbd>,</kbd> pour ouvrir la page des paramètres
- En haut à droite de l'écran, repérez le bouton `Open Settings (JSON)` et cliquez dessus

![Ouvrir settings.json](./images/open_settings_json.webp)

- Puis copiez-collez ces entrées :

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

Enregistrez, fermez VSCode et rouvrez-le (ou appuyez simplement sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> et lancez `Developer: Reload Window`)

## Conclusion {#conclusion}

Installez la police une fois au niveau du système, ajoutez deux lignes à `settings.json`, et chaque
onglet de l'éditeur profite dès lors de formes de caractères plus claires et des ligatures.
Maintenant que votre éditeur a l'allure que vous voulez, <Link to="/blog/vscode-codesnap">CodeSnap</Link>
vous permet de transformer n'importe quelle sélection en capture d'écran partageable qui met en
valeur cette police.
