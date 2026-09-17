---
slug: docker-oracle-database-server
title: Faire tourner Oracle Database Server dans un container Docker
date: 2025-04-04
description: Apprenez à faire tourner Oracle Database Server dans un container Docker. Ce guide pas à pas couvre la mise en place de l'image, l'acceptation de la licence, la génération du token et l'accès à la base de données.
authors: [christophe]
image: /img/v2/oracle.webp
series: Running Oracle Database Server as a Docker container
mainTag: oracle
tags:
  - docker
  - oracle
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnjmthgj22v
---
![Faire tourner Oracle Database Server dans un container Docker](/img/v2/oracle.webp)

<TLDR>
Ce guide complet vous accompagne pas à pas pour faire tourner un serveur Oracle Enterprise Database dans un container Docker. Il couvre tout le processus : création d'un compte Oracle, authentification pour récupérer l'image officielle, déploiement du container avec du stockage persistant et des scripts de démarrage personnalisés. Vous découvrirez les concepts clés de l'architecture multi-tenant d'Oracle (CDB vs PDB) et comment vous connecter à votre base et l'administrer avec des outils comme `sqlplus`, Oracle SQL Developer et l'interface web Oracle Enterprise Manager.
</TLDR>

<!-- cspell:ignore ORCLCDB,ORCLPDB,initdb,sqlplus,oradata,PDBADMIN,USERENV,oracletools,sysdba -->

Au boulot, j'ai dû créer une base de données Oracle Enterprise en local pour pouvoir écrire des scripts dans différents langages et montrer <Link to="/blog/oracle-dotnet-nodejs-php-python">comment se connecter à Oracle avec, par exemple, .Net, NodeJS, Python ou PHP</Link>.

L'idée a donc tout de suite été de vérifier s'il existait une image officielle. Elle existe mais, zut, ce n'est pas aussi simple que pour PostgreSQL, MySQL ou <Link to="/blog/docker-mssql-server">MS SQL Server</Link>.

Dans cet article, qui est une mise au propre de mes notes, nous allons installer Oracle Enterprise en local dans un container, créer une base avec des données d'exemple et accéder à cette base de plusieurs façons.

C'est un guide pas à pas pour faciliter la vie de ceux qui doivent faire la même chose — moi, par exemple, dans quelques mois, quand j'aurai tout oublié.

<!-- truncate -->

Ça prend un moment (Oracle est lent à s'initialiser), mais voici où nous allons : un container Oracle qui tourne, prêt à être interrogé.

![La base de données est prête à l'emploi](./images/container_db_is_ready.webp)

![Oracle récupère la liste des employés](./images/oracle_getting_employees.webp)

Construisons tout ça, en commençant par l'image elle-même.

## Télécharger une image Docker pour OracleDB {#download-a-docker-image-for-oracledb}

Oui, il existe bien une image Docker appelée `container-registry.oracle.com/database/enterprise:latest` mais, avant de pouvoir la télécharger, il faudra faire quelques choses :

<StepsCard
  variant="steps"
  steps={[
    "Créer un compte gratuit sur oracle.com",
    "Générer un token",
    "Accepter les termes de la licence",
    "Configurer votre environnement Docker local pour utiliser ce token"
  ]}
/>

Si vous sautez une étape et essayez de télécharger l'image directement, vous obtiendrez cette erreur :

<Terminal typewriter>
$ docker pull container-registry.oracle.com/database/enterprise:latest
Error response from daemon: Head "https://container-registry.oracle.com/v2/database/enterprise/manifests/21.3.0.0": unauthorized: Auth failed.
</Terminal>

### Création d'un compte gratuit sur oracle.com {#creation-of-a-free-account-on-oraclecom}

Rendez-vous sur [https://container-registry.oracle.com/ords/ocr/ba/database/enterprise](https://container-registry.oracle.com/ords/ocr/ba/database/enterprise) et créez un utilisateur en cliquant sur le bouton / lien `Sign In` en haut à droite.

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database/enterprise">
  <img
    alt="Assurez-vous d'être connecté"
    src={require("./images/oracle_signin.webp").default}
  />
</BrowserWindow>

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database/enterprise">
  <img
    alt="Page de connexion Oracle"
    src={require("./images/oracle_signin_page.webp").default}
  />
</BrowserWindow>

### Générer un token {#generate-a-token}

Une fois votre utilisateur validé (après réception d'un email), retournez sur le site [https://container-registry.oracle.com/ords/ocr/ba/database/enterprise](https://container-registry.oracle.com/ords/ocr/ba/database/enterprise), connectez-vous, cliquez sur votre profil puis choisissez `Auth Token`.

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database/enterprise">
  <img
    alt="Création de votre Auth Token"
    src={require("./images/auth_token.webp").default}
  />
</BrowserWindow>

Cliquez sur le bouton `Generate Secret Key` et copiez votre **SSO Username** et votre **Secret Key** quelque part (dans votre gestionnaire de mots de passe par exemple).

### Accepter les termes de la licence {#accept-license-terms}

Rendez-vous sur [https://container-registry.oracle.com/ords/ocr/ba/database](https://container-registry.oracle.com/ords/ocr/ba/database) et cherchez `enterprise` dans la colonne `Repository`.

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database">
  <img
    alt="Cliquez sur enterprise"
    src={require("./images/oracle_enterprise.webp").default}
  />
</BrowserWindow>

Une fois connecté, cliquez sur le bouton `Continue` qui apparaît à droite.

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database">
  <img
    alt="Acceptation des termes de la licence"
    src={require("./images/accepting_license.webp").default}
  />
</BrowserWindow>

Une fenêtre popup s'affiche et, en bas, vous devrez cliquer sur `Accept`.

Optionnel : en retournant sur [https://container-registry.oracle.com/ords/ocr/ba/database](https://container-registry.oracle.com/ords/ocr/ba/database), vous verrez qu'Oracle a bien enregistré le fait que vous avez accepté ses conditions.

<BrowserWindow url="https://container-registry.oracle.com/ords/ocr/ba/database">
  <img
    alt="Acceptation du contrat de licence"
    src={require("./images/accepted_license.webp").default}
  />
</BrowserWindow>

### Configurer votre environnement Docker local {#configure-your-local-docker-environment}

Dernière partie : apprendre à Docker que vous pouvez télécharger depuis le registre Oracle.

Allez en ligne de commande et tapez `docker login container-registry.oracle.com`.

Renseignez votre **SSO Username** et votre **Secret Key** (donnés par la page Auth Token sur oracle.com).

Docker affichera *Login Succeeded*.

<AlertBox variant="note" title="Optionnel, voici la commande de déconnexion">
Si besoin, exécutez `docker logout container-registry.oracle.com` pour supprimer l'authentification vers oracle.com sur votre machine.

</AlertBox>

<AlertBox variant="info" title="Optionnel, l'authentification est stockée dans le fichier config.json">
En exécutant `cat ~/.docker/config.json`, vous verrez dans `auths` la présence du registre Oracle

<Snippet filename="~/.docker/config.json" source="./files/config.json" />


</AlertBox>

### Enfin, vous pouvez récupérer l'image {#finally-you-can-pull-the-image}

Si toutes les étapes précédentes ont été correctement réalisées, vous devriez maintenant pouvoir lancer `docker pull container-registry.oracle.com/database/enterprise:latest` sans erreur et télécharger l'image Docker de 3,5 Go.

<AlertBox variant="note" title="L'image latest est énorme mais la slim est trop ancienne">
Il existe une image slim d'environ 1,5 Go (`docker pull container-registry.oracle.com/database/enterprise:12.2.0.1-slim`) mais elle est très ancienne (quelque part en 2018).

</AlertBox>

## Concepts importants à connaître avec Oracle v12 et suivants (passez cette section si vous voulez juste le lancer) {#important-concepts-to-consider-when-working-with-oracle-v12-and-after-skip-this-if-you-just-want-to-run-it}

### Container database (CDB) versus Pluggable database (PDB) {#container-database-cdb-versus-pluggable-database-pdb}

Dans l'architecture multi-tenant d'Oracle (introduite depuis Oracle 12c), les concepts de *Container Database* (`CDB`) et de **Pluggable Database** (`PDB`) sont fondamentaux.

Par rapport aux autres moteurs de base de données, une `PDB` est une base de données tandis que la `CDB` est l'*infrastructure sous-jacente qui gère une ou plusieurs PDB, en partageant des processus d'arrière-plan et de la mémoire*.

<AlertBox variant="highlyImportant" title="Dans cet article, nous ne travaillons jamais au niveau CDB">

Dans cet article, nous voulons uniquement créer des tables dans une base de données (PDB) — **nous devons toujours nous assurer d'être connectés à une PDB au moment de créer des tables.** Nous voulons que nos tables soient dans une seule base ; pas « partagées » à la racine du CDB.

Donc, chaque fois que nous devrons travailler sur des tables, assurez-vous de vous connecter à la `PDB`.
</AlertBox>

## Créer un container de base de données Oracle {#create-an-oracle-database-container}

Une fois l'image récupérée, nous pouvons créer notre container, c'est-à-dire notre service de base de données Oracle.

La liste des options de ligne de commande supportées est ici : [https://container-registry.oracle.com/ords/ocr/ba/database/enterprise#custom-configurations](https://container-registry.oracle.com/ords/ocr/ba/database/enterprise#custom-configurations)

Si on le souhaite, on peut lancer une commande `docker run` tout de suite mais, avant, faisons un peu de configuration.

Pourquoi ? Parce que la génération du container est terriblement lente et peut prendre jusqu'à dix minutes.

Pour être le plus efficace possible, nous allons d'abord créer un ensemble de fichiers sur notre disque pour que, pendant la création de la base, Docker crée aussi automatiquement quelques tables et y insère des enregistrements.

### Création de quelques fichiers de configuration {#creation-of-some-configuration-files}

Créez un nouveau dossier sur votre disque, allez-y, puis créez le dossier où nous mettrons nos fichiers de démarrage :

<Terminal>
$ mkdir -p /tmp/oracle && cd $_
$ mkdir -p scripts/startup
</Terminal>

#### Créons une base d'exemple Human Resources {#lets-create-a-human-resources-sample-database}

Oracle fournit des bases d'exemple sur la page [Oracle Database Sample Schemas](https://github.com/oracle-samples/db-sample-schemas/releases). Vous pouvez y télécharger l'archive `db-sample-schemas-23.3.zip`, l'ouvrir et aller dans le dossier `human_resources`. Vous y trouverez un fichier appelé `hr_create.sql` qui est un exemple de base RH. Il y a un second fichier appelé `hr_populate.sql` pour remplir les tables avec des données.

<AlertBox variant="info">
Pour simplifier, vous pouvez récupérer ces fichiers en cliquant sur ces deux liens : [hr_create.sql](./files/hr_create.sql) et [hr_populate.sql](./files/hr_populate.sql).

</AlertBox>

Téléchargez et copiez ces deux fichiers dans le dossier `scripts/startup/sql/` que vous avez créé précédemment.

La deuxième chose à faire est de créer le fichier `scripts/startup/populate_db.sh` avec le contenu ci-dessous pour automatiser la création de nos tables et insérer des enregistrements dans notre base. Comme dit dans un chapitre précédent, il est important de bien se connecter à la `PDB` pour que les tables soient créées dans une base de données, pas dans le container.

<Snippet filename="scripts/startup/populate_db.sh" source="./files/populate_db.sh" />

Rendez maintenant le script exécutable : `chmod +x scripts/startup/populate_db.sh`.

<AlertBox variant="info" title="Les tables appartiendront à l'utilisateur system">
Faites attention à l'instruction `CONNECT system/admin@` <Var name="pdb">orclpdb1</Var> ` : nous nous connectons d'abord en tant qu'utilisateur system avant de créer les tables. Les tables seront donc accessibles par cet utilisateur, à savoir l'utilisateur `system`.

</AlertBox>

Si vous avez besoin du modèle de données, le voici :

![Les relations de l'exemple Oracle Human Resources](./images/hr_schema.webp)

### Créer le volume OracleDBData {#create-the-oracledbdata-volume}

Comme lancer le container est un processus très lent, nous allons créer un volume Docker pour garder la base persistante sur le disque.

Le volume conservera la base sur notre disque, dans un volume géré par Docker. Ainsi, nous pouvons arrêter le container Oracle, le redémarrer et nous ne perdrons pas notre base. *La base sera persistante dans un volume auto-géré par Docker.*

Lancez cette commande dans la console pour créer un volume géré par Docker :

<Terminal>
$ docker volume create OracleDBData
</Terminal>

### Créer le réseau oracle {#create-the-oracle-network}

Et enfin, nous allons créer un réseau spécifique pour notre container Oracle :

<Terminal>
$ docker network create oracle
</Terminal>

### Prêt à créer le container {#ready-to-create-the-container}

<Vars
  name="oracle-db"
  port="1521"
  port_oem="5500"
  cdb="ORCLCDB"
  pdb="ORCLPDB1"
  labels={{ name: "Nom du container", port: "Port du listener", port_oem: "Port OEM Express", cdb: "Nom du CDB", pdb: "Nom de la PDB" }}
/>

Nous sommes prêts à créer notre container en lançant cette commande :

<Terminal typewriter source="./files/terminal-1.txt" />

<AlertBox variant="note">
C'est terriblement lent... Oracle aura besoin d'environ 10 minutes avant que le container soit utilisable.

</AlertBox>

La commande `docker run` était terriblement complexe ; voici le détail :

- `--name oracle-db` : notre container s'appellera <Var name="name">oracle-db</Var> (nous pourrons donc y accéder plus tard avec `docker exec -it oracle-db [...]`),
- `--network oracle` : nous créerons notre container sur le réseau `oracle`,
- `-p 1521:1521` : Oracle utilise le port <Var name="port">1521</Var> (Oracle Listener) et nous exposons ce port sur notre machine,
- `-p 5500:5500` : optionnel. Oracle utilise un second port <Var name="port_oem">5500</Var> (OEM Express) et nous exposons également ce port pour pouvoir accéder à `http://localhost:`<Var name="port_oem">5500</Var>,
- `-e ORACLE_SID=ORCLCDB` : le SID de la base Oracle (SID signifie *System identifier*) est un réglage très important. Nous gardons la valeur par défaut, à savoir <Var name="cdb">ORCLCDB</Var> (rappel : `CDB` signifie `Container database`)
- `-e ORACLE_PDB=ORCLPDB1` : le nom de la PDB Oracle. Ici aussi, nous gardons la valeur par défaut, à savoir <Var name="pdb">ORCLPDB1</Var>. (rappel : `PDB` signifie `pluggable database`).
- `-e ORACLE_PWD=admin` : le mot de passe des utilisateurs SYS, SYSTEM et PDBADMIN. Il n'y a pas de valeur par défaut puisque le mot de passe est généré automatiquement et doit être récupéré dans les logs (`docker log`). Ce paramètre modifie le mot de passe des utilisateurs SYS, SYSTEM et PDBADMIN.
- `-v OracleDBData:/opt/oracle/oradata` : nous rendons la base persistante sur notre disque mais peu importe *où*, nous laissons Docker gérer ça. Nous avons créé précédemment un volume Docker nommé `OracleDBData`.
- `-v ./scripts/startup/:/docker-entrypoint-initdb.d/startup` : cela nous permet de créer des fichiers en local dans le dossier `./scripts/startup` (comme nos fichiers SQL) et de les exécuter dans le container une fois la base Oracle principale prête. Et, en effet, nous avons créé précédemment les fichiers `populate_db.sh`, `sql/hr_create.sql` et `sql/hr_populate.sql` dans notre dossier `scripts/startup`.

## Constantes importantes à retenir {#important-constants-to-remember}

À partir de maintenant, notre serveur de base de données Oracle tourne dans un container Docker. Nous allons beaucoup utiliser certaines constantes.

Voici les constantes à retenir :

- <Var name="port">1521</Var> est le numéro de port à utiliser pour se connecter au service Oracle DB,
- <Var name="name">oracle-db</Var> est le nom de notre container,
- <Var name="cdb">ORCLCDB</Var> est le nom de notre CDB,
- <Var name="pdb">ORCLPDB1</Var> est le nom de notre pluggable database,
- `admin` est le mot de passe à utiliser et
- `system` est l'utilisateur employé lors de la création de la base

Si vous reprenez le script `populate_db.sh`, nous avions :

<Snippet filename="scripts/startup/populate_db.sh" source="./files/populate_db.part2.sh" />

Et maintenant, vous comprenez pourquoi les chaînes de connexion étaient :

- `sys/admin@localhost:1521/ORCLCDB` : `sys` est un utilisateur système d'Oracle, `admin` le mot de passe associé, `1521` notre port exposé et `ORCLCDB` le nom de notre container database,
- `ALTER SESSION SET CONTAINER = ORCLPDB1;` : nous devons créer nos tables et nos enregistrements dans notre base (`ORCLPDB1`) et
- `CONNECT system/admin@orclpdb1` : `system` est aussi un utilisateur système d'Oracle, il sera le propriétaire de nos tables, `admin` est le même mot de passe associé et `orclpdb1` est le nom de ce qu'Oracle appelle le `service`.

## Lancer une console interactive dans le container de la base {#running-an-interactive-console-in-the-db-container}

Si vous devez entrer dans le container, lancez simplement `docker exec -it ` <Var name="name">oracle-db</Var> ` bash`.

À titre d'exemple fictif, nous pouvons aller dans le dossier `/docker-entrypoint-initdb.d/startup` à l'intérieur du container et relancer notre script `./populate_db.sh` (relancer, car il a déjà été exécuté par Oracle pendant la création du container) :

![Exécution manuelle du script](./images/run_script_manually.webp)

Et bien sûr, nous obtiendrons plein d'erreurs illustrant le fait que les tables et les enregistrements ont déjà été créés/insérés.

Tapez `exit` pour quitter la console et revenir au prompt de votre machine hôte.

## Travailler avec le container Oracle DB {#working-with-the-oracle-db-container}

La commande `docker run` prendra environ 10 minutes.

Si vous avez Docker Desktop, basculez sur son interface, cliquez sur le lien `Containers` puis sur votre container <Var name="name">oracle-db</Var> pour voir le log. Attendez de voir :

Vous obtiendrez le même écran « prêt à l'emploi » déjà montré en début d'article.

Vous pouvez aussi utiliser la ligne de commande : `docker logs ` <Var name="name">oracle-db</Var> ` --follow` et attendre le message `DATABASE IS READY TO USE!`. Appuyez sur <kbd>CTRL</kbd>+<kbd>C</kbd> pour quitter le log.

Maintenant, nous pouvons entrer dans le container <Var name="name">oracle-db</Var> et lancer SQL*Plus avec `docker exec -it ` <Var name="name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba` (rappel : nous nous connectons à la `PDB`, pas au `CDB`).

<AlertBox variant="info" title="Suis-je connecté au container database ou à une pluggable database ?">
Lancez simplement, dans la console SQL*Plus, la commande `SHOW CON_NAME;`.

![Connecté à la PDB](./images/connected_on_pdb.webp)

Si vous êtes connecté au CDB, vous obtiendrez la réponse suivante et c'est faux. Tapez `exit` et connectez-vous à la PDB.

![Connecté au CDB](./images/connected_on_cdb.webp)

</AlertBox>

### Un mot sur le schéma {#a-word-about-schema}

Précédemment, nous avons créé nos tables avec le script `scripts/startup/populate_db.sh`. Voici le script utilisé :

<Snippet filename="scripts/startup/populate_db.sh" source="./files/populate_db.part3.sh" />

L'instruction `CONNECT` utilise l'utilisateur Oracle `system`. Les tables seront donc créées dans le schéma `system`.

Si nous lançons `docker exec -it ` <Var name="name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba` et que nous essayons d'afficher les enregistrements de la table `COUNTRIES`, ça ne marchera pas à moins de préciser le schéma :

![Le schéma system](./images/system_schema.webp)

C'est parce que l'utilisateur `sys` utilise le schéma `sys` par défaut (on peut le voir en lançant `SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM dual;`).

Voilà pourquoi, puisque nos tables sont dans le schéma `system`, nous y accédons avec `SELECT * FROM SYSTEM.COUNTRIES;`.

Mais nous pouvons aussi changer d'utilisateur, ne plus utiliser `sys` mais `system`, en lançant `CONNECT system/admin@` <Var name="pdb">orclpdb1</Var>.

![Connexion avec le compte system](./images/connect_as_system.webp)

### Vérifier nos données fictives {#check-our-fake-data}

Ceci compris, voici comment voir nos données :

- Lancez `docker exec -it ` <Var name="name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba`,
- Puis, dans SQL*Plus, lancez `CONNECT system/admin@` <Var name="pdb">orclpdb1</Var>,
- Pour des raisons esthétiques, lancez `SET WRAP OFF` et `SET PAGESIZE 1000` et
- nous pouvons accéder à nos tables comme ceci : `SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL FROM EMPLOYEES;`

![Les données fictives sont bien chargées](./images/fake_data.webp)

<AlertBox variant="info">
`SET WRAP OFF` nous permet d'utiliser toute la largeur de l'écran au lieu d'une largeur ridicule de 80 caractères et `SET PAGESIZE 1000` évite une liste paginée tous les 10 enregistrements.

</AlertBox>

### Accéder à Oracle Enterprise Manager Database Express {#accessing-the-oracle-enterprise-manager-database-express}

Plus tôt, lors de notre commande `docker run`, nous avons mappé le port <Var name="port_oem">5500</Var> du container sur notre host. Ce port est celui utilisé par Oracle Enterprise Manager Database Express (alias `OEM Express`).

C'est une application web accessible en surfant sur `https://localhost:` <Var name="port_oem">5500</Var>`/em/`.

Connectez-vous avec `system` / `admin` et <Var name="pdb">orclpdb1</Var> comme nom de container.

<BrowserWindow url="https://localhost:%%port_oem=5500%%/em/">
  <img
    alt="Oracle Enterprise Manager Database Express"
    src={require("./images/oem_express.webp").default}
  />
</BrowserWindow>

### Accéder à notre base avec les outils Oracle {#accessing-our-database-using-oracle-tools}

#### Oracle SQL Developer {#oracle-sql-developer}

Vous pouvez télécharger [Oracle SQL Developer](https://www.oracle.com/be/database/sqldeveloper). C'est un fichier ZIP et, une fois dézippé, vous pouvez lancer l'interface sans devoir installer le logiciel : c'est prêt à l'emploi.

Une fois installé, lancez-le et créez une nouvelle connexion vers :

<ConnectionInfo
  items={[
    { label: "Utilisateur", value: "SYS" },
    { label: "Rôle", value: "SYSDBA" },
    { label: "Mot de passe", value: "admin" },
    { label: "Nom d'hôte", value: "127.0.0.1" },
    { label: "Port", value: "1521" },
    { label: "Nom du service", value: "orclpdb1" },
  ]}
/>

![Création d'une connexion dans Oracle SQL Developer en tant que sys](./images/oracle_sql_dev_as_sys.webp)

<AlertBox variant="note" title="Rappel : vous devez vous connecter à notre PDB, pas au CDB">
Les tables se trouvent dans la *pluggable database* (`PDB`), pas dans le *container database* (`CDB`)

</AlertBox>

![Récupération des données avec Oracle SQL Developer](./images/oracle_sql_get_data.webp)

Commencez à taper `SELECT * FROM system.` et appuyez sur <kbd>CTRL</kbd>+<kbd>SPACE</kbd> pour obtenir la liste des objets de ce schéma. En descendant un peu, vous trouverez employees.

![Oracle récupère les employés](./images/oracle_get_employees.webp)

Validez ou tapez simplement le SQL complet `SELECT * FROM system.employees`. Dans l'exemple ci-dessous, je demande la liste des régions et la liste des employés. Je lance la query en appuyant simplement sur <kbd>F5</kbd> — le même résultat que celui déjà montré en début d'article.

##### Se connecter à Oracle SQL Developer avec le bon utilisateur {#connect-to-oracle-sql-developer-using-the-correct-user}

Dans le chapitre précédent, nous avons créé une connexion avec `sys` comme nom d'utilisateur et, pour cette raison, si nous cliquons sur le menu `Tables (Filtered)` dans l'arborescence de gauche, nous obtiendrons un paquet de tables mais pas celles de l'utilisateur `system`, comme notre table employees.

![Création d'une connexion dans Oracle SQL Developer en tant que system](./images/oracle_sql_dev_as_system.webp)

Maintenant, en dépliant la liste des tables, nous voyons les nôtres :

![Nos tables Human Resources](./images/oracle_sql_dev_tables.webp)

#### Accéder à notre container Oracle DB avec Oracle SQLPlus {#access-our-oracle-db-container-using-oracle-sqlplus}

Une autre façon serait d'utiliser l'image Docker officielle sql*plus comme ceci :

<Terminal typewriter>
$ docker run --rm -it --network oracle oracletools/sqlplus:v19.18_lin SYS/admin@%%name=oracle-db%%:%%port=1521%%/%%pdb=orclpdb1%% as sysdba
</Terminal>

Une fois connectés, nous pouvons par exemple obtenir la liste des pays comme ceci :

![Oracle sqlplus](./images/oracle_sqlplus_countries.webp)

<AlertBox variant="note" title="Interne versus externe">
Pour cet article, il n'était pas vraiment nécessaire d'utiliser cette image. Jusqu'ici, nous avons utilisé SQL*Plus plus d'une fois, par exemple quand nous avons lancé `docker exec -it ` <Var name="name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba` pour nous connecter à la base.

La différence : `docker exec -it ` <Var name="name">oracle-db</Var> ` [...]` entre dans le container de notre base et lance sqlplus *en interne* (depuis le container où la base est stockée) tandis que `docker run [...] oracle oracletools/sqlplus:v19.18_lin [...]` lance sqlplus *à l'extérieur*, dans un container séparé.

</AlertBox>

## Pour aller plus loin {#going-further}

Maintenant que le container <Var name="name">oracle-db</Var> tourne, deux articles de suite le réutilisent directement : <Link to="/blog/docker-oracle-ords">Transform an Oracle DB as OpenData using Oracle REST Data Services</Link> et <Link to="/blog/oracle-dotnet-nodejs-php-python">Accessing an Oracle database using .Net, NodeJS, PHP and Python</Link>.
