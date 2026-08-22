# 0103 — Ajouter une démo "Docker first" jouable à chaque article outil CLI/shell

- **Priority**: Medium
- **Batch**: docker-first-demos
- **Depends**: —
- **Files**: `blog/2024/03/28/zsh-install`, `blog/2024/03/29/zsh-plugin-autosuggestions`, `blog/2024/03/29/zsh-syntax-highlighting`, `blog/2024/03/30/linux-fzf-introduction`, `blog/2024/07/23/linux-eza`, `blog/2026/06/15/git-delta`, `blog/2026/07/06/ripgrep`, `blog/2026/06/08/fzf-ripgrep`, `blog/2023/12/13/linux-jq`, `blog/2023/12/13/linux-xmlstarlet`, `blog/2025/02/13/zsh-plugin-ssh-config-suggestions`, `blog/2026/04/27/ssh_with_fzf`, `blog/2026/06/29/git-worktree`, `blog/2026/04/06/git_branches_gst`, `.unpublished/navi`, `.unpublished/direnv`, `.unpublished/linux-yq`, `.unpublished/oha-http-load-testing`, `.unpublished/ssh-proxyjump`, `.unpublished/git-bisect`, `.unpublished/git-interactive-rebase`

## Problème

L'article `.unpublished/atuin-bash-history` propose un `Dockerfile` prêt à l'emploi : le lecteur
fait `docker build` puis `docker run` et se retrouve directement dans un shell où Atuin est déjà
installé **et déjà câblé** (hook `bash-preexec` + `eval "$(atuin init bash)"` ajoutés au
`.bashrc` par le Dockerfile lui-même). Il n'a rien à configurer — il tape des commandes, appuie
sur `Ctrl+R`, et voit le résultat.

Tous les autres articles qui présentent un outil CLI/shell (installateur, plugin ZSH, binaire de
remplacement...) demandent au contraire au lecteur d'installer sur sa vraie machine avant de
pouvoir juger — le point le plus faible de leur time-to-value, et pour les outils qui touchent
`~/.bashrc`/`~/.zshrc` (zsh-install, direnv, ssh config...), un vrai risque perçu ("je ne veux pas
polluer ma config pour un test").

## Solution — méthode à répliquer (référence : `.unpublished/atuin-bash-history/files/Dockerfile`)

Pour chaque article listé ci-dessous :

1. Créer `files/Dockerfile` (co-localisé, comme Atuin) qui :
   - installe l'outil (binaire téléchargé/`apt`/`curl | tar`, jamais de `git clone` complet si un
     simple binaire suffit) ;
   - **câble déjà** l'outil dans le shell interactif (ligne ajoutée au `.bashrc`/`.zshrc` par le
     Dockerfile, pas laissée à faire par le lecteur) ;
   - **pré-remplit le contexte de test** quand l'outil en a besoin, pour que le lecteur n'ait
     aucune étape de setup à faire une fois dans le conteneur — c'est le point demandé
     explicitement : par exemple pour **direnv**, créer déjà un dossier projet avec un `.envrc`
     et un `.env` d'exemple ; pour **ssh-proxyjump**, un faux hôte bastion + hôte cible
     joignables ; pour **git-bisect**/**git-interactive-rebase**/**git-worktree**, un dépôt
     `git init` avec plusieurs commits (dont un "cassé") déjà en place ; pour **linux-yq**/
     **linux-jq**/**linux-xmlstarlet**, un fichier d'exemple (`sample.yaml`/`.json`/`.xml`) déjà
     présent dans le conteneur ; pour **navi**, quelques `.cheat` d'exemple déjà chargés.
   - se termine par `CMD ["/bin/bash", "-i"]` (ou `zsh -i` si l'article est ZSH-first) pour que
     `docker run --rm -it` dépose directement le lecteur dans un shell prêt à jouer.
2. Ajouter dans l'article une section "Seeing It in Action with Docker" (même structure que
   l'article Atuin) : `<Snippet>` du Dockerfile, `<AlertBox variant="tip">` expliquant pourquoi
   Docker first, `<Terminal>` de build+run, puis 2-3 commandes d'exemple **déjà exécutables sans
   réflexion** (pas de placeholder à remplacer par le lecteur).
3. Placer cette section **avant** la section installation manuelle sur la vraie machine — le
   lecteur doit pouvoir juger avant d'installer quoi que ce soit chez lui.

Objectif explicite du lecteur : « je lance Docker et je peux immédiatement jouer, sans effort de
préparation ». Un exemple qui demande encore de créer un fichier, éditer une valeur ou deviner un
nom de host avant de pouvoir taper la commande qui compte n'est pas terminé.

## Déjà conformes — à vérifier seulement, pas à refaire

- [x] `.unpublished/hyperfine` — Dockerfile + démo Docker-first déjà présents
- [x] `.unpublished/lazydocker` — idem
- [x] `.unpublished/duckdb-json-csv` — idem

## Articles publiés — à traiter

- [x] `blog/2024/03/28/zsh-install` — Oh-My-Zsh (réécrit `~/.zshrc`, le candidat le plus fort)
- [x] `blog/2024/03/29/zsh-plugin-autosuggestions`
- [x] `blog/2024/03/29/zsh-syntax-highlighting`
- [x] `blog/2024/03/30/linux-fzf-introduction` — article fondateur de la série "Modern CLI tools"
- [x] `blog/2024/07/23/linux-eza`
- [x] `blog/2026/06/15/git-delta`
- [x] `blog/2026/07/06/ripgrep` — attention : l'article contient déjà le mot "Dockerfile" mais
      seulement comme exemple de fichier cherché par `rg`, ce n'est pas une démo Docker-first
- [x] `blog/2026/06/08/fzf-ripgrep`
- [x] `blog/2023/12/13/linux-jq`
- [x] `blog/2023/12/13/linux-xmlstarlet`
- [x] `blog/2025/02/13/zsh-plugin-ssh-config-suggestions`
- [x] `blog/2026/04/27/ssh_with_fzf`
- [x] `blog/2026/06/29/git-worktree`
- [x] `blog/2026/04/06/git_branches_gst`

## Drafts (`.unpublished/`) — à traiter avant publication

- [x] `.unpublished/navi`
- [x] `.unpublished/direnv` — pré-créer un dossier projet avec `.envrc` + `.env` d'exemple
- [x] `.unpublished/linux-yq`
- [x] `.unpublished/oha-http-load-testing`
- [x] `.unpublished/ssh-proxyjump` — finalement fait avec UN SEUL conteneur (2 sshd sur ports
      différents + service web interne), plus simple pour le lecteur qu'un compose à 2 conteneurs
- [x] `.unpublished/git-bisect` — pré-créer un dépôt avec un historique + un commit cassé
- [x] `.unpublished/git-interactive-rebase` — pré-créer un dépôt avec un historique à nettoyer

## Risque

- **Démo qui ne "joue" pas vraiment.** Si le lecteur doit encore éditer un fichier ou deviner une
  valeur avant la première commande utile, l'objectif n'est pas atteint — vérifier à chaque
  article en se mettant à la place d'un lecteur qui ne connaît pas le repo.
- **Dockerfiles à maintenir.** Chaque `files/Dockerfile` fige une version d'outil (binaire
  téléchargé) — comme pour Atuin, documenter la version dans un commentaire pour faciliter un
  futur bump lors d'un passage `/freshness`.
- **Ne pas dupliquer un Dockerfile déjà couvert par `/docker-review`** — ces fichiers sont des
  exemples d'article (cf. CLAUDE.md, "jamais optimisés par défaut"), donc hors périmètre de ce
  reviewer ; pas d'action croisée à prévoir.

## Acceptance

- [x] Chaque article coché ci-dessus a un `files/Dockerfile` co-localisé + une section "Seeing It
      in Action with Docker" placée avant l'installation manuelle — 21/21, les 3 "déjà conformes"
      inclus
- [x] Dans chaque conteneur, `docker run --rm -it <image>` dépose le lecteur dans un shell où
      l'outil est déjà installé, câblé, et le contexte de test (fichiers/repo/hôtes d'exemple)
      déjà en place — zéro étape de préparation restante. Vérifié par un vrai `docker build` +
      exécution pour les 21 Dockerfiles (pas juste écrits sur la foi du Dockerfile) ; deux bugs
      réels attrapés et corrigés au passage : linux-yq's `.services|keys` order (l'article disait
      "db, web", le vrai ordre est "web, db") et navi's install URL (nom de fichier de release
      obsolète, manque le préfixe de version).
- [x] `yarn lint && yarn format:check && yarn build` passent après chaque article modifié —
      vérifié le 2026-08-22 pour l'ensemble des 21 articles

## Note — invite whale-prompt (2026-08-22)

À la demande de l'utilisateur, chaque Dockerfile signale maintenant clairement qu'on est dans un
conteneur via un `PS1`/`PROMPT` avec l'emoji 🐳 (`echo "PS1='\n\e[0;33m🐳 ...'" >> ~/.bashrc` pour
bash, équivalent `PROMPT='%B%F{yellow}🐳 ...'` pour zsh — les échappements bash `\w`/`\$(...)` ne
sont pas interprétés par zsh, adapté en conséquence, vérifié par build+run réel). Les transcripts
`<Terminal>` déjà écrits ont été mis à jour en conséquence (prompt affiché après `docker run`).
Chaque `<Snippet>` de Dockerfile utilise aussi `defaultOpen={false}` (préférence utilisateur).
