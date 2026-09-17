---
slug: cypress
title: Introduction à Cypress
date: 2025-03-30
description: Démarrez avec Cypress pour vos tests fonctionnels. Ce guide complet couvre l'installation, l'exécution des tests dans des containers Docker, la synchronisation de vos fichiers de tests et la capture de screenshots en cas d'erreur.
authors: [christophe]
image: /img/v2/functional_tests.webp
series: Functional testing
mainTag: tests
tags:
  - docker
  - nodejs
  - react
  - tests
language: fr
updates:
  - date: 2026-07-30
    note: "Updated Cypress from 12.17.4→15.19.0 in package.json and cypress/included:14.2.0→15.19.0 in Dockerfiles."
blueskyRecordKey: 3lvnkku4dik2v
---
<!-- cspell:ignore jomla,johndoe -->
![Introduction à Cypress](/img/v2/functional_tests.webp)

<TLDR>
Ce guide propose une introduction pas à pas à Cypress pour automatiser vos tests fonctionnels front-end. Vous allez apprendre à créer un nouveau projet Cypress, écrire vos premiers tests et les exécuter dans un container Docker. Le tutoriel couvre les workflows de développement essentiels : comment synchroniser vos fichiers de tests locaux avec le container pour un retour rapide et comment configurer Docker pour récupérer automatiquement les screenshots d'erreur du container vers votre machine hôte, afin de déboguer facilement.
</TLDR>

Vous avez créé un site web pour vous-même ou pour un client : comment être sûr qu'il fonctionne toujours ? OK, à l'époque où vous travailliez dessus, tout marchait ; le formulaire de recherche, le formulaire de contact, les différents liens étaient tous fonctionnels. Mais comment en être sûr dans le temps ? Ne serait-il pas utile de disposer d'une procédure permettant de lancer plusieurs tests dits « fonctionnels » pour vérifier que tout marche encore ? Cela pourrait faire partie du contrat de maintenance que vous proposez à votre client.

Quel outil utiliser pour ce type de besoin ?

*Les tests fonctionnels répondent à la question « le site fonctionne-t-il toujours ? » ; les tests unitaires répondent à « cette fonction fonctionne-t-elle toujours ? ». Pour ces derniers, voyez <Link to="/blog/pest_tips">Write PHP unit tests using Pest</Link> et <Link to="/blog/bats-unit-tests">Linux - Bash scripts - Running unit tests with bats/bats</Link>.*

Cypress est un outil de test front-end qui permet aux développeurs d'automatiser des tests fonctionnels directement dans le navigateur. Il permet de naviguer entre les pages, d'interagir avec les éléments, de soumettre des formulaires et de vérifier le contenu ou les changements d'URL, ce qui simplifie les tests end-to-end et d'intégration.

En juin 2024, j'ai écrit un article sur un outil de tests fonctionnels PHP appelé <Link to="/blog/behat-introduction">Behat</Link> ; voyons maintenant comment procéder avec Cypress, qui est un outil JavaScript.

<!-- truncate -->

<AlertBox variant="caution" title="Attention, spoiler">
Cypress est vraiment facile à utiliser et écrire des tests est plutôt direct. Contrairement à Behat, qui demande beaucoup plus de compétences et de travail de mise en place, Cypress se prend en main rapidement ; le dépannage est largement simplifié grâce aux screenshots pris dès qu'une erreur survient et Cypress se charge d'attendre le chargement complet d'une page, contrairement à Behat.

</AlertBox>

Une poignée de fichiers, un `docker build`, un `docker run`, et voici le résultat :

![Première exécution](./images/first_run.webp)

<AlertBox variant="info">
À ce stade, vous avez copié quelques fichiers, construit une image Docker, lancé Cypress dans un container et obtenu un message *All specs passed!*.

Si on prend quelques secondes pour y réfléchir, nous avons déjà créé un premier test fonctionnel : s'assurer que notre site est en ligne et que le contenu HTML contient un ensemble de mots que nous nous attendons à y trouver. Si notre site est généré par un CMS, par exemple, le simple fait que le test passe prouve déjà que toute la partie base de données et PHP a parfaitement fonctionné. Un petit test pour nous, un grand pas pour notre confiance envers notre hébergeur.

</AlertBox>

## Créons quelques fichiers et lançons un premier test {#lets-create-some-files-and-run-a-first-test}

Créez un répertoire temporaire :

<Terminal>
$ mkdir -p /tmp/cypress && cd $_
</Terminal>

Créez le fichier `package.json` avec le contenu suivant. L'objectif est d'indiquer que nous avons besoin de la dépendance `cypress` et de définir deux commandes, `open` et `run`.

<Snippet filename="package.json" source="./files/package.json" />

Nous avons aussi besoin d'un fichier de configuration, qui doit s'appeler `cypress.config.js`. Créez ce fichier avec le contenu ci-dessous.

En résumé, nous définissons l'URL de notre moteur Cypress local à `http://localhost:3100`, nous remplaçons le port par défaut `3000` par `3100` et nous précisons que nous n'utilisons pas de fichier de configuration de support Cypress.

<Snippet filename="cypress.config.js" source="./files/cypress.config.js" />

Créons un premier test tout bête : nous allons visiter mon blog et vérifier que, quelque part, mon nom complet apparaît :

<Snippet filename="cypress/e2e/example.cy.js" source="./files/example.cy.js" />

Un fichier optionnel à créer est `.dockerignore` : il indique à Docker de ne pas copier certains fichiers dans notre image Docker. Dans ce tutoriel, nous n'en avons pas vraiment besoin, mais c'est toujours une bonne idée d'avoir ce fichier comme pense-bête : Docker peut ignorer des fichiers lors de la copie des fichiers et répertoires pendant la construction d'une image.

<Snippet filename=".dockerignore" source="./files/.dockerignore" />

Enfin, dernier fichier à créer : notre propre image Docker.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Si nous regardons notre projet actuel dans VSCode, cela ressemble à ceci :

![Notre projet Cypress dans VSCode](./images/vscode.webp)

Pour créer notre image et lancer Cypress, ouvrez une console et lancez cette commande : `clear ; docker build -t cypress-test . && docker run --rm cypress-test`.

Si tout se passe bien, vous obtiendrez la même sortie que celle déjà montrée en haut de cet article.

## Synchroniser les fichiers entre notre host et le container {#synchronize-files-between-our-host-and-the-container}

Bien, ajoutons un nouveau test mais, d'abord, une question : *devons-nous reconstruire notre image Docker encore et encore ?* Certainement pas ! Si nous ne devons pas modifier le `Dockerfile` ou des réglages, ce n'est pas nécessaire.

Mais, jusqu'ici, dans notre `Dockerfile`, nous avons utilisé des instructions `COPY` pour placer nos tests directement dans l'image Docker. Ce n'est pas un problème du tout ; il suffit de dire à Docker d'ignorer ces fichiers et d'utiliser ceux de notre host.

C'est simple.

D'abord, créons un deuxième test :

<Snippet filename="cypress/e2e/navigation.cy.js" source="./files/navigation.cy.js" />

En résumé, nous voulons aller sur la page d'accueil puis cliquer sur l'élément de navigation **Tags**. Nous attendons ensuite que l'URL de la nouvelle page contienne `/tags` et, aussi, que le contenu HTML de la nouvelle page comporte un élément `h1` avec le mot `Tags`.

Et pour lancer ce nouveau test, exécutez simplement `docker run --rm -v ./cypress:/app/cypress cypress-test`.

Comme vous pouvez le voir, ça fonctionne.

![Navigation](./images/navigation.webp)

<AlertBox variant="info" title="Monter un volume">
Donc, en utilisant `-v ./cypress:/app/cypress`, nous montons le dossier `cypress` de notre host dans le dossier `/app/cypress` du container. En modifiant un test sur notre host, Docker répliquera le changement dans le container.

</AlertBox>

### Récupérer les screenshots {#retrieve-screenshots}

Ok, créons un troisième test et, cette fois, nous allons provoquer une erreur.

Créez un troisième fichier.

<AlertBox variant="caution">
Si vous êtes attentif, vous remarquerez une faute d'orthographe, et c'est volontaire.

</AlertBox>

<Snippet filename="cypress/e2e/joomla.cy.js" source="./files/joomla.cy.js" />

Relançons Cypress : `docker run --rm -v ./cypress:/app/cypress cypress-test`.

Quand une erreur survient, Cypress prend un screenshot, comme on le voit sur l'image ci-dessous :

![Prise d'un screenshot](./images/screenshots.webp)

Comme vous le voyez sur l'image, Cypress a pris un screenshot et l'a enregistré dans le dossier `/app/cypress/screenshots/`. Ce dossier est à l'intérieur du container et c'est inutile : nous voulons le récupérer sur notre disque.

Pour cela, nous devons mettre à jour notre image Docker afin de créer un nouvel utilisateur. Au final, nous pourrons partager notre host avec l'instance Cypress en cours d'exécution et déposer sur notre disque les screenshots créés par Cypress.

Remplacez votre Dockerfile existant par celui-ci :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

Le script ci-dessus va créer un utilisateur appelé `johndoe` dans l'image (le nom n'a pas d'importance ici) mais, le plus important, c'est que cet utilisateur aura un UID / GID spécifique.

Ces paramètres sont des arguments de build et nous devons les initialiser comme ceci : `clear ; docker build --build-arg USER_ID=$(id -u) --build-arg GROUP_ID=$(id -g) -t cypress-test .`

<AlertBox variant="info">
Les commandes `id -u` et `id -g` retournent l'ID de notre utilisateur (très probablement `1000`) et son ID de groupe (ici aussi, très probablement `1000`).

</AlertBox>

Cela dit à Docker d'utiliser notre propre user id et group id (ceux que nous utilisons sur notre host) lors de la construction de l'image. Donc, en bref, `johndoe` ce sera nous : si Docker crée un fichier sur notre disque, le fichier appartiendra à l'utilisateur ayant le même UID / GID, donc à nous.

Maintenant que c'est expliqué, nous pouvons lancer la commande complète comme ceci : `clear ; docker build --build-arg USER_ID=$(id -u) --build-arg GROUP_ID=$(id -g) -t cypress-test . && docker run --rm -v ./cypress:/app/cypress cypress-test`.

Nous montons toujours notre dossier `cypress` courant dans le container grâce au flag `-v ./cypress:/app/cypress` mais c'est **bidirectionnel**. Désormais, les fichiers créés par Cypress dans le container (dans le dossier `/app/cypress`) seront aussi copiés sur notre disque. Et comme nous avons pris le temps de créer un utilisateur spécifique dans l'image Docker, les fichiers créés par Docker nous appartiendront.

Notre workspace actuel ressemble à ceci dans VSCode :

![vscode avec nos trois tests](./images/vscode_user.webp)

En lançant `docker run --rm -v ./cypress:/app/cypress cypress-test` une nouvelle fois, nous voyons maintenant les changements :

![Tag Joomla](./images/tag_joomla.webp)

Cypress a pris un screenshot et l'a enregistré sur notre disque. Maintenant, c'est très clair en regardant l'image : l'erreur concerne la vérification `-contains a, jomla` sur la page Tags. Oups, il y a une faute de frappe.

Éditez le fichier `cypress/e2e/joomla.cy.js` et corrigez la faute en écrivant `cy.contains('a', 'joomla').click();`. Relancez Cypress : l'erreur est résolue et le screenshot a disparu.

## Conclusion {#conclusion}

L'idée de ce tutoriel est de rester simple, nous n'irons donc pas plus loin ici.

Si vous êtes francophone, rendez-vous sur [Openclassrooms](https://openclassrooms.com/fr/courses/8157231-automatisez-des-tests-fonctionnels-pour-le-web-avec-cypress), il y a un très bon tutoriel sur Cypress.
