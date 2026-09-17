---
slug: bats-unit-tests
title: Linux - Scripts Bash - Lancer des tests unitaires avec bats/bats
date: 2025-07-10
description: Découvrez comment tester unitairement vos scripts Bash sous Linux avec le puissant framework bats (Bash Automated Testing System). Exemples concrets d'assertions, de vérifications de sortie et d'échecs.
authors: [christophe]
image: /img/v2/bash.webp
series: Writing better Bash scripts
mainTag: tests
tags:
  - bash
  - linux
  - tests
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lujtej7xhs23
---
<!-- cspell:ignore imple -->

![Linux - Scripts Bash - Lancer des tests unitaires avec bats/bats](/img/v2/bash.webp)

<TLDR>
Cet article propose une introduction complète aux tests unitaires de scripts Bash avec le framework `bats-core`. Il montre comment démarrer rapidement en lançant les tests dans un container Docker, sans configuration compliquée. Le guide couvre l'écriture de tests de base, l'utilisation des différents types d'assertions comme `assert_output`, `assert_failure` et `assert_equal`, et montre comment structurer des tests pour de vraies fonctions shell. Des sujets plus avancés comme le mocking de commandes, le test de sorties multilignes et colorées, la vérification du contenu de fichiers et l'usage des fonctions `setup`/`teardown` pour les fixtures sont également expliqués avec des exemples concrets.
</TLDR>

Comme tous les développeurs qui vivent en ligne de commande, j'écris des scripts Bash sous Linux. Comme tout programmeur, je suis censé écrire des tests unitaires. Bon, je dois avouer que je n'en écris que rarement.

Il y a quelque temps, j'ai écrit un ensemble de scripts Bash qui forment une bibliothèque de fonctions (comme un framework) et là, l'intérêt d'avoir des tests unitaires est encore plus grand puisque ces fonctions sont censées être stables et servir de fondations à des scripts plus avancés. *Deux habitudes rendent une telle bibliothèque testable dès le départ : <Link to="/blog/linux-bash-too-many-function-parameters">limiter le nombre de paramètres des fonctions</Link> et <Link to="/blog/linux-generate-documentation-from-bash-scripts">documenter chaque fonction avec un bloc de doc</Link>.*

Dans cet article, nous voyons comment écrire des tests unitaires pour des scripts Bash. Si vous cherchez l'équivalent en PHP, voyez <Link to="/blog/pest_tips">Write PHP unit tests using Pest</Link> ; pour des tests fonctionnels / de bout en bout plutôt que des tests unitaires, j'ai aussi parlé de Behat, <Link to="/blog/cypress">Cypress</Link> et <Link to="/blog/pest-functional-testing">des tests navigateur de Pest v4</Link> ; et si vous préférez qu'on vous écrive une première version de la suite de tests, <Link to="/blog/ollama-test-generator">un LLM local peut générer les cas manquants</Link>.

<!-- truncate -->

## Commençons par une petite mise en bouche {#lets-start-with-a-little-hors-doeuvre}

Comme toujours, créons d'abord un nouveau dossier pour jouer avec quelques exemples.

Lancez `mkdir -p /tmp/bats && cd $_` pour créer un dossier temporaire et y entrer ; puis lancez `code .` pour démarrer VSCode et ouvrir le dossier.

Nous allons créer un fichier d'illustration simple, appelons-le `tests/simple.bats`, et copier/coller le contenu suivant :

<Snippet filename="tests/simple.bats" source="./files/simple.bats" />

Et maintenant, la partie très difficile est, ah non, en fait vraiment facile, de lancer [Bats-core](https://bats-core.readthedocs.io/en/stable/) :

<Terminal typewriter>
$ docker run --rm -it -w /code/tests -v .:/code bats/bats:latest simple.bats
</Terminal>

Et... ça marche.

![Test simple](./images/simple_test.webp)

### Qu'avons-nous fait ? {#what-did-we-do}

Nous avons créé un exemple très basique avec deux vérifications.

La première s'appelle *Asserting it's hello* et nous avons lancé `echo "hello"` exactement comme dans un script shell. Ensuite, en lançant `assert_output "hello"`, nous vérifions que la sortie de la commande lancée est bien `hello` et c'est un succès (donc c'est `hello` et rien d'autre).

C'est fait avec ce script :

<Snippet filename="tests/simple.bats" source="./files/simple.part2.bats" />

Et la seconde vérification s'appelle *Simple.bats exists* : nous faisons simplement un `ls simple.bats` et vérifions si, pour l'illustration, `Simple.bats` ou `simple.bats` est retourné dans la liste des fichiers (ceci, pour illustrer l'usage d'une expression régulière).

<Snippet filename="tests/simple.bats" source="./files/simple.part3.bats" />

### Vérifier un échec {#asserting-a-failure}

Bien sûr, nous pouvons aussi vérifier un échec. Modifiez votre fichier `simple.bats` comme ceci :

<Snippet filename="tests/simple.bats" source="./files/simple.part4.bats" />

Donc, dans la nouvelle fonction de test, nous essayons simplement de supprimer un fichier inexistant et nous attendons, forcément, un échec :

![Vérifier un échec](./images/assert_failure.webp)

## Quelques cas d'usage réels {#some-real-world-use-cases}

Imaginez l'arborescence simplifiée suivante :

```tree expanded=true showJSX=false debug=false title=""
.
├── src
│   └── assert.sh
└── tests
    ├── assert.bats
```

Le fichier `src/assert.sh` contient le code shell Linux que vous voulez tester. Vos scénarios de test doivent être stockés dans le dossier `tests`. Puisque nous allons écrire des tests pour le fichier `src/assert.sh`, créons `tests/assert.bats`.

Ci-dessous le contenu de `src/assert.sh`. Commençons par une fonction simple : vérifier si un binaire donné est installé sur le système ou non. Le nom du binaire doit être passé en paramètre à la fonction.

<Snippet filename="src/assert.sh" source="./files/assert.sh" />

Ci-dessous le contenu de `tests/assert.bats`.

<Snippet filename="tests/assert.bats" source="./files/assert.bats" />

La ligne de commande :

<Terminal typewriter>
$ docker run --rm -it -w /code/tests -v .:/code bats/bats:latest assert.bats
</Terminal>

En la lançant, nous attendons un succès pour binaryExists avec les commandes `clear` et `ls` (puisqu'elles sont bien installées sur notre système) et nous attendons un échec pour `fakeProgram` mais, puisque nous utilisons `assert_failure`, notre scénario de tests devrait passer.

Ajoutons une vérification pour voir si une image Docker spécifique existe déjà ou non sur le système :

<Snippet filename="src/assert.sh" source="./files/assert.part2.sh" />

et le fichier `tests/assert.bats` mis à jour :

<Snippet filename="tests/assert.bats" source="./files/assert.part2.bats" />

## Plus d'exemples {#more-examples}

### assert_equal {#assert_equal}

Vérifie simplement que les deux valeurs sont égales. Ici, nous appelons une fonction qui retourne la longueur d'un tableau et nous vérifions que c'est la valeur attendue.

<Snippet filename="tests/simple.bats" source="./files/simple.part5.bats" />

### assert_failure {#assert_failure}

`assert::binaryExists` fera un exit 1 si le binaire ne peut pas être trouvé. Un message d'erreur du type *The binary can't be found* sera affiché sur la console.

<Snippet filename="tests/simple.bats" source="./files/simple.part6.bats" />

### assert_output {#assert_output}

`assert_output` a deux options bien pratiques : `--partial` et `--regexp`.

Utiliser `--partial` permet par exemple de vérifier que la sortie contient un texte brut donné, comme une phrase précise dans un écran d'aide.

<Snippet filename="tests/simple.bats" source="./files/simple.part7.bats" />

Utiliser `--regexp` permet d'employer une expression régulière :

<Snippet filename="tests/simple.bats" source="./files/simple.part8.bats" />

### assert_success {#assert_success}

`assert::binaryExists` retourne 0 quand le binaire est trouvé. La fonction s'exécute en silence (aucune sortie).

<Snippet filename="tests/simple.bats" source="./files/simple.part9.bats" />

### Vérifier les couleurs ANSI {#check-for-ansi-colors}

Imaginez le code suivant :

<Snippet filename="script.sh" source="./files/script.sh" />

Nous voulons vérifier que la ligne sera affichée en rouge.

<Snippet filename="tests/simple.bats" source="./files/simple.part10.bats" />

### Vérifier une sortie multiligne {#check-for-multi-line-output}

Imaginez le code suivant :

<Snippet filename="script.sh" source="./files/script.part2.sh" />

Cela va écrire trois lignes sur la console, comme par exemple :

```bash
# ============================================
# = Step 1 - Initialisation                  =
# ============================================
```

Pour vérifier plusieurs lignes, utilisez le tableau `$lines` comme ceci :

<Snippet filename="tests/simple.bats" source="./files/simple.part11.bats" />

### Vérifier par rapport à un fichier {#check-against-a-file}

Imaginez une fonction qui va parser un fichier et, par exemple, supprimer certains paragraphes. Nous devons vérifier que le contenu est correct, une fois la fonction lancée.

Pour cela, imaginez une fonction `removeTopOfFileComments`. La fonction va parser le fichier et supprimer les commentaires HTML (`<!-- ... -->`) présents en haut du fichier.

Pour le test, nous allons créer un fichier avec trois lignes vides, puis un bloc de commentaire HTML, puis deux lignes vides, puis le code HTML. Donc, en supprimant le commentaire HTML, nous aurons cinq lignes vides suivies du bloc HTML : nous devons donc vérifier que notre fichier contient six lignes.

L'astuce utilisée est :

- `cat --show-ends --show-tabs "$tempfile"` c'est-à-dire récupérer le contenu du fichier mais avec un `$` là où il y a un saut de ligne et, ici, aussi `^I` pour les tabulations.
- ensuite nous passons le résultat dans `tr "\n" "#"` : au lieu d'obtenir six lignes, nous n'en obtenons qu'une, en remplaçant les sauts de ligne par `#`.

Et voilà, puisque nous avons une variable avec une seule ligne (dans notre exemple : `$#$#$#$#$#<html><body/></html>$#`), nous pouvons la comparer à ce que nous attendons :

<Snippet filename="tests/simple.bats" source="./files/simple.part12.bats" />

### Vérifier un fichier avec une regex {#check-against-a-file-using-a-regex}

Un second scénario peut être : vous avez une fonction d'écriture (pensez à un fichier de log) et vous voulez vérifier la présence d'une ligne donnée dans le fichier.

L'exemple ci-dessous s'appuie sur `bats-file` et sa méthode `assert_file_contains`. Cette méthode demande un nom de fichier et un motif regex.

<Snippet filename="tests/simple.bats" source="./files/simple.part13.bats" />

### Vérifier qu'une valeur n'est PAS dans un fichier {#check-that-a-value-is-not-in-a-file}

Un autre usage de assert_failure peut être de lancer une commande comme un grep et de s'attendre à obtenir une erreur :

```bash
run grep "REGEX_SOMETHING_THAT_SHOULD_BE_MISSING" "/tmp/test.log"
assert_failure 1
```

### Quelques fonctions spéciales {#some-special-functions}

#### setup {#setup}

La fonction `setup` est appelée avant de lancer un test. Pour chaque fonction `@test` présente dans le scénario, la fonction `setup()` sera appelée.

Dans l'exemple suivant, comme il y a deux fonctions de test, `setup()` sera appelée deux fois.

<Snippet filename="tests/simple.bats" source="./files/simple.part14.bats" />

#### teardown {#teardown}

Tout comme `setup`, la fonction `teardown` sera appelée pour chaque test mais une fois le test lancé. C'est le bon endroit pour, par exemple, supprimer des fichiers créés pendant l'exécution d'un test.

```bash
teardown() {
    rm -f /tmp/bats
}
```

### Lancer les tests {#running-the-tests}

La commande `docker run --rm -it -w /code/tests -v .:/code bats/bats:latest simple.bats` va lancer le fichier `simple.bats` tandis que `docker run --rm -it -w /code/tests -v .:/code bats/bats:latest` va lancer tous les fichiers `.bats` du répertoire de travail.

#### Mocking {#mocking}

Nous pouvons surcharger une fonction pendant un test. Prenez le cas d'usage suivant : nous avons une fonction qui retourne 0 quand une image Docker donnée est présente sur l'host. La fonction retourne 1 et affiche une erreur sur la console si l'image n'est pas trouvée.

<Snippet filename="script.sh" source="./files/script.part3.sh" />

Nous devons donc surcharger la réponse de docker. Quand l'image est censée être là, il suffit de retourner une chaîne non vide, n'importe quoi sauf une chaîne vide. Retournons un faux ID pour vraiment simuler la réponse de `docker images -q`.

<Snippet filename="tests/simple.bats" source="./files/simple.part15.bats" />

Et retournons une chaîne vide pour simuler une image inexistante.

<Snippet filename="tests/simple.bats" source="./files/simple.part16.bats" />

## Conclusion {#conclusion}

Bats apporte à Bash ce qui lui a toujours manqué : un moyen de prouver qu'un script fait encore ce qu'il faisait le mois dernier. Le coût de mise en place est proche de zéro — un fichier `.bats`, l'image `bats/bats`, et aucun runner à installer — et le bénéfice apparaît la première fois qu'un refactoring casse une fonction que vous aviez oubliée.

Commencez petit. Prenez le script que vous avez le plus peur de toucher, écrivez trois tests pour son cas nominal, et ajoutez-en un chaque fois que vous y corrigez un bug. C'est généralement suffisant pour transformer un fichier Bash que vous n'osiez plus modifier en un fichier que vous pouvez modifier.
