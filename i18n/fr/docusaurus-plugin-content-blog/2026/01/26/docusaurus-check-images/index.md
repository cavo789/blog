---
slug: docusaurus-check-images
title: Quelques vérifications sur les images de votre site Docusaurus
date: 2026-01-26
description: Un script Python pour vérifier le lazy loading et la taille des images de votre site Docusaurus avec Playwright et BeautifulSoup.
authors: [christophe]
image: /img/v2/check_images.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - python
language: fr
blueskyRecordKey: 3mdcpoxnzjc2h
updates:
  - date: 2026-07-30
    note: "Updated Playwright Python image from v1.57.0-jammy to v1.61.0-jammy (latest as of Jul 2026)."
---

![Quelques vérifications sur les images de votre site Docusaurus](/img/v2/check_images.webp)

<TLDR>
Cet article explique comment imposer le lazy loading sur un blog Docusaurus en surchargeant le composant image MDX par défaut pour injecter automatiquement l'attribut loading. Il détaille ensuite comment valider ce comportement à l'aide d'un script Python et Playwright containerisé qui simule le scroll d'un utilisateur pour contrôler les attributs des images et la taille des fichiers. Ce workflow garantit que les bonnes pratiques de performance sont appliquées et vérifiées de manière cohérente sur tout le contenu du blog.
</TLDR>

Vous me connaissez suffisamment maintenant : la performance me tient à cœur. Pour plein de bonnes raisons, mais surtout parce que c'est amusant d'optimiser les choses et de voir les résultats immédiatement. Et c'est aussi un joli défi !

Mon blog est devenu assez gros (plus de 200 articles) et je voulais m'assurer que toutes les images sont bien chargées en lazy loading — mais comment en être sûr ?

Le lazy load, c'est quoi ? Quand vous chargez une image en lazy loading, vous dites au navigateur de ne la charger qu'au moment où elle est sur le point d'entrer dans le viewport (c'est-à-dire quand l'utilisateur scrolle à proximité). Donc, au lieu de charger toutes les images d'un coup au chargement de la page, seules les images immédiatement visibles sont chargées en premier. Cela réduit le temps de chargement initial et économise de la bande passante, en particulier sur les pages comportant beaucoup d'images.

Dans cet article, je partage comment j'ai imposé le lazy loading sur ce blog Docusaurus et, surtout, comment j'ai automatisé la vérification de ce comportement avec un script Python.

<!-- truncate -->

## Lancer la vérification {#running-the-check}

Une fois le script (montré plus bas) et son container en place, auditer chaque image du site tient en une seule commande :

<Terminal typewriter wrap={true}>
$ docker run -it --rm -v .:/app -w /app --entrypoint /bin/sh mcr.microsoft.com/playwright/python:v1.61.0-jammy -c "pip install --root-user-action=ignore beautifulsoup4 pillow playwright requests >/dev/null && python check-images.py"
</Terminal>

J'obtiens dans la console un rapport indiquant les images auxquelles il manque l'attribut `loading="lazy"`, surtout si elles sont volumineuses.

Par exemple :

![Exemple de sortie](./images/output.webp)

À vous, maintenant, d'agir sur les résultats ! Sur mon propre blog, j'ai ajouté quelques attributs manquants et optimisé des images trop lourdes. J'ai aussi revu mes composants React pour m'assurer qu'ils incluent le lazy loading là où c'est pertinent.

## Étape 1 : imposer le lazy loading dans Docusaurus {#step-1-enforcing-lazy-loading-in-docusaurus}

Par défaut, quand vous écrivez la syntaxe Markdown standard pour une image `![Alt text](image.webp)`, Docusaurus génère une balise HTML `<img>` classique. Les navigateurs modernes supportent l'attribut `loading="lazy"`, mais le framework ne l'ajoute pas toujours automatiquement.

Pour garantir que **chaque image** de mon blog est chargée en lazy loading (et décodée de manière asynchrone), j'ai surchargé le composant `img` par défaut de Docusaurus. J'ai déjà raconté cette histoire deux fois : sous l'angle du composant dans <Link to="/blog/docusaurus-override-img">Change how Docusaurus will create img tags</Link> et sous l'angle du plugin dans <Link to="/blog/docusaurus-lazy-loading">Overrides the generation of img tags with Docusaurus</Link>.

Cela se fait dans `src/theme/MDXComponents.js`. En englobant le composant image par défaut, je peux injecter les attributs dont j'ai besoin :

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" defaultOpen={false} />

Avec ce simple changement, chaque image générée depuis du Markdown possède désormais `loading="lazy"`.

## Étape 2 : faire confiance, mais vérifier {#step-2-trust-but-verify}

Écrire le code est une chose ; s'assurer que ça fonctionne sur des centaines d'articles en est une autre. Je voulais être sûr que :

1. Les images ont bien l'attribut `loading="lazy"`.
2. Les grandes images sont correctement gérées.
3. Le comportement persiste même après une mise à jour du site.

Inspecter les éléments à la main dans les DevTools de Chrome est fastidieux. J'ai donc écrit un **script Python** pour automatiser tout ça.

### Le défi : le scroll {#the-challenge-scrolling}

L'analyse statique (télécharger simplement le HTML) ne suffit pas. Certaines implémentations de lazy loading (ou certains processus d'hydratation) peuvent dépendre du fait que l'utilisateur scrolle réellement la page.

Pour simuler un vrai utilisateur, j'ai utilisé **Playwright**. Il me permet de lancer un navigateur headless, de rendre la page et de scroller jusqu'en bas par programmation, ce qui déclenche les mécanismes de lazy loading.

### Le script {#the-script}

Le script effectue les actions suivantes :

1.  **Parcourt** une liste d'URLs (mes articles de blog).
2.  **Scrolle** plusieurs fois vers le bas de la page (comme un lecteur).
3.  **Parse** le DOM avec `BeautifulSoup`.
4.  **Inspecte** chaque balise `<img>` pour vérifier la présence de `loading="lazy"`.
5.  **Contrôle** les dimensions des images avec `Pillow` pour signaler les images volumineuses qui devraient absolument être en lazy loading.

<Snippet filename="check-images.py" source="./files/check-images.py" defaultOpen={false} />

Vous me connaissez très bien maintenant : j'aime containeriser les choses. Je n'utilisais donc pas Python ni Playwright directement sur ma machine hôte, mais dans un container Docker. Ce container monte le répertoire courant, installe les packages nécessaires et exécute `check-images.py` — exactement la commande montrée en haut de cet article.

<AlertBox variant="note">
Ce script a depuis été retiré de ma boîte à outils et n'est conservé ici qu'à titre de référence ; le code ci-dessus fonctionne toujours comme décrit.
</AlertBox>

### Vérifications supplémentaires {#additional-checks}

Le script réalise aussi ces contrôles :

- Vérifier si le format de l'image est WebP ; sinon, il émet un avertissement.
- Vérifier si le poids de l'image dépasse un certain seuil (200 Ko) ; si oui, il émet un avertissement.
- Vérifier si les attributs de hauteur et de largeur sont définis ; sinon, il émet un avertissement.

Vous pouvez facilement adapter ces vérifications dans le script selon vos besoins. Et ajouter les vôtres !

## Conclusion {#conclusion}

L'optimisation des performances est un chemin, pas une destination. En combinant une surcharge globale dans Docusaurus avec un script de validation automatisé, je peux écrire tranquillement, en sachant que mes images ne ralentiront pas l'expérience de mes lecteurs.

Si le script complet vous intéresse, vous le trouverez dans le dossier `.scripts` de mon repository !
