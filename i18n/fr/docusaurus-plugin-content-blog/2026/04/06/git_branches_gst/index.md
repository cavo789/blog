---
slug: git-branches-gst
title: Afficher les 3 dernières branches modifiées quand vous entrez dans un repo git
description: Découvrez comment configurer ZSH pour afficher automatiquement vos branches Git les plus récemment modifiées dès que vous entrez dans un repository ou que vous vérifiez son statut.
authors: [christophe]
image: /img/v2/git_branches_status.webp
mainTag: git
tags:
  - git
  - zsh
date: 2026-04-06
blueskyRecordKey: 3misnmd2jqs2f
updates:
  - date: 2026-08-22
    note: added a Docker-first demo of the "wrong branch" trap
---

![Afficher les 3 dernières branches modifiées quand vous entrez dans un repo git](/img/v2/git_branches_status.webp)

<TLDR>Revenir sur un ancien projet, c'est souvent travailler par accident sur la mauvaise branch Git et provoquer des conflits de merge. Pour éviter ça, vous pouvez ajouter un script maison à votre configuration Zsh qui affiche automatiquement les trois branches locales modifiées le plus récemment. Cette fonction s'accroche aux changements de répertoire et à la commande git status pour vous rappeler instantanément votre contexte de travail précédent.</TLDR>

Zut, c'est encore arrivé : je travaillais sur un gros projet (composé de plusieurs repositories), j'ai poussé mon travail en production (sur la branch `main`), puis j'ai commencé un refactoring dans une branch appelée `wip`. Ensuite... je suis passé à d'autres projets, comme toujours.

Des mois plus tard, en revenant sur le projet, j'ai passé quelques jours à faire des améliorations sur la branch `main`. Et puis — zut ! Vous l'avez devinée — la dernière branch active n'était pas `main`, mais `wip`. Aaaargh... J'avais donc maintenant deux branches divergentes, `main` et `wip`, et des conflits de merge à gérer. Tellement frustrant, surtout que j'étais le seul développeur sur le projet.

Comment éviter ce genre de situation ?

*Deux autres approches du même problème : trier les branches par date de manière globale avec <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link>, et <Link to="/blog/git-worktree">git worktree</Link>, qui permet aux deux branches d'exister en même temps dans des dossiers séparés, ce qui rend la confusion impossible.*

<!-- truncate -->

## Un exemple concret {#a-real-world-example}

Mon disque est rempli de projets et d'une énorme liste de repositories. Une fois le bloc ci-dessous en place (on y vient), dès que je fais un `cd` dans l'un d'eux, j'obtiens automatiquement les trois dernières branches. Aucun effort supplémentaire :

```bash
❯ cd project/subproject

=== Recent Local Branches ===
  feature_logging - 1 month ago
* main - 3 months ago
  wip - 2 months ago
```

*(`*` indique la branch active)*

Je réalise immédiatement *« Ah oui, je travaillais sur `wip` »*, et je peux basculer sur la bonne branch. La même information apparaît avec `gst`, l'alias que j'utilise pour `git status`.

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Aucune installation nécessaire pour `git` lui-même — ce qui vaut la peine d'être essayé sans risque, c'est le hook. Le container jetable ci-dessous contient déjà le piège exact de la « mauvaise branch » décrit en intro : `main` est checked out (la plus ancienne des trois), tandis que `wip` et `feature_logging` ont tous deux été touchés plus récemment.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ajoute le bloc exact ci-dessous à `~/.zshrc` et construit un repo avec trois branches commitées à des dates différentes. Rien n'est touché sur votre propre machine ni dans vos repos.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez-le et lancez-le :

<Terminal title="user@machine: ~/gst-demo">
$ docker build -t gst-demo .
[+] Building 18.6s (5/5) FINISHED
 ✔ exporting to image

$ docker run --rm -it gst-demo
🐳 root ~ # cd projects/my-blog
</Terminal>

`chpwd` se déclenche à l'instant où vous faites `cd` — aucune commande supplémentaire à taper :

```bash
=== Recent Local Branches ===
  feature_logging - 6 weeks ago
  wip - 2 months ago
* main - 3 months ago
```

`main` (checked out, marquée `*`) est la *plus ancienne* des trois — exactement le piège de l'intro. Lancez ensuite `gst` : la même bannière apparaît, immédiatement suivie du vrai `git status`.

## Installation {#installation}

Comme je passe l'essentiel de mon temps dans le terminal, j'ai besoin d'une notification dès que j'entre dans le dossier d'un projet ou que je lance une commande `git status`.

Éditez simplement votre fichier `~/.zshrc` et ajoutez ce bloc à la fin (ou, mieux, mettez-le dans son propre fichier comme expliqué dans <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>) :

<Snippet filename="~/.zshrc" source="./files/zshrc" />

## Comment ça fonctionne {#how-it-works}

La fonction `_display_recent_git_context` lance `git rev-parse --is-inside-work-tree` pour vérifier que vous êtes bien dans un repository Git. Si ce n'est pas le cas, elle s'arrête silencieusement. Si vous êtes dans un repo, elle lance `git rev-parse HEAD` pour vérifier si le repository est complètement vide. Si c'est le cas, il n'y a rien à faire, donc elle s'arrête.

Si le repository n'est pas vide, la fonction récupère le nom de la branch active, puis lance `git for-each-ref` pour parcourir vos branches **locales**, en les triant par date de leur dernier commit en ordre décroissant (`--sort=-committerdate`).

Le script définit également (ou écrase) un alias ZSH `gst`. La nouvelle commande `gst` appelle notre fonction maison avant d'exécuter la commande native `git status`.

Enfin, puisqu'on utilise ZSH, on peut tirer parti d'un hook standard appelé `chpwd` (qui se déclenche lors du *changement du répertoire de travail courant*). Ce hook est appelé automatiquement par des commandes système comme `cd` ou `pushd`.

## Branches locales uniquement {#local-branches-only}

Il est important de noter que ce script interroge exclusivement votre repository Git local. Il évite délibérément d'exécuter une commande `git fetch` pour vérifier les mises à jour sur le serveur distant.

Déclencher une requête réseau à chaque changement de répertoire introduirait une latence inacceptable et ralentirait fortement votre workflow dans le terminal. Comme il lit strictement vos références Git locales — ce qui est différent de la zone de staging Git qui suit vos modifications de fichiers non commitées — le script s'exécute instantanément.

Si un collègue pousse une nouvelle branch sur le repository distant, elle n'apparaîtra pas automatiquement dans votre liste de branches récentes. Vous gardez le contrôle total des opérations réseau ; dès que vous voulez mettre à jour votre repository local avec l'activité distante la plus récente, vous lancez simplement `git fetch` manuellement.

## Conclusion {#conclusion}

Maintenant, chaque fois que je lance un `cd` et que j'entre dans un projet Git, je n'ai aucune commande supplémentaire à taper — j'obtiens immédiatement l'information dont j'ai besoin : le nom des branches actives les plus récentes.

Ce snippet est assez petit pour vivre directement dans `~/.zshrc`, mais si vous accumulez plusieurs hooks et fonctions comme celui-ci, voyez <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link> pour une façon plus propre de les organiser.
