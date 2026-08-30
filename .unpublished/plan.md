# Plan de publication — Brouillons dans `.unpublished/`

Jamais publié, écrit en français. Pour la logique détaillée derrière chaque ligne, voir la section
**Détails et contraintes** plus bas — ce tableau est la version courte à lire en premier.

> **Maintenance :** mettre à jour ce fichier à chaque nouveau brouillon, chaque publication (déplacé
> vers `blog/`) ou chaque suppression. **Avant toute lecture de ce plan, vérifier que chaque slug
> cité existe encore sous `.unpublished/<slug>/` — un slug qui n'y est plus a été publié entretemps
> et doit être retiré du plan, pas juste laissé tel quel.**

## Ordre de publication recommandé

49 brouillons ont un `index.md` (50e, `ollama-refactor-code`, pas encore rédigé — exclu du plan).

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
| 6 | `typo-report-docusaurus` ou `tried_it` | Respiration, aucune contrainte |
| 7 | `ollama-ai-ask` | Aucune contrainte |
| 8 | `removing-algolia-for-pagefind` | Aucune contrainte |
| 9 | `ollama-ai-diagram` | Aucune contrainte |
| 10 | `ollama-ai-data` | Doit précéder `duckdb-json-csv` (#12) |
| 11 | `docling` | Doit précéder #12, #13, #14 |
| 12 | `python-security-bandit-audit` | Après `docling` (#11) |
| 13 | `ollama-ai-translate` | Libre, mais avant #14 de préférence |
| 14 | `ollama-ai-docs` | Après `docling` (#11) ; avant #15 |
| 15 | `ollama-ai-diff` | Ferme la série — après #14 |
| 16 | `duckdb-json-csv` | Après `docling` (#11) et `ollama-ai-data` (#10) |
| 17 | `python-ai-helper` | Se lit mieux une fois ai-test/ai-review publiés (déjà le cas) |
| 18 | `ai-explain` | Dernier de la série Ollama — après tous les articles ci-dessus |
| 19 | `lazydocker` | Ouvre la mini-série Docker — avant #29 et #30 |
| 20 | `linux-yq` | Aucune contrainte |
| 21 | `direnv` | Aucune contrainte |
| 22 | `navi` | Aucune contrainte |
| 23 | `hyperfine` | Aucune contrainte |
| 24 | `git-interactive-rebase` | Aucune contrainte |
| 25 | `vscode-gitlens` | Aucune contrainte |
| 26 | `vscode-profiles` | Aucune contrainte |
| 27 | `vscode-multi-root-git-worktree` | Aucune contrainte |
| 28 | `vscode-snippets-for-docusaurus` | Aucune contrainte |
| 29 | `portainer` | Après `lazydocker` (#19) |
| 30 | `traefik` | Après `lazydocker` (#19) et `portainer` (#29) |
| 31 | `vscode-extension-bisect` | Après `git-bisect` (#1) |
| 32 | `docker-dive` | Après `lazydocker` (#19), sinon retirer le lien en conclusion |
| 33 | `ai-agent-in-devcontainer` | Aucune contrainte |
| 34 | `atuin-bash-history` | Aucune contrainte |
| 35 | `oha-http-load-testing` | Aucune contrainte |
| 36 | `ssh-proxyjump` | Aucune contrainte |
| 37 | `caddy` | Aucune contrainte |
| 38 | `open-webui-advanced` | Aucune contrainte |
| 39 | `mcp-python-server` | Aucune contrainte |
| 40 | `copy-as-markdown` | Aucune contrainte |
| 41 | `blog-time-to-value-audit` | Aucune contrainte |
| 42 | `docusaurus-blog-map` | Ouvre la mini-série navigation — avant #43-44 |
| 43 | `docusaurus-ask-my-blog` | Aucune contrainte propre, mais avant #44 |
| 44 | `docusaurus-command-palette` | Après #42 et #43 |
| 45 | `docusaurus-ask-my-blog-bubble` | Après #42, #43, #44 |
| 46 | `docusaurus-github-actions-ssh-deploy` | Aucune contrainte |
| 47 | `docusaurus-pwa` | Aucune contrainte |
| 48 | `docusaurus-mobile-preview` | Aucune contrainte |

`ollama-refactor-code` n'apparaît pas : ce ne sont que des fichiers `files/`, aucun `index.md`.

---

## Détails et contraintes

*(Notes de travail pour Claude — historique des décisions, réserves techniques à lever avant
publication, chiffres vérifiés. Non nécessaire à la lecture rapide de l'ordre ci-dessus.)*

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

### Série "Ollama daily use" — pourquoi cet ordre

Fondation (`ollama-test-generator`, `ai-test`) et premier bloc pre-commit (`ollama-git-precommit`,
`ai-review` + `ai-secrets` + `ai-commit` fusionnés le 2026-07-30) déjà publiés — plus de contrainte
d'ordre sur eux, ils sont déjà en ligne pour tout brouillon qui les cite.

- `docling` doit être publié avant `ollama-ai-docs` (**ai-summarize** + `_ai_extract_text`) — ce
  dernier fait un lien direct vers `/blog/docling` et son helper `_ai-docs.zsh` appelle
  `docling-convert`.
- `ollama-ai-docs` doit être publié avant `ollama-ai-diff` (**ai-diff**) — le mode "deux fichiers"
  d'ai-diff réutilise `_ai_extract_text`, défini dans `_ai-docs.zsh`. Transitivement, `docling`
  doit donc aussi précéder `ai-diff`.
- `ollama-ai-translate` (**ai-translate**) est indépendant — fonctionne sans Docling (texte/pipe),
  dépendance sur `_ai_extract_text` optionnelle (graceful fallback). Si publié après
  `ollama-ai-docs`, mettre à jour l'AlertBox "supersedes".
- `ollama-ai-fix` cite `ai-standup`, `ai-test` et `ai-commit` comme déjà existants (contrainte
  souple — pas de lien cassé si l'ordre n'est pas respecté, juste une incohérence de texte ;
  `ai-test`/`ai-commit` sont de toute façon déjà publiés).
- `ollama-ai-ci` cite `ai-fix` et `ai-standup` comme déjà existants (contrainte souple).
- `ollama-ai-ask`, `ollama-ai-data`, `ollama-ai-diagram` ne citent aucun autre brouillon de la
  série par nom — libres.
- `duckdb-json-csv` (hors série) fait un lien dur vers `/blog/docling` ET `/blog/ollama-ai-data` —
  doit venir après les deux.
- `python-security-bandit-audit` (hors série) fait un lien dur vers `/blog/docling`.
- `ai-explain` (ELI5 terminal) est le dernier article prévu de la série — à publier après tous les
  autres brouillons `ollama-ai-*` restants.

### Intercaler avec le reste de `.unpublished/`

Des articles "Ollama" d'affilée serait trop pour les lecteurs réguliers — d'où les respirations
placées dans le tableau (`winscp-putty`/`git-bisect`, `xdebug-docker-vscode`,
`typo-report-docusaurus`/`tried_it`, `removing-algolia-for-pagefind`). Les positions libres entre
elles peuvent être permutées sans casser de contrainte.

### Mini-série Docker : lazydocker → Portainer → Traefik (créée 2026-07-27)

Chaîne de dépendances **dures** (vrais `<Link>`), ordre strict :

- `lazydocker` : premier obligatoire — cité par `portainer` et `traefik`.
- `portainer` : cite `lazydocker` (dépendance sur `anythingllm-chat-with-your-docs` levée, déjà
  publié depuis le 2026-08-17).
- `traefik` : cite `lazydocker` ET `portainer` — doit venir après les deux.

Les trois peuvent être espacés dans le calendrier tant que l'ordre relatif 1→2→3 est respecté.

**Avant de publier `lazydocker` :** vérifier que le tag `ARG LAZYDOCKER_VERSION=0.23.3` existe
toujours sur [github.com/jesseduffield/lazydocker/releases](https://github.com/jesseduffield/lazydocker/releases).
Aucun des trois `Dockerfile`/`compose.yaml` n'a été buildé ni testé contre un vrai hôte Docker.
Captures d'écran manquantes pour les trois (TUI lazydocker, dashboard Portainer, dashboard
Traefik) — à faire une fois testé.

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

- **Série Ollama (tous) :** `/img/series/ollama.webp` n'existe pas encore sur disque (page
  `/series` cassée tant que non créée). Aucun script zsh de la série n'a été exécuté contre une
  vraie instance Ollama. Le FZF interactif multi-param (`AI_PARAMS`, helpers
  `_ai_prompt_file/language/number/text`) n'a pas été testé en conditions réelles. `ollama-ai-diff`
  et `ollama-ai-docs` partagent `_ai-docs.zsh`, dupliqué dans chaque dossier — vérifier que les
  deux copies restent identiques après modification.
- **`docling` :** Dockerfile (image CUDA, passthrough GPU) construit à partir de la doc, jamais
  buildé — à tester contre la carte 24GB avant de considérer l'article final.
- **`duckdb-json-csv` :** URL/version du binaire CLI (`v1.5.5`) vérifiées via l'API GitHub à la
  rédaction, jamais buildée — revérifier que le tag existe encore.
- **`xdebug-docker-vscode` :** config Xdebug 3.x/VSCode raisonnée mais jamais testée en conditions
  réelles, en particulier `pathMappings` dans `launch.json`.
- **`python-security-bandit-audit` :** identifiants d'avisory (`GHSA-...`) dans la démo `pip-audit`
  illustratifs, indiqué dans l'article lui-même.
- **`atuin-bash-history` :** version épinglée `v18.16.1` — revérifier sur
  [github.com/atuinsh/atuin/releases](https://github.com/atuinsh/atuin/releases) avant
  publication. Dockerfile jamais buildé/testé. Liens réciproques à poser dans `/blog/linux-history`
  et `/blog/linux-fzf-introduction`.
- **`oha-http-load-testing` :** sorties `<Terminal>` illustratives, non exécutées contre
  localhost:3000. Vérifier `ghcr.io/hatoo/oha:latest` et la version dans `<Prerequisite>`
  (`oha 0.6.4`). Liens réciproques à poser dans `/blog/running-docusaurus-with-docker` et
  `/blog/bruno`.
- **`ai-agent-in-devcontainer` :** basé sur une source externe (article Antoine Benevaut + doc
  GitHub Symfony Docker) — vérifier que les liens sont toujours valides. Non testé personnellement
  (`tried_it: false`).
- **`docker-dive` :** images de démo (`myapp:bad`, `myapp:v2`, etc.) non construites — chiffres
  illustratifs mais réalistes, à vérifier après build réel. Lien vers `/blog/lazydocker` en
  conclusion à retirer/remplacer si `docker-dive` sort avant `lazydocker`.
- **`copy-as-markdown` :** validé par un `yarn build` complet (247 miroirs générés sans erreur,
  aucun lien cassé). Le plugin montré dans l'article est pédagogique/simplifié, jamais ajouté au
  vrai `docusaurus.config.js` (ce blog utilise `plugins/markdown-export-plugin`, plus complet).
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

### Correction apportée à un article déjà publié (2026-07-27)

`/blog/ollama-installation` (publié 2026-03-30) corrigé : section Continue mise à jour
(`config.yaml` au lieu de `config.json`, rachat de Continue.dev par Cursor/Anysphere en juin 2026,
`qwen3-coder:30b` comme modèle recommandé). Entrée `updates:` ajoutée. Non re-vérifié :
l'affirmation sur l'emplacement de la config Continue (dossier home Windows vs. WSL).
