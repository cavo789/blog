---
slug: wsl-powershell
title: Lancer le programme Windows associé par défaut depuis WSL
date: 2023-12-27
description: Découvrez la commande toute simple pour ouvrir des fichiers PDF ou HTML depuis votre console Linux WSL avec leur application Windows par défaut - powershell.exe.
authors: [christophe]
image: /img/v2/wsl.webp
series: WSL2 - Install, move and use it
mainTag: wsl
tags:
  - windows
  - wsl
language: fr
review_date: 2026-07-30
---
![Lancer le programme Windows associé par défaut depuis WSL](/img/v2/wsl.webp)

<TLDR>
Cet article partage une astuce WSL rapide : lancer `powershell.exe <filename>` (par exemple `powershell.exe guide.pdf`) depuis la console Linux ouvre ce fichier avec son application Windows par défaut, sans devoir d'abord le chercher dans l'explorateur Windows. `xdg-open` est présenté comme alternative pour ouvrir le navigateur par défaut.
</TLDR>

Très souvent, je suis dans ma console Linux et j'aimerais ouvrir un fichier pdf que je viens de générer ou, plus simplement, ouvrir un fichier html. Mais comment faire ?

Sans connaître l'astuce qui fait l'objet de cet article, je lance <Link to="/blog/wsl-windows-explorer">Windows Explorer</Link> depuis ma console, j'obtiens alors la bonne vieille interface de l'explorateur de fichiers et là, je double-clique sur le fichier à ouvrir et je laisse faire Windows, qui sait quel programme lancer pour telle ou telle extension.

En fait, c'est bien plus simple...

<!-- truncate -->

L'astuce : lancez `powershell.exe` suivi du nom du fichier à ouvrir, comme `powershell.exe guide.pdf` ou `powershell.exe index.html`.

*Un cas d'usage typique : vous venez de générer un PDF avec <Link to="/blog/docker-quarto">Quarto in Docker</Link> et vous voulez vérifier le résultat sans quitter votre console.*

<AlertBox variant="note" title="Pas disponible en Bash">
`powershell.exe` ne fonctionne que dans la console. Vous ne pouvez pas l'utiliser dans un script Bash (`.sh`), il n'y sera pas reconnu.

</AlertBox>

<AlertBox variant="info" title="`xdg-open`">
Vous pouvez aussi utiliser `xdg-open` pour lancer votre navigateur par défaut : `xdg-open index.html` ouvrira le fichier dans votre navigateur Windows.

</AlertBox>

Si vous obtenez l'erreur ci-dessous, vous trouverez une solution dans l'article <Link to="/blog/wsl-windows-explorer#wsl-localhost-is-not-accessible">Windows Explorer</Link>

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />
