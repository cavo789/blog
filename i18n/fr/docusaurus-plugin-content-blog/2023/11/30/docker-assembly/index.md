---
slug: docker-assembly
title: Jouer avec Docker et le langage Assembleur
date: 2023-11-30
description: Apprenez à combiner la technologie Docker moderne avec le classique langage Assembleur x86. Ce guide propose un exemple « Hello, World! » pas à pas pour les environnements MS-DOS et Linux.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: docker
tags: [docker]
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore erminate,esident,esolang,nasm -->
![Jouer avec Docker et le langage Assembleur](/img/v2/experiments.webp)

<TLDR>
Cet article réveille la nostalgie de l'Assembleur x86 des années 90 en assemblant et en exécutant un fichier `.asm` « Hello, World! » sans aucune installation locale, grâce à l'image Docker `esolang/x86asm-nasm`, depuis une console DOS/PowerShell (`%CD%`) comme depuis Linux (`${PWD}`).
</TLDR>

Quand j'étais plus jeune qu'aujourd'hui, pendant mes études, je jouais avec le langage Assembleur x86 sur mon ordinateur `386DX40` ; c'était dans les années 1993-1995. Les débuts de Windows 3.1, que je n'aimais pas. *Si on m'avait demandé si les interfaces graphiques allaient avoir du succès, j'aurais dit non, bien sûr que non.*

Je me souviens avoir écrit un programme résident (TSR, pour **T**erminate and **S**tay **R**esident) qui, une fois chargé en mémoire, surveillait le clavier et enregistrait les touches pressées dans un fichier sur le disque dur. Oui, c'était un voleur de mots de passe. Juste pour le fun et, surtout, pour le défi.

Et maintenant, en 2023, je me demandais s'il était encore possible d'exécuter des fichiers `.asm` sur mon ordinateur. C'était une excellente raison pour écrire cet article.

*Le même voyage nostalgique, un langage plus tard : <Link to="/blog/docker-pascal">Play with Docker and Pascal</Link>, où je compile des sources Turbo Pascal que j'ai publiées il y a trente ans.*

<!-- truncate -->

En cherchant sur [Docker Hub](https://hub.docker.com/), j'ai trouvé cette image : [https://hub.docker.com/r/esolang/x86asm-nasm](https://hub.docker.com/r/esolang/x86asm-nasm)

## Jouons sous MS-DOS {#lets-play-in-ms-dos}

Testons notre image Docker sous DOS cette fois. Démarrez une console **DOS** et lancez `mkdir C:\tmp\assembly && cd C:\tmp\assembly` pour créer un dossier appelé `assembly` dans votre environnement DOS et y entrer.

Créez un nouveau fichier appelé `Hello.asm` avec ce contenu :

<Snippet filename="Hello.asm" source="./files/Hello.asm" />

Pour exécuter le script, il suffit d'appeler Docker, comme ceci :

<Terminal typewriter title="Powershell">
$ docker run --rm -v %CD%:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm
Hello, World! This message comes from Docker.
</Terminal>

<AlertBox variant="info" title="Bien sûr, vous pouvez jouer sous Linux">
Remplacez simplement `%CD%` par `${PWD}` et l'instruction sera reconnue par Linux : `docker run --rm -v ${PWD}:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm`

</AlertBox>

Même idée, autre langage : j'ai aussi joué avec <Link to="/blog/docker-pascal">Pascal</Link>, <Link to="/blog/docker-python">Python</Link> et <Link to="/blog/docker-java">Java</Link> avec cette même approche Docker « zéro installation locale ».
