# 070 — Nouvelles séries à créer à partir des articles orphelins

**Priority:** Medium

## Problème

Au 2026-08-01, le blog compte **246 articles publiés** dont seulement **58 rattachés à une
série** (13 séries actives dans `src/data/series.js`). Il reste donc **188 articles
orphelins**, soit 76 % du contenu.

Or plusieurs de ces orphelins forment des grappes thématiques très cohérentes, parfois de
10 articles et plus, écrits sur 2-3 ans, qui se lisent naturellement les uns après les
autres. Un lecteur qui arrive sur « Sticky scroll in vscode » n'a aujourd'hui aucun moyen
de découvrir les 12 autres articles VSCode.

Ce TODO ne concerne **que** la liste 2 : les grappes qui justifieraient une **nouvelle**
série. Les articles rattachables à une série **existante** sont traités à part (voir la
liste 1 discutée en session, à valider séparément).

## Risque

- Ne rien faire : le maillage interne reste faible sur les gros clusters (VSCode, Bash,
  VBA, WinSCP), et le composant `Series` ne couvre qu'un quart du blog.
- Trop en faire : créer 17 séries d'un coup diluerait la notion de série. Certaines
  grappes ci-dessous sont des « collections » (des articles indépendants sur un même
  outil) plutôt que des « parcours » (à lire dans l'ordre). Il faut trancher au cas par
  cas : une série n'a de sens que s'il y a une progression ou au minimum une forte
  parenté d'usage.
- Une même page ne peut appartenir qu'à une seule série : plusieurs articles ci-dessous
  apparaissent dans deux grappes candidates (par ex. `zsh-plugin-ssh-config-suggestions`
  en ZSH **et** en SSH, `linux-fzf-introduction` en CLI moderne **et** en ZSH). Il faudra
  arbitrer.

## Solution proposée

Les grappes sont classées par intérêt décroissant (taille × cohérence).

### Priorité haute — grappes évidentes

#### A. « VSCode - Tips, extensions and shortcuts » (13 articles)

Le plus gros cluster orphelin du blog, et un des plus homogènes.

| Date | Article |
| --- | --- |
| 2023-11-03 | [Markdown folding not working](/blog/vscode-markdown-code-folding) |
| 2023-11-27 | [Start vscode from github.com](/blog/vscode-github-dev) |
| 2023-11-27 | [Sticky scroll in vscode](/blog/vscode-sticky-scroll) |
| 2024-01-20 | [Autosave feature in VSCode](/blog/vscode-autosave) |
| 2024-03-03 | [Error Lens addon for VSCode](/blog/vscode-errorlens) |
| 2024-04-19 | [CodeSnap addon for VSCode](/blog/vscode-codesnap) |
| 2024-04-19 | [Export the list of extensions you've installed in VSCode](/blog/vscode-export-list-of-extensions) |
| 2024-04-19 | [Multiple cursors in vscode](/blog/vscode-multiple-cursors) |
| 2024-06-16 | [PHP Getter and Setter in VSCode](/blog/vscode-php-getter-setter) |
| 2024-08-05 | [Working with regions in VSCode](/blog/vscode-regions) |
| 2024-09-19 | [Using the JetBrains Mono font in vscode](/blog/vscode-jetbrains-font) |
| 2025-03-07 | [Todo Tree in VSCode](/blog/vscode-todo-tree) |
| 2025-07-06 | [Do I need VSCode on my machine to use it?](/blog/vscode-code-server) |

À arbitrer : `vscode-tabnine` (mainTag `ai`), `vscode-remote-ssh` (candidat aussi pour la
grappe SSH), `vscode-php-refactoring` (candidat pour la série *code quality*).

#### B. « Customize your shell with ZSH » (8 articles)

Vrai parcours : installation → plugins → prompt → organisation modulaire → fonctions.

| Date | Article |
| --- | --- |
| 2023-12-31 | [Customize your Linux prompt with Powerlevel10k](/blog/powerlevel10k_sandbox) |
| 2024-03-28 | [How to install Oh-My-ZSH](/blog/zsh-install) |
| 2024-03-29 | [Autosuggestions in the console using ZSH](/blog/zsh-plugin-autosuggestions) |
| 2024-03-29 | [Syntax highlighting in the console using ZSH](/blog/zsh-syntax-highlighting) |
| 2024-10-12 | [Working with the history of your last fired actions](/blog/linux-history) |
| 2025-02-13 | [SSH - Autosuggestions with ZSH](/blog/zsh-plugin-ssh-config-suggestions) |
| 2026-03-02 | [ZSH Functions - Customizing Your Shell for Docker Management](/blog/zsh-docker-functions) |
| 2026-05-25 | [Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro](/blog/modular-zsh-workflow) |

Brouillon rattachable : `atuin-bash-history`.

#### C. « Writing better Bash scripts » (11 articles)

Boîte à outils du scripteur : logs, env, parallélisme, doc, tests.

| Date | Article |
| --- | --- |
| 2023-12-19 | [Bash - ASCII art](/blog/bash-ascii-art) |
| 2023-12-19 | [Bash - Loading environment variables from a file](/blog/bash-load-env) |
| 2024-05-01 | [Script to add logging features to your script](/blog/bash-logging) |
| 2024-05-03 | [Echo on the console and in a logfile in the same time](/blog/bash-console-log-together) |
| 2024-06-28 | [Keep the number of function parameters as small as possible](/blog/linux-bash-too-many-function-parameters) |
| 2024-07-28 | [Sort functions in a Bash script](/blog/linux-sort-functions-in-script) |
| 2024-07-28 | [Compare two versions of the same script](/blog/linux-compare-two-versions-of-the-same-script) |
| 2024-07-29 | [Generate documentation from Bash scripts](/blog/linux-generate-documentation-from-bash-scripts) |
| 2024-10-06 | [Take advantage of the number of CPUs you have](/blog/bash-parallel-task) |
| 2024-10-07 | [Using a progression bar in your script](/blog/bash-progression-bar) |
| 2025-07-10 | [Running unit tests with bats/bats](/blog/bats-unit-tests) |

⚠️ **Arbitré le 2026-08-01** : `linux-bash-too-many-function-parameters` a été rattaché à
la série *code quality* (liste 1). Ne plus le compter ici → la grappe tombe à 10 articles.

#### D. « Modern CLI tools for your terminal » (8 articles)

Remplacer les outils Unix historiques par leurs équivalents modernes.

| Date | Article |
| --- | --- |
| 2023-12-13 | [The jq utility for Linux](/blog/linux-jq) |
| 2023-12-13 | [The xmlstarlet utility for Linux](/blog/linux-xmlstarlet) |
| 2024-03-30 | [Introduction to fzf - Fuzzy Finder](/blog/linux-fzf-introduction) |
| 2024-07-23 | [Let's revisit the ls command thanks to eza](/blog/linux-eza) |
| 2026-04-27 | [Master your ssh command and select the host from a list](/blog/ssh-with-fuzzy-finder) |
| 2026-06-08 | [FZF + ripgrep: Interactive Code Search with Live Preview](/blog/fzf-ripgrep) |
| 2026-06-15 | [delta: a Syntax-Highlighted Pager for git diff](/blog/git-delta) |
| 2026-07-06 | [ripgrep — The Search Tool That Changed My WSL2 Workflow](/blog/ripgrep) |

Brouillon rattachable : `atuin-bash-history` (conflit avec la grappe B).
C'est la grappe la plus « vivante » : 4 des 8 articles datent de 2026.

#### E. « VBA & MS Office automation » (11 articles)

Thématique totalement isolée du reste du blog (Docker/Linux), donc idéale à regrouper.

| Date | Article |
| --- | --- |
| 2023-12-10 | [MS Office - How to create a ribbon in Excel](/blog/vba-excel-ribbon) |
| 2024-02-21 | [MS Excel - How to call a SOAP web service](/blog/vba-excel-call-soap-webservice) |
| 2024-03-09 | [How to optimize an existing MS Access database](/blog/msaccess-optimize) |
| 2024-03-09 | [VBS - Retrieve the list of fields in a MS Access Database](/blog/vbs-msaccess-get-fields) |
| 2024-03-19 | [VBS - Auto update script](/blog/vbs-auto-update) |
| 2024-07-10 | [Microsoft Outlook - VBA - Save emails as PDF](/blog/outlook-vba-pdf) |
| 2024-08-13 | [WinSCP - Visual Basic for Application use](/blog/winscp-vba) |
| 2024-11-28 | [VBS - Get list of files and generate a CSV](/blog/vbs-files-csv) |
| 2025-02-22 | [MS Office - Load dropdown from Excel's range](/blog/vba-excel-ribbon-load) |
| 2025-06-27 | [Export MS Access objects](/blog/vba-access-export) |
| 2025-10-27 | [MS Excel - Get the list of references used in your modules](/blog/vba-excel-list-references) |

Variante possible : scinder en « VBA - Excel & Office » et « MS Access ».

### Priorité moyenne — grappes cohérentes mais plus petites

#### F. « SSH - From your first key to remote development » (8 articles)

Vraie progression pédagogique, et le mainTag `ssh` existe déjà.

`github-connect-using-ssh` (2024-03-09) · `docker-use-ssh-during-build` (2024-09-03) ·
`linux-sftp-cli` (2024-11-05) · `zsh-plugin-ssh-config-suggestions` (2025-02-13) ·
`linux-ssh-scp` (2025-05-08) · `connect-using-ssh-to-your-hosting-server` (2025-12-29) ·
`vscode-remote-ssh` (2026-01-05) · `windows-terminal-ssh-profile` (2026-01-19)

Conflits multiples avec A, B et H. C'est la grappe qui « vole » le plus d'articles aux
autres — à ne créer que si on accepte de la prioriser.

#### G. « WinSCP & remote file transfer » (9 articles)

`keepass-overriding-url` (2023-11-02) · `winscp-retrieve-password` (2024-01-21) ·
`putty-no-supported-authentication-methods` (2024-03-30) · `winscp-synchronize-both`
(2024-05-17) · `ftp-erase-files` (2024-05-25) · `winscp-vba` (2024-08-13) ·
`winscp-download-recursively-files` (2024-08-22) · `php-grep-searching-at-lightning-speed`
(2025-01-19) · `linux-sftp-cli` (2024-11-05)

Brouillon rattachable : `winscp-putty`. Le mainTag `winscp` couvre déjà 7 de ces articles.

#### H. « Windows Terminal » (4 articles)

`windows-terminal` (2024-04-01) · `windows-terminal-background` (2025-04-24) ·
`windows-terminal-split-panes` (2026-01-12) · `windows-terminal-ssh-profile` (2026-01-19)

Petite mais parfaitement homogène (mainTag `windows-terminal` déjà dédié) : la série la
moins coûteuse à créer.

#### I. « Diagrams as code » (8 articles)

`docker-diagram-as-code` (2023-11-24) · `docker-mindmap` (2023-12-16) · `json-crack`
(2024-01-18) · `docker-compose-viz` (2024-06-08) · `drawdb-app` (2024-11-11) ·
`python-pydot` (2024-12-18) · `vscode-docker-markmap` (2025-07-25) ·
`docker-python-mermaid` (2026-04-20)

Le mainTag `doc-as-code` couvre déjà 6 d'entre eux.

#### J. « Self-host your own services » (9 articles)

`docker_uptime_kuma` (2023-12-05) · `matomo-install` (2024-01-28) · `docker-limesurvey`
(2024-02-01) · `sql-formatter` (2024-07-17) · `heimdall-dashboard` (2025-02-01) ·
`excel-formatter` (2025-05-25) · `docker-karakeep` (2025-07-18) · `docker-memos`
(2025-07-29)

Brouillons rattachables : `portainer`, `traefik`, `anythingllm-chat-with-your-docs`.

⚠️ **Arbitré le 2026-08-01** : `sql-formatter` a été rattaché à la série *code quality*
(liste 1). `matomo-install` reste libre (*Discovering Docusaurus* refusée en liste 1).
La grappe tombe donc à 7 articles.

#### K. « WSL2 - Install, move and use it » (6 articles)

`wslg-rpd-connection` (2023-11-02) · `move-wsl-to-another-location` (2023-11-03) ·
`wsl-windows-explorer` (2023-11-03) · `wsl-powershell` (2023-12-27) · `ubuntu-install`
(2024-05-20) · `zorin` (2025-12-01)

#### L. « Building and testing REST APIs » (6 articles)

`docker-postgrest` (2024-01-06) · `postman` (2024-05-08) · `python-fastapi` (2025-02-09) ·
`php-api-tips` (2025-05-19) · `bruno` (2025-08-07) · `belgif-api-linter` (2026-05-11)

⚠️ **Arbitré le 2026-08-01** : `belgif-api-linter` a été rattaché à la série *code quality*
(liste 1). La grappe tombe à 5 articles.

### Priorité basse — mini-séries (3-5 articles)

- **« Fight spam at your host »** (3) : `cpanel-spam` (2024-01-23),
  `planethoster-n0c-spam` (2024-01-27), `planethoster-n0c-spam-roundcube-action`
  (2024-01-28). Écrits en 5 jours, se lisent dans l'ordre — la mini-série la plus évidente
  du blog.
- **« Makefile »** (3) : `makefile-help` (2023-12-25), `makefile-using-make` (2023-12-27),
  `makefile_tips` (2024-07-16). Le mainTag `makefile` existe déjà.
- **« Play with Docker and… »** (5) : `docker-php-run-script-or-website` (2023-11-02),
  `docker-java` (2023-11-28), `docker-python` (2023-11-29), `docker-assembly`
  (2023-11-30), `docker-pascal` (2023-12-01). Famille de titres explicite, publiée en un
  mois.
- **« Docker networking »** (5) : `docker-inspect` (2023-12-27),
  `docker-network-and-extra-hosts` (2024-02-20), `docker-health-condition` (2024-03-23),
  `docker-name-property` (2025-10-10), `docker-networking-troubleshooting` (2025-12-22).
- **« Convert anything to Markdown »** (3) : `markdown-csv2md` (2024-12-08),
  `markdown-xls2md` (2024-12-08), `markitdown` (2026-05-04) + le brouillon `docling`.
  À créer plutôt au moment de publier `docling`, ça ferait 4 articles.
- **« Docker GUI »** (3) : `docker-gui-in-browser` (2024-09-05), `docker-run-linux-gui`
  (2024-09-06), `docker-lubuntu` (2024-10-24).
- **« Joomla maintenance scripts »** (3, identifié le 2026-08-01) :
  `joomla-db-kill-tables-prefix` (2024-02-28), `joomla-show-table` (2024-06-02),
  `aesecure-quickscan` (2024-08-01). Même motif dans les trois : un script PHP autonome
  qu'on dépose à côté de `configuration.php` sur un hébergement réel, qu'on lance depuis
  le navigateur, puis qu'on **supprime immédiatement** du serveur. Aucun Docker → c'est
  précisément pour ça qu'ils n'ont pas été mis dans *Create your joomla website using
  Docker* (dont le périmètre est « faire tourner Joomla avec Docker »). Ils se
  cross-linkent déjà entre eux (`joomla-db-kill-tables-prefix` → `joomla-show-table`).
  Nuance : `aesecure-quickscan` a `mainTag: security` et n'est plus maintenu par
  Christophe (repris par l'AFUJ) — à confirmer avant de l'inclure.

### Étapes de mise en œuvre (une fois les grappes retenues)

1. Choisir les séries à créer et arbitrer les articles réclamés par deux grappes.
2. Ajouter chaque série dans `src/data/series.js` (`name`, `description`, `image`).
3. Créer les images `static/img/series/<slug>.webp` (obligatoire, sinon carte cassée
   sur `/series`).
4. Ajouter `series: <nom exact>` dans le frontmatter de chaque article — le nom doit
   correspondre au caractère près à celui de `series.js`.
5. Profiter du passage pour ajouter les `<Link>` inline réciproques manquants entre
   articles d'une même série (règle de maillage interne) et relancer
   `internal-link-opportunities.mjs --stats`.
6. Rafraîchir la mémoire `project_blog_map.md` (compteurs de séries).

### Chiffres de départ

- Au moment de l'analyse : 246 articles publiés, 58 en série (23,6 %), **188 orphelins**.
- Après application de la liste 1 le 2026-08-01 (14 articles rattachés à 6 séries
  existantes) : **72 en série (29,3 %), 174 orphelins**.
- Si les grappes A→L sont toutes créées : ~95 articles supplémentaires rattachés, soit
  environ 68 % du blog en série.

## Status — PARTIAL (2026-08-08)

### Done

- Arbitrage des grappes A→L (priorité haute + moyenne) : décision utilisateur de créer les
  12 nouvelles séries (grappes de « priorité basse » — mini-séries — explicitement hors
  scope de ce passage).
- Résolution des 4 conflits réels entre grappes (article revendiqué par deux tables) par le
  `mainTag` existant de chaque article, vérifié en frontmatter :
  - `zsh-plugin-ssh-config-suggestions` (mainTag `ssh`) → F (SSH), pas B (ZSH).
  - `linux-sftp-cli` (mainTag `ssh`) → F (SSH), pas G (WinSCP).
  - `winscp-vba` (mainTag `winscp`) → G (WinSCP), pas E (VBA).
  - `windows-terminal-ssh-profile` (mainTag `windows-terminal`) → H (Windows Terminal), pas F.
  - Les 3 « à arbitrer » de la grappe A (`vscode-tabnine` mainTag `ai`, `vscode-remote-ssh`
    mainTag `ssh`, `vscode-php-refactoring` mainTag `php`) ont été exclus de la série VSCode
    et laissés orphelins (ou déjà couverts ailleurs, cf. `vscode-remote-ssh` → F).
- Les 12 séries ajoutées dans `src/data/series.js` (name + description), triées comme le
  reste du fichier.
- `series: <nom exact>` ajouté dans le frontmatter de **93 articles** publiés (juste après
  `image:`, convention vérifiée sur les 78 articles déjà en série).
- `yarn build` : succès, aucun lien cassé, aucune erreur MDX.
- `yarn lint` : aucune nouvelle erreur (warnings pré-existants, non liés).
- `yarn format:check` : `src/data/series.js` reformaté par Prettier, tout le reste
  pré-existant et non touché par ce TODO.
- Mémoire `.claude/memory/project_blog_map.md` et `MEMORY.md` rafraîchies : 25 séries
  actives, 165/247 posts en série (66,8 %), 82 orphelins restants.
- Suivi de TODO déposé pour la partie non réalisable en autonome : voir ci-dessous.

### Not done

- **Les 12 images de bannière `static/img/series/<slug>.webp`** (étape 3 de la solution
  proposée). **Raison :** aucune capacité de génération d'image disponible dans cette
  session ; `SeriesCards` retombe proprement sur `/img/default.webp` quand `image` n'est
  pas défini (vérifié dans le code), donc pas de carte cassée sur `/series`, juste 12
  cartes avec l'image générique en attendant. → suivi dans
  `.todos/0080-series-banner-images-for-new-clusters.md`.
- **Liens `<Link>` inline réciproques manquants entre articles d'une même série** (étape 5).
  **Raison :** hors scope pour 93 articles en un seul passage — et le composant
  `SeriesPosts` (déjà branché sur `BlogPostItem/Content`) affiche automatiquement la liste
  complète des articles de la série, en haut et en bas de chaque post, dès que le
  frontmatter `series:` est renseigné. Le problème de découvrabilité posé en intro de ce
  TODO est donc déjà résolu sans lien inline manuel ; l'enrichissement inline reste une
  amélioration optionnelle, pas un blocage. Pas de TODO de suivi déposé (juger au cas par
  cas si un article profite particulièrement d'un lien contextuel).
- **Les grappes de « priorité basse » (mini-séries)** listées en fin de TODO original
  (spam, Makefile, Play with Docker, Docker networking, Convert to Markdown, Docker GUI,
  Joomla maintenance scripts) : explicitement exclues du scope choisi par l'utilisateur
  pour ce passage. Pas de TODO de suivi déposé — à revisiter si l'appétit pour de nouvelles
  séries reste après le passage des 12 ci-dessus.
