---
slug: quarto-project-variables
title: Utiliser des variables depuis un fichier externe dans votre projet Quarto
date: 2024-01-03
description: Arrêtez le hardcoding ! Apprenez à gérer et réutiliser facilement vos variables dans votre documentation Quarto grâce à des fichiers YAML externes et des variables d'environnement.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - markdown
  - quarto
language: fr
review_date: 2026-07-30
---
![Utiliser des variables depuis un fichier externe dans votre projet Quarto](/img/v2/quarto.webp)

<TLDR>
Cet article montre comment éviter de coder en dur des valeurs récurrentes (IP, chemins, emails) dans une documentation Quarto : on les stocke dans un fichier `_variables.yml` et on y fait référence avec les short codes `{{< var xxx >}}`, ou via `{{< meta xxx >}}` pour les métadonnées du document. Il couvre aussi la lecture de valeurs depuis un fichier `.env` avec `{{< env xxx >}}`, chargé avec `--env-file` lors du rendu de Quarto dans Docker.
</TLDR>

Mon cas d'usage est le suivant : je dois rédiger une longue documentation technique où je dois fournir des informations comme les adresses IP des serveurs utilisés, des chemins vers l'application, des dossiers de configuration, ...

La *manière normale de faire* consiste à mettre ces informations directement dans la documentation et à veiller à mettre à jour chaque occurrence en cas de changement durant le cycle de vie de l'application.

La meilleure approche est probablement d'utiliser un fichier externe où l'information est stockée sous forme clé-valeur et, pendant le processus de rendu de Quarto, de remplacer les short codes par les valeurs.

<!-- truncate -->

## Ce que les variables Quarto vous apportent {#what-quarto-variables-do-for-you}

Vous écrivez ceci dans votre source Markdown :

```markdown
Version {{< var version >}} is a minor upgrade.

Please contact us at {{< var email.info >}}.
```

Et voici ce que Quarto affiche :

![Utiliser des variables avec Quarto](./images/variables.webp)

Le numéro de version et l'adresse email vivent désormais dans un seul fichier. Changez-les là, relancez le rendu, et chaque page de la documentation est à jour — y compris les vingt endroits que vous auriez oubliés.

Il suffit de : un `_variables.yml` contenant vos clés-valeurs, un `_quarto.yml` (qui peut être vide), et les short codes `{{< var >}}` / `{{< meta >}}` dans votre texte.

## Mise en place {#setting-it-up}

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

Vous trouverez la documentation officielle sur [https://quarto.org/docs/authoring/variables.html](https://quarto.org/docs/authoring/variables.html).

Voici comment procéder :

<StepsCard
  variant="steps"
  steps={[
    "D'abord, c'est obligatoire, vous devez avoir un fichier nommé `_quarto.yml` dans le même répertoire que le fichier (disons `documentation.md`) que vous allez convertir avec Quarto. *Note : ce fichier peut être vide (voir [https://github.com/quarto-dev/quarto-cli/issues/2918](https://github.com/quarto-dev/quarto-cli/issues/2918) pour plus d'informations).*",
    "Ensuite, vous devez créer un fichier nommé `_variables.yml` avec vos clés-valeurs et, enfin,",
    "Il vous faut votre fichier markdown.",
  ]}
/>

Donc, `_quarto.yml` peut rester vide. Sa présence sert juste à dire à Quarto que le fichier markdown fait partie d'un projet.

Voici un exemple de ce que peut contenir un `_variables.yml` :

<Snippet filename="_variables.yml" source="./files/_variables.yml" />

Et voici un exemple de markdown (fichier `documentation.md`) :

<Snippet filename="documentation.md">

```markdown
---
title: Testing of variables short code.
---

{{< meta title >}}

Version {{< var version >}} is a minor upgrade.

Please contact us at {{< var email.info >}}.

Quarto includes {{< var engine.jupyter >}} and
{{< var engine.knitr >}} computation engines.
```

</Snippet>

Comme vous pouvez le voir, le short code ressemble à `{{< meta xxx >}}` ou `{{< var xxx >}}`.

`meta` sert aux métadonnées du document, comme son titre, et `var` à récupérer des informations depuis `_variables.yml`.

Lancez le rendu avec `quarto preview documentation.md --to html` et vous obtenez la page montrée au début de cet article.

## Variables d'environnement {#environment-variables}

Vous pouvez aussi récupérer des variables d'environnement avec `{{< env xxx >}}` mais, là, vous devez d'abord charger ces variables si nécessaire.

Par exemple, vous pouvez avoir un fichier `.env` comme celui-ci :

<Snippet filename=".env" source="./files/.env" />

Ensuite, avant d'appeler le processus de rendu de Quarto, vous devez charger le fichier. Comme j'utilise Docker, je fais ceci :

<Terminal typewriter>
$ docker run --rm -it -v .:/input -w /input --env-file .env cavo789/quarto quarto preview documentation.md --to html
</Terminal>

Voici le contenu de `documentation.md` :

<Snippet filename="documentation.md">

```markdown
---
title: Testing of variables and env short codes.
---

:::{.callout-tip}
## Environment variables

{{< env APPLICATION_NAME >}} v.{{< env VERSION_NUMBER >}}
:::

{{< meta title >}}

Version {{< var version >}} is a minor upgrade.

Please contact us at {{< var email.info >}}.

Quarto includes {{< var engine.jupyter >}} and
{{< var engine.knitr >}} computation engines.

```

</Snippet>

J'utilise donc `--env-file .env` dans l'instruction `docker run` pour que Docker charge mes variables et les rende disponibles dans le container. Quarto peut alors y accéder.

![Utiliser des variables d'environnement](./images/environment.webp)

Cette solution est encore meilleure si vous avez une application comme Laravel, et donc déjà un fichier .env de ce type. Résultat : vous réutilisez les mêmes valeurs pour l'application et pour la documentation.

## Conclusion {#conclusion}

Les variables sont le bon outil quand ce qui se répète est une *valeur* : un numéro de version, une IP, une adresse de support, un chemin. Elles coûtent deux fichiers et sont rentabilisées dès le premier serveur renommé.

Quand ce qui se répète est une structure de page entière plutôt qu'une valeur, les variables ne suffisent plus — et c'est là que <Link to="/blog/quarto-mustache">Using Mustache templating with Quarto</Link> prend le relais.
