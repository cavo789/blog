---
slug: docker-use-ssh-during-build
title: "Docker secrets : utiliser votre clé SSH pendant le build"
date: 2024-09-03
description: Accédez en toute sécurité à des repositories Git privés pendant votre build Docker grâce aux clés SSH et aux secrets Docker. Avec des exemples complets de Dockerfile et de compose.yaml pour éviter que vos secrets ne finissent dans l'image finale.
authors: [christophe]
image: /img/v2/docker_secrets.webp
series: SSH - From your first key to remote development
mainTag: ssh
tags:
  - docker
  - git
  - github
  - ssh
language: fr
review_date: 2026-07-30
blueskyRecordKey: null
---
![Docker secrets : utiliser votre clé SSH pendant le build](/img/v2/docker_secrets.webp)

<!-- cspell:ignore keyscan -->

<TLDR>
Cet article montre comment faire un `git clone` d'un repository privé pendant un build Docker sans jamais inscrire la clé SSH dans l'image finale, en utilisant la fonctionnalité BuildKit `RUN --mount=type=secret` de Docker, déclarée dans `compose.yaml` et référencée dans le `Dockerfile`. Il couvre aussi le cas distinct du partage de votre clé SSH avec le *container* en cours d'exécution (et non l'image) via un volume bind-monté, pour travailler en continu avec `git pull`/`push` à l'intérieur.
</TLDR>

Il y a beaucoup d'articles sur Internet mais je n'ai pas trouvé celui qui m'aurait permis, sans une quantité impressionnante d'essais et d'erreurs, de trouver la solution.

Voici donc un article de plus à ajouter à la longue liste : comment accéder à un projet privé stocké sur Github lors de la création d'une image Docker. Autrement dit, la clé SSH n'est pas stockée dans l'image. Docker utilisera juste votre clé lors de l'exécution du *layer* de récupération du projet (celui qui contient l'instruction `git clone`) et n'en gardera aucune trace ensuite.

<!-- truncate -->

Mon cas d'usage : je veux construire une image Docker et pendant la phase de build, j'ai besoin de récupérer une copie d'un repository privé que j'ai mis sur github.com. *L'équivalent CI de ce problème — récupérer une **image Docker privée** plutôt qu'un repository privé — est traité dans <Link to="/blog/gitlab-using-private-images">GitLab - Using Docker private images</Link>.*

Quand j'accède au container, le projet sera bien présent mais je n'ai, nulle part dans mon image, de copie de ma clé SSH. Je ne pourrai donc pas lancer un `git pull` par exemple, puisque plus aucune authentification n'est possible.

## Aperçu {#preview}

![Vous êtes authentifié](./images/authenticated.webp)

C'est la preuve que la technique fonctionne : la clé SSH a servi à s'authentifier auprès de GitHub pendant le build — sans jamais être inscrite dans l'image finale.

## Pourquoi ça fonctionne {#why-it-works}

- Le `RUN --mount=type=secret` de Docker monte le secret uniquement pendant la durée de ce layer de build — il n'est jamais écrit dans un layer qui se retrouve dans l'image finale.
- Copier votre clé SSH dans l'image (ou coder en dur un token) est une grave erreur de conception : n'importe qui lisant le Dockerfile, ou démarrant une session bash interactive pour lancer `printenv` ou parcourir les dossiers `.ssh`/`.git`, la trouvera.
- Même un secret supprimé dans un layer ultérieur peut survivre : des outils comme [SecretScanner](https://github.com/deepfence/SecretScanner) scannent en profondeur, layer par layer, et le retrouveront s'il a été écrit sur le disque dans un layer précédent. *Le même raisonnement s'applique à votre historique git : <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> liste des hooks qui bloquent un commit dès qu'un identifiant est détecté.*

## Quelle clé utiliser {#which-key-to-use}

<AlertBox variant="caution">
Cette partie est l'une des plus importantes. D'abord, bien sûr, vous devez déjà avoir créé une clé SSH (voyez mon article <Link to="/blog/github-connect-using-ssh">Github - Connectez votre compte en SSH et commencez à travailler avec le protocole git@</Link> si besoin).

Ensuite, vous devez savoir quel protocole vous avez utilisé et c'est vraiment important. Votre clé est-elle stockée dans un fichier appelé `id_ed25519`, `id_rsa` ou autre chose ? Vous seul le savez.

Lancez simplement `ls -alh ~/.ssh` pour obtenir la liste de vos clés :

![Mes propres clés](./images/ssh_keys.webp)

J'utilise deux clés différentes comme vous pouvez le voir : `id_ed25519` et `id_rsa`. Les fichiers avec l'extension `.pub` sont les clés publiques ; ceux sans extension sont les clés privées.

</AlertBox>

Il est important de savoir quelle clé a été utilisée pour lier votre profil Github.

Vous pouvez simplement afficher le fichier dans votre console, par exemple `cat ~/.ssh/id_ed25519.pub` ou `cat ~/.ssh/id_rsa.pub` (le fichier de clé publique) et regarder la fin : l'email mentionné est-il celui que vous utilisez sur Github.com ? Si oui, vous avez probablement identifié la bonne clé.

Dans mon cas, la clé que j'utilise pour github.com est `id_ed25519`, je vais donc utiliser celle-là dans le chapitre suivant.

## Création des fichiers {#creating-files}

Nous aurons besoin de deux fichiers : `compose.yaml` et `Dockerfile`.

### compose.yaml {#composeyaml}

Voici le contenu de mon `compose.yaml` :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Comme vous pouvez le voir, il y a cinq lignes spécifiques.

Dans notre entrée `services -> app --> build`, nous devons ajouter `secrets` et le nom d'un (ou plusieurs) secrets.

J'ai aussi ajouté un argument appelé `KEY_NAME` simplement parce que je dois indiquer à Docker quelle clé j'utilise (est-ce `id_ed25519`, `id_rsa` ou une autre).

Les secrets doivent être définis au même niveau d'indentation que `services` et la notation est celle-ci :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Vous pouvez mettre ce que vous voulez pour `a_secret_name` ; par exemple, `my_ssh_key`.

<AlertBox variant="info" title="docker compose config">
Vous pouvez, si vous le souhaitez, lancer `docker compose config` pour vérifier que votre fichier est correct. Vous y verrez aussi le path complet de la clé utilisée.

![Docker compose config](./images/config.webp)

</AlertBox>

### Dockerfile {#dockerfile}

Il est temps de créer notre deuxième fichier, `Dockerfile` :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="caution" title="N'oubliez pas de remplacer cavo789/my_private_repo.git par un de vos propres repositories" />

Comme vous pouvez le voir, nous définissons `KEY_NAME="id_rsa"` comme valeur par défaut (mais elle sera écrasée par notre déclaration dans le fichier yaml) puis, plus loin, nous créons le dossier `/root/.ssh` et nous ajoutons `github.com` à la liste des hosts connus.

Le plus important vient ensuite. Nous devons utiliser la syntaxe `RUN --mount=type=secret` pour indiquer à Docker que ce layer va utiliser un secret Docker. Nous devons fournir le nom de notre secret (défini dans notre fichier yaml, ici `my_ssh_key`) puis définir où ce secret doit être stocké **pendant ce layer**. Notre variable `KEY_NAME` trouve son utilité ici : notre clé SSH était `id_ed25519` et c'est la valeur de la variable `KEY_NAME`.

Donc, en bref, `--mount=type=secret,id=my_ssh_key,dst=/root/.ssh/${KEY_NAME}` sera traduit en `--mount=type=secret,id=my_ssh_key,dst=/root/.ssh/id_ed25519`.

Pendant ce layer donc, notre clé SSH locale sera enregistrée dans `/root/.ssh/id_ed25519`. Les autres lignes de ce layer `RUN` vont d'abord créer un dossier `/app`, s'y placer, puis lancer `ssh -T git@github.com` juste pour le débogage (nous nous attendons à voir à l'écran `Hi your_name! You've successfully authenticated`) et enfin nous clonons notre repository privé en SSH.

## Créer l'image et entrer dans le container {#create-the-image-and-jump-in-the-container}

Bon, vous avez donc créé les deux fichiers sur votre disque dur.

Lancez `docker compose --progress plain build --no-cache` dans votre console pour construire l'image en activant le mode verbeux.

Comme vous pouvez le voir, nous pouvons confirmer que notre clé SSH a bien été partagée pendant le build — c'est la sortie « You're authenticated » montrée en haut de cet article.

Vous allez maintenant créer le container, en lançant `docker compose up --detach`.

![Le container est en cours de création](./images/container_created.webp)

Maintenant, juste pour vérifier, nous pouvons entrer dans le container en lançant `docker compose exec app /bin/bash`.

![Démarrage d'une console interactive](./images/bash_session.webp)

Nous pouvons vérifier que notre clé n'a pas été stockée dans l'image en lançant `ls -alh /root/.ssh/`

![Aucune clé dans le dossier .ssh](./images/root_ssh_folder.webp)

On peut aussi vérifier autrement : aller dans le dossier de notre projet et lancer `git pull` échouera avec l'erreur ci-dessous :

<Terminal typewriter source="./files/terminal-1.txt" />

Et c'est exactement ce qu'on attend : notre clé ne fait pas partie de l'image, donc on ne peut plus se connecter à Github.

## Partager aussi vos clés avec le container {#sharing-your-keys-also-with-the-container}

Bon, nous avons vu comment partager la clé SSH avec Docker mais uniquement pendant la phase de build. Comme vu plus haut, entrer dans le container et lancer `git pull` a échoué ; exactement ce que nous voulions dans le chapitre précédent.

Mais maintenant, si nous avons besoin de partager notre clé aussi avec le container pour pouvoir travailler sur le projet, le mettre à jour et pousser des changements / récupérer des modifications, comment faire ?

Éditez le fichier `compose.yaml` et ajoutez ces deux lignes :

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

Puis recréez le container en lançant `docker compose up --detach`. Entrez dans le container avec `docker compose exec app /bin/bash` et allez dans le dossier de votre projet. Maintenant, en lançant `git pull`, vous verrez que ça fonctionne.

Pourquoi ? Parce que vos clés SSH font maintenant partie du container, comme on peut le voir en lançant `ls -alh /root/.ssh` :

![Les clés font maintenant partie du container](./images/container_ssh_keys.webp)

<AlertBox variant="caution" title="Les clés ne sont pas stockées dans l'image, même quand vous les avez partagées avec le container">
Pour être clair : la notion de volume que nous venons de mettre en place concerne le container et non l'image. Autrement dit, les clés SSH ne sont pas stockées dans l'image Docker. Vous pourriez la donner à quelqu'un d'autre (par exemple en sauvegardant l'image sur Docker Hub) ; vos clés n'y seront pas et resteront sur votre ordinateur. Votre image et vos secrets sont en sécurité.

Ensuite, quand l'utilisateur lance `docker compose up --detach` avec le fichier `compose.yaml` contenant les deux lignes que nous venons d'ajouter (celles pour ajouter le volume) ; ce sont ses clés, sur son ordinateur, pas les vôtres.

</AlertBox>

<AlertBox variant="caution" title="Faites attention à l'utilisateur qui tourne dans votre container">
Dans notre exemple ici, l'utilisateur par défaut est `root`, comme on peut le voir en entrant dans le container et en lançant `whoami`.

![Whoami](./images/whoami.webp)

Donc, quand nous avons lancé `git pull`, c'était sous `root`. C'est pour cela que nous avons monté notre volume comme ceci :

<Snippet filename="compose.yaml" source="./files/compose.part4.yaml" />

Imaginez que l'utilisateur courant soit `christophe`. Dans ce cas, le montage devrait se faire comme ceci :

<Snippet filename="compose.yaml" source="./files/compose.part5.yaml" />


</AlertBox>

## Conclusion {#conclusion}

Deux besoins différents, deux mécanismes différents : un **secret de build** (`--mount=type=secret`)
qui ne touche jamais l'image finale, pour des opérations ponctuelles comme cloner un repo privé pendant
`docker build` ; et un **volume bind-monté**, pour quand le container en cours d'exécution a besoin de votre
clé de façon continue pour `git pull`/`push`. Choisissez le premier par défaut, et n'ajoutez le second
que quand vous devez réellement travailler depuis l'intérieur du container.
