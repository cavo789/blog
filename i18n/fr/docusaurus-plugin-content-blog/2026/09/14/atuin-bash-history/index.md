---
slug: atuin-bash-history
title: Atuin — Boostez votre historique shell avec une base de données consultable et horodatée
description: Fatigué de perdre vos commandes dans le labyrinthe du CTRL+R par défaut ? Atuin remplace l'historique de votre shell par une TUI complète adossée à SQLite — horodatage, contexte, synchronisation multi-machines, et une comparaison claire avec la recherche d'historique basée sur FZF.
authors: [christophe, claude]
image: /img/v2/atuin.webp
mainTag: bash
tags: [bash, linux, zsh]
date: 2026-09-14
ai_assisted: true
---
![Atuin — Boostez votre historique shell](/img/v2/atuin.webp)

<!-- cspell:ignore atuin atuinsh preexec rcaloras yarnn randomblob -->

<TLDR>
L'historique shell par défaut est un cimetière de commandes que vous ne retrouverez jamais — pas d'horodatage, pas de contexte, 500 lignes et puis plus rien. Atuin le remplace par une TUI adossée à SQLite qui enregistre chaque commande avec son code de sortie, son répertoire de travail, sa durée et son horodatage. Vous obtenez un <kbd>CTRL</kbd>+<kbd>R</kbd> instantanément amélioré, avec filtrage par host ou par dossier, sans sacrifier votre historique existant. La seconde moitié de cet article détaille l'installation sur Bash et ZSH, et se termine par une comparaison en face à face avec l'approche classique FZF+history.
</TLDR>

Zut, ça recommence. J'ai tapé <kbd>CTRL</kbd>+<kbd>R</kbd>, cherché cette longue commande `docker run` que j'avais construite il y a trois semaines, et rien — ou pire, la mauvaise version de mardi dernier. L'historique bash par défaut est juste... insuffisant. Cinq cents lignes, pas d'horodatage, aucun contexte sur le dossier où vous étiez ni même sur le succès de la commande.

<Link to="/blog/linux-history">J'ai déjà écrit sur les astuces d'historique intégrées</Link> — `HISTSIZE`, `HISTTIMEFORMAT`, `fc`, la recherche inversée — et ça aide, oui. Mais ce sont des contournements, pas une solution. Vous cherchez toujours dans un fichier texte plat sans aucune donnée structurée.

Atuin change complètement la donne.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le voir en action", to: "#seeing-it-in-action-with-docker" },
    { label: "L'installer pour de vrai", to: "#installing-atuin" },
    { label: "Atuin vs. FZF", to: "#atuin-vs-fzf-history" },
  ]}
/>

## Qu'est-ce qu'Atuin ? {#what-is-atuin}

[Atuin](https://github.com/atuinsh/atuin) (le nom est un clin d'œil à la tortue-monde de Terry Pratchett) remplace l'historique de votre shell. Au lieu d'ajouter les commandes à `~/.bash_history`, il écrit chaque commande dans une base SQLite locale avec des métadonnées riches :

- **Horodatage** — quand l'avez-vous lancée ?
- **Durée** — combien de temps a-t-elle pris ?
- **Code de sortie** — a-t-elle réussi ?
- **Répertoire de travail** — où étiez-vous ?
- **Nom d'host** — sur quelle machine ?

Quand vous appuyez sur <kbd>CTRL</kbd>+<kbd>R</kbd>, au lieu du minuscule prompt de recherche inversée incrémentale, Atuin ouvre une TUI plein écran où vous pouvez taper, filtrer par host ou par répertoire, et naviguer aux flèches. Ça fonctionne sur Bash, ZSH, Fish et Nushell. Une synchronisation cloud chiffrée de bout en bout, optionnelle, permet de partager l'historique entre machines — mais c'est entièrement facultatif ; Atuin fonctionne parfaitement hors ligne et en local.

<AlertBox variant="note" title="Aucun cloud requis">
La synchronisation d'Atuin est optionnelle. Si vous ne lancez jamais `atuin register` ni `atuin login`, votre historique reste 100 % local dans `~/.local/share/atuin/history.db`. Cet article ne traite que de l'expérience locale.
</AlertBox>

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

*Vous connaissez déjà Atuin, ou vous voulez juste l'avoir sur votre machine ? [Passez directement à l'installation](#installing-atuin) — ce chapitre n'est qu'un container jetable pour l'essayer sans risque.*

Vous me connaissez bien maintenant — j'aime tout mettre en container. Avant d'installer quoi que ce soit sur votre machine, montons un container jetable pour que vous sentiez ce qu'Atuin donne en pratique.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Un container Docker vous permet de tester Atuin sans toucher à la configuration réelle de votre shell. Si ça ne vous plaît pas, vous supprimez le container. Aucun hook résiduel dans votre `~/.bashrc`.
</AlertBox>

Deux fichiers dans un dossier — et tous les deux sont de l'**échafaudage de démo, rien d'autre**. `seed-history.sh` en particulier ne fait pas partie de l'usage d'Atuin : son seul rôle est de fabriquer un historique plausible pour que l'écran suivant ait quelque chose à montrer. Aucun de ces deux fichiers n'a sa place sur votre propre machine, où [installer Atuin](#installing-atuin) se résume à un `brew install`.

<ProjectSetup folderName="/tmp/atuin-demo">
  <Guideline>
    Construisez l'image et démarrez le container : `docker build -t atuin-demo . && docker run --rm -it atuin-demo`
  </Guideline>

  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
  <Snippet filename="seed-history.sh" source="./files/seed-history.sh" />
</ProjectSetup>

<Terminal title="user@machine: ~/atuin-demo">
$ docker build -t atuin-demo .
[+] Building 28.3s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it atuin-demo
Atuin history seeded with 51 commands.
root@4f2a1b3c9d8e:/#
</Terminal>

Ne tapez rien — appuyez tout de suite sur <kbd>CTRL</kbd>+<kbd>R</kbd> :

<Terminal>
[atuin] > _
──────────────────────────────────────────────────────────────────────────
  1  [exit 0]  1s     12m   ~/projects/blog  docker compose up -d
  2  [exit 0]  320ms  15m   ~/projects/blog  git status
  3  [exit 1]  90ms   18m   ~/projects/blog  git push origin main
  4  [exit 0]  140ms  21m   ~/projects/blog  git pull --rebase
  5  [exit 0]  12s    26m   ~/projects/blog  yarn build
  6  [exit 0]  760ms  34m   ~/projects/blog  yarn lint
  7  [exit 0]  95ms   41m   ~/projects/blog  rg --type md "atuin" .
  8  [exit 0]  210ms  47m   ~/projects/blog  fzf --preview 'bat --color=always {}'
  9  [exit 127] 30ms  55m   ~/projects/blog  yarnn start
 10  [exit 0]  45ms   58m   ~/projects/blog  yarn start
──────────────────────────────────────────────────────────────────────────
  ↑/↓ navigate  Enter select  Ctrl+D delete  Esc quit
</Terminal>

Code de sortie, durée, horodatage et répertoire de travail — tout dans une seule vue. L'entrée 9 est typiquement ce que vous ne voyez qu'avec Atuin : une faute de frappe (`yarnn`) morte avec le code 127, juste à côté de la commande corrigée qui a suivi trois minutes plus tard.

Maintenant commencez à taper. Tapez `git` et la liste se réduit aux commandes git ; tapez `docker` et vous atteindrez des commandes lancées dans un *autre* répertoire de projet, et même sur une autre machine — les données de démo couvrent deux noms d'host et trois sessions shell, donc le filtre <kbd>CTRL</kbd>+<kbd>F</kbd> a vraiment de quoi travailler.

Cet historique ne sort pas de nulle part : `seed-history.sh` l'écrit directement dans la base SQLite d'Atuin avant le démarrage du shell — son commentaire d'en-tête explique pourquoi, si ça vous intéresse. Passons d'abord à la vraie installation.

## Installer Atuin {#installing-atuin}

Si vous voulez garder Atuin en permanence sur votre machine (et ce sera le cas, après la démo), utilisez votre gestionnaire de packages. Atuin est dans tous les habituels, et c'est de loin la façon la moins excitante de l'obtenir — c'est exactement ce qu'on attend d'une installation.

### Utilisez simplement Homebrew {#just-use-homebrew}

<Terminal title="user@machine: ~">
$ brew install atuin
</Terminal>

C'est tout. La formule `atuin` de Homebrew suit l'upstream de près — 18.22.0 au moment où j'écris, la même version que la dernière release GitHub — et elle fournit une bottle précompilée pour **Linux comme pour macOS**, donc c'est tout autant la bonne réponse dans WSL.

La formule elle-même est publique et relue via une pull request, le binaire vient d'une bottle construite par la CI de Homebrew, et `brew upgrade atuin` le maintiendra à jour ensuite — vous n'aurez pas besoin de revenir sur cette page pour ça.

<Details label="Vous n'avez pas encore Homebrew ?">

Installer Homebrew implique un `curl` redirigé dans `bash` — j'ai fait exactement ça <Link to="/blog/reduce-image-size">dans un article précédent</Link>, et c'est la commande que brew.sh publie. Inutile de prétendre le contraire.

Une chose en fait un marché plus honnête que la plupart : le script vit dans le repository public [`Homebrew/install`](https://github.com/Homebrew/install), vous pouvez donc épingler une révision que vous avez réellement lue plutôt que d'exécuter ce qui traîne sur la branch aujourd'hui.

```bash
SHA=8949852f785a3bacaba2a979d0790337950b0a4a
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/${SHA}/install.sh)"
```

Sur Apple Silicon vous pouvez éviter tout ça : Homebrew fournit un [`Homebrew.pkg`](https://github.com/Homebrew/brew/releases/latest) signé.

</Details>

<AlertBox variant="note" title="Il n'y a pas de package apt">
Atuin n'est **pas** dans les repositories Debian ou Ubuntu, donc ne cherchez pas `apt install atuin`. Si vous avez une toolchain Rust, `cargo install atuin` est une autre voie honnête : il construit depuis les sources publiées plutôt que de faire confiance à un binaire précompilé.
</AlertBox>

### Sous Windows : winget {#on-windows-winget}

Le lecteur habituel de ce blog tourne sous WSL, donc celui-ci mérite un mot à part. Atuin est dans le Windows Package Manager :

<Terminal title="PS C:\\Users\\christophe">
PS> winget install -e --id Atuinsh.Atuin
</Terminal>

Même forme de garantie qu'avec Homebrew : le manifeste vit dans le repository public `microsoft/winget-pkgs`, relu par pull request, et il épingle le SHA-256 de l'installeur — winget refuse donc tout ce qui ne correspond pas.

<AlertBox variant="caution" title="Windows et WSL, deux historiques distincts">
`winget` installe `atuin.exe`, le build Windows — il vous donne Atuin dans PowerShell et CMD, **pas** dans votre shell WSL. Si vous vivez dans WSL, l'historique qui vous intéresse vraiment est celui enregistré par le binaire *Linux*, installé dans votre distribution, avec sa propre base sous `~/.local/share/atuin/`. Installez les deux si vous voulez les deux ; ce sont deux installations et deux historiques sans rapport.
</AlertBox>

### Sans gestionnaire de packages {#without-a-package-manager}

<Details label="Télécharger le binaire de la release et le vérifier">

<Vars version="18.22.0" />

Chaque release fournit un binaire simple. Prenez le build **musl** : il est lié statiquement et tourne partout, alors que le `-gnu` veut une glibc récente et meurt avec `GLIBC_2.39 not found` sur les distributions plus anciennes.

<Terminal title="user@machine: ~">
$ V=%%version=18.22.0%%
$ BASE=https://github.com/atuinsh/atuin/releases/download/v$V
$ curl -fsSLO $BASE/atuin-x86_64-unknown-linux-musl.tar.gz
$ curl -fsSLO $BASE/atuin-x86_64-unknown-linux-musl.tar.gz.sha256
$ sha256sum -c atuin-x86_64-unknown-linux-musl.tar.gz.sha256
atuin-x86_64-unknown-linux-musl.tar.gz: OK
</Terminal>

Ensuite, mettez-le dans votre `PATH` :

<Terminal title="user@machine: ~">
$ tar -xzf atuin-x86_64-unknown-linux-musl.tar.gz
$ sudo install -m 755 atuin-x86_64-unknown-linux-musl/atuin /usr/local/bin/atuin
$ atuin --version
atuin %%version=18.22.0%%
</Terminal>

Les releases d'Atuin embarquent aussi des [attestations de build signées](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds) — une preuve cryptographique du workflow qui a construit le binaire, vérifiable avec `gh attestation verify`. Bon à savoir ; pas indispensable pour démarrer.

</Details>

### En dernier recours : le one-liner officiel {#last-resort-the-official-one-liner}

La documentation d'Atuin met en avant un `curl` redirigé directement dans `sh`. Vous le croiserez partout, donc je ne vais pas prétendre qu'il n'existe pas — mais vous devrez aller le chercher, et lire ceci d'abord.

<AlertBox variant="danger" title="Ceci confie votre machine à qui contrôle ce domaine">
`curl … | sh` télécharge un script et l'exécute **immédiatement**, avec vos propres droits, sans que vous en voyiez une seule ligne. Si `setup.atuin.sh` est compromis un jour — domaine détourné, identifiant fuité, entrée CDN empoisonnée — alors ce que l'attaquant y a laissé s'exécute sur votre machine dès que vous appuyez sur Entrée. Aucune signature à vérifier, aucune révision à épingler, aucun diff à lire, et aucune trace ensuite.

Les flags `--proto '=https' --tlsv1.2` ne sont pas la garantie qu'ils semblent être : ils sécurisent le *transport*, et ne disent absolument rien du contenu qui arrive.

Utilisez `brew install atuin` plus haut, ou l'installation du binaire vérifié juste au-dessus. Ne recourez à celle-ci que sur une machine qui n'a ni l'un ni l'autre.

<Details label="Je comprends le risque — montrez-moi la commande quand même">

<Terminal title="user@machine: ~">
$ curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh
</Terminal>

</Details>

</AlertBox>

## Brancher Atuin dans votre shell {#wiring-atuin-into-your-shell}

Quelle que soit la route choisie, le binaire est sur votre machine mais votre shell ignore encore son existence — <kbd>CTRL</kbd>+<kbd>R</kbd> est inchangé pour l'instant. Le brancher tient en deux lignes, et ce sont justement les deux lignes qui valent la peine d'être comprises.

### Bash {#bash}

Ajoutez ces deux lignes à la **fin** de votre `~/.bashrc` :

```bash title="~/.bashrc"
source /path/to/bash-preexec.sh   # skip if you're on Bash 4.4+
eval "$(atuin init bash)"
```

<AlertBox variant="note" title="bash-preexec sur Bash moderne">
`bash-preexec` est une petite bibliothèque de hooks qui donne à Bash le mécanisme `precmd` / `preexec` que ZSH possède nativement ; Atuin l'utilise pour intercepter une commande avant et après son exécution, ce qui lui permet d'enregistrer le code de sortie et la durée. Sur Bash 4.4+ (la plupart des distributions Linux récentes), c'est optionnel. Atuin retombe sur un hook plus simple. Si vous voulez le suivi complet du code de sortie et de la durée, gardez `bash-preexec`. Sur Ubuntu 24.04 (Bash 5.2), ça marche très bien sans — mais la démo Docker l'inclut pour une compatibilité maximale.
</AlertBox>

Puis rechargez votre shell :

<Terminal title="user@machine: ~">
$ source ~/.bashrc
</Terminal>

### ZSH {#zsh}

Si vous utilisez déjà ZSH (et vous devriez — <Link to="/blog/zsh-install">voici comment le mettre en place</Link>), Atuin s'intègre encore plus proprement car ZSH a des hooks `preexec`/`precmd` natifs. Aucune dépendance supplémentaire.

Ajoutez à `~/.zshrc` :

```zsh title="~/.zshrc"
eval "$(atuin init zsh)"
```

Puis rechargez :

<Terminal title="user@machine: ~">
$ source ~/.zshrc
</Terminal>

Si vous suivez <Link to="/blog/modular-zsh-workflow">un workflow ZSH modulaire</Link>, placez la ligne `eval` dans son propre fichier — par ex. `~/.zsh/plugins/atuin.zsh` — et sourcez-le depuis votre `~/.zshrc` principal. Ça garde votre config propre et facile à activer/désactiver.

## Importer votre historique existant {#import-your-existing-history}

Atuin importe votre `~/.bash_history` ou `~/.zsh_history` actuel au premier lancement. Vous pouvez aussi le déclencher manuellement :

<Terminal title="user@machine: ~">
$ atuin import auto
 ✓  Importing history from /home/christophe/.bash_history
   Imported 4 823 commands
</Terminal>

Vos anciennes commandes sont maintenant dans la base avec leurs horodatages d'origine (s'il y en avait). Vous ne perdez rien.

## Configurer Atuin {#configuring-atuin}

La configuration d'Atuin vit dans `~/.config/atuin/config.toml`. Les valeurs par défaut sont raisonnables, mais quelques options valent le détour :

```toml title="~/.config/atuin/config.toml"
# How many results to show in the TUI
search_mode = "fuzzy"      # or "prefix", "fulltext"

# Filter by current directory by default (toggle with CTRL+F in the TUI)
filter_mode = "global"     # or "host", "session", "directory"

# Show the full command, not a truncated one
show_preview = true

# Inline TUI instead of full-screen overlay
style = "compact"          # or "full" (default), "auto"
```

Redémarrez votre shell après édition pour appliquer les changements.

## Atuin vs. l'historique FZF {#atuin-vs-fzf-history}

<Link to="/blog/linux-fzf-introduction">FZF</Link> est la référence absolue de la recherche floue dans le terminal — y compris pour l'historique shell via <kbd>CTRL</kbd>+<kbd>R</kbd> quand il est branché avec le `fzf-history-widget`. Alors, comment Atuin se compare-t-il ?

| Fonctionnalité | Atuin | FZF + history |
| --------- | ------- | --------------- |
| **Backend** | Base SQLite | Fichier texte plat |
| **Horodatage** | Toujours enregistré | Seulement si `HISTTIMEFORMAT` est défini |
| **Code de sortie** | Oui | Non |
| **Durée** | Oui | Non |
| **Répertoire de travail** | Oui | Non |
| **Synchro multi-machines** | Oui (optionnelle, chiffrée E2E) | Non |
| **Recherche floue** | Oui (intégrée) | Oui (via FZF) |
| **Filtrer par répertoire** | Oui (`CTRL+F` dans la TUI) | Non |
| **Filtrer par host** | Oui | Non |
| **Shells supportés** | Bash, ZSH, Fish, Nu | Bash, ZSH, Fish |
| **Dépendances** | Un binaire | Binaire FZF + plugin shell |
| **Import de l'historique existant** | Oui | N/A (lit déjà le même fichier) |
| **Configuration** | Fichier TOML | Flags en variables de shell |
| **TUI** | Panneau plein écran | En ligne (ou plein avec `--height=100%`) |

Aucun des deux n'est strictement meilleur — ça dépend de vos besoins :

- **Utilisez FZF** si vous l'avez déjà branché dans votre workflow pour autre chose (recherche de fichiers, branches git, contextes kubectl…) et que vous n'avez besoin que d'une recherche inversée basique. L'intégration FZF de <kbd>CTRL</kbd>+<kbd>R</kbd> est légère et ne demande ni daemon ni base de données.
- **Utilisez Atuin** si vous vous souciez du **pourquoi** une commande a tourné (code de sortie, durée, répertoire) et que vous voulez un historique qui survit aux migrations de machine et se corrèle entre hosts. Le modèle base de données rend la recherche d'Atuin structurellement plus riche.

Ils ne sont pas mutuellement exclusifs. Certains font tourner les deux : Atuin pour <kbd>CTRL</kbd>+<kbd>R</kbd> (recherche structurée et horodatée) et FZF pour tout le reste (navigation de fichiers, complétions floues). <Link to="/blog/fzf-ripgrep">Combiner FZF avec ripgrep</Link> pour la recherche dans le code reste un cas d'usage différent auquel Atuin ne touche jamais.

<AlertBox variant="tip" title="Désactiver le CTRL+R d'Atuin pour garder celui de FZF">

Si vous voulez qu'Atuin enregistre l'historique en silence tout en gardant le binding <kbd>CTRL</kbd>+<kbd>R</kbd> de FZF, ajoutez ceci à votre config :

```toml title="~/.config/atuin/config.toml"
[keys]
scroll_exits = false
```

Et dans votre shell, bindez manuellement <kbd>CTRL</kbd>+<kbd>R</kbd> sur `fzf-history-widget` après avoir sourcé Atuin. Atuin continuera de capturer et stocker les commandes ; il n'interceptera juste plus la touche.
</AlertBox>

## Conclusion {#conclusion}

La recherche inversée <kbd>CTRL</kbd>+<kbd>R</kbd> par défaut a été conçue à une époque où 500 commandes paraissaient largement suffisantes. Ce n'est plus le cas — pas quand vous jonglez entre builds Docker, workflows git, sessions SSH sur une demi-douzaine d'hosts et fonctions shell qui ont pris une heure à mettre au point. Atuin donne à cet historique la structure qu'il mérite : une vraie base de données, de vrais horodatages, un vrai contexte.

La démo Docker est la meilleure façon de sentir la différence sans engagement. Lancez-la, appuyez sur <kbd>CTRL</kbd>+<kbd>R</kbd>, et trois semaines d'historique sont déjà là à vous attendre — vous verrez immédiatement pourquoi un fichier plat ne suffit pas. Si vous êtes déjà <Link to="/blog/linux-fzf-introduction">FZF user</Link>, ne voyez pas Atuin comme un remplaçant — voyez-le comme ce qui arrive quand on applique le principe « les données structurées battent le texte brut » à l'outil que vous utilisez plus que tous les autres.

Maintenant, chaque fois que je me trompe sur cette incantation `tar` parfaite ou que j'oublie dans quel répertoire j'étais quand ce script a enfin marché, Atuin s'en souviendra pour moi.
