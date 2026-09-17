---
slug: git-precommit
title: Git - pre-commit-hooks
date: 2025-01-10
description: Vous détestez les pipelines CI/CD qui échouent ? Découvrez comment utiliser les hooks Git pre-commit, en particulier le framework pre-commit, pour appliquer vos standards de qualité de code en local avant de pusher.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - git
  - python
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the reformatting proof now comes before the setup steps; added a Conclusion."
---
![Git - pre-commit-hooks](/img/v2/clean_code.webp)

<TLDR>
Évitez les pipelines CI/CD en échec en attrapant les erreurs avant de committer. Cet article explique comment utiliser les hooks Git pre-commit pour appliquer vos standards de qualité de code en local. Il propose un guide pratique pour installer et utiliser le framework `pre-commit`, un outil polyvalent capable de gérer des hooks multi-langages. Vous allez voir comment configurer des hooks pour un projet Python afin de détecter automatiquement des problèmes comme un formatage incohérent, et comment les installer et les lancer. L'article explique aussi où trouver d'autres hooks et quand il est légitime de les contourner.
</TLDR>

Vous aimez le code propre, non ? Et vous détestez recevoir un email de votre outil de versioning (par exemple Github ou GitLab) qui vous annonce que votre dernier commit n'est pas passé, que le formatage de votre code est mauvais ; et tout ça parce que vous avez laissé un espace de trop en fin de ligne ou utilisé des simples quotes au lieu de doubles (ou l'inverse), par exemple.

Vous avez pushé vos modifications, vous êtes déjà passé à autre chose, peut-être un autre projet, et boum, deux heures après votre dernier commit (*parce que le serveur CI traitait plein de pipelines avant le vôtre*), boum, vous recevez un *Your last commit has failed, #gnagnagna*. Je hais ça autant que j'aime le code propre.

Alors, que faire pour éviter ça ?

La réponse est simple ! Avant chaque push, on devrait lancer les mêmes outils d'analyse de code que ceux exécutés dans la CI, c'est-à-dire `phplint`, `php-cs-fixer`, `phpcbf`, `phan`, `phpstan`, ... (pour PHP, tous regroupés dans l'<Link to="/blog/php-jakzal-phpqa">jakzal/phpqa Docker image</Link>) ou `pylint`, `mypy`, `prospector`, `black`, `ruff`, ... (pour Python, voir <Link to="/blog/python-qa">Python - Code Quality tools</Link>) ou `shellcheck` et `shellformat` (pour Bash sous Linux) ou ...

On devrait, mais y pense-t-on chaque fois ? Malheureusement non.

Voyons comment corriger ça.

<!-- truncate -->

## Le résultat : un commit reformaté avant même d'exister {#the-result-a-commit-reformatted-before-it-even-happens}

Voici `pre-commit` en train d'attraper (et de corriger) une violation de formatage, sur un projet de démo que vous allez construire plus bas :

<Terminal>
$ pre-commit run --all-files
</Terminal>

<Terminal typewriter wrap={false} source="./files/terminal-1.txt" />

Vous avez vu la ligne **reformatted main.py** ? Une incohérence de quotes (`"double"` vs `'single'`) a été corrigée silencieusement par `black`, directement dans le stage local :

![Black a reformaté notre script](./images/black.webp)

Pas de run CI, pas d'email deux heures plus tard — la violation ne quitte jamais votre machine.

## Pourquoi ça fonctionne {#why-it-works}

Git propose deux étapes de hooks, `pre-` et `post-` ; un hook `pre-commit` s'exécute *avant* la création du commit et peut l'annuler complètement si quelque chose échoue.

Parmi les outils bâtis sur ce principe ([husky](https://github.com/typicode/husky), [pre-commit](https://github.com/pre-commit/pre-commit), [grumphp](https://github.com/phpro/grumphp), [CaptainHook](https://github.com/captainhookphp/captainhook)), cet article utilise **pre-commit** :

- Il est multi-langages — PHP, Python, Bash, tout ce dont le projet a besoin — un seul fichier de configuration.
- Il lance les mêmes outils que votre CI (`black`, `pylint`, `phpstan`, ...), juste plus tôt et gratuitement, sans runner à attendre.
- Une fois installé, il revérifie automatiquement à chaque `git commit` — rien à retenir, c'est imposé.

## Installation {#installation}

On va créer un nouveau dossier temporaire, lancer `git init` pour initialiser un projet, puis créer une image Docker et lancer un container pour notre démo.

D'abord, créez un dossier temporaire et placez-vous dedans, puis initialisez-le comme repository git (on va travailler hors ligne mais, oui, pour utiliser les hooks git pre-commit, il faut un projet git).

<Terminal>
$ mkdir /tmp/hooks && cd $_
$ git init
</Terminal>

Il nous faut trois fichiers : un `Dockerfile` pour créer notre image Docker Python, un `compose.yaml` pour définir quelques paramètres et `main.py` comme exemple de script Python.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<Snippet filename="main.py" source="./files/main.py" />

On va créer notre image Docker et un container avec cette seule commande : `docker compose up --detach --build`.

Et, maintenant, on entre dans le container en lançant : `docker compose exec app_python /bin/sh`.

Et on peut lancer notre script :

<Terminal typewriter>
$ python main.py

I'm your Python code
Who you, who are you?
</Terminal>

### Installer pre-commit {#installing-pre-commit}

> [https://pre-commit.com/#install](https://pre-commit.com/#install)

Pour un projet Python, c'est vraiment facile, il suffit de lancer `pip install pre-commit`.

### Ajouter un fichier de configuration {#adding-a-configuration-file}

Simple aussi, créez un fichier appelé `.pre-commit-config.yaml` avec ce contenu :

<Snippet filename=".pre-commit-config.yaml" source="./files/.pre-commit-config.yaml" />

### Déclencher le hook manuellement {#manually-fire-the-hook}

`pre-commit` peut être déclenché manuellement mais il faut avoir des fichiers dans le stage local git. Dans cet article, on a créé quelques fichiers, lancez `git add .` simplement pour les mettre dans le stage local git.

Maintenant, pour démarrer manuellement tous les contrôles définis dans le fichier yaml, lancez simplement `pre-commit run --all-files` — c'est exactement la commande et la sortie montrées en haut de cet article.

Vous avez remarqué ma coquille ?

```python
print("I'm your Python code")

print('Who you, who are you?')
```

La première fois, j'ai utilisé des doubles quotes (dans le premier `print`) alors que j'ai utilisé des simples dans le second. J'ai donc (volontairement) créé une violation de code et l'outil `black` l'a vue et a reformaté `main.py`, exactement comme montré plus haut.

## Autres démos {#more-demos}

### Installer les hooks {#install-hooks}

Ok, l'idée n'était pas de déclencher les hooks pre-commit à la main, non ? Lancez simplement `pre-commit install` et, à partir de maintenant, chaque fois que vous lancerez `git commit`, les contrôles `pre-commit` seront d'abord effectués et c'est seulement quand tous les contrôles réussissent (c'est-à-dire qu'ils renvoient tous un code de sortie `0`) que votre commit sera autorisé.

### Quelques hooks en plus {#a-few-more-hooks}

Il existe énormément de hooks et vous pouvez même créer les vôtres :

- [Code spell](https://github.com/codespell-project/codespell/blob/main/.pre-commit-config.yaml#L70), *Check code for common misspellings*
- [Git leaks](https://github.com/gitleaks/gitleaks/blob/master/.pre-commit-hooks.yaml), *Find secrets with Gitleaks*
- [Git lint](https://github.com/jorisroovers/gitlint), *Linting for your git commit messages*
- [Markdown format](https://github.com/hukkin/mdformat/blob/master/.pre-commit-config.yaml), *CommonMark compliant Markdown formatter*
- [Markdownlint](https://github.com/markdownlint/markdownlint/blob/main/.pre-commit-hooks.yaml), *Markdown lint tool*
- [Ruff](https://github.com/astral-sh/ruff-pre-commit/blob/main/.pre-commit-hooks.yaml), *A pre-commit hook for Ruff.*
- [Shell check](https://github.com/shellcheck-py/shellcheck-py?tab=readme-ov-file#as-a-pre-commit-hook), *python3/pip3 wrapper for installing shellcheck*
- [Trufflehog](https://github.com/trufflesecurity/trufflehog/blob/main/.pre-commit-config.yaml), *Find, verify, and analyze leaked credentials*

### Une configuration Python 3.13 prête à l'emploi {#a-ready-made-python-313-config}

Pour un projet Python 3.13, voici mon fichier `.pre-commit-config.yaml` :

<Snippet filename=".pre-commit-config.yaml" source="./files/.pre-commit-config.yaml.part4" />

## Sous le capot (passez ce point si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<AlertBox variant="note">
Si la mécanique vous intéresse, affichez simplement le fichier `.git/hooks/pre-commit`. L'instruction `pre-commit install` a configuré git pour exécuter un petit script Bash appelé `.git/hooks/pre-commit`.

</AlertBox>

### Chercher des hooks et écrire les vôtres {#search-for-hooks-and-write-your-own}

Prenez le temps de parcourir [https://github.com/pre-commit/pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks) pour en découvrir quelques-uns, ou cherchez sur [https://sourcegraph.com/search](https://sourcegraph.com/search) avec des queries comme `context:global file:^\.pre-commit-hooks\.yaml$ "types: [python]"` par exemple ([lien direct](https://sourcegraph.com/search?q=context:global+file:%5E%5C.pre-commit-hooks%5C.yaml%24+%22types:+%5Bpython%5D%22&patternType=keyword&sm=0)).

Comme illustré sur [https://pre-commit.com/#repository-local-hooks](https://pre-commit.com/#repository-local-hooks), vous pouvez ajouter des hooks locaux.

Imaginez : vous avez déjà installé un outil comme `prospector` (pour Python) ou `phpstan` (pour PHP). Ces outils sont installés sur votre machine (vous pouvez donc les appeler en ligne de commande). Il suffit alors d'ajouter un nouveau hook comme ceci :

<Snippet filename=".pre-commit-config.yaml" source="./files/.pre-commit-config.yaml.part2" />

Vous pouvez aussi passer des arguments :

<Snippet filename=".pre-commit-config.yaml" source="./files/.pre-commit-config.yaml.part3" />

## Astuce : --no-verify {#tip---no-verify}

Dans certaines situations, vous devez pusher vos modifications même s'il reste des violations de code. Disons que c'est votre dernière heure avant trois semaines de vacances et que vous travaillez seul sur une branch comme `feat-user-profile`. Vous voulez pusher vos modifications et profiter de la pause.

Dans ce cas, vous pouvez ajouter le flag `--no-verify`, par exemple `git commit -m "wip: not yet finished" --no-verify`. Et là, les hooks pre-commit ne seront pas exécutés, donc vos modifications seront committées.

<AlertBox variant="highlyImportant" title="Le flag --no-verify">
N'utilisez ce flag que si vous savez exactement ce que vous faites. Ce serait une très mauvaise idée de faire ça, par exemple, sur la branch `dev` si vous travaillez en équipe.
</AlertBox>

## Conclusion {#conclusion}

Les emails de CI en échec de l'introduction disparaissent dès que les mêmes contrôles tournent en local, avant que le commit n'existe — `pre-commit` transforme « attendre que le serveur vous le dise » en « le savoir immédiatement ». Installez-le une fois (`pre-commit install`) et tous vos futurs commits sont couverts, dans tous les langages que votre projet mélange.

Gardez `--no-verify` sous le coude pour la rare exception assumée, et consultez <Link to="/blog/python-qa">Python - Code Quality tools</Link> pour les outils sur lesquels reposent les hooks de la démo de cet article.
