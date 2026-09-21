# Plan de publication — Brouillons dans `.unpublished/`

Jamais publié, écrit en français. Pour la logique détaillée derrière chaque ligne, voir la section
**Détails et contraintes** plus bas — ce tableau est la version courte à lire en premier.

> **Maintenance :** mettre à jour ce fichier à chaque nouveau brouillon, chaque publication (déplacé
> vers `blog/`) ou chaque suppression. **Avant toute lecture de ce plan, vérifier que chaque slug
> cité existe encore sous `.unpublished/<slug>/` — un slug qui n'y est plus a été publié entretemps
> et doit être retiré du plan, pas juste laissé tel quel.**

## Ordre de publication recommandé

50 brouillons ont un `index.md` (50e, `ollama-refactor-code`, pas encore rédigé — exclu du plan).

Fondations de la série Ollama déjà publiées entretemps : `ollama-test-generator` (2026-08-03) et
`ollama-git-precommit` (2026-08-10). `ollama-ai-standup` peut donc sortir dès maintenant, sans
attendre aucun autre brouillon.

| # | Slug | Contrainte |
| --- | --- | --- |
| 1 | `winscp-putty` ou `git-bisect` | Respiration, aucune contrainte |
| 2 | `ollama-ai-standup` | Avant #3 et #4 (le reste de la série) |
| 3 | `ollama-ai-fix` | Après #2 |
| 4 | `xdebug-docker-vscode` | Respiration, aucune contrainte |
| 5 | `ollama-ai-ci` | Après #2 et #3 |
| 6 | `ollama-tag-suggester` | Aucune contrainte — seul brouillon Ollama déjà vérifié en conditions réelles |
| 7 | `typo-report-docusaurus` ou `tried_it` | Respiration, aucune contrainte |
| 8 | `ollama-ai-ask` | Aucune contrainte |
| 9 | `removing-algolia-for-pagefind` | Aucune contrainte |
| 10 | `ollama-ai-diagram` | Aucune contrainte |
| 11 | `ollama-ai-data` | Doit précéder `duckdb-json-csv` (#16) |
| 12 | `python-security-bandit-audit` | `docling` publié (2026-09-17) — plus aucune contrainte |
| 13 | `ollama-ai-translate` | Libre, mais avant #14 de préférence |
| 14 | `ollama-ai-docs` | `docling` publié (2026-09-17) ; avant #15 |
| 15 | `ollama-ai-diff` | Ferme la série — après #14 |
| 16 | `duckdb-json-csv` | `docling` publié (2026-09-17) ; après `ollama-ai-data` (#11) |
| 17 | `python-ai-helper` | Se lit mieux une fois ai-test/ai-review publiés (déjà le cas) |
| 18 | `ai-explain` | Dernier de la série Ollama — après tous les articles ci-dessus |
| 19 | `linux-yq` | Aucune contrainte |
| 20 | `direnv` | Aucune contrainte |
| 21 | `navi` | Aucune contrainte |
| 22 | `hyperfine` | Aucune contrainte |
| 23 | `git-interactive-rebase` | Aucune contrainte |
| 24 | `vscode-gitlens` | Aucune contrainte |
| 25 | `vscode-profiles` | Aucune contrainte |
| 26 | `vscode-multi-root-git-worktree` | Aucune contrainte |
| 27 | `vscode-snippets-for-docusaurus` | Aucune contrainte |
| 28 | `portainer` | Après `lazydocker` (publié le 2026-09-03) |
| 29 | `traefik` | Après `lazydocker` (publié le 2026-09-03) et `portainer` (#28) |
| 30 | `vscode-extension-bisect` | Après `git-bisect` (#1) |
| 31 | `docker-dive` | `lazydocker` publié (2026-09-03) — garder le lien en conclusion |
| 32 | `ai-agent-in-devcontainer` | Aucune contrainte |
| 33 | `oha-http-load-testing` | Aucune contrainte |
| 34 | `ssh-proxyjump` | Aucune contrainte |
| 35 | `caddy` | Aucune contrainte |
| 36 | `open-webui-advanced` | Aucune contrainte |
| 37 | `mcp-python-server` | Aucune contrainte |
| 38 | `blog-time-to-value-audit` | Aucune contrainte |
| 39 | `docusaurus-blog-map` | Ouvre la mini-série navigation — avant #40-41 |
| 40 | `docusaurus-ask-my-blog` | Aucune contrainte propre, mais avant #41 |
| 41 | `docusaurus-command-palette` | Après #39 et #40 |
| 42 | `docusaurus-ask-my-blog-bubble` | Après #39, #40 et #41 |
| 43 | `docusaurus-github-actions-ssh-deploy` | Aucune contrainte |
| 44 | `docusaurus-pwa` | Aucune contrainte |
| 45 | `docusaurus-mobile-preview` | Aucune contrainte |
| 46 | `docusaurus-follow-rss-feeds` | Aucune contrainte sur un brouillon — mais lien réciproque à poser dans `/blog/blog-post-feed` à la publication |
| 47 | `docker-diff-read-only` | Aucune contrainte — `docker-volumes`, `docling` et `markitdown` sont publiés, les trois liens internes résolvent déjà |
| 48 | `ssh-config-tips` (dossier `ssh-config-global-proxyjump`) | Aucune contrainte — lien réciproque à poser dans `vscode-remote-ssh-proxyjump-devcontainer` à la publication |

`ollama-refactor-code` n'apparaît pas : ce ne sont que des fichiers `files/`, aucun `index.md`.

---

## Détails et contraintes

*(Notes de travail pour Claude — historique des décisions, réserves techniques à lever avant
publication, chiffres vérifiés. Non nécessaire à la lecture rapide de l'ordre ci-dessus.)*

### Déjà publiés entretemps (retirés du plan le 2026-09-15)

- `docling` → `blog/2026/09/17/docling` — débloque `python-security-bandit-audit`, `ollama-ai-docs`,
  `ollama-ai-diff` et `duckdb-json-csv`, qui pointaient tous vers `/blog/docling`. Lien réciproque
  posé dans `/blog/markitdown` à la publication.
- `copy-as-markdown` → `blog/2026/09/10/docusaurus-copy-as-markdown` (slug publié :
  `docusaurus-copy-as-markdown`, pas `copy-as-markdown`).

### Déjà publiés entretemps (retirés du plan le 2026-08-30)

Le plan précédent gardait ces cinq brouillons dans le tableau alors qu'ils avaient déjà été
déplacés vers `blog/` — corrigé après relecture par Christophe :

- `ollama-test-generator` → `blog/2026/08/03/ollama-test-generator`
- `ollama-git-precommit` → `blog/2026/08/10/ollama-git-precommit`
- `anythingllm-chat-with-your-docs` → `blog/2026/08/17/anythingllm-chat-with-your-docs`
- `docusaurus-llms-txt` → `blog/2026/08/24/docusaurus-llms-txt`
- `docusaurus-shake-easter-egg` → `blog/2026/08/27/docusaurus-shake-easter-egg`

Conséquence : les contraintes qui en dépendaient tombent — `portainer` n'a plus besoin d'attendre
`anythingllm-chat-with-your-docs`, `ollama-ai-standup` n'a plus besoin d'attendre `ollama-test-generator`
ni `ollama-git-precommit` (déjà publiés).

### Déjà publiés entretemps (retirés du plan le 2026-09-07)

- `vscode-remote-ssh-proxyjump-devcontainer` → `blog/2026/09/07/vscode-remote-ssh-proxyjump-devcontainer` — lien
  réciproque posé dans `/blog/2026/01/05/vscode-remote-ssh/index.md` (paragraphe "related articles").

### Déjà publiés entretemps (retirés du plan le 2026-09-03)

- `lazydocker` → `blog/2026/09/03/lazydocker` — ouvre la mini-série Docker. `portainer` et
  `traefik` peuvent désormais sortir (leur `<Link>` vers `/blog/lazydocker` résout). Liens
  réciproques posés à la publication dans `/blog/zsh-docker-functions`,
  `/blog/docker-out-of-docker-dood` et `/blog/docker-volumes`.

### Série "Ollama daily use" — pourquoi cet ordre

Fondation (`ollama-test-generator`, `ai-test`) et premier bloc pre-commit (`ollama-git-precommit`,
`ai-review` + `ai-secrets` + `ai-commit` fusionnés le 2026-07-30) déjà publiés — plus de contrainte
d'ordre sur eux, ils sont déjà en ligne pour tout brouillon qui les cite.

- `docling` est **publié** (2026-09-17) : `ollama-ai-docs` (**ai-summarize** + `_ai_extract_text`)
  peut sortir quand on veut, son lien vers `/blog/docling` résout et son helper `_ai-docs.zsh`
  appelle `docling-convert`, désormais documenté (les deux copies de `_ai-docs.zsh` appellent bien
  le wrapper `docling-convert`, pas la CLI `docling` directement — rien à resynchroniser).
- `ollama-ai-docs` doit être publié avant `ollama-ai-diff` (**ai-diff**) — le mode "deux fichiers"
  d'ai-diff réutilise `_ai_extract_text`, défini dans `_ai-docs.zsh`. Seule contrainte d'ordre
  restante sur ce couple (`docling` est publié).
- `ollama-ai-translate` (**ai-translate**) est indépendant — fonctionne sans Docling (texte/pipe),
  dépendance sur `_ai_extract_text` optionnelle (graceful fallback). Si publié après
  `ollama-ai-docs`, mettre à jour l'AlertBox "supersedes".
- `ollama-ai-fix` cite `ai-standup`, `ai-test` et `ai-commit` comme déjà existants (contrainte
  souple — pas de lien cassé si l'ordre n'est pas respecté, juste une incohérence de texte ;
  `ai-test`/`ai-commit` sont de toute façon déjà publiés).
- `ollama-ai-ci` cite `ai-fix` et `ai-standup` comme déjà existants (contrainte souple).
- `ollama-ai-ask`, `ollama-ai-data`, `ollama-ai-diagram` ne citent aucun autre brouillon de la
  série par nom — libres.
- `duckdb-json-csv` (hors série) fait un lien dur vers `/blog/docling` (publié) ET
  `/blog/ollama-ai-data` — seul ce dernier reste à publier avant lui.
- `python-security-bandit-audit` (hors série) fait un lien dur vers `/blog/docling` — résolu depuis
  le 2026-09-17.
- `ai-explain` (ELI5 terminal) est le dernier article prévu de la série — à publier après tous les
  autres brouillons `ollama-ai-*` restants.
- `ollama-tag-suggester` (créé 2026-08-30) ne cite aucun autre brouillon de la série par nom —
  libre. Fait un lien dur vers `/blog/docusaurus-ollama-tags` (déjà publié, daté 2026-08-31) et
  vers `/blog/docusaurus-tags` et `/blog/ollama-installation` (tous deux publiés) — aucune
  dépendance sur un autre brouillon.

### Intercaler avec le reste de `.unpublished/`

Des articles "Ollama" d'affilée serait trop pour les lecteurs réguliers — d'où les respirations
placées dans le tableau (`winscp-putty`/`git-bisect`, `xdebug-docker-vscode`,
`typo-report-docusaurus`/`tried_it`, `removing-algolia-for-pagefind`). Les positions libres entre
elles peuvent être permutées sans casser de contrainte.

### Mini-série Docker : lazydocker → Portainer → Traefik (créée 2026-07-27)

Chaîne de dépendances **dures** (vrais `<Link>`), ordre strict :

- `lazydocker` : **publié le 2026-09-03** (`blog/2026/09/03/lazydocker`) — cité par `portainer` et
  `traefik`. Publié en avance sur `docling` : le `<Link>` vers `/blog/docling` a été remplacé par
  `/blog/docker-volumes` (article publié) au moment de la publication.
- `portainer` : cite `lazydocker` (dépendance sur `anythingllm-chat-with-your-docs` levée, déjà
  publié depuis le 2026-08-17). Prêt à sortir.
- `traefik` : cite `lazydocker` ET `portainer` — doit venir après `portainer`.

Les deux restants peuvent être espacés dans le calendrier tant que l'ordre `portainer` → `traefik`
est respecté.

**Avant de publier `portainer` / `traefik` :** `ARG LAZYDOCKER_VERSION` était à jour (`0.25.2`,
dernière release au 2026-09-03) pour `lazydocker`. Les `Dockerfile`/`compose.yaml` de `portainer`
et `traefik` n'ont pas été buildés ni testés contre un vrai hôte Docker. Captures d'écran
manquantes pour les deux (dashboard Portainer, dashboard Traefik) — à faire une fois testé.

### Mini-série "navigation du blog" (créée 2026-08-12) — série *Creating Docusaurus components*

Chaîne de dépendances dure via `<Link>` :

| # | Slug | Dépend de |
| --- | --- | --- |
| 1 | `docusaurus-blog-map` | Aucune — ne lie que des articles publiés |
| 2 | `docusaurus-ask-my-blog` | Aucune — ne lie que des articles publiés |
| 3 | `docusaurus-command-palette` | #1 et #2 |
| 4 | `docusaurus-ask-my-blog-bubble` | #1, #2 et #3 |

`yarn links:check` signale actuellement des liens non résolus sur #3 et #4 — attendu, résolu en
publiant dans l'ordre 1→2→3→4.

Solide : tous les `<Snippet source="…">` pointent vers les vrais fichiers du repo. Chiffres
mesurés réellement le 2026-08-12 (247 nœuds / 1026 arêtes / 680 liens internes / 25 séries /
40 thèmes ; 2050 questions retenues sur 2055 ; index 468 Ko brut / 63 Ko gzip). Validé par un
`yarn build` complet (63 s, 415 fichiers HTML). Si publication tardive, relancer les mesures.

**Avant de publier (les quatre) :** captures d'écran réelles manquantes (maquettes ASCII en
attendant) ; liens réciproques à poser dans `/blog/docusaurus-series` et
`/blog/docusaurus-eli5-snippet-tooltips` à la publication de #1/#2 ; #4 décrit la bulle en bas à
droite (`right: 30px; bottom: 100px`) — corriger si déplacée ; #2 contient un exemple de session
`yarn questions:edit` illustratif, pas une vraie exécution.

### Nouveaux brouillons VSCode (créés 2026-07-27)

Indépendants entre eux, sauf :

- `vscode-extension-bisect` fait un `<Link>` dur vers `/blog/git-bisect` (encore brouillon) — doit
  venir après.
- `vscode-snippets-for-docusaurus` : le `<Snippet>` pointe vers le vrai fichier du repo — relire le
  paragraphe sur les entrées obsolètes (`CoreConcept`/`HighlyImportant`) si elles sont supprimées
  du fichier avant publication.

### Réserves techniques à lever avant publication (par brouillon)

- **Série Ollama (tous, sauf `ollama-tag-suggester`) :** `/img/series/ollama.webp` n'existe pas
  encore sur disque (page `/series` cassée tant que non créée). Aucun script zsh de la série n'a
  été exécuté contre une vraie instance Ollama. Le FZF interactif multi-param (`AI_PARAMS`,
  helpers `_ai_prompt_file/language/number/text`) n'a pas été testé en conditions réelles.
  `ollama-ai-diff` et `ollama-ai-docs` partagent `_ai-docs.zsh`, dupliqué dans chaque dossier —
  vérifier que les deux copies restent identiques après modification.
- **`ollama-tag-suggester` :** seul brouillon de la série réellement exécuté contre une vraie
  instance Ollama — les trois sorties `<Terminal>` sont des captures réelles (`task-tiny` puis
  `qwen3-coder:30b`, testées en session le 2026-08-30, dont un exemple fourni par Christophe
  lui-même sur `quarto-industrialisation`), pas des exemples illustratifs. Bannière
  `/img/v2/workflows.webp` approximative (aucune image dédiée "tags/IA" disponible dans
  `static/img/v2/`) — à remplacer si une bannière dédiée est créée, en gardant un titre court ou
  absent dans l'illustration. `/img/series/ollama.webp` manque
  toujours (réserve partagée avec le reste de la série, ci-dessus). Réciproques à poser à la
  publication : `/blog/docusaurus-tags` et `/blog/ollama-installation`.
- **`duckdb-json-csv` :** URL/version du binaire CLI (`v1.5.5`) vérifiées via l'API GitHub à la
  rédaction, jamais buildée — revérifier que le tag existe encore.
- **`xdebug-docker-vscode` :** config Xdebug 3.x/VSCode raisonnée mais jamais testée en conditions
  réelles, en particulier `pathMappings` dans `launch.json`.
- **`python-security-bandit-audit` :** identifiants d'avisory (`GHSA-...`) dans la démo `pip-audit`
  illustratifs, indiqué dans l'article lui-même.
- **`oha-http-load-testing` :** sorties `<Terminal>` illustratives, non exécutées contre
  localhost:3000. Vérifier `ghcr.io/hatoo/oha:latest` et la version dans `<Prerequisite>`
  (`oha 0.6.4`). Liens réciproques à poser dans `/blog/running-docusaurus-with-docker` et
  `/blog/bruno`.
- **`ai-agent-in-devcontainer` :** basé sur une source externe (article Antoine Benevaut + doc
  GitHub Symfony Docker) — vérifier que les liens sont toujours valides. Non testé personnellement
  (`tried_it: false`).
- **`docker-dive` :** images de démo (`myapp:bad`, `myapp:v2`, etc.) non construites — chiffres
  illustratifs mais réalistes, à vérifier après build réel. Lien vers `/blog/lazydocker` en
  conclusion : OK, `lazydocker` publié le 2026-09-03.
- **`blog-time-to-value-audit` :** chiffres réels du 2026-08-12 (318 articles audités, 180
  RESTRUCTURE / 109 MINOR / 29 OK, médiane TTV 42 %). Pas de `series:` (délibéré). Expose
  publiquement que 180 articles étaient mal structurés — décision éditoriale assumée. Bannière
  `/img/v2/clean_code.webp` approximative, une bannière dédiée serait mieux.
- **`docusaurus-github-actions-ssh-deploy` :** entièrement vérifié et à jour au 2026-08-18 (build
  reproductible documenté, durcissement SSH testé, chronométrage réel 89s+12s, `--delete` ciblé en
  trois passes). `files/deploy.yml` est anonymisé (`avonture.be` → `example.com`) — ne jamais faire
  un `cp` aveugle depuis le vrai workflow. Lien réciproque vers `/blog/github-action` **à poser à
  la publication** (phrase prête, juste à insérer). Tag `rsync` à créer dans `tags.yml` si utilisé.
- **`docusaurus-pwa` :** aucune dépendance. Bannière `/img/v2/docusaurus_tips.webp` approximative
  (déjà réutilisée sur deux autres articles de la série) — à remplacer si une bannière dédiée est
  créée. Date placeholder `2026-09-01`.
- **`docusaurus-mobile-preview` :** aucune dépendance sur un brouillon non publié — deux liens vers
  `/blog/docker-localhost-ssl` et `/blog/vscode-devcontainer`, tous deux déjà publiés. Date
  placeholder `2026-09-15`.
- **`docusaurus-follow-rss-feeds` :** écrit le 2026-09-10, date placeholder `2026-11-03`. Suite
  directe de `/blog/blog-post-feed` (le plugin de flux) — **lien réciproque à poser dans cet
  article-là à la publication**, impossible avant : un lien depuis un post publié vers un slug en
  `draft: true` casserait le build de production. Tous les `<Snippet source=…>` pointent vers les
  **vrais** fichiers du dépôt (`plugins/blog-feed-plugin/topic-feeds.cjs`,
  `src/components/FollowFeed/*`, `src/components/Blog/ArticleActions/index.tsx`) — aucune copie
  dans un `files/`, donc rien à resynchroniser, mais toute refonte de ces fichiers change l'article
  sans prévenir. Bannière `/img/v2/docusaurus_rss_enhanced.webp` partagée avec `/blog/blog-post-feed`.
  Captures d'écran prises sur le serveur de dev le 2026-09-10 : à refaire si l'UI bouge.

### Correction apportée à un article déjà publié (2026-07-27)

`/blog/ollama-installation` (publié 2026-03-30) corrigé : section Continue mise à jour
(`config.yaml` au lieu de `config.json`, rachat de Continue.dev par Cursor/Anysphere en juin 2026,
`qwen3-coder:30b` comme modèle recommandé). Entrée `updates:` ajoutée. Non re-vérifié :
l'affirmation sur l'emplacement de la config Continue (dossier home Windows vs. WSL).

### `docker-diff-read-only` (créé le 2026-09-16)

Né d'une discussion sur l'article `docling` : le fait « Docker monte tout `--tmpfs` en `noexec` »
était trop mince pour un article, mais `docker diff` comme **méthode** de découverte des chemins
inscriptibles, lui, porte un sujet entier. La première version du sujet (« la liste des dossiers
standards à monter ») a été écartée par Christophe, à raison : la liste n'est pas portable, chaque
outil a ses propres chemins (`/var/log`, `/var/run`, `/var/cache/nginx`, `~/.cache`, …). L'angle
retenu est donc l'inverse : la liste ne se connaît pas, elle se **mesure**.

Tout ce qui est publié dans l'article a été exécuté et capturé le 2026-09-16, pas rédigé de
mémoire :

- nginx `--read-only` plante bien sur `/var/cache/nginx/client_temp` ; `docker diff` remonte en
  plus `/run/nginx.pid` **et `/etc/nginx/conf.d/default.conf`** (l'entrypoint officiel réécrit sa
  propre config au boot — c'est le vrai « waouh » de l'article, aucune checklist ne le donne) ;
- le `compose.yaml` corrigé (tmpfs sur `/var/cache/nginx` et `/run`) démarre et sert, mais le
  message `info: can not modify /etc/...` persiste : conteneur sain, comportement perdu en
  silence ;
- l'image matplotlib échoue **en cascade** (d'abord `MPLCONFIGDIR`, puis `/out/chart.png`), et
  `docker diff` donne les trois écritures d'un coup ;
- version épinglée vérifiée dans l'image : `matplotlib==3.11.2`.

**Angle mesuré puis abandonné** : le cache de polices matplotlib reconstruit à chaque exécution ne
coûte rien de mesurable (0,73 s contre 0,68 s cache chaud). L'article ne prétend donc nulle part
que le tmpfs dégrade les performances — la dégradation silencieuse qu'il documente est celle de
nginx sur `/etc`, celle-là est réelle.

**Seul point non vérifié** : le bind mount `./out:/out` du second `compose.yaml`. Impossible à
tester depuis le devcontainer (Docker-outside-of-Docker résout les chemins sur l'hôte) ; testé avec
un volume nommé à la place. Mécanique standard, risque nul, mais à refaire tourner sur la machine
hôte avant publication.
