# Plan de publication — Brouillons dans `.unpublished/`

Notes de travail sur un ordre de publication sensé pour les brouillons présents dans `.unpublished/`.
Ce n'est pas un article de blog — juste un fichier de planification, pour moi (Claude) et pour
Christophe. Jamais publié, donc écrit en français.

> **Maintenance :** ce fichier doit être mis à jour à chaque fois qu'un nouveau brouillon est créé
> dans `.unpublished/`, ou qu'un brouillon existant est publié (déplacé vers `blog/`) ou supprimé.

## Pourquoi l'ordre compte ici

La plupart des brouillons sont indépendants et peuvent sortir n'importe quand. La série "Ollama
daily-use functions" ne l'est pas : plusieurs articles font un lien vers un article précédent, ou
supposent dans leur texte qu'un article précédent est déjà publié.

**Contraintes dures (lien cassé ou chronologie incohérente sinon) :**

- `ollama-test-generator` (**ai-test**) doit être le premier de la série. Il définit la fondation
  partagée — `~/.zsh/fns/_ollama.zsh` (`_ollama_query`, le registre `AI_COMMANDS`, le dispatcher `ai`
  lui-même) — que tous les autres articles `ai-*` supposent déjà en place.
- `ollama-ai-commit` (**ai-commit**) fait un lien direct vers `/blog/ollama-test-generator`. Doit
  venir juste après ai-test.
- `docling` doit être publié avant `ollama-ai-docs` (**ai-translate** / **ai-summarize**) — ce dernier
  fait un lien direct vers `/blog/docling` et son helper `_ai-docs.zsh` appelle `docling-convert`.
- `ollama-ai-docs` doit être publié avant `ollama-ai-diff` (**ai-diff**) — le mode "deux fichiers"
  d'ai-diff réutilise directement `_ai_extract_text`, défini dans `_ai-docs.zsh` (l'article ai-docs).
  Transitivement, `docling` doit donc aussi précéder `ai-diff`.

**Contraintes souples (pas de lien cassé, mais le texte cite la fonction comme "déjà couverte") :**

- `ollama-ai-review` — cite `ai-commit` comme déjà existant.
- `ollama-ai-secrets` — fait un lien **dur** vers `/blog/ollama-ai-review` (pas juste une mention en
  passant) : doit venir après lui.
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

## Ordre proposé — "Ollama daily-use functions" + docling

| # | Slug | Fonction(s) | Pourquoi ici |
| --- | --- | --- | --- |
| 1 | `ollama-test-generator` | `ai-test` | Premier obligatoire — définit `_ollama.zsh`, `AI_COMMANDS`, `ai` |
| 2 | `ollama-ai-commit` | `ai-commit` | Deuxième obligatoire — lien vers #1, première vraie démo du menu `ai` |
| 3 | `ollama-ai-review` | `ai-review` | Cite `ai-commit` comme antérieur ; même squelette, s'enchaîne juste après |
| 4 | `ollama-ai-secrets` | `ai-secrets` | Lien dur vers #3 — pont sécurité × IA, pass dédié après le sibling générique |
| 5 | `ollama-ai-standup` | `ai-standup` | Nécessaire avant #6 et #7 (qui le citent tous les deux) |
| 6 | `ollama-ai-fix` | `ai-fix` | Cite `ai-standup`, `ai-test`, `ai-commit` comme antérieurs |
| 7 | `ollama-ai-ci` | `ai-ci` | Cite `ai-fix`, `ai-standup` comme antérieurs ; plus lourd (token API externe) |
| 8 | `ollama-ai-ask` | `ai-ask` | Libre ; lecture courte et facile après le plus lourd ai-ci |
| 9 | `ollama-ai-diagram` | `ai-diagram` | Libre ; pont IA × doc-as-code, angle encore différent |
| 10 | `ollama-ai-data` | `ai-data` | Libre, mais doit précéder `duckdb-json-csv` (hors série) qui le cite |
| 11 | `docling` | — (hors série) | Doit précéder #12, #13, et les deux ponts hors série `duckdb-json-csv`/`python-security-bandit-audit` |
| 12 | `ollama-ai-docs` | `ai-translate`, `ai-summarize` | Dépend de #11 ; doit précéder #13 |
| 13 | `ollama-ai-diff` | `ai-diff` | Dernier obligatoire de la série — dépend de #12 (`_ai_extract_text`) et transitivement de #11 ; bonne conclusion, referme la boucle avec `delta`/`git diff` |

C'est l'ordre minimal qui respecte toutes les contraintes ci-dessus. Inverser #3/#4 avec #5, ou avancer
les positions #8/#9/#10 entre elles, est sans risque ; rien avant #1 ni après #13 (par rapport aux
autres membres de la série) ne l'est, et #11→#12→#13 doit rester dans cet ordre relatif.

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
| Entre #4 et #5 | `xdebug-docker-vscode` — aucune dépendance, rupture nette avec le contenu terminal (PHP/VSCode/debugging) après deux articles centrés sur le `git diff` staged |
| Entre #5 et #6 | `typo-report-docusaurus` ou `tried_it` — deux articles de composants Docusaurus, coupure nette avec le contenu terminal |
| Entre #7 et #8 | `removing-algolia-for-pagefind` — court, orienté infra, bonne respiration |
| Entre #8 et #9 | `anythingllm-chat-with-your-docs` — même thème Ollama, mais un angle radicalement différent (application self-hosted complète pour "chatter" avec ses documents, pas une fonction zsh) ; assez développé pour tenir seul comme respiration dans la série |
| Après #11 (`docling`) | `python-security-bandit-audit` — dépendance dure sur `docling` (voir plus haut), aucune sur le reste de la série ; bon point de sortie vers un thème différent (sécurité Python) |
| Après #11, avant ou après #13 | `duckdb-json-csv` — dépendance dure sur `docling` ET `ollama-ai-data` (#10) ; cite `ai-data` en conclusion donc se lit mieux s'il ne suit pas *trop* loin derrière |
| Après #13 | `python-ai-helper` — une fois ai-test/ai-review publiés, l'approche plus lourde (Docker, Python uniquement) de cet ancien brouillon se lit comme "l'alternative costaude" plutôt qu'une idée redondante ; mérite une petite relecture pour faire le lien avec la série à ce moment-là |

`ollama-refactor-code` n'apparaît pas dans ce plan — ce ne sont encore que des fichiers source dans
`files/`, aucun `index.md` n'a été écrit, ce n'est donc pas candidat à la publication pour l'instant.

La chaîne `lazydocker` → `portainer` → `traefik` (voir section dédiée plus bas) est totalement
indépendante de la série Ollama et peut s'intercaler n'importe où dans ce calendrier global, du moment
que son ordre interne 1→2→3 est respecté et que `portainer` suit bien `anythingllm-chat-with-your-docs`
s'il n'est pas encore publié.

## Avant de publier #1 (bloquant dans tous les cas)

- `src/data/series.js` contient déjà l'entrée "Ollama daily-use functions", mais `/img/series/ollama.webp`
  n'existe pas encore sur disque — la page `/series` affichera une image cassée tant qu'elle n'est pas
  créée (~1000-1500px, WebP, dans le style des autres bannières de série).
- Aucun des scripts zsh de cette série n'a été exécuté contre une vraie instance Ollama — la logique a
  été soigneusement raisonnée, mais `_ollama_query`, `docling-convert`, les appels à l'API GitLab dans
  `ai-ci`, et le mécanisme `print -z`/`fzf` dans `ai-data` méritent un vrai passage de test sur ta
  machine, pas seulement une relecture.
- Le Dockerfile de `docling` (image de base CUDA, passthrough GPU) est le seul élément de ce lot
  construit à partir de la documentation plutôt que d'un cycle build-and-test réel ici — à builder une
  fois contre ta carte 24GB avant de considérer l'article comme final.
- `ollama-ai-diff` et `ollama-ai-docs` partagent `_ai-docs.zsh` — vérifier que les deux copies restent
  identiques si l'une des deux est modifiée après coup (même logique que `_ollama.zsh`, dupliqué dans
  chaque dossier de brouillon pour que chaque article reste autoportant).
- `ollama-ai-secrets` et `ollama-ai-diagram` : même réserve que le reste de la série, logique
  raisonnée mais jamais exécutée contre un vrai Ollama ni un vrai `fzf`/`git diff`.

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
