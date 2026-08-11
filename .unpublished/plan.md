# Plan de publication — Brouillons dans `.unpublished/`

Notes de travail sur un ordre de publication sensé pour les brouillons présents dans `.unpublished/`.
Ce n'est pas un article de blog — juste un fichier de planification, pour moi (Claude) et pour
Christophe. Jamais publié, donc écrit en français.

> **Maintenance :** ce fichier doit être mis à jour à chaque fois qu'un nouveau brouillon est créé
> dans `.unpublished/`, ou qu'un brouillon existant est publié (déplacé vers `blog/`) ou supprimé.

## Pourquoi l'ordre compte ici

La plupart des brouillons sont indépendants et peuvent sortir n'importe quand. La série "Ollama
daily use" ne l'est pas : plusieurs articles font un lien vers un article précédent, ou
supposent dans leur texte qu'un article précédent est déjà publié.

**Contraintes dures (lien cassé ou chronologie incohérente sinon) :**

- `ollama-test-generator` (**ai-test**) doit être le premier de la série. Il définit la fondation
  partagée — `~/.zsh/fns/_ollama.zsh` (`_ollama_query`, `_ollama_check`, `_git_staged_diff`, le
  registre `AI_COMMANDS`/`AI_PARAMS`, les helpers FZF, le dispatcher `ai` lui-même) — que tous les
  autres articles `ai-*` supposent déjà en place.
- `ollama-git-precommit` (**ai-review + ai-secrets + ai-commit**) fait un lien direct vers
  `/blog/ollama-test-generator`. Doit venir juste après ai-test. Ces trois fonctions sont désormais
  réunies dans un seul article (fusion opérée 2026-07-30).
- `docling` doit être publié avant `ollama-ai-docs` (**ai-summarize** + `_ai_extract_text`) — ce dernier
  fait un lien direct vers `/blog/docling` et son helper `_ai-docs.zsh` appelle `docling-convert`.
- `ollama-ai-docs` doit être publié avant `ollama-ai-diff` (**ai-diff**) — le mode "deux fichiers"
  d'ai-diff réutilise directement `_ai_extract_text`, défini dans `_ai-docs.zsh` (l'article ai-docs).
  Transitivement, `docling` doit donc aussi précéder `ai-diff`.
- `ollama-ai-translate` (**ai-translate**) est **indépendant** — il fonctionne sans Docling (texte/pipe),
  et sa dépendance sur `_ai_extract_text` est optionnelle (graceful fallback). Pas de contrainte d'ordre
  stricte. Peut précéder ou suivre `ollama-ai-docs`, mais si publié APRÈS, mettre à jour l'AlertBox
  "supersedes" pour refléter que `/blog/ollama-ai-docs` est déjà publié.

**Contraintes souples (pas de lien cassé, mais le texte cite la fonction comme "déjà couverte") :**

- `ollama-ai-fix` — cite `ai-standup`, `ai-test` et `ai-commit` comme déjà existants.
- `ollama-ai-ci` — cite `ai-fix` et `ai-standup` comme déjà existants.

**Aucune contrainte :** `ollama-ai-ask`, `ollama-ai-data` et `ollama-ai-diagram` ne citent aucun autre
brouillon de la série par nom — libres de se placer où le rythme éditorial le suggère.

**Deux brouillons hors série dépendent quand même de la série** (ajoutés 2026-07-27, ponts
thématiques demandés par Christophe) :

- `duckdb-json-csv` fait un lien **dur** vers `/blog/docling` ET `/blog/ollama-ai-data` (deux
  mentions) — doit venir après les deux.
- `python-security-bandit-audit` fait un lien **dur** vers `/blog/docling` — doit venir après lui.
- `xdebug-docker-vscode` n'a aucune dépendance (ne lie que `php-devcontainer` et `vscode-devcontainer`,
  déjà publiés) — libre.

## Ordre proposé — "Ollama daily use" + docling

| # | Slug | Fonction(s) | Pourquoi ici |
| --- | --- | --- | --- |
| 1 | `ollama-test-generator` | `ai-test` | Premier obligatoire — définit `_ollama.zsh` complet (`_ollama_check`, `_git_staged_diff`, `AI_PARAMS`, FZF helpers, `ai`) |
| 2 | `ollama-git-precommit` | `ai-review` + `ai-secrets` + `ai-commit` | Deuxième obligatoire — lien vers #1 ; article fusionné couvrant les trois checks pre-commit en un seul article |
| 3 | `ollama-ai-standup` | `ai-standup` | Nécessaire avant #4 et #5 (qui le citent tous les deux) |
| 4 | `ollama-ai-fix` | `ai-fix` | Cite `ai-standup`, `ai-test`, `ai-commit` comme antérieurs |
| 5 | `ollama-ai-ci` | `ai-ci` | Cite `ai-fix`, `ai-standup` comme antérieurs ; plus lourd (token API externe) |
| 6 | `ollama-ai-ask` | `ai-ask` | Libre ; lecture courte et facile après le plus lourd ai-ci |
| 7 | `ollama-ai-diagram` | `ai-diagram` | Libre ; pont IA × doc-as-code, angle encore différent |
| 8 | `ollama-ai-data` | `ai-data` | Libre, mais doit précéder `duckdb-json-csv` (hors série) qui le cite |
| 9 | `docling` | — (hors série) | Doit précéder #10, #11, et les deux ponts hors série `duckdb-json-csv`/`python-security-bandit-audit` |
| 10 | `ollama-ai-translate` | `ai-translate` | Libre — fonctionne sans Docling (mode texte/pipe). Peut précéder ou suivre #9 ; si publié après #10bis, mettre à jour la note de l'AlertBox "supersedes" |
| 10bis | `ollama-ai-docs` | `ai-summarize` + `_ai_extract_text` | Dépend de #9 ; doit précéder #11. **Note :** `ai-translate` a désormais son propre article (#10) — retirer la définition de `ai-translate` de `_ai-docs.zsh` avant publication, et mettre à jour le titre de l'article (supprimer "ai-translate &") |
| 11 | `ollama-ai-diff` | `ai-diff` | Dernier obligatoire de la série — dépend de #10bis (`_ai_extract_text`) et transitivement de #9 ; bonne conclusion, referme la boucle avec `delta`/`git diff` |

C'est l'ordre minimal qui respecte toutes les contraintes ci-dessus. La fusion de commit/review/secrets en
`ollama-git-precommit` (#2) a réduit la série de 13 à 11 articles. Les positions #6/#7/#8 sont libres
entre elles ; #9→#10→#11 doit rester dans cet ordre relatif.

**`duckdb-json-csv` et `python-security-bandit-audit`** (hors série, ponts thématiques) peuvent sortir
n'importe quand **après #11** (`docling`) — pas besoin d'attendre la fin complète de la série (#13).
**`xdebug-docker-vscode`** n'a aucune contrainte, à placer librement dans le calendrier.

## Intercaler avec le reste de `.unpublished/`

Treize articles à saveur "Ollama" d'affilée, c'est beaucoup pour les lecteurs réguliers. Les autres
brouillons n'ont aucune dépendance envers cette série ni entre eux (sauf mention contraire) — je
casserais donc la séquence. Numérotation mise à jour après l'ajout d'`ai-secrets` et `ai-diagram` :

| Emplacement | Suggestion |
| --- | --- |
| Avant #1 | `winscp-putty` ou `git-bisect` — court, sans rapport, vide le stock de brouillons plus anciens |
| Entre #2 et #3 | `docusaurus-ollama-tags` — même saveur "LLM local" mais un usage complètement différent (analyse de tags de blog), lu comme de la variété |
| Entre #3 et #4 | `xdebug-docker-vscode` — aucune dépendance, rupture nette avec le contenu terminal (PHP/VSCode/debugging) après deux articles centrés sur le `git diff` staged |
| Entre #4 et #5 | `typo-report-docusaurus` ou `tried_it` — deux articles de composants Docusaurus, coupure nette avec le contenu terminal |
| Entre #5 et #6 | `removing-algolia-for-pagefind` — court, orienté infra, bonne respiration |
| Entre #6 et #7 | `anythingllm-chat-with-your-docs` — même thème Ollama, mais un angle radicalement différent (application self-hosted complète pour "chatter" avec ses documents, pas une fonction zsh) ; assez développé pour tenir seul comme respiration dans la série |
| Après #9 (`docling`) | `python-security-bandit-audit` — dépendance dure sur `docling` (voir plus haut), aucune sur le reste de la série ; bon point de sortie vers un thème différent (sécurité Python) |
| Après #9, avant ou après #11 | `duckdb-json-csv` — dépendance dure sur `docling` ET `ollama-ai-data` (#8) ; cite `ai-data` en conclusion donc se lit mieux s'il ne suit pas *trop* loin derrière |
| Après #11 | `python-ai-helper` — une fois ai-test/ai-review publiés, l'approche plus lourde (Docker, Python uniquement) de cet ancien brouillon se lit comme "l'alternative costaude" plutôt qu'une idée redondante ; mérite une petite relecture pour faire le lien avec la série à ce moment-là |

`ollama-refactor-code` n'apparaît pas dans ce plan — ce ne sont encore que des fichiers source dans
`files/`, aucun `index.md` n'a été écrit, ce n'est donc pas candidat à la publication pour l'instant.

La chaîne `lazydocker` → `portainer` → `traefik` (voir section dédiée plus bas) est totalement
indépendante de la série Ollama et peut s'intercaler n'importe où dans ce calendrier global, du moment
que son ordre interne 1→2→3 est respecté et que `portainer` suit bien `anythingllm-chat-with-your-docs`
s'il n'est pas encore publié.

## Avant de publier #1 (bloquant dans tous les cas)

- `src/data/series.js` contient déjà l'entrée "Ollama daily use", mais `/img/series/ollama.webp`
  n'existe pas encore sur disque — la page `/series` affichera une image cassée tant qu'elle n'est pas
  créée (~1000-1500px, WebP, dans le style des autres bannières de série).
- Aucun des scripts zsh de cette série n'a été exécuté contre une vraie instance Ollama — la logique a
  été soigneusement raisonnée, mais `_ollama_query`, `_git_staged_diff`, `_ai_ci_gitlab_info`,
  `docling-convert`, les appels à l'API GitLab dans `ai-ci`, et le mécanisme `print -z`/`fzf` dans
  `ai-data` méritent un vrai passage de test sur ta machine, pas seulement une relecture.
- Le FZF interactif multi-param (nouveau dans `_ollama.zsh` depuis 2026-07-30 — `AI_PARAMS`, helpers
  `_ai_prompt_file/language/number/text`, boucle de collecte dans `ai()`) n'a pas été testé en conditions
  réelles : en particulier la séquence "file + language" pour `ai-translate` et le "number optionnel"
  pour `ai-standup` (Enter sans valeur = utiliser le défaut de la fonction).
- Le Dockerfile de `docling` (image de base CUDA, passthrough GPU) est le seul élément de ce lot
  construit à partir de la documentation plutôt que d'un cycle build-and-test réel ici — à builder une
  fois contre ta carte 24GB avant de considérer l'article comme final.
- `ollama-ai-diff` et `ollama-ai-docs` partagent `_ai-docs.zsh` — vérifier que les deux copies restent
  identiques si l'une des deux est modifiée après coup (même logique que `_ollama.zsh`, dupliqué dans
  chaque dossier de brouillon pour que chaque article reste autoportant).
- `ollama-ai-diagram` : même réserve que le reste de la série, logique raisonnée mais jamais exécutée
  contre un vrai Ollama ni un vrai `fzf`.

## Avant de publier les ponts thématiques hors série (ajoutés 2026-07-27)

- `duckdb-json-csv` : le `Dockerfile` télécharge le binaire CLI officiel depuis GitHub Releases —
  URL et version (`v1.5.5`) vérifiées réellement via l'API GitHub au moment de la rédaction (pas une
  supposition), mais jamais buildée ici. Vérifier que le tag existe encore avant de builder.
- `xdebug-docker-vscode` : configuration Xdebug 3.x/VSCode raisonnée à partir de connaissances stables
  et bien établies (pas vérifiée via une source fraîche comme Docling/DuckDB), mais jamais testée en
  conditions réelles ici — en particulier `pathMappings` dans `launch.json`, la cause n°1 de
  breakpoints qui ne se déclenchent jamais si le chemin ne correspond pas exactement à ton setup.
- `python-security-bandit-audit` : les identifiants d'avisory (`GHSA-...`) dans la démo `pip-audit`
  sont illustratifs (formatés correctement mais pas vérifiés contre la base réelle pour ces versions
  exactes) — clairement indiqué dans l'article lui-même, pas la peine de le corriger sans re-vérifier.

## Nouvelle mini-série : lazydocker → Portainer → Traefik (créée 2026-07-27)

Trois brouillons créés à la suite d'une demande de Christophe pour des articles sur des images Docker
qui ont du sens dans son usage quotidien. Contrairement au reste de `.unpublished/`, ces trois-là
forment une chaîne de dépendances **dures** (vrais composants `<Link>`, pas de simples mentions) — dans
cet ordre précis, sans exception :

| # | Slug | Angle | Pourquoi cet ordre |
| --- | --- | --- | --- |
| 1 | `lazydocker` | TUI terminal pour Docker, containerisé (Dockerfile + wrapper global) | Premier obligatoire — `portainer` et `traefik` le citent tous les deux via `<Link>` |
| 2 | `portainer` | Dashboard web officiel (image `portainer-ce`), comparé à lazydocker | Cite `lazydocker` ET `anythingllm-chat-with-your-docs` (le paragraphe sur l'absence d'authentification d'Ollama) — doit donc aussi suivre ce brouillon-là s'il n'est pas encore publié |
| 3 | `traefik` | Reverse proxy par labels Docker, routage vers Portainer + Open WebUI | Cite `lazydocker` ET `portainer` via `<Link>` — doit venir après les deux |

**Contrainte dure supplémentaire :** `portainer` fait un lien direct vers
`/blog/anythingllm-chat-with-your-docs` (le comparatif "Ollama sans authentification"). Si ce brouillon
n'est pas encore publié au moment de sortir `portainer`, soit le publier avant, soit retirer ce lien
avant publication.

**Aucune dépendance externe cassée** — les trois articles font aussi des `<Link>` vers des posts déjà
publiés (`docker-out-of-docker-dood`, `zsh-docker-functions`, `ollama-installation`,
`accessing-ollama-across-your-local-network`), tous vérifiés existants sur le disque au moment de la
création (2026-07-27).

**Où les intercaler :** les trois se suivent forcément, mais rien n'empêche de les espacer dans le
calendrier de publication global (ex. un article entre `lazydocker` et `portainer` pour varier) tant que
l'ordre relatif 1→2→3 est respecté.

**Avant de publier `lazydocker` (premier de la chaîne) :**

- Le `Dockerfile` télécharge un binaire lazydocker via une release GitHub à une version épinglée
  (`ARG LAZYDOCKER_VERSION=0.23.3`, choisie de mémoire) — vérifier que ce tag existe encore sur
  [github.com/jesseduffield/lazydocker/releases](https://github.com/jesseduffield/lazydocker/releases)
  avant de builder, sinon ajuster l'ARG.
- Aucun des trois `Dockerfile`/`compose.yaml` de ce lot n'a été buildé ni testé contre un vrai hôte
  Docker — Dockerfile et labels ont été raisonnés à partir de la documentation officielle de chaque
  outil, pas d'un cycle build-and-test réel ici (même réserve que pour `docling`).
- Captures d'écran manquantes pour les trois : le TUI de lazydocker, le dashboard Portainer, le
  dashboard Traefik. Contrairement aux fonctions ZSH fzf (`dex`, `dstop`, ...) qui ont de vraies
  captures dans `zsh-docker-functions`, ces trois interfaces plein écran/web n'ont pas encore été
  capturées — à faire une fois testé, avant publication.

## Nouveaux brouillons VSCode (créés 2026-07-27)

Cinq brouillons créés à la suite d'une demande de Christophe sur l'optimisation de son workflow VSCode
(outil utilisé quotidiennement). Contrairement à la mini-série Docker ci-dessus, ces cinq-là sont
**indépendants entre eux** — aucun ordre de publication imposé — sauf un lien externe :

| Slug | Angle | Dépendance |
| --- | --- | --- |
| `vscode-gitlens` | Blame inline, historique de fichier/ligne, comparaison de branches | Aucune (liens vers `git-worktree` et `git-delta`, déjà publiés) |
| `vscode-snippets-for-docusaurus` | Tour du vrai fichier `.vscode/markdown.code-snippets` de ce repo, avec deux entrées obsolètes identifiées (`CoreConcept`/`HighlyImportant`, plus des composants enregistrés — ce sont maintenant des variantes d'`AlertBox`) | Aucune (lien vers `docusaurus-snippets`, déjà publié — sujet différent : le composant React vs. la fonctionnalité éditeur) |
| `vscode-profiles` | Documente le vrai setup de Christophe : profil quotidien (thème sombre) vs profil "DevContainer" (thème clair forcé, Claude Code installé uniquement là) | Aucune |
| `vscode-multi-root-git-worktree` | Un `.code-workspace` multi-root pour voir tous les worktrees actifs dans une seule fenêtre — suite logique de la section "Worktrees work with VS Code" de l'article `git-worktree` | Aucune (article déjà publié) |
| `vscode-extension-bisect` | L'outil intégré `Help: Start Extension Bisect`, même principe de recherche binaire que `git bisect`, callback assumé | **Dépendance dure** : fait un `<Link>` vers `/blog/git-bisect`, encore à l'état de brouillon — doit être publié avant `vscode-extension-bisect` |

**Avant de publier `vscode-extension-bisect` :** vérifier que `git-bisect` (brouillon existant, voir plus
haut dans ce fichier) est publié en premier, sinon retirer temporairement le lien.

**Avant de publier `vscode-snippets-for-docusaurus` :** le `<Snippet source=".vscode/markdown.code-snippets">`
pointe directement vers le vrai fichier du repo (pas une copie dans `./files/`) — l'article restera
donc automatiquement à jour si ce fichier change, mais si les deux entrées obsolètes signalées dans
l'article (`CoreConcept`/`HighlyImportant`) sont supprimées du fichier avant publication, relire le
paragraphe qui les mentionne pour ajuster le texte en conséquence.

## Nouveau brouillon standalone (créé 2026-07-30)

| Slug | Angle | Dépendance |
| --- | --- | --- |
| `ai-agent-in-devcontainer` | Retour sur la décision de Symfony Docker de supprimer Claude Code comme agent IA par défaut et de le remplacer par un guide. Couvre OpenCode (open source, recommandé), configuration avec Ollama en local via `host.docker.internal`, et le network sandbox iptables/dnsmasq pour l'autonomie. | Liens vers `/blog/ollama-installation` et `/blog/accessing-ollama-across-your-local-network` (publiés) + `/blog/docker-prod-devcontainer` (publié) — aucune dépendance sur des brouillons non publiés. Aucune contrainte d'ordre. |
| `docker-dive` | Analyse des images Docker avec `dive` — de zéro optimisation à multi-stage, avec bonus FROM scratch. Angle pédagogique : un mauvais Dockerfile progressivement amélioré, dive comme outil de diagnostic et gate CI. | **Dépendance souple** : le Conclusion mentionne `lazydocker` via `<Link to="/blog/lazydocker">`. Si ce brouillon est publié avant `lazydocker`, retirer ce lien ou remplacer par `/blog/docker-prod-devcontainer`. |

**Avant de publier `ai-agent-in-devcontainer` :**

- Article basé sur une source externe (article d'Antoine Benevaut + doc GitHub Symfony Docker) — vérifier que les liens GitHub sont toujours valides et que le guide d'intégration OpenCode dans Symfony Docker n'a pas évolué depuis.
- Le contenu n'a pas été testé personnellement (OpenCode non installé ici) — `tried_it: false` positionné en conséquence. Avant publication, idéalement tester le flow OpenCode + Ollama dans un devcontainer réel.
- L'article recommande `host.docker.internal:11434` pour Ollama — valable sur Docker Desktop (Mac/Windows) et versions récentes de Docker Engine sur Linux. À mentionner si la cible est Windows/WSL.

**Avant de publier `docker-dive` :**

- Les images `myapp:bad`, `myapp:v2`, `myapp:v3`, `myapp:multistage`, `myserver:scratch` et les sorties `dive --ci` n'ont pas été construites ni testées sur une vraie machine — les tailles et scores d'efficacité dans les fichiers `terminal_dive_*.txt` sont illustratifs mais réalistes. Vérifier les chiffres après avoir buildé les images réelles.
- Le lien vers `/blog/lazydocker` en conclusion ne sera valide qu'une fois `lazydocker` publié (voir mini-série Docker dans ce fichier). Si `docker-dive` sort en premier, remplacer ce lien par `/blog/docker-prod-devcontainer`.
- L'argument `--break-system-packages` de pip3 dans `Dockerfile.bad` / `Dockerfile.v3` est nécessaire sur `ubuntu:24.04` (PEP 668) mais inhabituel — ajouter une note dans l'article si des lecteurs signalent des erreurs.
- Vérifier que `wagoodman/dive:latest` fonctionne avec le Docker socket courant (version API).

## Nouveau brouillon standalone (créé 2026-07-30) — Atuin

| Slug | Angle | Dépendance |
| --- | --- | --- |
| `atuin-bash-history` | Atuin remplace l'historique shell plat par une base SQLite avec timestamps, exit code, durée et répertoire. Article en deux parties : démo Docker (Dockerfile fourni + `bash-preexec`) puis installation permanente sur Bash et ZSH, avec comparatif Atuin vs. FZF+history sous forme de tableau. | Aucune dépendance sur des brouillons non publiés. Liens internes vers `/blog/linux-history`, `/blog/linux-fzf-introduction`, `/blog/fzf-ripgrep`, `/blog/modular-zsh-workflow` (tous déjà publiés). |

**Avant de publier `atuin-bash-history` :**

- La version épinglée dans le Dockerfile est `v18.16.1` — vérifier sur [github.com/atuinsh/atuin/releases](https://github.com/atuinsh/atuin/releases) que c'est toujours la dernière stable avant publication, ajuster si besoin (mettre à jour l'URL dans `files/Dockerfile` et la mention dans l'article).
- Le Dockerfile a été raisonné à partir de la documentation officielle et du fichier fourni par Christophe — à builder et tester avec `docker build -t atuin-demo . && docker run --rm -it atuin-demo` pour vérifier le flux complet.
- L'URL du script `bash-preexec` (`https://raw.githubusercontent.com/rcaloras/bash-preexec/master/bash-preexec.sh`) doit être testée lors du build — c'est la `main` branch, un `--depth=1 clone` serait plus reproductible si cette URL disparaît à terme.
- Les liens réciproques à ajouter au moment de la publication (dans les articles déjà publiés) : `/blog/linux-history` (section sur les alternatives) et `/blog/linux-fzf-introduction` (mentionner Atuin comme alternative plus structurée).

## Nouveau brouillon standalone (créé 2026-07-30) — oha

| Slug | Angle | Dépendance |
| --- | --- | --- |
| `oha-http-load-testing` | `oha` est un générateur de charge HTTP écrit en Rust avec TUI temps réel. L'article le démontre contre le dev server Docusaurus local (`http://localhost:3000`) pour éviter d'attaquer un vrai site. Couvre l'installation (cargo + binaire + Docker), lecture du rapport (histogramme + percentiles), montée en charge, durée fixe, et export JSON. Fichier `files/compose.yaml` fourni. | Aucune dépendance sur des brouillons non publiés. Liens internes vers `/blog/ripgrep`, `/blog/linux-eza`, `/blog/running-docusaurus-with-docker` (tous déjà publiés), et `/blog/bruno` (déjà publié). |

**Avant de publier `oha-http-load-testing` :**

- Les sorties `<Terminal>` sont illustratives (basées sur le comportement réel d'oha, mais non exécutées ici contre localhost:3000). Tester les commandes sur le vrai dev server avant de publier pour vérifier que les chiffres sont dans des ordres de grandeur réalistes.
- Vérifier que `ghcr.io/hatoo/oha:latest` existe toujours (image officielle GitHub Container Registry).
- Vérifier la version dans `checkOutput` du composant `<Prerequisite>` (`oha 0.6.4`) — ajuster à la dernière stable depuis [github.com/hatoo/oha/releases](https://github.com/hatoo/oha/releases).
- Liens réciproques à ajouter au moment de la publication : dans `/blog/running-docusaurus-with-docker` (mentionner oha comme outil pour tester les performances) et dans `/blog/bruno` (mentionner oha comme complément load-test vs. Bruno pour tests fonctionnels).

## 10 nouveaux articles (confirmés 2026-07-31)

Christophe a sélectionné 10 sujets lors d'une session de brainstorming. Deux phases :

### Phase 1 — à rédiger en priorité (drafts créés 2026-07-31)

| Slug | Titre | Dépendances |
| --- | --- | --- |
| `linux-yq` | yq — YAML processor (jq pour les fichiers YAML) | Aucune. Lien réciproque vers `/blog/linux-jq` à ajouter à la publication. |
| `direnv` | direnv — auto-load .env au cd | Aucune. Lien réciproque vers `/blog/bash-load-env` à ajouter. |
| `navi` | navi — cheatsheets interactives avec fzf | Aucune. Liens réciproques vers `/blog/linux-fzf-introduction` et `/blog/fzf-ripgrep`. |
| `hyperfine` | hyperfine — benchmarking CLI | Aucune. Liens réciproques vers `/blog/ripgrep` et `/blog/linux-eza`. |
| `git-interactive-rebase` | git rebase -i — nettoyer l'historique | Aucune. Liens réciproques vers `/blog/git-delta` et `/blog/git-worktree`. |

### Phase 2 — à rédiger ensuite (pas encore écrits)

| Slug (prévu) | Titre | Notes |
| --- | --- | --- |
| `ssh-proxyjump` | SSH ProxyJump + tunnels | Bastion host, LocalForward, fonction ZSH `stun` avec fzf. **Draft créé 2026-07-31.** |
| `caddy` | Caddy — HTTPS automatique | Serveur web + reverse proxy, Caddyfile, `tls internal` pour dev local. **Draft créé 2026-07-31.** |
| `open-webui-advanced` | Open WebUI — au-delà du chat | RAG local, presets modèles, Tools/Functions. `tried_it: false` positionné — vérifier l'interface avant publication. **Draft créé 2026-07-31.** |
| `mcp-python-server` | MCP — serveur Python pour Claude Code | Python `mcp` SDK (FastMCP), `docker-inspector` avec 6 tools. Le code n'a pas été testé contre un vrai Claude Code — vérifier les chemins dans `settings.json` avant publication. **Draft créé 2026-07-31.** |
| `ai-explain` | ai-explain — ELI5 terminal (série Ollama) | Dernier article de la série — publier APRÈS les 11 articles de la série. **Draft créé 2026-07-31.** |

## Nouveau brouillon standalone (créé 2026-08-11) — Copy as Markdown

| Slug | Angle | Dépendance |
| --- | --- | --- |
| `docusaurus-copy-as-markdown` | Reproduire le composant `src/components/CopyAsMarkdown` (bouton « Copy as Markdown » / « View raw » dans l'en-tête d'article) sur son propre blog Docusaurus. Couvre un plugin `postBuild` simplifié (mirroir `.md` par article) puis le composant React réel de ce repo (`<Snippet source="src/components/CopyAsMarkdown/index.js">`, source réelle, pas une copie). Volontairement plus simple que `plugins/markdown-export-plugin` (qui dégrade les composants MDX custom) — signalé en « Under the Hood » sans en détailler le code. | Aucune dépendance sur des brouillons non publiés. Liens internes vers `/blog/docusaurus-reactions`, `/blog/docusaurus-go-top` et `/blog/docusaurus-snippets` (tous déjà publiés). |

**Avant de publier `docusaurus-copy-as-markdown` :**

- `readme.md` du composant a été créé en même temps (`src/components/CopyAsMarkdown/readme.md`) — il pointe déjà vers cet article via son slug ; vérifier que le lien reste correct si le slug change.
- Le plugin `plugins/markdown-mirror-plugin/index.cjs` montré dans l'article est un fichier pédagogique simplifié (`.unpublished/copy-as-markdown/files/`), testé localement (247 mirroirs générés sans erreur) mais jamais ajouté à `docusaurus.config.js` de ce repo — ce blog utilise déjà le vrai `plugins/markdown-export-plugin`, plus complet.
- Article validé par un `yarn build` complet (copie temporaire dans `blog/`, supprimée après) : compile sans erreur MDX, aucun lien interne cassé.
- Lien réciproque à ajouter au moment de la publication : aucun strictement nécessaire (l'article ne dépend d'aucun autre brouillon), mais envisager une mention dans `/blog/docusaurus-reactions` ou `/blog/docusaurus-snippets` (« autres composants de cette série ») si Christophe le souhaite.

## Correction apportée à un article déjà publié (2026-07-27)

`/blog/ollama-installation` (publié 2026-03-30) a été corrigé suite à une vérification demandée par
Christophe : section Continue mise à jour (config.yaml au lieu de config.json désormais déprécié,
mention du rachat de Continue.dev par Cursor/Anysphere en juin 2026 et du statut figé du dépôt,
remplacement de `gemma2:27b` par `qwen3-coder:30b` comme modèle "plus puissant" recommandé — reflète
son usage réel actuel). Une entrée `updates:` a été ajoutée au frontmatter. Les anciens fichiers
`files/continue/config*.json` (et leurs `.eli5.json` générés) ont été supprimés, remplacés par des
`.yaml` équivalents. Non re-vérifié : l'affirmation de l'article comme quoi la config Continue doit
être dans le dossier home Windows plutôt que côté WSL — laissée telle quelle avec une réserve ajoutée
dans le texte, Christophe n'a pas encore retesté ce point.
