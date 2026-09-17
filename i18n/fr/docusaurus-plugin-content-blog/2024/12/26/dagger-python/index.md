---
slug: dagger-python
title: Dagger.io - Utiliser dagger pour automatiser vos workflows CI
date: 2024-12-26
description: Automatisez vos workflows CI/CD avec Dagger.io et Python. Lancez rapidement vos outils de qualité de code (Pylint, Black, Ruff) et testez tout votre pipeline en local pour simplifier l'intégration.
authors: [christophe]
image: /img/v2/dagger.webp
mainTag: code-quality
tags:
  - code-quality
  - github
  - gitlab
language: fr
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the local pipeline proof now comes before the setup steps."
  - date: 2026-07-30
    note: "Fixed dead link: Dagger GitLab docs moved from /integrations/gitlab to /ci/integrations/gitlab."
---
<!-- cspell:ignore pylint,pyproject,stopit,randint,workdir,pylintrc,docparams,mccabe,mypy -->
<!-- cspell:ignore hadolint,xvfz,aaaaaargh,dind,dood,usermod -->
<!-- markdownlint-disable-file MD010 -->

![Dagger.io - Utiliser dagger pour automatiser vos workflows CI](/img/v2/dagger.webp)

<TLDR>
Cet article montre comment « daggeriser » un projet Python avec Dagger.io afin que les étapes de CI (Pylint, Black, mypy, Ruff) soient définies une seule fois dans des fonctions Python et s'exécutent à l'identique en local (via un CLI `dagger` dockerisé, enveloppé dans des cibles `make lint`/`make format`) et dans une CI distante comme GitLab — fini la boucle lente « push et prie » pour déboguer un `.gitlab-ci.yml` uniquement sur le serveur. On y voit `dagger init`, l'écriture des fonctions du pipeline, leur exécution concurrente avec `run-all`, et la configuration du runner GitLab pour partager le socket Docker.
</TLDR>

**Attention, c'est une bombe.** Docker a révolutionné le monde ; n'ayons pas peur de le dire haut et fort, et il y a fort à parier que [Dagger.io](https://dagger.io/), créé par les mêmes personnes que Docker, suivra le même chemin.

Dagger.io veut être un outil qui vous permet d'exécuter les étapes d'un workflow exactement de la même manière qu'un système de **CI/CD** (**Continuous Integration / Continuous Delivery**) comme ceux de GitHub, GitLab, Jenkins, ...

Mais qu'est-ce qu'une CI ? C'est une étape réalisée par votre serveur une fois que vous avez poussé une nouvelle version de votre projet. Pendant une CI, vous pouvez valider la syntaxe de votre code, vérifier qu'il respecte certaines règles (de formatage par exemple), lancer des outils d'analyse de qualité de code comme la vérification que vous n'avez pas de variables non déclarées ou non typées, ni de code mort (par exemple une fonction que vous n'utilisez plus).

Pendant une CI, vous pouvez aussi lancer vos tests unitaires et les exécuter à chaque nouvelle version poussée.

Le but de la CI, c'est de ... **planter dès que quelque chose n'est pas dans l'état attendu** ; par exemple vous avez oublié un `;`, vous avez une violation (des espaces à la place de tabulations), un test unitaire ne passe plus, etc. L'objectif de la CI est donc de garantir que votre code est excellent.

<!-- truncate -->

## Le résultat : un pipeline qui tourne, sans YAML, sans push {#the-result-a-working-pipeline-no-yaml-no-push}

Une fois Dagger branché sur un petit projet Python, `dagger init` génère un pipeline fonctionnel en deux minutes environ — aucun serveur CI impliqué, aucun `.gitlab-ci.yml` à pousser puis attendre :

<Terminal typewriter source="./files/terminal-4.txt" />

Et le pipeline est immédiatement appelable, directement sur votre machine :

<Terminal typewriter source="./files/terminal-3.txt" />

Deux fonctions d'exemple (`container-echo`, `grep-dir`) existent dès le départ — la preuve qu'un pipeline Dagger n'est rien d'autre que des fonctions Python que vous pouvez lancer en local. La suite de cet article transforme ces exemples en véritables étapes Pylint/Black/mypy/Ruff, puis branche exactement le même pipeline dans une CI GitLab.

## Pourquoi ça fonctionne {#why-it-works}

- Les étapes de CI sont de simples fonctions Python — aucun DSL YAML à apprendre, aucune syntaxe qui n'existe que sur le serveur.
- Exactement la même fonction tourne sur votre portable et dans GitLab/GitHub : même container, même sortie, plus de surprise après un push.
- Dagger exécute tout dans un container qu'il contrôle, donc les outils dont votre pipeline a besoin (Pylint, Black, mypy, Ruff, ...) sont figés et reproductibles, pas « ce qui traîne sur le runner ».
- Les fonctions se composent : appelez-en une pour linter, ou appelez une fonction `run-all` pour lancer lint/format/type-check/ruff en parallèle et s'arrêter au premier échec.
- La vieille boucle push → attendre → lire le log → deviner → repousser peut être entièrement jouée hors ligne, avant que quoi que ce soit n'atteigne le serveur.

## Installation {#installation}

Dans ce tutoriel, nous allons **daggeriser** un repository, c'est-à-dire partir de zéro, créer un petit script Python, créer une image Docker Dagger, puis initialiser notre projet pour utiliser Dagger.

Créons un dossier temporaire pour Dagger et plaçons-nous dedans : `mkdir /tmp/dagger && cd $_`.

Créez-y un script Python dans un sous-dossier `src` et appelons-le `src/main.py` :

<Snippet filename="src/main.py" source="./files/main.py" />

Formidable application qui nous dit, au hasard, *Hello world* ou *Bonjour le monde!*

### Nos objectifs {#our-objectives}

Chaque fois que nous pousserons notre code vers notre outil de versioning (comme GitLab), nous voulons :

- Lancer [Pylint](https://pypi.org/project/pylint/), *Lint python scripts using Pylint - Run analyses your code without actually running it*,
- Lancer [Black](https://black.readthedocs.io/en/stable/), *Format the script using Black*,
- Lancer [Mypy](https://github.com/python/mypy/), *Mypy is a program that will type check your Python code* et
- Lancer [Ruff](https://github.com/astral-sh/ruff), *an extremely fast Python linter and code formatter*

(J'ai détaillé ces quatre outils dans <Link to="/blog/python-qa">Python - Code Quality tools</Link>.)

Ces étapes sont déclenchées dans notre CI (GitLab, GitHub, ...) à chaque push et, pour faire les mêmes actions en local, nous devons créer par exemple quelques actions make (`make lint`, `make format`, ...).

### Nous voulons Dagger {#we-want-dagger}

![Dagger](./images/dagger.webp)

Sans surprise, à un moment il faut installer Dagger. Installer ? Aïe non ; on ne va pas l'installer car, en amoureux de Docker, nous allons utiliser Docker et créer notre image Dagger.

Créez un nouveau sous-dossier appelé `.docker` et, dans ce dossier, un fichier appelé `Dockerfile` :

<Snippet filename=".docker/Dockerfile" source="./files/Dockerfile" />

Il faut construire notre image, lançons donc `docker build -t dagger_daemon -f .docker/Dockerfile .`

### Daggeriser notre application {#daggerize-our-application}

Comme dit plus haut, nous devons créer quelques éléments pour *daggeriser* notre application.

Pour cela, il faut exécuter la commande `dagger init` et, comme nous utilisons une image Docker où `dagger` est le point d'entrée, la commande à lancer est : `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon init --sdk=python --source=./.pipeline`

<AlertBox variant="info" title="Décortiquons cette longue ligne de commande :">
* avec `-it` nous pourrons interagir (si besoin) avec le container et nous allouons un terminal TTY, c'est-à-dire que nous récupérons la sortie de la commande exactement comme si nous l'avions lancée sur notre machine,
* vous devez partager votre `/var/run/docker.sock` local avec le container car Dagger utilise Docker-out-of-Docker (alias `DooD`) et, pour cette raison, le container doit pouvoir interagir avec votre instance de Docker (`-v /var/run/docker.sock:/var/run/docker.sock`) et
* vous devez monter votre dossier courant local dans le container (`-v .:/app/src`).
* `dagger_daemon` est le nom de notre image
* `init --sdk=python --source=./.pipeline` est la commande Dagger à lancer

</AlertBox>

Il faudra environ deux minutes pour télécharger et initialiser Dagger (la première fois). En regardant votre système de fichiers, vous verrez, oh, que le propriétaire est `root` et pas vous — c'est le listing de fichiers montré plus haut.

Lancez `sudo chown -R christophe:christophe .` (et remplacez mon prénom par votre nom d'utilisateur Linux).

Regardons l'arborescence :

```tree expanded=true showJSX=false debug=false
.
├── LICENSE
├── dagger.json
└── .pipeline
    ├── pyproject.toml
    ├── sdk
    ├── src
    │   └── src
    │       ├── __init__.py
    │       └── main.py

```

Rappelez-vous, `dagger` a été défini comme notre entrypoint (voir notre `Dockerfile`) donc, pour obtenir l'écran d'aide de Dagger, lancez simplement `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call --help` — vous obtiendrez la même liste de fonctions que celle montrée en haut de cet article (cette première fois prendra plus de temps puisque Dagger doit construire le pipeline).

## Plus de démos {#more-demos}

### Créer notre fonction de linting {#create-our-linting-function}

Les fonctions sont définies dans le fichier `.pipeline/src/src/main.py`.

Ouvrez ce fichier et ajoutez une nouvelle fonction comme ci-dessous :

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part2.py" />

Enregistrez le fichier et relancez `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call --help`. Regardez, nous avons notre nouvelle fonction :

<Terminal typewriter source="./files/terminal-2.txt" />

Et nous obtenons aussi la liste des paramètres de notre fonction lint avec `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call lint --help` :

<Terminal typewriter source="./files/terminal-1.txt" />

Maintenant, retour dans `.pipeline/src/src/main.py` et remplacez tout le fichier (nous n'avons pas besoin des fonctions d'exemple) par ce contenu :

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part3.py" />

Nous supprimons donc les deux fonctions d'exemple et nous implémentons notre fonction de linting. Nous définissons aussi le dossier `src` comme dossier par défaut afin de ne plus devoir ajouter `--source src` à chaque appel de dagger.

En lançant `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call lint`, nous demandons au pipeline de lancer notre linter (Pylint ici) sur notre dossier courant.

Comme c'est la première fois, Dagger doit faire quelques initialisations (comme installer PyLint) puis nous obtenons la sortie :

![Sortie partielle - Pylint](./images/pylint.webp)

Oui ! PyLint a fonctionné et nous a alertés d'une docstring de module manquante.

Éditez `src/main.py` et ajoutez une docstring de module valide (ou ignorez simplement cet avertissement) :

<Snippet filename="src/main.py" source="./files/main.part4.py" />

En relançant `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call lint`, nous serons félicités avec un score de 10/10.

Éditez à nouveau le fichier `src/main.py`, faites par exemple une faute de frappe en modifiant la ligne `else:` et en supprimant le `:` final : le linter ne sera plus content.

<AlertBox variant="info">
Nous avons créé notre première tâche avec succès et nous l'avons lancée avec succès sur notre machine.

</AlertBox>

### Créer un makefile {#create-a-makefile}

Ça devient difficile de retenir toutes ces commandes `docker xxx`, non ? Simplifions cela en créant un `makefile` (si c'est nouveau pour vous, lisez d'abord <Link to="/blog/makefile-using-make">Linux Makefile - When to use a makefile</Link>).

Grâce au `makefile` suivant, nous pourrons simplement lancer `make build` pour créer notre image Docker Dagger et `make lint` pour lancer la fonction lint.

Vous aurez aussi une action `make bash` pour entrer dans un shell interactif (tapez `exit` pour quitter le shell et revenir à la console de votre host). Facile, non ?

Et `make help` affichera l'écran d'aide de Dagger.

<Snippet filename="makefile" source="./files/makefile" />

### Formater le code avec Black {#formatting-the-code-using-black}

Éditez le fichier `.pipeline/src/src/main.py` et ajoutez cette nouvelle fonction :

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part5.py" />

Donc, à partir de maintenant, vous pouvez lancer `dagger call format` (depuis l'intérieur du container, c'est-à-dire après un `make bash`) ou `docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src dagger_daemon call format` (depuis votre host).

### Vers l'univers et l'infini {#towards-the-universe-and-infinity}

Ok, nous avons maintenant deux tâches et il nous en reste beaucoup à implémenter. On peut faire plein de copier/coller ou prendre le temps de réfléchir :

1. Ce serait bien de ne pas devoir spécifier à chaque fois le dossier source,
2. Ce serait bien de lancer toutes les tâches d'un coup, en asynchrone,
3. Ce serait bien d'avoir un dossier de configuration où stocker les fichiers de configuration

Nous devons faire une petite modification à notre image Docker :

<Snippet filename=".docker/Dockerfile" source="./files/Dockerfile.part2" />

Cela fait, lancez `make build` pour créer une nouvelle image Docker avec `anyio` installé.

Maintenant, nous allons mettre à jour le fichier `.pipeline/src/src/main.py` et ajouter quelques nouvelles fonctions :

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part6.py" />

Ce nouveau fichier apporte beaucoup de changements :

Nous avons défini deux variables globales appelées `source` et `config`. Désormais, nous ne passons plus le dossier `source` à la fonction lint (paramètre local) mais il suffit de le définir une seule fois (paramètre global). Nous avons aussi ajouté un dossier `config` pour pouvoir indiquer à Dagger où sont stockés nos fichiers de configuration.

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part7.py" />

Nous avons deux nouvelles fonctions appelées `mypy` et `ruff` et une dernière appelée `run_all` :

<Snippet filename=".pipeline/src/src/main.py" source="./files/main.part8.py" />

Celle-ci démarre les quatre fonctions en parallèle et attend qu'une échoue ou que les quatre réussissent.

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Fichiers de configuration {#configuration-files}

Avant de lancer ces nouvelles fonctions, nous devons créer quelques fichiers de configuration.

<Snippet filename=".config/.pylintrc" source="./files/.pylintrc" />

<Snippet filename=".config/black.toml" source="./files/black.toml" />

<Snippet filename=".config/mypy.ini" source="./files/mypy.ini" />

<Snippet filename=".config/pyproject.toml" source="./files/pyproject.toml" />

<Snippet filename="makefile" source="./files/makefile.part2" defaultOpen={false} />

### Implémenter une CI GitLab avec Dagger {#implementing-a-gitlab-ci-using-dagger}

Revenons à notre objectif : simplifier le processus de pipeline à la fois au niveau de la CI (GitLab, GitHub, etc.) et en local.

Nous venons de faire la partie locale, attaquons la CI distante.

Pour les chapitres suivants, je suppose que vous utilisez un serveur GitLab auto-hébergé.

#### Autoriser le runner GitLab à accéder à Docker {#allowing-the-gitlab-runner-to-access-docker}

Je ne suis pas expert en configuration de runner GitLab mais la configuration suivante fonctionne pour moi. J'ai détaillé cette mise en place, et le piège du partage de dossiers qui va avec, dans <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>.

Connectez-vous en SSH à votre serveur de runner GitLab et éditez le fichier `/etc/gitlab-runner/config.toml` (vous devez être root). Ajoutez simplement `/var/run/docker.sock:/var/run/docker.sock` à la propriété `volumes` :

<Snippet filename="/etc/gitlab-runner/config.toml" source="./files/config.toml" />

Assurez-vous aussi que l'utilisateur Linux utilisé par votre runner GitLab (le nom par défaut est `gitlab-runner`) fait partie du groupe `docker`. Cela se fait en lançant `sudo usermod -aG docker gitlab-runner` en CLI (voir [https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-the-shell-executor](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-the-shell-executor)).

<AlertBox variant="info">
Documentation officielle de GitLab à propos des [volumes](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runnersdocker-section).

</AlertBox>

Pour vérifier que ça marche, lancez `sudo su gitlab-runner` pour basculer sur cet utilisateur puis lancez `docker info` et `docker image list` et regardez si ça fonctionne. Si oui, votre utilisateur fait bien partie du groupe Docker.

#### Configurer votre CI {#configure-your-ci}

Créez un repository GitLab et poussez-y votre projet existant.

Maintenant, créez un fichier appelé `.gitlab-ci.yml` avec ce contenu :

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml" />

Et poussez les changements vers GitLab. La présence du fichier `.gitlab-ci.yml` indiquera à GitLab d'instancier un pipeline après chaque commit et, dans notre exemple, de lancer les quatre jobs.

<AlertBox variant="info" title="Docker Socket Binding">
L'exemple fourni utilise la technique appelée **Docker Socket Binding** : nous n'avons pas besoin de définir la variable `DOCKER_HOST` comme on peut le voir dans [la documentation officielle de Dagger](https://docs.dagger.io/ci/integrations/gitlab). En effet, si elle n'est pas spécifiée, `DOCKER_HOST` vaut `unix:///var/run/docker.sock` ([doc](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section)).

Comme nous avons partagé le daemon Docker (`/var/run/docker.sock`) dans notre fichier de configuration GitLab `/etc/gitlab-runner/config.toml`, nous avons autorisé la CI à accéder au socket.

</AlertBox>

Mais vous pouvez aussi utiliser le mode asynchrone puisque nous avons implémenté une fonctionnalité `run-all` :

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml.part2" />

## Conclusion {#conclusion}

Nous avons construit une image Docker Dagger sur mesure, daggerisé un projet existant, et défini quatre fonctions (`lint`, `format`, `mypy` et `ruff`) plus une fonction `run-all` pour toutes les lancer en parallèle. Les actions `make` nous évitent de retenir les longues commandes du CLI Docker, et exactement les mêmes fonctions tournent maintenant aussi dans une CI GitLab, en partageant le socket Docker avec le runner.

La boucle push → attendre → lire le log → deviner → repousser de l'introduction a disparu : tout ce qui se déclenche en CI peut d'abord être joué et débogué en local, en quelques secondes, et non en minutes sur un serveur distant.

Si ce n'est pas déjà fait, lisez <Link to="/blog/python-qa">Python - Code Quality tools</Link> pour plus de détails sur Pylint, Black, mypy et Ruff eux-mêmes.
