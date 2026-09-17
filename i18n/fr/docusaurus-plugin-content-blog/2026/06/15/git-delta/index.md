---
slug: git-delta
title: "delta : un pager avec coloration syntaxique pour git diff"
authors: [christophe]
image: /img/v2/git-delta.webp
series: Modern CLI tools for your terminal
mainTag: git
tags: [git, linux, bash]
ai_assisted: true
date: 2026-06-15
description: Arrêtez de plisser les yeux devant les sorties brutes de git diff. Découvrez comment installer et configurer Delta pour ajouter coloration syntaxique et vue côte à côte en moins de 5 minutes.
language: fr
blueskyRecordKey: 3mnrw7ah2kc2o
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---

![delta : un pager avec coloration syntaxique pour git diff](/img/v2/git-delta.webp)

<TLDR>
La sortie de `git diff` est fonctionnelle mais difficile à lire : pas de coloration syntaxique, pas de vue côte à côte, des numéros de ligne noyés dans le bruit des `@@ -47,6 +47,8 @@`. `delta` est un pager de remplacement immédiat qui transforme chaque `git diff`, `git show` et `git log -p` en une vue côte à côte, colorée, avec des diffs au niveau du mot — sans modifier une seule de vos commandes git.
</TLDR>

Cela fait trente secondes que vous fixez la sortie d'un `git diff` pour comprendre ce qui a réellement changé. Les lignes en plus et en moins se confondent, chaque fichier affiche la même nuance de rouge et de vert, et les numéros de ligne sont enfouis dans un en-tête qu'il faut déchiffrer consciemment.

`delta` règle le problème en cinq minutes.

*Il rejoint la même famille de réécritures modernes que <Link to="/blog/ripgrep">ripgrep</Link> (pour `grep`) et <Link to="/blog/linux-eza">eza</Link> (pour `ls`). En dehors d'un repository git, <Link to="/blog/linux-diff-file-folder">`diff`</Link> reste l'outil de référence.*

<!-- truncate -->

## Avant et après {#before-and-after}

### Une ligne modifiée sans delta {#a-changed-line-without-delta}

```diff
-  const expiry = token.exp * 1000;
+  const expiry = token.exp * 1000 + TOKEN_GRACE_MS;
```

Tout a le même poids visuel. Vous parcourez toute la ligne à la recherche de la différence.

### La même ligne avec delta {#the-same-line-with-delta}

Delta met en évidence `+ TOKEN_GRACE_MS` au niveau du caractère — le reste de la ligne reste atténué. Votre œil va directement au changement, pas au contexte inchangé autour.

Ce diff au niveau du mot est particulièrement utile quand :

- Une variable a été renommée (`getUserById` → `findUserById`)
- Une faute de frappe a été corrigée dans une chaîne
- Un flag a été ajouté ou retiré d'un long appel de fonction

Sans diff au niveau du mot, chacun de ces cas produit une ligne supprimée entièrement rouge et une ligne ajoutée entièrement verte. Avec delta, seul le mot modifié est mis en évidence.

## Qu'est-ce que delta ? {#what-is-delta}

[delta](https://github.com/dandavison/delta) est un pager avec coloration syntaxique qui s'intercale entre git et votre terminal. Il intercepte la sortie brute du diff et l'affiche avec :

- Une coloration syntaxique par langage — un changement TypeScript ressemble à du TypeScript, un changement YAML ressemble à du YAML
- Une vue côte à côte — ancienne version à gauche, nouvelle version à droite, alignées ligne par ligne
- Un diff au niveau du mot — met en évidence les caractères exacts qui ont changé dans une ligne, pas la ligne entière
- Des numéros de ligne — toujours visibles, toujours alignés
- La navigation — sautez d'un hunk à l'autre avec `n` et `N`

Le point essentiel : **vous ne changez aucune commande git**. Vous tapez toujours `git diff`, `git show`, `git log -p`. Delta intercepte la sortie automatiquement.

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Vous venez de lire le diff « avant » ci-dessus. Voici un container où delta est déjà installé,
configuré et pointé sur un vrai changement non indexé — pour voir l'« après » sans toucher
à votre propre `.gitconfig`.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `git` et `git-delta`, écrit le bloc `.gitconfig` complet de cet
article et prépare un petit repo avec exactement le type de changement d'un seul mot (`+ TOKEN_GRACE_MS`)
qui rend le diff au niveau du mot de delta intéressant à voir. Rien ne change sur votre machine.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez-le et lancez-le :

<Terminal title="user@machine: ~/delta-demo">
$ docker build -t delta-demo .
[+] Building 26.7s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it delta-demo
🐳 root ~/demo # git diff
</Terminal>

`git diff` s'ouvre en vue côte à côte, avec coloration syntaxique, et `TOKEN_GRACE_MS` ressort au
niveau du caractère au lieu de voir toute la ligne passer au vert. Appuyez sur `q` pour fermer le pager, puis essayez
`git log -p`, `git show HEAD`, ou modifiez `auth.js` vous-même et relancez le diff — la même configuration s'applique
à toutes les commandes.

## Installation {#install}

<Prerequisite
  name="git-delta"
  install="sudo apt install git-delta"
  check="delta --version"
  checkOutput="delta 0.18.2"
/>

<AlertBox variant="note" title="Sur les anciennes versions d'Ubuntu/Debian">
Le package peut s'appeler `delta` plutôt que `git-delta`. Si `apt install git-delta` échoue, essayez `sudo apt install delta` — ou installez le dernier binaire depuis la [page des releases GitHub](https://github.com/dandavison/delta/releases).
</AlertBox>

## Configurer git pour utiliser delta {#configure-git-to-use-delta}

Delta fonctionne comme un remplacement de `core.pager`. Ouvrez votre `~/.gitconfig` et ajoutez :

```ini
[core]
    pager = delta

[interactive]
    diffFilter = delta --color-only

[delta]
    navigate = true
    side-by-side = true
    line-numbers = true
    syntax-theme = Dracula

[merge]
    conflictstyle = diff3

[diff]
    colorMoved = default
```

Enregistrez le fichier. Pas besoin de redémarrer le shell — le pager est invoqué à chaque commande.

Voyons ce que fait chaque option.

<StepsCard
  variant="remember"
  title="Référence de configuration"
  steps={[
    {
      content: "**`core.pager = delta`** — indique à git de faire passer toute sortie paginée par delta au lieu de `less`. Cela couvre `git diff`, `git show`, `git log -p`, `git stash show -p`, et plus encore.",
    },
    {
      content: "**`interactive.diffFilter = delta --color-only`** — applique le rendu couleur de delta dans les commandes interactives comme `git add -p`, sans casser la gestion de l'entrée.",
    },
    {
      content: "**`navigate = true`** — appuyez sur `n` pour sauter au fichier modifié suivant, `N` pour revenir en arrière. Indispensable quand vous relisez un diff qui touche beaucoup de fichiers.",
    },
    {
      content: "**`side-by-side = true`** — affiche l'ancienne et la nouvelle version sur deux colonnes. Le plus gros gain de lisibilité.",
    },
    {
      content: "**`line-numbers = true`** — affiche les numéros de ligne dans une colonne dédiée de chaque côté. Fini le déchiffrage des en-têtes `@@ -47,6 +47,8 @@`.",
    },
    {
      content: "**`syntax-theme = Dracula`** — définit le thème de couleurs pour la coloration syntaxique. Changez-le pour l'accorder au thème de votre terminal. Lancez `delta --list-syntax-themes` pour voir toutes les options.",
    },
    {
      content: "**`merge.conflictstyle = diff3`** — combiné à delta, affiche les trois versions lors d'un conflit de merge (la nôtre, la leur, et l'ancêtre commun). Bien plus simple à résoudre.",
    }
  ]}
/>

## Le mode côte à côte {#side-by-side-mode}

Avec `side-by-side = true`, delta divise chaque fichier modifié en deux colonnes :

- **Gauche** — l'ancienne version, avec les lignes supprimées en rouge
- **Droite** — la nouvelle version, avec les lignes ajoutées en vert
- **Les deux** — les lignes de contexte inchangées sont affichées des deux côtés, alignées

Pour une fonction renommée appelée à dix endroits, vous ne lisez plus deux streams entremêlés de rouge et de vert. Vous lisez l'avant à gauche et l'après à droite, comme dans un outil de code review.

Si votre terminal est étroit et que les deux colonnes deviennent trop serrées, vous pouvez désactiver le côte à côte pour une seule commande :

```bash
git -c delta.side-by-side=false diff
```

Ou ajoutez un alias court dans `.gitconfig` :

```ini
[alias]
    dw = -c delta.side-by-side=false diff
```

`git dw` vous donne le mode une colonne ; `git diff` garde le comportement par défaut.

## Les thèmes {#themes}

Delta utilise le même moteur de thèmes que `bat` et `syntect`. Pour lister tous les thèmes disponibles :

<Terminal>
$ delta --list-syntax-themes
</Terminal>

Pour prévisualiser un thème sans modifier votre configuration :

<Terminal>
$ git diff | delta --syntax-theme=gruvbox-dark
</Terminal>

Quelques bons points de départ :

<StepsCard
  variant="remember"
  title="Thèmes conseillés selon le fond du terminal"
  steps={[
    { content: "**Fond sombre** — `Dracula`, `gruvbox-dark`, `TwoDark`, `Nord`" },
    { content: "**Fond clair** — `GitHub`, `Monokai Extended Light`, `OneHalfLight`" }
  ]}
/>

## La navigation entre les hunks {#navigation-between-hunks}

Avec `navigate = true`, delta ajoute une navigation au clavier dans le pager :

<StepsCard
  variant="remember"
  title="Touches de navigation"
  steps={[
    { content: "**n** — Sauter au fichier modifié suivant" },
    { content: "**N** — Sauter au fichier modifié précédent" },
    { content: "**q** — Quitter" },
    { content: "**Espace** — Page suivante" }
  ]}
/>

C'est surtout utile avec `git log -p` ou `git diff HEAD~10`, où le diff s'étale sur de nombreux fichiers.

## Delta fonctionne partout où git fonctionne {#delta-works-everywhere-git-does}

Une fois `core.pager = delta` défini, delta s'applique à toutes les commandes git qui paginent leur sortie :

```bash
git show HEAD           # last commit, with highlighting
git log -p              # full history with diffs
git stash show -p       # what's in a stash entry
git diff HEAD~3         # compare to 3 commits ago
git diff main...feature # compare branches
```

Aucun flag supplémentaire. Aucune fonction wrapper. Ça fonctionne, point.

## Pour aller plus loin {#going-further}

Si vous utilisez aussi <Link to="/blog/git-config">des alias `git diff` dans votre `.gitconfig`</Link>, ces alias profitent automatiquement de delta puisque le pager s'applique au niveau de la sortie, pas au niveau de la commande.

Pour une expérience git en TUI encore plus riche, delta sert de moteur de rendu des diffs dans [lazygit](https://github.com/jesseduffield/lazygit) et [tig](https://github.com/jonas/tig) — deux clients git TUI qui respectent `core.pager`.

## Conclusion {#conclusion}

Trente secondes à plisser les yeux devant un `git diff` brut, c'était tout le problème — pas de coloration syntaxique, pas de côte à côte, des numéros de ligne noyés dans le bruit des `@@`. `delta` règle les trois avec un `apt install` et une poignée de lignes dans `.gitconfig`, et toutes les commandes git que vous connaissez déjà continuent de fonctionner exactement telles quelles.

Si vous parcourez aussi l'historique avec des alias, <Link to="/blog/git-config">configurer les alias `git diff` dans `.gitconfig`</Link> est l'étape suivante naturelle — ils héritent du rendu de delta gratuitement.
