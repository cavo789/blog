---
slug: docker-oracle-ords
title: Transformer une base Oracle en OpenData avec Oracle REST Data Services
date: 2025-04-11
description: Mettez en place Oracle REST Data Services (ORDS) dans Docker pour transformer votre base Oracle en OpenData avec une API REST puissante. Filtrage et pagination inclus.
authors: [christophe]
image: /img/v2/oracle.webp
series: Running Oracle Database Server as a Docker container
mainTag: oracle
tags:
  - api
  - docker
  - oracle
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnjmthgj22v
---
![Transformer une base Oracle en OpenData avec Oracle REST Data Services](/img/v2/oracle.webp)

<TLDR>
Ce tutoriel montre comment transformer votre base de données Oracle en une API RESTful puissante grâce à Oracle REST Data Services (ORDS) dans Docker. En partant d'un container Oracle DB déjà mis en place précédemment, ce guide vous accompagne dans le déploiement du container ORDS, sa liaison avec votre base de données et la configuration des schémas pour l'accès REST. Vous apprendrez à activer REST sur des tables ou des vues précises avec Oracle SQL Developer, puis à accéder à vos données via des endpoints OpenAPI générés automatiquement. L'article explique aussi comment utiliser les paramètres d'URL pour des requêtes avancées : filtrage, tri et pagination.
</TLDR>

<!-- cspell:ignore ords,ORCLPDB,sqlplus,sysdba,hr,admin,TABLESPACE,AUTOREST,instring -->

Dans un article précédent (<Link to="/blog/docker-oracle-database-server">Running Oracle Database Server as a Docker container</Link>), nous avons créé un container Docker appelé `oracle-db` dans lequel tourne une base de données Human Resources.

Dans cet article, nous allons exposer partiellement la base de données sur le web avec OpenAPI. En résumé, nous allons permettre à des personnes autorisées d'accéder par exemple à `http://oursite/api/employees` pour obtenir la liste de tous les employés. *Ce schéma OpenAPI généré peut d'ailleurs être linté ; voyez <Link to="/blog/belgif-api-linter">Validate your OpenAPI schema against the Belgif REST standards</Link>.*

Exactement comme nous l'avons fait avec PostgREST (voir mon article <Link to="/blog/docker-postgrest">Don't query your PostgreSQL db anymore, prefer PostgREST</Link>) mais, cette fois, avec une base de données Oracle.

Et la magie viendra de **[Oracle REST Data Services](https://www.oracle.com/database/technologies/appdev/rest.html)**, aussi appelé **ords**.

<!-- truncate -->

Voici où nous allons : la même table Oracle, désormais accessible en simple JSON via HTTP.

![Récupérer la liste des employés en JSON avec curl](./images/getting_employees_as_json_curl.webp)

Dans l'article précédent (<Link to="/blog/docker-oracle-database-server">Running Oracle Database Server as a Docker container</Link>), nous avons créé un container Docker appelé `oracle-db` dans lequel tourne une base de données Human Resources.

Lisez cet article et suivez les étapes pour disposer, avant de continuer ici, d'un container Docker fonctionnel comme décrit ci-dessous.

## Quelques prérequis {#some-prerequisites}

<StepsCard
  title="Avant de commencer, assurez-vous que..."
  variant="prerequisites"
  steps={[
    "Vous avez un container Docker appelé `oracle-db` en cours d'exécution",
    "Le container tourne donc sur votre `localhost`",
    "Le numéro de port pour accéder à votre base est `1521`",
    "Les identifiants à utiliser sont `SYS` (ou `SYSTEM`) et `admin` comme mot de passe",
    "Le container contient une base appelée `ORCLPDB1` (aussi appelée nom de service) qui est l'exemple Human Resources d'Oracle (voyez l'article mentionné) et",
    "Notre base `oracle-db` tourne sur un réseau appelé `oracle`"
  ]}
/>

## Télécharger une image Docker pour Oracle REST Data Services {#download-a-docker-image-for-oracle-rest-data-services}

Contrairement à l'image Docker Oracle Database Server, aucun identifiant n'est nécessaire pour télécharger l'image officielle [Oracle ORDS](https://container-registry.oracle.com/ords/ocr/ba/database/ords-developer).

Lancez simplement `docker pull container-registry.oracle.com/database/ords-developer:latest` pour la récupérer. C'est une image de 2,2 Go.

<Terminal typewriter>
$ docker pull container-registry.oracle.com/database/ords-developer:latest
</Terminal>

## Créer un container Oracle ORDS {#create-an-oracle-ords-container}

Nous allons procéder étape par étape.

### Créer un volume pour la configuration ORDS {#create-a-volume-for-the-ords-configuration}

ORDS a besoin de deux dossiers : un pour ce qu'il appelle **ses secrets** et un pour **ses fichiers de configuration**. Utilisons un volume Docker auto-géré pour les fichiers de configuration ; lancez donc `docker volume create ords_config` dans votre console.

### Configurer la chaîne de connexion {#configure-the-connection-string}

Pour pouvoir démarrer ORDS, la doc officielle indique qu'il faut créer un fichier appelé `conn_string.txt` avec notre chaîne de connexion. Dans notre cas, voici le fichier à créer :

<Terminal typewriter>
$ mkdir -p ords_secrets
$ chmod 777 ords_secrets
$ echo 'CONN_STRING=SYS/admin@%%db_name=oracle-db%%:%%db_port=1521%%/%%pdb=ORCLPDB1%%' > ords_secrets/conn_string.txt
</Terminal>

<AlertBox variant="info">
Si vous avez un doute sur la valeur à utiliser comme `service_name` : démarrez une console sqlplus (`docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba`) et lancez `SELECT global_name FROM global_name;` dans SQL*Plus.

![Récupérer le nom de service](./images/getting_service_name.webp)

</AlertBox>

L'image Docker officielle ORDS est livrée avec APEX (l'abréviation d'*Oracle Application Express*).

D'après la documentation, *Oracle Application Express (APEX) est une plateforme de développement low-code qui vous permet de construire des applications d'entreprise évolutives et sécurisées, dotées de fonctionnalités de premier plan, déployables n'importe où. Voir [https://apex.oracle.com/](https://apex.oracle.com/) pour plus d'informations.*

Pour nos besoins, nous voulons juste ORDS ; APEX ne nous sert à rien. Pour cela, nous allons initialiser la variable d'environnement `IGNORE_APEX` à `TRUE`.

### Créer le container {#create-the-container}

<Vars
  name="oracle-ords"
  port="8181"
  db_name="oracle-db"
  db_port="1521"
  pdb="ORCLPDB1"
  labels={{ name: "ORDS container", port: "ORDS port", db_name: "Database container", db_port: "Database port", pdb: "PDB name" }}
/>

Pour créer notre container ORDS (sans APEX), lancez :

<Terminal typewriter source="./files/terminal-2.txt" />

<AlertBox variant="info" title="Le `docker run` expliqué">

- `-d`: ORDS tournera comme service daemon,
- `--rm`: une fois le service terminé, le container Docker sera supprimé,
- `--network`: nous devons faire tourner ORDS sur le même réseau que notre base de données, c'est-à-dire `oracle`
- <Code>-p <Var name="port">8181</Var>:8181</Code>: nous devons mapper le port interne `8181` utilisé par ORDS sur notre host et, par simplicité, nous exposerons aussi le port <Var name="port">8181</Var>,
- `-e IGNORE_APEX=TRUE`: comme dit, nous voulons ORDS, pas APEX ; on dit donc à Docker de ne pas installer APEX,
- `-v ./ords_secrets/:/opt/oracle/variables`: comme indiqué dans la documentation, nous devons fournir un fichier appelé `conn_string.txt` et mapper ce fichier dans `/opt/oracle/variables` à l'intérieur du container et, enfin,
- `-v ords_config:/etc/ords/config/`: nous utiliserons un volume Docker auto-géré pour conserver les fichiers de configuration d'ORDS.

</AlertBox>

Cette commande va ajouter le layer ORDS dans votre base de données (sur base de la chaîne de connexion, soit <Var name="pdb">ORCLPDB1</Var> chez nous).

![Installation d'ORDS](./images/ords_installation.webp)

<AlertBox variant="caution" title="Aux lancements suivants, il ne faut plus fournir la chaîne de connexion.">
Une fois ORDS installé comme ci-dessus, si vous devez relancer le container ORDS, il ne faut plus fournir le secret : il faut donc retirer le flag `-v ./ords_secrets/:/opt/oracle/variables`.

Si vous devez relancer le container, voici la ligne de commande :

<Terminal typewriter source="./files/terminal-1.txt" />


</AlertBox>

### Nous devons créer notre utilisateur dans la base de données {#we-need-to-create-our-user-in-our-database}

Avant de pouvoir utiliser ORDS et accéder à des objets via une requête HTTP, nous devons créer un nouvel utilisateur dans notre base et lui donner quelques droits.

Lancez `docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba` pour démarrer une console SQL*Plus et vous connecter à la base PDB.

Nous devons créer un utilisateur pour ORDS ; disons l'utilisateur `hr`. Lancez cette instruction : `CREATE USER hr IDENTIFIED BY admin;`

Puis accordez les permissions : `GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO hr;`

![Créer l'utilisateur ORDS](./images/ords_create_user.webp)

Une fois créé, nous devons quitter la console (démarrée avec l'utilisateur `sys`) et nous reconnecter avec notre utilisateur.

Tapez donc `exit` pour quitter la console sqlplus et lancez `docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus hr/admin@` <Var name="pdb">ORCLPDB1</Var>.

De retour dans la console sqlplus (connecté en tant qu'utilisateur `hr`), lancez : `EXECUTE ORDS.ENABLE_SCHEMA;`.

![Activation du schéma ORDS](./images/ords_enable_schema.webp)

*(lisez [ORDS 101: Enabling Oracle Schemas for HTTPS/REST](https://www.thatjeffsmith.com/archive/2023/09/ords-101-enabling-oracle-schemas-for-https-rest/) si vous voulez plus de détails)*

<AlertBox variant="caution">
Si vous obtenez une erreur à ce stade, cela signifie qu'ORDS n'a pas été installé dans votre base de données. Relisez le chapitre **Créer le container**.

</AlertBox>

#### Démarrer l'interface web d'ORDS {#start-ords-web-interface}

À ce stade, nous avons installé ORDS, configuré notre base pour l'utiliser et créé un utilisateur appelé `hr`. Nous pouvons nous rendre sur `http://localhost:` <Var name="port">8181</Var>`/ords` et nous connecter au dashboard ORDS :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/_/landing">
  <img
    alt="Page d'accueil d'ORDS"
    src={require("./images/ords_welcome_page.webp").default}
  />
</BrowserWindow>

<AlertBox variant="note">
APEX n'a pas été installé et est donc désactivé

</AlertBox>

Utilisez `hr` et `admin`, notre utilisateur personnalisé, sur la page de login :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/_/landing">
  <img
    alt="Page de login d'ORDS"
    src={require("./images/ords_login.webp").default}
  />
</BrowserWindow>

Dès à présent, nous pouvons demander à ORDS la liste des objets déjà accessibles ; rendez-vous simplement sur `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/` pour obtenir... une liste vide.

C'est normal puisque nous devons indiquer quel objet (une table, une vue, une procédure stockée) est accessible ou non. Mais oui, en accédant à `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/` et en obtenant une réponse JSON, nous pouvons confirmer qu'ORDS tourne correctement.

La page `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/` s'appelle le **Schema Metadata** ([documentation](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/21.4/aelig/developing-REST-applications.html#GUID-55736274-502E-4511-B232-829924334FA2)).

#### Activer REST sur les objets de la base {#rest-enable-database-objects}

Nous devons donc activer chaque objet un par un. Le plus simple est d'utiliser [Oracle SQL Developer](https://www.oracle.com/be/database/sqldeveloper). Si vous ne l'avez pas, téléchargez-le gratuitement.

![Oracle SQL Developer en cours d'exécution](./images/starting_sql_dev.webp)

Créez une nouvelle connexion avec ces paramètres :

<ConnectionInfo
  items={[
    { label: "Nom", value: "Human Resources - ORDS" },
    { label: "Nom d'utilisateur", value: "hr" },
    { label: "Rôle", value: "default" },
    { label: "Mot de passe", value: "admin" },
    { label: "Nom d'hôte", value: "127.0.0.1" },
    { label: "Port", value: "1521" },
    { label: "Nom de service", value: "orclpdb1" },
  ]}
/>

![SQL Developer - Connexion à la base de données](./images/sql_dev_login_page.webp)

Cliquez sur le bouton `Save` puis sur `Connect`.

Juste après le login, en cliquant sur la liste des tables ou des vues, il n'y a rien.

C'est normal : nous venons de créer notre utilisateur `hr` et le schéma `hr` associé, et il n'y a aucun objet dans ce schéma.

![Pour l'instant, il n'y a rien sur quoi activer REST](./images/sql_dev_hr_no_objects.webp)

##### Ajouter une vue employee dans notre schéma hr {#adding-an-employee-view-in-our-hr-schema}

Connectons-nous à notre base et affichons la liste des employés : lancez `docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba`, puis `SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL FROM SYSTEM.EMPLOYEES;`.

![Récupérer la liste des employés](./images/system_employees.webp)

Maintenant que nous sommes sûrs d'avoir accès à la table, créons une vue dans notre schéma `hr` pour afficher le contenu de la table :

- lancez `GRANT SELECT ON SYSTEM.EMPLOYEES TO hr;` et
- créez la vue en lançant `CREATE VIEW HR.EMPLOYEES AS SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID FROM SYSTEM.EMPLOYEES;`.

Si nous voulons vérifier notre vue :

- Tapez `exit` dans la console sqlplus puisque vous êtes connecté en tant que `sys`,
- Dans la console Linux, lancez `docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus hr/admin@` <Var name="pdb">ORCLPDB1</Var>  pour vous connecter en tant que `hr`, puis
- lancez `SELECT * FROM HR.EMPLOYEES;`.

Comme vous le voyez, vous obtenez la liste des employés.

À ce stade, nous avons donc ajouté une vue appelée `employees` dans notre schéma `hr` et elle fonctionne.

<AlertBox variant="caution" title="N'utilisez pas SELECT * FROM">
C'est une très mauvaise pratique d'utiliser `SELECT * FROM ...`, veillez toujours à sélectionner uniquement les champs nécessaires.

</AlertBox>

Retournez dans l'interface Oracle SQL Developer, faites un clic droit sur le nœud `Views` et choisissez `Refresh`.

Vous verrez la vue ajoutée :

![La vue employees](./images/sql_dev_employees_view.webp)

Clic droit sur la vue `EMPLOYEES` puis cliquez sur `Enable REST Service...`.

![Activation de REST](./images/sql_dev_enable_rest.webp)

Veillez à cocher la case `Enable object`, donnez un nom à votre objet et, pour ce petit tutoriel, décochez la case `Authorization required`.

![Activer REST sur la vue employees](./images/rest_enable_employees_1.webp)

Cliquez sur le bouton `Next` et prêtez attention à l'onglet `SQL` :

![Activer REST sur la vue employees - partie DDL](./images/rest_enable_employees_2.webp)

Vous obtiendrez le DDL à exécuter dans une console si vous souhaitez activer REST sur la table par le code, plutôt qu'avec l'interface graphique.

La dernière étape est de passer sur le site ORDS (`http://localhost:` <Var name="port">8181</Var>`/ords/hr/_sdw/?nav=rest-workshop`). Rafraîchissez la page et vous verrez maintenant que vous avez un objet dans la zone `AUTOREST` :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/_sdw/?nav=rest-workshop">
  <img
    alt="Il y a un objet dans la zone AUTOREST"
    src={require("./images/ords_autorest_1.webp").default}
  />
</BrowserWindow>

Cliquez sur cette zone et vous verrez l'objet (qui est une vue) sur lequel nous avons activé REST précédemment :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/_sdw/?nav=rest-workshop">
  <img
    alt="REST est activé sur Employees via AUTOREST"
    src={require("./images/ords_employees_is_enabled.webp").default}
  />
</BrowserWindow>

Regardez l'icône *Open in a new tab* sur l'image ci-dessus. Cliquez sur ce bouton et vous obtiendrez vos enregistrements en réponse JSON :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/employees/">
  <img
    alt="Récupérer la liste des employés en réponse REST JSON"
    src={require("./images/getting_employees_as_json_browser.webp").default}
  />
</BrowserWindow>

L'URL `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/` s'appelle l'**Object Data** ([documentation](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/21.4/aelig/developing-REST-applications.html#GUID-0B17836D-E5B5-4B45-A9DA-0ABF62426EDF))

Comme ce n'est rien de plus qu'une URL, vous pouvez l'utiliser avec n'importe quel outil, par exemple `curl`. La commande à lancer est <Code>curl http://localhost:<Var name="port">8181</Var>/ords/hr/employees/ | jq</Code> — la même sortie que celle montrée en début d'article.

###### Et qu'en est-il du catalogue OpenAPI {#and-what-about-the-openapi-catalog}

Retournez dans votre navigateur et accédez à nouveau à `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/`.

Cette fois, vous verrez que vous avez un élément appelé `EMPLOYEES`.

Si vous voulez obtenir la description de cette *ressource*, la page `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/employees/` peut être visitée pour obtenir par exemple la liste des champs exposés.

Cette page s'appelle l'**Object Metadata** ([documentation](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/21.4/aelig/developing-REST-applications.html#GUID-B870CF7E-4A19-4646-ACB4-84CC9FD5967E))

Créons une nouvelle vue pour le plaisir :

- Lancez `docker exec -it ` <Var name="db_name">oracle-db</Var> ` sqlplus sys/admin@` <Var name="pdb">ORCLPDB1</Var> ` as sysdba` puis
- Dans la console SQL, lancez `GRANT SELECT ON SYSTEM.DEPARTMENTS TO HR;` suivi de
- `CREATE VIEW HR.DEPARTMENTS AS SELECT DEPARTMENT_ID, DEPARTMENT_NAME, MANAGER_ID, LOCATION_ID FROM SYSTEM.DEPARTMENTS;` et
- Passez dans l'interface Oracle SQL Developer, rafraîchissez la liste des vues, faites un clic droit sur la nouvelle vue `departments`

Maintenant, en rafraîchissant à nouveau `http://localhost:` <Var name="port">8181</Var>`/ords/hr/open-api-catalog/`, vous verrez que vous avez désormais un deuxième élément appelé `DEPARTMENTS`.

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/open-api-catalog/">
  <img
    alt="Accès au metadata-catalog"
    src={require("./images/metadata_catalog.webp").default}
  />
</BrowserWindow>

##### Travailler avec REST {#working-with-rest}

Rendez-vous sur `http://localhost:` <Var name="port">8181</Var>`/ords/hr/_sdw/?nav=rest-workshop` ou, depuis le menu hamburger, cliquez sur l'élément `REST`.

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/_sdw/?nav=rest-workshop">
  <img
    alt="Dashboard REST"
    src={require("./images/rest_dashboard.webp").default}
  />
</BrowserWindow>

### Utiliser les options de pagination, de filtrage et de tri dans la querystring (facultatif — passez si l'endpoint par défaut suffit) {#using-paging-filtering-and-ordering-options-on-the-querystring-optional--skip-if-the-default-endpoint-is-enough}

Lors de l'accès à un endpoint (comme `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/`), nous pouvons manipuler l'URL pour ajouter des paramètres de pagination, de filtrage ou de tri.

On parle de **JSON QBE**, pour JSON query-by-example.

Voyez la documentation officielle : [https://docs.oracle.com/en/database/oracle/simple-oracle-document-access/adsdi/overview-soda-filter-specifications-qbes.html](https://docs.oracle.com/en/database/oracle/simple-oracle-document-access/adsdi/overview-soda-filter-specifications-qbes.html)

#### Pagination {#pagination}

> [Doc](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/21.4/aelig/developing-REST-applications.html#GUID-6B5B51E6-0F35-4FB6-B271-FCC31E835347)

Sauf configuration spécifique, ORDS utilise la pagination, c'est-à-dire qu'il limite la liste des enregistrements à 25 rows.

Donc, si vous avez plus de 25 employés, l'endpoint `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/` n'en retournera que les 25 premiers.

En accédant à une page « complète » comme `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/`, nous ne recevrons en fait qu'un nombre précis d'enregistrements (selon la configuration d'ORDS). À la fin de la réponse JSON, il y aura des liens de navigation :

<BrowserWindow url="http://localhost:%%port=8181%%/ords/hr/employees/">
  <img
    alt="Pagination"
    src={require("./images/pagination.webp").default}
  />
</BrowserWindow>

Comme vous le voyez sur l'image, la réponse JSON fournit une liste d'enregistrements (dans un tableau nommé `items`) puis quelques propriétés comme `hasMore` (true/false), `limit` c'est-à-dire le nombre de rows à chaque appel, `offset` qui est la « page » (à 0 les 25 premières rows sont affichées, à 1 les rows 26 à 50, ...), `count` qui est le nombre de rows dans la réponse.

Donc, tant que `hasMore` vaut `true`, il reste des enregistrements à récupérer avec une requête suivante.

Il y a deux paramètres pour contrôler la pagination des résultats : `offset` et `limit`.

Nous pouvons donc lancer plusieurs requêtes comme `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?offset=25`, `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?offset=50` et ainsi de suite.

Nous pouvons définir le nombre d'enregistrements par page avec le paramètre `limit` de la querystring : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?limit=100`.

<AlertBox variant="note">
La documentation officielle déconseille fortement de supprimer la limite (et donc de demander tous les enregistrements d'un coup). C'est pourquoi il n'existe aucun moyen de la supprimer. Si vous voulez vraiment obtenir la liste complète, essayez avec un nombre très élevé comme `limit=1000000` (un million).

</AlertBox>

#### Filtrage {#filtering}

La syntaxe générale est `/?q={"column":{"$eq":"value"}}`.

##### Supérieur à {#greater-than}

Par exemple, qui gagne plus de 20 000 € de salaire ? `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"salary":{"$gt":20000}}` appliquera un filtre sur `salary > 20000`.

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"salary":{"$gt":20000}}'}>
  <img
    alt="Qui gagne plus de 20k"
    src={require("./images/salary_more_20000.webp").default}
  />
</BrowserWindow>

##### Égal {#equal}

Pour trouver tous les employés appelés `Steven` : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"first_name":{"$eq":"Steven"}}`

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"first_name":{"$eq":"Steven"}}'}>
  <img
    alt="Steven"
    src={require("./images/firstname_is_steven.webp").default}
  />
</BrowserWindow>

##### Instring / contains / like {#instring--contains--like}

Les employés ayant le motif `alex` dans leur prénom : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"first_name":{"$instr":"alex"}}` (correspondra par exemple à `Alexander` ou `Alexis`).

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"first_name":{"$instr":"alex"}}'}>
  <img
    alt="Contient Alex"
    src={require("./images/contains_alex.webp").default}
  />
</BrowserWindow>

Qui travaille dans l'ICT ? Ici, c'est l'opérateur like qu'il faut utiliser : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"job_id":{"$like":"IT_%"}}` (`IT_%` signifie *commence par*)

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"job_id":{"$like":"IT_%"}}'}>
  <img
    alt="Qui travaille pour l'IT"
    src={require("./images/starting_with_it.webp").default}
  />
</BrowserWindow>

##### Filtrage complexe {#complex-filtering}

Nous pouvons aussi utiliser AND comme dans cet exemple : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"first_name":{"$instr":"alex"},"salary":{"$gt":5000}}`, c'est-à-dire récupérer toutes les personnes ayant `alex` dans leur prénom et gagnant plus de 5 000 €

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"first_name":{"$instr":"alex"},"salary":{"$gt":5000}}'}>
  <img
    alt="Contient Alex et gagne plus de 5 000"
    src={require("./images/alex_5000.webp").default}
  />
</BrowserWindow>

<AlertBox variant="info" title="Utiliser le filtrage complexe">
L'URL suivante `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"job_id":{"$like":"%CLERK"},"salary":{"$gt":2899},"hire_date":{"$gt":{"$date":"2016-12-31T12:59:59Z"}}}` retournera tous les employés qui :

- travaillent comme clerk (`job_id` se terminant par le mot `CLERK`),
- ont un salaire supérieur à 2 899 € et
- ont été engagés à partir du 1er janvier 2017.

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"job_id":{"$like":"%CLERK"},"salary":{"$gt":2899},"hire_date":{"$gt":{"$date":"2016-12-31T12:59:59Z"}}}'}>
  <img
    alt="Utiliser une combinaison de filtres"
    src={require("./images/filtering_complex.webp").default}
  />
</BrowserWindow>

</AlertBox>

#### Tri {#sorting}

La syntaxe générale est `/?q={"$orderby":{"fieldname1":"asc","fieldname2":"desc"}}`.

Pour trier sur le prénom en desc puis sur le salaire (le plus élevé en premier) : `http://localhost:` <Var name="port">8181</Var>`/ords/hr/employees/?q={"$orderby":{"first_name":"desc","salary":"desc"}}`.

<BrowserWindow url={'http://localhost:%%port=8181%%/ords/hr/employees/?q={"$orderby":{"first_name":"desc","salary":"desc"}}'}>
  <img
    alt="Tri sur le prénom et le salaire DESC"
    src={require("./images/ordering.webp").default}
  />
</BrowserWindow>

### Swagger {#swagger}

ORDS peut générer un fichier `openapi.json` à utiliser avec Swagger. Pour en savoir plus : [Manage & Monitor Oracle Database with REST APIs](https://www.thatjeffsmith.com/archive/2022/08/manage-monitor-your-oracle-database-with-rest-apis/)

## Pour aller plus loin {#further-reading}

- [ORDS best practices topics (www.oracle.com)](https://www.oracle.com/database/technologies/appdev/rest/best-practices/)
- [Installation, Configuration, and Development Guide (docs.oracle.com)](https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/21.4/aelig/toc.htm#GUID-A1CD111F-724B-4E91-8202-FA899EE521F1)
- [Blog de Jeff Smith - Articles sur ORDS](https://www.thatjeffsmith.com/archive/tag/ords/)
  - [Adding HTTP(S) Access Logs for ORDS Standalone](https://www.thatjeffsmith.com/archive/2022/09/adding-https-access-logs-to-ords-standalone/)
