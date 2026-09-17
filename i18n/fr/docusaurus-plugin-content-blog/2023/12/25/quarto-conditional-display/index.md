---
slug: quarto-conditional-display
title: Affichage conditionnel avec Quarto
date: 2023-12-25
description: Apprenez à utiliser les fonctionnalités d'affichage conditionnel de Quarto (content-visible, content-hidden) pour contrôler quel contenu apparaît dans les différents formats de sortie (HTML, PDF, Word, slides) à partir d'un seul fichier Markdown.
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
![Affichage conditionnel avec Quarto](/img/v2/quarto.webp)

<TLDR>
Cet article présente les blocs conditionnels `content-visible`/`content-hidden` de Quarto (`::: {.content-visible when-format="html"}`). Ils permettent à une seule source Markdown de produire un contenu différent selon le format de sortie — pratique pour masquer les tableaux trop larges du PDF, retirer les longs listings de code d'un diaporama, ou ajouter une slide de clôture « Merci / Des questions ? » uniquement à la sortie reveal.js.
</TLDR>

Comme moi, vous avez sûrement abandonné Microsoft Word, PowerPoint et compagnie pour tout faire en Markdown. Comme moi, vous utilisez le même fichier markdown pour générer votre documentation en `html`, `pdf`, `docx`, `pptx`, `revealjs`, ... selon les besoins, au cas par cas.

Mon cas d'usage personnel est le suivant. J'ai un seul fichier `readme.md`, parfois volumineux, pour la documentation d'un outil que j'ai créé. Dans ce document, je peux afficher par exemple des tableaux comportant plusieurs colonnes, parfois très larges. Aucun problème si j'affiche la documentation en HTML : le navigateur propose une barre de défilement horizontale. Mais quand je génère un PDF, le tableau *explose* la largeur de ma page et le résultat est affreux.

Même idée : si ma sortie est une page HTML, je peux facilement afficher un listing de quelques dizaines de lignes de mon code source, par exemple pour illustrer une fonctionnalité. En revanche, dans un diaporama, ce serait contre-productif : la slide serait énorme et peu efficace.

Et si mon objectif est de générer un diaporama, la dernière partie de ma documentation sera un chapitre *Merci de votre attention ! Avez-vous des questions ?*. Celui-là ne doit certainement pas apparaître dans la sortie `docx` / `pdf` / `html`. Juste pour l'affichage <Link to="/blog/quarto-revealjs-tips">`revealjs`</Link> (ou <Link to="/blog/quarto-powerpoint">PowerPoint</Link>, si votre public y tient).

<!-- truncate -->

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.
</AlertBox>

## content-visible when {#content-visible-when}

La syntaxe est très simple : il suffit d'utiliser le tag spécial `:::` pour délimiter une zone dans le fichier, puis d'utiliser un filtre spécial appelé `content-visible`. Pour la syntaxe en détail, voyez la [documentation officielle](https://quarto.org/docs/authoring/conditional.html)

Voyons ça en action. Créez un simple fichier markdown (`conditional-display.md`) sur votre disque et appelez quarto avec `quarto render conditional-display.md --to xxx` en remplaçant `xxx` par, par exemple, `docx`, `pdf`, `html`, `revealjs`, ...

<Snippet filename="conditional-display.md">

```markdown
# Conditional display

::: {.content-visible when-format="html"}
This paragraph will only appear in HTML.
:::

::: {.content-visible when-format="docx"}
And this one only when the output format is Word
:::

::: {.content-visible when-format="revealjs"}
I'm part of the slideshow
:::
```

</Snippet>

En rendant l'exemple markdown ci-dessus vers Word, nous obtenons le titre et le paragraphe `when-format="docx"` :

![Affichage conditionnel avec Quarto - docx](./images/docx.webp)

Pour `when-format="html"` aussi, seulement le titre et un paragraphe :

![Affichage conditionnel avec Quarto - html](./images/html.webp)

Pour `when-format="revealjs"`, c'est un peu plus malin puisque revealjs est un document HTML :

![Affichage conditionnel avec Quarto - revealjs](./images/revealjs.webp)

Et comme nous n'avons aucun paragraphe non conditionnel, la conversion en PDF ne donne que le titre.

![Affichage conditionnel avec Quarto - pdf](./images/pdf.webp)

Le `when-format="xxx"` fonctionne donc exactement comme prévu.

<AlertBox variant="info" title="`.content-hidden`">
L'exact opposé est possible avec `.content-hidden`, voyez la [documentation](https://quarto.org/docs/authoring/conditional.html#content-hidden).
</AlertBox>
