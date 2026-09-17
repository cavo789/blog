---
slug: pentaho-discovery
title: À la découverte de Pentaho, un programme ETL
date: 2025-06-20
description: Découvrez Pentaho Data Integration (ETL). Suivez ce guide pas à pas pour installer Pentaho (PDI/Kettle) sous Linux et charger les données d'un fichier Excel dans une base PostgreSQL avec Docker.
authors: [christophe]
image: /img/v2/etl.webp
mainTag: database
tags:
  - database
  - docker
  - excel
  - linux
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lumzwwoqsc2r
---
![À la découverte de Pentaho, un programme ETL](/img/v2/etl.webp)

<TLDR>
Ce guide propose une introduction pas à pas à Pentaho Data Integration (PDI/Kettle) sous Linux. Il parcourt tout le processus de mise en place de votre environnement, de l'installation de Pentaho et de ses dépendances Java jusqu'à la création d'un job ETL d'exemple. Vous apprendrez à utiliser Docker pour démarrer rapidement une base PostgreSQL, puis à utiliser Spoon, l'interface graphique de Pentaho, pour construire une transformation qui extrait les données d'un fichier Excel et les charge dans une table PostgreSQL.
</TLDR>

<!-- cspell:ignore pentaho,xtract,ransform,sheetname,dpage,webkitgtk -->

Pentaho Data Integration est un outil ETL (**E**xtract, **T**ransform and **L**oad) utilisé pour l'intégration de données. Imaginons que vous ayez un fichier Excel et que vous vouliez en extraire des enregistrements (uniquement ceux qui correspondent à une règle précise), puis appliquer une transformation (comme ajouter de nouvelles colonnes basées sur les données existantes) et les charger dans une base PostgreSQL.

Pentaho (également appelé **PDI** ou **Kettle**) va vous permettre de *dessiner* un flux de données (charger des fichiers, faire des merges, appliquer une transformation, exécuter du code (Shell ou JavaScript), ... et stocker le résultat quelque part (une base de données ou un fichier) ou même envoyer une information par email en cas d'échec).

Découvrons rapidement Pentaho et, pour un premier exemple, chargeons un fichier Excel dans une base PostgreSQL.

<!-- truncate -->

Voici exactement ce que nous allons construire : un flux qui lit un fichier Excel, puis charge ses lignes dans une table PostgreSQL.

![Nous sommes prêts à lancer la transformation](./images/ready_to_run.webp)

![Exécuté avec succès](./images/run_with_success.webp)

<BrowserWindow url="http://localhost:8080">
  <img
    alt="Les enregistrements ont été chargés avec succès dans PostgreSQL"
    src={require("./images/successfully_loaded_in_postgres.webp").default}
  />
</BrowserWindow>

## Pourquoi ça fonctionne {#why-it-works}

- Spoon, l'interface graphique de Pentaho, est un canevas en glisser-déposer : aucun code à écrire, juste des étapes (entrée Excel, sortie base de données, ...) reliées par des flèches.
- Chaque étape peut être testée isolément — prévisualiser les lignes Excel, tester la connexion à la base — avant même de lancer le flux complet.
- Pentaho génère pour vous le SQL `CREATE TABLE` à partir du flux lui-même, donc le schéma de la base et le flux ne divergent jamais.

## Installation sous Linux {#installation-on-linux}

Pentaho peut être installé sous Windows comme sous Linux puisqu'il s'agit d'une application Java.

Mon expérience personnelle : même avec un ordinateur puissant et beaucoup de RAM, les interfaces Java sous Windows sont tout simplement impossibles tant elles manquent de réactivité. En plus, avant même de pouvoir lancer l'application, il faut se donner la peine d'installer Java et ... beurk.

Passons à la suite et installons-le sous Linux ; c'est vraiment facile à faire.

<StepsCard
  variant="steps"
  steps={[
    { content: "Rendez-vous sur [https://pentaho.com/pentaho-developer-edition/](https://pentaho.com/pentaho-developer-edition/) ; remplissez le formulaire (c'est obligatoire) avant d'obtenir la liste des fichiers que vous pouvez télécharger" },
    {
      content: "Téléchargez le fichier `pdi-ce-10.2.0.0-222.zip`. Si, comme moi, vous êtes sous Windows, l'archive sera déposée sur votre partition Windows ; copions-la vers votre partition Linux",
      substeps: [
        "Démarrez votre console Linux et créez un nouveau dossier comme par exemple `~/tools/pentaho` (vous pouvez choisir un autre path mais, dans cette documentation, nous parlerons de `~/tools/pentaho`)",
        "Toujours dans votre console, lancez `explorer.exe .` en ligne de commande pour démarrer l'Explorateur Windows et y ouvrir votre dossier Linux (voir [ouvrir votre dossier Linux dans l'Explorateur Windows](/blog/wsl-windows-explorer))",
        "Dans un nouvel onglet (dans l'Explorateur Windows donc), allez dans vos dossiers de téléchargement pour retrouver le fichier téléchargé",
        "Copiez le fichier depuis le dossier Windows vers votre dossier Linux ; par un glisser-déposer par exemple"
      ]
    },
    "De retour dans votre console Linux, allez dans le dossier où vous venez de copier le fichier (`~/tools/pentaho`)",
    "Lancez `rm *Zone.Identifier` pour supprimer un fichier inutile (créé par Windows lors de la copie)",
    "Lancez `unzip pdi-ce-10.2.0.0-222.zip`. Cette commande va créer un sous-dossier `data-integration`",
    "Lancez `rm pdi-ce-10.2.0.0-222.zip` puisque nous n'en avons plus besoin, puis lancez `cd data-integration` pour entrer dans le nouveau dossier",
    {
      content: "La prochaine étape consiste à préparer votre système",
      substeps: [
        "Lancez `sudo apt-get update`",
        "Ensuite, lancez `sudo apt-get install openjdk-11-jdk` puisque Pentaho a besoin de Java pour fonctionner",
        "Lancez `sudo apt-get install libgtk-3-0` pour installer GTK 3 (*GTK 2 est obsolète*)"
      ]
    }
  ]}
/>

<BrowserWindow url="https://pentaho.com/pentaho-developer-edition/">
  <img
    alt="Télécharger Pentaho"
    src={require("./images/download.webp").default}
  />
</BrowserWindow>

### Ajouter Pentaho au PATH {#adding-pentaho-to-the-path}

Pour finaliser l'installation, vous devez aussi mettre à jour la variable Linux `PATH`.

Lancez `code ~/.bashrc` (ou `code ~/.zshrc` si vous utilisez <Link to="/blog/zsh-install">Oh-my-ZSH</Link>) ; cherchez dans le fichier si vous avez déjà une ligne avec `PATH=`. Si oui, mettez-la à jour et ajoutez-y `$HOME/tools/pentaho/data-integration`. Sinon, allez à la fin du fichier et ajoutez cette ligne :

<Snippet filename="~/.bashrc" source="./files/.bashrc" />

Sauvegardez et quittez.

Pour appliquer aussi le changement à votre console actuelle, lancez `export PATH="$HOME/tools/pentaho/data-integration:$PATH"` (ou ouvrez une nouvelle console).

À partir de maintenant, vous pourrez lancer Pentaho depuis n'importe quel dossier.

## Préparons notre environnement {#lets-prepare-our-environment}

Nous allons créer un nouveau projet ; créez un dossier temporaire et entrez-y :

<Terminal>
$ mkdir -p /tmp/pentaho && cd $_
</Terminal>

Nous allons créer un fichier Excel bidon puis le charger dans une base PostgreSQL. La table cible s'appellera `people` et nous la créerons manuellement (pas automatiquement).

### D'abord, il nous faut un fichier Excel à charger {#first-we-need-an-excel-file-to-load}

Pour ce tutoriel, nous allons charger un fichier Excel dans PostgreSQL, il nous faut donc un fichier Excel.

Copiez le tableau ci-dessous dans Excel et sauvegardez le nouveau fichier sous le nom `people.xlsx` (sinon, cliquez [ici](./files/people.xlsx) pour le télécharger). Sauvegardez le fichier dans votre dossier Linux `/tmp/pentaho`.

<!-- cspell:disable -->
| ID | Firstname | Lastname | City |
| ---- | ----------- | ---------- | ------ |
| 1 | Jean | Dupont | Brussels |
| 2 | Marie | Leclerc | Antwerp |
| 3 | Pierre | Dubois | Ghent |
| 4 | Sophie | Martin | Charleroi |
| 5 | Thomas | Bernard | Liège |
| 6 | Chloé | Petit | Bruges |
| 7 | Antoine | Durand | Namur |
| 8 | Léa | Leroy | Leuven |
| 9 | Nicolas | Moreau | Mons |
| 10 | Manon | Simon | Mechelen |
<!-- cspell:enable -->

### Ensuite, il nous faut une base PostgreSQL {#then-we-need-a-postgresql-database}

<Vars
  port_pg="5432"
  port_pgadmin="8080"
  labels={{ port_pg: "PostgreSQL port", port_pgadmin: "pgAdmin port" }}
/>

Pour cela, nous allons utiliser Docker. Créez un fichier appelé `compose.yaml` dans votre dossier `/tmp/pentaho` avec ce contenu :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

### Et, pour nous faciliter la vie, créons un makefile {#and-for-our-easiness-lets-create-a-makefile}

<Snippet filename="makefile" source="./files/makefile" />

### Lançons notre container Docker {#lets-run-our-docker-container}

Lancez `docker compose up --detach` pour démarrer le container PostgreSQL et celui de pgAdmin.

Comme vous l'avez vu, nous avons déjà mis en place une interface pgAdmin ; nous pouvons l'ouvrir en allant sur `http://localhost:`<Var name="port_pgadmin">8080</Var>. *pgAdmin n'est pas votre seule option ici ; voir <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Using Adminer, pgadmin or phpmyadmin to access your Docker database container</Link>.*

<BrowserWindow url="http://localhost:%%port_pgadmin=8080%%">
  <img
    alt="Écran de connexion de pgAdmin"
    src={require("./images/pgadmin_login.webp").default}
  />
</BrowserWindow>

Utilisez `admin@yopmail.com` et `admin` comme identifiants.

Une fois dans l'interface de pgAdmin, nous devons créer un nouveau serveur en cliquant sur le bouton `Add new server`.

Donnez un nom au serveur puis, dans l'onglet `Connection`, remplissez comme ci-dessous :

<BrowserWindow url="http://localhost:%%port_pgadmin=8080%%">
  <img
    alt="Création d'un serveur dans pgAdmin"
    src={require("./images/pgadmin_new_server.webp").default}
  />
</BrowserWindow>

Comme vous pouvez le voir sur l'image ci-dessous, lors de la création de notre container PostgreSQL, une nouvelle base appelée `people` a été créée. Cette base a un schéma `public` et, pour l'instant, aucune table.

<BrowserWindow url="http://localhost:%%port_pgadmin=8080%%">
  <img
    alt="La base existe mais sans aucune table pour l'instant"
    src={require("./images/pgadmin_database.webp").default}
  />
</BrowserWindow>

<AlertBox variant="info">
C'est possible grâce à notre fichier `compose.yaml`. Si vous êtes curieux, ouvrez à nouveau le fichier `compose.yaml` et regardez la section `environment` du service `postgres`. Nous avons demandé à PostgreSQL de créer une base appelée `people`, dont le propriétaire est l'utilisateur `admin`.

</AlertBox>

## Les pièces du puzzle sont en place, créons notre flux {#the-pieces-of-the-jigsaw-are-in-place-create-our-flow}

Maintenant, lancez `spoon.sh` pour démarrer l'interface graphique de Pentaho. Cette interface s'appelle **Spoon**.

![Ouverture de Pentaho](./images/empty_project.webp)

### Nous devons créer un nouveau fichier de transformation {#we-need-to-create-a-new-transformation-file}

Cliquez sur le menu `File`, puis `New` et sélectionnez `Transformation`.

#### Charger depuis Excel {#load-from-excel}

Dans notre scénario, nous voulons charger un fichier Excel : cliquez donc sur la catégorie `Input` et descendez jusqu'à voir `Microsoft Excel input`, puis déposez-le sur le canevas principal.

![Charger depuis Excel](./images/input_excel.webp)

Double-cliquez sur l'étape que vous venez d'ajouter pour la configurer :

- Donnez-lui un nom clair (comme *Load people from Excel*),
- Cliquez sur le bouton Browse... pour retrouver votre fichier (par exemple `/tmp/pentaho/people.xlsx`) puis cliquez sur le bouton `Add` pour ajouter ce fichier à la liste des *Selected files*
  ![Ajouter des fichiers](./images/input_excel_add_file.webp)
- Dans l'onglet `Sheets`, cliquez sur le bouton `Get sheetname(s)...`, récupérez le nom de la feuille et ajoutez-le.
  ![Ajouter la feuille](./images/input_excel_add_sheet.webp)
- Dans l'onglet `Content`, il n'y a rien à changer (puisque notre fichier Excel a une ligne d'en-tête puis les données sans ligne vide entre elles)
- Dans l'onglet `Fields`, cliquez sur `Get fields from header row...` pour charger les noms puis ajustez quelques propriétés comme illustré ci-dessous :
  ![Chargement des champs](./images/input_excel_add_fields.webp)
- Cliquez sur le bouton `Preview rows` si vous voulez vérifier que tout est OK
  ![Prévisualisation des lignes](./images/input_excel_preview.webp)

C'est fait ; cliquez sur le bouton `OK`.

#### Définir notre connexion à la base de données {#define-our-database-connection}

Maintenant, cliquez sur l'onglet `View` comme illustré ci-dessous et double-cliquez sur l'élément `Database connections`.

![Connexions aux bases de données](./images/database_connections.webp)

Souvenez-vous de notre fichier `compose.yaml` et remplissez l'écran comme ceci :

<ConnectionInfo
  items={[
    { label: "Host Name", value: "localhost" },
    { label: "Database Name", value: "people" },
    { label: "Port Number", value: "5432" },
    { label: "Username", value: "admin" },
    { label: "Password", value: "admin" },
  ]}
/>

![Définir notre connexion People](./images/database_people.webp)

Cliquez sur le bouton `Test` pour vous assurer que la connexion est correctement configurée.

![Test de la connexion à la base](./images/database_test.webp)

Cliquez sur le bouton `Ok` pour sauvegarder votre connexion.

#### Préparer notre sortie vers une table {#prepare-our-table-output}

Cliquez sur l'onglet `Design` puis sur la catégorie `Output` et trouvez `Table output`. Faites un glisser-déposer vers le canevas.

![Préparer la sortie vers la table](./images/table_output.webp)

Cliquez sur la boîte `Load people from Excel` et attendez que les petites icônes ci-dessous s'affichent :

![Affichage de la liste d'icônes depuis Excel](./images/input_excel_icons.webp)

Cliquez sur le bouton avec le *connecteur de sortie* (celui avec la flèche vers la droite) et déposez la ligne sur la boîte **Table output** :

![Connecteur de sortie](./images/output_connector.webp)

Cela indique à Pentaho que, une fois l'étape **Load people from Excel** terminée avec succès, il faut continuer avec **Table output**.

Maintenant, double-cliquez sur **Table output** et faisons un peu de configuration :

- Donnez-lui un nom d'étape clair (comme *Load to PostgreSQL*),
- Le nom de la Connection à utiliser doit être `People` (celle que nous venons de créer),
- Le Target schema doit être `public` (celui de notre base People),
- La Target table est `people`.

Maintenant, cliquez sur le bouton `SQL` : Pentaho affiche une popup (pensez à redimensionner la fenêtre) avec une instruction `CREATE TABLE` :

![Création de la table](./images/create_table.webp)

Puisque notre table n'existait pas encore, cliquez sur le bouton `Execute` :

![La table a été créée](./images/create_table_done.webp)

Vérifions grâce à pgAdmin :

<BrowserWindow url="http://localhost:%%port_pgadmin=8080%%">
  <img
    alt="La table a été créée"
    src={require("./images/pgadmin_table_created.webp").default}
  />
</BrowserWindow>

Parfait. Nous pouvons maintenant fermer les deux fenêtres popup et revenir à la configuration de notre table. Cliquez sur le bouton `OK` puisque cette étape est terminée.

#### Il est temps de sauvegarder notre transformation {#time-to-save-our-transformation}

Cliquez sur le menu `File` puis `Save`.

Sauvegardez le fichier dans `/tmp/pentaho` sous le nom `load_people_from_excel.ktr`.

#### Lançons-la {#run-it}

Repérez l'icône `Run` (la même que celle déjà montrée en haut de cet article). Cliquez dessus. Vous obtiendrez une nouvelle fenêtre avec un bouton `Run` en bas à droite ; cliquez dessus.

Si tout était correctement configuré et lancé, vous obtiendrez le même écran « Successfully executed » montré plus haut.

De retour dans pgAdmin, affichez la liste des enregistrements de la table `people` pour vérifier que le fichier Excel a bien été chargé — le même résultat que celui déjà montré en haut de cet article.

### Télécharger le fichier de transformation {#download-the-transformation-file}

Si vous avez des soucis pour créer votre fichier de transformation, voici celui que j'ai utilisé pour cet article : [load_people_from_excel.ktr](./files/load_people_from_excel.ktr).

Si vous voulez le fichier Excel utilisé dans cet article, voici à nouveau le [lien](./files/people.xlsx).

## Conclusion {#conclusion}

Au-delà de Docker, PostgreSQL et pgAdmin, nous avons vu comment charger un fichier Excel sous Linux et stocker les enregistrements dans une table PostgreSQL.

Les possibilités offertes par Pentaho sont tout simplement monstrueuses.
