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

### [ ] act — exécuter les GitHub Actions en local avant de pousser

- Idée de Christophe (2026-08-27) : `act` (nektos/act) fait tourner les workflows
  `.github/workflows/*.yml` tels quels dans des conteneurs Docker qui émulent les runners GitHub —
  donc valider (et itérer sur) une Action en local, sans push, sans attendre le CI distant.
- Vérifié par grep — `nektos`/`act -j`/"actions en local" n'apparaissent nulle part sur le blog ni
  en draft ; pas de doublon direct.
- Chevauchement partiel avec `/blog/dagger-python` (même objectif "valider le pipeline localement
  avant push/CI") mais mécanisme différent : Dagger redéfinit les étapes comme des fonctions Python
  portables, alors qu'`act` rejoue la syntaxe GitHub Actions native — à mentionner explicitement en
  intro pour ne pas donner l'impression de refaire le même article avec un autre outil.
- Distinct aussi du draft `docusaurus-github-actions-ssh-deploy` (déploiement *via* GitHub Actions,
  execution distante) — ici l'angle est l'inverse : rejouer les Actions *en local*.
- Angle concret suggéré par Christophe : un workflow de code formatting / code quality (ex. Prettier,
  ESLint, Stylelint — déjà utilisés sur ce blog) exécuté et validé avec `act` avant de pousser.

### [ ] gitlab-ci-local — exécuter son pipeline GitLab CI en local avant de pousser

- Idée de Christophe (2026-08-27), pendant de l'idée `act` ci-dessus mais volontairement **séparée** :
  même problème ("push and pray") et même famille d'outils, mais deux publics différents (GitHub =
  grand public, GitLab CI = plutôt usage pro/entreprise) et deux syntaxes de config assez éloignées
  pour qu'un seul article mélangeant les deux devienne confus.
- Outil : [`gitlab-ci-local`](https://github.com/firecow/gitlab-ci-local) (firecow), actif et
  maintenu — `gitlab-runner exec`, l'équivalent officiel, est déprécié depuis GitLab Runner 16.0 sans
  vrai remplaçant natif à ce jour. Rejoue le `.gitlab-ci.yml` tel quel (stages, jobs, images Docker,
  variables) sans réécriture, contrairement à l'angle Dagger de `/blog/dagger-python`.
- Vérifié par grep : `gitlab-ci-local` n'apparaît nulle part sur le blog ni en draft — pas de doublon.
  Chevauchement partiel et assumé avec `/blog/dagger-python` (même objectif, mécanisme différent — à
  mentionner en intro comme pour `act`).
- **Demande explicite de Christophe : article riche en exemples concrets**, basé sur ses vrais
  `.gitlab-ci.yml` complexes utilisés au bureau pour du code quality — à couvrir large plutôt qu'un
  seul cas jouet :
  - formatting/lint génériques : shellcheck, shellfmt
  - PHP : php-cs-fixer, phpcbf — et surtout l'usage d'une image Docker externe toute faite comme
    [`jakzal/phpqa`](https://github.com/jakzal/phpqa) (déjà couverte pour son usage direct dans
    `/blog/php-jakzal-phpqa` — bridge naturel : même image, nouvel angle "rejouée par gitlab-ci-local
    avant de pousser")
  - Python : ruff, mypy (déjà couverts comme outils dans `/blog/python-qa` — même bridge)
  - Distinct de `/blog/git-precommit` (shellcheck/shellfmt y sont déjà mentionnés, mais côté hook
    pre-commit local, pas côté rejeu d'un pipeline CI complet) — à citer comme approche complémentaire,
    pas concurrente.

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

### [ ] n8n — automatisation self-hébergée déclenchée par évènement (webhooks/cron), pas juste du chat/CLI

- Vérifié par grep : aucune mention de `n8n` dans `blog/` ni `.unpublished/`. `zapier`/`make.com`/
  `automat` ne renvoient que des faux positifs sans rapport (composants Docusaurus, plugins, etc.).
  `bluesky` est le piège connu documenté dans la mémoire blog-map (footer de partage présent sur
  quasi tous les posts) — vérifié un par un, rien de pertinent en dehors des deux articles BlueSky
  déjà publiés. Pas de doublon.
- Angle différenciant vs l'existant : contrairement aux fonctions zsh `ai-*` (invocation manuelle en
  terminal, série "Ollama daily use") et aux skills Claude Code (`/freshness`, `/links`, `/refresh`,
  invocation à la demande), n8n est **déclenché par évènement** (cron, webhook, flux RSS) sans
  intervention humaine — Docker-first (image officielle, s'intègre dans la stack existante
  Ollama/AnythingLLM sur le host), et orchestre plusieurs API à la fois via une interface node-based
  plutôt qu'un seul script ciblé.
- Exemples concrets à forte valeur ajoutée, tous vérifiés comme non couverts :
  1. **Nouveau post → annonce BlueSky automatique** : n8n surveille le flux RSS du blog et poste
     l'annonce via l'API AT Protocol dès qu'un nouveau post apparaît — referme la boucle entre les
     deux articles BlueSky déjà publiés (`docusaurus-bluesky-share`, `docusaurus-bluesky-comments`,
     partage côté lecteur) et le geste manuel actuel de l'auteur (annoncer soi-même), juste après la
     révision de la série (commits `942ee940`/`a3fcc2c3`).
  2. **Digest quotidien de la stack Docker maison** : interroge l'API Docker et les endpoints
     Ollama/AnythingLLM sur le host, envoie un résumé (santé conteneurs, modèles chargés, espace
     disque) — complément naturel du trio lazydocker/Portainer/Traefik déjà en draft (dashboards
     qu'on consulte) en ajoutant "les choses qui préviennent toutes seules".
  3. **Agrégateur d'échecs CI** : reçoit les webhooks GitHub Actions et GitLab CI et les normalise
     vers un seul canal de notification — pont entre les deux écosystèmes actuellement traités par
     des articles séparés et encore à l'état de proposition (`act`, `gitlab-ci-local`).
  4. **Contrôle planifié des liens externes** : cron + noeud HTTP Request sur les URLs externes des
     posts publiés, alerte en cas de 404/timeout — couche infra légère et sans LLM, à présenter
     explicitement comme complémentaire (pas un doublon) du skill `/freshness`, qui fait une revue
     qualitative pilotée par Claude plutôt qu'un contrôle mécanique planifié.
- Bridge naturel avec le plus gros cluster du blog (Docker) et avec la série BlueSky révisée ce jour.

### [ ] Redis — cache d'une vraie API rate-limitée (GitHub, compte cavo789), avec une image Docker ready-to-use

- Idée de Christophe (2026-08-28, affinée le même jour). Vérifié par grep — aucun article dédié à
  Redis, toutes les mentions existantes sont de passage (Redis vu dans l'UI de
  `/blog/laravel-telescope`, cité comme exemple générique dans `/blog/docker-health-condition`,
  service `redis` du vote-app dans `/blog/docker-compose-viz`, cache d'une app générée par IA dans
  `/blog/lovable-dev-ai`) — aucun doublon direct.
- **Angle "why Docusaurus" écarté** : vérifié explicitement — le composant `Bluesky` appelle l'API
  BlueSky uniquement côté navigateur (`useEffect`/`fetch`, jamais pendant `yarn build`), et les
  scripts ELI5/questions (Ollama) ont déjà leur propre cache fichier (hash SHA1 par article,
  `scripts/lib/eli5-hash.mjs`) mieux adapté qu'un Redis externe pour un usage single-machine. Donc
  pas de cas d'usage Redis réel dans ce repo lui-même — l'article ne doit pas prétendre le contraire.
- **Cas réel retenu à la place** : l'API publique GitHub (`api.github.com`, non-authentifiée, quota
  60 req/h/IP) sur le propre compte de Christophe
  ([github.com/cavo789](https://github.com/cavo789)) — lister les dépôts (`GET /users/cavo789/repos`,
  ~85 repos vus au total, mélange public/private ; seuls les publics remontent sans authentification).
  Démo en deux temps : (1) sans cache — chaque exécution du script retape le quota GitHub et prend le
  même temps ; (2) avec Redis — premier appel identique, appels suivants servis depuis le cache en
  quelques ms, quota GitHub épargné. Chronométrage réel (`time`) sur un compte et des données
  authentiques, pas une donnée jouet.
- Toujours porté par une image Docker `redis` officielle ready-to-use (`docker compose`), avec le
  même scénario rejoué en Bash (`redis-cli` + `curl`), Python (`redis-py` + `requests`) et PHP
  (`predis`/`phpredis` + cURL) pour montrer l'interopérabilité multi-langage du cache.
- Pistes pour l'effet "wow", à garder :
  - `redis-cli MONITOR` en direct dans un second terminal pendant les scripts, pour voir les
    commandes `GET`/`SET`/`EXPIRE` arriver en temps réel.
  - TTL court démontré (ex. 60 s, cohérent avec le quota horaire GitHub) : le cache expire, l'appel
    redevient lent, preuve que ce n'est pas un `SET` définitif.
  - Bonus rate-limiting : un compteur `INCR`+`EXPIRE` pour suivre/illustrer le quota GitHub restant
    en direct, deuxième cas d'usage classique de Redis au-delà du cache pur.
- Bridge naturel avec le cluster Docker (21 articles) et avec `/blog/docker-compose-viz` (qui montre
  déjà un service `redis` sans jamais expliquer ce qu'il fait réellement).

### [ ] Dozzle — visualiser les logs de ses conteneurs Docker en temps réel

- Vérifié par grep : aucune mention de `dozzle` dans `blog/` ni `.unpublished/`. Les articles Docker
  existants mentionnent `docker logs` en passant (ex. `/blog/docker-python`) mais aucun n'est dédié
  à un outil de visualisation de logs — pas de doublon.
- Chevauchement partiel assumé avec les drafts lazydocker et Portainer (tous deux peuvent afficher
  des logs) : l'angle différenciant de Dozzle est son **mono-focus** — rien que les logs, en temps
  réel, via une interface web ultra-légère lancée en un `docker run`. Zéro persistance de données,
  zéro configuration requise pour démarrer. À mentionner explicitement pour éviter l'impression de
  couvrir le même terrain que les deux autres drafts.
- Contenus à couvrir : lancer Dozzle via `docker run` puis via `docker compose` (service annexe) ;
  filtrage par conteneur et recherche full-text dans le flux live ; support multi-host (agent mode) ;
  démonstration concrète du cas "je veux juste voir ce que crache mon conteneur, sans ouvrir
  Portainer ni taper `docker logs -f` en boucle" — l'outil idéal pour le développeur qui veut un
  second écran dédié aux logs pendant qu'il code.
- Bridge naturel avec le cluster Docker du blog (21 articles publiés) et avec les drafts Portainer
  et lazydocker : les trois forment un trio "observer sa stack Docker" — Dozzle (logs seuls, web),
  lazydocker (TUI tout-en-un), Portainer (dashboard complet). À positionner clairement dans l'intro.
