---
slug: json-lint
title: JSON - Linter en ligne
date: 2024-11-08
description: Un outil de lint JSON en ligne, simple et rapide. Collez votre chaîne JSON pour l'afficher sous forme d'arborescence claire et lisible, avec folding du code.
authors: [christophe]
image: /img/v2/json.webp
series: code quality
mainTag: linux
tags:
  - code-quality
  - linux
  - vscode
language: fr
review_date: 2026-07-30
---
![JSON - Linter en ligne](/img/v2/json.webp)

<!-- cspell:ignore favourites, analyse -->

<TLDR>
Cet article présente l'outil gratuit JSON Linter de l'auteur (sources sur GitHub, hébergé sur jsonlint.avonture.be) pour coller une chaîne JSON et la visualiser sous forme d'arborescence lisible et repliable — pratique à la fois pour vérifier la syntaxe du JSON que vous écrivez et pour inspecter les réponses d'une API. Il mentionne aussi l'extension Chrome « JSON Formatter », qui formate automatiquement les pages JSON dans le navigateur.
</TLDR>

Exactement comme mon <Link to="/blog/sql-formatter">SQL - Formatting tool</Link>, il est toujours utile d'avoir dans ses favoris un outil qui permet de copier/coller une chaîne de caractères JSON et de l'afficher sous forme d'arborescence, avec ou sans folding du code.

Je l'utilise assez régulièrement quand j'écris une chaîne JSON et que je veux vérifier qu'il n'y a pas d'erreurs de syntaxe (lint) ou, à l'inverse, par exemple, quand j'appelle une API qui renvoie du JSON et que je veux analyser le code reçu. Dans ces cas-là, la fonction de repli est très pratique.

*Deux alternatives selon le contexte : <Link to="/blog/linux-jq">`jq`</Link> quand vous êtes déjà dans une console, et <Link to="/blog/json-crack">Rendering a JSON file as a mind map</Link> quand la structure compte plus que les valeurs. Pour produire du JSON de test plutôt que le lire, voyez <Link to="/blog/json-faker">JSON - Faker & Mockup</Link>.*

<!-- truncate -->

Retrouvez mon outil **JSON Linter** et ses sources sur [https://github.com/cavo789/jsonlint](https://github.com/cavo789/jsonlint).

L'outil est accessible en ligne : [https://jsonlint.avonture.be/](https://jsonlint.avonture.be/)

![Demo](./images/json_lint_demo.gif)

## Extension Chrome {#chrome-addon}

Si vous utilisez Chrome et que la sortie d'une page web est une chaîne JSON, l'extension [JSON Formatter](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa) l'affichera immédiatement sous une forme lisible.

Par exemple, au lieu d'obtenir cette page :

![Json webpage](./images/json_page.webp)

Chrome affichera ceci :

![Chrome addon](./images/chrome_addon.webp)

D'autres outils JSON qui valent le détour : <Link to="/blog/json-crack">afficher un fichier JSON sous forme de carte mentale</Link> et <Link to="/blog/json-faker">générer de fausses données JSON</Link>.
