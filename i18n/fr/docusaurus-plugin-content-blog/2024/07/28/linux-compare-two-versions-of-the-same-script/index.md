---
slug: linux-compare-two-versions-of-the-same-script
title: Linux - Comparer deux versions du même script
date: 2024-07-28
description: Utilisez une astuce simple en ligne de commande Linux avec diff, grep et awk pour comparer deux versions du même script Bash. Identifiez rapidement les fonctions manquantes ou nouvelles entre deux versions d'un fichier ou entre deux dossiers entiers.
authors: [christophe]
image: /img/v2/bash.webp
series: Writing better Bash scripts
mainTag: linux
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
---
![Linux - Comparer deux versions du même script](/img/v2/bash.webp)

<TLDR>
Cet article montre comment comparer deux versions du même script Bash : on extrait les noms de fonctions de chaque fichier avec `grep`/`awk`, on les trie, puis on compare les deux listes triées avec `diff --side-by-side`. On voit ainsi quelles fonctions ont été ajoutées, supprimées ou renommées, quel que soit leur ordre dans le fichier. L'astuce est ensuite étendue en un script `compare.sh` qui applique la même comparaison à tous les scripts de deux dossiers.
</TLDR>

Toujours confronté au problème de devoir comparer deux versions du même script (voir l'article <Link to="/blog/linux-diff-file-folder">Linux - Comparing two folders/files in the console</Link>), cette fois nous allons considérer que le fichier à comparer est un script Bash et que nous en avons deux versions.

Et que nous avons peut-être fait évoluer les deux fichiers différemment, c'est-à-dire que l'un, l'autre, ou même les deux, ont pu être modifiés.

L'objectif est donc de comparer les versions et de mettre en évidence les différences.

<!-- truncate -->

## Résultat {#result}

<Terminal typewriter source="./files/terminal-1.txt" />

![Comparer les deux versions du même script Bash et voir quelles fonctions sont dans l'un et pas dans l'autre](./images/compare_functions.webp)

Deux listes de fonctions triées, côte à côte : tout ce qui n'apparaît que d'un seul côté est une fonction que l'autre version n'a pas — peu importe où elle était déclarée dans le fichier.

## Créer quelques fichiers pour cet article {#create-some-files-for-this-blog-post}

Pour pouvoir reproduire les exemples utilisés dans cet article, si besoin, créez deux fichiers.

Disons `/tmp/bash/console.sh` pour le premier fichier, avec ce contenu :

<Snippet filename="/tmp/bash/console.sh" source="./files/console.sh" />

Et, pour `/tmp/bash/console_v2.sh`, nous ajoutons deux nouvelles fonctions, `printGreen` et `printBlue`, dans cet ordre :

<Snippet filename="/tmp/bash/console_v2.sh" source="./files/console_v2.sh" />

## Obtenir la liste des fonctions d'un script Bash {#get-the-list-of-functions-in-a-bash-script}

Pour obtenir la liste des fonctions déclarées dans un script (disons `/tmp/bash/console.sh`), il suffit de lancer la commande ci-dessous :

<Terminal typewriter>
$ {`grep -P "^(function\s+.*)\(\)" "/tmp/bash/console.sh" | awk '{print \$2}' | sort`}
</Terminal>

Cette commande récupère toutes les fonctions du fichier, c'est-à-dire les lignes commençant par le mot `function` suivi d'un caractère d'espacement, puis du nom de la fonction, puis de parenthèses. Et, pour finir, elle trie la liste :

![Obtenir la liste des fonctions d'un script Bash](./images/functions_list.webp)

## Comparer les deux versions du même script Bash et voir quelles fonctions sont dans l'un et pas dans l'autre {#compare-the-two-versions-of-the-same-bash-script-and-shows-which-functions-are-in-one-and-not-the-other}

Peu importe l'ordre dans lequel les fonctions sont déclarées : le script ci-dessous, que vous pouvez copier-coller dans la console, va récupérer la liste des fonctions des deux fichiers, trier la liste et comparer quelles fonctions sont dans une version et absentes de l'autre — c'est la commande et le résultat affichés en haut de cet article, où l'on voit immédiatement que le second fichier compte deux ajouts.

Bien sûr, si nous ajoutons une nouvelle fonction dans `console.sh` et que nous en supprimons une existante, par exemple, nous le voyons aussi :

![Comparer les deux versions du même script Bash et voir quelles fonctions diffèrent entre les deux fichiers](./images/compare_functions_both_side.webp)

Sur l'image ci-dessus, on voit trois indicateurs au milieu de l'écran :

```diff
                                      > console::printBlue()
console::printPurple()                | console::printGreen()
console::verbose()                    | console::printRed()
```

La ligne avec l'indicateur `>` signifie que `console::printBlue()` n'a été trouvée que dans le second fichier : notre premier fichier ne déclarait donc pas `printBlue`.

Et les lignes avec l'indicateur `|` signalent une divergence. Des deux côtés, nous avions trié notre liste : si la même fonction avait été présente des deux côtés, nous aurions eu une correspondance. Ce n'est pas le cas ici. D'un côté nous avons par exemple `printPurple` alors que de l'autre nous avons `printGreen`. Et nous avons `verbose` et, de l'autre côté, `printRed`. On peut en conclure que, dans le premier fichier, nous n'avons pas `printGreen` ni `printRed` et que nous n'avons pas `printPurple` ni `verbose` dans le second.

En ajoutant `printBlue`, `printGreen` et `printRed` dans notre premier fichier, on obtient maintenant :

![Comparer les deux versions du même script Bash et voir quelles fonctions diffèrent entre les deux fichiers](./images/compare_functions_both_side_bis.webp)

On voit donc apparaître un nouvel indicateur `<` : la fonction n'a été trouvée que dans le premier fichier et pas dans le second. Une fois de plus, nous avons la confirmation que nous avons deux nouvelles fonctions (`printPurple` et `verbose`) dans notre premier fichier et pas dans le second.

À ce stade, notre `/tmp/bash/console.sh` contient ceci :

<Snippet filename="/tmp/bash/console.sh" source="./files/console.part2.sh" />

et, pour `/tmp/bash/console_v2.sh` :

<Snippet filename="/tmp/bash/console_v2.sh" source="./files/console_v2.part2.sh" />

<AlertBox variant="info" title="L'ordre n'a pas d'importance">
Contrairement à une comparaison avec `diff`, l'ordre dans lequel les fonctions apparaissent dans les scripts n'a aucune importance, puisque nous les trions. *Si vous préférez corriger la cause plutôt que la contourner, <Link to="/blog/linux-sort-functions-in-script">Linux - Sort functions in a Bash script</Link> réordonne les fonctions directement dans les fichiers.*

</AlertBox>

## Comparer les scripts Bash de deux dossiers {#compare-bash-scripts-in-two-folders}

Dans le chapitre précédent, nous avons vu comment comparer deux versions du même script. Allons un cran plus loin et comparons deux dossiers : pour chaque script des deux dossiers, lançons une comparaison.

Pour cela, créez le script `compare.sh` sur votre disque dur avec ce contenu :

<Snippet filename="compare.sh" source="./files/compare.sh" />

Maintenant, pour l'exécuter, lancez simplement `./compare.sh foldername1 foldername2`. Vous obtiendrez quelque chose comme ci-dessous : pour chaque script présent dans les deux dossiers (les scripts présents dans un seul dossier sont ignorés), vous obtenez le nom du script (comme `array.sh`) suivi du texte `The two files are identical` si les deux fichiers sont identiques ou, sinon, une liste de noms de fonctions et l'indicateur déjà vu, à savoir `<`, `>` ou `|`.

![Comparer les scripts Bash de deux dossiers](./images/compare_folders.webp)

Avec ce script, il est facile de garder l'un des deux dossiers comme *master* (le dossier de gauche), c'est-à-dire d'y reproduire toutes les fonctions qui auraient été ajoutées à un script du second dossier (celui qui correspond à la colonne de droite).

Une fois une fonction identifiée, il suffit d'ouvrir le fichier de *droite* et de copier-coller la fonction dans le fichier correspondant du dossier de *gauche*.

En ajoutant `| grep -E -v "<$"` à notre instruction `grep`, nous pouvons améliorer le script en ignorant les cas où des fonctions ont été ajoutées uniquement dans le dossier de gauche. Imaginez le besoin suivant : *Dans le dossier de droite, si j'ai ajouté des fonctions à mes scripts, quelles sont ces fonctions afin que je puisse les copier-coller dans les scripts du dossier de gauche ?*

<Snippet filename="compare.sh" source="./files/compare.part2.sh" />

Si nous lançons cette nouvelle version du script sur exactement les mêmes fichiers, les lignes se terminant par `<` sont maintenant masquées (présentes uniquement dans le dossier de gauche) et nous n'obtenons que les cas où une fonction est présente dans le dossier de droite :

![Masquer les cas où les fonctions ne sont que dans le dossier de gauche](./images/no_more_left.webp)

Il devient encore plus facile d'identifier ces fonctions et de les copier-coller vers la gauche, par exemple.
