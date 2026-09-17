---
slug: linux-generate-documentation-from-bash-scripts
title: Linux - Générer de la documentation à partir de scripts Bash
date: 2024-07-29
description: Apprenez à générer automatiquement la documentation de vos scripts Bash sous Linux. Ce guide fournit un script maison qui analyse les blocs de doc des fonctions et crée des fichiers Markdown structurés.
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
![Linux - Générer de la documentation à partir de scripts Bash](/img/v2/bash.webp)

<!-- cspell:ignore HEllow -->

<TLDR>
Cet article partage un script Bash maison, `generate_doc.sh`, qui parcourt un dossier de fichiers `.sh`, extrait les blocs de commentaires façon PHP Docblock placés au-dessus de chaque fonction et génère un fichier Markdown par script (plus un `readme.md` récapitulatif) — de quoi combler l'absence d'équivalent Bash à des outils comme phpDocumentor.
</TLDR>

Quand j'écris des scripts Bash, je place toujours un bloc de description devant chaque fonction, comme je le fais dans n'importe quel langage (pensez au [PHP Docblock](https://docs.phpdoc.org/guide/getting-started/what-is-a-docblock.html)).

Avec PHP, il existe quelques outils comme phpDocumentor pour extraire ces blocs et générer de la documentation, mais est-ce que de tels outils existent pour Bash ? Je ne sais pas, je n'en ai trouvé aucun.

J'ai donc écrit un petit script Bash pour le faire : parcourir chaque fichier `.sh` présent dans un dossier, extraire les blocs de doc et créer un document Markdown pour chaque script trouvé. La documentation de chaque fonction est copiée en Markdown, puis une table des matières est ajoutée et, enfin, un fichier readme.md générique affiche la liste des fichiers Markdown récupérés.

<!-- truncate -->

## Résultat {#result}

Le script exécuté sur un dossier de fichiers `.sh` :

![Générer la documentation](./images/generate_doc.webp)

Pour un fichier trouvé dans le dossier `helpers`, un fichier correspondant est créé dans le dossier `documentation` — ici, `string.md`, avec chaque fonction disposant d'un bloc de doc :

<Snippet filename="documentation/string.md" source="./files/string.txt" />

Et une fois tous les fichiers `.sh` traités, un dernier fichier `documentation/readme.md` est créé :

<Snippet filename="documentation/readme.md" source="./files/readme.txt" />

## Comment le reproduire {#how-to-reproduce-it}

Prenons ce fichier `/tmp/bash/helpers/string.sh` :

<Snippet filename="/tmp/bash/helpers/string.sh" source="./files/string.sh" />

Il faut maintenant créer le script `generate_doc.sh`. Comme c'est un gros script, cliquez sur la ligne suivante pour en voir le contenu. Cliquez à nouveau pour masquer le code.

Créez le fichier `/tmp/bash/generate_doc.sh` avec ce contenu :

<Snippet filename="/tmp/bash/generate_doc.sh" source="./files/generate_doc.sh" />

Une fois le fichier `/tmp/bash/generate_doc.sh` créé et rendu exécutable (`chmod +x ./generate_doc.sh`), lancez simplement `./generate_doc.sh` dans la console — vous obtiendrez la sortie et les fichiers générés montrés plus haut.

## Pour aller plus loin {#going-further}

Deux idées complémentaires, une fois que vos blocs de doc sont la seule source de vérité :

- gardez vos scripts lisibles pour que la documentation générée le reste aussi ; <Link to="/blog/linux-sort-functions-in-script">Linux - Sort functions in a Bash script</Link> présente un petit script qui réordonne les fonctions par ordre alphabétique et
- transformez ce dossier de fichiers Markdown en un vrai site de documentation publié, comme décrit dans <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link>.
