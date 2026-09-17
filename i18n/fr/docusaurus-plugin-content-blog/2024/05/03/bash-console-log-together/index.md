---
slug: bash-console-log-together
title: Bash - Afficher sur la console et dans un fichier de log en même temps
date: 2024-05-03
description: Fatigué des scripts Bash silencieux ? Découvrez la méthode simple et efficace pour afficher la sortie d'une commande sur la console tout en l'écrivant ligne par ligne dans un fichier de log.
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
![Bash - Afficher sur la console et dans un fichier de log en même temps](/img/v2/bash.webp)

<TLDR>
Cet article montre comment faire en sorte qu'une commande Bash de longue durée écrive à la fois sur la console et dans un fichier de log (au lieu de l'un ou l'autre seulement), en utilisant `eval` pour lancer la commande et en affichant chaque ligne à l'écran tout en l'ajoutant au fichier de log en temps réel — plutôt que de tout mettre en mémoire tampon pour l'afficher à la fin.
</TLDR>

Dans mon article précédent <Link to="/blog/bash-logging">Bash - Script to add logging features to your script</Link>, j'ai partagé une façon d'écrire des informations dans un fichier de log.

En lançant `ls -alh /tmp`, vous obtenez la liste de tous les fichiers du dossier `/tmp` et elle s'affiche sur votre console. En lançant `ls -alh /tmp >> application.log`, vous ne verrez pas la liste dans votre console puisque tout sera écrit dans le fichier `application.log`.

Comment afficher la sortie d'une commande comme `ls` par exemple à la fois sur la console et dans un fichier de log ?

<!-- truncate -->

## Résultat {#result}

<Terminal typewriter source="./files/terminal-1.txt" />

Les mêmes lignes, deux fois : une fois affichées en direct sur la console, une fois ajoutées à `/tmp/test.log` — la preuve que les deux sorties se produisent vraiment en même temps, et non l'une après l'autre.

Pour l'illustration ci-dessus, le script a listé un petit dossier de démo au lieu de `/tmp` pour des raisons de lisibilité ; en pratique, vous le pointerez vers la commande de longue durée que vous voulez tracer.

## Pourquoi ça fonctionne {#why-it-works}

La commande passe par `eval`, et sa sortie est redirigée vers une boucle `while read`. Pour chaque ligne qui en sort, la boucle fait deux choses immédiatement, avant de lire la ligne suivante : elle l'affiche avec `echo` sur la console, puis elle l'ajoute au fichier de log. Rien n'est mis en mémoire tampon pour être vidé à la fin — c'est ce qui garde les deux sorties synchronisées.

Par exemple, récupérons la liste de tous les fichiers sous `/tmp`, et ce de manière récursive. Pour cela, notre commande sera `ls -alhR /tmp`.

Cette commande va probablement prendre du temps et c'est justement l'objectif : lancer une commande longue et s'assurer que l'utilisateur verra la sortie à l'écran, pour qu'il sache que le script fait quelque chose, tout en redirigeant aussi la sortie vers un fichier de log pour une analyse ultérieure en cas de problème (ou simplement parce que le script est lancé dans un cron).

*Si « le script fait quelque chose » est tout ce que votre utilisateur a besoin de savoir, une <Link to="/blog/bash-progression-bar">barre de progression</Link> est souvent plus agréable qu'un mur de texte qui défile.*

<Snippet filename="script.sh" source="./files/script.sh" />

La partie principale est la fonction `eval`.

La commande (`ls -alhR /tmp`) sera lancée et, pour chaque ligne, nous ferons un `echo` de la ligne à l'écran et la redirigerons aussi dans un fichier texte.

L'exemple ci-dessous fait presque la même chose, c'est-à-dire qu'il exécute une commande et l'affiche à la fois dans un fichier et sur la console mais... comme vous le voyez, la commande est lancée et tout est redirigé vers le fichier. Donc, pendant plusieurs secondes, l'utilisateur n'a aucune sortie à l'écran et peut penser que le script est bloqué. Ensuite, une fois la commande terminée avec succès, et seulement alors, le fichier de log est affiché, d'un bloc, sur la console.

<Snippet filename="script.sh" source="./files/script.part2.sh" />

Ne faites pas ce genre de choses !
