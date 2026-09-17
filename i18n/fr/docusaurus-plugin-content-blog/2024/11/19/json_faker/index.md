---
slug: json-faker
title: JSON - Faker & Mockup
date: 2024-11-19
description: Générez et validez des données JSON avec la librairie Faker de Python et Mockaroo. Apprenez à créer de fausses données pour vos tests et à garantir la qualité des fichiers reçus avec des schémas.
authors: [christophe]
image: /img/v2/json.webp
mainTag: linux
tags:
  - linux
  - python
  - vscode
language: fr
updates:
  - date: 2026-07-30
    note: "Mockaroo was acquired by Tonic.ai (April 2025); service remains operational and free tier (200 API calls/day) is unchanged."
---
![JSON - Faker & Mockup](/img/v2/json.webp)

<!-- cspell:ignore birthdate,homme,femme,binaire,Mockaroo -->

<TLDR>
Cet article traite de la génération et de la validation de fausses données JSON pour vos tests : utiliser la librairie `Faker` de Python pour scripter des faux enregistrements sur mesure, utiliser Mockaroo.com (constructeur de schéma + API gratuite) pour générer de gros jeux de données comme 1 000 rows ou plus, et utiliser un convertisseur JSON-vers-schéma en ligne avec la librairie `jsonschema` de Python pour valider que les fichiers reçus correspondent bien à la structure attendue.
</TLDR>

J'ai récemment travaillé sur un projet ETL en Python. Entre autres choses, le script devait traiter des fichiers JSON que les utilisateurs déposaient dans un dossier précis.

Comme il s'agissait d'une application sensible, il était important de valider le script en soumettant de faux fichiers JSON, mais aussi de garantir la qualité des fichiers reçus.

*Deux compagnons quand vous travaillez avec du JSON en ligne de commande : <Link to="/blog/linux-jq">The jq utility for Linux</Link> pour inspecter et filtrer un fichier généré, et <Link to="/blog/json-crack">Rendering a JSON file as a mind map</Link> pour saisir d'un coup d'œil la structure d'un fichier inconnu.*

Pour les faux fichiers, j'ai utilisé un outil comme la librairie Faker pour Python.

<!-- truncate -->

## Générer un faux fichier JSON {#generate-faker-json-file}

L'idée est donc de générer un dictionnaire (un fichier json) avec de fausses données. Avec la librairie `Faker`, c'est vraiment, vraiment simple.

Installez d'abord la librairie avec `pip install faker`.

Voici un petit script Python pour générer de fausses données en français (remplacez simplement `range(1)` par `range(100)`, par exemple, pour obtenir 100 enregistrements) :

<Snippet filename="fake.py" source="./files/fake.py" />

![Faker in Python](./images/python.webp)

<AlertBox variant="info">
Poursuivez votre lecture avec la documentation officielle de Faker : [https://faker.readthedocs.io/en/master/](https://faker.readthedocs.io/en/master/)

</AlertBox>

## Utiliser Mockaroo.com {#using-mockaroocom}

Le site [https://www.mockaroo.com/](https://www.mockaroo.com/) permet de créer de fausses données gratuitement (pour accéder à certaines fonctions, vous devrez créer un compte gratuit).

![Using Mockaroo](./images/mockaroo.webp)

### Créer de fausses données à partir d'un schéma {#creating-a-fake-data-using-a-schema}

Après avoir créé un compte gratuit sur Mockaroo, cliquez sur le bouton `Schemas`, puis sélectionnez `Create a schema`. Sur l'écran suivant, cliquez sur `Generate fields using AI...` et collez une chaîne JSON existante :

![Creating a schema](./images/creating_schema.webp)

Cela fait, vous pourrez générer un grand nombre de rows — par exemple, un fichier avec plus de 1 000 enregistrements.

En sauvegardant les exemples dans un vrai fichier JSON sur le disque, vous pouvez ensuite utiliser ce fichier pour tester votre application.

### Utiliser l'API {#using-api}

En créant un compte gratuit sur Mockaroo, vous pouvez obtenir une clé d'API gratuite (limitée à 200 requêtes/jour).

La documentation de l'API est ici : [https://mockaroo.com/docs](https://mockaroo.com/docs).

Comme précédemment, cliquez sur le bouton `Schemas`, créez un schéma et sauvegardez-le.

J'ai créé le *schema_test* comme ceci :

![Mockaroo - Schema test](./images/mockaroo_schema_test.webp)

Je peux ensuite l'utiliser en Python comme ceci :

<Snippet filename="schema_test.py" source="./files/schema_test.py" />

<AlertBox variant="info">
Pour que ce code fonctionne, pensez à installer la librairie requests : `pip install requests`.

</AlertBox>

En appelant mon script deux fois, j'ai obtenu chaque fois un jeu de données différent :

![Calling Mockaroo API](./images/calling_mockaroo_api.webp)

## Convertisseur JSON vers schéma en ligne {#online-json-to-schema-converter}

Le site [https://www.liquid-technologies.com/online-json-to-schema-converter](https://www.liquid-technologies.com/online-json-to-schema-converter) vous permet de copier/coller du JSON existant et d'obtenir un squelette de schéma JSON.

![Generate a schema](./images/generate_schema.webp)

Une fois le schéma en main, vous pouvez l'utiliser en Python comme ceci :

<Snippet filename="validate.py" source="./files/validate.py" />

<AlertBox variant="info">
Vous devrez d'abord lancer `pip install jsonschema`.

</AlertBox>

Maintenant, je vais tester mon fichier. La première fois, mon fichier JSON sera correct. J'ai ensuite supprimé l'enregistrement `city` de mon JSON, et relancer le script échoue bien, comme prévu :

![JSON validation](./images/validate.webp)

<AlertBox variant="info">
Comme on le voit, très vite, nous avons généré 1 000 enregistrements et, aussi, un schéma de validation. Puis, en quelques lignes de Python, nous nous sommes assurés que le fichier est correct ou, sinon, nous avons repéré où se trouve l'erreur.

</AlertBox>

D'autres outils JSON à connaître : <Link to="/blog/json-crack">afficher un fichier JSON sous forme de carte mentale</Link> et <Link to="/blog/json-lint">linter/valider vos fichiers JSON</Link>.
