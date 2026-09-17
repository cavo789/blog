---
slug: msaccess-optimize
title: Comment optimiser une base de données MS Access existante
date: 2024-03-09
description: Accélérez votre base de données Microsoft Access lente grâce à ce guide d'optimisation pas à pas. Apprenez à améliorer la structure des tables, à utiliser les index, à optimiser les requêtes et à compacter votre base pour de meilleures performances.
authors: [christophe]
image: /img/v2/msaccess.webp
series: VBA & MS Office automation
mainTag: msaccess
tags:
  - database
  - msaccess
  - vba
blueskyRecordKey: 3m4kn37zsn22k
language: fr
review_date: 2026-07-30
---
![Comment optimiser une base de données MS Access existante](/img/v2/msaccess.webp)

<TLDR>
Voici une checklist complète pour accélérer une base MS Access existante sans la ré-architecturer : ajouter des clés primaires et des index, utiliser les bons types et tailles de champs, préférer le SQL natif (`Is Null`, `Iif()`, `BETWEEN`) aux fonctions VBA (`IsNull()`, `NZ()`, `Year()`) qui contournent les index, filtrer avec `WHERE` avant `HAVING`, convertir les macros en modules VBA, compiler le code et compacter la base.
</TLDR>

Il y a plusieurs années, j'ai dû intervenir sur une base de données MS Access créée par une personne de bonne volonté mais avec peu d'affinités pour l'informatique et l'optimisation.

Le résultat : une base lourde et d'une lenteur exaspérante.

Dans cet article, ressorti de mes archives personnelles, je vais présenter les différentes étapes par lesquelles je suis passé.

<!-- truncate -->

<AlertBox variant="note" title="Avertissement">
Ce guide concerne délibérément les **bases de données existantes** ; pour cette raison, je ne parlerai pas de la manière de concevoir correctement des tables, de garder un nombre de champs raisonnable ou de dessiner un schéma relationnel, ... L'objectif est donc d'améliorer les performances sans programmation profonde (pas de ré-architecture) et sans <Link to="/blog/docker-mssql-server">migrer vers, par exemple, SQL Server</Link>.

*Pour savoir **quels** champs sont surdimensionnés avant de les réduire, lancez le script d'audit de <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link> : il indique, pour chaque champ, sa taille déclarée à côté de la plus longue valeur réellement stockée.*

</AlertBox>

## MS Access - Analyser les performances {#ms-access---analyze-performance}

MS Access 2016 fournit un outil pour analyser la base de données courante.

![MS Access - Analyser les performances](./images/access_analyze_performance.webp)

Vous pouvez lancer l'outil sur une sélection uniquement, par exemple sur les requêtes seulement.

## À faire vous-même {#do-it-yourself}

### Tables {#tables}

#### Ajouter une clé primaire dans chaque table {#add-a-primary-key-in-each-table}

Selon votre modèle de données, essayez d'ajouter une clé primaire dans chaque table.

Par exemple, si vous avez une table Client, vous aurez probablement un champ qui identifie sans aucun doute un client donné ; un champ comme `CustomerID` (quel que soit son nom).

Examinez toutes vos tables et, si vous disposez d'un tel champ unique, définissez-le comme clé primaire.

Si possible, une clé primaire devrait être

- un seul champ (vous pouvez en effet définir plusieurs champs comme clé),
- un nombre, pas un champ texte,
- aussi petite que possible (si vous avez vraiment besoin d'un champ texte, préférez par exemple un champ de 5 caractères et non de 255)

Faites un clic droit sur le nom de la table et choisissez `Design`.

![Ouvrir la table en mode création](./images/design.webp)

Sélectionnez le champ puis cliquez sur le bouton `Primary key`.

![Ajouter une clé primaire](./images/primarykey_add.webp)

Attention : assurez-vous d'identifier correctement le champ unique ; n'ajoutez pas une clé primaire sur, par exemple, un nom de client (puisque plusieurs clients peuvent porter le même nom). Une clé primaire augmentera la vitesse et la cohérence des données de votre table, mais empêchera aussi d'avoir un second enregistrement avec la même clé (donc, si vous choisissez le mauvais champ, vous pouvez avoir des effets de bord).

#### Utiliser des index {#use-indexes}

Regardez vos requêtes : filtrez-vous souvent sur un champ précis ? Vous pourriez obtenir un très net gain de performance en ajoutant simplement un index sur ce champ.

Pour ce faire, ouvrez votre table en mode création en faisant simplement un clic droit sur le nom de la table

![Ouvrir la table en mode création](./images/design.webp)

Cliquez ensuite sur le bouton `Indexes` pour afficher une petite fenêtre et, là, ajoutez des index sur les champs importants.

![Ajouter des index](./images/index_add.webp)

Note : n'en abusez pas, ne *sur-indexez* pas. N'ajoutez des index que sur les champs souvent utilisés dans les critères de requête, car maintenir un index consomme du CPU et a donc un coût sur les instructions d'insertion, de mise à jour et de suppression.

#### Créer des relations entre les tables si possible {#create-relationships-between-tables-if-possible}

Lorsque vous utilisez, dans une requête, deux tables ou plus ayant un lien entre elles, les techniques d'optimisation de MS Access suggèrent de créer ce lien également dans la fenêtre des relations, c'est-à-dire à un niveau global.

Pour ce faire, une fois votre base ouverte, cliquez sur le menu `Database Tools` et choisissez `Relationships`.

Dessinez votre relation, sélectionnez soigneusement le type de jointure (qui peut aussi être ajusté dans une requête) et enregistrez les relations.

![Créer des relations entre les tables](./images/relationships.webp)

Exemple : lien entre deux tables sur l'`ID` de la première table et le champ associé, `tblOneID` dans la seconde. La flèche est dessinée de `table1` vers `table2` (c'est le `join type`) et cela signifie : « prends tous les enregistrements de `table1` et, si la valeur est aussi connue dans `table2`, alors retourne les valeurs ».

Astuce : essayez toujours d'utiliser un index pour la relation et pas « n'importe quel champ ».

![Exemple de relation entre deux tables](./images/relationships_sample.webp)

#### Utiliser le bon type de données et la bonne taille {#use-the-right-data-type-and-the-right-size}

Dans vos tables, essayez de bien choisir le type de données :

- si vous devez stocker une information Vrai/Faux (ou 1/0), choisissez un `Yes/No`
- si vous devez stocker un petit nombre (par exemple `Number of children`), ne choisissez pas Number - Long Integer alors que Number - Byte suffit,
- ...

Et la bonne taille : surtout pour les champs texte, n'utilisez pas une longueur de 255 (ce n'est presque jamais nécessaire) mais essayez de penser à la valeur la plus longue (avez-vous vraiment un client avec un nom de famille de 255 caractères ? 50 suffiront probablement).

### Requêtes {#queries}

#### Utiliser Between {#use-between}

Quand vous devez écrire un critère `between`, par exemple ID entre 5 et 9, vous pouvez le faire comme ceci :

![Préférez BETWEEN](./images/query_between.webp)

- Deux fois la même colonne, une avec `>= 5` et la seconde avec `< 10`
- Ou dans la même colonne avec un `Between 5 and 9`

La meilleure approche est celle en jaune : un seul champ et donc un seul critère à évaluer.

#### Compter le nombre d'enregistrements {#count-the-number-of-records}

Si vous utilisez la fonction Count pour calculer le nombre d'enregistrements retournés par une requête, utilisez la syntaxe `Count(*)` plutôt que `Count([some_field])`.

`Count(*)` est plus rapide car il n'a pas à vérifier les valeurs Null dans le champ indiqué et n'ignorera pas les enregistrements nuls.

*En utilisant `Count([some_field])`, le nombre retourné **peut être plus faible** que le nombre réel d'enregistrements si la colonne `some_field` vaut parfois Null.*

#### Uniquement les champs nécessaires {#only-needed-fields}

Si vous utilisez une requête dans une autre requête, comme illustré ci-dessous, et que vous n'avez besoin que de trois champs dans la seconde requête, la première peut peut-être être modifiée pour ne retourner que ces trois champs.

![Requête utilisant une autre requête](./images/query_on_query.webp)

Si, dans cet exemple, la requête appelée `qryFirst` n'est utilisée que par cette seconde requête, alors vous pouvez modifier la première pour ne retourner que trois colonnes.

Moins il y a de données retournées, plus la requête sera traitée rapidement.

#### Utiliser Is Null et pas IsNull() {#use-is-null-and-not-isnull}

Dans une requête, utilisez `Is Null` qui est natif dans le standard SQL alors que `IsNull()` est en réalité une fonctionnalité VBA.

Utiliser `IsNull()` est donc plus lent que `Is Null`.

Évitez donc,

```SQL
SELECT ... FROM ... WHERE IsNull(fld)
```

Et utilisez,

```SQL
SELECT ... FROM ... WHERE (fld Is Null)
```

#### Utiliser Iif() et pas NZ() {#use-iif-and-not-nz}

NZ() est une fonctionnalité VBA : si un champ vaut Null, NZ() vous permet de retourner autre chose.

Iif() est du SQL natif.

Illustration simplifiée : si la date d'embauche est nulle, on suppose qu'il s'agissait du 1er janvier 2000.

```SQL
SELECT NZ([dteHiring], #2000-01-01#) As dteEntry
```

La même chose peut aussi s'écrire comme ceci :

```SQL
SELECT Iif([dteHiring] Is Null, #2000-01-01#, [dteHiring]) As dteEntry
```

Pourquoi est-ce mauvais ? **NZ() retournera un objet variant, moins performant, car le moteur .JET de MS Access traite les Variants comme du texte**. Dans le premier exemple `NZ([dteHiring], #2000-01-01#) As dteEntry`, le type de données de dteEntry est donc un champ texte, pas une date.

Donc, dans l'exemple ci-dessous, nous ne comparons pas une date avec une autre date mais une date `dteEntry` avec un texte (le résultat de la formule `NZ()`). Le moteur .JET va donc convertir `dteEntry` en texte aussi. La conversion est donc faite deux fois et c'est inefficace.

![Utiliser NZ() comme critère](./images/nz_date.webp)

Avec `Iif([dteHiring] Is Null, #2000-01-01#, [dteHiring]) As dteEntry`, le type reste un champ date. Nous pouvons donc rapidement résoudre la double conversion introduite par `NZ()` avec cette construction :

![Utiliser Iif() comme critère](./images/iif_date.webp)

Ici, .JET ne se plaindra plus et comparera immédiatement une date avec une autre date ; c'est plus rapide.

#### Éviter les fonctions VBA {#avoid-vba-functions}

Nous l'avons déjà vu. Utilisez `Is Null` et pas `IsNull()`, utilisez `Iif` et pas `NZ()`, et cela s'applique à beaucoup d'autres formules.

##### Year() {#year}

Year() est une fonction VBA. La requête ci-dessous exige que chaque date soit traitée par Year() pour déterminer l'année avant d'évaluer le critère.

S'il existe un index sur `dteHiring`, cet index est ignoré à cause de l'appel VBA.

```SQL
SELECT ... FROM ... WHERE (Year([dteHiring]) = 2018)
```

Préférez le verbe SQL natif `BETWEEN` :

```SQL
SELECT ... FROM ... WHERE ([dteHiring] between '1/1/2018 00:00:00' and '12/31/2018 23:59:59')
```

Ici l'index est bien utilisé, .JET n'a pas non plus besoin de faire un appel VBA enregistrement par enregistrement mais peut travailler sur un ensemble d'enregistrements d'un coup.

##### DCount(), DSum() {#dcount-dsum}

Préférez réécrire la requête et utiliser, par exemple, des sous-requêtes avec un GROUP BY et la formule souhaitée (Count(), Sum(), ...)

#### Trier sur des colonnes, pas sur des formules {#sorting-on-columns-not-formulas}

Si possible, il est préférable d'utiliser le tri sur des colonnes (et donc probablement d'utiliser des index).

Dans l'exemple suivant, l'ORDER BY porte sur une formule (une concaténation de chaînes) ; aucun index ne peut être utilisé ici, donc le temps nécessaire au tri des enregistrements est plus long.

```SQL
SELECT ClientID, Name + " " + FirstName As FullName
FROM tblClient
ORDER BY Name + " " + FirstName
```

Dans l'exemple ci-dessous, le résultat sera exactement le même, sauf que si une ou les deux colonnes sont indexées, le résultat sera plus rapide.

```SQL
SELECT ClientID, Name + ", " + FirstName As FullName
FROM tblClient
ORDER BY Name, FirstName
```

#### Utiliser le même type de données (ou un type compatible) dans les champs de jointure {#use-the-same-or-compatible-data-type-in-join-fields}

Quand vous faites un lien entre deux tables (avec une jointure), essayez de respecter le type de données : évitez de lier par exemple un nombre et un champ texte.

Prenons l'exemple suivant :

![Relation](./images/sametype_relation.webp)

*Le champ `ID` dans `tblCustomer` est un nombre*

![Client](./images/sametype_customer.webp)

*Le champ `CustomerNumber` dans `tblOrder` est un texte (et un grand)*

![Commandes](./images/sametype_orders.webp)

MS Access sera capable de faire la jointure et cela fonctionnera, mais il convertira implicitement les champs pour qu'ils aient le même type de données, et cela coûtera du CPU.

Dans cet exemple, si possible, changez le type de données de `CustomerNumber` dans `tblOrder` en `Long integer` pour que les champs soient compatibles.

#### Filtrer d'abord avec WHERE avant HAVING {#first-filter-by-using-where-before-having}

Les requêtes de totaux (celles avec une clause `GROUP BY`) peuvent avoir à la fois une clause `WHERE` et une clause `HAVING`.

- `WHERE` est exécuté en premier, **avant l'agrégation**
- `HAVING` est exécuté ensuite, **quand les totaux ont été calculés**

Ci-dessous, il n'y a pas de clause `WHERE` : le calcul « combien de factures par client » est fait pour tous les clients (plusieurs milliers peut-être) et, une fois tout ce calcul terminé, vous demandez juste le chiffre du client 99. Plutôt inefficace.

```SQL
SELECT ClientID, Count(InvoiceID) AS HowMany
FROM tblInvoice
GROUP BY ClientID
HAVING ClientID = 99;
```

Profitez de la priorité de `WHERE` et obtenez la même information, bien plus vite, comme ceci :

```SQL
SELECT ClientID, Count(InvoiceID) AS HowMany
FROM tblInvoice
WHERE ClientID = 99
GROUP BY ClientID;
```

Ici, .JET ne prend que les enregistrements de ce client avant de commencer à compter.

#### Si vous groupez sur la clé primaire {#if-youre-group-on-the-primary-key}

Dès que vous utilisez un GROUP BY dans votre SQL, tout champ « non » calculé doit être mentionné dans la clause GROUP BY.

Comme nous n'utilisons pas une formule du type Count(), Max(), ... sur LastName, ce champ doit être mentionné dans la clause GROUP BY, donc :

```SQL
SELECT EmployeeID, LastName, Count(Illness)
FROM Employees
GROUP BY EmployeeID, LastName
```

Mais ici, grouper sur LastName est inutile car EmployeeID est déjà unique : quand on utilise la clé primaire dans le GROUP BY, tout autre champ est superflu et, à cause de leur présence, .JET va grouper pour rien. Des actions inutiles...

Comme la clé primaire est dans la clause GROUP BY, nous pouvons utiliser ce SQL :

```SQL
SELECT EmployeeID, First(LastName) AS LastName, Count(Illness) As IllDays
FROM Employees
GROUP BY EmployeeID
```

En utilisant First(), nous permettons à .JET de ne retenir que le premier LastName pour cet Employee ID (et, bien sûr, l'employé n'a qu'un seul LastName).

C'est donc plus rapide.

<!-- below, content of ./020-do-it-yourself/030_macros/readme.md -->

### Macros {#macros}

#### Convertir les macros en modules {#convert-macros-to-modules}

Convertir une macro en code Visual Basic for Applications (VBA) peut permettre à certaines actions de s'exécuter plus vite.

Pour convertir une macro en VBA, sélectionnez la macro (ne l'ouvrez pas, sélectionnez-la simplement) et, dans l'onglet `Database Tools`, cliquez sur `Convert Macros to Visual Basic`.

Ensuite, une fois cela fait, vous devrez probablement mettre à jour votre interface : si vous avez des formulaires, vous devrez par exemple mettre à jour les boutons pour qu'ils déclenchent le module VBA au lieu des macros.

Si tout se passe bien, supprimez simplement les macros converties.

<!-- below, content of readme.md -->

### Modules {#modules}

#### Enregistrer les modules à l'état compilé {#save-modules-in-a-compiled-state}

Si la base contient des modules, assurez-vous, dans la version de production, de compiler le code source. Il suffit d'ouvrir un module (peu importe lequel) et de cliquer sur le menu `Debug` puis `Compile`.

![État compilé](./images/compiled_state.webp)

#### Utiliser l'instruction Option Explicit {#use-option-explicit-statement}

Si vous avez des modules ou des événements de formulaire codés en VBA, ouvrez chaque module / formulaire (appuyez ensuite sur `ALT-F11` pour ouvrir l'éditeur) et, à la toute première ligne de votre code, tapez `Option Explicit` comme par exemple :

```vbnet
Option Compare Database
Option Explicit

Sub DoSomething()
    ' your own code
End Sub
```

Option Explicit force le moteur VB à vérifier que les variables existent avant de commencer à exécuter le code, et non chaque fois qu'une variable est accédée. Cela donne un petit gain de vitesse.

<AlertBox variant="caution">
Option Explicit est avant tout une excellente pratique de codage : les variables doivent être déclarées avant d'être utilisées.

</AlertBox>

#### Décharger les références {#unload-references}

Regardez, dans votre code, si vous référencez trop de dépendances externes.

Depuis l'éditeur VB, cliquez sur le menu `Tools` puis choisissez `References` et faites attention aux premiers éléments de la liste, ceux qui sont cochés. En avez-vous vraiment besoin ?

Un moyen simple de répondre à cette question est de les décocher et de cliquer sur le bouton `OK`.

Cliquez sur le menu `Debug` et choisissez `Compile`. Si vous obtenez des erreurs de compilation (et qu'il n'y en avait pas avant), retournez dans la fenêtre `References` et recochez la bibliothèque.

![Décharger les références non utilisées](./images/unload_references.webp)

La plupart du temps, seules deux références sont nécessaires :

1. `Visual Basic For Applications` (toujours en haut)
2. `Microsoft Access 16.0 Object Library` (la deuxième) (Note : « 16.0 » est variable et dépend de la version de MS Office installée)

<!-- below, content of readme.md -->

### Base de données {#database}

#### Compacter la base de données {#compact-the-database}

Si vous avez des tables temporaires, supprimez-les au préalable.

Compacter la base libérera de l'espace, supprimera les objets et enregistrements inutiles et mettra à jour les statistiques internes ; cela aura un impact positif sur les performances.

#### Enregistrer la base en fichier .mde {#save-the-database-as-a-mde-file}

**!!! Attention !!!**

Un fichier .mde est plus petit et plus rapide qu'un fichier MS Access normal (fichier .accdb) mais vous ne pouvez plus modifier la structure d'un tel fichier.

Avec un .mde, vous ne pourrez plus changer la structure d'une table, ajouter un champ, modifier vos formulaires, ... mais seulement les utiliser.

![Enregistrer sous - MDE](./images/save_as_mde.webp)

**Si vous souhaitez utiliser un .mde, faites toujours une sauvegarde de votre fichier .accdb (ou .mdb) et gardez-la dans un dossier sécurisé. Encore une fois : si vous n'avez plus le fichier .accdb mais seulement le .mde, vous ne pourrez plus changer la structure de l'application, vous ne pourrez plus modifier une macro, un formulaire, ...**

<AlertBox variant="info" title="Scanner toutes les tables et exporter une liste exhaustive des champs dans Excel">
Voyez aussi mon article <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link>.

</AlertBox>
