---
slug: zsh-docker-functions
title: Fonctions ZSH - Personnaliser votre shell pour gérer Docker
description: Une collection de fonctions ZSH pour améliorer votre expérience du terminal, avec la gestion interactive des containers Docker grâce à fzf. Ouvrez de nouvelles sessions, arrêtez des containers et bien plus, sans effort.
authors: [christophe]
image: /img/v2/zsh.webp
series: Customize your shell with ZSH
mainTag: zsh
tags:
  - customization
  - docker
  - fzf
  - linux
  - zsh
date: 2026-03-02
updates:
  - date: 2026-03-23
    note: Adding drun
blueskyRecordKey: 3mfj335ykxc2d
---
![Fonctions ZSH - Personnaliser votre shell pour gérer Docker](/img/v2/zsh.webp)

<TLDR>
Améliorez votre workflow dans le terminal avec des fonctions ZSH personnalisées pour gérer Docker de façon interactive. Cet article présente des outils comme `dex`, `dstop` et `dnuke` qui s'appuient sur `fzf` pour accéder rapidement à un shell, arrêter des containers, consulter les logs et nettoyer les ressources, sans rien mémoriser.
</TLDR>

Au quotidien, j'utilise quelques fonctions ZSH que je trouve bien pratiques. Ces fonctions peuvent être ajoutées à votre fichier `~/.zshrc` (ou, mieux, dans leur propre fichier — voir <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>) pour améliorer votre expérience du terminal quand vous travaillez avec Docker. Elles offrent des moyens rapides et interactifs de gérer vos containers Docker **sans devoir retenir des commandes précises ou des ID de containers** (et soyons honnêtes, on les oublie vite !).

Dans cet article, je partage quelques-unes des fonctions ZSH que j'utilise pour gérer Docker : ouvrir une nouvelle session de terminal dans un container en cours d'exécution, arrêter des containers, accéder aux logs (même si le container est arrêté) et nettoyer les ressources inutilisées. Ces fonctions s'appuient sur `fzf` pour une sélection interactive, ce qui rend la gestion de votre environnement Docker bien plus simple, directement depuis votre terminal.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Ouvrir une nouvelle session de terminal dans un container Docker en cours d'exécution", to: "#start-a-new-terminal-session-in-a-running-docker-container" },
    { label: "Comment l'installer", to: "#how-to-install" },
  ]}
/>

Comme ces fonctions reposent sur `fzf`, si vous ne l'avez pas installé, faites-le via votre gestionnaire de packages (par exemple `sudo apt-get install fzf` sur les systèmes basés sur Debian). Vous découvrez l'outil ? Commencez par lire <Link to="/blog/linux-fzf-introduction">Introduction to fzf - Fuzzy Finder</Link>.

## Ouvrir une nouvelle session de terminal dans un container Docker en cours d'exécution {#start-a-new-terminal-session-in-a-running-docker-container}

Imaginez que vous voulez accéder rapidement à un container Docker en cours d'exécution sans devoir retenir son nom ou son ID. La fonction `dex` fait exactement cela. Elle liste tous les containers en cours d'exécution et vous laisse en choisir un pour y ouvrir une nouvelle session de terminal.

Il suffit donc de lancer `dex` dans votre terminal pour accéder à n'importe lequel de vos containers Docker actifs. C'est particulièrement utile quand plusieurs containers tournent en même temps et que vous voulez sauter dans l'un d'eux sans chercher son nom ou son ID.

![Utiliser dex pour ouvrir une nouvelle session de terminal dans un container Docker en cours d'exécution](./images/dex.webp)

<AlertBox variant="tip" title="Modifier la commande avant de l'exécuter">
Appuyez sur Entrée pour sélectionner le container et démarrer la session, ou sur Ctrl+E pour récupérer la commande dans votre prompt et la modifier — pratique si vous voulez l'ajuster avant de la lancer, par exemple pour désactiver l'entrypoint ou monter un volume.
</AlertBox>

<AlertBox variant="tip" title="Accès root">
Appuyez sur <kbd>Ctrl</kbd>+<kbd>R</kbd> pendant la sélection d'un container avec `dex` pour ouvrir la session en root. Utile quand vous devez effectuer des tâches d'administration dans le container qui exigent des privilèges élevés.
</AlertBox>

<AlertBox variant="tip" title="Filtrage">
Lancez `dex any_pattern` pour ne garder dans la liste que les containers correspondant à ce motif.
</AlertBox>

## Arrêter un ou plusieurs containers Docker en cours d'exécution {#stop-one-or-more-running-docker-containers}

`dstop` est une autre fonction bien utile : elle permet d'arrêter un ou plusieurs containers Docker actifs. Comme `dex`, elle utilise `fzf` pour offrir une interface interactive de sélection des containers à arrêter. Vous pouvez en sélectionner plusieurs grâce à la multi-sélection de `fzf`, c'est-à-dire en appuyant sur <kbd>Tab</kbd> pour cocher plusieurs containers avant d'appuyer sur <kbd>Enter</kbd> pour les arrêter.

Appuyez sur <kbd>CTRL</kbd>+<kbd>A</kbd> pour sélectionner tous les containers d'un coup.

Dans le panneau de droite, vous voyez les informations du ou des containers sélectionnés : nom, image, statut et ports. Cela vous aide à décider en connaissance de cause lesquels arrêter. Vous voyez aussi la consommation de ressources en direct (CPU, mémoire, I/O réseau, I/O disque), de quoi repérer les containers les plus gourmands avant de les arrêter.

![Utiliser dstop pour arrêter un ou plusieurs containers Docker en cours d'exécution](./images/dstop.webp)

## Accéder aux logs d'un container Docker en cours d'exécution {#access-logs-of-a-running-docker-container}

La fonction `dlogs` permet d'accéder aux logs d'un container Docker actif. Elle utilise également `fzf` pour proposer une interface interactive de sélection du container dont vous voulez voir les logs.

Dans le panneau de droite, vous voyez les logs du container sélectionné en temps réel. Très pratique pour le debug : vous suivez les logs au fur et à mesure. La molette de votre souris permet de les faire défiler.

![La fonction dlogs pour accéder aux logs d'un container Docker en cours d'exécution](./images/dlogs.webp)

## Nettoyer les containers, images, volumes et réseaux Docker inutilisés {#clean-up-unused-docker-containers-images-volumes-and-networks}

La fonction dnuke joue le rôle d'un **assistant de nettoyage Docker** intelligent et interactif, conçu pour récupérer de l'espace disque sans risquer de supprimer des ressources à l'aveugle. Contrairement à un simple `docker system prune`, `dnuke` commence par analyser votre environnement et vous présente un **plan d'exécution** dynamique, qui montre exactement ce qui peut être nettoyé (containers arrêtés, images dangling, volumes inutilisés et cache de build).

Le nettoyage se fait par étapes fines, ce qui vous permet d'ignorer certaines catégories si besoin. Par défaut, la fonction reste en mode « safe » et ne cible que les images dangling (sans tag).

`dnuke` accepte des flags CLI pour adapter son comportement :

<StepsCard
  variant="remember"
  title="Les flags de dnuke"
  steps={[
    { content: "**Nettoyage en profondeur** — `dnuke -a` (ou `--all`) supprime **toutes** les images inutilisées, pas seulement les dangling (comme `docker image prune -a`)." },
    { content: "**Non interactif** — `dnuke -y` (ou `--force`) court-circuite l'assistant et confirme automatiquement toutes les étapes." },
    { content: "**Aide** — `dnuke --help` affiche la liste complète des options et des exemples d'utilisation." }
  ]}
/>

Si l'environnement est déjà propre, l'assistant le détecte immédiatement et s'arrête sans poser de questions inutiles.

![Afficher l'aide de dnuke pour voir les options disponibles](./images/dnuke_help.webp)

![Lancer dnuke pour nettoyer les ressources Docker inutilisées](./images/dnuke.webp)

## Créer un nouveau container {#creating-a-new-container}

La dernière fonction est `drun` : elle affiche la liste des images existantes et crée un nouveau container à partir de celle que vous choisissez.

<AlertBox variant="tip" title="Filtrage">
Lancez `drun any_pattern` pour ne garder dans la liste que les images correspondant à ce motif.
</AlertBox>


## Une seule pour les gouverner toutes {#one-to-rule-them-all}

La fonction `dops` est un wrapper autour des autres fonctions. Elle vous donne accès rapidement à toutes les autres avec une seule commande. Lancez simplement `dops` dans votre terminal : la liste des fonctions disponibles s'affiche. Vous choisissez celle qui vous intéresse et elle exécute la commande correspondante.

Éditez maintenant votre fichier `~/.zshrc` et ajoutez la ligne suivante pour sourcer le fichier `docker.zsh` : `[[ -f ~/.zsh/docker.zsh ]] && source ~/.zsh/docker.zsh`. Les fonctions seront alors disponibles dans votre terminal.

![Utiliser dops pour accéder au menu interactif des fonctions de gestion Docker](./images/dops.webp)

<AlertBox variant="tip" title="Quand vous ne savez pas encore quel container">
`dex`, `dstop` et `dlogs` supposent que vous savez déjà quel container vous visez. Pour les moments où ce n'est pas le cas — cinq containers viennent de démarrer et il vous faut voir CPU, mémoire et logs côte à côte pour identifier le fautif — un dashboard vaut mieux qu'un menu. C'est le rôle de <Link to="/blog/lazydocker">lazydocker, lancé dans un container</Link>.
</AlertBox>

## Comment l'installer {#how-to-install}

Éditez votre fichier `~/.zshrc` et ajoutez les lignes suivantes à la fin :

```zsh
fpath=(~/.zsh/docker-fns $fpath)

autoload -Uz _d_check_env _d_print_cmd _d_has_running_containers
autoload -Uz dex dlogs dnuke dops drun dstop

# Setup alias for the interactive menu
alias d='dops'

# Print quick reference menu only in interactive sessions to avoid breaking scripts
if [[ -o interactive ]]; then
    echo -e "\033[1;30mDocker Utils loaded:\033[0m"
    echo -e "  \033[0;36mdex\033[0m   (exec/root) \033[0;36mdlogs\033[0m (logs/json)    \033[0;36mdstop\033[0m (stop/kill)"
    echo -e "  \033[0;36mdnuke\033[0m (clean)     \033[0;36mdops\033[0m  (menu/alias \033[1;32md\033[0m) \033[0;36mdrun\033[0m  (create new container)"
fi
```

Créez ensuite le répertoire `~/.zsh/docker-fns` et déplacez-y les fichiers de chaque fonction (`dex`, `dlogs`, `dnuke`, `dops`, `drun`, `dstop`). Vos fonctions restent ainsi organisées et faciles à maintenir — le même pattern `fpath`/`autoload` est détaillé dans <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>.

<ProjectSetup folderName="~/.zsh/docker-fns" createFolder={true} >
  <Guideline>
    Éditez maintenant votre fichier `~/.zshrc` et ajoutez les lignes mentionnées plus haut dans l'article pour sourcer le fichier `docker.zsh` et rendre les fonctions disponibles dans votre terminal. Vous pourrez alors utiliser `dex`, `dlogs`, `dnuke`, `dops`, `drun` et `dstop` pour gérer vos containers Docker directement depuis le terminal.
  </Guideline>
  <Snippet filename="_d_check_env" source="./files/_d_check_env" />
  <Snippet filename="_d_print_cmd" source="./files/_d_print_cmd" />
  <Snippet filename="_d_has_running_containers" source="./files/_d_has_running_containers" />
  <Snippet filename="dex" source="./files/dex" />
  <Snippet filename="dlogs" source="./files/dlogs" />
  <Snippet filename="dnuke" source="./files/dnuke" />
  <Snippet filename="dops" source="./files/dops" />
  <Snippet filename="drun" source="./files/drun" />
  <Snippet filename="dstop" source="./files/dstop" />
</ProjectSetup>
