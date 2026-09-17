---
slug: linux-sort-functions-in-script
title: Linux - Trier les fonctions dans un script Bash
date: 2024-07-28
description: Découvrez comment utiliser diff et sort en Bash pour vérifier si les fonctions de vos scripts shell sont définies dans l'ordre alphabétique. Avec un script pour scanner un dossier entier.
authors: [christophe]
image: /img/v2/bash.webp
series: Writing better Bash scripts
mainTag: bash
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
---
![Linux - Trier les fonctions dans un script Bash](/img/v2/bash.webp)

<TLDR>
Cet article vérifie si les fonctions d'un script Bash sont déclarées dans l'ordre alphabétique : on extrait les noms de fonctions avec `grep`/`awk` puis on compare la liste telle quelle à une copie triée avec `diff --side-by-side`. Le tout est ensuite transformé en un script `order.sh` qui parcourt chaque fichier `.sh` d'un dossier et n'affiche rien pour les fichiers correctement triés, ce qui rend les scripts mal ordonnés faciles à repérer.
</TLDR>

Dans un <Link to="/blog/linux-compare-two-versions-of-the-same-script">article</Link> précédent, nous avons vu une simple commande CLI pour afficher la liste des fonctions présentes dans un script. Mais qu'en est-il d'un script Bash qui scannerait un dossier entier, récupérerait tous les scripts `.sh` et vérifierait si les fonctions y sont triées ?

<!-- truncate -->

## Résultat {#result}

`diff --side-by-side` entre l'ordre de déclaration des fonctions et l'ordre trié vous dit
immédiatement si les fonctions d'un script sont classées alphabétiquement — les lignes qui ne
correspondent pas pointent directement ce qu'il faut déplacer :

![Bad sorter](./images/bad_sorter.webp)

Corrigez l'ordre et relancez jusqu'à ce que chaque fonction soit alignée : vous obtenez alors une confirmation sympathique :

![Congratulations](./images/congratulations.webp)

## Créer un simple script Bash pour jouer avec cet article {#create-a-simple-bash-script-to-play-with-this-blog-post}

Créez le fichier `/tmp/bash/console.sh` sur votre disque avec ce contenu :

<Snippet filename="/tmp/bash/console.sh" source="./files/console.sh" />

Comme on peut le voir, nous créons juste des fonctions vides, sans ordre particulier.

## Obtenir la liste des fonctions d'un script Bash {#get-the-list-of-functions-in-a-bash-script}

Pour obtenir la liste des fonctions déclarées dans un script, lancez simplement la commande ci-dessous :

<Terminal typewriter>
$ {`grep -P "^(function\s+.*)\(\)" "/tmp/bash/console.sh" | awk '{print \$2}' | sort`}
</Terminal>

![Get the list of functions](./images/display_list_of_functions.webp)

Voilà, nous savons maintenant comment trier la liste des fonctions dans la console.

Utilisons `diff` pour comparer notre fichier existant (côté gauche) et la liste triée des fonctions (côté droit) — c'est ce qui a produit la comparaison montrée en début d'article :

```bash
(
  FILE=/tmp/bash/console.sh
  printf "\e[33;1m%-39s %s\e[0;1m\n" "Left side: AS IS" "Right side: Using correct sorter"
  diff --side-by-side --width 83 \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}') \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}' | sort)
)
```

Comme on le voit sur l'image ci-dessus, la colonne de gauche montre que la première fonction définie dans le script `/tmp/bash/console.sh` est `console::printCyan`, suivie de `console::askYesNo` puis de `console::printRed` en troisième position (dans cet ordre) dans le script Bash.

Dans la colonne de droite, on voit que la première fonction triée est `console::askYesNo`, la deuxième `console::banner`, et ainsi de suite.

Retour à la colonne de gauche : les noms affichés en blanc sont déjà dans le bon ordre !

Modifions partiellement le fichier `/tmp/bash/console.sh` et réordonnons quelques fonctions :

<Snippet filename="/tmp/bash/console.sh" source="./files/console.part2.sh" />

Maintenant, en relançant la même commande :

![Almost correct](./images/almost_correct.webp)

Il suffit de placer `console::printRed()` à la fin et tout sera bon. Et, pour obtenir un retour positif, utilisez cette version améliorée :

```bash
(
  FILE=/tmp/bash/console.sh
  printf "\e[33;1m%-39s %s\e[0;1m\n" "Left side: AS IS" "Right side: Using correct sorter"
  diff --side-by-side --width 83 \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}') \
    <(grep -P "^(function\s+.*)\(\)" "${FILE}" | awk '{print $2}' | sort) && printf "\n%s\n" "🎉 🎊 🕺 💃 👏 CONGRATULATIONS"
)
```

Si vous voyez le message de confirmation affiché en début d'article, parfait : les fonctions sont correctement ordonnées dans votre script.

## Traiter tous les scripts d'un dossier donné {#process-all-scripts-from-a-specific-folder}

Nous venons de voir, en ligne de commande, comment vérifier si un script Bash déclarant des fonctions le fait dans l'ordre alphabétique.

Passons à l'industrialisation de ce concept : un script qui va scanner chaque fichier .sh d'un dossier donné et vérifier si les fonctions y sont définies dans l'ordre alphabétique.

*Un script trié est aussi un script qui se documente mieux : <Link to="/blog/linux-generate-documentation-from-bash-scripts">Linux - Generate documentation from Bash scripts</Link> génère une page Markdown par script à partir du bloc de documentation de chaque fonction, dans l'ordre de déclaration.*

Si c'est le cas, nous n'afficherons rien afin de ne pas polluer notre console.

Si ce n'est pas le cas, la partie gauche de l'écran montre l'ordre actuel des déclarations de fonctions et la partie droite montre l'ordre attendu, trié alphabétiquement.

Pour cela, créez le script `order.sh` sur votre disque dur avec ce contenu :

<Snippet filename="order.sh" source="./files/order.sh" />

Et maintenant, lancez le script comme ceci : `./order.sh  ~/helpers`. Le paramètre attendu est le nom d'un dossier contenant des fichiers `.sh`.

![Running the batch script](./images/batch_script.webp)

Qu'est-ce que cela signifie ? Mon script `~/helpers/api.sh` est en fait (côté gauche) vraiment mal trié puisqu'il y a beaucoup de différences avec la colonne de droite (l'ordre parfait).

La première fonction de mon fichier est `api::__injectLogsToApplicationLog` alors qu'il y a une fonction `api::__assertHttpMethod` plus loin dans le code.

En éditant mon fichier et en déplaçant `api::__assertHttpMethod` au début de mon script, puis en relançant le script :

![Move the assert method first](./images/api_move_assert_first.webp)

Bien, maintenant, toujours à droite, on voit que `api::__debugCurlStatement` est attendue en deuxième position, `api::__doSomeCleaning` en troisième, puis `api::__executeCall()` et ainsi de suite (comme on le voit côté droit).

Dès que le fichier `api.sh` est correctement trié, relancer le script ne mentionnera plus ce script, mais d'autres.

![The console.sh script isn't ordered](./images/console.webp)

L'objectif final est donc celui-ci : nous n'attendons aucune sortie du script. Si tous les scripts Bash sont correctement triés, alors le script `order.sh` ne trouvera plus aucune différence, ce qui est exactement ce que nous voulons.
