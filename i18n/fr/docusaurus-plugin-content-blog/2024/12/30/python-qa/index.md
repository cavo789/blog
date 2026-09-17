---
slug: python-qa
title: Python - Les outils de qualité de code
date: 2024-12-30
description: Améliorez la qualité de votre code Python ! Découvrez 9 outils d'analyse statique essentiels comme Pylint, Black et mypy, ainsi qu'un workflow QA optimal pour un code plus propre et sans bugs.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - devcontainer
  - docker
  - python
language: fr
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the make qa run now opens the article, before the tool-by-tool catalog."
  - date: 2026-07-30
    note: "pydocstyle GitHub repo was archived November 2023 and is no longer maintained; Ruff (see Extra section) is the recommended replacement for docstring checks."
blueskyRecordKey: 3lymragaqr22l
---
<!-- markdownlint-disable-file MD010 -->
<!-- cspell:ignore analyser,pylint,Autoflake,isort,mypy,pyright,pydocstyle,pylintrc,docparams -->
<!-- cspell:ignore rcfile,pyflakes,pycodestyle,mccabe,pyproject -->

![Python - Les outils de qualité de code](/img/v2/clean_code.webp)

<TLDR>
Cet article recense la chaîne d'outils de qualité de code Python de l'auteur — Pylint, Autoflake, isort, Vulture, pydocstyle, mypy, Pyright, Black et Prospector, plus Ruff comme alternative tout-en-un ultra rapide — avec, pour chacun, la commande CLI exacte et le fichier de configuration. Ils sont enchaînés, du plus rapide/plus fondamental en premier, dans une cible `make qa` qui s'arrête au premier échec et n'affiche « CONGRATULATIONS » que si toutes les vérifications passent.
</TLDR>

Si vous êtes un programmeur qui se respecte, vous ne pouvez pas développer sans outils d'analyse de code. Pour les programmeurs PHP, vous en connaissez déjà beaucoup (`rector`, `phpstan`, `phan`, `phpcs`, ...). Voyez mes articles précédents <Link to="/blog/php-rector">Rector 1.0.0, my friend, my coach</Link> et <Link to="/blog/php-jakzal-phpqa">Docker image that provides static analysis tools for PHP</Link>.

Et pour Python ?

<!-- truncate -->

## Le résultat : une commande, neuf vérifications, un seul point d'échec {#the-result-one-command-nine-checks-one-clear-failure-point}

`make qa` enchaîne Pylint, Autoflake, isort, Vulture, pydocstyle, mypy, Pyright, Black et Prospector — l'outil le plus rapide d'abord — et s'arrête au tout premier échec. Voici à quoi ressemble une exécution propre :

<Terminal typewriter source="./files/terminal-qa.txt" />

Rien de vert à chercher : le silence (ou une note comme le `10.00/10` de Pylint) signifie que la vérification est passée. Il en rate une seule et la chaîne s'arrête là — pas de **CONGRATULATIONS**, et une seule chose à corriger avant de relancer.

## Pourquoi ça fonctionne {#why-it-works}

- Les outils s'exécutent du plus rapide/plus fondamental en premier : inutile de lancer un vérificateur de types lent si le code ne se parse même pas — c'est pourquoi Pylint est 1/9 et Autoflake, qui nettoie les imports, est 2/9.
- La chaîne s'arrête au premier échec : une exécution de `make qa`, une chose claire à corriger, pas neuf rapports à recouper.
- `make qa` est un point d'entrée unique : c'est la même cible que vous lancez à la main, que lance un hook pre-commit et que lance la CI — j'y reviens en conclusion.

## Mise en place {#installation}

Je suis un grand fan des outils statiques de qualité de code, et voici ma courte liste, câblée ensemble avec une action <Link to="/blog/tags/makefile">makefile</Link> appelée `qa` :

<Snippet filename="makefile" source="./files/makefile" />

Dès qu'une erreur est détectée, le script s'arrête. Vous ne verrez le message **CONGRATULATIONS**, exactement comme montré ci-dessus, que si les neuf vérifications réussissent.

## Plus de démos : les neuf outils, un par un {#more-demos-the-nine-tools-one-by-one}

### 1. Pylint, l'analyseur statique {#1-pylint}

>[https://pypi.org/project/pylint/](https://pypi.org/project/pylint/)
>
> [Extension VSCode](https://marketplace.visualstudio.com/items?itemName=ms-python.pylint)
>
> Pylint est un analyseur de code statique pour Python 2 ou 3. La dernière version supporte Python 3.9.0 et supérieur.
>
> Pylint analyse votre code sans réellement l'exécuter. Il cherche les erreurs, applique un standard de codage, repère les code smells et peut suggérer comment le code pourrait être refactorisé.

Commençons par le commencement : assurez-vous que votre code Python n'a pas d'erreurs de syntaxe — pas de mauvaise indentation, pas de `:` oublié à la fin d'une instruction de contrôle (comme un `if` ou un `for`).

Je le lance comme ceci : `pylint . --rcfile .config/.pylintrc`.

<Snippet filename=".config/.pylintrc" source="./files/.pylintrc" />

### 2. Autoflake, le nettoyage des imports inutilisés {#2-autoflake}

> [https://pypi.org/project/autoflake/](https://pypi.org/project/autoflake/)
>
> Autoflake supprime les imports et les variables inutilisés du code Python. Il s'appuie sur pyflakes pour cela.
>
> Par défaut, Autoflake ne supprime que les imports inutilisés des modules faisant partie de la bibliothèque standard. (D'autres modules peuvent avoir des effets de bord rendant leur suppression automatique risquée.) La suppression des variables inutilisées est également désactivée par défaut.
>
> Autoflake supprime aussi par défaut les instructions pass inutiles.

Je le lance comme ceci : `autoflake --remove-unused-variables --remove-all-unused-import --recursive .`

### 3. isort, le tri des imports {#3-isort}

> [https://pycqa.github.io/isort/](https://pycqa.github.io/isort/)
>
> [Extension VSCode](https://marketplace.visualstudio.com/items?itemName=ms-python.isort)
>
> `isort` trie vos imports, pour que vous n'ayez pas à le faire.
>
> isort est un utilitaire / une bibliothèque Python qui trie les imports par ordre alphabétique et les sépare automatiquement en sections et par type. Il fournit un utilitaire en ligne de commande, une bibliothèque Python et des plugins pour divers éditeurs afin de trier rapidement tous vos imports. Il nécessite Python 3.7+ pour fonctionner mais sait aussi formater du code Python 2.

Je le lance comme ceci : `isort .`

Note : j'ai aussi configuré mon VSCode avec ce réglage `"python.sortImports.args": ["--profile", "black"]` pour que les instructions d'import soient triées automatiquement pendant que je code.

### 4. vulture, la détection de code mort {#4-vulture}

> [https://github.com/jendrikseipp/vulture](https://github.com/jendrikseipp/vulture)
>
> Vulture trouve le code inutilisé dans les programmes Python. C'est utile pour nettoyer et trouver des erreurs dans de grandes bases de code. Si vous lancez Vulture à la fois sur votre bibliothèque et sur votre suite de tests, vous pouvez repérer le code non testé.
>
> À cause de la nature dynamique de Python, les analyseurs statiques comme Vulture risquent de manquer du code mort. Par ailleurs, du code appelé uniquement de manière implicite peut être signalé comme inutilisé. Malgré tout, Vulture peut être un outil très utile pour une meilleure qualité de code.

Je le lance comme ceci : `vulture --min-confidence 100 .`

<AlertBox variant="danger">
Attention avec Vulture : son algorithme détecte beaucoup de faux positifs, c'est pourquoi, dans mon processus d'automatisation, j'ai utilisé `--min-confidence 100` pour être sûr de n'avoir **que** du vrai code / de vraies variables inutilisés.

</AlertBox>

Note : j'ai aussi configuré mon VSCode avec les réglages ci-dessous pour que, pendant que je code, VSCode me signale les éléments inutilisés et que je puisse réagir immédiatement.

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

### 5. pydocstyle, la qualité des docstrings {#5-pydocstyle}

> [https://www.pydocstyle.org/en/stable/](https://www.pydocstyle.org/en/stable/)
>
> `pydocstyle` est un outil d'analyse statique qui vérifie le respect des conventions de docstrings Python.

Cet outil vérifie la qualité de vos commentaires, comme les descriptions de vos fonctions et, par exemple, s'assure que si vous avez une fonction avec deux arguments, votre description explique les deux arguments (il y a un contrôle sur le nom et sur le type).

Je le lance comme ceci : `pydocstyle --config=.config/.pydocstyle`

<Snippet filename=".config/.pydocstyle" source="./files/.pydocstyle" />

<AlertBox variant="caution">
Le repository GitHub de pydocstyle a été archivé en novembre 2023 et n'est plus activement maintenu. La communauté recommande de migrer vers **Ruff** (voir la section « Sous le capot » ci-dessous), qui couvre des vérifications de docstrings équivalentes via son jeu de règles compatible `pydocstyle`.
</AlertBox>

### 6. mypy, le typage statique {#6-mypy}

> [https://github.com/python/mypy/](https://github.com/python/mypy/)
>
> Mypy est un vérificateur de types statique pour Python.
>
> Les vérificateurs de types aident à s'assurer que vous utilisez correctement les variables et les fonctions de votre code. Avec mypy, ajoutez des annotations de type (PEP 484) à vos programmes Python, et mypy vous avertira quand vous utiliserez ces types de façon incorrecte.
>
> Python est un langage dynamique : d'ordinaire, vous ne voyez les erreurs de votre code qu'au moment de l'exécuter. Mypy est un vérificateur statique, il trouve donc les bugs de vos programmes sans même les exécuter !

Je le lance comme ceci : `mypy --config-file .config/.mypy.ini .`

<Snippet filename=".config/.mypy.ini" source="./files/.mypy.ini" />

### 7. Pyright, l'autre vérificateur de types {#7-pyright}

> [https://github.com/microsoft/pyright](https://github.com/microsoft/pyright)
>
> Pyright est un vérificateur de types statique complet et basé sur les standards pour Python. Il est conçu pour la performance et peut être utilisé sur de grandes bases de code Python.

Je l'utilise comme ceci : `pyright --project .config/pyright.json`

<Snippet filename=".config/pyright.json" source="./files/pyright.json" />

### 8. Black, le formatage automatique {#8-black}

> [https://black.readthedocs.io/en/stable/](https://black.readthedocs.io/en/stable/)
>
> [Extension VSCode](https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter)
>
> En utilisant Black, vous acceptez de céder le contrôle sur les détails du formatage manuel. En échange, Black vous donne de la vitesse, du déterminisme et la liberté de ne plus subir les remarques de pycodestyle sur le formatage. Vous économiserez du temps et de l'énergie mentale pour des sujets plus importants.
>
> Black accélère la revue de code en produisant les diffs les plus petits possibles. Le code passé à Black a la même allure quel que soit le projet que vous lisez. Le formatage devient transparent au bout d'un moment et vous pouvez vous concentrer sur le contenu.

Je l'utilise comme ceci : `black --config .config/black.toml .`

<Snippet filename=".config/black.toml" source="./files/black.toml" />

### 9. prospector, l'inspection globale {#9-prospector}

> [https://github.com/prospector-dev/prospector/](https://github.com/prospector-dev/prospector/)
>
> Inspecte les fichiers source Python et fournit des informations sur le type et l'emplacement des classes, méthodes, etc.

Je l'utilise comme ceci : `prospector . --profile .config/prospector.yaml --pylint-config-file .config/.pylintrc`

<Snippet filename=".config/prospector.yaml" source="./files/prospector.yaml" />

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### En bonus - Ruff, un remplaçant potentiel pour plusieurs outils {#extra---ruff-a-potential-replacement-for-several-tools}

> [https://github.com/astral-sh/ruff](https://github.com/astral-sh/ruff)
>
> Ruff, un linter et formateur de code Python extrêmement rapide, écrit en Rust.
>
> [Extension VSCode](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)

Pour l'instant, j'ai trop peu d'expérience avec Ruff, je préfère donc l'ajouter en **bonus**.

La documentation indique qu'il est extrêmement rapide et je dois avouer que, la première fois que je l'ai lancé, je pensais que rien ne s'était passé (vraiment trop rapide). J'ai introduit une erreur volontaire dans mon code et elle a été correctement détectée : oui, l'outil est extrêmement rapide.

D'après la documentation de Ruff, cet outil peut remplacer complètement Pylint (le linter), Autoflake (suppression des imports/variables inutilisés) et Black (l'outil de formatage), mais il ne remplace pas MyPy ni Pyright (doc).

Je l'utilise comme ceci : `ruff format --cache-dir /tmp/ruff --config .config/pyproject.toml .` et `ruff check --cache-dir /tmp/ruff --config .config/pyproject.toml .`

<Snippet filename=".config/pyproject.toml" source="./files/pyproject.toml" />

## Conclusion {#conclusion}

Neuf outils, une commande, un seul point d'échec — `make qa` transforme le « est-ce que j'ai pensé à tout vérifier ? » en une exécution déterministe unique, la vérification la plus rapide/fondamentale d'abord, qui s'arrête dès que quelque chose cloche.

Le lancer à la main suppose quand même que vous y pensiez. Deux façons de l'automatiser : <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> refuse le commit quand une vérification échoue, et <Link to="/blog/dagger-python">Dagger.io - Using dagger to automate your CI workflows</Link> exécute exactement les mêmes étapes en local et dans votre CI.
