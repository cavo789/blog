---
slug: python-pandas-merge
title: Pandas - Fusionner deux fichiers ou plus et en créer un seul
date: 2024-12-06
description: Fusionnez efficacement deux fichiers CSV ou Excel (ou plus) en Python grâce à la puissante librairie Pandas. Apprenez pas à pas à gérer les enregistrements manquants et à consolider des données comme les salaires des employés sur plusieurs années dans un seul DataFrame propre.
authors: [christophe]
image: /img/v2/pandas.webp
mainTag: python
tags:
  - excel
  - python
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the merged result now comes right after the hook, before the data-generation script."
---
<!-- cspell:ignore vlookup,sheet -->
<!-- markdownlint-disable-file MD010 -->

![Pandas - Fusionner deux fichiers ou plus et en créer un seul](/img/v2/pandas.webp)

<TLDR>
Cet article montre comment utiliser la librairie Pandas de Python pour fusionner plusieurs fichiers CSV annuels (par exemple les salaires des employés de 2020 à 2024) en un seul fichier consolidé, en gérant correctement les enregistrements qui n'apparaissent pas dans chaque fichier (nouvelles embauches, départs) — une tâche qui devient ingérable dans Excel avec VLOOKUP dès que les fichiers dépassent quelques rows.
</TLDR>

Vous avez deux fichiers ou plus et vous souhaitez les fusionner. Par exemple, une liste d'employés et leur salaire de 2020 à 2024. Ou une liste de centres de coûts avec leur budget/dépenses. Ou une liste d'étudiants et leurs notes. Ou ...

Prenons un exemple : une liste d'employés et leurs salaires.

Nous avons plusieurs fichiers, un par année, avec cette structure :

<!-- cspell:disable -->
```csv
id;first_name;last_name;salary
0;Gina;Andrade;6040
1;Adam;Rowe;3866
2;Michael;Martinez;6913
```
<!-- cspell:enable -->

Et notre besoin est de fusionner les fichiers annuels pour en générer un seul avec les employés et leur salaire au fil des années. Au final, nous voulons obtenir ceci :

<!-- cspell:disable -->
```csv
id;first_name;last_name;salary_2020;salary_2021;salary_2022;salary_2023;salary_2024
0;Gina;Andrade;6040;4413;7773;6208;7363
1;Adam;Rowe;3866;3678;2726;5425;7570
2;Michael;Martinez;6913;6493;5664;4902;4657
```
<!-- cspell:enable -->

Avec Pandas, ce sera un jeu d'enfant...

<!-- truncate -->

## Le résultat : cinq années de salaires, un seul fichier {#the-result-five-years-of-salaries-one-file}

Lancer le script de fusion (présenté en entier plus bas) sur cinq fichiers CSV annuels produit un fichier consolidé, y compris pour les employés arrivés ou partis en cours de route :

![Merged](./images/merged.webp)

Comme on le voit sur l'image, la fusion est bien là : nos 10 employés (de 0 à 9), et si un employé était présent dans un fichier (comme celui ajouté en 2023, appelé `John John`), on voit son salaire dans le résultat.

Et, ouvert dans Excel, voici notre résultat final (et si vous devez coller ce résultat dans un document Markdown, mon convertisseur <Link to="/blog/markdown-csv2md">CSV to Markdown table</Link> le fait en un clic) :

![Employés fusionnés, dans Excel](./images/excel.webp)

L'année prochaine, nous aurons un fichier appelé `employees_2025.csv` et il suffira de relancer la fusion.

## Pourquoi ça fonctionne {#why-it-works}

<AlertBox variant="note">
Rien ne garantit qu'un employé se trouve dans chacun des fichiers. Il peut être présent en 2020 et 2021 puis quitter l'entreprise ; il peut être engagé en 2022 et démissionner en 2023 ; il peut n'arriver qu'en 2024.

La fusion doit donc en tenir compte.

</AlertBox>

- La fusion utilise un **outer join** sur `id`, donc personne n'est écarté silencieusement, qu'il soit arrivé en cours de période ou parti avant le dernier fichier.
- Chaque colonne `salary` annuelle est renommée `salary_2020`, `salary_2021`, ... *avant* la fusion, ainsi les colonnes n'entrent jamais en collision.
- Aucune formule `VLOOKUP` à maintenir entre les feuilles, et aucune row d'appoint à ajouter à la main quand quelqu'un manque pour une année.

## Installation {#installation}

Pour illustrer cet article, créons quelques fichiers CSV. Nous allons créer des fichiers de 2020 à 2024. Passez ce chapitre si vous avez déjà vos propres fichiers CSV.

Nous allons créer un ensemble de 10 employés qui resteront avec nous tout du long et, pour chaque année, nous créerons un employé présent uniquement cette année-là. Ceci pour illustrer le fait qu'un employé peut figurer dans un fichier et pas dans les autres.

Le script ci-dessous va créer deux fichiers, un appelé `employees_2023.csv` et un pour `employees_2024.csv`, afin d'avoir des fichiers factices.

<AlertBox variant="note">
Pour pouvoir lancer ce script, vous devez d'abord exécuter `pip install pandas faker` pour installer les deux packages.

</AlertBox>

<Snippet filename="generate_fake_data.py" source="./files/generate_fake_data.py" />

<!-- cspell:enable -->

En lançant ce script, nous obtenons quelques fichiers csv ayant exactement la même structure, comme ceci :

<!-- cspell:disable -->
```csv
id;first_name;last_name;salary
0;Gina;Andrade;6040
1;Adam;Rowe;3866
2;Michael;Martinez;6913
3;Michael;Thomas;6201
4;Angela;Green;3318
```
<!-- cspell:enable -->

![Génération de données factices](./images/generate_fake_data.webp)

## Plus de démos : le script de fusion, ligne par ligne {#more-demos-the-merge-script-line-by-line}

Avec Pandas, il est assez simple de boucler sur les fichiers et de faire une fusion.

<Snippet filename="merge.py" source="./files/merge.py" />

Le script va prendre le premier fichier (`employees_2020.csv`) et le charger en mémoire. La colonne `salary` sera, en mémoire, renommée `salary_2020`.

Ensuite, pour chaque année restante (de 2021 à 2024), le script va charger un deuxième fichier et le fusionner avec le précédent (donc, d'abord, fusionner 2020 et 2021).

L'action de fusion signifie : récupérer `id`, `first_name` et `last_name` puis aussi `salary_2020` du premier fichier et `salary_2021` du deuxième, et créer un nouveau fichier (un `DataFrame` dans le vocabulaire de Pandas).

Puis traiter les fichiers restants (2022 à 2024).

À la fin, le script sauvegarde le fichier sur le disque sous le nom `employees_merged.csv`.

## Sous le capot (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Pourquoi `outer` et pas `inner` ou `left` {#why-outer-and-not-inner-or-left}

`merged_df.merge(df_year, on=['id', 'first_name', 'last_name'], how='outer')` fait tout le travail. L'argument `how` décide qui survit à la fusion :

- `inner` ne garderait que les rows dont l'`id` existe dans **chaque** fichier fusionné jusque-là — toute personne arrivée après 2020 ou partie avant 2024 disparaît.
- `left` ne garderait que les rows du *premier* fichier — les nouvelles embauches des années suivantes n'apparaîtraient jamais.
- `outer` (utilisé ici) garde l'union : chaque `id` vu dans n'importe quel fichier, avec `NaN` pour les années où la personne n'avait pas de row.

### Pourquoi les colonnes n'entrent pas en collision {#why-the-columns-dont-collide}

Le comportement par défaut de Pandas, quand une fusion trouve le même nom de colonne (`salary`) des deux côtés, est de les suffixer `salary_x` / `salary_y` — acceptable pour deux fichiers, illisible pour cinq. C'est pourquoi le script renomme `salary` en `salary_{year}` *avant* chaque fusion : au moment où `merge()` s'exécute, les noms de colonnes sont déjà uniques, donc le résultat affiche `salary_2020`, `salary_2021`, ... au lieu d'un empilement de `_x`/`_y`/`_x_x`.

## Conclusion {#conclusion}

Sans Pandas, l'approche habituelle consiste à charger les fichiers un par un dans Excel, à créer des formules comme `vlookup` entre chaque `sheet`, et à créer une nouvelle `sheet` qui contiendra les valeurs trouvées — mais cela ne fonctionne que si le même enregistrement se trouve dans plusieurs fichiers.

Comment gérez-vous les cas où un enregistrement a été ajouté ? Il faudrait faire un `append` dans la `sheet` qui fusionne tout et ... Une solution serait d'ajouter tous les enregistrements dans une feuille globale (avec une colonne année) puis d'utiliser un tableau croisé dynamique pour ... aïe, ça complique les choses, non ?

Maintenant, imaginons des fichiers CSV qui ne font pas 10 rows mais plus d'un million de rows chacun. Charger 5 fichiers (2020 à 2024), c'est charger plus de 5 millions de rows et avoir une `sheet` qui contiendra la fusion et au moins 1 million de rows elle aussi.

Imaginez l'effort pour ouvrir les fichiers et attendre qu'Excel recalcule ses formules. L'horreur !

À cette échelle, la vraie réponse est généralement d'arrêter de jongler avec des fichiers et de mettre les données dans une base de données, puis de laisser Excel l'interroger ; voyez <Link to="/blog/vba-excel-sql-server">MS Excel - Connect to a SQL Server database, run a query and get the results</Link>.
