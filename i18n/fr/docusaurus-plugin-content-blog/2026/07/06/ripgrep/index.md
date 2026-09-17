---
slug: ripgrep
title: "ripgrep — L'outil de recherche qui a changé mon workflow WSL2"
description: "Découvrez ripgrep, l'alternative ultra-rapide à grep écrite en Rust. Installation sur Ubuntu/WSL2, configuration ZSH, fonctions shell pratiques et cas d'usage réels qui vont transformer votre manière de chercher dans le code au quotidien."
authors: [christophe, claude]
image: /img/v2/ripgrep.webp
series: Modern CLI tools for your terminal
mainTag: zsh
tags: [zsh, wsl, bash, linux, fzf]
date: 2026-07-06
ai_assisted: true
language: fr
blueskyRecordKey: 3mpxent26jc2f
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---

![ripgrep — L'outil de recherche qui a changé mon workflow WSL2](/img/v2/ripgrep.webp)

<!-- cspell:ignore ripgrep gitignore rgtodo rgenv rgdocker rgf rgphp smartcase filesize RIPGREP fzf rgyaml rgbash rgts rgmd -->

<TLDR>
ripgrep (`rg`) est un outil de recherche ligne par ligne écrit en Rust, largement plus performant que le grep traditionnel — surtout sur les grosses bases de code. Il respecte `.gitignore` par défaut, ignore les fichiers binaires et gère l'Unicode nativement. Cet article couvre l'installation sur Ubuntu/WSL2, un fichier de configuration `~/.ripgreprc`, des alias et fonctions ZSH pour votre `~/.zshrc` et votre répertoire `~/.zsh/fns/`, ainsi que des cas d'usage réels qui vous feront vous demander comment vous avez fait sans lui jusqu'ici.
</TLDR>

Bon sang. J'ai tapé cette commande tellement de fois que je pourrais le faire en dormant : `grep -rn --include="*.php" "getUser" . | grep -v vendor`. Ça fonctionne — grep est un classique, il fait le travail. Mais au fil des années, j'ai accumulé tellement de flags, tellement d'alias, tellement de contournements devenus automatiques pour les bizarreries de grep... À un moment, il faut se poser la question : est-ce qu'il n'existe pas mieux ?

<AlertBox variant="note" title="Que fait réellement cette commande ?">
  `grep -rn --include="*.php" "getUser" .` se décompose ainsi : `-r` cherche récursivement dans tous les sous-répertoires, `-n` affiche le numéro de ligne de chaque correspondance, `--include="*.php"` restreint la recherche aux fichiers `.php` uniquement, `"getUser"` est le motif à trouver et `.` indique de démarrer depuis le répertoire courant. Le `| grep -v vendor` final fait passer les résultats dans un second grep qui filtre et EXCLUT (`-v`) toute ligne contenant `vendor` — un contournement classique pour éviter le dossier de dépendances `vendor/`, que grep n'a aucun moyen d'ignorer nativement.
</AlertBox>

Il existe mieux. Ça s'appelle [ripgrep](https://github.com/BurntSushi/ripgrep), et une fois que vous commencez à l'utiliser, il n'y a pas de retour en arrière.

*Il appartient à la même famille de réécritures modernes que <Link to="/blog/linux-eza">eza</Link> (pour `ls`) et <Link to="/blog/git-delta">delta</Link> (pour `git diff`).*

<!-- truncate -->

## ripgrep vs grep — Comparaison côte à côte {#ripgrep-vs-grep--a-side-by-side-look}

Laissez-moi vous montrer pourquoi ripgrep devient immédiatement évident. Voici les mêmes recherches exprimées dans les deux outils :

<Columns>
<Column>

**Avec grep :**

```bash
grep -rn --include="*.php" "getUser" . \
  | grep -v vendor
```

</Column>
<Column>

**Avec ripgrep :**

```bash
rg "getUser" --type php
```

</Column>
</Columns>


<Columns>
<Column>

**Avec grep :**

```bash
grep -rn -i "TODO" . \
  --include="*.py" \
  --include="*.pyi" \
  --exclude-dir=.venv \
  --exclude-dir=dist
```

</Column>
<Column>

**Avec ripgrep :**

```bash
rg -i "TODO" --type py
```

</Column>
</Columns>


<Columns>
<Column>

**Avec grep :**


```bash
grep -rn "DB_PASSWORD" . \
  --include="*.env" \
  --include="*.yml" \
  --include="*.yaml"
```

</Column>
<Column>

**Avec ripgrep :**

```bash
rg "DB_PASSWORD" -t yaml -t sh
```

</Column>
</Columns>
Bien sûr, les flags de grep sont puissants une fois qu'on les connaît par cœur. Mais la syntaxe de ripgrep est simplement plus propre — et par défaut, il ignore déjà `vendor/`, `node_modules/` et tout ce qui se trouve dans votre `.gitignore`, sans aucun flag supplémentaire.

## Qu'est-ce que ripgrep ? {#what-is-ripgrep}

ripgrep (`rg` en ligne de commande) est un outil de recherche ligne par ligne écrit en Rust par Andrew Gallant (BurntSushi). La vitesse est son argument phare — les benchmarks le montrent systématiquement devant grep, ag (the Silver Searcher) et ack, avec une marge confortable sur les grosses bases de code. Mais la vitesse brute n'est qu'une partie de l'histoire.

Ce qui rend ripgrep réellement meilleur au quotidien, ce sont ses **valeurs par défaut intelligentes** :

- Il respecte automatiquement les fichiers `.gitignore`, `.ignore` et `.rgignore` — donc `vendor/`, `node_modules/`, `dist/` et `.git/` sont ignorés sans aucune gymnastique avec `--exclude-dir`.
- Il ignore les fichiers binaires par défaut.
- Il colore et regroupe la sortie par nom de fichier sans configuration.
- Il utilise l'Unicode par défaut — plus de sortie illisible sur les noms de fichiers ou les contenus accentués.
- Il supporte la syntaxe regex moderne, y compris PCRE2 avec le flag `-P`.
- Il ne cherche dans les fichiers cachés que si vous le demandez explicitement (`--hidden`).

Ce dernier comportement d'affichage est sous-estimé. Des résultats lisibles, regroupés, colorisés — immédiatement, sans aucune configuration. Plutôt cool, non ?

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Avant de toucher à votre propre `~/.zshrc`, essayez ripgrep dans un container jetable qui embarque déjà
la configuration `~/.ripgreprc`, les fonctions `rgtodo`/`rgenv` et un petit faux projet construit spécifiquement
pour mettre en valeur ces valeurs par défaut intelligentes : un dossier `vendor/` qui doit rester invisible, des commentaires TODO/FIXME,
un `DB_PASSWORD` qui fuit et un appel `console.log(token)` qui mérite d'être signalé.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous reproduit exactement le `.ripgreprc`, les fonctions `.zsh/fns/` et la section `.zshrc`
de cet article, puis construit le projet de démo. Rien ne change sur votre propre machine.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez-le et lancez-le :

<Terminal title="user@machine: ~/ripgrep-demo">
$ docker build -t ripgrep-demo .
[+] Building 21.3s (10/10) FINISHED
 ✔ exporting to image

$ docker run --rm -it ripgrep-demo
🐳 root ~/demo #
</Terminal>

Maintenant, jouez avec les scénarios décrits plus haut, en direct :

<Terminal source="./files/terminal_docker_demo.txt" typewriter />

Remarquez que `vendor/legacy/User.php` — qui définit aussi `getUser`, volontairement — n'apparaît jamais dans
aucune de ces recherches : le `.gitignore` et l'entrée de configuration `--glob=!vendor/*` l'excluent tous les deux,
exactement comme décrit plus haut. Essayez `rg --no-ignore "getUser"` pour le voir réapparaître.

## Installation sur Ubuntu / WSL2 {#installation-on-ubuntu--wsl2}

ripgrep est présent dans les dépôts de packages par défaut d'Ubuntu, donc l'installer tient en une ligne :

<Prerequisite
  name="ripgrep"
  install="sudo apt update && sudo apt install ripgrep -y"
  installOutput={`\nReading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`}
  check="rg --version"
  checkOutput={`\nripgrep 14.1.0\n-rev 0 (rev 4649aa9700 2024-03-30)\nfeatures: +SIMD +AVX (compiled), +SIMD +AVX (runtime)`}
  typewriter
/>

<AlertBox variant="tip" title="Vous voulez la dernière version ?">
  Les dépôts Ubuntu ont parfois quelques releases de retard sur ripgrep en amont. Pour la version la plus récente, récupérez le dernier package `.deb` directement depuis la [page des releases GitHub](https://github.com/BurntSushi/ripgrep/releases) et installez-le avec `sudo dpkg -i ripgrep_*.deb`. À partir de la version 14, vous bénéficiez en plus d'un meilleur support PCRE2 et d'un parcours de répertoires plus rapide.
</AlertBox>

## Configuration — ~/.ripgreprc {#configuration--ripgreprc}

Comme la plupart des outils Unix, ripgrep se configure via un fichier dédié. Vous l'indiquez avec la variable d'environnement `RIPGREP_CONFIG_PATH`. Voici un exemple de fichier `~/.ripgreprc` :

<Snippet
  filename="~/.ripgreprc"
  source="./files/.ripgreprc"
  defaultOpen={true}
/>

Chaque ligne est un flag par défaut appliqué à chaque invocation de `rg`. Quelques points qui méritent une explication :

- `--hidden` fait chercher ripgrep dans les fichiers et dossiers cachés (tout ce qui commence par un point). Combiné à l'exclusion `--glob=!.git/*`, cela signifie que vous pouvez chercher dans les fichiers `.env`, `.zshrc`, `.gitignore` et compagnie sans ouvrir toutes les entrailles de `.git/`.
- `--max-filesize=10M` ignore silencieusement les fichiers très volumineux (dumps de logs, assets générés) qui noieraient sinon vos résultats.
- `--smart-case` est probablement le réglage le plus impactant : les recherches sont insensibles à la casse par défaut, mais dès que votre motif contient une majuscule, ripgrep passe en correspondance exacte de casse — exactement le comportement que je veux 95 % du temps.

## Configuration ZSH — ~/.zshrc {#zsh-setup--zshrc}

Le fichier de configuration en place, j'ajoute la variable d'environnement, le chargeur de fonctions et une poignée d'alias par type de fichier dans mon `~/.zshrc` :

<Snippet
  filename="~/.zshrc (ripgrep section)"
  source="./files/zshrc_snippet.zsh"
  defaultOpen={true}
/>

La boucle `for fn_file in ~/.zsh/fns/*.zsh` source automatiquement chaque fichier de fonction de ce répertoire — donc ajouter une nouvelle fonction consiste simplement à déposer un nouveau fichier `.zsh` là-dedans, sans avoir à retoucher `~/.zshrc`.

Les alias par type (`rgp` pour PHP, `rgt` pour TypeScript, `rgm` pour Markdown, etc.) économisent des frappes quand vous savez exactement dans quel genre de fichier vous cherchez. J'utilise `rgp "getUser"` ou `rgm "## Installation"` des dizaines de fois par jour.

## Fonctions ZSH — ~/.zsh/fns/ {#zsh-functions--zshfns}

C'est ici que ça devient amusant. Voici trois fonctions installées dans mon répertoire `~/.zsh/fns/`, chacune résolvant un vrai problème.

### rgf — Recherche interactive avec fzf {#rgf--interactive-search-with-fzf}

J'ai couvert cette combinaison en détail dans un article dédié : [FZF + ripgrep: Interactive Code Search with Live Preview](/blog/fzf-ripgrep). En version courte : envoyez `rg` dans `fzf` avec un panneau d'aperçu `bat` et vous obtenez un chercheur flou interactif qui recherche dans le *contenu* des fichiers, prévisualise les correspondances avec coloration syntaxique et ouvre votre éditeur exactement sur la ligne correspondante. Si vous n'avez pas encore lu cet article, le détour vaut le coup.

### rgtodo — Faire remonter toute la dette technique d'un coup {#rgtodo--surface-all-technical-debt-at-once}

Toute base de code en a, tapies dans les commentaires : `TODO`, `FIXME`, `HACK`, `NOTE`, `XXX`. Cette fonction les fait toutes remonter à la surface :

<Snippet
  filename="~/.zsh/fns/rgtodo.zsh"
  source="./files/rgtodo.zsh"
  defaultOpen={false}
/>

Lancez `rgtodo` à la racine de n'importe quel projet et vous obtenez une liste triée et colorisée de chaque marqueur de commentaire. Lancez `rgtodo src/` pour la restreindre à un dossier précis. Édifiant sur des bases de code qui traînent depuis un certain temps.

<Terminal source="./files/terminal_rgtodo.txt" typewriter />

### rgenv — Retrouver l'usage des variables d'environnement {#rgenv--track-down-environment-variable-usage}

Dans les projets très orientés Docker, les variables d'environnement finissent éparpillées entre les fichiers `.env`, `compose.yml`, les bootstraps PHP et les configs Python. Cette fonction cherche dans tous ces endroits d'un seul coup :

<Snippet
  filename="~/.zsh/fns/rgenv.zsh"
  source="./files/rgenv.zsh"
  defaultOpen={false}
/>

`rgenv DB_PASSWORD` montre instantanément chaque fichier qui référence cette variable — qu'il la définisse, la consomme ou la passe comme secret Docker. Inestimable pour déboguer les dérives de configuration dans des setups multi-containers complexes.

<Terminal source="./files/terminal_db_password.txt" wrap={true} typewriter />

## Cas d'usage réels {#real-world-use-cases}

Voici les recherches que je lance le plus souvent dans mon workflow WSL2 quotidien.

### Trouver la définition d'une fonction dans un projet PHP {#finding-a-function-definition-across-a-php-project}

```bash
rg "function getUser" --type php
```

Sans ripgrep : il faut ajouter `--include="*.php"`, `--exclude-dir=vendor`, `-rn`. Avec ripgrep : vous tapez juste ça. Le répertoire `vendor/` est déjà exclu parce qu'il est dans `.gitignore`.

### Chercher une référence d'image dans tous les fichiers Docker Compose {#searching-all-docker-compose-files-for-an-image-reference}

```bash
rgy "image:"
```

C'est notre alias `rgy` (`rg --type yaml`). Utile pour auditer un repository à la recherche de références d'images obsolètes, ou pour trouver tous les services qui partagent une image de base.

### Lignes de contexte — comprendre le code autour d'une correspondance {#context-lines--understanding-code-around-a-match}

Le flag `-C N` affiche N lignes de contexte autour de chaque correspondance — une fonctionnalité que j'utilise en permanence :

<Terminal source="./files/terminal_dbhost.txt" typewriter />

Vous pouvez aussi utiliser `-A N` (après) et `-B N` (avant) séparément, exactement comme avec grep.

Un scénario plus courant : un collègue laisse des appels `console.log()` dans du JavaScript avant de pousser en production. Sans contexte, vous ne voyez que la ligne elle-même — vous savez qu'elle existe, mais pas à quel point c'est grave. Avec `-C 2` :

<Terminal source="./files/terminal_consolelog.txt" typewriter />

Là, vous pouvez faire la différence. La première correspondance logue un token JWT en clair — c'est un problème de sécurité, pas juste du bruit. La seconde se trouve dans une boucle `for` sur un panier : un seul passage en caisse inonderait la console de centaines de lignes. Le contexte transforme une liste de correspondances en information actionnable.

### Compter les occurrences par fichier {#counting-occurrences-per-file}

```bash
rg -c "console.log" --type js
```

Ça affiche le nombre de correspondances par fichier — parfait pour identifier quels fichiers sources contiennent encore des instructions de debug avant une release.

### Renommage en masse avec rg + sed {#bulk-rename-with-rg--sed}

ripgrep est volontairement en lecture seule (pas de mode `-i` d'édition sur place), mais il se marie très bien avec `sed` pour du refactoring en masse :

<Terminal typewriter>
$ rg -l "oldFunctionName" --type php | xargs sed -i 's/oldFunctionName/newFunctionName/g'
</Terminal>

`rg -l` ne liste que les noms de fichiers contenant une correspondance. En le passant à `xargs sed -i`, vous réécrivez exactement ces fichiers — ni plus, ni moins. Bien plus sûr qu'un `find | xargs sed` brut qui n'a aucune idée des fichiers réellement concernés.

### Chercher dans plusieurs types de fichiers à la fois {#searching-multiple-file-types-at-once}

```bash
rg "API_KEY" -t php -t yaml -t sh
```

Plusieurs flags `-t` se combinent — ripgrep cherche dans tous les types correspondants en une seule passe, avec une sortie colorisée unifiée.

### Limiter la profondeur de recherche {#limiting-search-depth}

```bash
rg "FROM" --glob "Dockerfile*" --max-depth 3
```

`--max-depth` est excellent quand vous voulez rester près du répertoire courant sans plonger dans chaque sous-répertoire imbriqué.

## Points clés à retenir {#key-takeaways}

<StepsCard
  variant="remember"
  title="ripgrep en aide-mémoire"
  steps={[
    { content: "**Installer** — `sudo apt install ripgrep` sur Ubuntu/WSL2" },
    { content: "**Configurer** — créez `~/.ripgreprc` et pointez dessus via `RIPGREP_CONFIG_PATH` dans `~/.zshrc`" },
    { content: "**Flags de type** — `-t php` au lieu de `--include=\"*.php\"` — plus court et plus intelligent" },
    { content: "**Smart case** — `--smart-case` vous donne des recherches insensibles à la casse qui basculent automatiquement en exact dès que vous mettez une majuscule" },
    { content: "**Conscient de gitignore** — `vendor/`, `node_modules/`, `.git/` sont exclus automatiquement ; aucun flag nécessaire" },
    { content: "**Lignes de contexte** — `-C 3` affiche 3 lignes au-dessus et en dessous de chaque correspondance" },
    { content: "**Mode liste de fichiers** — `rg -l` ne renvoie que les noms de fichiers ; envoyez-les à `xargs` pour des opérations en masse" },
    { content: "**Mode interactif** — `rgf \"pattern\"` combine ripgrep et fzf pour une recherche avec aperçu en direct ; configuration complète dans [FZF + ripgrep](/blog/fzf-ripgrep)" }
  ]}
/>

## Conclusion {#conclusion}

Au début de cet article, je disais avoir tapé cette commande `grep -rn --include="*.php" ... | grep -v vendor` tellement de fois qu'elle était devenue un réflexe. Aujourd'hui, chaque fois que j'ouvre un terminal dans WSL2, je tape `rg` sans même y penser. L'exclusion de `vendor/` est automatique, la sortie est lisible sans aucun flag, et la recherche est réellement plus rapide sur les grosses bases de code. Entre la configuration `~/.ripgreprc`, les alias de type dans `~/.zshrc`, des fonctions comme `rgtodo` et `rgenv` dans `~/.zsh/fns/`, et la recherche interactive `rgf` couverte dans [un article dédié](/blog/fzf-ripgrep), ripgrep a cessé d'être un outil que je choisis consciemment pour devenir la colonne vertébrale invisible de ma navigation dans le code au quotidien. Si vous en êtes encore au grep brut dans votre environnement WSL2, accordez-vous vingt minutes avec ripgrep — c'est tout ce qu'il faut.
