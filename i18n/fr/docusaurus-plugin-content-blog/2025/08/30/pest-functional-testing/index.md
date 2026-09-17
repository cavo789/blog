---
slug: pest-functional-testing
title: Écrire des tests fonctionnels avec Pest
date: 2025-08-30
description: Découvrez comment écrire des tests fonctionnels clairs et expressifs avec le framework de test PHP Pest.
authors: [christophe]
image: /img/v2/functional_tests.webp
series: Functional testing
mainTag: tests
tags:
  - laravel
  - php
  - tests
language: fr
blueskyRecordKey: 3lxm2amkjjk2m
updates:
  - date: 2026-07-30
    note: "Pest v5.0.0 released July 24, 2026 (requires PHP 8.4, drops PHPUnit 12). The v4 browser-testing approach in this article remains valid; see pestphp.com for migration notes."
---
<!-- cspell:ignore  -->

![Écrire des tests fonctionnels avec Pest](/img/v2/functional_tests.webp)

<TLDR>
Cet article est un guide complet pour écrire des tests fonctionnels pour votre site web avec Pest v4. Il vous accompagne dans la mise en place d'un environnement de test complet basé sur Docker, en partant de zéro : création d'un Dockerfile et d'un Makefile pour lancer les commandes facilement. Vous allez apprendre à écrire un test navigateur, à l'exécuter contre un site en ligne et à interpréter les résultats. L'article explique aussi comment Pest capture automatiquement des screenshots en cas d'échec, ce qui simplifie le débogage, et donne quelques éclairages sur la technologie sous-jacente comme Playwright.
</TLDR>

L'année dernière, j'ai écrit [Write PHP unit tests using Pest](/blog/pest_tips). Depuis, [Nuno Maduro](https://nunomaduro.com/) a publié [Pest](https://pestphp.com/) en version 4 avec le **browser testing intégré**.

Qu'est-ce que ça veut dire ? Maintenant, en plus des tests unitaires (voir mon article précédent), on peut aussi demander à Pest de visiter un site web et d'y faire des actions : cliquer sur un bouton, remplir des champs (pensez à une page de login, un champ de recherche, ...), soumettre des formulaires, naviguer, ... et donc, oui, lancer des tests fonctionnels.

Un exemple : visiter la page d'accueil de votre site, cliquer dans la zone de recherche, saisir quelques mots-clés, sélectionner le premier élément visible, cliquer dessus et vérifier que la nouvelle page affiche bien un certain texte.

J'ai déjà écrit un article sur Behat, un autre sur Cypress ; c'était logique de faire la même chose avec Pest v4.

<!-- truncate -->

Mon idée, comme toujours, c'est d'utiliser (ou de créer) une image Docker pour pouvoir démarrer immédiatement, sans la douleur de tout installer et configurer.

Voici le résultat : 10 tests fonctionnels exécutés dans un vrai navigateur, en moins de 26 secondes.

![Succès](./images/success.webp)

Et quand un test échoue — ici, volontairement — Pest prend automatiquement un screenshot de ce que le navigateur a réellement vu :

![Le test a échoué](./images/it_can_search_for_a_post.webp)

Pas de screenshot manuel, pas d'étape de débogage séparée : l'échec et la preuve arrivent ensemble. Construisons tout ça.

## Créons un projet temporaire {#lets-create-a-temporary-project}

D'abord, créons un dossier temporaire et allons-y :

<Terminal typewriter>
$ mkdir /tmp/pestphp && cd $_
</Terminal>

Pour l'instant, il n'existe pas d'image Docker prête à l'emploi pour Pest v4, alors créons la nôtre.

Créez un fichier appelé `Dockerfile` dans votre dossier temporaire avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Pour nous faciliter la vie, créons aussi un <Link to="/blog/makefile_tips">`makefile`</Link> afin de pouvoir lancer des commandes très simples comme `make build`, `make up`, ...

Créez un fichier appelé `makefile` dans votre projet avec ce contenu :

<Snippet filename="makefile" source="./files/makefile" />

Et ... on y est presque. Il ne reste plus qu'à créer un script de test Pest. Créez un fichier appelé `tests/Browser/HomepageTest.php` avec ce contenu :

<Snippet filename="HomepageTest.php" source="./files/HomepageTest.php" />

<StepsCard
  title="Notre situation actuelle"
  variant="prerequisites"
  steps={[
    "Nous allons créer notre propre image Docker grâce à notre `Dockerfile`,",
    "Nous allons utiliser un makefile pour nous simplifier la vie et",
    "Nous avons un scénario de test avec 10 tests fonctionnels."
  ]}
/>

## Créer l'image {#create-the-image}

Pour créer l'image Docker, lancez `make build` :

<Terminal typewriter>
$ make build
</Terminal>

<Details label="Vous n'avez pas encore make ? (cliquez pour les détails)">

Lancez `sudo apt-get update && sudo apt-get -y install make`.

<Terminal typewriter>
$ sudo apt-get update && sudo apt-get -y install make
</Terminal>

</Details>

La phase de build peut être lente parce qu'il y a beaucoup de choses à télécharger. L'image finale pèsera environ 2 GB.

![Construction de notre image](./images/make_build.webp)

## Créer le container {#create-the-container}

<Vars name="demo_pest" labels={{ name: "Container name" }} />

Une fois l'image créée, on peut maintenant créer notre container Docker :

<Terminal typewriter>
$ make up

docker run --detach -v ./tests:/var/www/html/tests --name %%name=demo_pest%% pestphp
12e700df85b54becb9eb537a09c5711265aaca730529c461b0e53a17b6928875
</Terminal>

## Lancer les tests {#run-tests}

Et, dernière chose à faire, une fois le container créé, vous pouvez lancer tous les tests simplement avec `make start`.

J'ai **volontairement** introduit une erreur pour illustrer une fonctionnalité sympa :

<Terminal typewriter source="./files/terminal-2.txt" />

Comme on peut le voir, le test `it can search for a post` a échoué alors que les précédents ont réussi.

<AlertBox variant="note">
Vous avez remarqué que les autres tests ont aussi été lancés ? Pest ne s'arrête pas au premier échec.

</AlertBox>

Le truc sympa : Pest a automatiquement pris une capture. Regardez le message d'erreur, il indique qu'un fichier `Tests/Browser/Screenshots/it_can_search_for_a_post` a été créé automatiquement.

![Exécution des tests ; l'un a échoué](./images/running_tests.webp)

Pest a pris un screenshot — le même que celui déjà montré en haut de cet article ; nous recherchions `Create our own Docusaurus React component` (comme codé dans notre scénario `tests/Browser/HomepageTest.php`) et en effet, on ne voit pas du tout ce titre. Mais on voit `React component and provide a "Share on Bluesky" button`, alors mettons à jour le script :

<Snippet filename="HomepageTest.php" source="./files/HomepageTest.part2.php" />

Pas besoin de reconstruire l'image ni de recréer le container ; il suffit de relancer `make start`.

<Terminal typewriter source="./files/terminal-1.txt" />

Félicitations, nous venons de tester 10 fonctionnalités en moins de 26 secondes — le même résultat que celui déjà montré en haut de cet article.

## Pour aller plus loin (passez cette section si vous voulez juste l'utiliser) {#in-depth-skip-this-if-you-just-want-to-use-it}

- Pest utilise [playwright](https://pestphp.com/docs/browser-testing#content-getting-started) ; c'est pour ça que notre Dockerfile est plus complexe, parce qu'on doit aussi installer NodeJS,
- Un truc vraiment cooooool : on n'a pas besoin de `wait_for` un changement sur la page, Pest le fait pour nous. Par exemple, avec Cypress et Behat, quand on clique sur un bouton, on doit attendre que, par exemple, le script Ajax de la page se soit déclenché et que le `DOM element` soit chargé. Avec Pest, on ne doit pas s'en soucier et c'est une fonctionnalité géniale !
- On doit aussi créer un utilisateur spécifique dans l'image Docker pour correspondre à notre utilisateur local. C'est parce que, quand un test échoue, Pest (qui tourne dans Docker) va créer une image et celle-ci doit être créée sur notre machine hôte avec nos UID/GID,
- L'action `make up` définie dans le `makefile` monte notre dossier local `tests` dans le container. Ça veut dire que si on crée de nouveaux fichiers de test ou qu'on modifie les existants, ils seront immédiatement synchronisés avec le container en cours d'exécution ; rien de spécial à faire ici,
- Pour réduire le besoin de fichiers de configuration, une variable système `WEBSITE` a été définie (voir le `makefile`). Cette variable sera créée dans le container. Un script PHP y fera ensuite référence comme ceci : `getenv('WEBSITE')`.
- Il existe un flag `--parallel` pour Pest. Si vous voulez exécuter vos différents fichiers de test en parallèle, éditez le `makefile`, cherchez <Code>docker exec -it <Var name="name">demo_pest</Var> sh -c "WEBSITE=$(WEBSITE) vendor/bin/pest"</Code> et remplacez par <Code>docker exec -it <Var name="name">demo_pest</Var> sh -c "WEBSITE=$(WEBSITE) vendor/bin/pest --parallel"</Code>

<Snippet filename="makefile.diff" source="./files/makefile.diff" />
