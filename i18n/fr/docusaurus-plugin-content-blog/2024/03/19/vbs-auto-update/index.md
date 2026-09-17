---
slug: vbs-auto-update
title: VBS - Script d'auto-mise à jour
date: 2024-03-19
description: Automatisez les mises à jour de vos scripts console VBS (Visual Basic Script) ! Découvrez comment créer un fichier VBS qui se met à jour lui-même, se connecte à GitHub, vérifie les nouvelles versions et s'écrase.
authors: [christophe]
image: /img/v2/vbs.webp
series: VBA & MS Office automation
mainTag: github
tags:
  - github
  - vba
  - windows
language: fr
review_date: 2026-07-30
---
![VBS - Script d'auto-mise à jour](/img/v2/vbs.webp)

<TLDR>
Cet article montre comment donner à un fichier VBScript (VBS) la capacité de se mettre à jour lui-même : à chaque exécution, le script télécharge son propre code source depuis une URL GitHub publique, la compare à la copie locale et s'écrase si une version plus récente est trouvée — ce qui permet aux utilitaires `.vbs` distribués de rester à jour sans redistribution manuelle.
</TLDR>

Avant de passer à <Link to="/blog/tags/wsl">WSL2</Link> et à la console Linux, j'écrivais des scripts VBS de temps en temps. Ça ressemble à du VBA, mais pour la console DOS.

Un script VBS pour DOS est un fichier texte écrit dans le langage de programmation Visual Basic Scripting Edition (VBScript), exécutable directement depuis la ligne de commande DOS. Il permet d'automatiser des tâches et d'effectuer des opérations répétitives sur votre ordinateur.

C'est exactement comme les scripts <Link to="/blog/tags/bash">Linux Bash</Link>, mais pour DOS.

*Trois de mes utilitaires VBS qui bénéficieraient précisément de ce mécanisme d'auto-mise à jour : <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link>, <Link to="/blog/vba-access-export">Export MS Access objects</Link> et <Link to="/blog/vbs-files-csv">VBS - Get list of files and generate a CSV</Link>.*

Pensez-vous qu'il serait possible de proposer une fonction d'auto-mise à jour dans de tels scripts ? La réponse est oui.

<!-- truncate -->

Imaginez un script appelé `get_folder_size.vbs` que vous avez publié publiquement sur GitHub (source [https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs](https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs)).

Quelqu'un le télécharge sur son ordinateur et prend plaisir à l'utiliser.

En y ajoutant une nouvelle fonction d'*auto-mise à jour*, à chaque démarrage du script, une connexion à GitHub est d'abord établie, le script est téléchargé depuis là, et une vérification est faite pour voir si la version téléchargée est différente ; si c'est le cas, le script s'écrase lui-même.

Voici le contenu d'une telle fonction :

<Snippet filename="get_folder_size.vbs" source="./files/get_folder_size.vbs" />
