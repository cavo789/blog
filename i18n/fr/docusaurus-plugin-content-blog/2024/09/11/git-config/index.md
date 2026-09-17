---
slug: git-config
title: Git - Quelques astuces pour votre fichier .gitconfig
date: 2024-09-11
description: Personnalisez votre workflow Git avec des astuces essentielles pour le fichier ~/.gitconfig. Apprenez à créer un alias git undo, à gérer les branches distantes, à gérer les credentials et à forcer SSH.
authors: [christophe]
image: /img/v2/git.webp
mainTag: git
tags:
  - git
  - wsl
language: fr
updates:
  - date: 2026-02-04
    note: the windows application name is now `git-credential-manager.exe`, no more `git-credential-manager-core.exe`
---
![Git - Quelques astuces pour votre fichier .gitconfig](/img/v2/git.webp)

<!-- cspell:ignore autocrlf,committerdate,customising,gitdir,sooooooo -->

<TLDR>
Cet article partage un ensemble de personnalisations pratiques du fichier `~/.gitconfig` : un alias `git undo` pour abandonner le dernier commit local, la création automatique des branches distantes lors d'un push, la suppression automatique des branches de suivi mortes et le tri de la sortie de `git branch` par date du dernier commit. Il couvre aussi le partage du Credential Manager de Windows avec WSL2, l'utilisation de credentials différents selon le dossier pour séparer travail et projets personnels, le forçage de SSH au lieu de HTTPS de façon globale, et comment empêcher Git de convertir les fins de ligne LF en CRLF sous Windows.
</TLDR>

Dans cet article, nous allons explorer quelques astuces pour utiliser Git plus facilement en personnalisant le fichier `~/.gitconfig`.

Nous allons créer une nouvelle commande `git undo` pour abandonner le dernier commit local.

Nous verrons comment partager le Credential Manager de Windows avec Linux, comment avoir plusieurs credentials selon la structure de vos dossiers, ...

Nous verrons également comment mieux travailler avec les branches : les trier par date de commit plutôt que par nom, supprimer automatiquement (prune) les anciennes branches ou forcer la création d'une nouvelle branch sur le remote.

<!-- truncate -->

Si vous utilisez Linux (ou WSL), votre fichier de configuration Git se trouve ici : `~/.gitconfig`. Vous pouvez l'éditer avec vi ou vscode (`vi ~/.gitconfig` ou `code ~/.gitconfig`).

<AlertBox variant="info" title="En ligne de commande">
Vous pouvez éditer votre configuration globale en lançant `git config --global --edit` dans la console.

L'éditeur par défaut sera démarré (`vi` ou peut-être `nano` si vous l'avez). Si vous préférez vscode, lancez d'abord `git config --global core.editor "code --wait"` dans la console. Vous avez maintenant associé git à vscode également pour, par exemple, éditer votre message de commit.

</AlertBox>

## Alias {#aliases}

Mais combien de fois ai-je essayé un `git undo` pour, hop hop, effacer tout ce que j'ai fait en local et repartir du dernier commit poussé sur le repository distant.

Par exemple, je fais du refactoring et aïe, non, je ne suis pas content et je veux annuler mon dernier commit local (= j'ai fait `git add ... && git commit ...` mais pas `git push`).

Ce serait bien de pouvoir lancer `git undo` pour ça, non ? C'est là que la notion d'alias entre en jeu.

Ajoutez simplement les deux lignes ci-dessous dans votre `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig" />

<AlertBox variant="info" title="En ligne de commande">
Au lieu de modifier le fichier à la main, vous pouvez obtenir exactement le même résultat en lançant `git config --global alias.undo '!f() { git reset --hard $(git rev-parse --abbrev-ref HEAD)@{${1-1}}; }; f'` dans la console.

</AlertBox>

[source : https://github.com/git-tips/tips](https://github.com/git-tips/tips?tab=readme-ov-file#alias-git-undo)

## Branches {#branches}

### Créer automatiquement la nouvelle branch sur le remote {#create-the-new-branch-on-the-remote-automatically}

Quand vous travaillez sur une nouvelle fonctionnalité, vous ferez très probablement d'abord `git checkout -b myNewFeature` pour créer la branch `myNewFeature` sur votre machine. *Si vous avez souvent besoin de deux branches actives en même temps, jetez un œil à <Link to="/blog/git-worktree">git worktree</Link>.*

Ensuite vous allez coder et le moment viendra de pousser vers git avec, par exemple, `git add . ; git commit -m "wip" ; git push`, mais ça ne fonctionnera pas directement.

En effet, git va se plaindre que `myNewFeature` n'existe pas sur le remote et qu'il faut d'abord créer la branch.

Vous pouvez éviter ça en ajoutant les deux lignes ci-dessous dans votre `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part2" />

Maintenant, si la branch locale n'existe pas sur le remote, git push la créera automatiquement pour vous.

### Nettoyer les branches mortes {#cleaning-dead-branches}

Par défaut, git se souvient de chaque nom de branch qui a existé à un moment donné, même si la branch a été supprimée du repository distant entre-temps.

Donc, après plusieurs mois, si vous lancez `git branch --list --all` sur votre machine, vous pouvez obtenir des noms de branches qui n'existent plus sur le repository distant.

Ajoutez simplement les deux lignes ci-dessous dans votre fichier `~/.gitconfig` pour demander à git de faire le nettoyage automatiquement lors d'un `git fetch` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part3" />

<AlertBox variant="info" title="En ligne de commande">
Au lieu de modifier le fichier à la main, vous pouvez obtenir exactement le même résultat en lançant `git config --global fetch.prune true` dans la console.

</AlertBox>

### Trier les branches sur la date du dernier commit {#sorting-branches-on-the-last-commit-date}

Au travail, nous utilisons Git sur une très grosse base de code et donc nous créons des branches pour ajouter de nouvelles fonctionnalités.

En lançant `git branch --list --all` (ou, en plus court, `git branch -a`), git renvoie la liste des branches dans l'ordre alphabétique, ce qui n'est vraiment pas très utile.

Il serait préférable de trier la liste sur le dernier commit fait dans la branch pour avoir, en haut de liste, les branches utilisées récemment et, en bas, les inactives. *J'ai poussé cette idée plus loin avec un hook de shell qui les affiche automatiquement : <Link to="/blog/git-branches-gst">Showing the last 3 updated branches when you jump in a git repo</Link>.*

Pour ce faire, ajoutez simplement le bloc ci-dessous dans votre fichier `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part4" />

<AlertBox variant="info" title="En ligne de commande">
Au lieu de modifier le fichier à la main, vous pouvez obtenir exactement le même résultat en lançant `git branch --sort=-committerdate` dans la console.

</AlertBox>

## Credentials {#credentials}

### Partager le Credential Manager de Windows avec Linux {#sharing-windows-credentials-manager-with-linux}

Si vous êtes sur WSL2, vous pouvez réutiliser les credentials que vous avez déjà saisis sur Windows. En effet, vous pouvez utiliser `git` à la fois dans un environnement DOS et dans une console Linux.

Pour partager les credentials entre les deux environnements, ajoutez simplement les deux lignes ci-dessous dans votre fichier `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part5" />

### Utiliser plusieurs credentials sur la même machine {#using-multiple-credentials-on-the-same-computer}

Comme vous le savez, lors de l'installation de Git, vous devez fournir votre nom et votre email. Ces deux informations sont fournies dans la console avec une commande comme celle ci-dessous :

<Terminal typewriter>
$ git config --global user.email "me@work.be"
$ git config --global user.name "Christophe Avonture"
</Terminal>

Mais ce n'est pas très pratique quand vous travaillez sur plusieurs types de projets, par exemple pour le travail et pour vos projets personnels. Disons que vous mettez le travail professionnel dans un dossier parent comme `~/work_repositories` tandis que vos projets perso sont dans `~/private_repositories`.

Quand votre `~/.gitconfig` ressemble à ce qui suit, chaque fois que vous pousserez vers Git, le commit publié viendra de `me@work.be`.

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part6" />

Et, avec la configuration ci-dessous, si vous poussez un repository situé dans `~/private_repositories`, cette fois l'auteur sera `me@private.be` ; plus votre email professionnel.

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part7" />

## Forcer SSH au lieu de HTTPS {#force-ssh-instead-of-https}

Même si vous avez cloné un repository avec `git clone https://...`, vous pouvez forcer globalement l'utilisation de SSH à la place.

Ainsi, par exemple, si vous avez cloné votre projet avec `git clone https://github.com/you/your_repo.git` (`https` donc), chaque fois que vous pousserez, on vous demandera peut-être votre login et votre mot de passe. Vraiment pénible.

Mais si vous avez déjà <Link to="/blog/github-connect-using-ssh">créé une clé SSH pour votre profil Github</Link>, alors vous pouvez arrêter d'utiliser https et forcer SSH en ajoutant les deux lignes ci-dessous dans votre `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part8" />

<AlertBox variant="info" title="En ligne de commande">
Vous pouvez éditer votre configuration globale en lançant `git config --global url.'git@github.com:'.insteadOf 'https://github.com/'` dans la console.

</AlertBox>

Dès à présent, même si le repository est toujours configuré pour utiliser `https` (comme vous pouvez le vérifier dans le fichier `.git/config` de ce projet sur votre disque dur), vous avez forcé SSL globalement.

## Empêcher le remplacement automatique de LF par CRLF {#prevent-auto-replacing-lf-with-crlf}

Si vous travaillez sous Windows et non sous Linux/WSL, git, sous Windows, essaiera toujours de remplacer le caractère LF par CRLF et c'est **vraiment très mauvais**.

Ne l'autorisez pas en ajoutant l'élément de configuration suivant dans votre `~/.gitconfig` :

<Snippet filename="~/.gitconfig" source="./files/.gitconfig.part9" />

<AlertBox variant="info" title="En ligne de commande">
Vous pouvez éditer votre configuration globale en lançant `git config --global core.autocrlf false` dans la console.

</AlertBox>

Les fins de ligne ne sont pas la seule différence Windows/Linux à surveiller : <Link to="/blog/dos-case-sensitive">la sensibilité à la casse des noms de fichiers</Link> en est une autre qui peut provoquer silencieusement des conflits quand le même dossier est partagé entre les deux systèmes.

[source : https://github.com/git-tips/tips](https://github.com/git-tips/tips?tab=readme-ov-file#prevent-auto-replacing-lf-with-crlf)
