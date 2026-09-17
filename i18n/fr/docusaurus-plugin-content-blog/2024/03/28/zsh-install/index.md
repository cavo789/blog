---
slug: zsh-install
title: Comment installer Oh-My-ZSH
date: 2024-03-28
description: Installez Zsh et Oh-My-ZSH facilement ! Apprenez à booster votre terminal Linux avec le thème Powerlevel10k, des fonctions comme take et les fonctionnalités indispensables au quotidien.
authors: [christophe]
image: /img/v2/zsh.webp
series: Customize your shell with ZSH
mainTag: zsh
tags:
  - customization
  - linux
  - wsl
  - zsh
language: fr
updates:
  - date: 2026-02-04
    note: still accurate, no obsolete info
  - date: 2026-08-22
    note: added a Docker-first demo to try Oh-My-Zsh before installing it
---
![Comment installer Oh-My-ZSH](/img/v2/zsh.webp)

<TLDR>
Cet article détaille l'installation de Zsh et Oh My Zsh sur Linux, puis l'amélioration du prompt avec le thème Powerlevel10k et la suppression de l'affichage par défaut du nom d'utilisateur et de la machine. Il met aussi en avant quelques fonctionnalités du quotidien à connaître : la fonction `take` pour créer un dossier et y entrer en une seule étape, les enchaînements `cd ...` pour remonter plusieurs dossiers parents, l'autocomplétion avec <kbd>TAB</kbd>, et les alias Git comme `gst` et `gwip`.
</TLDR>

ZSH est une alternative puissante au Bash de Linux qui offre de nombreuses fonctionnalités : autocomplétion (j'adore ça), plugins et même thèmes.

*Une fois installé, deux articles vont plus loin : <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link> pour éviter que votre `.zshrc` devienne un monstre, et <Link to="/blog/zsh-docker-functions">ZSH Functions - Customizing Your Shell for Docker Management</Link>.*

L'idée ici est de booster votre console Linux : améliorer la ligne de commande (par ex. de nouveaux alias disponibles immédiatement) et rendre l'apparence encore plus agréable.

J'utilise [Oh My ZSH](https://ohmyz.sh/) depuis des années ; voyons comment l'installer, puis découvrons quelques fonctionnalités.

<!-- truncate -->

## Où on va {#where-were-going}

Voici mon prompt une fois Zsh, Oh-My-Zsh et le thème Powerlevel10k en place :

![Powerlevel10k - Prompt sans nom d'utilisateur](./images/powerlevel10k_prompt_no_user.webp)

D'un coup d'œil, je sais que je suis dans mon dossier `blog`, qu'il s'agit d'un repository Git, que je suis sur la branch `main` et que `?1` signifie qu'un fichier *untracked* ou *modifié* attend sur mon ordinateur, pas encore poussé sur GitHub. Aucune commande tapée, aucun `git status` lancé : l'information est simplement là, rafraîchie à chaque prompt.

## Pourquoi ça vaut les dix minutes {#why-its-worth-the-ten-minutes}

- **Oh-My-Zsh est un framework, pas un thème.** Il embarque des centaines d'alias et de fonctions dès l'installation : vous y gagnez avant même d'avoir configuré quoi que ce soit.
- **Le prompt devient un tableau de bord.** Dossier, repository, branch et nombre de modifications en attente sont affichés en permanence, c'est-à-dire exactement l'état que vous vérifiez sans cesse à la main.
- **L'autocomplétion est d'un autre niveau.** <kbd>TAB</kbd> liste les sous-dossiers, les flags des commandes et les branches Git, au lieu de simplement compléter un nom de fichier.

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant de toucher à votre `~/.zshrc`, lancez un container jetable et jouez réellement avec Oh-My-Zsh.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Un container vous permet de ressentir ce que change Oh-My-Zsh — le prompt, les alias, les astuces du quotidien ci-dessous — sans changer votre shell de connexion ni modifier le moindre fichier sur votre machine. Ça ne vous plaît pas ? Supprimez le container, il ne reste rien.
</AlertBox>

Voici le Dockerfile que j'ai préparé. Il installe Oh-My-Zsh sans intervention et prépare aussi un petit
terrain de jeu : une arborescence profonde pour essayer `cd ...`, et un repository git avec un commit et un
fichier untracked pour que `gst` ait quelque chose à montrer :

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez-le et lancez-le :

<Terminal title="user@machine: ~/zsh-demo">
$ docker build -t zsh-demo .
[+] Building 22.1s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it zsh-demo
🐳 root ~/demo/a/b/c/d/e/f #
</Terminal>

Vous arrivez directement dans `/root/demo/a/b/c/d/e/f` — six dossiers de profondeur, repo git déjà
initialisé. Essayez tout de suite les fonctionnalités de la section suivante :

<Terminal title="🐳 root ~/demo/a/b/c/d/e/f #">
$ cd ......
🐳 root ~/demo/a #

$ gst
On branch main
Untracked files:
  notes.txt

$ take /tmp/scratch
🐳 root /tmp/scratch #
</Terminal>

`cd ......` (six points) remonte cinq dossiers parents d'un coup. `gst` affiche le fichier untracked `notes.txt`
sans que vous tapiez `git status` — ça fonctionne depuis n'importe quelle profondeur du repo, puisque Git remonte
tout seul jusqu'à trouver `.git`. `take` crée `/tmp/scratch` et vous y place. Appuyez sur <kbd>TAB</kbd>
après `cd ` pour voir l'autocomplétion des dossiers en action.

## Installation {#installation}

L'installation est assez simple, seulement trois commandes :

<Terminal typewriter>
$ sudo apt-get update && sudo apt-get install zsh
$ chsh -s /usr/bin/zsh
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
</Terminal>

À la dernière instruction, on vous demandera si vous voulez faire de zsh votre shell par défaut ; répondez simplement `Y`es.

Et très vite, vous voyez un changement dans votre console :

![ZSH a été installé](./images/zsh_install.webp)

Le premier changement concerne le prompt. Là, je suis dans mon dossier blog et c'est un repository git. Oh-My-ZSH m'affiche donc cette info et, en plus, la branch sur laquelle je travaille (la branch `master` ici).

Sympa, mais on peut faire beaucoup mieux.

Il est temps d'installer un moteur de templates appelé Powerlevel10k ([https://github.com/romkatv/powerlevel10k](https://github.com/romkatv/powerlevel10k)). Si vous préférez l'essayer dans un container jetable avant de toucher à votre machine, lisez <Link to="/blog/powerlevel10k_sandbox">Personnalisez votre prompt Linux avec Powerlevel 10k</Link>. Dans le paragraphe suivant, j'installe Powerlevel10k sur mon ordinateur, alors allons-y.

### Powerlevel10k {#powerlevel10k}

L'installation est simple aussi, lancez juste `git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k` dans votre console. Vous téléchargerez ainsi le template.

La deuxième action consiste à éditer le fichier `~/.zshrc`. Comme j'utilise VSCode, je le démarre, j'appuie sur <kbd>CTRL</kbd>+<kbd>O</kbd> et j'ouvre le fichier `~/.zshrc`.

Cherchez `ZSH_THEME` et mettez la valeur `powerlevel10k/powerlevel10k`.

![Thème ZSH](./images/zsh_theme.webp)

Dernière étape : fermez votre console Linux actuelle et ouvrez-en une nouvelle. La première fois, vous obtiendrez l'assistant de configuration de Powerlevel10k :

![Configuration de ZSH](./images/zsh_configuration.webp)

Répondez à toutes les questions et, quand il s'agit de définir vos préférences, choisissez simplement l'option qui vous plaît le plus.

![ZSH - Définissez vos préférences](./images/zsh_preferences.webp)

Une fois terminé, voici à quoi ressemble mon prompt :

![Powerlevel10k - Nouveau prompt](./images/powerlevel10k_prompt.webp)

Et c'est tellement mieux (et bien plus joli). En un instant, je sais que je suis dans mon dossier `blog`, qu'il s'agit d'un repository Git, que je suis sur la branch `main` et `?1` signifie que j'ai un fichier *untracked* ou *modifié* sur mon ordinateur, pas encore poussé sur le repo central (GitHub ici).

À droite, on voit que je suis connecté en tant que `root` sur ma machine. C'est affiché en rouge justement pour indiquer que j'ai les accès root.

#### Personnaliser le prompt {#customizing-the-prompt}

Bon, supprimons cette partie puisque, oui, c'est mon ordinateur personnel, il est normal que je sois root ici car je n'ai qu'un seul compte local — cette information n'a donc aucun intérêt pour moi.

Powerlevel10k a une excellente documentation et en lisant [How do I add username and/or hostname to prompt?](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#how-do-i-add-username-andor-hostname-to-prompt), on apprend comment le retirer de la même manière.

Éditez simplement le fichier `~/.p10k.zsh`, cherchez `POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS` puis trouvez son entrée `context` et commentez la ligne. Sauvegardez le fichier, ouvrez une nouvelle console et bingo, la partie droite du prompt ne contient plus le nom d'utilisateur — vous avez maintenant sous les yeux le prompt montré en haut de cet article.

## Quelques fonctionnalités que j'utilise tous les jours {#some-features-i-use-daily}

Vous pourriez penser que ces fonctionnalités ne sont pas nécessaires, mais le fait est que je les utilise énormément dans mon travail quotidien.

Par exemple, `take /tmp/new_folder` crée le dossier s'il n'existe pas encore et vous y place.

Soyons honnêtes, `take /tmp/new_folder` est plus simple et plus rapide que `mkdir -p /tmp/new_folder && cd $_`, non ?

<AlertBox variant="info" title="Take n'est qu'une fonction personnalisée">
`take` est en fait une fonction définie dans le fichier `~/.oh-my-zsh/lib/functions.zsh`.

</AlertBox>

Une deuxième fonctionnalité, tellement bête mais tellement précieuse : `cd ..` suivi de deux, trois ou ... points.

Imaginez que vous soyez dans le dossier `/tmp/new_folder/a/b/c/d/e/f` et que vous vouliez utiliser `cd ..` pour revenir au parent `a`. Avec ZSH, je peux simplement taper `cd ......` et c'est génial. `cd ..` remonte au premier parent, `cd ...` au grand-parent et ainsi de suite.

Il y a aussi une fonctionnalité clé de ZSH : <kbd>TAB</kbd>. Imaginez que vous soyez dans un dossier contenant plusieurs sous-dossiers. Tapez juste `cd ` (l'espace est vraiment important) et appuyez sur <kbd>TAB</kbd>. Vous obtenez alors la liste des sous-dossiers. Naviguez entre les suggestions avec <kbd>TAB</kbd> et appuyez sur <kbd>ENTER</kbd> pour en choisir un.

![ZSH - CD avec tab](./images/zsh_cd.webp)

Puis continuez, appuyez encore sur <kbd>TAB</kbd> et vous pourrez sélectionner un sous-dossier, et ainsi de suite.

![ZSH - CD avec tab](./images/zsh_cd_again.webp)

<kbd>TAB</kbd> est donc utilisé par ZSH pour l'autocomplétion. Essayons autre chose : `head -` suivi de <kbd>TAB</kbd>. Comme vous le voyez ci-dessous, j'obtiens la liste des flags que je peux utiliser, je peux naviguer toujours avec <kbd>TAB</kbd> et continuer à taper ma ligne de commande.

![ZSH - autocomplétion de la commande head](./images/zsh_head_autocompletion.webp)

Côté alias, celui que j'utilise plusieurs fois par jour est `gst` pour `git status`. Vous pouvez retrouver la liste de tous les alias Git dans votre fichier `/root/.oh-my-zsh/plugins/git/git.plugin.zsh`. Un bon exemple est `gwip` qui commite tous vos changements en tant que `work in progress`, ce qui vous permet de mettre de côté votre travail en cours, de basculer sur une autre branch (par ex. pour travailler sur une issue) et, une fois terminé, de revenir sur votre branch de feature et de récupérer votre travail. Facile.

Et bien sûr, il y en a d'autres — je ne sais probablement même plus qu'ils font partie de ZSH.

## Conclusion {#conclusion}

Trois commandes installent Zsh et Oh-My-Zsh, un `git clone` et une ligne `ZSH_THEME` apportent le prompt Powerlevel10k, et une seule entrée commentée dans `~/.p10k.zsh` supprime le bruit inutile. Ensuite, les gains sont permanents : `take`, `cd ...`, la complétion avec <kbd>TAB</kbd> et `gst` se tapent des dizaines de fois par jour sans même y penser.

Il y a encore beaucoup, beaucoup plus, comme les <Link to="/blog/tags/zsh">plugins</Link>. Prochaine étape : <Link to="/blog/zsh-plugin-autosuggestions">zsh-autosuggestions</Link> et <Link to="/blog/zsh-syntax-highlighting">zsh-syntax-highlighting</Link>, deux incontournables une fois Oh-My-Zsh en place.
