---
slug: php-grep-searching-at-lightning-speed
title: Cherchez sur votre serveur FTP à la vitesse de l'éclair
date: 2025-01-19
description: Fatigué des fonctions de recherche FTP désespérément lentes ? Découvrez php_grep, le script PHP ultra-rapide qui utilise les expressions régulières pour trouver du contenu sur votre serveur FTP en un éclair.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - code-quality
  - ssh
  - winscp
language: fr
updates:
  - date: 2026-07-30
    note: "GitHub repo (cavo789/php_grep) archived May 2025; the PHP script still works when uploaded to your server."
---
![Cherchez sur votre serveur FTP à la vitesse de l'éclair](/img/v2/winscp.webp)

<TLDR>
Chercher du texte sur un serveur FTP peut être incroyablement lent, surtout avec des outils comme la recherche intégrée de WinSCP. Cet article présente `php_grep`, un script PHP léger et ultra-rapide qui change la donne pour la recherche sur FTP. Il suffit d'uploader ce fichier unique sur votre serveur et d'y accéder via une URL pour lancer des recherches instantanées basées sur des expressions régulières dans le contenu de vos fichiers, et même filtrer les résultats par type de fichier.
</TLDR>

Saviez-vous qu'avec [WinSCP](https://winscp.net/), vous pouvez lancer une recherche sur votre FTP pour trouver tous les documents contenant une chaîne donnée ? C'est natif dans WinSCP, rien de plus à installer, mais...

*D'autres astuces WinSCP sur ce blog : <Link to="/blog/winscp-download-recursively-files">télécharger récursivement les fichiers ayant une extension précise</Link> et <Link to="/blog/winscp-synchronize-both">synchroniser la machine locale et le serveur distant</Link>.*

Le problème : c'est terriblement lent. Voyons comment faire mieux et quasi instantanément.

<!-- truncate -->

## WinSCP - Rechercher du texte {#winscp---search-for-text}

Vous ne l'avez probablement jamais remarqué (c'était mon cas), mais vous pouvez lancer une recherche dans les fichiers de votre serveur FTP depuis WinSCP.

Pour cela, allez dans le menu `Commands`, puis `Static custom` commands et enfin `Search for Text...`. Tapez votre motif de recherche et appuyez sur <kbd>Enter</kbd>.

![Rechercher du texte](./images/search_for_text.webp)

Un nouveau prompt Powershell va s'ouvrir et vous verrez la liste des fichiers analysés.

![Résultat](./images/result.webp)

<AlertBox variant="info" title="C'est un script Powershell">
WinSCP lance en réalité un script `.ps1` situé ici : `C:\Program Files (x86)\WinSCP\Extensions\SearchText.WinSCPextension.ps1`. N'hésitez pas à modifier le fichier selon vos besoins.

</AlertBox>

C'est atrocement lent et vous obtenez une énorme liste avec tous vos fichiers, pas seulement ceux où le motif a été trouvé. Cette fonction a le mérite d'exister, mais ça s'arrête là.

## php_grep {#php_grep}

Le temps passe... En 2016, j'ai développé un petit script ultra-rapide appelé [php_grep](https://github.com/cavo789/php_grep) qui parcourt chaque fichier présent et, à l'aide d'une petite expression régulière, trouve les fichiers contenant le motif recherché et affiche sa position en cas de succès.

Il vous suffit de télécharger une copie de mon script (une seule page PHP), de la copier sur votre serveur FTP et d'y accéder via une URL. Vraiment simple.

Vous obtenez alors une interface où vous pouvez taper, bien sûr, l'expression recherchée, mais aussi restreindre la recherche aux fichiers `.html` par exemple.

![php_grep en action](./images/php_grep.webp)

Plus d'infos sur [https://github.com/cavo789/php_grep](https://github.com/cavo789/php_grep)

*L'astuce ici, c'est de chercher **sur le serveur** : rien ne transite sur le réseau. Quand les fichiers sont déjà sur votre propre disque, c'est <Link to="/blog/ripgrep">ripgrep</Link> qui procure la même sensation de vitesse fulgurante.*
