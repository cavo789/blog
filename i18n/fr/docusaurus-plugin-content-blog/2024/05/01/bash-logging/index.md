---
slug: bash-logging
title: Bash - Script pour ajouter des fonctionnalités de log à votre script
date: 2024-05-01
description: Ajoutez des fonctionnalités de log robustes à vos scripts Bash grâce à cette petite bibliothèque réutilisable. Fichiers de log automatiques, horodatages et trace complète des appels de fonctions pour déboguer facilement.
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
<!-- cspell:ignore uplzaefi -->
![Bash - Script pour ajouter des fonctionnalités de log à votre script](/img/v2/bash.webp)

<TLDR>
Cet article partage une bibliothèque Bash réutilisable, `log.sh`, qui ajoute le logging à n'importe quel script : vous la sourcez, vous appelez `log::write "message"` là où c'est utile, et les entrées horodatées sont écrites automatiquement dans un fichier de log. Chaque entrée contient une trace d'appel complète (quelle fonction, à quelle ligne, appelée depuis où) pour faciliter le débogage des scripts non interactifs ou lancés par cron.
</TLDR>

> Lisez aussi <Link to="/blog/bash-console-log-together">Bash - Echo on the console and in a logfile in the same time</Link>

Quand vous écrivez des scripts Bash, et surtout quand vous prévoyez de les lancer dans un cron, vous devriez mettre en place un fichier de log. Chaque action déclenchée par votre script devrait être enregistrée quelque part afin de pouvoir lancer le script en mode non interactif et, en cas de besoin, consulter le dernier fichier de log.

*Le logging devient indispensable dès que votre script exécute <Link to="/blog/bash-parallel-task">plusieurs jobs en parallèle</Link> : la sortie console de dix tâches concurrentes est illisible, un fichier de log horodaté ne l'est pas.*

Voici un script que j'ai développé sous forme de bibliothèque, ce qui veut dire que vous pouvez facilement l'inclure dans votre code existant sans rien devoir changer.

Il suffit d'inclure le fichier dans votre script (c'est-à-dire ajouter une ligne `source log.sh`) puis de prévoir ici et là un `log::write "Something to log"`. Facile, non ?

<!-- truncate -->

Pour illustrer le fonctionnement du log, nous allons créer deux fichiers. Votre script (ici, je vais l'appeler `run.sh`) et celui qui contient l'implémentation du log (`log.sh`).

## Le résultat {#the-result}

En lançant le script, on voit nos différents `echo`, mais aussi le contenu du log généré.

![Utilisation du log](./images/logging.webp)

Vous pouvez bien sûr choisir de ne pas afficher le log automatiquement : il suffit de commenter la ligne `log::__displayLog`.

### Trace {#trace}

Chaque instruction loguée sera accompagnée d'une trace, comme vous pouvez le voir. Par exemple, le bloc `[Function __main line 43]` signifie que l'appelant était la fonction `__main` et que c'était à la ligne `43`.

```log
[2024-03-25T12:29:08+0100] Start ./run.sh
[2024-03-25T12:29:08+0100] Running main with these parameters: --help [Function __main line 43]
[2024-03-25T12:29:08+0100] Doing some stuff in test2 [Function test2 line 22;Function test1 line 30;Function __main line 48]
[2024-03-25T12:29:08+0100] I'm doing something in the test5 function... [Function test5 line 4;Function test4 line 10;Function test3 line 16;Function test2 line 24;Function test1 line 30;Function __main line 48]
[2024-03-25T12:29:08+0100] Logfile /tmp/run.sh.uplzaefiWq.log ended for ./run.sh.
[2024-03-25T12:29:08+0100] Duration: 0 second(s)
```

Quand il y a plusieurs parents, vous obtenez la trace complète, par exemple `[Function test5 line 4;Function test4 line 10;Function test3 line 16;Function test2 line 24;Function test1 line 30;Function __main line 48]` : la fonction `__main` à la ligne 48 a appelé `test1`, qui a ensuite appelé `test2`, et ainsi de suite.

Chaque instruction du log contiendra donc la trace complète, ce qui simplifie le débogage.

## Votre script {#your-script}

Si vous avez déjà un script, ouvrez-le. Sinon, créez-en simplement un nouveau et copiez/collez le code ci-dessous.

Nommez le fichier comme vous voulez (je vais l'appeler `run.sh` par exemple) et assurez-vous que le script est exécutable en lançant `chmod +x run.sh` dans votre console.

<Snippet filename="run.sh" source="./files/run.sh" />

## Le helper de log {#the-log-helper}

Créez un fichier appelé `log.sh`, exactement dans le même dossier que votre script, et copiez/collez ce contenu : c'est lui qui produit la trace et le fichier de log montrés plus haut.

<Snippet filename="log.sh" source="./files/log.sh" />
