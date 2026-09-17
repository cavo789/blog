---
slug: gemini-meerkat
title: Comment j'ai utilisé Google Gemini Nano Banana sur mon blog
date: 2025-09-29
description: Découvrez comment Google Gemini Nano a servi à générer toutes les images personnalisées de ce blog, y compris une mascotte suricate.
authors: [christophe]
tried_it: false
image: /img/v2/gemini.webp
mainTag: ai
tags:
  - ai
  - docusaurus
language: fr
blueskyRecordKey: 3lzxdr6w3e223
---
<!-- markdownlint-disable MD049 -->
<!-- cspell:ignore clipart,lzxdr -->

![Comment j'ai utilisé Google Gemini Nano Banana sur mon blog](/img/v2/gemini.webp)

<TLDR>
Cet article raconte comment l'auteur a utilisé Google Gemini pour créer toutes les bannières personnalisées et une mascotte suricate pour son blog. Il explique comment utiliser la génération image-vers-image de Gemini pour obtenir différentes poses et scènes mettant en scène la mascotte. L'auteur partage des conseils pratiques pour obtenir les meilleurs résultats : fournir des images de référence pour la cohérence du style, préciser le format d'affichage et itérer sur les prompts. Le billet aborde aussi les difficultés, comme faire afficher correctement du texte par l'IA, tout en exprimant son admiration pour la puissance de cette technologie.
</TLDR>

Ces derniers jours, j'ai utilisé [Google Gemini](https://gemini.google.com/app) pour refaire toutes les images de mon blog, et ceux qui me connaissent peuvent compter le nombre de fois où j'ai exprimé mon admiration pour cette technologie. Prodigieux, incroyable, dingue... mais, en même temps, inquiet de voir à quel point ces avancées vont fragiliser toute une génération de jeunes qui vont se lancer dans ces métiers.

Dans cet article, voyons comment j'ai procédé pour générer ces images.

*Deux notes pratiques : avant Gemini, j'utilisais <Link to="/blog/ai-image-generation">recraft.ai</Link> ; et quel que soit le générateur, chaque image est compressée en WebP avec <Link to="/blog/reduce-image-size">CaesiumCLT</Link> avant d'arriver sur le blog.*

<!-- truncate -->

D'abord, et un peu par hasard, j'ai demandé à Gemini de générer une image de suricate en style clipart. J'ai obtenu celle-ci :

![Le suricate](/img/meerkat/suricate.webp)

Quelques jours plus tard, j'ai découvert ce repository GitHub : [Awesome-Nano-Banana-images](https://github.com/PicoTrex/Awesome-Nano-Banana-images/blob/main/README_en.md) et je n'avais qu'une envie : essayer.

Il y avait un exemple : uploader une image (mon personnage de suricate) et utiliser ce prompt : _Please create a pose sheet for this illustration, making various poses!_

![Différentes poses](./images/different_positions.webp)

C'est-à-dire :

<StepsCard
  variant="steps"
  steps={[
    "Je clique sur le bouton \"Image\" (voir l'icône banane) pour dire à Gemini que je veux créer une image",
    "J'ai cliqué sur le bouton \"+\" pour uploader mon personnage de suricate (comme image `.png`)",
    "Je tape mon prompt"
  ]}
/>

Et après quelques secondes à peine, l'inimaginable s'est produit : j'ai reçu une avalanche de propositions, toutes plus impressionnantes les unes que les autres.

![Différentes poses - Résultat](./images/different_positions_result.webp)

En répétant le même prompt encore et encore, j'en ai obtenu d'autres :

![Différentes poses - 1](/img/meerkat/suricate_positions_1.webp)

![Différentes poses - 2](/img/meerkat/suricate_positions_2.webp)

![Différentes poses - 3](/img/meerkat/suricate_positions_3.webp)

![Différentes poses - 4](/img/meerkat/suricate_positions_4.webp)

Quelle facilité, c'est dingue.

Pour générer toutes les images de ce blog, j'ai utilisé le plan gratuit de Gemini, qui m'a permis de créer une dizaine d'images par jour.

Mes conseils :

- Chaque fois, uploadez les images que l'IA doit réutiliser (mon suricate, tel ou tel logo à intégrer, etc.) et celles dont elle doit s'inspirer (j'ai uploadé trois ou quatre bannières qu'elle avait déjà créées à chaque fois et je lui ai demandé de *créer la nouvelle bannière dans le même style que celles déjà créées*).
- Presque à chaque fois, j'ai dû lui rappeler que je voulais une image horizontale, au format 16:9.
- Parfois, je lui demandais d'afficher un texte précis, par exemple *The text on the image should look like ‘Docker: Tips and Tricks’*, mais il se trompait bien trop souvent. Même quand je lui disais de se corriger, il refaisait les mêmes erreurs. Au final, je n'avais que deux choix : lui interdire d'ajouter du texte, ou retoucher les images à la main et, par exemple, inverser deux lettres.

Souvent, l'image était impressionnante dès le premier résultat, mais parfois je lui disais que je n'aimais pas trop, et dans ces cas-là, je précisais mon prompt et je guidais l'image dans la direction voulue, du genre *The meerkat will process a lot of input files then do some magic and generate output tables*, *I want the meerkat to be dressed up as a dinosaur (like the Docusaurus logo) and have blue wings (like the BlueSky logo)*. Et le plus souvent, les images étaient encore plus impressionnantes.

![Extract, Transform and Load](/img/v2/etl.webp)

![Exécution de tests automatisés](/img/v2/functional_tests.webp)

![Créer un composant Docusaurus et se connecter à BlueSky](/img/v2/docusaurus_bluesky.webp)

La bannière de mon prochain article :

![Bannière d'avertissement pour vieil article](./images/old_blog_post_notice.webp)

Les images ne sont pas le seul endroit où Gemini se rend utile sur ce blog : je m'en sers aussi pour rédiger des <Link to="/blog/gemini-tldr">résumés TL;DR automatisés</Link>, et je signale chaque article assisté par IA de la même manière — voyez <Link to="/blog/docusaurus-ai-gemini">comment j'indique le contenu assisté par IA</Link> dans Docusaurus.
