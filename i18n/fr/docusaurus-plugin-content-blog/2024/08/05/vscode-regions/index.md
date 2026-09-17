---
slug: vscode-regions
title: Travailler avec les regions dans VSCode
date: 2024-08-05
description: Maîtrisez le code folding dans VSCode avec les regions. Apprenez à les utiliser en PHP et à activer le support des regions pour les fichiers non pris en charge comme un Dockerfile, avec une simple extension.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - php
  - vscode
language: fr
review_date: 2026-07-30
---
![Travailler avec les regions dans VSCode](/img/v2/vscode_tips.webp)

<!-- cspell:ignore hadolint,skel,maptz,regionfolder,specialised -->

<TLDR>
Cet article montre comment utiliser les tags de folding `region`/`endregion` dans VSCode (par exemple en PHP) pour replier des blocs logiques de code, et comment ajouter ce même support de folding aux fichiers que VSCode ne gère pas nativement, comme un Dockerfile, grâce à l'extension `maptz.regionfolder` et à une entrée dans `.vscode/settings.json`. Il présente aussi l'extension `Auto Fold` pour replier automatiquement les regions à l'ouverture d'un fichier.
</TLDR>

VSCode prend en charge les tags `region` et `endregion`, mais pas partout. Ces deux tags spéciaux s'écrivent différemment selon le langage utilisé, mais ils ont toujours le même objectif : vous permettre de replier une partie du code.

« Pas partout » signifie, par exemple, que VSCode ne gère pas le code folding par défaut dans un Dockerfile. Voyons comment résoudre ça.

*Un fichier bien replié, c'est une chose ; un fichier bien organisé, c'en est une autre. Pour Bash, <Link to="/blog/linux-sort-functions-in-script">Linux - Sort functions in a Bash script</Link> vérifie que vos fonctions sont déclarées dans un ordre prévisible.*

<!-- truncate -->

## Les regions en action {#regions-in-action}

![VSCode - Regions folding](./images/regions.gif)

Voilà ce que vous apportent les tags `region`/`endregion` : des blocs logiques entiers se replient sur une seule ligne, et vous voyez la structure d'un fichier au lieu de le parcourir en scrollant.

## Code folding en PHP {#code-folding-in-php}

Prenons l'exemple suivant, très basique (*exemple très court, à but illustratif*) :

<Snippet filename="my_class.php" source="./files/my_class.php" />

On identifie clairement trois blocs : la préparation de la query, son exécution et le retour des données. Avec les regions, on peut faire ceci — les deux lignes montrées ci-dessus (`// #region`, `// #endregion`) sont ce qui produit le comportement de repli/dépli du gif :

<Snippet filename="my_class.php" source="./files/my_class.part2.php" />

<AlertBox variant="info" title="Évitez les fonctions de plus de 60 lignes">
Les regions sont prises en charge par un très grand nombre de langages, mais ne faites pas l'erreur de croire que ça vous autorise à écrire des fonctions de plusieurs dizaines de lignes. Ce n'est pas l'idée ! Si vous avez de longues fonctions, vous devez les découper. Vous devez créer des fonctions plus petites, plus spécialisées. Nous avons déjà abordé ce point dans un <Link to="/blog/vscode-php-refactoring">article précédent</Link>.

</AlertBox>

## Que faire quand VSCode ne gère pas ces tags par défaut ? {#what-to-do-when-vscode-didnt-support-these-tags-by-default}

Regardons le Dockerfile suivant :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Ouvrir un tel fichier dans VSCode n'offre aucune fonction de repli/dépli et il faudra scroller beaucoup. Et on n'a aucune vue d'ensemble de la structure.

![Pas de support des regions dans VSCode pour un Dockerfile](./images/dockerfile-before.webp)

La solution passe par l'installation d'une extension spécialisée : [https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder).

Et aussi par l'ajout de ces réglages dans votre fichier `.vscode/settings.json` :

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

Revenez à l'onglet de VSCode où votre Dockerfile est ouvert, pressez <kbd>CTRL</kbd>+<kbd>P</kbd> et lancez `Developer: Reload Window` pour recharger la fenêtre une fois l'extension activée, et tadaaa !

![Maintenant, VSCode gère les regions dans un Dockerfile](./images/dockerfile-after.webp)

<AlertBox variant="info" title="Non, ce n'est pas juste une astuce visuelle">
Quand vous travaillez sur des fichiers très longs comme, pour moi, un Dockerfile de plus de 900 lignes, il est vraiment indispensable de pouvoir disposer de regions à réduire/étendre.

Non seulement c'est plus facile à lire, mais ça facilite aussi l'enchaînement des « stages » (quand on programme un Dockerfile multistage).

</AlertBox>

## L'extension Auto fold {#auto-fold-extension}

Il existe des extensions comme [Auto Fold](https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah) qui repliient automatiquement les regions à l'ouverture d'un fichier.

L'idée est la suivante : quand vous ouvrez un fichier contenant beaucoup de méthodes, toutes les fonctions sont d'abord *repliées* (on ne voit que le nom de la fonction, pas son contenu). Vous voyez ainsi directement la structure du fichier, la liste des fonctions, etc., sans avoir à scroller beaucoup.

Si vous installez [Auto Fold](https://marketplace.visualstudio.com/items?itemName=bobmagicii.autofoldyeah), vous devez aussi ajouter le réglage `"autofold.default": 1,` dans votre fichier `settings.json`.

Si vous ne savez pas comment faire, pressez simplement <kbd>CTRL</kbd>+<kbd>,</kbd> (la virgule) pour afficher la page `Settings`, puis commencez à taper `autofold` pour accéder au réglage.

Désormais, si vous ouvrez un fichier, son contenu sera automatiquement replié.

![Autofold](./images/autofold.webp)

## Conclusion {#conclusion}

Deux tags, `// #region` et `// #endregion` (adaptés à la syntaxe de commentaire de votre langage), suffisent à replier n'importe quel bloc de code — nativement dans la plupart des langages, et facilement ajoutables à ceux que VSCode ne gère pas d'origine, comme un Dockerfile.
