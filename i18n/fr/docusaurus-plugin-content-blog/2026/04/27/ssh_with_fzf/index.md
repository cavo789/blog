---
slug: ssh-with-fuzzy-finder
title: Maîtrisez votre commande ssh et choisissez l'host dans une liste
date: 2026-04-27
authors: [christophe]
image: /img/v2/sshf.webp
series: Modern CLI tools for your terminal
description: Construisez un sélecteur d'hosts SSH interactif et filtrable avec FZF. Apprenez à modulariser vos configurations SSH, à ajouter une documentation riche et à déclencher des actions personnalisées avancées via une interface terminal rapide.
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
  - date: 2026-11-08
    note: "sshf now installs as its own file, ~/.zsh/fns or ~/.bash/fns, with a zsh/bash tab and its loader loop."
---
![Maîtrisez votre commande ssh et choisissez l'host dans une liste](/img/v2/sshf.webp)

<TLDR>Gérer des dizaines de connexions serveur dans un fichier `~/.ssh/config` monolithique devient vite ingérable et repose trop sur la mémoire. Cet article montre une approche plus propre : découper votre configuration en fichiers par projet dans un dossier `~/.ssh/conf.d/`, ce qui permet d'attacher une documentation riche et stylée juste au-dessus de vos définitions d'hosts. Pour lier le tout, vous allez écrire une fonction shell personnalisée (sshf) propulsée par FZF. Vous obtenez une interface terminal (TUI) rapide et filtrable pour trouver instantanément un host par nom, projet ou métadonnée. On va même plus loin avec des raccourcis clavier personnalisés, qui déclenchent des actions contextuelles avancées — pinguer des serveurs, modifier des configurations ou générer des inventaires système — directement depuis le menu de recherche.</TLDR>

Sur ma machine, j'ai accumulé de plus en plus d'hosts dans mon fichier `~/.ssh/config`. Je peux taper `ssh server4` (voir <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions</Link>) pour sauter sur ce serveur, mais je dois encore me souvenir de la liste des serveurs disponibles. C'est gérable avec quelques-uns, mais j'en ai actuellement une cinquantaine, et compter uniquement sur sa mémoire n'est plus réaliste.

Il serait bien plus pratique d'afficher la liste complète des hosts dans une TUI (*Terminal User Interface*), de sélectionner celui qu'on veut et d'appuyer simplement sur <kbd>Enter</kbd>. En plus, ce serait très utile d'avoir des informations contextuelles : l'URL hébergée sur ce serveur, la présence d'une base de données, la version de PHP, etc.

Enfin, créer un fichier `.conf` par projet éviterait de maintenir un énorme fichier de configuration monolithique contenant les 50 serveurs. Voyons comment mettre tout cela en place.

*Cet article s'appuie sur <Link to="/blog/linux-fzf-introduction">Introduction to fzf - Fuzzy Finder</Link> et sur les alias créés dans <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>. Il applique à `~/.ssh/config` la même philosophie « un fichier par sujet » que <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>.*

<!-- truncate -->

Avant d'entrer dans les détails techniques, voici un aperçu du résultat final :

![Notre TUI sshf](./images/tui.webp)

À gauche, une zone de recherche (je peux taper `amazing` pour filtrer sur ce motif) au-dessus d'une liste d'hosts. À droite, les informations contextuelles sur l'host sélectionné.

Une fois l'host choisi, j'appuie sur <kbd>Enter</kbd> pour ouvrir une session SSH dessus — sans devoir saisir mes identifiants à la main.

C'est parti...

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Avant de toucher à votre propre `~/.ssh/config`, essayez toute la TUI dans un container jetable — les fichiers `amazing.conf`/`legacy.conf` exacts et la fonction `sshf` décrite plus bas y sont déjà en place.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `fzf`, `perl` et `openssh-client`, écrit les fichiers de configuration SSH exacts montrés plus bas, et ajoute la fonction `sshf` exacte à `~/.bashrc`. Rien ne change sur votre propre machine et — puisque `1.2.3.4` et consorts sont les mêmes IP d'exemple utilisées tout au long de l'article — appuyer sur <kbd>Enter</kbd> sur un host ne vous connectera nulle part.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez :

<Terminal title="user@machine: ~/sshf-demo">
$ docker build -t sshf-demo .
[+] Building 26.4s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it sshf-demo
🐳 root ~ # sshf
</Terminal>

La même TUI que sur la capture en haut de l'article s'ouvre, avec les quatre hosts des deux fichiers `conf.d` et leurs doc-blocks. Tapez `prod` ou `php` pour filtrer, exactement comme dans la section « Utiliser les options de filtrage » plus bas — aucun serveur réel n'est jamais contacté.

## Installer FZF {#install-fzf}

Consultez mon article <Link to="/blog/linux-fzf-introduction">Fuzzy Finder</Link> si vous avez besoin de plus de détails. Sinon, lancez simplement la commande ci-dessous et terminez l'installation en répondant « Yes » à toutes les questions, en suivant les instructions affichées dans votre terminal.

<Terminal typewriter wrap={true}>
$ git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf ; ~/.fzf/install
</Terminal>

Ce n'est pas lié à SSH, mais vous pouvez désormais appuyer sur <kbd>CTRL</kbd>+<kbd>R</kbd> pour accéder bien plus facilement à l'historique de votre console. Ce n'est qu'une des très bonnes fonctionnalités de FZF.

## Configuration SSH {#ssh-configuration}

L'objectif ici est d'organiser votre configuration plus intelligemment. Créons un dossier `~/.ssh/conf.d` qui contiendra vos fichiers de configuration.

<Terminal typewriter wrap={true}>
$ mkdir -p ~/.ssh/conf.d
</Terminal>

Par exemple, créez un fichier `~/.ssh/conf.d/amazing.conf` avec le contenu suivant :

<Snippet filename="amazing.conf" source="./files/amazing.conf" defaultOpen={false} />

Créez ensuite un second fichier nommé `~/.ssh/conf.d/legacy.conf` avec ce contenu :

<Snippet filename="legacy.conf" source="./files/legacy.conf" defaultOpen={false} />

Mettez maintenant à jour votre fichier principal `~/.ssh/config` pour inclure ces nouveaux fichiers :

```conf
Include conf.d/amazing.conf
Include conf.d/legacy.conf
```

Cette approche vous permet simplement de regrouper les hosts par projet, ce qui les rend plus faciles à gérer.

### Regardons le fichier amazing.conf {#look-at-the-amazingconf-file}

Nous avons défini trois entrées `Host` : `MyAmazingApp_PROD`, `MyAmazingApp_TEST` et `YourAmazingApp`.

Remarquez que nous avons ajouté des commentaires juste avant les deux premières lignes `Host` (l'emplacement est crucial).

Ce « doc-block » est du texte brut, vous pouvez donc y écrire ce que vous voulez. Pour plus de confort, il prend en charge des marqueurs comme `blue`, `green`, `red`, `yellow`, `bg-red`, `bg-yellow` et `bold`.

Quand l'host `MyAmazingApp_PROD` est sélectionné dans la TUI, son doc-block associé s'affiche automatiquement.

## Ajouter la fonction sshf {#add-the-sshf-function}

`sshf` a son propre fichier, dans un dossier que votre shell charge au démarrage (l'organisation expliquée dans <Link to="/blog/modular-zsh-workflow">Au-delà du monolithe</Link>) : votre fichier rc reste court, et désinstaller l'outil revient à supprimer un fichier.

<Snippet filename="sshf.sh" source="./files/sshf.zsh" defaultOpen={false} />

Le code est identique pour zsh et bash ; seuls le dossier et le loader changent.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="sshf.zsh" source="./files/sshf.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi un de mes articles « Ollama au quotidien ». Sinon, ajoutez à la fin de `~/.zshrc` :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Créez le fichier** dans `~/.bash/fns/` :

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="sshf.sh" source="./files/sshf.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez à la fin de `~/.bashrc` (le test `-r` évite une erreur si le dossier est vide) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type sshf` doit répondre `sshf is a shell function`.

Retournez dans votre terminal, tapez `sshf` et appuyez sur <kbd>Enter</kbd>. La magie opère.

Vous verrez la liste complète des hosts définis. En tapant quelques lettres, vous filtrez instantanément. Par exemple, tapez `prod` pour n'afficher que les serveurs de production.

Facile, non ?

## Utiliser les options de filtrage {#using-filtering-options}

Vous pouvez filtrer sur n'importe quel motif. Par exemple, si vous tapez `php` :

![Filtrage sur les serveurs PHP](./images/php.webp)

FZF cherche dans toutes les données disponibles, pas seulement dans les noms d'hosts.

## Mon cas d'usage réel {#my-real-use-case}

Au boulot, je suis allé bien plus loin que le simple affichage d'une liste d'hosts. FZF prend en charge les raccourcis clavier personnalisés : vous pouvez associer des actions à d'autres touches que <kbd>Enter</kbd>. Vous pouvez définir des actions déclenchées par <kbd>CTRL</kbd>+<kbd>A</kbd>, <kbd>CTRL</kbd>+<kbd>I</kbd>, ou même une simple lettre comme <kbd>E</kbd>.

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

Votre imagination est la seule limite !
