---
slug: docusaurus-lazy-loading
title: Surcharger la génération des balises img avec Docusaurus
date: 2025-08-27
description: Apprenez à personnaliser le rendu des balises <img> dans Docusaurus pour mieux contrôler la sortie des images.
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - react
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lxekkxhjwc26
---
<!-- cspell:ignore -->

![Surcharger la génération des balises img avec Docusaurus](/img/v2/docusaurus_component.webp)

<TLDR>
Cet article propose une solution simple pour activer le lazy loading des images dans Docusaurus et améliorer les performances. Il explique comment intercepter le rendu par défaut des balises `<img>` en personnalisant le fichier `src/theme/MDXComponents.js`. Avec un simple mapping, vous pouvez forcer le chargement différé de toutes les images et même appliquer des styles personnalisés, sans avoir à créer un composant ou un plugin complexe.
</TLDR>

En cherchant de bons trucs et astuces sur Docusaurus quand le nombre d'articles devient important, j'ai lu qu'il fallait faire attention au lazy loading des images et, en effet, par défaut toutes les images sont chargées dès le premier accès à un article de blog.

Dans cet article, nous allons voir à quel point il est facile d'intercepter la création de la balise `<img>` lorsque le contenu Markdown est converti en HTML.

Cette conversion se produit à deux endroits : quand vous naviguez sur votre site ou quand vous générez une version statique de celui-ci.

<!-- truncate -->

<!-- TODO(author): capture a real DevTools screenshot showing an <img> tag with the loading="lazy" attribute applied, before/after the MDXComponents.js change below — not reproducible in this session (requires a live browser). -->

Pour faire ça, en fait, pas besoin de créer un composant ! Il suffit d'ajouter quelques lignes de code dans le fichier `src/theme/MDXComponents.js`. *Si vous avez besoin de plus que deux ou trois attributs supplémentaires — un `div` wrapper, du CSS personnalisé, un effet de zoom — alors un vrai composant s'impose ; c'est le sujet de <Link to="/blog/docusaurus-override-img">Change how Docusaurus will create img tags</Link>.*

Si vous n'avez pas encore ce fichier, créez-le.

<AlertBox variant="note">
La notation `// [...]` est un marqueur pour vous montrer que vous aurez peut-être déjà quelques lignes de code à cet endroit. Ne la supprimez pas ; ajoutez simplement les lignes surlignées comme ci-dessous.

</AlertBox>

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" />

Une fois l'ajout fait dans votre fichier `MDXComponents.js`, retournez dans le navigateur ; ouvrez n'importe quel article et rafraîchissez la page. Vous verrez que les images ont maintenant l'attribut `loading="lazy"` (vous pouvez le vérifier avec le panneau des outils de développement de votre navigateur). Si, comme dans l'exemple donné ci-dessus, vous avez ajouté du style CSS, vous le verrez immédiatement.

Facile, non ?

Maintenant, comment s'assurer que ça reste vrai sur deux cents articles ? En le vérifiant automatiquement : voyez <Link to="/blog/docusaurus-check-images">Running some checks on your Docusaurus images</Link>.
