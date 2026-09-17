---
slug: docker-pascal
title: Jouer avec Docker et Pascal
date: 2023-12-01
description: Peut-on exécuter aujourd'hui du code Pascal vieux de 30 ans ? Oui ! Ce guide vous montre comment utiliser Docker et le Free Pascal Compiler (FPC) pour compiler et exécuter vos anciens programmes Turbo Pascal.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: docker
tags: [docker]
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore ource,rchive,roupn,chiffre,downto -->
![Jouer avec Docker et Pascal](/img/v2/experiments.webp)

<TLDR>
Cet article ressuscite du code source Turbo Pascal vieux de 30 ans (récupéré dans la vieille archive SWAG) en utilisant l'image Docker `signumtemporis/fpc` pour compiler des fichiers `.pas` en exécutables Windows, sans aucune installation locale. Au programme : un « Hello World » et une vieille fonction de conversion d'un octet en binaire écrite en 1992.
</TLDR>

Que de bons souvenirs... Pendant mes études (en 1991-1993), j'étais un grand fan de Turbo Pascal 7.0. C'est le premier langage que j'ai vraiment appris, et je l'adorais. Je passais des dizaines d'heures derrière mon ordinateur à écrire tout et n'importe quoi.

Si vous vous souvenez encore de cette époque, Turbo Pascal 7.0 servait à créer des exécutables pour MS-DOS.

L'idée de cet article m'est venue après celui écrit sur le <Link to="/blog/docker-assembly">langage assembleur</Link> : est-il possible, en 2023, de faire tourner du code Pascal écrit 30 ans plus tôt ?

<!-- truncate -->

![Turbo Pascal](./images/turbo_pascal.webp)

La première chose à faire était de retrouver du vieux code source et, pour ça, je suis retourné voir le **S**ource**w**are **A**rchive **G**roup, plus connu sous le nom de **SWAG**.

La requête paramétrée suivante retrouve du code que j'ai publié il y a 30 ans : [https://www.google.com/search?q=avonture+site%3Ahttp%3A%2F%2Fwww.retroarchive.org](https://www.google.com/search?q=avonture+site%3Ahttp%3A%2F%2Fwww.retroarchive.org). Par nostalgie, j'ai aussi recopié ces sources ici : [https://github.com/cavo789/swag](https://github.com/cavo789/swag).

## Hello world {#hello-world}

Lancez `mkdir C:\tmp\pascal && cd C:\tmp\pascal` dans une console MS-DOS pour créer un dossier appelé `pascal` et vous y placer.

Créez un nouveau fichier appelé `Hello.pas` avec ce contenu :

<Snippet filename="Hello.pas" source="./files/Hello.pas" />

Comme vous le savez, Pascal est un langage compilé et doit donc être compilé en `.exe`. La commande ci-dessous s'en charge :

<Terminal typewriter title="Powershell" source="./files/terminal-2.txt" />

Notre exécutable a été créé. Il est temps de le lancer avec `Hello.exe` :

<Terminal typewriter title="Powershell">
$ Hello.exe

Hello world! I'm a Turbo Pascal source code
</Terminal>

Voilà, nous avons créé avec succès notre premier code Pascal en 2023.

*Ce blog possède une petite collection d'articles du type « faire tourner le langage X sans l'installer » : <Link to="/blog/docker-java">Java</Link>, <Link to="/blog/docker-python">Python</Link> et <Link to="/blog/docker-php-run-script-or-website">PHP</Link>.*

<AlertBox variant="info" title="Rappel sur la CLI Docker">
Pour rappel, les commandes `docker run` utilisées sont (presque toujours les mêmes) :

- `-it` pour démarrer Docker en mode interactif, ce qui permet au script exécuté dans le container de vous poser des questions par exemple,
- `--rm` pour demander à Docker de tuer et supprimer le container dès que le script a été exécuté (sinon vous vous retrouverez avec une tonne de containers Docker arrêtés mais pas supprimés ; vous pouvez le vérifier en n'utilisant pas le flag `--rm` puis en lançant `docker container list` dans la console),
- `-v %CD%:/app` pour partager votre dossier courant avec un dossier appelé `/app` dans le container Docker,
- `-w /app` pour dire à Docker que le répertoire courant, dans le container, sera le dossier `/app`,
- puis `signumtemporis/fpc:cross.x86_64-win64.slim` qui est le nom de l'image Docker à utiliser et, enfin,
- `Hello.pas` c'est-à-dire notre fichier source (l'image fpc ne semble pas demander de préciser l'exécutable `fpc` ; juste le fichier source).

</AlertBox>

## Convertir un nombre en octet {#convert-a-number-to-a-byte}

Essayons quelque chose d'*un peu plus complexe* qu'un simple *Hello world* : une fonction de conversion pour déterminer la représentation binaire d'un nombre positif *(soyez indulgent, c'était un devoir scolaire 😄)*.

J'ai écrit cette fonction en 1992 (publiée dans le *SWAG* en 1997) : [https://github.com/cavo789/swag/blob/master/Byte2Bin/files/source.pas](https://github.com/cavo789/swag/blob/master/Byte2Bin/files/source.pas)

Créez le fichier `Byte2Bin.pas` sur votre disque avec ce contenu :

<Snippet filename="Byte2Bin.pas" source="./files/Byte2Bin.pas" />

<AlertBox variant="info" title="SHL pour Shift left one position">
L'instruction `shl` décale le nombre d'un octet vers la gauche.

</AlertBox>

Et compilez-le :

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />

Comme vous pouvez le voir dans le code source, l'idée était d'afficher la représentation binaire de `197` et, oui !, c'est bien `11000101`. Toujours en 2023.

<Terminal typewriter title="Powershell">
$ Byte2Bin.exe
11000101
</Terminal>

OK, l'intérêt de faire tourner du code TP7 en 2023 est minime et inutile, mais c'est bien amusant de voir que ça marche encore.

Même idée, autre langage : j'ai aussi joué avec <Link to="/blog/docker-python">Python</Link> et <Link to="/blog/docker-java">Java</Link> en utilisant exactement la même approche Docker « zéro installation locale ».
