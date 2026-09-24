---
slug: docker-dive
title: "Docker Dive — Radiographiez vos images et éliminez le gaspillage"
description: "Utilisez dive pour inspecter chaque layer d'une image Docker, repérer les mégaoctets gaspillés par des fichiers supprimés, et passer étape par étape d'une image obèse de 1 Go à un build compact et efficace."
authors: [christophe]
image: /img/v2/docker_dive.webp
mainTag: docker
tags:
  - docker
  - linux
  - code-quality
date: 2026-09-24
---

<!-- cspell:ignore wagoodman pyc scikit -->

![Docker Dive — Radiographiez vos images et éliminez le gaspillage](/img/v2/docker_dive.webp)

<TLDR>
`dive` est un outil open source en ligne de commande qui affiche chaque layer d'une image Docker sous forme d'arborescence de fichiers interactive, en mettant en évidence exactement quels fichiers sont gaspillés — présents dans un layer mais supprimés dans un layer suivant, et pourtant toujours embarqués dans l'image finale. Cet article part d'un Dockerfile volontairement catastrophique, montre comment dive expose le gaspillage, puis le corrige en trois étapes successives : nettoyage des caches apt dans le même layer, fusion de plusieurs instructions `RUN` en une seule, et passage à un multi-stage build qui réduit l'image de 80 %. En bonus, on pousse l'idée à son extrême avec `FROM scratch` — une image contenant un seul binaire et rien d'autre.
</TLDR>

Mince. Je viens de lancer `docker images` et voilà ce que j'ai vu : `myapp:latest — 1.19 GB`. Une application web Python avec cinq dépendances, et elle a gonflé au-delà du gigaoctet. Quelque chose cloche sérieusement dans ce Dockerfile.

Le problème avec l'obésité des images Docker, c'est qu'elle est invisible tant qu'on ne la cherche pas. Vos containers démarrent, votre app tourne, tout semble normal — et pendant ce temps vous expédiez 400 Mo de cache apt et d'outils de build en production à chaque déploiement.

C'est là qu'intervient <Link to="https://github.com/wagoodman/dive">dive</Link>. C'est un inspecteur d'images en mode terminal qui permet de naviguer dans les layers de n'importe quelle image Docker, de voir exactement ce que chaque instruction `RUN`, `COPY` et `ADD` a ajouté ou supprimé, et d'obtenir un score d'efficacité sans pitié en bas de l'écran. Voyez ça comme une machine à rayons X pour vos images.

<!-- truncate -->

## Qu'est-ce que Dive ? {#what-is-dive}

Au fond, une image Docker est une pile de layers en lecture seule. Chaque instruction de votre Dockerfile qui touche au système de fichiers crée un nouveau layer. `apt-get install` — nouveau layer. `pip install` — nouveau layer. `COPY` — nouveau layer.

Voilà le piège : si vous installez un package dans le layer 3, puis supprimez son cache dans le layer 5, les données du cache sont *toujours dans l'image*. La suppression marque seulement les fichiers comme « opaques » dans le layer supérieur — les octets du layer 3 sont toujours là, téléchargés à chaque `docker pull`.

`dive` rend tout cela visible. Panneau de gauche : l'arborescence de fichiers du layer sélectionné. Panneau de droite : la liste des layers avec leurs tailles. En bas : votre score d'efficacité et l'espace total gaspillé.

<AlertBox variant="tip" title="Raccourcis clavier dans dive">
Appuyez sur `Tab` pour basculer entre la liste des layers et l'arborescence de fichiers. Les flèches permettent de naviguer entre les layers. `Space` replie/déplie les répertoires de l'arborescence. Les fichiers affichés en jaune sont modifiés, ceux en rouge sont supprimés — ces derniers sont vos octets gaspillés.
</AlertBox>

## Lancer Dive — aucune installation nécessaire {#running-dive--no-installation-needed}

Vous me connaissez bien maintenant : j'aime mettre les choses dans des containers. Et `dive` dispose d'une image Docker officielle, donc aucune raison d'installer quoi que ce soit sur votre host :

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest myapp:latest
</Terminal>

Le montage `-v /var/run/docker.sock:/var/run/docker.sock` est obligatoire : c'est par là que le container `dive` accède au daemon Docker de votre host pour inspecter les images. Si cela vous met mal à l'aise — et c'est une inquiétude légitime — consultez l'<Link to="/blog/docker-out-of-docker-dood">article sur Docker-out-of-Docker</Link> pour le contexte de sécurité autour du montage de la socket.

Si vous préférez un binaire local, `dive` est disponible sous Linux, macOS et Windows :

<Terminal title="user@machine: ~" wrap={true}>
$ wget -q https://github.com/wagoodman/dive/releases/latest/download/dive_linux_amd64.tar.gz -O - | tar xz dive && sudo mv dive /usr/local/bin/
</Terminal>

Dans les deux cas, l'usage est identique : `dive <image-name>`.

## Le patient : un Dockerfile volontairement catastrophique {#the-patient-a-deliberately-terrible-dockerfile}

Construisons quelque chose de vraiment mauvais pour avoir de quoi analyser. Notre app est une petite API Flask — rien d'extraordinaire, juste assez pour tirer de vraies dépendances :

<Snippet
  filename="app.py"
  source="./files/app.py"
  defaultOpen={true}
/>

Et le Dockerfile — écrit sans le moindre égard pour la taille de l'image :

<Snippet
  filename="Dockerfile.bad"
  source="./files/Dockerfile.bad"
  defaultOpen={true}
/>

Construisons-le et voyons à quoi on a affaire :

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker build -t myapp:bad -f Dockerfile.bad .

[+] Building 142.3s (9/9) FINISHED

$ docker images myapp:bad

REPOSITORY   TAG    IMAGE ID       SIZE
myapp        bad    3f8c1a9e2b71   1.19GB
</Terminal>

1,19 Go. Pour une app Flask de cinq fichiers. Voyons exactement pourquoi.

## Le diagnostic : ce que dive révèle {#the-diagnosis-what-dive-reveals}

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest myapp:bad
</Terminal>

Dans l'interface interactive, le panneau de droite (la liste des layers) ressemble à ceci :

```plaintext
Cmp   Size  Command
     212 MB  FROM ubuntu:24.04
      38 MB  RUN apt-get update
     368 MB  RUN apt-get install -y curl wget git python3...
     184 MB  RUN pip3 install flask requests numpy pandas...
    0.0 B   RUN mkdir /app
    1.2 KB  COPY app.py /app/
```

Le panneau de gauche affiche l'arborescence du layer sélectionné. Quand vous sélectionnez le layer `apt-get update`, vous verrez `/var/lib/apt/lists/` rempli de centaines de mégaoctets de fichiers d'index de packages — et ils sont *toujours là* dans chaque layer suivant.

Pour un résultat non interactif et scriptable, utilisez le mode CI :

<Terminal title="user@machine: ~/myapp" wrap={true} source="./files/terminal_dive_bad.txt" />

**61,89 % d'efficacité. 438 Mo gaspillés.** C'est brutal, et c'est entièrement de notre faute.

<AlertBox variant="coreConcept" title="Que signifie exactement « octets gaspillés » ?">
Dive compte un fichier comme « gaspillé » lorsqu'il existe dans un layer inférieur mais est supprimé ou écrasé dans un layer supérieur. Les octets d'origine du layer inférieur sont toujours physiquement présents dans l'image — ils ne sont simplement plus visibles dans le container en cours d'exécution. Chaque `docker pull` les télécharge quand même.
</AlertBox>

## Correctif n°1 — nettoyer le bazar apt dans le même layer {#fix-1--clean-up-the-apt-mess-in-the-same-layer}

La première erreur, et la plus fréquente : séparer `apt-get update` du nettoyage. La règle est simple — **tout ce que vous voulez faire disparaître doit être supprimé dans la même instruction `RUN`**.

<Snippet
  filename="Dockerfile.v2"
  source="./files/Dockerfile.v2"
  defaultOpen={true}
/>

Le changement clé est l'ajout de `apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*` à la fin du bloc `RUN` d'installation apt. Cela s'exécute *dans le même layer*, donc les fichiers de cache ne sont jamais committés dans l'image.

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker build -t myapp:v2 -f Dockerfile.v2 .

$ docker images myapp:v2

REPOSITORY   TAG    IMAGE ID       SIZE
myapp        v2     7a4e0f1c9d83   712MB
</Terminal>

712 Mo au lieu de 1,19 Go. Près de 500 Mo envolés. Confirmons l'amélioration avec dive :

<Terminal title="user@machine: ~/myapp" wrap={true} source="./files/terminal_dive_v2.txt" />

98,23 % d'efficacité — un bond énorme. Mais on est encore à 712 Mo pour une minuscule app Flask. Il reste du travail.

## Correctif n°2 — moins de layers, moins de surcharge {#fix-2--fewer-layers-less-overhead}

Regardez à nouveau la liste des layers de `Dockerfile.bad`. Chaque instruction `RUN` séparée crée son propre layer. Même si un layer n'ajoute « qu'un » répertoire ou quelques kilooctets, chaque layer a un coût en métadonnées — et surtout, séparer l'installation du nettoyage rend *impossible* de les garder dans le même layer.

La solution : regrouper les opérations liées dans une seule chaîne `RUN` avec `&&` :

<Snippet
  filename="Dockerfile.v3"
  source="./files/Dockerfile.v3"
  defaultOpen={true}
/>

Au-delà du nombre réduit de layers, remarquez les commandes `find` à la fin : elles suppriment tous les fichiers compilés `.pyc` et les répertoires `__pycache__` que pip crée pendant l'installation. Du gaspillage pur dans une image de production.

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker build -t myapp:v3 -f Dockerfile.v3 .

$ docker images myapp

REPOSITORY   TAG    IMAGE ID       SIZE
myapp        bad    3f8c1a9e2b71   1.19GB
myapp        v2     7a4e0f1c9d83    712MB
myapp        v3     2b9d4e7f1c05    689MB
</Terminal>

L'écart entre v2 et v3 est modeste ici — environ 23 Mo. Le vrai intérêt du regroupement des instructions `RUN`, c'est la clarté et la justesse : vous ne pouvez plus mettre accidentellement le nettoyage dans un autre layer.

<AlertBox variant="important" title="Mais 689 Mo, c'est encore énorme pour une app Flask">
Nous avons toujours `build-essential`, `python3-dev`, `libssl-dev`, `pkg-config`, `wget` et `git` dans l'image de production. Ce sont des outils de build — ils étaient nécessaires pour compiler certains packages pip, mais ils n'ont rien à faire dans l'image qui tourne en production. C'est ici que l'approche mono-stage atteint sa limite.
</AlertBox>

## Correctif n°3 — le multi-stage build {#fix-3--the-multi-stage-build}

L'idée centrale du multi-stage build est simple : un `FROM` pour construire, un autre `FROM` pour exécuter. Le stage builder peut être aussi gros qu'il veut — outils, caches, compilateurs — puisque seul le stage final est expédié.

<Snippet
  filename="Dockerfile.multistage"
  source="./files/Dockerfile.multistage"
  defaultOpen={true}
/>

Ce qui se passe ici :

1. `FROM python:3.12 AS builder` — image Python complète, utilisée uniquement pour installer les packages
2. `pip install --target ./packages` — installe tout dans un répertoire local (pas à l'échelle du système)
3. `FROM python:3.12-slim AS production` — l'image de base slim, environ 130 Mo
4. `COPY --from=builder /build/packages ./packages` — seuls les packages installés franchissent la frontière ; pas d'outils de build, pas de cache pip, pas de listes apt

<Terminal title="user@machine: ~/myapp" wrap={true}>
$ docker build -t myapp:multistage -f Dockerfile.multistage .

$ docker images myapp

REPOSITORY   TAG          IMAGE ID       SIZE
myapp        bad          3f8c1a9e2b71   1.19GB
myapp        v2           7a4e0f1c9d83    712MB
myapp        v3           2b9d4e7f1c05    689MB
myapp        multistage   9c3a1f8e4b22    247MB
</Terminal>

247 Mo — une réduction de 80 % par rapport au point de départ. Et le score dive :

<Terminal title="user@machine: ~/myapp" wrap={true} source="./files/terminal_dive_multistage.txt" />

99,71 % d'efficacité. Les 4 Ko d'octets « gaspillés » restants sont du bruit de fond — des métadonnées de layer Docker inévitables.

<AlertBox variant="tip" title="Choisir la bonne base slim">
`python:3.12-slim` est le bon compromis pour la plupart des apps Python. `python:3.12-alpine` est encore plus petite (environ 20 Mo) mais utilise `musl libc` au lieu de `glibc`, ce qui peut poser des problèmes de compatibilité avec les wheels binaires comme `numpy` ou `pandas`. Testez avant de vous engager sur Alpine pour une stack orientée données.
</AlertBox>

Les multi-stage builds sont aussi la bonne approche pour les langages compilés. Si vous construisez une app Go, Rust ou C, le stage builder contient toute la chaîne de compilation, et seul le binaire final atterrit dans le stage de production. Ce qui nous amène à la section bonus.

## Bonus — FROM scratch : le minimum absolu {#bonus--from-scratch-the-absolute-minimum}

`FROM scratch` est un mot-clé Docker spécial — ce n'est pas un nom d'image, c'est un signal indiquant au builder Docker que la nouvelle image doit démarrer complètement vide. Pas de shell, pas de gestionnaire de packages, pas de libc, rien. Juste les fichiers que vous y copiez explicitement avec `COPY`.

Cela ne fonctionne que si votre application est un binaire autonome sans aucune dépendance externe. Le Go compilé statiquement en est l'exemple parfait :

<Snippet
  filename="Dockerfile.scratch"
  source="./files/Dockerfile.scratch"
  defaultOpen={true}
/>

<Snippet
  filename="main.go"
  source="./files/main.go"
  defaultOpen={false}
/>

Les flags `-ldflags '-w -s'` retirent les informations de debug et la table des symboles, grignotant quelques Mo de plus sur le binaire.

<Terminal title="user@machine: ~/myserver" wrap={true}>
$ docker build -t myserver:scratch -f Dockerfile.scratch .

$ docker images myserver:scratch

REPOSITORY   TAG       IMAGE ID       SIZE
myserver     scratch   1a2b3c4d5e6f    6.88MB
</Terminal>

6,88 Mo. Moins de 7 Mo pour un serveur HTTP de production. Et dive ?

<Terminal title="user@machine: ~/myserver" wrap={true} source="./files/terminal_dive_scratch.txt" />

100,00 % d'efficacité. 0 octet gaspillé. Il n'y a littéralement plus rien à améliorer.

<AlertBox variant="note" title="FROM scratch n'est pas toujours pratique">
Une image scratch n'a aucun shell — `docker exec mycontainer sh` échouera. Pas de shell signifie pas de scripts shell dans votre entrypoint, pas de `ping`, pas de `curl` pour des health checks depuis l'intérieur du container. Pour le debug, envisagez plutôt `gcr.io/distroless/static` : presque aussi petite que scratch, mais elle inclut une poignée d'outils POSIX et est maintenue par Google pour les correctifs de sécurité.
</AlertBox>

## Dive comme garde-fou qualité en CI {#dive-as-a-ci-quality-gate}

Lancer dive à la main est utile pendant le développement, mais la vraie puissance est dans le mode `--ci` — il lit un fichier de configuration et renvoie un code de sortie non nul si votre image ne respecte pas les seuils. Branchez ça directement dans votre pipeline.

Créez un `.dive-ci.yaml` à la racine de votre projet :

<Snippet
  filename=".dive-ci.yaml"
  source="./files/dive-ci-config.yaml"
  defaultOpen={true}
/>

Ajoutez ensuite une étape dans votre pipeline CI :

<Terminal title="CI pipeline step" wrap={true}>
$ DIVE_CONFIG=.dive-ci.yaml CI=true docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(pwd)/.dive-ci.yaml:/.dive-ci.yaml \
    -e DIVE_CONFIG=/.dive-ci.yaml \
    wagoodman/dive:latest myapp:latest
</Terminal>

Si l'efficacité de l'image tombe sous 95 % ou que les octets gaspillés dépassent 20 Mo, l'étape échoue et le déploiement n'a jamais lieu. Plutôt cool, non ?

<AlertBox variant="tip" title="Quels seuils ont du sens ?">
`lowestEfficiency: 0.95` et `highestWastedBytes: "20mb"` sont des valeurs de départ raisonnables. Augmentez `highestWastedBytes` si votre image contient légitimement de gros assets statiques (polices, modèles, jeux de données) qu'on ne peut pas séparer proprement.
</AlertBox>

## Claude Code — automatiser toute la boucle {#claude-code--automate-the-entire-loop}

Tout ce que nous avons fait à la main — lancer dive, lire le JSON, repérer les layers gaspilleurs, décider quoi corriger, éditer le Dockerfile, reconstruire, relancer — est une boucle répétable. Si vous utilisez <Link to="https://claude.ai/code">Claude Code</Link>, vous pouvez piloter l'ensemble avec une seule commande slash :

```text
/docker-dive-optimization
```

Elle détecte automatiquement le Dockerfile principal du projet (ou accepte un chemin ou un tag d'image en argument), construit l'image, exécute dive en mode JSON, et classe chaque constat dans trois catégories — qui correspondent directement aux patterns que nous avons appliqués à la main dans cet article.

**Catégorie A — corriger tout de suite** : du gaspillage mécanique, indiscutablement erroné. Un `apt-get clean` placé dans un `RUN` distinct de l'installation, un `--no-cache` absent d'un `apk add`, un répertoire de cache non nettoyé dans le layer qui l'a créé. Claude applique la modification du Dockerfile, reconstruit, et relance dive pour vérifier le gain avant d'annoncer le succès.

**Catégorie B — proposer et attendre** : les constats dont la bonne réponse demande un jugement. Passer de `python:3.12` à `python:3.12-slim` dans un stage de production. Introduire un multi-stage build là où il n'y en a pas. Remplacer un runtime de 300 Mo présent uniquement pour un seul appel CLI par un binaire autonome. Claude présente les preuves au niveau des layers et le compromis, puis attend votre décision avant de toucher à quoi que ce soit.

**Catégorie C — TODOs** : tout ce qui nécessite des recherches avant d'y toucher. Consigné sous forme d'éléments numérotés dans `.todos/` pour ne rien perdre entre deux sessions.

<AlertBox variant="tip" title="Cibler n'importe quelle image ou n'importe quel Dockerfile">
La commande utilise par défaut le Dockerfile du projet, mais elle accepte directement un chemin ou un tag d'image :

```text
/docker-dive-optimization myapp:latest
/docker-dive-optimization ./services/api/Dockerfile
```

Vous pouvez copier le fichier de commande dans le répertoire `.claude/commands/` de n'importe quel projet — il détecte automatiquement s'il faut utiliser `docker compose build` ou un simple `docker build`, donc aucun réglage spécifique au projet n'est nécessaire.
</AlertBox>

Cette répartition en trois catégories reflète les arbitrages de cet article. Nettoyer le cache apt dans le même layer, c'est la catégorie A — aucune discussion, on merge et on vérifie. Passer à un multi-stage build, c'est la catégorie B — de vrais compromis à examiner d'abord. Remplacer un binaire de niche que vous n'avez jamais audité, c'est la catégorie C — recherche avant d'y toucher. La même analyse que celle faite à la main, automatisée.

Pour la preuve : j'ai lancé `/docker-dive-optimization` sur le blog même que vous êtes en train de lire. L'image du devcontainer avait gonflé à **2,5 Go**, affichait 89,95 % d'efficacité et transportait 433 Mo d'octets gaspillés — hérités en grande partie d'une base lourde `mcr.microsoft.com/devcontainers/javascript-node:20-bookworm` qui embarquait silencieusement oh-my-zsh, subversion et une chaîne de compilation C/C++ complète dont personne n'avait besoin. La catégorie A a attrapé un `chown -R` redondant qui forçait l'overlay FS de Docker à copier 1 410 fichiers dans un layer inutile de 21 Mo. La catégorie B a signalé l'image de base et les 996 Mo de `node_modules` intégrés à chaque build.

![résultat dive avant et après optimisation sur ce blog](./images/final_result.png)

**De 2,5 Go à 735 Mo — une réduction de 70 %, avec l'efficacité passée de 89,95 % à 98,75 %.** Le simple remplacement de l'image de base spécifique aux devcontainers par `node:20-bookworm-slim` a économisé plus d'un gigaoctet. Déplacer `node_modules` vers un volume Docker nommé à l'exécution a récupéré 996 Mo de plus. Toute la session — reconstruction et relance de dive pour vérifier comprises — a pris moins de quinze minutes.

## Récapitulatif {#putting-it-all-together}

Voici la progression que nous avons suivie :

<StepsCard
  variant="remember"
  title="Le parcours en quatre étapes"
  steps={[
    { content: "**Départ (Dockerfile.bad) — 1,19 Go, 61 % d'efficacité** : un `RUN apt-get update` séparé, aucun nettoyage de cache, des outils de build dans l'image finale." },
    { content: "**v2 — 712 Mo, 98 % d'efficacité** : nettoyer le cache et les listes `apt` dans la même instruction `RUN` qui les installe." },
    { content: "**v3 — 689 Mo, 98 % d'efficacité** : regrouper toutes les étapes d'installation dans une seule chaîne `RUN`, supprimer les fichiers `.pyc`." },
    { content: "**Multi-stage — 247 Mo, 99,7 % d'efficacité** : utiliser un stage builder séparé ; seuls les packages installés passent dans l'image de production slim." },
    { content: "**Bonus (FROM scratch) — 6,88 Mo, 100 % d'efficacité** : binaire compilé statiquement, aucune image de base." },
  ]}
/>

## Conclusion {#conclusion}

Il existe une version de cette histoire où vous expédiez une image de 1,2 Go en production parce que ça marche — et vous ne vous retournez jamais. J'y suis passé. L'app tourne, l'équipe livre, personne ne se plaint. Jusqu'à ce que vous regardiez la facture de stockage de votre registry, ou votre temps de démarrage à froid sur une plateforme serverless, ou le temps de pull sur un runner CI avec un cache vide.

`dive` rend l'invisible visible. Une fois que vous avez vu 438 Mo d'octets gaspillés surlignés en rouge, impossible de l'oublier. Les correctifs n'ont rien d'exotique : nettoyez dans le même layer, combinez vos instructions `RUN`, utilisez des multi-stage builds. Ce sont des choses que tout praticien de Docker devrait connaître par cœur, et vous avez maintenant un outil qui vous dira immédiatement si vous en avez oublié une.

Pour plus de contexte sur l'écriture de Dockerfiles dignes de la production, <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers</Link> couvre l'approche source unique de vérité où un seul Dockerfile gère proprement les deux environnements. Et si vous cherchez un autre outil Docker orienté terminal, il y a un article compagnon sur <Link to="/blog/lazydocker">lazydocker</Link> — un dashboard TUI complet pour gérer vos containers et vos logs sans quitter le terminal.
