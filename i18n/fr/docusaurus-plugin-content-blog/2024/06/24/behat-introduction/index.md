---
slug: behat-introduction
title: Introduction à Behat
date: 2024-06-24
description: Apprenez à utiliser Behat, le framework open source de Behavior-Driven Development (BDD) pour PHP. Cette introduction couvre l'écriture de tests fonctionnels puissants en langage naturel et la mise en place de votre premier projet.
authors: [christophe]
image: /img/v2/functional_tests.webp
series: Functional testing
mainTag: tests
tags:
  - docker
  - php
  - tests
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lxm22j3pa22t
---
<!-- cspell:ignore behat,skel,johndoe,chromedriver,gerkin,dmore,nohup,autoload -->
![Introduction à Behat](/img/v2/functional_tests.webp)

<TLDR>
Ce tutoriel présente le Behavior-Driven Development (BDD) en PHP avec Behat et Docker. Il couvre la mise en place d'un environnement de test avec Chrome et Mink, l'écriture de scénarios Gherkin et l'implémentation des définitions d'étapes pour automatiser les tests fonctionnels d'applications web.
</TLDR>

> Lisez aussi mon article sur <Link to="/blog/cypress">Cypress</Link>

Au travail, je fais partie d'une équipe de développeurs PHP qui construit ensemble une très grosse application propriétaire avec une interface web.

Cette application est développée avec le framework Laravel et nous utilisons [PHPUnit](https://phpunit.de/index.html) et [Pest](https://pestphp.com/) pour exécuter nos tests unitaires (voir <Link to="/blog/pest_tips">Write PHP unit tests using Pest</Link>).

Mais en plus des tests unitaires, nous mettons aussi en place un outil qui simule des actions sur notre interface : accéder à la page de login, saisir un identifiant et un mot de passe, simuler le clic sur le bouton « login », attendre que notre écran principal s'affiche puis, sur la nouvelle page, vérifier un tas de choses / effectuer un tas de tâches.

C'est un peu comme demander à un humain de rejouer des scénarios encore et encore, chaque jour, pour s'assurer que nous n'avons pas introduit de régression dans nos derniers développements — par exemple une belle nouvelle fonctionnalité dont les changements de code ont cassé une fonctionnalité existante.

Pour cela, nous utilisons [Behat](https://docs.behat.org/en/latest/). C'est une dépendance PHP [composer](https://getcomposer.org/) que vous pouvez ajouter à votre projet (ou à un nouveau). L'idée est de pouvoir écrire des assertions en anglais (ou en français) courant, du genre « je vais sur le site ABC puis je clique sur l'entrée de menu blog et je devrais recevoir une liste d'articles » ou « dans la zone de recherche, je tape Docker puis je clique sur le bouton de recherche et je devrais recevoir des articles portant le tag Docker ».

Dans cet article, nous allons en apprendre plus sur Behat et voir comment l'utiliser pour un premier test.

<!-- truncate -->

Comme on peut le lire sur le site de [Behat](https://docs.behat.org/en/latest/), *Behat est un framework open source de Behavior-Driven Development pour PHP. C'est un outil qui vous aide à livrer un logiciel qui compte, grâce à une communication continue, une découverte délibérée et l'automatisation des tests.* Cela veut dire que vous pouvez commencer à écrire vos scénarios avant même de coder. Vous pouvez demander à votre client d'écrire ses assertions en langage courant. Ensuite, le développeur se met à coder et, une fois terminé, il lui suffit d'exécuter les scénarios écrits pour s'assurer que le logiciel répond aux exigences du client.

## Introduction au BDD - Behavior-Driven Development {#introduction-to-bdd---behavior-driven-development}

Imaginez que vous êtes un client et que vous demandez à un développeur de créer un nouveau site web. Dans votre cahier des charges, vous lui écrivez des choses comme :

- En tant que visiteur, je voudrais une entrée de menu qui, une fois cliquée, va (faire ceci) ;
- En tant que visiteur, je veux pouvoir accéder à un moteur de recherche qui me permet de faire une sélection dans une catégorie d'articles puis, dans cette catégorie, de lancer une recherche sur le mot (un mot). Une liste d'articles sur ce thème s'affiche alors ;
- En tant que gestionnaire du site, je veux pouvoir me connecter à une interface d'administration et, après un login réussi, je dois voir les options (liste des fonctionnalités) ;
- En tant que gestionnaire du site, je dois pouvoir ajouter un nouvel article où je dois spécifier un titre, une catégorie, une image principale et un texte. Une fois enregistré, je dois voir le nouvel article dans la liste des articles et, en triant la liste sur la date/heure de création, il doit être le premier de la liste ;
- (et beaucoup plus)

En termes Behat, ces phrases s'appellent des scénarios. Vous pouvez les écrire avant même que le site existe. Et pendant les étapes de codage, le développeur exécutera vos scénarios de temps en temps. Au premier lancement, tous les scénarios vont échouer (le site n'existe pas ; les fonctions demandées ne sont pas encore développées). Le développeur travaillera sur l'une ou l'autre fonctionnalité ; il relancera les tests BDD et, au fil du projet, les scénarios passeront au vert jusqu'à la fin du projet, quand tous les scénarios seront réussis et que le projet pourra vous être envoyé pour recette.

## Résultat {#result}

Un scénario est juste un fichier `.feature` écrit en anglais courant, une ligne par étape :

<Snippet filename="Blog.feature" source="./files/Blog.feature" />

<StepsCard
  title="Ce scénario utilise trois étapes :"
  variant="steps"
  steps={[
    '`Given I am on "https://www.avonture.be"`',
    '`Then I click on the "Blog" menu item` et',
    '`Then I should be on "/blog"`.'
  ]}
/>

Avant d'écrire une seule ligne de PHP, demandez simplement à Behat de l'exécuter — il comprend déjà le
scénario et nous dit exactement ce qui manque encore :

![Premier lancement](./images/first_run.webp)

C'est tout l'argument : des étapes en langage courant, analysées et suivies par Behat, et du PHP uniquement pour
faire en sorte que chaque étape *fasse* réellement quelque chose. Le reste de cet article construit ce PHP.

## Mettre en place le projet {#set-up-the-project}

Pour cet article, nous allons créer un nouveau projet Behat et valider ce scénario : **« En tant que visiteur, je veux pouvoir visiter le site XYZ ; cliquer sur un élément de navigation appelé "Blog". Le site m'affiche alors la liste des articles de blog. »**

Comme vous le savez si vous lisez régulièrement mon blog, je bois, mange et respire Docker, ce qui veut dire que je n'ai plus ni PHP, ni composer, ni Apache sur mon ordinateur.

Donc, pour notre nouveau défi ci-dessus (que j'accepte avec plaisir), je vais créer un petit projet avec Docker, PHP 8.2 et composer.

C'est parti...

- D'abord, créons un nouveau répertoire : `mkdir /tmp/behat && cd $_`.
- Là, créons un fichier appelé `Dockerfile` avec le contenu ci-dessous. Ce script est déjà gros mais, comme ça, nous aurons tout ce qu'il faut dès maintenant.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

- Créez un fichier appelé `compose.yaml` avec ce contenu :

<Vars name="php-app" labels={{ name: "Nom du container" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

- Lancez `docker compose up --detach` pour créer votre container Docker

Nous allons vérifier que le driver Chrome est bien installé en lançant `docker compose exec -u $(id -u):$(id -g) app /usr/local/bin/chrome/chromedriver --version`. Idem pour le navigateur Chrome : `docker compose exec -u $(id -u):$(id -g) app /usr/local/bin/chrome/chrome --version`. Parfait ! Voir ces valeurs signifie que Chrome est prêt à être utilisé.

![Versions de Chrome](./images/chrome_versions.webp)

Ok, encore une chose : nous devons créer notre fichier `composer.json` puisqu'il faut inclure la dépendance PHP `Behat`.

- Lancez `docker compose exec -u $(id -u):$(id -g) app /bin/bash` pour démarrer un shell interactif dans votre container Docker en étant vous-même (c'est-à-dire qu'avec `-u $(id -u):$(id -g)`, les fichiers et dossiers créés dans Docker vous appartiendront),

- Lancez `composer init` pour démarrer l'assistant composer ; saisissez les valeurs que vous voulez, par exemple
  - Package name : `johndoe/behat`,
  - Description : `Introduction to Behat`,
  - Author : `John Doe`,
  - Minimum Stability : *appuyez simplement sur Entrée*,
  - Package Type : `project`,
  - License : *appuyez simplement sur Entrée*,
  - Composer vous demandera si vous voulez définir des dépendances et des dépendances de dev ; répondez `no` deux fois pour l'instant,
  - La question suivante concerne PSR-4, *appuyez simplement sur Entrée*,
  - Enfin, répondez `yes` au message de confirmation.

Maintenant, si vous êtes curieux, vous verrez que vous avez un nouveau fichier appelé `composer.json` et deux dossiers appelés `src` et `vendor`.

![Composer a été installé](./images/composer_installed.webp)

## Installons Behat {#lets-install-behat}

Comme indiqué dans la documentation [How to install?](https://docs.behat.org/en/latest/quick_start.html#installation), il suffit d'exécuter `composer require --dev behat/behat:^3` pour installer Behat comme dépendance de dev.

<AlertBox variant="info">
Assurez-vous d'être toujours dans une session Bash interactive dans le container Docker avant de lancer `composer require --dev behat/behat:^3`. Une session Bash interactive se démarre en lançant `docker compose exec -u $(id -u):$(id -g) app /bin/bash`.

</AlertBox>

![Installer Behat](./images/composer_install_behat.webp)

Une fois installé, vous pouvez démarrer Behat en lançant `vendor/bin/behat` mais, pour l'instant, vous obtiendrez une erreur et c'est parfaitement normal puisque nous devons d'abord écrire notre premier scénario.

![FeatureContext introuvable](./images/FeatureContext_not_found.webp)

Comme indiqué dans la documentation officielle, lancez simplement `vendor/bin/behat --init` pour créer les fichiers minimums requis.

![Exécution de behat init](./images/behat_init.webp)

Maintenant, si vous regardez votre dossier, vous voyez un nouveau dossier appelé `features/bootstrap` avec un fichier appelé `FeatureContext.php`. La capture ci-dessous illustre à quoi ressemble le projet dans mon éditeur VSCode à ce stade du tutoriel :

![FeatureContext dans vscode](./images/vscode_FeatureContext.webp)

## Écrire vos étapes en PHP {#writing-your-steps-in-php}

Cela doit être placé dans un fichier portant l'extension `.feature` dans le dossier `features` ; créons le fichier `Blog.feature` (montré au début de cet article) avec ce contenu :

![Le fichier Blog.feature](./images/blog_feature.webp)

<AlertBox variant="note" title="Pensez à installer `Cucumber (Gerkin) Full Support`">
Si vous utilisez Visual Studio Code, vous pouvez installer [Cucumber (Gerkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) pour obtenir la coloration et une meilleure intégration dans vscode, comme l'autocomplétion.

</AlertBox>

Maintenant que nous avons notre scénario, nous devons apprendre à Behat comment *traduire* ces phrases (c'est le [langage Gherkin](https://cucumber.io/docs/gherkin/)) dans notre code PHP.

Ouvrez maintenant le fichier `features/bootstrap/FeatureContext.php` dans votre éditeur préféré :

![Édition du fichier FeatureContext.php](./images/vscode_edit_0_FeatureContext.webp)

Comme vous le voyez, c'est le fichier par défaut créé plus tôt. Nous devons y écrire du code PHP, mais comment ?

Retournez dans votre console Bash interactive et lancez `vendor/bin/behat --dry-run --append-snippets`. Cela demande à Behat de créer les étapes pour vous, automagiquement.

![Append snippets](./images/append_snippets.webp)

Tapez `1` pour demander à Behat d'utiliser votre fichier `FeatureContext.php`. Vous obtiendrez alors une confirmation à l'écran :

```bash
u features/bootstrap/FeatureContext.php - `I am on "https://www.avonture.be"` definition added
u features/bootstrap/FeatureContext.php - `I click on the "Blog" menu item` definition added
u features/bootstrap/FeatureContext.php - `I should be on "/blog"` definition added
```

Ouvrez à nouveau le fichier `features/bootstrap/FeatureContext.php` dans votre éditeur préféré :

![Nous avons maintenant nos étapes](./images/vscode_edit_1_FeatureContext.webp)

Sympa, non ? Behat a regardé notre fichier `Blog.feature` et a créé autant de méthodes dans notre code PHP que nous avions de phrases dans notre scénario, et chaque méthode est associée à sa phrase (regardez le commentaire PHP avant chaque méthode).

Et maintenant, avant même de commencer à coder, demandons à Behat d'exécuter notre scénario ; lancez `vendor/bin/behat` dans la console — c'est la sortie « Premier lancement » montrée au début de cet article.

Wow ! Jusqu'ici, parfait ! Nous avons donc demandé à Behat d'exécuter notre scénario et il sait que nous avons trois étapes et qu'il nous reste à écrire le code associé en PHP (d'où le message **TODO: write pending definition** en jaune).

Donnons-nous les moyens de faire au mieux le plus vite possible, sans réinventer la roue si quelqu'un d'autre l'a déjà fait. Installons deux nouvelles dépendances. Dans votre console, lancez `composer require --dev friends-of-behat/mink` et `composer require --dev dmore/behat-chrome-extension`.

`friends-of-behat/mink` est une très chouette dépendance qui arrive avec des étapes déjà prédéfinies : faire un login, naviguer vers des pages, vérifier que la page courante est ... Et en utilisant `friends-of-behat/mink`, la vie sera plus simple et nous n'aurons pas à réinventer la roue.

## Utiliser Mink {#using-mink}

Maintenant que Mink est installé, allez dans votre éditeur, ouvrez le fichier `features/bootstrap/FeatureContext.php` et remplacez la ligne `class FeatureContext implements Context` par `class FeatureContext extends \Behat\MinkExtension\Context\MinkContext`.

![Utilisation de MinkContext](./images/MinkContext.webp)

Ce petit changement nous donne beaucoup de pouvoir car notre code utilise désormais Mink et bénéficie donc de toutes ses méthodes existantes.

Pour obtenir la liste des méthodes existantes, lançons `clear ; vendor/bin/behat -di` dans votre console :

![Affichage des définitions](./images/print_definitions.webp)

Vous avez vu ? Nous avons nos trois étapes (les trois premières affichées) puis des étapes supplémentaires venant de Mink. Et vous pouvez scroller longtemps : il y a déjà beaucoup d'étapes que Mink vous permet de réutiliser.

Relancez `vendor/bin/behat` dans la console :

![Correspondance ambiguë](./images/ambiguous_match.webp)

Nous obtenons l'erreur *Ambiguous match of ...* sur la toute première étape, notre étape *I am on https://www.avonture.be*. Ambiguë signifie que nous essayons d'ajouter du code PHP dans notre contexte alors que cette étape est déjà définie (par Mink). Donc, supprimez-la simplement : éditez votre fichier `FeatureContext.php`, sélectionnez `public function iAmOn` et supprimez toute la fonction.

![Supprimer la méthode iAmOn](./images/drop_iamon.webp)

En relançant `vendor/bin/behat`, vous aurez la même erreur pour `iShouldBeOn` ; supprimez donc aussi cette fonction.

Lancez `clear ; vendor/bin/behat` une fois de plus et nous obtenons maintenant une nouvelle erreur :

![Instance Mink non définie](./images/mink_instance_not_set.webp)

## Installer l'extension Mink {#installing-the-mink-extension}

Nous devons maintenant référencer `behat-chrome-extension` dans un fichier appelé `behat.yml`.

Créez le fichier `behat.yml` à la racine de votre projet, avec ce contenu :

<Snippet filename="behat.yaml" source="./files/behat.yaml" />

Éditez également le fichier `features/bootstrap/FeatureContext.php`, supprimez tout et remplacez par le contenu ci-dessous.

Nous avons modifié quelques instructions `use` pour ajouter les bibliothèques Mink (et retirer celles qui ne servent plus). Nous avons aussi ajouté une propriété privée `$mink` et quelques lignes dans le `__constructor`.

<AlertBox variant="caution" title="Pensez à adapter l'url `https://www.avonture.be` à votre site" />

<Snippet filename="features/bootstrap/FeatureContext.php" source="./files/FeatureContext.php" />

En relançant `vendor/bin/behat`, nous avons maintenant une autre erreur :

![Could not fetch version information](./images/could_not_fetch.webp)

## Place à Chrome {#time-to-run-chrome}

Créez un fichier appelé `run.sh` avec ce contenu :

<Snippet filename="run.sh" source="./files/run.sh" />

Puis rendez le fichier exécutable en lançant `chmod +x ./run.sh`.

Vous pouvez maintenant démarrer Behat en lançant `./run.sh` dans votre console.

Si tout se passe bien, vous obtiendrez ceci :

![Premier lancement](./images/run_sh_pending.webp)

Comme vous le voyez, la ligne `Given I am on...` est en vert : Behat, grâce à notre driver Chrome, a réussi à atteindre la page.

Ensuite, la ligne `Then I click on the "Blog" menu item` est en jaune et c'est normal puisque nous n'avons pas encore créé la fonction et, logiquement, `Then I should be on "/blog"` est en bleu parce que cette phrase n'a pas encore été exécutée (skippée).

## Écrire notre méthode iClickOnTheMenuItem {#writing-our-iclickonthemenuitem-method}

Retour au fichier `bootstrap/FeatureContext.php`. Remplacez la méthode `iClickOnTheMenuItem` par ce code :

<Snippet filename="features/bootstrap/FeatureContext.php" source="./files/FeatureContext.part2.php" />

Comme vous le voyez, nous allons créer un dossier `.output` et la seule chose que nous faisons est de prendre une capture d'écran.

Juste après avoir relancé `./run.sh` dans votre console, vous devriez voir un nouveau dossier `.output` avec une image :

![Nous sommes sur la page d'accueil](./images/screenshot_homepage.webp)

Qu'avons-nous fait ? Nous avons vérifié que lorsque Behat exécute notre méthode `iClickOnTheMenuItem`, Chrome accède bien à notre page d'accueil. Nous pouvons maintenant simuler un clic sur l'entrée de menu voulue : le menu Blog stocké dans notre paramètre $menuItem.

Remplacez la méthode par ce nouveau code :

<Snippet filename="features/bootstrap/FeatureContext.php" source="./files/FeatureContext.part3.php" />

Lancez `./run.sh` une fois de plus et bingo !

![Succès](./images/success.webp)

C'est un succès parce que le `Then I should be on "/Blog"` a été vérifié par Mink. Nous n'avons pas besoin d'écrire la méthode `Then I should be on`, elle est déjà définie par Mink.

Essayons autre chose : retour dans le PHP et remplacez `if ($element->getText() === $menu) {` par `if ($element->getText() === 'Archive') {`. Nous ne cliquerons donc plus sur le menu Blog mais sur `Archive` ; voyons ce qui se passe :

![Échec](./images/failure.webp)

Et ça échoue ; parfait !

## Conclusion {#conclusion}

C'est la fin de ce tutoriel.

Avec Behat et Mink, nous pouvons automatiser les tests fonctionnels.

Nous allons pouvoir écrire des scénarios, simuler des actions utilisateur comme cliquer sur n'importe quel objet de la page, uploader des documents, faire des choses comme insérer un nouvel article de blog puis injecter du contenu dans l'éditeur et, après avoir enregistré l'élément, visiter la page du blog, la trier par date et vérifier que notre nouvel article s'affiche bien et qu'il est le premier de la liste.

Nous pouvons le faire avant que l'application existe (concept du BDD), pendant le codage (pour s'assurer que les fonctionnalités marchent toujours, même après un gros refactoring par exemple) ou pendant tout le cycle de vie (pour s'assurer que l'application fonctionne toujours comme prévu).

Continuez votre exploration grâce à ces sites :

- [Automate testing with Behat](https://docs.pantheon.io/behat),
- [Behat-chrome-extension repository](https://gitlab.com/behat-chrome/behat-chrome-extension),
- [Behat: The Easy and Effective Way to Write Acceptance Tests](https://dev.to/jszutkowski/behat-the-easy-and-effective-way-to-write-acceptance-tests-cm4),
- [Behat - Official website](https://docs.behat.org/en/latest/),
- [Cucumber - Gherkin Tutorial](https://cucumber.io/),
- [DMore - Chrome Mink Driver](https://packagist.org/packages/dmore/chrome-mink-driver) et
- [Mink at a Glance](https://mink.behat.org/en/latest/at-a-glance.html)

## Annexe - Liste des fichiers, leur contenu et comment les exécuter {#appendix---list-of-files-and-their-contents-and-how-to-run-them}

Dans ce tutoriel, nous avons manipulé beaucoup de fichiers et de commandes. Pour vous permettre de vérifier que votre version est bien celle utilisée à la fin de cet article, vous trouverez ci-dessous chaque fichier avec son contenu en fin de tutoriel.

Pour rappel, quand tous les fichiers ci-dessous ont été créés sur votre disque, vous devez d'abord créer votre image Docker et un container ; cela se fait en lançant `docker compose up --detach` dans votre console.

La deuxième commande à lancer est `docker compose exec -u $(id -u):$(id -g) app composer install` pour installer toutes les dépendances PHP.

Enfin, pour exécuter notre script `run.sh`, vous devez lancer `docker compose exec -u $(id -u):$(id -g) app ./run.sh`

### behat.yaml {#behatyaml}

<Snippet filename="behat.yaml" source="./files/behat.part2.yaml" />

### Blog.feature {#blogfeature}

Le nom de fichier relatif est `features/Blog.feature`.

<Snippet filename="features/Blog.feature" source="./files/Blog.part2.feature" />

### composer.json {#composerjson}

<Snippet filename="composer.json" source="./files/composer.json" />

### compose.yaml {#composeyaml}

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

### Dockerfile {#dockerfile}

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

### FeatureContext.php {#featurecontextphp}

Le nom de fichier relatif est `features/bootstrap/FeatureContext.php`.

<Snippet filename="features/bootstrap/FeatureContext.php" source="./files/FeatureContext.part4.php" />

### run.sh {#runsh}

<Snippet filename="run.sh" source="./files/run.part2.sh" />
