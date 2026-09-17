---
slug: bash-load-env
title: Bash - Charger des variables d'environnement depuis un fichier
date: 2023-12-19
description: Apprenez à charger les variables d'environnement d'un fichier .env dans un script Bash, afin d'externaliser la configuration et de réutiliser les variables dans d'autres applications comme Laravel.
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
![Bash - Charger des variables d'environnement depuis un fichier](/img/v2/bash.webp)

<TLDR>
Cet article montre la bonne façon de charger les variables d'un fichier `.env` dans l'environnement d'un script Bash : `set -o allexport; source .env; set +o allexport`. Cette méthode gère correctement les valeurs contenant des espaces — contrairement au pattern `export $(... | xargs)`, très répandu mais peu fiable.
</TLDR>

Imaginez que vous ayez un fichier `.env` comme celui-ci et que vous souhaitiez le traiter dans un script Bash.

<Snippet filename=".env" source="./files/.env" />

Utiliser un fichier de configuration vous permet d'externaliser la gestion de vos constantes, mais aussi de réutiliser les variables d'une autre application, par exemple un site développé en Laravel.

Voyons comment faire cela le plus proprement possible.

<!-- truncate -->

Le snippet provient de [https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807](https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807)

Vous pouvez charger facilement ce fichier dans votre environnement avec les instructions suivantes :

```bash
set -o allexport
source .env
set +o allexport
```

Une fois ceci fait, les variables seront accessibles comme n'importe quelle variable d'environnement dans votre script bash. À la sortie du script, les variables ajoutées sont supprimées (exactement comme dans un sous-shell).

Utiliser source est la meilleure solution pour éviter les problèmes avec, par exemple, les espaces comme dans *Me and myself* : les autres solutions comme `export $(... | xargs)` donneront toujours des résultats imprévisibles.

Pour l'illustrer, créez simplement un fichier appelé par exemple `test.sh` avec ce contenu :

<Snippet filename="test.sh" source="./files/test.sh" />

Avec le fichier `.env` fourni plus haut, nous obtiendrons cette sortie :

<Terminal typewriter>
$ ./test.sh
Christophe Avonture (christophe@me.com)
</Terminal>

C'est, à mon avis, la meilleure et aussi la plus simple façon d'utiliser un fichier externe pour stocker des éléments de configuration en Bash.

Deux autres compagnons `.env` sur ce blog : <Link to="/blog/compare-env-files-cli">Compare environment files in the Linux console</Link>, pour repérer la clé que vous avez oublié de reporter depuis `.env.example`, et <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link>, pour modifier la même variable dans une dizaine de projets d'un coup.
