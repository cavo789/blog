# Suggestions d'articles à publier

Backlog d'idées d'articles, distinct des TODOs "code" habituels : ce fichier n'est **pas** traité
par `/todo` ni listé par `/todo-plan` (exclu comme les journaux `0000-*.md`). Il vit tant qu'il y a
des idées, et n'est jamais archivé dans `DONE/`/`PARTIAL/` — chaque idée garde son propre statut via
la case à cocher de son titre.

**Maintenu par** [`/suggestions-add`](../.claude/commands/suggestions-add.md) (ajoute une idée) et
[`/suggestions-write`](../.claude/commands/suggestions-write.md) (choisit une ou plusieurs idées non
cochées, rédige le draft dans `.unpublished/`, coche le titre correspondant). Peut aussi être édité
à la main.

## Statut

Le pipeline `.unpublished/` contient déjà une cinquantaine de drafts — le goulot est la publication,
pas l'idéation. Les idées ci-dessous restent donc à l'état de **proposition**, sans contenu rédigé,
jusqu'à ce qu'une soit explicitement choisie via `/suggestions-write`.

## Idées

### [ ] Trivy — scan de vulnérabilités d'image Docker

- Bridge docker × security. Le blog n'a qu'un seul post `security` publié
  (`/blog/aesecure-quickscan`) malgré 21 articles Docker.
- Complément naturel du draft `docker-dive` (angle poids/gaspillage) → duo "inspecte ton image sous
  deux angles : poids puis vulnérabilités".
- Grype écarté (Christophe ne le connaît pas) — Trivy seul.

### [ ] tmux — persistance de session, utile en particulier via SSH

- Intérêt réel même avec WSL2 + Windows Terminal (qui couvre déjà panes/tabs en local) : la vraie
  valeur de tmux est la **persistance à distance**. Une session tmux lancée sur un serveur distant
  survit à la coupure du tunnel SSH — on se reconnecte et on retrouve le shell exactement où on
  l'avait laissé, y compris un process encore en cours (build, watch, script long).
- Bridge naturel avec le draft `ssh-proxyjump` (bastion) : lancer tmux côté hôte distant/bastion, se
  reconnecter sans rien perdre après une coupure réseau.
- Moins pertinent comme remplacement des split panes locaux (déjà couverts par Windows Terminal) —
  l'angle à garder est SSH/distant, pas local.

### [ ] Gitleaks — scan de secrets (staged diff ou historique complet)

- Remplace la suggestion initiale "CodeQL/Dependabot" — Christophe utilise Gitleaks au bureau.
- Bridge github/gitlab × security × code-quality. Fait pendant CI (ou en pre-commit) le pendant de
  `ai-secrets` (déjà publié dans `/blog/ollama-git-precommit`, approche LLM) mais sans dépendance à
  un modèle — détection par règles/regex classiques, scan de tout l'historique git possible en plus
  du diff staged.
- Donnerait un deuxième article au cluster GitHub Actions qui vient de s'ouvrir avec le draft
  `docusaurus-github-actions-ssh-deploy`.

### [ ] Audit d'accessibilité des composants Docusaurus du blog

- Confirmé par Christophe comme bonne idée, à intégrer logiquement dans la série
  "Creating Docusaurus components".
- Angle "dogfooding" : auditer AlertBox, Trees, Terminal, etc. (14 composants React publiés) contre
  WCAG — même esprit que le draft `blog-time-to-value-audit` (audit du blog par lui-même).
- Aucun article accessibilité/a11y/WCAG sur le blog à ce jour (vérifié par grep, pas de faux positif).

### [ ] Code spelling — `erikvl87/languagetool` + `crate-ci/typos` en CI/pre-commit

- Vérifié par grep : `erikvl87/languagetool` est déjà mentionné dans `/blog/running-docusaurus-using-docker`
  mais uniquement comme extension VSCode interactive (`davidlday.languagetool-linter`, correction au fil
  de l'écriture dans l'éditeur). `crate-ci/typos` n'apparaît nulle part sur le blog — pas de doublon.
- Angle différent et complémentaire : automatiser la détection de fautes/typos comme **gate CI ou
  pre-commit**, pas juste un confort d'édition. `typos` (Rust, très rapide) scanne code + prose et
  détecte les coquilles ; `erikvl87/languagetool` (image Docker déjà utilisée dans le devcontainer)
  couvre la grammaire/orthographe plus fine sur le texte des articles.
- Bridge code-quality × docker × qualité de contenu. Sibling naturel de `/blog/markdown-lint` et
  `/blog/git-precommit` (déjà publiés) — complète la panoplie des checks avant commit à côté des
  checks IA de `/blog/ollama-git-precommit`.
- Distinct du draft `typo-report-docusaurus` (widget de feedback lecteur, one-way, PHP+HMAC) : celui-ci
  détecte les fautes automatiquement à l'écriture/au commit, l'autre laisse le lecteur les signaler
  après publication — deux angles complémentaires, pas un doublon.

### [ ] Kubernetes — premiers pas : concepts, à quels besoins ça répond, et un mini-lab pratique

- Idée de Christophe (2026-08-26) : aucun tutoriel Kubernetes sur le blog. Vérifié par grep —
  `kubernetes`/`kubectl`/`k8s` n'apparaissent que dans des mentions de passage (comparaison avec
  Docker Compose dans `docker-prod-devcontainer`, jeu d'icônes dans `docker-diagrams`, exemple de
  cheatsheet dans le draft `navi`, alternative "plus lourde" évoquée dans le draft `caddy`) — aucun
  article dédié, pas de doublon.
- Deux volets explicitement demandés : (1) les concepts de base et **à quels besoins Kubernetes
  répond** (au-delà de Docker Compose : scaling, self-healing, déploiements multi-nœuds — l'angle
  "pourquoi", pas juste "comment"), (2) un mini-lab concret pour rendre l'intérêt immédiatement
  palpable (candidat naturel : `kind` ou `minikube` en local, déployer une petite app, voir le
  self-healing/scaling en action).
- Bridge naturel avec le plus gros cluster du blog (21 articles Docker) — premier pont vers
  l'orchestration. À positionner clairement par rapport au trio Traefik/Portainer/lazydocker déjà en
  draft (single-host, pas d'orchestration) pour ne pas créer de confusion sur le "quand utiliser
  quoi".
- Portée à cadrer avant rédaction : sujet plus vaste qu'un article "un outil, un article" habituel —
  probablement à découper (partie concepts + partie lab) plutôt qu'un seul post dense.
