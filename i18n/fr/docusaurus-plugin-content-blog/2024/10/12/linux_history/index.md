---
slug: linux-history
title: Linux - Travailler avec l'historique de vos dernières commandes
date: 2024-10-12
description: Maîtrisez l'historique de votre ligne de commande Linux. Apprenez à afficher, localiser (.bash_history, .zsh_history) et gérer vos commandes précédemment exécutées grâce à quelques astuces essentielles.
authors: [christophe]
image: /img/v2/linux_tips.webp
series: Customize your shell with ZSH
mainTag: linux
tags:
  - linux
  - zsh
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore DOSKEY,HISTIGNORE,HISTFILE,gacom -->
![Linux - Travailler avec l'historique de vos dernières commandes](/img/v2/linux_tips.webp)

<TLDR>
Cet article traite de l'historique du shell sous Bash/ZSH : localiser le fichier d'historique via `$HISTFILE`, exclure les commandes sensibles avec `HISTIGNORE`/`HISTORY_IGNORE` ou une espace en début de ligne (`hist_ignore_space`), filtrer avec `history | grep`, faire une recherche floue via <kbd>CTRL</kbd>+<kbd>R</kbd>, utiliser zsh-autosuggestions pour éviter complètement la recherche manuelle, et supprimer des entrées précises avec `history -d`.
</TLDR>

Pour moi, l'une des forces indéniables de la ligne de commande sous Linux, c'est la gestion de l'historique des commandes déjà exécutées.

*La plus grosse amélioration que vous pouvez apporter à cet historique, c'est <Link to="/blog/linux-fzf-introduction">fzf</Link> : il transforme <kbd>CTRL</kbd>+<kbd>R</kbd> en une recherche floue et interactive au lieu d'une recherche linéaire. Si vous voulez quelque chose de plus structuré — avec horodatage, codes de sortie, répertoire de travail et synchronisation multi-machines en option — <Link to="/blog/atuin-bash-history">Atuin</Link> remplace complètement le fichier d'historique plat par une base de données SQLite.*

Pouvoir appuyer sur les touches <kbd>Haut</kbd> ou <kbd>Bas</kbd> du clavier pour revenir aux commandes lancées précédemment, waouh.

Pour les plus anciens, il y avait [DOSKEY](https://en.wikipedia.org/wiki/DOSKEY) sous MSDos, mais Linux va beaucoup plus loin.

Voyons quelques astuces.

<!-- truncate -->

## Obtenir votre historique {#getting-your-history}

Commençons par le début : pour afficher la liste des commandes que vous avez saisies par le passé, lancez simplement `history` dans une console Linux.

## Emplacement de votre historique {#location-of-your-history}

Par défaut, votre historique est stocké dans un fichier appelé `.bash_history` dans votre répertoire personnel. Vous pouvez afficher les cinq dernières commandes, par exemple, en lançant `tail -n5 ~/.bash_history`.

<AlertBox variant="info" title="De mon côté, comme j'utilise ZSH, mon historique se trouve dans `~/.zsh_history`.">
Le moyen le plus simple de savoir où votre historique est stocké est d'afficher le contenu de la variable `$HISTFILE` comme ceci : `echo $HISTFILE`.
</AlertBox>

<AlertBox variant="info">
Très récemment, j'ai dû reprendre un script développé par un collègue (appelons-le JohnDoe) et je ne savais pas comment l'appeler depuis la ligne de commande ni quels paramètres lui passer.

Comme je suis *root user* sur le serveur, j'ai simplement consulté son historique. Il m'a suffi d'afficher son fichier `/home/john_doe/.bash_history`.

</AlertBox>

### Variables HISTIGNORE // HISTORY_IGNORE {#histignore--history_ignore-variables}

La variable `HISTIGNORE` (pour Bash) ou `HISTORY_IGNORE` (ZSH) permet de spécifier des motifs que vous ne voulez pas voir enregistrés dans votre fichier d'historique.

Prenons un exemple : `HISTIGNORE="sudo *"` empêchera toutes les commandes commençant par `sudo` d'être écrites dans le fichier d'historique.

Vous pouvez aussi utiliser un motif comme `HISTIGNORE="*password*"` pour éviter que les commandes contenant le mot *password* soient écrites.

Pour pouvoir spécifier plus d'une règle, utilisez le caractère deux-points `:` comme dans `HISTIGNORE="sudo *:*password*"`.

## Ne pas mettre une commande précise dans l'historique {#dont-put-a-specific-command-in-the-history}

Imaginez une commande comme `curl --user name:password http://www.example.com`. Vouliez-vous vraiment mettre cette commande (donc votre login et votre mot de passe en clair) dans le fichier d'historique ?

Avec <Link to="/blog/tags/zsh">ZSH</Link>, il me suffit d'ajouter une espace avant ma commande, donc en lançant `[SPACE]curl --user name:password http://www.example.com`.

```none
# So, don't start your command like this:
$ curl --user name:password http://www.example.com

# v--- But just add a space character before
$  curl --user name:password http://www.example.com
```

<AlertBox variant="info">
Le caractère espace est pris en charge par l'option `hist_ignore_space`, définie dans `.oh-my-zsh/lib/history.zsh`.
</AlertBox>

## Utiliser grep pour filtrer votre historique {#using-grep-to-filter-your-history}

Disons que vous voulez retrouver les dernières instructions `docker exec` que vous avez lancées : `history | grep -i "docker exec"`, c'est-à-dire simplement envoyer via un *pipe* la sortie de la commande `history` vers `grep` et appliquer un filtre (insensible à la casse grâce au flag `-i`).

De mon côté, je n'en ai pas besoin parce que j'utilise <kbd>CTRL</kbd>+<kbd>R</kbd> sous ZSH.

## CTRL-R est votre ami {#ctrl-r-is-your-friend}

Les touches <kbd>CTRL</kbd>+<kbd>R</kbd> affichent une petite fenêtre popup (sous Bash comme sous ZSH) et vous pourrez rechercher rapidement dans l'historique de vos commandes.

Voici l'apparence sous ZSH ; bien plus agréable et plus simple que sous Bash.

![CTRL-R dans ZSH](./images/ctrl_r.webp)

Appuyez donc sur <kbd>CTRL</kbd>+<kbd>R</kbd> puis commencez à taper quelques lettres comme *gacom* et chaque entrée contenant ces lettres (comme **g**it add . ; git **com**mit ...) sera retrouvée.

Ce popup reste toutefois un parcours linéaire dans un fichier texte plat : pas d'horodatage, pas de code de sortie, aucune idée du dossier dans lequel vous étiez. Si cette limitation commence à vous gêner, <Link to="/blog/atuin-bash-history">Atuin reconstruit le même raccourci <kbd>CTRL</kbd>+<kbd>R</kbd> au-dessus d'une base de données SQLite</Link> et conserve tout ce contexte pour vous.

## Autosuggestions dans la console avec ZSH {#autosuggestions-in-the-console-using-zsh}

En utilisant ZSH et zsh-autosuggestion (voir <Link to="/blog/zsh-plugin-autosuggestions">mon article précédent</Link>), vous n'avez même plus à vous soucier de l'historique.

Commencez juste à taper les premières lettres d'une commande comme **doc** et toutes vos instructions **docker** précédentes seront accessibles (utilisez les touches de navigation pour sélectionner une commande précédente ou tapez quelques lettres de plus pour affiner).

## Supprimer une instruction de votre historique {#delete-an-instruction-from-your-history}

Aïe ! Vous avez oublié d'ajouter une espace avant votre instruction confidentielle et, du coup, elle est maintenant stockée dans l'historique.

Pas de panique ! Le fichier d'historique est... un fichier, donc lancez simplement `vi $HISTFILE` et vous pouvez l'éditer.

Ou, peut-être plus simple, utilisez `history -d` suivi du numéro de ligne tel qu'affiché dans la sortie de l'historique.

Donc si la sortie de `history` est celle ci-dessous, je peux supprimer la ligne `vi` en lançant `history -d 2130`

<Terminal typewriter source="./files/terminal-1.txt" />

<AlertBox variant="info">
Mais, ensuite, la commande `history -d 2130` apparaîtra dans l'historique, évidemment. Éditer le fichier avec un éditeur de texte est donc peut-être plus... discret.

</AlertBox>

<AlertBox variant="note">
Vous pouvez spécifier une plage comme `history -d 2100-2130` (Bash 5.1+).

</AlertBox>
