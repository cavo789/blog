---
slug: fzf-ripgrep
title: "FZF + ripgrep : recherche de code interactive avec aperçu en direct"
date: 2026-06-08
authors: [christophe]
image: /img/v2/fzf_ripgrep.webp
series: Modern CLI tools for your terminal
description: Combinez ripgrep et fzf avec un panneau d'aperçu coloré par bat pour construire une recherche de code interactive — puis ouvrez le résultat directement dans VSCode, à la ligne exacte.
mainTag: fzf
tags:
  - bash
  - fzf
  - linux
  - zsh
language: fr
ai_assisted: true
blueskyRecordKey: 3mnrw7ah2kc2o
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---

![FZF + ripgrep : recherche de code interactive avec aperçu en direct](/img/v2/fzf_ripgrep.webp)

<TLDR>
`grep -r` renvoie une liste plate — pas de contexte, pas d'aperçu, aucun moyen de naviguer sans ouvrir le fichier. En envoyant `ripgrep` dans `fzf` et en ajoutant un panneau d'aperçu `bat`, vous obtenez une recherche de code interactive et colorée, qui ressemble à la barre de recherche d'un IDE mais vit entièrement dans votre terminal. Cet article construit une fonction ZSH `rgf` qui cherche dans votre code, affiche un aperçu en direct du fichier trouvé et saute directement à la bonne ligne dans VSCode quand vous appuyez sur <kbd>Enter</kbd>.
</TLDR>

Vous cherchez où une variable d'environnement est lue, ou quel fichier contient encore cette URL codée en dur que vous vouliez nettoyer. Vous lancez `grep -rn "DB_PASSWORD" .` et vous récupérez quarante lignes de noms de fichiers, de numéros de ligne et d'extraits — tout mélangé. Vous en choisissez une, vous ouvrez le fichier, vous défilez jusqu'à la bonne ligne, vous constatez que ce n'est pas celle-là, vous fermez et vous recommencez.

Il y a mieux.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le panneau d'aperçu en action", to: "#seeing-the-preview-panel" },
    { label: "Étape 3 — La fonction rgf", to: "#step-3--the-rgf-function" },
  ]}
/>

## Le panneau d'aperçu en action {#seeing-the-preview-panel}

Envoyez `ripgrep` dans `fzf` avec un aperçu `bat` attaché, et voici le résultat — un panneau en direct, avec coloration syntaxique, qui se met à jour au fil de vos déplacements :

![Recherche de DB_PASSWORD avec aperçu](./images/rg_fzf_bat.webp)

Quand vous déplacez le curseur dans la liste des résultats, le panneau de droite se met à jour en direct — il affiche le fichier avec coloration syntaxique, la ligne trouvée surlignée en jaune et quelques lignes de contexte autour.

## Pourquoi ripgrep plutôt que grep ? {#why-ripgrep-instead-of-grep}

`grep -r` suffit pour un petit projet. `ripgrep` est conçu pour le monde réel :

- Il **respecte automatiquement `.gitignore`** — fini les résultats venant de `node_modules`, `vendor` ou des dossiers de build.
- Il est **nettement plus rapide** sur les gros projets, grâce au traitement parallèle et à un parcours de fichiers plus intelligent.
- Son format de sortie (`file:line:content`) est pensé pour l'intégration avec d'autres outils.

Une comparaison rapide — recherche de `TODO` dans un projet Node.js contenant `node_modules` :

<Terminal typewriter source="./files/terminal-1.txt" />

La vitesse et la réduction du bruit justifient à elles seules le changement.

## Prérequis {#prerequisites}

Cet article s'appuie sur <Link to="/blog/linux-fzf-introduction">fzf</Link>, que vous devriez déjà avoir installé. Deux outils supplémentaires sont nécessaires : **ripgrep** et **bat**.

### ripgrep {#ripgrep}

> [ripgrep](https://github.com/BurntSushi/ripgrep) est un outil de recherche en ligne de commande rapide qui parcourt récursivement les fichiers à la recherche de motifs de texte, avec les performances de Rust, tout en respectant automatiquement `.gitignore` et les règles d'exclusion similaires.

*Je lui ai consacré un article complet : <Link to="/blog/ripgrep">ripgrep — The Search Tool That Changed My WSL2 Workflow</Link>.*

<Prerequisite
  name="ripgrep"
  install="sudo apt install ripgrep"
  check="rg --version"
  checkOutput="ripgrep 14.1.0"
  typewriter
/>

### bat {#bat}

[bat](https://github.com/sharkdp/bat) (batcat sur Debian/Ubuntu) est un remplaçant moderne de cat qui affiche les fichiers avec coloration syntaxique, intégration Git, pagination et d'autres fonctionnalités pratiques pour les développeurs. Il sert ici à alimenter le panneau d'aperçu.

<Prerequisite
  name="bat"
  install="sudo apt install bat"
  check="bat --version"
  checkOutput="bat 0.24.0"
  typewriter
/>

<AlertBox variant="note" title="batcat sur Ubuntu/Debian">
Sur certains systèmes Ubuntu/Debian, le binaire s'appelle `batcat` et non `bat`. Si c'est votre cas, remplacez simplement *bat* par *batcat* dans la suite de cet article.
</AlertBox>

## Essayer avec Docker {#seeing-it-in-action-with-docker}

Avant d'installer `ripgrep`, `fzf` et `bat` sur votre machine, essayez `rgf` dans un container jetable
qui contient déjà les trois, la fonction elle-même branchée via un véritable autoload ZSH, et un petit
projet de démo qui correspond à la section « Scénarios concrets » plus bas : un `DB_PASSWORD` qui fuit, trois
marqueurs `TODO`/`FIXME`/`HACK`, un appel à `sendEmail`, un port codé en dur et une interface
TypeScript.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous reproduit `rgf` à l'octet près depuis le Snippet plus bas, plus le
câblage `fpath`/`autoload` décrit à l'étape 3. Pas besoin de VSCode pour essayer : `rgf` se replie sur
l'affichage de `file:line` dans le terminal quand `code` n'est pas dans `$PATH`, ce qui est exactement le cas
dans ce container.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Construisez-le et lancez-le :

<Terminal title="user@machine: ~/rgf-demo">
$ docker build -t rgf-demo .
[+] Building 32.5s (11/11) FINISHED
 ✔ exporting to image

$ docker run --rm -it rgf-demo
🐳 root ~/demo #
</Terminal>

Essayez maintenant, en direct, les scénarios exacts de la section « Scénarios concrets » ci-dessous :

```bash
rgf "DB_PASSWORD"        # the leaking secret in config/.env
rgf "TODO|FIXME|HACK"    # all three markers across the demo project
rgf "sendEmail"          # the call site in notifications.js
rgf -t ts "interface UserProps"
```

Chacun ouvre le même panneau « liste + aperçu » que la capture d'écran en haut de cet
article — naviguez avec <kbd>↑</kbd>/<kbd>↓</kbd>, filtrez en tapant, appuyez sur <kbd>Enter</kbd> pour
sélectionner. Comme il n'y a pas de VSCode dans le container, `rgf` affiche `file:line` dans le terminal
au lieu d'ouvrir un éditeur — tout le reste se comporte exactement comme sur votre propre machine.

## Étape 1 — Brancher ripgrep sur fzf {#step-1--connect-ripgrep-to-fzf}

La combinaison la plus simple bat déjà `grep` tout seul :

```bash
rg "DB_PASSWORD" | fzf
```

![Recherche de DB_PASSWORD sans aperçu](./images/rg_fzf.webp)

Vous obtenez une liste interactive et filtrable. Tapez quelques lettres pour affiner les résultats. Appuyez sur <kbd>Enter</kbd> pour afficher la ligne sélectionnée. Appuyez sur <kbd>Esc</kbd> pour sortir sans rien sélectionner.

Mais cela n'affiche que la ligne trouvée — aucun contexte, aucun aperçu du code autour.

## Étape 2 — Ajouter un panneau d'aperçu bat {#step-2--add-a-bat-preview-panel}

C'est là que ça devient intéressant. `fzf` propose une option `--preview` qui exécute une commande arbitraire pour chaque ligne surlignée et affiche sa sortie dans un panneau latéral.

```bash
rg --color=always --line-number --no-heading --smart-case "DB_PASSWORD" \
  | fzf --ansi \
        --delimiter=':' \
        --preview='bat --color=always --highlight-line {2} -- {1}' \
        --preview-window='right:60%:+{2}+3/3:~3'
```

C'est la commande derrière la capture d'écran en haut de cet article. Voyons ce que fait chaque option :

<StepsCard
  variant="remember"
  title="Référence des options"
  steps={[
    {
      content: "**`--color=always`** (rg) — Force une sortie colorée même quand on utilise un pipe. Sans ça, rg détecte le pipe et supprime toutes les couleurs, ne laissant à fzf que du texte brut.",
    },
    {
      content: "**`--line-number --no-heading`** (rg) — Formate chaque résultat en `filename:linenumber:content` sur une seule ligne. C'est le format que fzf va analyser.",
    },
    {
      content: "**`--smart-case`** (rg) — Insensible à la casse quand la requête est tout en minuscules, sensible à la casse dès qu'elle contient une majuscule. Le meilleur défaut pour chercher dans du code.",
    },
    {
      content: "**`--ansi`** (fzf) — Indique à fzf d'interpréter et d'afficher les codes couleur ANSI de la sortie de rg.",
    },
    {
      content: "**`--delimiter=':'`** (fzf) — Découpe chaque ligne sur `:` de sorte que `{1}` = nom du fichier, `{2}` = numéro de ligne, `{3}` = contenu. Ces champs sont ensuite utilisés dans `--preview`.",
    },
    {
      content: "**`--highlight-line {2}`** (bat) — Surligne la ligne trouvée dans l'aperçu. `{2}` est résolu par fzf vers le champ du numéro de ligne.",
      substeps: [
        "**`-- {1}`** — Le double tiret sépare les options de bat de l'argument nom de fichier. `{1}` est résolu vers le nom du fichier."
      ]
    },
    {
      content: "**`--preview-window='right:60%:+{2}+3/3:~3'`** — Ouvre l'aperçu à droite, sur 60 % de la largeur du terminal. `+{2}+3/3` fait défiler le panneau pour que la ligne trouvée soit visible, centrée avec du contexte. `~3` garde 3 lignes d'en-tête en sticky."
    }
  ]}
/>

## Étape 3 — La fonction `rgf` {#step-3--the-rgf-function}

Taper tout ce pipeline à chaque fois n'est pas pratique. La solution suit le même principe que l'article <Link to="/blog/modular-zsh-workflow">un workflow ZSH modulaire</Link> : un fichier autonome dans `~/.zsh/fns/`, chargé à la demande par ZSH — sans toucher à `.zshrc`.

La fonction vérifie toutes ses dépendances au démarrage, détecte automatiquement `bat` ou `batcat`, et ouvre le résultat sélectionné dans VSCode à la ligne exacte quand vous appuyez sur <kbd>Enter</kbd>. Si `code` n'est pas dans `$PATH`, elle se replie sur l'affichage de `file:line` dans le terminal.

<ProjectSetup folderName="~/.zsh/fns" createFolder={true}>
  <Guideline>
    Le nom du fichier doit être exactement « rgf » — sans extension. L'autoload ZSH utilise le nom du fichier comme nom de commande.
  </Guideline>
  <Snippet filename="rgf" source="./files/rgf.zsh" defaultOpen={true}/>
</ProjectSetup>

<AlertBox variant="note" title="Pourquoi un fichier temporaire plutôt que $(...)">
Lancer `selected=$(rg ... | fzf ...)` capture la sortie standard de fzf et l'empêche d'afficher son interface en WSL — la commande reste bloquée. Écrire la sortie de fzf dans un fichier temporaire lui permet de tourner au premier plan avec un accès complet au terminal ; la sélection est lue depuis le fichier après la fermeture de fzf.
</AlertBox>

Si `~/.zsh/fns` est déjà dans votre `fpath` (voir l'article <Link to="/blog/modular-zsh-workflow">un workflow ZSH modulaire</Link>), rechargez ZSH et lancez :

```bash
rgf "database"
```

Naviguez avec <kbd>↑</kbd> / <kbd>↓</kbd>, filtrez en tapant, appuyez sur <kbd>Enter</kbd> pour sauter à la ligne trouvée dans VSCode, <kbd>Esc</kbd> pour annuler.

## Scénarios concrets {#real-world-scenarios}

Voici quatre situations où `rgf` devient partie intégrante de votre quotidien.

### Trouver tous les TODO du projet {#find-all-todos-in-the-project}

```bash
rgf "TODO|FIXME|HACK"
```

rg gère les regex par défaut. Ceci cherche n'importe lequel des trois marqueurs. Parcourez-les tous, choisissez celui que vous voulez traiter et atterrissez directement dans l'éditeur.

### Retrouver où une fonction est appelée {#track-down-where-a-function-is-called}

Vous avez renommé `sendEmail` en `sendNotification` mais quelque chose plante encore. Trouvez tous les appels :

```bash
rgf "sendEmail"
```

Chaque résultat montre l'appel dans son contexte. Vous voyez immédiatement s'il s'agit d'un import, d'un appel ou d'un test — sans ouvrir les fichiers un par un.

### Localiser une valeur codée en dur {#locate-a-hardcoded-value}

Votre fichier Docker Compose contenait un port codé en dur. Traîne-t-il encore quelque part dans le code ?

```bash
rgf "5432"
```

L'aperçu montre les lignes autour — vous voyez d'un coup d'œil s'il s'agit d'une valeur par défaut, d'un commentaire ou d'une chaîne de connexion active.

### Chercher dans un dossier précis {#search-within-a-specific-folder}

`rgf` passe tous ses arguments directement à `rg`, donc la limitation à un chemin fonctionne comme prévu :

```bash
rgf "useEffect" src/components/
```

Seuls les fichiers sous `src/components/` sont parcourus. Idem pour les filtres par type de fichier :

```bash
rgf -t ts "interface UserProps"
```

L'option `-t ts` demande à rg de ne chercher que dans les fichiers TypeScript.

## Pour aller plus loin {#going-further}

### Associer rgf à un raccourci clavier {#bind-rgf-to-a-keyboard-shortcut}

Si vous voulez `rgf` à une touche de distance, ajoutez un raccourci ZSH. Celui-ci associe <kbd>CTRL</kbd>+<kbd>F</kbd> au lancement de `rgf` avec le contenu actuel de la ligne de commande comme requête initiale :

```zsh
# In ~/.zshrc
rgf-widget() { rgf "$BUFFER"; zle reset-prompt }
zle -N rgf-widget
bindkey '^F' rgf-widget
```

### Combiner avec le navigateur de repos {#combine-with-the-repo-navigator}

Si vous avez la fonction `repo` de l'article <Link to="/blog/modular-zsh-workflow">un workflow ZSH modulaire</Link>, un enchaînement naturel apparaît : `repo` pour sauter au projet, `rgf` pour trouver le code, <kbd>Enter</kbd> pour l'ouvrir. Trois frappes pour atteindre n'importe quelle ligne de n'importe quel projet.

### Utiliser ripgrep seul {#use-ripgrep-standalone}

`rg` vaut aussi la peine d'être appris pour lui-même — même sans `fzf`. Les options que vous utiliserez rapidement :

```bash
rg -l "pattern"          # filenames only, no content
rg -c "pattern"          # count of matches per file
rg --type-list           # list all supported file types
rg -t py "def connect"   # Python files only
rg -g "*.yml" "image:"   # glob filter — only YAML files
```
