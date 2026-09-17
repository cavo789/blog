---
slug: modular-zsh-workflow
title: Au-delà du monolithe - Organiser son workflow ZSH comme un pro
description: Arrêtez d'alourdir la configuration de votre shell. Découvrez pourquoi déplacer vos fonctions ZSH dans des fichiers autonomes améliore les performances et la maintenabilité, avec un navigateur de projets universel.
authors: [christophe]
image: /img/v2/repo_with_fzf.webp
series: Customize your shell with ZSH
mainTag: fzf
ai_assisted: true
tags:
  - fzf
  - zsh
date: 2026-05-25
blueskyRecordKey: 3mmnv4igbvk2f
---
![Modular ZSH Workflow](/img/v2/repo_with_fzf.webp)

<TLDR>
Un `~/.zshrc` surchargé ralentit votre terminal et transforme le débogage en cauchemar. En utilisant le `fpath` de ZSH et en modularisant vos fonctions dans `~/.zsh/fns`, vous obtenez un démarrage instantané du shell et un code plus propre. Cet article explique le « pourquoi » et fournit une « Super Fonction » pour naviguer instantanément dans vos projets.
</TLDR>

On y est tous passés : votre `~/.zshrc` commence avec 10 lignes et finit en monstre de 1 500 lignes. Il contient tout et n'importe quoi : réglages de thème, scripts Docker complexes et alias divers que vous avez oublié avoir écrits. C'est l'**anti-pattern du shell monolithique** (si vous partez de zéro, commencez par <Link to="/blog/zsh-install">mon guide d'installation de ZSH</Link>).

Dans cet article, je vais vous montrer pourquoi déplacer votre logique dans des fichiers autonomes au sein de `~/.zsh/fns` et comment le mécanisme `autoload` de ZSH peut rendre votre terminal plus réactif que jamais. Et pour finir, je partage `repo`, une fonction qui va changer votre façon de naviguer dans votre workspace.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Se téléporter dans un projet", to: "#teleporting-to-a-project" },
    { label: "Comment le mettre en place", to: "#how-to-set-it-up" },
  ]}
/>

## Se téléporter dans un projet {#teleporting-to-a-project}

Une fois `repo` en place (voir plus bas), il suffit de taper un fragment du nom d'un projet pour y sauter directement — pas de `cd`, pas de chemin complet à taper :

<Terminal source="./files/terminal_repo_demo.txt" typewriter />

Un seul projet correspondait à `blg` parmi tout ce qui se trouve sous `~/repositories`, donc `repo` a complètement sauté le sélecteur et a fait un `cd` direct. Si plusieurs projets avaient correspondu, la même commande aurait ouvert un sélecteur `fzf` pré-filtré avec ces résultats.

## Le problème du monolithe {#the-problem-with-the-monolith}

Quand vous mettez une fonction directement dans votre `.zshrc`, ZSH doit parser et charger ce code en mémoire **à chaque fois** que vous ouvrez un nouvel onglet. Si vous avez des dizaines de fonctions utilitaires pour <Link to="/blog/zsh-docker-functions">Docker</Link>, Kubernetes ou <Link to="/blog/git-branches-gst">Git</Link>, ces millisecondes s'accumulent.

En déplaçant vos fonctions dans un dossier dédié (comme `~/.zsh/fns`), vous gagnez trois avantages majeurs :

1.  **Chargement paresseux :** avec `autoload`, ZSH ne lit le fichier que lorsque vous tapez réellement la commande. Votre shell démarre instantanément.
2.  **Maintenabilité :** si une de vos fonctions casse, vous allez dans le dossier `fns` et vous la corrigez. Plus besoin de scroller dans un océan de code.
3.  **Portabilité :** vous pouvez versionner votre dossier de fonctions séparément et le partager entre plusieurs machines sans embarquer toute votre config spécifique à l'OS.

## L'ingrédient secret : `fpath` et `autoload` {#the-secret-sauce-fpath-and-autoload}

Au lieu de faire un `source` des fichiers, on utilise le `fpath`. C'est un tableau de répertoires dans lesquels ZSH cherche les définitions de fonctions.

Quand vous appelez une fonction, ZSH regarde dans ces dossiers. S'il trouve un fichier correspondant au nom de la commande, il le charge à la volée.

## 💎 La Super Fonction : `repo` (navigateur de projets universel) {#-the-super-function-repo-universal-project-navigator}

En tant que développeurs, on change de contexte en permanence. On passe d'un backend PHP à un projet d'API, à un frontend Vue.js, à une application Python... et entre plusieurs dossiers de documentation — toute la journée. Faire `cd ~/repositories/project-xyz` des centaines de fois par jour, c'est du temps perdu.

La fonction `repo` utilise `fd` (ou `find`) et `fzf` pour vous permettre de chercher parmi tous vos repositories git et :

1.  **Sauter** dans le dossier.
2.  **Ouvrir** votre éditeur préféré (VS Code, Cursor, Neovim).

### Pourquoi c'est mieux dans un fichier autonome {#why-this-is-better-in-a-standalone-file}

Cette fonction contient de la logique pour gérer la profondeur des répertoires et le lancement de l'éditeur. Dans votre `.zshrc`, c'est du bruit. Dans `~/.zsh/fns/repo`, c'est un outil dédié.

<AlertBox variant="tip" title="Prérequis d'installation">
Cette fonction nécessite `fzf` (voir <Link to="/blog/linux-fzf-introduction">Introduction to fzf</Link> si vous ne le connaissez pas encore) et `fd` (ou `find`). Pour une expérience optimale, installez `fd-find`.
</AlertBox>

## Comment le mettre en place {#how-to-set-it-up}

### 1. Créer la structure {#1-create-the-structure}

Commencez par créer le dossier où vivront vos fonctions « autonomes » :

```bash
mkdir -p ~/.zsh/fns
```

### 2. Configurer votre `~/.zshrc` {#2-configure-your-zshrc}

Ajoutez ces lignes à votre `.zshrc`. C'est le seul « boilerplate » dont vous aurez besoin. Il dit à ZSH : « Regarde dans ce dossier, et si tu y trouves des fichiers, considère-les comme des fonctions que je pourrais vouloir utiliser. »

```zsh
# Anonymous utilities autoloading
fpath=(~/.zsh/fns $fpath)

# -U   Suppress alias expansion for standard behavior
# -z   Load using zsh style
# ::t  Don't load the function yet, just index it; will be loaded at the first use.
autoload -Uz ~/.zsh/fns/*(.:t)
```

### 3. Créer le fichier de la fonction `repo` {#3-create-the-repo-function-file}

Créez un fichier `~/.zsh/fns/repo` (sans extension !) et collez-y le code suivant.

<ProjectSetup folderName="~/.zsh/fns" createFolder={true} >
  <Guideline>
    Assurez-vous que le nom du fichier est exactement "repo". N'ajoutez pas .sh ni .zsh.
  </Guideline>
  <Snippet filename="repo" source="./files/repo.zsh" defaultOpen={true}/>
</ProjectSetup>

<AlertBox variant="note">
Pensez à adapter la variable `search_path` à l'endroit où vous stockez vos projets et, si vous n'utilisez pas VSCode, à mettre aussi à jour la variable locale `visual_editor`.
</AlertBox>

### 4. L'utiliser {#4-use-it}

Ouvrez un nouveau terminal ou lancez `source ~/.zshrc` (puisque vous avez modifié `.zshrc`) et lancez simplement `repo` pour démarrer la fonction. Plutôt sympa, non ?

<AlertBox variant="tip" title="Recharger">

Si vous avez déjà utilisé l'alias et que, pour une raison quelconque, vous avez modifié le code, la commande à lancer est : `unfunction repo && autoload -Uz repo && repo`.

</AlertBox>

## Autres démos {#more-demos}

### Recherche rapide (Fuzzy Find) {#fast-search-fuzzy-find}

Vous pouvez accélérer votre navigation en passant directement un motif de recherche à la commande : `repo <pattern>` — exactement l'exemple `repo blg` montré en début d'article.

- Si plusieurs projets correspondent à votre query, `fzf` s'ouvre pré-filtré avec ces résultats.
- Si **un seul** projet correspond, le script saute complètement l'interface et fait immédiatement un `cd` dans le répertoire.

<AlertBox variant="info" title="Astuce de pro">
C'est parfait pour les projets que vous visitez souvent. Si votre motif est suffisamment unique, ça devient un raccourci ultra-rapide !
</AlertBox>

## Conclusion {#conclusion}

La différence entre un environnement de développeur « junior » et « senior » tient souvent à la **friction de l'outillage**. En déplaçant vos fonctions dans des fichiers autonomes, vous réduisez la friction liée à la maintenance de votre environnement.

Avec `repo` installé dans votre nouvelle organisation modulaire, vous pouvez désormais vous téléporter dans votre workspace en quelques secondes. La prochaine fois que vous écrivez un snippet utile, ne le collez pas dans votre `.zshrc`. Donnez-lui son propre logement dans `~/.zsh/fns/` — voir <Link to="/blog/zsh-docker-functions">ZSH Functions - Customizing Your Shell for Docker Management</Link> et <Link to="/blog/git-branches-gst">Showing the last 3 updated branches when you jump in a git repo</Link> pour d'autres ensembles de fonctions et de hooks organisés de la même manière.
