---
slug: linux-fzf-introduction
title: Introduction à fzf - Fuzzy Finder
date: 2024-03-30
description: Maîtrisez la ligne de commande Linux avec fzf (Fuzzy Finder). Découvrez sa puissante recherche floue dans l'historique (CTRL+R) et sa sélection de fichiers (CTRL+T) pour booster votre productivité.
authors: [christophe]
image: /img/v2/linux_tips.webp
series: Modern CLI tools for your terminal
mainTag: linux
tags:
  - bash
  - customization
  - fzf
  - linux
language: fr
review_date: 2026-07-30
updates:
  - date: 2024-03-31
    note: Added a Keybindings section
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![Introduction à fzf - Fuzzy Finder](/img/v2/linux_tips.webp)

<TLDR>
Cet article présente `fzf` (Fuzzy Finder), qui améliore la recherche d'historique <kbd>CTRL</kbd>+<kbd>R</kbd> de la console avec une correspondance floue, lettres dans n'importe quel ordre, et ajoute <kbd>CTRL</kbd>+<kbd>T</kbd> pour sélectionner interactivement un ou plusieurs fichiers (utilisable avec des commandes comme `rm` ou `head`) ainsi que <kbd>ALT</kbd>+<kbd>C</kbd> pour sauter dans un dossier.
</TLDR>

Comme vous le savez sans doute, <kbd>CTRL</kbd>+<kbd>R</kbd> dans la console vous donne accès à votre HISTORIQUE, c'est-à-dire à la liste des commandes que vous avez tapées précédemment. Un peu comme les touches <kbd>UP</kbd> ou <kbd>DOWN</kbd>, mais avec un tout petit moteur de recherche.

Ça fait le job mais, honnêtement, c'est vraiment basique, non ?

L'utilitaire en ligne de commande Fuzzy Finder (alias `fzf`) va faire exploser les possibilités de recherche dans l'historique mais, en réalité, ce n'est qu'une des conséquences de l'installation de fzf, qui est bien plus puissant que ça.

*Trois articles de ce blog s'appuient directement sur `fzf` : <Link to="/blog/fzf-ripgrep">FZF + ripgrep: Interactive Code Search with Live Preview</Link>, <Link to="/blog/ssh-with-fuzzy-finder">Master your ssh command and select the host from a list</Link> et <Link to="/blog/zsh-docker-functions">ZSH Functions - Customizing Your Shell for Docker Management</Link>.*

Allons voir ça.

<!-- truncate -->

En appuyant sur <kbd>CTRL</kbd>+<kbd>R</kbd>, vous obtenez nativement une *recherche inversée* dans votre historique. Commencez à taper une commande comme `ls` dans mon exemple ci-dessous et Linux vous montrera la dernière commande utilisée.

![Using CTRL-R](./images/ctrl_r.webp)

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Avant de cloner quoi que ce soit sur votre machine, lancez un container jetable avec `fzf` déjà configuré et un petit terrain de jeu déjà construit.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `fzf`, active ses raccourcis clavier dans `bash`, pré-remplit un historique de shell (pour que <kbd>CTRL</kbd>+<kbd>R</kbd> ait quelque chose à chercher) et crée une poignée de fichiers de logs et de dossiers imbriqués (pour que <kbd>CTRL</kbd>+<kbd>T</kbd> et <kbd>ALT</kbd>+<kbd>C</kbd> aient quelque chose à parcourir). Rien à préparer vous-même.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez-le et lancez-le :

<Terminal title="user@machine: ~/fzf-demo">
$ docker build -t fzf-demo .
[+] Building 24.6s (9/9) FINISHED
 ✔ exporting to image

$ docker run --rm -it fzf-demo
🐳 root ~/demo #
</Terminal>

Vous êtes déjà dans `/root/demo`. Essayez tout de suite les trois raccourcis :

- Appuyez sur <kbd>CTRL</kbd>+<kbd>R</kbd> et tapez `github` — la ligne pré-enregistrée `git clone
  https://github.com/junegunn/fzf-git.sh.git` apparaît, exactement comme sur les captures d'écran ci-dessous.
- Appuyez sur <kbd>CTRL</kbd>+<kbd>T</kbd> et tapez `run` — les quatre fichiers `run*.sh.log` dans `logs/`
  apparaissent, filtrés en direct au fur et à mesure de la frappe.
- Appuyez sur <kbd>ALT</kbd>+<kbd>C</kbd> pour sauter dans `nested/deep/folder` sans taper un
  seul `cd`.
- Lancez `fzf -m | xargs head -n 5`, filtrez sur `run`, sélectionnez deux ou trois fichiers avec <kbd>TAB</kbd>,
  appuyez sur <kbd>ENTER</kbd> — le scénario de sélection multiple de la section « Obtenir une liste de fichiers »
  ci-dessous, prêt à tester sans rien supprimer de réel.

## Installation {#installation}

L'installation de `fzf` est simple, il suffit de lancer `git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && ~/.fzf/install` et de répondre `Y`es à deux questions.

Une fois terminé, fermez et relancez une nouvelle console (pour que Linux prenne en compte les modifications apportées à vos fichiers de configuration).

## Jouer avec l'historique {#playing-with-the-history}

Maintenant, appuyez à nouveau sur <kbd>CTRL</kbd>+<kbd>R</kbd> et vous obtiendrez quelque chose de bien meilleur :

![Using CTRL-R once FZF has been installed](./images/ctrl_r_fzf.webp)

Comme précédemment, commencez à taper la commande que vous souhaitez retrouver ; dans mon cas, je sais qu'un jour j'ai essayé d'installer un repo depuis github mais je ne me souviens plus de l'instruction, alors je vais commencer à taper `github` :

![Filtering on github](./images/ctrl_r_github.webp)

Si vous regardez l'image, vous verrez que `fzf` cherche les lettres `g`, `i`, `t`, `h`, `u` et `b`, pas le mot. La première ligne contient donc le mot `git`, puis il y a un `h` quelque part et le mot `public` donc, `ub` s'y trouvent.

C'est pratique puisque vous n'avez pas besoin de vous souvenir de l'ordre exact des mots dans votre ligne de commande précédente, tapez juste des mots dans n'importe quel ordre.

Pour moi, rien que pour cet usage, l'installation de `fzf` est déjà pleinement justifiée.

## Obtenir une liste de fichiers {#getting-a-list-of-files}

Imaginez que vous souhaitiez afficher le contenu d'un fichier : vous commencez à taper `cat` et, zut, vous ne vous souvenez plus du nom exact du fichier. En appuyant sur <kbd>CTRL</kbd>+<kbd>T</kbd>, vous obtiendrez la liste des fichiers du répertoire courant et de ses sous-répertoires :

![Using CTRL-T](./images/ctrl_t.webp)

Vous pouvez naviguer avec <kbd>UP</kbd> et <kbd>DOWN</kbd> mais aussi taper quelques lettres pour filtrer la liste.

Sur ma machine, en commençant à taper `doc`, j'obtiens la liste des fichiers, n'importe où dans l'arborescence, contenant `doc`. Je peux continuer et taper `doc.md` pour forcer la présence des lettres `md` et donc, dans mon cas, chercher des articles à propos de Docker ayant l'extension `.md`.

![Using CTRL-T and filtering on doc](./images/ctrl_t_doc.webp)

Cet usage est pratique puisque je n'ai pas besoin de retrouver d'abord le nom exact du fichier que je voulais utiliser. Dans cet exemple c'était pour `cat` mais, bien sûr, ça marche pour n'importe quoi : tapez votre commande et appuyez sur <kbd>CTRL</kbd>+<kbd>T</kbd>.

<AlertBox variant="note" title="`**` suivi de <kbd>TAB</kbd> est un alias">
Pas sûr que ce soit à retenir, mais `cat **` suivi de <kbd>TAB</kbd> fonctionnera exactement comme si vous appuyiez sur <kbd>CTRL</kbd>+<kbd>T</kbd>. Ici, `**` sera développé en <kbd>CTRL</kbd>+<kbd>T</kbd>.

</AlertBox>

Ici, avec <kbd>CTRL</kbd>+<kbd>T</kbd>, vous ne pourrez sélectionner qu'un seul fichier. Imaginez que vous vouliez en sélectionner plusieurs ? Par exemple, vous voulez lancer `rm` pour supprimer plus d'un fichier.

En lançant `fzf -m | xargs rm` suivi de <kbd>ENTER</kbd>, Fuzzy Finder affichera la liste de tous les fichiers présents dans le répertoire courant. Comme précédemment, je peux commencer à taper pour filtrer la liste. Dans mon exemple ci-dessous, j'ai tapé `run.sh.log` pour retrouver des logs et, dans la liste, j'appuie sur <kbd>TAB</kbd> pour sélectionner quatre fichiers (voyez le caractère `>` rouge à gauche). Ensuite j'appuie sur <kbd>ENTER</kbd> pour valider mon choix et... les fichiers ont été supprimés puisque ma commande était `rm`.

![Removing several files](./images/rm_several_files.webp)

Si je relance la même commande avec le même filtre, je vois que je ne récupère plus que trois fichiers, ceux que je n'avais pas sélectionnés. Le `rm` a bien fonctionné.

![Removing several files, second run](./images/rm_several_files_bis.webp)

Maintenant, au lieu de tuer des fichiers, je vais simplement afficher les cinq premières lignes de chaque fichier sélectionné : pour cela, je vais exécuter `fzf -m | xargs head -n 5`. Je filtre à nouveau sur `run.sh.log`, je sélectionne les trois fichiers avec <kbd>TAB</kbd>, j'appuie sur <kbd>ENTER</kbd> pour valider mon choix et tadaaa :

![Selecting several files](./images/head_several_files.webp)

## Raccourcis clavier {#keybindings}

<ShortcutList
  items={[
    { keys: ["Ctrl", "R"], desc: <>Affiche la liste des commandes que vous avez tapées précédemment (votre historique donc) et vous permet d'en sélectionner une en appuyant sur <kbd>ENTER</kbd>.</> },
    { keys: ["Ctrl", "T"], desc: <>Affiche la liste des fichiers du répertoire courant et de ses sous-dossiers, vous permet de sélectionner un ou plusieurs fichiers (appuyez simplement sur <kbd>TAB</kbd> pour une sélection multiple) puis appuyez sur <kbd>ENTER</kbd> pour renvoyer la liste à la console.</> },
    { keys: ["Alt", "C"], desc: <>Affiche la liste récursive des dossiers du répertoire courant, vous permet d'en sélectionner un et, en appuyant sur <kbd>ENTER</kbd>, fzf saute dans ce dossier.</> },
  ]}
/>

Une fois ces bases devenues naturelles, fzf brille vraiment lorsqu'il est combiné à d'autres outils : voyez [FZF + ripgrep](/blog/fzf-ripgrep) pour une recherche de code interactive avec aperçu en direct, ou [Maîtrisez votre commande ssh et sélectionnez l'host dans une liste](/blog/ssh-with-fuzzy-finder) pour arrêter de taper les noms d'hôtes de mémoire. Si vous voulez spécifiquement une recherche d'historique plus riche — horodatages, codes de sortie et répertoire de travail par commande — Atuin vaut le coup d'œil : il remplace le fichier plat `~/.bash_history` par une base de données SQLite tout en gardant le même raccourci `Ctrl+R`.
