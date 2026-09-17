---
slug: pest_tips
title: Écrire des tests unitaires PHP avec Pest
date: 2024-09-27
description: Maîtrisez les tests unitaires PHP avec Pest ! Découvrez l'installation facile, la syntaxe expressive expect, les datasets, les snapshots et les puissantes fonctionnalités de tests architecturaux.
authors: [christophe]
image: /img/v2/unit_tests.webp
mainTag: tests
tags:
  - code-quality
  - laravel
  - php
  - tests
  - vscode
language: fr
updates:
  - date: 2026-07-30
    note: "Pest v5 released at Laracon US 2026 (requires PHP 8.4 + PHPUnit 13); core unit-testing API unchanged."
---
<!-- cspell:ignore Nuno -->

![Écrire des tests unitaires PHP avec Pest](/img/v2/unit_tests.webp)

<TLDR>
Voici une référence complète sur Pest, le wrapper expressif de PHPUnit pour PHP : installation, la syntaxe `it()`/`test()`/`expect()`, assertions vs expectations, datasets inline et partagés, réutilisation de cas de test PHPUnit existants, tests architecturaux (imposer des règles comme « pas de validation dans les controllers »), snapshot testing, fonctions globales personnalisées dans `tests/Pest.php`, conversion depuis PHPUnit, et outillage VSCode (Better Pest, Pest Snippets) y compris la configuration avec un container Docker.
</TLDR>

Si vous pensez qu'écrire des tests unitaires en PHP est amusant, restez dans la salle ; les autres, sortez s'il vous plaît. Et là tout le monde sort, y compris celui qui a posé la question.

Écrire des tests unitaires *à l'ancienne* avec PHPUnit est tellement ennuyeux que presque personne ne le fait.

Et depuis un certain temps, [https://pestphp.com/](https://pestphp.com/) est arrivé et a totalement changé la façon de faire.

Pest est un wrapper autour de PhpUnit donc, par exemple, chaque argument en ligne de commande supporté par PhpUnit peut être utilisé avec Pest.

*Les tests unitaires ne sont qu'une couche d'une stratégie qualité ; les autres, sur ce blog, sont <Link to="/blog/php-jakzal-phpqa">l'analyse statique avec jakzal/phpqa</Link> et <Link to="/blog/git-precommit">les hooks pre-commit</Link>, qui tournent tous les deux avant qu'un commit puisse passer.*

<AlertBox variant="note" title="Vous cherchez plutôt des tests navigateur/fonctionnels ?">
Cet article se concentre sur les tests unitaires classiques. Pest v4 a ajouté le testing navigateur intégré ; Pest v5 (actuel, juillet 2026) ajoute le Test Impact Analysis et requiert PHP 8.4 — voir <Link to="/blog/pest-functional-testing">Writing functional tests with Pest</Link>. Vous testez des scripts Bash ? Jetez un œil à <Link to="/blog/bats-unit-tests">Lancer des tests unitaires avec bats/bats</Link>.
</AlertBox>

<!-- truncate -->

## Résultat {#result}

Un fichier de test, et la ligne de bootstrap qui le relie au `TestCase` de PHPUnit :

<Snippet filename="tests/Pest.php" source="./files/Pest.php" />

<Snippet filename="tests/Feature/MyFirstTest.php" source="./files/MyFirstTest.php" />

Le lancer avec `./vendor/bin/pest tests/Feature/MyFirstTest.php` donne :

<Terminal typewriter source="./files/terminal-2.txt" />

## Pourquoi Pest {#why-pest}

- Les tests se lisent comme des phrases naturelles : `expect($value)->toBeTrue()` au lieu du `$this->assertTrue($value)` de PHPUnit — les méthodes peuvent être niées avec `not->`.
- `it()` et `test()` sont interchangeables ; utilisez celui qui correspond à votre convention de nommage, les deux partagent le même comportement et la même syntaxe.
- Pest est un wrapper autour de PHPUnit, pas un remplaçant : chaque argument en ligne de commande de PHPUnit fonctionne toujours, et les cas de test PHPUnit existants peuvent être réutilisés tels quels (il suffit d'ajouter `/** @test */`).

## Installation {#installation}

> [https://pestphp.com/docs/installation#installation](https://pestphp.com/docs/installation#installation)

Lancez simplement les commandes ci-dessous dans le dossier de votre application PHP :

<Terminal typewriter source="./files/terminal-3.txt" />

À partir de maintenant, on peut lancer `./vendor/bin/pest` pour exécuter nos tests Pest.

## Écrire des tests {#writing-tests}

### Introduction à Pest {#introduction-about-pest}

#### Les fichiers doivent avoir le suffixe Test {#files-should-have-the-test-suffix}

Comme PHPUnit, Pest traitera tous les fichiers des dossiers `tests/Feature` et `tests/Unit` ayant le suffixe `Test` comme par exemple `ShoppingBasketTest.php`.

#### Que signifie $this dans un test ? {#what-does-this-mean-in-a-test}

Dans notre fichier `tests/Pest.php`, on a la ligne de bootstrap montrée en haut de cet article.

Dans un test Pest, `$this` fait référence à la classe PHPUnit `Tests\TestCase`.

#### it ou test {#it-or-test}

Pest nous laisse le choix entre `it()` et `test()`. *Utilisez celui qui correspond le mieux à votre convention de nommage des tests, ou les deux. Ils partagent le même comportement et la même syntaxe.*

Pour en savoir plus : [https://pestphp.com/docs/writing-tests#api-reference](https://pestphp.com/docs/writing-tests#api-reference)

Le résultat est le même, seule la sortie dans la console diffère.

### Nos premiers tests {#our-first-tests}

C'est le test `MyFirstTest.php` et sa sortie `PASS` montrés en haut de cet article. Il illustre que Pest démarre avec un verbe `expect` et une méthode comme `toBeTrue()`. Les méthodes peuvent être niées avec `not->` ([https://pestphp.com/docs/expectations#expect-not](https://pestphp.com/docs/expectations#expect-not)).

#### Autocomplétion {#autocomplete}

Veillez à installer et activer [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) et profitez de l'autocomplétion de vscode.

#### Différence entre toBe et toEqual {#difference-between-tobe-and-toequal}

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.php" />

`toBe` sera plus strict, c'est-à-dire qu'il vérifiera à la fois la valeur et le type de donnée, alors que `toEqual` vérifiera uniquement la valeur.

### Assertions {#assertions}

> [https://pestphp.com/docs/assertions](https://pestphp.com/docs/assertions)

Les assertions viennent de PhpUnit et fonctionnent de la même manière.

Les assertions sont accessibles via l'objet `$this`, et ce parce que `tests/pest.php` contient la ligne ci-dessous.

<Snippet filename="tests/pest.php" source="./files/pest.php" />

Donc `$this` fait référence à la classe PHPUnit `Tests\TestCase`.

### Expectations {#expectations}

> [https://pestphp.com/docs/expectations](https://pestphp.com/docs/expectations)

En plus des assertions, Pest vous propose un ensemble d'expectations. Ces fonctions permettent de tester vos valeurs contre certaines conditions. Cette API est inspirée de Jest. Les expectations vous permettent aussi d'écrire vos tests comme une phrase naturelle.

Assertions et expectations peuvent être utilisées dans les fichiers de test Pest mais... les expectations sont plus explicites et intuitives.

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part2.php" />

### Utiliser les datasets {#using-datasets}

> [https://pestphp.com/docs/datasets](https://pestphp.com/docs/datasets)

On a plusieurs façons de fournir des données à une fonction.

Voici la version [inline](https://pestphp.com/docs/datasets#inline-datasets)

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part3.php" />

Le dataset est alors un tableau et on peut avoir un tableau multidimensionnel :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part4.php" />

Il existe aussi un moyen de créer un dataset partagé, ce qui est probablement mieux quand le fichier de test devient volumineux ([https://pestphp.com/docs/datasets#shared-datasets](https://pestphp.com/docs/datasets#shared-datasets)).

### Réutiliser des cas de test PHPUnit sans modification {#reuse-phpunit-tests-cases-without-changes}

C'est vraiment simple : il suffit d'ajouter `/** @test */` comme doc block avant le scénario de test.

Par exemple

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part5.php" />

Et à partir de maintenant ce test peut être lancé avec `./vendor/bin/pest`.

### Tests architecturaux {#architectural-tests}

> [https://pestphp.com/docs/arch-testing](https://pestphp.com/docs/arch-testing)

Avec Pest (depuis la v2), on peut garantir certaines cohérences architecturales, comme ne pas utiliser de validations dans un controller (via `$request->validate(...)`) mais forcer l'usage de classes Form request à la place.

Le plugin architectural n'aide pas à lancer des tests unitaires mais scanne le projet et s'assure que certaines règles sont respectées.

Les tests architecturaux peuvent ressembler à ceci :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part6.php" />

Cette partie est visible en vidéo [https://youtu.be/9EGPo_enEc8?t=1021](https://youtu.be/9EGPo_enEc8?t=1021)

On peut aussi vérifier si une classe est `final` :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part7.php" />

### Prendre des snapshots {#taking-snapshots}

Il y a aussi une fonctionnalité appelée `Snapshots`. L'idée est de stocker un contenu comme snapshot puis de comparer les exécutions futures avec ce snapshot.

Un snapshot peut être le contenu d'une page HTML, une réponse JSON, le contenu d'un fichier / d'un tableau... en fait n'importe quoi (pour un objet, on peut le sérialiser et donc le stocker aussi comme snapshot).

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part8.php" />

Au tout premier lancement (`vendor/bin/pest`), le snapshot n'existe pas encore donc il sera créé sur disque et le test sera noté *WARN*.

Le snapshot sera créé dans un sous-dossier du dossier `./tests/.pest/snapshots` (le sous-dossier correspondra à l'emplacement de votre test lancé (p.ex. `Feature/ExampleTest/it_has_a_welcome_page.snap`)).

À partir du deuxième lancement, le snapshot pris sera comparé avec, dans l'exemple ci-dessus, le contenu HTML de la page d'accueil. Dès qu'une différence est détectée (comme la date du jour si elle est présente sur la page), Pest l'affichera dans un diff : la chaîne précédente issue du snapshot et la chaîne récupérée, actuelle.

## Écrire des fonctions globales {#write-global-functions}

On peut écrire nos propres fonctions personnalisées dans le fichier `tests/Pest.php`.

## Le bootstrap de Pest {#pest-bootstrap}

Le fichier `tests/pest.php` peut servir à y placer des fonctions globales mais on devra aussi le mettre à jour si, dans nos fichiers de test, on a besoin d'autres classes.

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part9.php" />

La ligne ci-dessus rendra `Tests\TestCase` disponible dans tous les tests de `tests/Feature`. Si on a besoin de plus de classes, on peut les ajouter :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part10.php" />

Et aussi dans le dossier `tests/Unit` :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part11.php" />

## Trucs et astuces {#tips-and-tricks}

*Optionnel.*

### Dump and die {#dump-and-die}

On peut utiliser la méthode `dd` pour afficher la valeur de l'expectation courante et arrêter la suite de tests, comme ceci :

<Snippet filename="tests/Feature/AnyTest.php" source="./files/AnyTest.part12.php" />

## Convertir depuis PHPUnit {#convert-from-phpunit}

*Optionnel — pertinent uniquement si vous avez une suite PHPUnit existante à migrer.*

> [Migrate from PHPUnit to Pest - Online migration tool](https://benjamincrozat.com/phpunit-to-pest)

Introduit dans Pest depuis la v2.9, il existe un outil pour convertir de PHPUnit vers Pest.

Voir [https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin](https://pestphp.com/docs/pest-spicy-summer-release#content-drift-plugin)

Note : Rector propose aussi un outil : [https://github.com/rectorphp/rector-pest](https://github.com/rectorphp/rector-pest)

Par exemple, le code ci-dessous

<Snippet filename="tests/Feature/example_test.php" source="./files/example_test.php" />

sera converti en

<Snippet filename="tests/Feature/example_test.php" source="./files/example_test.part2.php" />

## Outils {#tools}

### Plugin Laravel {#laravel-plugin}

> [Laravel Pest plugin](https://pestphp.com/docs/plugins/laravel)

Installez le plugin comme ceci : `composer require pestphp/pest-plugin-laravel --dev`

De nouvelles commandes artisan seront alors disponibles :

<Terminal typewriter source="./files/terminal-1.txt" />

### Extensions Visual Studio Code {#visual-studio-code-add-on}

- S'il n'est pas déjà installé, [PHP Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) vous permettra d'appuyer sur <kbd>F12</kbd> sur un nom de méthode (comme `toBeTrue`) et de sauter à l'endroit où la méthode est implémentée,
- [Better Pest](https://marketplace.visualstudio.com/items?itemName=m1guelpf.better-pest) et
- [Pest Snippets](https://marketplace.visualstudio.com/items?itemName=dansysanalyst.pest-snippets)

#### Better Pest avec Docker {#better-pest-with-docker}

Si vous utilisez Docker, pensez à ajouter les lignes suivantes dans votre fichier de configuration `.vscode/settings.json` :

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

Pensez à adapter le nom de votre container (`app` ici) et les chemins :

- `/your/local/path` est l'endroit où votre repository est stocké, sur votre machine hôte,
- `/your/remote/path` est le path dans votre container, probablement `/var/www/html`.

Maintenant, ouvrez simplement n'importe quel fichier Pest et appuyez sur <kbd>CTRL</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> pour ouvrir la Command Palette. Commencez à taper `Better Pest` et sélectionnez l'option souhaitée (comme `Better Pest: run` pour lancer le fichier).

### Convertir de PHPUnit vers Pest {#convert-from-phpunit-to-pest}

Le repository [https://github.com/mandisma/pest-converter](https://github.com/mandisma/pest-converter) propose un **PHPUnit to Pest Converter** : PestConverter est une librairie PHP pour convertir des tests PHPUnit en tests Pest.

## Conclusion {#conclusion}

Pest ne remplace pas PHPUnit, il remplace juste le *cérémonial* — `expect()->toBeTrue()` au lieu
d'assertions verbeuses, les datasets et les tests architecturaux offerts, et chaque cas de test
PHPUnit existant fonctionne toujours sans modification. Installez-le une fois, écrivez le prochain
test dans la syntaxe expressive, et migrez le reste seulement quand ça vous arrange.

## Liens {#links}

### Vidéos {#videos}

- [Laracast - Pest](https://laracasts.com/series/jeffreys-larabits/episodes/30)
- [Laracast - Pest from Scratch](https://laracasts.com/series/pest-from-scratch)
- [Laracon IN 2023 : le futur de PEST](https://youtu.be/9EGPo_enEc8)
