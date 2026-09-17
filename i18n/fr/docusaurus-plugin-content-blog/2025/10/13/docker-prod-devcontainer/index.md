---
slug: docker-prod-devcontainer
title: Une seule image Docker pour la production et les devcontainers - la méthode propre
date: 2025-10-13
description: Apprenez à concevoir une configuration Docker qui fournit une image de production sécurisée et minimale tout en permettant un développement local sans effort via les Devcontainers de VS Code, avec des overrides propres et une isolation des environnements
authors: [christophe]
image: /img/v2/docker_workflow_prod_devcontainer.webp
series: Coding using a devcontainer
mainTag: docker
tags:
  - devcontainer
  - docker
language: fr
blueskyRecordKey: 3m32ko2ssss2z
---
<!-- cspell:ignore groupid,Debugpy,johndoe -->

![Une seule image Docker pour la production et les devcontainers - la méthode propre](/img/v2/docker_workflow_prod_devcontainer.webp)

<TLDR>
Cet article présente une méthode propre pour utiliser une seule image Docker à la fois pour les déploiements en production et pour les Devcontainers de VS Code. L'approche consiste à construire d'abord une image de production minimale et sécurisée, puis à l'étendre avec des outils de développement, des configurations utilisateur spécifiques et des overrides pour obtenir une image devcontainer séparée. Cela garantit un environnement de production léger avec une surface d'attaque réduite, tout en offrant une expérience de développement riche et isolée.
</TLDR>


Cet article est le fruit d'une intense réflexion : comment définir une image Docker destinée au déploiement en production de la manière la plus propre possible et, tout en évitant au maximum les copier/coller et autres répétitions, créer une image pour le développement en devcontainer.

Autrement dit : je veux créer l'image la plus légère et la plus sécurisée possible pour le déploiement en production, mais je dois évidemment pouvoir développer cette image dans mon environnement VSCode. Et pour cela, il me faut mes outils de développement, un utilisateur Linux spécifique pour synchroniser les fichiers avec mon host et éviter les problèmes de permissions, etc.

Après plusieurs tentatives, voici ce à quoi je suis arrivé, et qui semble répondre à ce besoin.

<!-- truncate -->

<AlertBox variant="coreConcept" title="Quelques concepts clés à garder en tête pendant la lecture de cet article">
1. Nous devons séparer complètement la future production de notre développement (devcontainer).
2. Il faudra créer l'image Docker de production avant de pouvoir utiliser le devcontainer.
</AlertBox>

## Que signifie une séparation parfaite des environnements ? {#what-does-a-perfect-separation-of-environments-mean}

Notre premier réflexe devrait toujours être : avons-nous besoin de ceci (utilitaire, configuration, utilisateur, etc.) dans l'image Docker que nous allons déployer sur le serveur ?

Quelques exemples :

- Les outils de développement tels qu'un linter, un formateur, un <Link to="/blog/php-jakzal-phpqa">outil de qualité de code</Link>, un débogueur, etc. n'ont pas leur place dans l'image qui sera déployée.
- La création d'un utilisateur qui permettra la synchronisation des fichiers avec l'host n'a pas sa place dans l'image qui sera déployée.
- ...

Notre image doit être propre, aussi efficace et légère que possible... Nous devons minimiser ce qu'on appelle la « surface d'attaque », c'est-à-dire réduire le nombre d'outils installés afin de réduire les risques de sécurité.

Tout ce dont nous avons besoin pour notre développement devra donc faire partie d'une seconde image Docker, celle que nous utiliserons quand nous activerons la fonctionnalité devcontainer dans VSCode. C'est là que nous créerons notre utilisateur, ajouterons les outils de développement et activerons certaines configurations comme le débogage, etc. Si vous n'en avez jamais mis en place, <Link to="/blog/vscode-devcontainer">le développement PHP dans un devcontainer avec des outils de qualité de code préinstallés</Link> détaille un devcontainer complet, de zéro.

<AlertBox variant="coreConcept" title="Donc, en résumé, nous aurons deux images Docker">
Une pour le déploiement et une seconde pour étendre la première avec des outils et des éléments de configuration supplémentaires. Cette dernière ne quittera jamais notre host et nous ne la construirons jamais nous-mêmes : nous laisserons VSCode le faire pour nous.
</AlertBox>

![Concept clé - Deux images](./images/production_devcontainer.webp)

## Le résultat {#the-result}

Un seul Dockerfile, pas de copier-coller, et les deux images se construisent à partir exactement des mêmes instructions : un container de production minimal et rootless, et un devcontainer qui l'étend avec les outils nécessaires au développement.

<Vars port="8000" labels={{ port: "Host port" }} />

Voici le container de production qui répond sur `http://localhost:`<Var name="port">8000</Var> :

<BrowserWindow url="http://localhost:%%port=8000%%" minHeight={300}>
  <div style={{ padding: '1rem' }}>
    <p>\{"message":"Hello, FastAPI - PRODUCTION!"\}</p>
  </div>
</BrowserWindow>

![L'image de production a été créée](./images/prod_image_created.webp)

Les étapes ci-dessous construisent exactement cela, à partir d'un dossier vide, puis l'étendent en devcontainer.

## Étape 1 - Créer l'image Docker de production {#step-1---we-have-to-create-the-production-docker-image}

Créez un nouveau dossier dans votre dossier temporaire pour notre exemple.

<Terminal typewriter wrap={true}>
$ mkdir -p /tmp/docker-prod-devcontainer && cd $_
</Terminal>

### Créons nos fichiers de production {#lets-create-our-production-files}

Créons quelques fichiers (rappelez-vous, pour l'image Docker de production).

#### Le fichier .env de production {#the-production-env-file}

Pour cet article, nous allons créer un script Python : il faudra donc préciser la version de Python souhaitée.

C'est juste pour l'exemple mais, dans votre cas, ce `.env` servira à y placer tous les paramètres que vous voulez pour votre propre image de production.

Donc, même si vous ne voyez pas encore pourquoi utiliser ce fichier dans votre cas, gardez-le, même si vous n'avez aucune variable à y mettre.

<Snippet filename="/tmp/docker-prod-devcontainer/.env" source="./files/.env" />

#### Le fichier Dockerfile de production {#the-production-dockerfile-file}

Le fichier fourni est un exemple réutilisable. Dans cet article, à titre d'exemple, nous allons créer un petit script Python pour illustrer certaines choses.

<Snippet filename="/tmp/docker-prod-devcontainer/Dockerfile" source="./files/Dockerfile" />

Regardez le script fourni :

<StepsCard
  variant="steps"
  steps={[
    "Nous définissons la version de Python à utiliser",
    "Nous configurons quelques variables d'environnement comme le fuseau horaire, ...",
    "Nous installons les dépendances Linux nécessaires pour la production (**mais attention à ne pas ajouter ici les dépendances utiles uniquement au développement local**)",
    "Comme il s'agit d'un exemple Python, nous copions le fichier `requirements.txt` dans l'image Docker et installons les packages",
    "Nous copions tous nos fichiers dans l'image Docker (veillez à bien configurer votre fichier `.dockerignore`)",
    "Et, enfin, pour l'image de production, nous initialisons le point d'entrée et la commande à conserver"
  ]}
/>

<AlertBox variant="caution">
Comme vous pouvez le voir, nous n'avons pas créé ici, dans l'image Docker, d'utilisateur non privilégié. Notre image de production viole donc une règle que nous avons tous lue : **votre image Docker doit être rootless**.

C'est un concept clé ici :

- L'utilisateur sera configuré au moment du déploiement de l'image, avec des outils comme Kubernetes par exemple,
- Quand nous utiliserons l'image Docker pour le développement local, l'UID/GID de l'utilisateur devra correspondre à celui du développeur (et nous ne savons pas maintenant si c'est `1000:1000` ou autre chose),
- L'utilisateur peut facilement être spécifié dans le fichier `compose.yaml`.


</AlertBox>

#### Le fichier compose.yaml de production {#the-production-composeyaml-file}

Le fichier `compose.yaml` est utilisé par Docker compose (qui fait partie de Docker) pour savoir comment construire votre image et comment créer votre container.

C'est un fichier très important puisque nous y définirons toutes les configurations requises, nous y spécifierons notre fichier `.env` pour que Docker puisse traduire les variables en valeurs, ...

Nous dirons aussi à Docker quel port du container en cours d'exécution doit être partagé avec notre host, ...

<Snippet filename="/tmp/docker-prod-devcontainer/compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="caution">
Faites attention aux parties `user:` et `security_opt:`.

Elles disent à Docker d'utiliser un utilisateur ayant l'UID/GID `1001` lors de la création d'un container basé sur notre image. Cet utilisateur... n'existait pas dans l'image, alors pourquoi ?

C'est une astuce pour s'assurer que le container tourne en rootless, c'est-à-dire que l'utilisateur dans le container est non privilégié.

Comme mesure de sécurité supplémentaire, nous avons la ligne `security_opt: - no-new-privileges:true` pour empêcher le container d'obtenir des privilèges additionnels.

En bref : quand un container sera créé à partir de notre image, l'utilisateur ne pourra exécuter que ce que nous avons décidé pour lui, rien de plus.

</AlertBox>

#### Le fichier requirements Python de production {#the-production-python-requirements-file}

Nous avons vu une mention de ce fichier dans notre `Dockerfile` : comme nous utilisons Python comme exemple pour ce billet, nous avons besoin d'un fichier `requirements.txt` pour déclarer les dépendances dont notre script a besoin. Dans notre exemple, il nous faut les dépendances FastAPI :

<Snippet filename="/tmp/docker-prod-devcontainer/requirements.txt" source="./files/requirements.txt" />

<AlertBox variant="info">
Regardez ce fichier encore une fois : nous n'avons, à proprement parler, que les dépendances nécessaires à la production.

</AlertBox>

Si votre cas d'usage n'est pas un script Python, vous ne devez évidemment pas créer ce fichier `requirements.txt` (mais, dans ce cas, mettez aussi à jour le `Dockerfile` et supprimez cette partie).

#### Le script Python de production {#the-production-python-script}

Et enfin, pour la démo, nous allons créer un script Python FastAPI qui renverra une simple réponse JSON ; assez direct :

<Snippet filename="/tmp/docker-prod-devcontainer/src/main.py" source="./files/src/main.py" />

#### Récapitulatif des fichiers de production {#summary-for-the-production-files}

À ce stade, notre projet ressemble à ceci, soit cinq fichiers.

```tree expanded=true showJSX=false debug=false title="docker-prod-devcontainer"
├─ .env
├── Dockerfile
├── compose.yaml
├── requirements.txt
└── src
    └── main.py
```

### Création de l'image Docker de production {#creating-the-docker-production-image}

Ouvrez une console Linux et exécutez la commande ci-dessous pour voir si tout va bien, c'est-à-dire s'il n'y a pas d'erreur et si, par exemple, notre fichier `.env` où nous avons spécifié la version de Python est bien récupéré et utilisé.

<Terminal typewriter>
$ docker compose config
</Terminal>

Vous obtiendrez quelque chose comme ceci :

<Snippet filename="console output" source="./logs/prod.log" />

<AlertBox variant="info" title="Souvenez-vous de notre utilisateur 1001">
Regardez ci-dessus la ligne `user: 1001:1001`. Nous l'avons vu dans un chapitre précédent : quand le container sera créé, l'utilisateur actif sera `1001:1001` et celui-ci n'existait pas (nous ne l'avons pas créé dans notre `Dockerfile`) : notre container sera rootless ; exactement ce que nous voulons.
</AlertBox>

Maintenant, nous allons construire et créer le container en exécutant la commande ci-dessous.

<AlertBox variant="highlyImportant" title="EXTRÊMEMENT IMPORTANT - NOUS DEVONS CONSTRUIRE L'IMAGE D'ABORD">
Comme notre futur devcontainer sera dérivé de l'image de production, nous DEVONS la construire en premier :

<Terminal typewriter>
$ docker compose build

</Terminal>

Cela garantit que VSCode récupérera une version locale de votre image. Si vous ne le faites pas, si vous n'avez pas encore construit l'image, Docker essaiera de la télécharger depuis Docker Hub (depuis internet) et vous obtiendrez probablement une erreur.

Donc, encore une fois, avant d'aller plus loin dans ce tutoriel, exécutez d'abord `docker compose build` dans une console.

</AlertBox>

### Lancer un container de production {#running-a-production-container}

Nous pouvons maintenant créer un container si nous le souhaitons, en exécutant la commande ci-dessous :

<Terminal typewriter>
$ docker compose up --detach

</Terminal>

Comme notre projet de démo est une application Python FastAPI, lancez simplement un navigateur et allez à l'adresse <Code>http://localhost:<Var name="port">8000</Var></Code> pour voir le message de FastAPI. La sortie est au format JSON :

<BrowserWindow url="http://localhost:%%port=8000%%" minHeight={300}>
  <div style={{ padding: '1rem' }}>
    <p>\{"message":"Hello, FastAPI - PRODUCTION!"\}</p>
  </div>
</BrowserWindow>

### Et, pour être sûr, vérifions qui est l'utilisateur courant en PROD {#and-just-to-be-sure-checking-who-is-the-current-user-for-prod}

Optionnel : exécutons une commande paramétrée dans le container pour voir qui est l'utilisateur courant :

<Terminal typewriter wrap={true}>
$ docker compose exec app /bin/sh -c 'echo "Container user ID is $(id -u) and his group ID is $(id -g)"'

Container user ID is 1001 and his group ID is 1001
</Terminal>

Ceci, juste pour confirmer : lors de l'exécution de notre container, celui-ci tournera avec un utilisateur non privilégié grâce à notre fichier d'orchestration `compose.yaml`.

![L'image de production a été créée](./images/prod_image_created.webp)

## Étape 2 - Override (ou extension) de l'image de production pour obtenir une image prête pour le devcontainer {#step-2---override-or-extend-the-production-image-and-get-a-devcontainer-ready-one}

### Créons nos fichiers devcontainer {#lets-create-our-devcontainer-files}

Créez maintenant un sous-dossier appelé `.devcontainer` avec les fichiers ci-dessous.

#### Le fichier .devcontainer/.env {#the-devcontainerenv-file}

Au cas où nous aurions besoin d'éléments de configuration supplémentaires, créons le fichier `.devcontainer/.env` (même vide).

<Snippet filename="/tmp/docker-prod-devcontainer/.devcontainer/.env" source="./files/.devcontainer/.env" />

#### Le fichier .devcontainer/Dockerfile {#the-devcontainerdockerfile-file}

L'un des fichiers les plus importants est le `.devcontainer/Dockerfile`, où nous ajouterons des éléments supplémentaires (dépendances Linux, bibliothèques Python, ...) pour nous offrir une meilleure expérience de développement.

<Snippet filename="/tmp/docker-prod-devcontainer/.devcontainer/Dockerfile" source="./files/.devcontainer/Dockerfile" />

Regardez le script fourni encore une fois :

<StepsCard
  variant="steps"
  steps={[
    "Nous réutilisons l'image Docker créée précédemment (voir la ligne `FROM my_sample_prod:latest`)",
    "Nous installons quelques outils Linux de dev comme `bash`, `curl`, `git`, ... dont nous n'avons pas besoin en prod",
    "Maintenant, nous créons un utilisateur non-root en utilisant quelques paramètres comme `OS_USERID`, `OS_GROUPID` et `OS_USERNAME`. Nous créons aussi quelques dossiers personnalisés pour cet utilisateur",
    "Nous configurons notre shell pour des choses comme le fichier d'historique, pour avoir un prompt personnalisé, ...",
    "Nous nous assurons que les différents dossiers que nous devons manipuler appartiennent bien à notre utilisateur",
    "Nous installons quelques dépendances Python de dev spécifiques (nécessaires pour notre exemple ici)"
  ]}
/>

Cette dernière étape n'est donc nécessaire que pour illustrer ce billet. Utilisez les vôtres.

<AlertBox variant="coreConcept" title="Attention à l'instruction FROM">
Permettez-moi d'insister encore une fois sur ce point. Pour l'instant, notre `Dockerfile` étend une image existante appelée `my_sample_prod:latest`.

Avez-vous cette image sur votre host maintenant ? Si vous ne l'avez pas, VSCode, quand vous utiliserez la fonctionnalité *Open in Devcontainer*, essaiera d'abord de télécharger l'image depuis Docker Hub.

Bon, peut-être que l'image y est hébergée et, dans ce cas, Docker la téléchargera depuis le Hub. Peut-être que cette image n'existe nulle part ailleurs que sur votre host. Peut-être qu'elle existe à la fois sur le Hub et sur votre machine.

Beaucoup de questions, non ? Soyez-en simplement bien conscient !

Veillez à exécuter `docker compose build` dans votre dossier racine si vous devez :

1. Créer l'image locale
2. Rafraîchir l'image locale parce que vous avez modifié vos fichiers Docker de production (comme vu au chapitre précédent).

Donc, si ce n'est pas encore fait, exécutez `docker compose build` ! Vérifiez que `docker image ls | grep -i my_sample` dans votre console liste bien votre image.

</AlertBox>

#### Le fichier .devcontainer/requirements.txt {#the-devcontainerrequirementstxt-file}

Ce petit fichier est là uniquement à titre d'illustration. Dans ce billet, nous créons une petite application Python FastAPI et, dans le `.devcontainer/requirements.txt`, nous ajouterons quelques dépendances Python supplémentaires pour le dev, comme l'installation de l'outil `Debugpy`, c'est-à-dire le débogueur Python de Microsoft.

<Snippet filename="/tmp/docker-prod-devcontainer/.devcontainer/requirements.txt" source="./files/.devcontainer/requirements.txt" />

Bien sûr, si votre projet n'est pas en Python, ce fichier peut être supprimé et, dans ce cas, supprimez aussi les lignes associées du `.devcontainer/Dockerfile`.

#### Le fichier .devcontainer/compose.yaml {#the-devcontainercomposeyaml-file}

Comme pour l'image de production, nous devons ici dire à Docker comment l'image doit être construite et comment le container (celui de dev) doit être créé.

<Snippet filename="/tmp/docker-prod-devcontainer/.devcontainer/compose.yaml" source="./files/.devcontainer/compose.yaml" />

Si vous regardez ce fichier `.devcontainer/compose.yaml`, nous configurons plusieurs choses :

- La liste des arguments de build (`args`) doit mentionner l'id utilisateur, l'id de groupe et le nom de notre utilisateur. C'est important : quand nous travaillerons dans le devcontainer, tous les fichiers créés dans le container appartiendront à cet utilisateur spécifique. Si nous utilisons `johndoe` avec `1001` pour l'id utilisateur et l'id de groupe, les fichiers seront synchronisés ainsi sur votre host ; appartenant à `johndoe`, pas à vous. Si vous êtes l'utilisateur `1000:1000` localement, vous comprenez que les fichiers ne seront pas les vôtres et que vous aurez des problèmes de permissions. C'est quelque chose à éviter. Pour cela, nous devons configurer correctement le fichier `.devcontainer/compose.yaml`.

Regardez la syntaxe : `${LOCAL_UID:-1000}`. Par défaut, le fichier assignera `1000` (qui est souvent le bon ID). Mais d'abord, Docker vérifiera si une variable appelée `LOCAL_UID` existe sur l'host. Si c'est le cas, cette valeur sera utilisée. Donc, si l'exécution de `id -u` (ou `id -g` pour l'id de groupe) ne donne pas `1000` sur votre host, veillez à créer la variable `LOCAL_UID` ou `LOCAL_GID` dans votre fichier `.bashrc` et à leur assigner la bonne valeur.

- Comme notre exemple porte sur Python, nous exposons aussi le port standard de DebugPy grâce à la ligne `5679:5679` pour que, au démarrage d'une session de débogage, le container fonctionne.

- Nous référençons aussi deux fichiers `.env`, celui du dossier racine (utilisé pour l'image Docker PROD) et celui du dossier `.devcontainer`

- Nous ajoutons quelques volumes :
  - `.:${APP_HOME:-/app}` montera (= partagera) les fichiers de notre projet (dans VSCode) avec le dossier `${APP_HOME:-/app}`, c'est-à-dire là où les fichiers sont stockés dans l'image Docker PROD. Ainsi, les fichiers déjà copiés dans l'image Docker PROD seront simplement écrasés par ceux de notre session de dev (=> c'est là que la magie opère)
  - Nous demandons aussi à Docker de créer un volume auto-géré pour les `vscode-extensions`. Grâce à cette ligne, la première fois que nous créerons le devcontainer, VSCode installera les extensions mais, la fois suivante, grâce à cette ligne, VSCode ne les réinstallera pas, elles sont déjà présentes. Ce `vscode-extensions` sert à la persistance des données.
  - Et la ligne pour `./.devcontainer/history/.bash_history` conservera l'historique de vos lignes de commande (dans la console) dans votre projet. Ainsi, la prochaine fois que vous travaillerez dans le devcontainer, l'historique CLI sera déjà rempli avec ce que vous avez fait par le passé.

#### Le fichier .devcontainer/devcontainer.json {#the-devcontainerdevcontainerjson-file}

Et, enfin, le fichier de configuration pour VSCode.

Dans VSCode, pour pouvoir exécuter une commande `Devcontainer:` (depuis la **Command Palette** (<kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd>)), le fichier `.devcontainer/devcontainer.json` doit être présent et indiquer à VSCode quoi faire.

<Snippet filename="/tmp/docker-prod-devcontainer/.devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" />

<StepsCard
  variant="steps"
  steps={[
    "Nous devons utiliser l'entrée `dockerComposeFile` pour charger nos deux fichiers `compose.yaml`, celui de la racine (celui de prod) et celui du dossier `.devcontainer`. C'est nécessaire parce que nous voulons juste étendre le `compose.yaml` de production. Nous réutilisons tous les services et clés définis dans `../compose.yaml` et en ajoutons (extension) ou en modifions (override) simplement quelques-uns",
    "Nous devons indiquer à VSCode quel dossier doit être ouvert dans notre session Devcontainer, ce doit être `/app` (doit correspondre à la variable `APP_HOME` de `.devcontainer/compose.yaml`)",
    "Nous définissons le nom de notre remoteUser, ce sera `vscode` (doit correspondre à la variable `OS_USERNAME` de `.devcontainer/compose.yaml`)",
    "Nous ajoutons aussi une variable d'environnement `GIT_SSH_COMMAND`. C'est optionnel mais cela nous permettra d'exécuter une commande `git` (comme `git pull`) depuis l'intérieur de notre devcontainer",
    "La clé `initializeCommand` créera le dossier `.devcontainer/history` sur notre host (avec nous comme propriétaire) juste avant la création du container. Ainsi, nous pourrons y stocker notre fichier d'historique bash (voir l'entrée `volumes` dans `.devcontainer/compose.yaml`)",
    "Et, enfin, dans la partie `customizations`, nous pouvons ajouter les settings et extensions VSCode que nous voulons configurer et installer dans notre Devcontainer. Vous pouvez ajouter beaucoup de settings / extensions ici si vous le souhaitez, selon le type de votre projet"
  ]}
/>

#### La structure de notre projet à ce stade {#our-projects-structure-right-now}

À ce stade, notre projet ressemble à ceci, soit dix fichiers.

```tree expanded=true showJSX=false debug=false title="docker-prod-devcontainer/"
├── .devcontainer
│   ├── .env
│   ├── Dockerfile
│   ├── compose.yaml
│   ├── devcontainer.json
│   └── requirements.txt
├── .env
├── Dockerfile
├── compose.yaml
├── requirements.txt
└── src
    └── main.py
```

### Création de l'image Devcontainer {#creating-the-devcontainer-image}

Cette partie est purement optionnelle, c'est juste pour vérifier si tout est correctement rempli.

Allez dans le dossier `.devcontainer` (`cd .devcontainer`) et exécutez cette commande :

<Terminal typewriter>
$ docker compose -f ../compose.yaml -f compose.yaml config

</Terminal>

Vous obtiendrez quelque chose comme ceci :

<Snippet filename="console output" source="./logs/devcontainer.log" />

Vous avez eu une erreur ? Si oui, vous pouvez la lire et la gérer plus facilement maintenant.

Vous pouvez regarder la configuration pour voir si tout semble correct, c'est-à-dire si vos variables ont bien été remplacées par les valeurs provenant des fichiers `.env`.

![Les deux images, prod et devcontainer, ont été créées](./images/both_created.webp)

## Ouvrir le container avec VSCode {#opening-the-container-using-vscode}

Il est temps d'ouvrir le projet avec la fonctionnalité Devcontainer de VSCode.

<Terminal typewriter wrap={true}>
$ cd /tmp/docker-prod-devcontainer && code .

</Terminal>

![Ouverture de VSCode](./images/opening_vscode.webp)

Si vous regardez en bas à droite de votre écran, vous verrez probablement cette popup :

![La popup devcontainer](./images/popup_devcontainer.webp)

Cliquez simplement sur le bouton `Reopen in Container` ou, deuxième méthode, appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> pour ouvrir la **Command palette** et sélectionnez l'option "Dev Containers: Rebuild Without Cache and Reopen in Container".

VSCode fermera le projet et le rouvrira. Cela prendra plus de temps (la première fois) parce qu'il doit d'abord créer le container Docker.

![Le DevContainer est prêt](./images/devcontainer.webp)

Si vous voyez l'image ci-dessus, vous êtes dans le container. J'ai configuré un thème clair juste pour faire la distinction nette entre l'host (thème noir) et le devcontainer (thème clair).

En bas à droite, vous pouvez créer un nouveau Terminal :

![Création d'un nouveau terminal](./images/add_new_terminal.webp)

Dans ce projet de démo, vous pouvez voir ce message ; une seule fois :

![Le message de bienvenue](./images/welcome_terminal.webp)

L'idée est donc de fournir une aide contextuelle au développeur et de lui indiquer, ici, comment démarrer le serveur FastAPI avec le hot reload et Debugpy activé.

### Testons {#lets-test}

Si nous retournons à l'URL <Code>http://localhost:<Var name="port">8000</Var></Code>, nous obtenons toujours la réponse JSON (le container tourne donc bien).

<BrowserWindow url="http://localhost:%%port=8000%%" minHeight={300}>
  <div style={{ padding: '1rem' }}>
    <p>\{"message":"Hello, FastAPI - PRODUCTION!"\}</p>
  </div>
</BrowserWindow>

Mais maintenant, dans VSCode, si vous éditez le script `src/main.py` et mettez à jour le message Hello comme ci-dessous :

![Mise à jour du message Hello](./images/updated_main.webp)

Il vous suffit d'enregistrer la modification, de revenir à la fenêtre du navigateur et de rafraîchir la page :

<BrowserWindow url="http://localhost:%%port=8000%%" minHeight={300}>
  <div style={{ padding: '1rem' }}>
    <p>\{"message":"Hello, FastAPI - I'm running from the Devcontainer!"\}</p>
  </div>
</BrowserWindow>

### Déboguons {#lets-debug}

Dans ce projet de démo, nous avons ajouté la dépendance Debugpy.

Il nous suffit d'ajouter un fichier supplémentaire pour VSCode.

<Snippet filename="/tmp/docker-prod-devcontainer/.vscode/launch.json" source="./files/.vscode/launch.json" />

Pour être sûr que l'extension fonctionne correctement, fermez VSCode et rouvrez-le. Rouvrez aussi le DevContainer (maintenant, vous pouvez simplement choisir "Reopen in Devcontainer").

Une fois dans votre devcontainer, ouvrez le fichier `src/main.py`. Cliquez n'importe où sur la ligne de retour (ligne 7) et appuyez sur <kbd>F9</kbd> pour ajouter un point d'arrêt.

![Ajout d'un point d'arrêt](./images/adding_a_breakpoint.webp)

Appuyez sur <kbd>F5</kbd> pour démarrer la session de débogage.

Retournez au navigateur, rafraîchissez la page et VSCode s'arrêtera sur cette ligne précise.

![Réussi](./images/success.webp)

## Pour aller plus loin {#going-further}

L'exemple ci-dessus utilise Python ; exactement la même approche à deux images est utilisée, langage par langage, dans <Link to="/blog/docker-python-devcontainer">Docker - Python devcontainer</Link> et <Link to="/blog/php-devcontainer">le développement PHP dans un devcontainer avec des outils de qualité de code préinstallés</Link>. Et si le devcontainer reste une notion abstraite pour vous, commencez par <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five - What's Docker for?</Link>.
