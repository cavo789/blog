---
slug: git-worktree
title: "git worktree : travailler sur deux branches en même temps"
authors: [christophe]
description: "git worktree permet de checkout plusieurs branches comme de vrais répertoires, en même temps — sans stash, sans perte de contexte. Gardez votre stack Docker en route pendant que vous traitez un hotfix en parallèle."
image: /img/v2/git_worktree.webp
mainTag: git
tags: [git, linux, bash, zsh]
date: 2026-06-29
ai_assisted: true
blueskyRecordKey: 3mpfvg4xwkk2d
updates:
  - date: 2026-08-22
    note: added a Docker-first demo of the hotfix scenario
---

![git worktree : travailler sur deux branches en même temps](/img/v2/git_worktree.webp)

<TLDR>
Vous êtes plongé dans une branche de feature — du code à moitié écrit, des containers Docker qui tournent, des fichiers ouverts partout. Et là : « hotfix urgent à faire sur main ». Avec le workflow habituel, vous stashez tout, vous changez de branch, vous corrigez, vous committez, vous poussez, puis vous dépilez le stash en espérant que rien n'explose. Avec `git worktree`, vous checkoutez une deuxième branch dans un dossier séparé. Les deux branches existent en même temps, comme de vrais répertoires, avec leurs propres terminaux et leurs propres stacks Docker.
</TLDR>

Il est 15h, un jeudi. Vous travaillez sur une nouvelle fonctionnalité depuis deux jours. Les containers Docker tournent, votre éditeur a huit fichiers ouverts, et vous êtes au milieu d'un refactoring qui ne compile pas encore.

Votre téléphone vibre. La production est cassée. Un correctif doit partir sur `main` dans les trente minutes.

Vous faites quoi ?

<!-- truncate -->

## Le workflow du stash et sa douleur {#the-stash-workflow-and-its-pain}

L'approche classique :

<Terminal typewriter>
$ git stash push -m "WIP: feature/user-notifications"
$ git checkout main
$ git pull

// ... on corrige le bug ...

$ git commit -m "fix: correct invoice calculation"
$ git push
$ git checkout feature/user-notifications
$ git stash pop
</Terminal>

Ça marche. La plupart du temps. Mais :

- Vos containers Docker pointent maintenant vers le mauvais code — il faut les redémarrer
- Votre éditeur a perdu le contexte — tous ces fichiers ouverts ont disparu ou pointent vers les versions de main
- Si `git stash pop` part en conflit, vous voilà avec un joyeux bazar à trois branches à résoudre, encore sous le stress du hotfix
- Vous ne pouvez avoir qu'une seule branch active à la fois

Le problème de fond : un git stash est un état fragile. Ce n'est pas une branch. Il n'a pas d'historique. Il peut entrer en conflit. Et il disparaît dès que vous le dépilez.

*Puisqu'on parle de jongler avec les branches : <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link> montre comment trier `git branch` par date du dernier commit, et <Link to="/blog/git-branches-gst">Showing the last 3 updated branches when you jump in a git repo</Link> les affiche automatiquement quand vous entrez dans un repository.*

## Ce que fait git worktree {#what-git-worktree-does}

Un git worktree est un deuxième (ou troisième, ou quatrième) répertoire de travail lié au même repository git.

Au lieu d'un dossier avec une seule branch checkoutée, vous obtenez :

```plaintext
~/projects/my-blog/                     ← main branch (original)
~/projects/my-blog-hotfix/              ← hotfix/invoice-fix branch (worktree)
~/projects/my-blog-feature-auth/        ← feature/auth branch (worktree)
```

Chaque dossier est un **vrai répertoire** avec ses propres fichiers, son propre terminal, ses propres processus en cours. Ils partagent la même base `.git` (commits, objets, historique), mais chacun a une branch checkoutée indépendamment.

Vous ne quittez jamais votre branch de feature. Le hotfix vit juste à côté.

## Les commandes de base {#the-basic-commands}

### Ajouter un worktree {#add-a-worktree}

<Terminal typewriter>
$ git worktree add \<path> [branch]
</Terminal>

Crée un nouveau répertoire à l'emplacement `<path>` avec `[branch]` checkoutée :

<Terminal typewriter>
$ git worktree add ../my-blog-hotfix hotfix/invoice-fix
</Terminal>

Si la branch n'existe pas encore, créez-la en même temps :

<Terminal typewriter>
$ git worktree add -b hotfix/invoice-fix ../my-blog-hotfix main
</Terminal>

Cela crée `hotfix/invoice-fix` à partir de `main`, checkoutée dans `../my-blog-hotfix`.

### Lister tous les worktrees {#list-all-worktrees}

<Terminal typewriter>
$ git worktree list
</Terminal>

Sortie :

```plaintext
/home/christophe/projects/my-blog              a4b2c1d [main]
/home/christophe/projects/my-blog-hotfix       e8f3d2a [hotfix/invoice-fix]
```

### Supprimer un worktree {#remove-a-worktree}

<Terminal typewriter>
git worktree remove ../my-blog-hotfix
</Terminal>

Cela supprime le dossier et désenregistre le worktree. La branch elle-même (`hotfix/invoice-fix`) existe toujours — vous pouvez la supprimer séparément avec `git branch -d`.

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

`git` n'a pas besoin d'être installé — il est déjà sur votre machine. Ce qui vaut la peine d'être testé sans risque, c'est le scénario lui-même : un repo jetable, déjà en plein refactoring sur une branch de feature avec des modifications non committées, et un bug de calcul de TVA qui attend sur `main`. Exactement la situation du jeudi après-midi ci-dessous, sans le stress.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous construit un repo déjà positionné sur `feature/user-notifications` avec deux
fichiers non stagés — le même point de départ que l'étape 1 ci-dessous — plus le navigateur fzf `gwt`
décrit plus bas, branché via un vrai autoload ZSH. Rien n'est touché sur vos propres repos.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez-le et lancez-le :

<Terminal title="user@machine: ~/worktree-demo">
$ docker build -t worktree-demo .
[+] Building 24.1s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it worktree-demo
🐳 root ~/projects/my-blog # git status
On branch feature/user-notifications
Changes not staged for commit:
	modified:   src/api/notifications.ts
	modified:   src/components/Notifications.tsx
</Terminal>

C'est l'étape 1 ci-dessous, déjà en place. Maintenant, déroulez le reste du scénario pour de vrai, exactement comme
écrit — `git worktree add -b hotfix/invoice-fix ../my-blog-hotfix main`, corrigez
`src/billing/invoice.ts` dans le nouveau dossier, committez, `git worktree remove`, et vérifiez avec `git
status` que votre branch de feature n'a pas bougé. `gwt` est branché aussi, si vous voulez essayer le
navigateur fzf de la section « Une fonction ZSH » plus bas.

<AlertBox variant="note" title="Lancez les commandes de l'étape 4 une par une">
Ne collez pas tout le bloc de l'étape 4 d'un coup : `vim` est un éditeur plein écran, donc tout ce
que vous collez après `vim src/billing/invoice.ts` est tapé *dans vim* au lieu d'être exécuté comme
commandes shell. Lancez cette ligne seule, faites la modification (voir l'astuce à l'étape 4), sauvez et quittez, puis collez
le reste. `git push` fonctionne aussi dans ce container — l'image branche un repo bare local comme `origin`,
il y a donc une vraie cible où pousser, sans compte GitHub.
</AlertBox>

## Le scénario du hotfix, étape par étape {#the-hotfix-scenario-step-by-step}

Retour au jeudi après-midi. Voici la même situation traitée avec des worktrees.

### 1. Vous êtes sur votre branch de feature, en plein travail {#1-youre-on-your-feature-branch-in-the-middle-of-work}

<Terminal typewriter>
// État actuel
$ git branch

\* feature/user-notifications
  main

$ git status

On branch feature/user-notifications
Changes not staged for commit:
  modified: src/components/Notifications.tsx
  modified: src/api/notifications.ts

</Terminal>

Vous n'y touchez pas. Vous ne stashez rien.

### 2. Créez un worktree de hotfix à côté de votre projet {#2-create-a-hotfix-worktree-next-to-your-project}

<Terminal>
git worktree add -b hotfix/invoice-fix ../my-blog-hotfix main
</Terminal>

<Terminal>
Preparing worktree (new branch 'hotfix/invoice-fix')
HEAD is now at a4b2c1d chore: update dependencies
</Terminal>

### 3. Ouvrez un nouveau terminal, allez dans le dossier du hotfix {#3-open-a-new-terminal-cd-into-the-hotfix-folder}

<Terminal typewriter>
cd ../my-blog-hotfix
</Terminal>

Ce répertoire contient les fichiers de `main`. Le répertoire de votre branch de feature est intact, toujours en cours d'exécution, toujours ouvert dans votre éditeur.

### 4. Corrigez le bug et poussez {#4-fix-the-bug-and-push}

<Terminal typewriter>
// Dans ../my-blog-hotfix
vim src/billing/invoice.ts
git add src/billing/invoice.ts
git commit -m "fix: correct VAT calculation for EU invoices"
git push origin hotfix/invoice-fix
// on ouvre la PR, on merge, terminé
</Terminal>

<AlertBox variant="tip" title="Le vrai correctif TVA">
`calculateVat()` retourne `amount * rate` — juste la part de TVA, pas le total de la facture. Dans vim :
appuyez sur `i`, changez la ligne en `return amount * (1 + rate);`, puis `Esc` suivi de `:wq` pour sauver
et quitter. Seulement ensuite, lancez les lignes `git add`/`commit`/`push`.
</AlertBox>

### 5. Nettoyez le worktree {#5-clean-up-the-worktree}

<Terminal typewriter>
// De retour dans le repo d'origine
git worktree remove ../my-blog-hotfix
git branch -D hotfix/invoice-fix
</Terminal>

<AlertBox variant="note" title="Pourquoi -D et pas -d">
Vous êtes toujours sur `feature/user-notifications` ici, qui n'a jamais reçu le commit du hotfix — seul
`origin/hotfix/invoice-fix` l'a reçu, via la PR mergée. `git branch -d` refuse de supprimer une branch qu'il
ne voit pas comme mergée dans votre branch *courante*, et sort l'erreur « not fully merged ». Comme vous savez
qu'elle est bien mergée sur le remote, `-D` (force) est le bon choix, pas un contournement d'erreur.
</AlertBox>

### 6. Retour à votre branch de feature — rien n'a changé {#6-back-to-your-feature-branch--nothing-changed}

<Terminal typewriter>
cd ~/projects/my-blog
// Containers Docker : toujours en route
// Éditeur : toujours ouvert sur les mêmes fichiers
//git status : exactement comme vous l'aviez laissé
</Terminal>

Pas de stash, pas de conflits, pas de changement de contexte.

## Une contrainte : une branch ne peut être que dans un seul worktree à la fois {#one-constraint-a-branch-can-only-be-in-one-worktree-at-a-time}

Git l'impose. Si `feature/user-notifications` est checkoutée dans votre répertoire principal, vous ne pouvez pas ajouter un second worktree avec la même branch. Si vous essayez :

<Terminal typewriter>
fatal: 'feature/user-notifications' is already checked out at '/home/christophe/projects/my-blog'
</Terminal>

C'est volontaire — deux répertoires écrivant simultanément sur la même branch corrompraient l'arbre de travail. Chaque worktree a sa propre branch.

## Docker + worktrees : chaque branch a sa propre stack {#docker--worktrees-each-branch-gets-its-own-stack}

C'est là que les worktrees deviennent vraiment puissants dans un workflow Docker.

Chaque worktree est un répertoire séparé. Chaque répertoire peut avoir son propre fichier `.env` et sa propre stack Docker Compose en route, tant que vous évitez les conflits de ports.

Une convention pratique : un port différent par worktree. Gardez les ports dans `.env`, qui est dans le `.gitignore` :

<Terminal typewriter>
// ~/projects/my-blog/.env
APP_PORT=3000
DB_PORT=5432

// ~/projects/my-blog-hotfix/.env
APP_PORT=3001
DB_PORT=5433
</Terminal>

Vous pouvez maintenant lancer les deux stacks en même temps :

<Terminal>
// Terminal 1 — branch de feature
cd ~/projects/my-blog
docker compose up

// Terminal 2 — branch de hotfix
cd ~/projects/my-blog-hotfix
docker compose up
</Terminal>

Les deux serveurs tournent en même temps. Vous pouvez tester le hotfix sur `http://localhost:3001` sans arrêter le développement de votre feature sur `http://localhost:3000`.

<AlertBox variant="note" title="Projets Compose nommés">
Docker Compose utilise le nom du dossier comme nom de projet par défaut. Comme vos worktrees sont dans des dossiers différents, Compose crée automatiquement des réseaux et des ensembles de containers séparés — aucune configuration supplémentaire n'est nécessaire.
</AlertBox>

## Une fonction ZSH pour naviguer entre les worktrees {#a-zsh-function-to-navigate-between-worktrees}

Si vous suivez le pattern du <Link to="/blog/modular-zsh-workflow">workflow ZSH modulaire</Link>, vous pouvez ajouter un navigateur interactif de worktrees basé sur <Link to="/blog/linux-fzf-introduction">fzf</Link> :

<Snippet filename="gwt.zsh" source="./files/gwt.zsh" defaultOpen={false} />

Utilisation :

```bash
gwt                         # fzf picker — select any active worktree and cd into it
gwt feature/dark-mode       # create + cd into a new worktree for that branch
```

## Astuces pratiques {#practical-tips}

### Nommez les worktrees de manière cohérente {#name-worktrees-consistently}

Un schéma de nommage prévisible évite la confusion :

```bash
# Pattern: <repo-name>-<branch-slug>
git worktree add ../my-blog-hotfix-invoice hotfix/invoice-fix
git worktree add ../my-blog-feat-auth      feature/auth
```

### Les worktrees fonctionnent avec VS Code {#worktrees-work-with-vs-code}

Ouvrez un dossier de worktree dans une nouvelle fenêtre VS Code :

<Terminal typewriter>
$ code ../my-blog-hotfix
</Terminal>

Chaque fenêtre fonctionne indépendamment, avec ses propres fichiers ouverts et ses propres sessions de terminal.

### Élaguez les worktrees obsolètes {#prune-stale-worktrees}

Si vous supprimez manuellement un dossier de worktree (au lieu d'utiliser `git worktree remove`), git peut encore croire qu'il existe. Nettoyez les références obsolètes :

<Terminal typewriter>
git worktree prune
</Terminal>

## Conclusion {#conclusion}

| | `git stash` | `git worktree` |
|---|---|---|
| Changement de branch | Oui, obligatoire | Non — les branches coexistent |
| Containers Docker | À redémarrer | Tournent indépendamment |
| Contexte de l'éditeur | Perdu | Préservé |
| Développement parallèle | Non | Oui |
| Risque de conflit | Au `stash pop` | Aucun |
| Nettoyage | Automatique au pop | Manuel : `worktree remove` |

Le stash reste utile pour les petits trucs rapides — économiser une demi-ligne de frappe avant un `git pull`. Dès qu'il s'agit de services en cours d'exécution, d'une session d'éditeur ou de plus de cinq minutes de travail, un worktree est plus propre.

La première fois que vous traiterez un hotfix sans quitter votre branch de feature, vous vous demanderez comment vous avez pu travailler autrement.
