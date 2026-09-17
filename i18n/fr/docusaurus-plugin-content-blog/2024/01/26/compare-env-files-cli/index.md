---
slug: compare-env-files-cli
title: Comparer des fichiers d'environnement dans la console Linux
date: 2024-01-26
description: Vos fichiers .env et .env.example ne sont plus synchronisés ? Découvrez une commande Linux puissante basée sur diff, grep et sort pour comparer précisément vos variables d'environnement et ignorer les commentaires.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
![Comparer des fichiers d'environnement dans la console Linux](/img/v2/bash.webp)

<TLDR>
Cet article présente une commande Linux en une ligne pour comparer de façon fiable deux fichiers `.env` (par exemple `.env` et `.env.example`) grâce à `diff -y --suppress-common-lines` combiné à `grep` et `sort`. Les commentaires, les lignes vides et l'ordre des lignes sont ignorés, et certaines variables (comme `APP_KEY`) peuvent être exclues de la comparaison.
</TLDR>

C'est une source de problèmes très courante avec les fichiers .env : vous avez deux fichiers `.env` différents, ou plus, comme `.env` et `.env.example`.

Vous êtes développeur et vous codez une nouvelle fonctionnalité géniale. Vous ajoutez une ou plusieurs variables d'environnement dans votre fichier `.env` local et tout fonctionne parfaitement **sur votre machine**.

<AlertBox variant="danger" title="Boum ! Votre fonctionnalité est buguée.">
Un collègue récupère le code source depuis un système de gestion de versions comme GitHub/GitLab, ou, deuxième scénario, quelqu'un déploie la fonctionnalité sur un serveur — et tout casse.

</AlertBox>

Pourquoi ? Parce que la ou les variables que vous avez ajoutées l'ont été dans **votre `.env` local**, sur **votre machine uniquement**.

Comme vous le savez, il faut aussi créer ces variables dans le fichier `.env.example` mais, soyons honnêtes, personne n'y pense.

<!-- truncate -->

## La commande en une ligne et sa sortie {#the-one-liner-and-its-output}

Copiez ceci dans votre console, dans le dossier qui contient les deux fichiers :

```bash
(
  clear
  ENV1=.env
  ENV2=.env.example
  printf "\e[33;1m%-63s %s\e[0;1m\n" "Left side: ${ENV1}" "Right side: ${ENV2}"
  diff --suppress-common-lines -y \
    <(grep -v -E '^#|^$' ${ENV1}| sort) \
    <(grep -v -E '^#|^$' ${ENV2} | sort) \
   | grep -v 'APP_KEY'
)
```

Sur deux fichiers `.env` qui ont divergé, voici ce que ça renvoie :

```diff
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
DATABASE_TYPE = pgsql           | CACHE_DRIVER = redis
                                > DATABASE_TYPE = mysql
```

Comment lire ce résultat :

- `ALLOW_FEATURE_DO_THIS` n'est présent que dans `.env`,
- `DATABASE_TYPE` vaut `pgsql` dans `.env` et `mysql` dans `.env.example`,
- `CACHE_DRIVER` n'est présent que dans `.env.example` et
- toutes les autres lignes sont strictement identiques (rappelez-vous que nous ignorons les lignes commentées et vides)

Trois lignes de sortie, et la réponse à « qu'est-ce que j'ai oublié de reporter dans `.env.example` ? » est là.

## Pourquoi un simple `diff` ne suffit pas {#why-plain-diff-isnt-enough}

`diff` tout seul (voir <Link to="/blog/linux-diff-file-folder">Linux - Comparing two folders/files in the console</Link> pour le cas général) vous noierait sous le bruit, parce que :

1. Les commentaires et les lignes vides ne nous intéressent pas. Si une variable a été commentée, il suffit de l'ignorer.
2. La position de la variable dans le fichier ne nous intéresse pas non plus. Que `APP_ENV = local` soit sur la première ligne, au milieu du fichier ou juste avant la dernière ligne, peu importe.
3. On peut aussi ignorer certaines variables dont on sait qu'elles doivent différer, comme `APP_KEY` par exemple.

C'est exactement ce que font les trois outils qui entourent `diff` : `grep -v -E '^#|^$'` supprime les commentaires et les lignes vides, `sort` neutralise l'ordre, et le `grep -v 'APP_KEY'` final retire les variables dont vous savez déjà qu'elles seront différentes.

Les options `--suppress-common-lines -y` font le reste : afficher le résultat sur deux colonnes (`-y`) et uniquement les différences (`--suppress-common-lines`).

## Reproduisez-le {#reproduce-it}

Essayons... Ci-dessous, nous allons créer le fichier `.env.example` avec deux lignes, le copier vers `.env` et ajouter une nouvelle ligne dans `.env.example`. Enfin, nous trions `.env.example` pour que l'ordre diffère de celui de `.env`.

<Terminal typewriter source="./files/terminal-1.txt" />

Maintenant que nous avons nos deux fichiers avec une seule différence, la commande ci-dessus donne :

```diff
Left side: .env                   Right side: .env.example
                                > CACHE_DRIVER = redis
```

La colonne de gauche correspond au premier fichier (dans notre exemple `.env`) tandis que la colonne de droite correspond au second (`.env.example`). Donc : `CACHE_DRIVER` n'existe que dans `.env.example`.

Pour l'illustration, ajoutons maintenant une nouvelle clé mais seulement dans `.env` (situation réelle : je code une nouvelle fonctionnalité et j'ajoute une variable comme un interrupteur on/off)

<Terminal typewriter>
$ echo 'ALLOW_FEATURE_DO_THIS = true' >> .env
</Terminal>

La sortie devient :

```diff
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
                                > CACHE_DRIVER = redis
```

Dernier exemple, la même clé avec deux valeurs différentes de chaque côté :

<Terminal typewriter>
$ echo 'DATABASE_TYPE = pgsql' >> .env
$ echo 'DATABASE_TYPE = mysql' >> .env.example
</Terminal>

Et vous retrouvez la sortie de trois lignes montrée en début d'article, où apparaît le marqueur `|` : même clé, valeurs différentes.

## Conclusion {#conclusion}

Personne ne pense à mettre à jour `.env.example` — c'est tout le problème, et aucune bonne intention n'y changera rien. Une commande d'une ligne que vous collez avant chaque commit, si : ça prend deux secondes et ça répond en trois lignes, ou pas du tout.

Une fois que vous savez quelles clés manquent, l'étape suivante est de les ajouter partout sans éditer chaque fichier à la main : <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link>. Et pour utiliser ces variables depuis vos scripts, voyez <Link to="/blog/bash-load-env">Bash - Loading environment variables from a file</Link>.
