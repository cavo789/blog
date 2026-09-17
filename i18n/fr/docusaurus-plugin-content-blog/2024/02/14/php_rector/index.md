---
slug: php-rector
title: Rector 1.0.0 🎉🎉🎉, mon ami, mon coach
date: 2024-02-14
description: Découvrez PHP Rector, l'outil gratuit et puissant pour moderniser et refactoriser automatiquement votre code PHP. Améliorez la qualité de votre code et devenez un meilleur développeur PHP.
authors: [christophe]
image: /img/v2/rector.webp
series: code quality
mainTag: php
tags:
  - code-quality
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Rector has since released v2.x (current: v2.5.8); the article's commands and concepts remain valid but check the migration guide for config changes."
---
![Rector 1.0.0 🎉🎉🎉, mon ami, mon coach](/img/v2/rector.webp)

<TLDR>
Cet article présente Rector, un outil gratuit qui analyse votre code PHP et suggère (ou applique automatiquement) des améliorations de modernisation et de refactorisation. En prenant une simple fonction `sayHello` comme exemple, il montre Rector simplifiant un `if/else` en expression ternaire, supprimant une variable inutile et ajoutant les types corrects ainsi qu'un type de retour — le tout via `vendor/bin/rector process --dry-run --config rector.php`.
</TLDR>

S'il n'en fallait qu'un, ce serait [Rector](https://github.com/rectorphp/rector). **Rector est extrêmement puissant et brillant et, vous savez quoi, il est gratuit !**

Rector est une application formidable pour analyser et mettre à jour automatiquement votre code vers une version donnée de PHP, et cela veut dire aussi : inspecter votre façon de coder.

Rector va regarder chaque ligne de code, chaque boucle, chaque test conditionnel, chaque fonction, chaque classe d'un code source PHP et suggérer des améliorations.

Dans ce rôle, il ne va pas seulement détecter des améliorations possibles dans mon code (comme un outil d'analyse statique) mais, et c'est le plus gros avantage à mes yeux, il va me montrer comment devenir un meilleur développeur.

J'ADORE VRAIMENT RECTOR 💕

<!-- truncate -->

Comme beaucoup de gens, j'ai appris PHP tout seul et c'était à l'époque de PHP 5. Comme beaucoup de gens, j'ai certainement pris de mauvaises habitudes et, comme il est impossible de suivre chaque évolution du langage, mes compétences n'augmentent pas au même rythme que le langage.

Alors, peut-être que j'utilise encore une syntaxe *à l'ancienne* comme un simple `if ... then ... else` alors qu'en fait ce n'est pas utile. Peut-être que je vais utiliser une variable pour stocker une valeur alors que c'est totalement inutile.

Prenons un exemple très simple (`sayHello.php`) :

<Snippet filename="sayHello.php" source="./files/sayHello.php" />

Simple et efficace, non ? Et surtout, le code est parfaitement fonctionnel et bien écrit, respectant toutes les conventions de mise en forme.

<AlertBox variant="info" title="Je suis un excellent développeur. Merci et au revoir.">
Bon, en fait, **j'étais un excellent développeur** mais j'ai arrêté de l'être il y a dix ans.

</AlertBox>

Qu'est-ce qui cloche dans mon code ?

- `$firstname` est une chaîne, non ? Alors pourquoi ne pas écrire `string $firstname` ?,
- depuis PHP 7.x, il existe un truc appelé `ternary operator` ; vous ne le saviez pas ?,
- en utilisant le `ternary operator`, la variable `$text` devient inutile et
- la fonction retourne une chaîne (la variable `$text`) mais le prototype de la fonction ne le mentionne pas. Alors pourquoi ne pas écrire `function sayHello($firstname = ''): string`

## Voici ce que Rector en dit {#here-is-what-rector-says-about-it}

Avant même d'installer quoi que ce soit, voici la réponse que Rector donne sur ce fichier précis :

![Rector is simplifying our sayHello function](./images/rector_say_hello.webp)

Un diff coloré — le code tel qu'il est, le code tel qu'il pourrait être — et, en bas de l'écran, une section `Applied rules:`.

## Pourquoi ça fonctionne {#why-it-works}

- **Rector raisonne en règles nommées, pas en motifs.** Chaque changement vient avec le nom de la règle qui l'a produit, et ce nom est un lien vers une explication documentée.
- **Il parse votre code, il ne fait pas un grep.** Rector construit l'arbre syntaxique du fichier, c'est pour ça qu'il peut voir qu'une variable n'existe que pour être retournée, ou qu'une valeur de retour ne peut être qu'une chaîne.
- **Rien ne bouge tant que vous ne l'avez pas décidé.** Avec `--dry-run`, vous obtenez le diff et vos fichiers restent exactement tels qu'ils étaient : lire les suggestions ne coûte rien.

## Installer Rector {#install-rector}

<AlertBox variant="tip" title="Vous pouvez essayer Rector sans l'installer">
Rector fait partie des outils fournis dans l'image Docker <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link> et il est préinstallé dans le <Link to="/blog/php-devcontainer">PHP devcontainer</Link>. Si vous voulez juste voir ce qu'il dit de votre code, commencez par là.
</AlertBox>

Quand vous utilisez composer pour gérer les dépendances de votre projet, lancez simplement `composer require rector/rector --dev` dans une console. Cela va installer Rector comme dépendance de développement (ce qui est plutôt bien).

L'étape suivante consiste à créer un fichier de configuration. Vous pouvez utiliser un fichier standard (pour ça, lancez juste `vendor/bin/rector` et le fichier sera créé) ou créer le vôtre.

Je vous suggère de créer un fichier `rector.php` dans votre projet avec ce contenu :

<Snippet filename="rector.php" source="./files/rector.php" />

Par simplicité, créez le fichier `rector.php` à la racine de votre projet.

## Lancer Rector {#run-rector}

La commande qui a produit la capture ci-dessus est `vendor/bin/rector process sayHello.php --dry-run --config rector.php`.

Regardons-la de plus près :

- `vendor/bin/rector` : c'est l'exécutable à lancer,
- `process` : l'action à exécuter, c'est toujours `process`,
- `sayHello.php` : le fichier à analyser. Vous pouvez taper `.` pour tout votre projet ou p.ex. `app` quand `app` est un dossier,
- `--dry-run` : demande à Rector de seulement afficher les suggestions et de ne pas modifier le fichier et
- `--config rector.php` : c'est le nom de notre fichier de configuration.

Lancer cette commande revient donc à demander : **s'il te plaît, jette un œil à mon script sayHello.php et montre-moi comment améliorer ma syntaxe.** Et Rector le fait ; vite et sans juger, en montrant les changements qu'il **pourrait** faire et en expliquant pourquoi il les trouve meilleurs.

## Règles appliquées {#applied-rules}

Regardez la section `Applied rules:` à la fin de la capture d'écran ; voici les règles avec un lien vers leurs explications :

- [SimplifyIfElseToTernaryRector](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#simplifyifelsetoternaryrector)
- [SimplifyUselessVariableRector](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#simplifyuselessvariablerector)
- [ReturnTypeFromStrictScalarReturnExprRector](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#returntypefromstrictscalarreturnexprrector)
- [StrictStringParamConcatRector](https://github.com/rectorphp/rector/blob/main/docs/rector_rules_overview.md#strictstringparamconcatrector)

### SimplifyIfElseToTernaryRector {#simplifyifelsetoternaryrector}

En utilisant le `ternary operator`, on peut souvent remplacer une structure `if then else` par un test sur une seule ligne : le `ternary operator`.

```diff
function sayHello($firstname = '')
{
-    if ($firstname == '') {
-        $text = 'Hello World';
-     } else {
-        $text = 'Hello ' . $firstname;
-     }
// highlight-next-line
+    $text = $firstname == '' ? 'Hello World' : 'Hello ' . $firstname;
     return $text;
}
```

### SimplifyUselessVariableRector {#simplifyuselessvariablerector}

Je pense que tout le monde sera d'accord : stocker la valeur dans une variable `$text` puis retourner cette variable est inutile, ce n'est que de la pollution.

```diff
function sayHello($firstname = '')
-    $text = $firstname == '' ? 'Hello World' : 'Hello ' . $firstname;
-    return $text;
// highlight-next-line
+    return $firstname == '' ? 'Hello World' : 'Hello ' . $firstname;
};
```

### ReturnTypeFromStrictScalarReturnExprRector {#returntypefromstrictscalarreturnexprrector}

Quand le type de retour peut être déduit (ici, Rector comprend qu'on retourne une chaîne), le prototype de la fonction peut être adapté de cette manière.

```diff
class SomeClass
{
-    public function sayHello($firstname = '')
// highlight-next-line
+    public function sayHello($firstname = ''): string
    {
        return $firstname == '' ? 'Hello World' : 'Hello ' . $firstname;
    }
}
```

### StrictStringParamConcatRector {#strictstringparamconcatrector}

Quand un paramètre est une chaîne mais n'est pas typé comme tel, Rector le voit et suggère de mettre à jour le prototype ainsi :

```diff
class SomeClass
{
-    public function sayHello($firstname = ''): string
// highlight-next-line
+    public function sayHello(string $firstname = ''): string
    {
        return $firstname == '' ? 'Hello World' : 'Hello ' . $firstname;
    }
}
```

## Code final {#final-code}

Retour dans notre console : lancer `vendor/bin/rector process sayHello.php --dry-run --config rector.php` va m'afficher la nouvelle version *refactorisée* de mon code :

<Snippet filename="index.php" source="./files/index.php" />

<AlertBox variant="caution" title="Est-ce que j'en suis content ? Oh que oui !!!">
Oui, je suis très content et fier de voir à quel point mon code est maintenant meilleur et plus facile à lire.

Oui, je suis content d'avoir appris quelque chose et, désormais, je n'utiliserai plus de variable temporaire et je penserai à l'opérateur ternaire.

Oui, je suis très reconnaissant envers Rector de m'avoir enseigné ces nouvelles approches et de faire de moi un meilleur programmeur.

</AlertBox>

## Dernière chose, appliquer le changement {#last-thing-make-the-change}

Maintenant qu'on a pris le temps d'analyser les règles qui pourraient être appliquées et qu'on les trouve parfaitement adéquates, il est temps de refactoriser pour de vrai : il suffit de retirer le flag `--dry-run` et donc la commande finale à lancer est : `vendor/bin/rector process sayHello.php --config rector.php`.

Imaginez ce que ça pourrait donner sur tout mon projet si je lance `vendor/bin/rector process . --dry-run --config rector.php`.

## Conclusion {#conclusion}

Un linter vous dit qu'une ligne est mauvaise. Rector vous dit ce qu'il écrirait à la place, et nomme la règle pour que vous puissiez aller lire pourquoi. C'est la différence entre un outil qui vous note et un coach qui vous apprend — et après quelques séances, vous arrêtez d'écrire la variable temporaire inutile dès le départ.

Il y a plus de 400 règles à l'heure actuelle ; voyez-les toutes sur [https://getrector.com/documentation/rules-overview](https://getrector.com/documentation/rules-overview), et visitez [https://getrector.com/](https://getrector.com/) pour apprendre à configurer `rector.php` pour votre propre projet.

Rector n'est qu'une pièce de ma boîte à outils de qualité de code PHP ; voyez aussi <Link to="/blog/online-php-linter">comment reformater du code PHP mal formaté</Link>.
