---
slug: linux-diff-file-folder
title: "Linux : comparer deux dossiers/fichiers dans la console"
date: 2024-07-19
description: Comparez efficacement deux fichiers ou des dossiers entiers sous Linux avec la commande diff. Des scripts bash avancés pour une comparaison à l'échelle industrielle.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
---
![Linux : comparer deux dossiers/fichiers dans la console](/img/v2/bash.webp)

<TLDR>
Cet article partage des snippets réutilisables basés sur `diff` pour comparer deux fichiers ou deux dossiers entiers depuis la console. On va plus loin que le simple `diff file1 file2` / `diff folder1 folder2` pour permettre des comparaisons répétées et scriptées — avec une variante qui masque le bruit du « only in source » lors de la comparaison d'arborescences.
</TLDR>

Nativement, Linux dispose d'un outil en ligne de commande appelé `diff` pour comparer deux dossiers ou fichiers. Comparer deux dossiers est plutôt simple : `diff folder_1 folder2`. Et ce n'est pas plus compliqué pour deux fichiers : `diff file_1 file2`.

Par contre, dès que vous voulez faire ça de façon un peu plus industrialisée (lancer un très grand nombre de comparaisons pour confronter deux versions d'un même projet, par exemple), quelques flags et snippets deviennent bien pratiques.

*Deux cas particuliers sont traités ailleurs sur ce blog : <Link to="/blog/compare-env-files-cli">Compare environment files in the Linux console</Link>, où l'ordre et les commentaires doivent être ignorés, et <Link to="/blog/linux-compare-two-versions-of-the-same-script">Linux - Compare two versions of the same script</Link>.*

<!-- truncate -->

## Comparer deux fichiers {#compare-two-files}

Compare deux fichiers et n'affiche que les différences. Copiez/collez simplement le code ci-dessous dans votre console et adaptez les trois variables des trois premières lignes.

L'exemple ci-dessous va vérifier un fichier donné (`string.sh`) présent à la fois dans le dossier `src` et dans `./../another_project/src`.

<AlertBox variant="info">
Vous pouvez réutiliser ce snippet pour n'importe quel fichier (le langage n'a pas d'importance).

</AlertBox>

<Snippet filename="script.sh" source="./files/script.sh" />

## Comparer deux dossiers {#compare-two-folders}

Compare deux dossiers et affiche la liste des fichiers présents dans un seul des deux dossiers ou pour lesquels il y a une différence.

<Snippet filename="script.sh" source="./files/script.part2.sh" />

Cette variante permet de masquer le message `Only in .`, c'est-à-dire quand un fichier est présent dans le premier dossier (celui de `SOURCE`) et pas dans le second (celui de `COMPARE_WITH`).

*La sortie brute de `diff` n'est pas ce qu'il y a de plus lisible sur terre. Si les fichiers que vous comparez se trouvent dans un repository git, <Link to="/blog/git-delta">delta: a Syntax-Highlighted Pager for git diff</Link> rend la même information bien plus agréable à lire.*

<Snippet filename="script.sh" source="./files/script.part3.sh" />
