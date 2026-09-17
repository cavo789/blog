---
slug: ssh-with-fuzzy-finder
title: Maîtrisez votre commande ssh et choisissez l'host dans une liste
date: 2026-04-27
authors: [christophe]
image: /img/v2/sshf.webp
series: Modern CLI tools for your terminal
description: Construisez un sélecteur d'hosts SSH interactif et filtrable avec FZF. Apprenez à modulariser vos configurations SSH, à y ajouter une documentation riche et à déclencher des actions personnalisées avancées via une interface terminal rapide.
mainTag: linux
tags:
  - bash
  - customization
  - fzf
  - linux
language: fr
blueskyRecordKey: 3mkhfxskcdk2z
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![Maîtrisez votre commande ssh et choisissez l'host dans une liste](/img/v2/sshf.webp)

<TLDR>Gérer des dizaines de connexions serveur dans un fichier `~/.ssh/config` monolithique devient vite impossible à maintenir et repose beaucoup trop sur la mémoire. Cet article présente une approche plus propre : découper votre configuration en fichiers par projet dans un dossier `~/.ssh/conf.d/`, ce qui vous permet d'attacher une documentation riche et mise en forme juste au-dessus de vos définitions d'hosts. Pour lier le tout, vous allez écrire une fonction shell personnalisée (sshf) propulsée par FZF. Vous obtenez une interface terminal (TUI) rapide et filtrable qui vous laisse trouver instantanément un host par nom, par projet ou par métadonnée. On va même plus loin avec des raccourcis clavier personnalisés, qui permettent de déclencher des actions contextuelles avancées — pinguer des serveurs, modifier des configurations ou générer des inventaires système — directement depuis le menu de recherche.</TLDR>

Sur ma machine, j'ai accumulé de plus en plus d'hosts dans mon fichier `~/.ssh/config`. Je peux bien taper `ssh server4` (voir <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions</Link>) pour me connecter à ce serveur, mais il faut encore que je me souvienne de la liste des serveurs disponibles. Ça reste gérable avec quelques-uns, mais j'en ai aujourd'hui une cinquantaine, et se fier uniquement à sa mémoire n'est plus tenable.

Ce serait bien plus pratique de voir la liste complète des hosts dans une TUI (*Terminal User Interface*), de sélectionner celui qu'on veut et d'appuyer simplement sur <kbd>Enter</kbd>. Et ce serait encore mieux d'avoir accès à des informations contextuelles : l'URL hébergée sur ce serveur, la présence d'une base de données, la version de PHP, etc.

En prime, créer un fichier `.conf` par projet évite de maintenir un énorme fichier de configuration monolithique contenant les 50 serveurs. Voyons comment mettre tout ça en place.

*Cet article s'appuie sur <Link to="/blog/linux-fzf-introduction">Introduction to fzf - Fuzzy Finder</Link> et sur les alias créés dans <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>. Il applique à `~/.ssh/config` la même philosophie « un fichier par sujet » que <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>.*

<!-- truncate -->

Avant d'entrer dans les détails techniques, voici un aperçu du résultat final :

![Notre TUI sshf](./images/tui.webp)

À gauche, une zone de recherche (je peux y taper `amazing` pour filtrer sur ce motif) au-dessus d'une liste d'hosts. À droite, les informations contextuelles de l'host sélectionné.

Une fois l'host choisi, j'appuie simplement sur <kbd>Enter</kbd> pour ouvrir une session SSH sur cet host — sans devoir saisir mes identifiants à la main.

C'est parti...

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Avant de toucher à votre propre `~/.ssh/config`, essayez toute la TUI dans un container jetable — les fichiers `amazing.conf`/`legacy.conf` exacts et la fonction `sshf` décrits plus bas y sont déjà en place.

<AlertBox variant="tip" title="Pourquoi commencer par Docker ?">
Le Dockerfile ci-dessous installe `fzf`, `perl` et `openssh-client`, écrit les fichiers de configuration SSH exacts présentés plus bas, et ajoute la fonction `sshf` exacte à `~/.bashrc`. Rien ne change sur votre machine, et — puisque `1.2.3.4` et consorts sont les mêmes IP fictives utilisées tout au long de cet article — appuyer sur <kbd>Enter</kbd> sur un host ne vous connectera nulle part.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez-le et lancez-le :

<Terminal title="user@machine: ~/sshf-demo">
$ docker build -t sshf-demo .
[+] Building 26.4s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it sshf-demo
🐳 root ~ # sshf
</Terminal>

La même TUI que sur la capture en haut de cet article s'ouvre, listant les quatre hosts des deux fichiers `conf.d` avec leurs doc-blocks. Tapez `prod` ou `php` pour filtrer, exactement comme dans la section « Utiliser les options de filtrage » plus bas — aucun serveur réel n'est jamais contacté.

## Installer FZF {#install-fzf}

Consultez mon précédent article <Link to="/blog/linux-fzf-introduction">Fuzzy Finder</Link> si vous voulez plus de détails. Sinon, lancez simplement la commande ci-dessous et terminez l'installation en répondant « Yes » à toutes les questions, en suivant les instructions affichées dans votre terminal.

<Terminal typewriter wrap={true}>
$ git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf ; ~/.fzf/install
</Terminal>

Ça n'a pas de rapport direct avec SSH, mais vous pouvez dès maintenant appuyer sur <kbd>CTRL</kbd>+<kbd>R</kbd> pour accéder bien plus facilement à l'historique de votre console. Ce n'est qu'une des excellentes fonctionnalités de FZF.

## Configuration SSH {#ssh-configuration}

L'objectif ici est d'organiser votre configuration plus intelligemment. Créons un dossier `~/.ssh/conf.d` où vivront vos fichiers de configuration.

<Terminal typewriter wrap={true}>
$ mkdir -p ~/.ssh/conf.d
</Terminal>

Par exemple, créez un fichier `~/.ssh/conf.d/amazing.conf` avec le contenu suivant :

<Snippet filename="amazing.conf" source="./files/amazing.conf" defaultOpen={false} />

Créez ensuite un second fichier nommé `~/.ssh/conf.d/legacy.conf` avec ce contenu :

<Snippet filename="legacy.conf" source="./files/legacy.conf" defaultOpen={false} />

Mettez maintenant à jour votre fichier `~/.ssh/config` principal pour inclure ces nouveaux fichiers :

```conf
Include conf.d/amazing.conf
Include conf.d/legacy.conf
```

Cette approche vous permet simplement de regrouper les hosts par projet, ce qui les rend plus faciles à gérer.

### Regardons le fichier amazing.conf {#look-at-the-amazingconf-file}

Nous avons défini trois entrées `Host` : `MyAmazingApp_PROD`, `MyAmazingApp_TEST` et `YourAmazingApp`.

Remarquez les commentaires ajoutés juste avant les deux premières lignes `Host` (l'emplacement est crucial).

Ce « doc-block » est du texte brut, vous y écrivez donc ce que vous voulez. Pour plus de confort, il supporte des marqueurs comme `blue`, `green`, `red`, `yellow`, `bg-red`, `bg-yellow` et `bold`.

Quand l'host `MyAmazingApp_PROD` est sélectionné dans la TUI, son doc-block associé s'affiche automatiquement.

## Ajouter la fonction sshf {#add-the-sshf-function}

Pour un test rapide, vous pouvez simplement coller ceci dans votre `~/.bashrc` (ou `~/.zshrc`) ; mais si vous découpez déjà votre configuration shell en morceaux (voir <Link to="/blog/modular-zsh-workflow">Au-delà du monolithe</Link>), c'est un candidat parfait pour son propre fichier de fonction autoloadé.

Éditez votre fichier `~/.bashrc` (ou `~/.zshrc`) et ajoutez-y cette fonction :

<Snippet source="./files/sshf.zsh" defaultOpen={false} />

Enregistrez le fichier et appliquez les changements avec `source ~/.bashrc` (ou `source ~/.zshrc`).

Retournez dans votre terminal, tapez `sshf` et appuyez sur <kbd>Enter</kbd>. La magie opère.

Vous voyez la liste complète des hosts définis. En tapant quelques lettres, vous filtrez instantanément. Par exemple, tapez `prod` pour n'afficher que les serveurs de production.

Facile, non ?

## Utiliser les options de filtrage {#using-filtering-options}

Vous pouvez filtrer sur n'importe quel motif. Par exemple, si vous tapez `php` :

![Filtrage sur les serveurs PHP](./images/php.webp)

FZF cherche dans toutes les données disponibles, pas seulement dans les noms d'hosts.

## Mon cas d'usage réel {#my-real-use-case}

Au boulot, je suis allé bien plus loin que le simple affichage d'une liste d'hosts. FZF supporte les raccourcis clavier personnalisés : vous pouvez donc associer des actions à d'autres touches que <kbd>Enter</kbd>. Vous pouvez définir des actions déclenchées par <kbd>CTRL</kbd>+<kbd>A</kbd>, <kbd>CTRL</kbd>+<kbd>I</kbd>, ou même une simple lettre comme <kbd>E</kbd>.

C'est là que ça devient vraiment puissant !

<ShortcutList
  items={[
    { keys: ["Ctrl", "A"], desc: "J'ai mis en place un second écran qui affiche une liste d'actions à exécuter sur l'host sélectionné." },
    { keys: ["Ctrl", "I"], desc: "Je lance un script de gestion d'inventaire qui scanne tous mes hosts (ou seulement ceux filtrés) et génère une page web avec un inventaire à jour des logiciels installés (versions de PHP, Python, PostgreSQL...)." },
    { keys: ["E"], desc: "Vous pourriez, par exemple, ouvrir un éditeur pour modifier directement le fichier de configuration de l'host sélectionné." },
  ]}
/>

<Snippet source="./files/sshf_actions.zsh" defaultOpen={false} />

![Utilisation des raccourcis clavier](./images/tui_with_actions.webp)

Seule votre imagination vous limite !
