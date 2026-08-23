# 0104 — Vars : retrofit des articles Docker restants (port + nom de conteneur)

- **Priority**: Medium
- **Batch**: blog-commands
- **Depends**: —
- **Files**: `blog/2023/12/22/docker-joomla/index.mdx`, `blog/2023/12/28/docker-wordpress/index.md`,
  `blog/2024/02/01/docker-limesurvey/index.md`,
  `blog/2023/12/27/docker-adminer-pgadmin-phpmyadmin/index.md`,
  `blog/2023/12/27/makefile-using-make/index.md`, `blog/2024/09/05/docker-gui-in-browser/index.md`,
  `blog/2024/10/18/docker-joomla-part-2/index.mdx`,
  `blog/2025/04/04/docker-oracle-database-server/index.md`, `blog/2026/03/30/ollama-installation/index.md`,
  `blog/2023/11/03/docker-volume/index.md`, `blog/2023/11/03/install-docker/index.md`,
  `blog/2023/11/22/docker-volumes/index.md`, `blog/2024/06/08/docker-compose-viz/index.md`,
  `blog/2024/10/18/docker-joomla-restore-jpa/index.mdx`, `blog/2025/04/11/docker-oracle-ords/index.md`,
  `blog/2023/11/03/site-creation/index.md`, `blog/2025/02/01/heimdall-dashboard/index.md`,
  `blog/2025/11/11/running-docusaurus-using-docker/index.md`, `blog/2026/05/11/belgif-api-linter/index.md`,
  `blog/2023/11/21/frankenphp/index.md`, `blog/2023/12/22/docker-php-ini/index.md`,
  `blog/2024/06/24/behat-introduction/index.md`, `blog/2025/01/05/docker-init-php-apache/index.md`,
  `blog/2025/02/09/python-fastapi/index.md`, `blog/2025/06/20/pentaho-discovery/index.md`,
  `blog/2025/08/30/pest-functional-testing/index.md` (26 articles, chacun avec son `files/` — voir le
  tableau « Lot principal » pour le détail port/nom par article)

## Contexte

Suite de [[0088]] : le composant `<Vars>` existe et est validé de bout en bout sur l'article
pilote `docker-localhost-ssl` (voir `.todos/PARTIAL/PARTIAL_0088-parameterized-commands.md`).
Reste le retrofit des autres articles.

## Le chiffre a été revérifié deux fois — corrigé à nouveau, à la hausse

0088 avançait « 21 articles ». Une première revérification (en clôturant 0088) donnait 24 — mais
son grep ne cherchait que la syntaxe `docker run -p/--name` et **uniquement dans les fichiers
`.md`**. L'utilisateur a signalé que ses articles Joomla (`.mdx`) manquaient à l'appel — grep
relancé sur l'ensemble du corpus (`.md` **et** `.mdx`, 248 articles), avec en plus la syntaxe
`docker compose` (`ports:` en YAML, `container_name:`) que le premier grep ratait entièrement
puisque beaucoup d'articles utilisent `compose.yaml` plutôt que des flags `docker run` :

**48 articles distincts** ont un port et/ou un nom substituable quelque part dans un vrai bloc
`<Terminal>`/`<Snippet>` (y compris les fichiers `files/*` chargés via `source=`) :

- **1 déjà fait** — `docker-localhost-ssl` (pilote de 0088).
- **26 candidats forts** — au moins une des deux valeurs (port ou nom) **revient 2 fois ou plus**
  dans un bloc `<Terminal>`/`<Snippet>` réel. C'est le lot principal de ce todo.
- **21 candidats faibles** — port et nom n'apparaissent chacun qu'**une seule fois** : rien à
  garder synchronisé, le bénéfice de `<Vars>` est marginal. Lot optionnel, listé en bas.

Aucun brouillon `.unpublished/` ne contient de pattern port/nom (revérifié, `.md` et `.mdx`).

## Lot principal — 26 articles (candidats forts)

| Article | Port× | Nom× | Note |
| --- | --- | --- | --- |
| `docker-joomla` | 6 | 8 | conteneurs `kingsbridge-app`/`kingsbridge-db`, ports 8080/8081 |
| `docker-wordpress` | 3 | 6 | 3 conteneurs (`db_wordpress`, `app_wordpress`, `phpmyadmin`) — plusieurs variables, pas une seule paire |
| `docker-limesurvey` | 3 | 6 | conteneurs `limesurvey-app`/`limesurvey-db` |
| `docker-adminer-pgadmin-phpmyadmin` | 4 | 4 | déjà cité comme candidat par 0088 |
| `makefile-using-make` | 3 | 3 | valeurs dans `files/makefile` **et** `files/terminal-1.txt` — garder cohérent |
| `docker-gui-in-browser` | 4 | 2 | ⚠️ port `3000`/`3001` identique dans les deux exemples (bon candidat), mais `--name=firefox` / `--name=gimp` sont **deux conteneurs différents par construction** — ne pas fusionner en une seule variable `name` |
| `docker-joomla-part-2` | 0 | 6 | ⚠️ utilise déjà `container_name: ${CONTAINER_PREFIX:-joomla}-app` — une des « tentatives artisanales » que 0088 citait comme preuve du besoin ; décider si `<Vars>` remplace ce mécanisme ou coexiste avec lui |
| `docker-oracle-database-server` | 4 | 2 | déjà cité par 0088 ; commande principale dans `files/terminal-1.txt` |
| `ollama-installation` | 3 | 3 | conteneurs `ollama`/`open-webui` |
| `docker-volume` | 2 | 2 | |
| `install-docker` | 2 | 2 | ⚠️ `step_1_1a`/port 80 et `step_1_1b`/port 801 sont **deux instances volontairement différentes** (PHP 8.3 vs 8.4 en parallèle) — deux jeux de variables, pas une substitution naïve |
| `docker-volumes` *(pluriel — différent de `docker-volume`)* | 0 | 4 | `container_name: counter` répété dans 4 variantes de `compose.yaml` |
| `docker-compose-viz` | 4 | 0 | |
| `docker-joomla-restore-jpa` | 1 | 3 | même `${CONTAINER_PREFIX:-joomla}` que `docker-joomla-part-2` — cohérence entre les deux articles à vérifier si l'un est retrofité |
| `docker-oracle-ords` | 2 | 2 | |
| `site-creation` | 1 | 2 | |
| `heimdall-dashboard` | 2 | 1 | |
| `running-docusaurus-using-docker` | 1 | 2 | déjà cité par 0088 |
| `belgif-api-linter` | 3 | 0 | 3 variantes de `compose*.yaml` |
| `frankenphp` | 2 | 0 | |
| `docker-php-ini` | 2 | 0 | |
| `behat-introduction` | 0 | 2 | |
| `docker-init-php-apache` | 2 | 0 | |
| `python-fastapi` | 2 | 0 | |
| `pentaho-discovery` | 2 | 0 | 2 services, chacun son bloc `ports:` |
| `pest-functional-testing` | 0 | 2 | |

## Lot optionnel — 21 articles (candidats faibles, une seule occurrence de chaque valeur)

`docker_uptime_kuma`, `docker-quarto`, `docker-mssql-server`, `docker-postgrest`,
`vscode-code-server`, `docker-memos`, `docker-name-property` (⚠️ cet article explique justement
la propriété `name:` de Compose — exemple à choisir avec soin pour ne pas créer de confusion avec
le sujet de l'article), `docker-prod-devcontainer`, `vscode-remote-ssh`,
`anythingllm-chat-with-your-docs`, `docker-init`, `docusaurus-docker`, `docusaurus-articles-tips`,
`vscode-devcontainer`, `docker-docusaurus-prod`, `makefile_tips`, `docker-python`,
`docker-python-devcontainer-windows`, `docker-karakeep`, `bruno`, `quarto-industrialisation`.

Trancher au début de l'implémentation : les inclure si le coût marginal est faible (l'auteur est
déjà dans l'article), ou les reporter — dans ce cas, le dire explicitement dans le statut de
clôture plutôt que de les oublier silencieusement.

## Hors périmètre (aucun signal trouvé)

Les 200 articles restants ne contiennent ni motif de port ni nom de conteneur substituable dans
un bloc `<Terminal>`/`<Snippet>` (vérifié sur l'ensemble du corpus `.md`+`.mdx`, y compris les
fichiers `files/*`). Quelques articles avaient un motif **en prose seulement** (jamais dans un
`<Terminal>`/`<Snippet>`) lors de la première revérification (ex. `docker-inspect`,
`docker-html-site`, `drawdb-app`) — non rétrofitables sans restructurer l'article pour y
introduire un vrai bloc `<Terminal>`, hors périmètre par design (voir `AGENTS.md` : le texte en
prose n'est jamais scanné).

## Méthode par lot

Ne pas tout faire d'un coup : un article à la fois (ou 2-3 par session), `yarn start` pour valider
visuellement chaque retrofit avant de passer au suivant — c'est la même discipline que 0088 a
suivie pour le pilote, et qui a permis d'attraper deux vrais bugs (marqueur `{{}}` invalide en
MDX, puis `:` cassant `remark-directive`) qu'une simple relecture de code n'aurait pas vus.

Pour chaque article :

1. Repérer les occurrences réellement dans un bloc `<Terminal>`/`<Snippet>` — CLI (`-p N:N`,
   `--name X`) ou Compose (`ports:` en YAML, `container_name:`) — y compris dans les fichiers
   `files/*` chargés via `source=`. Ne pas retoucher les mentions en prose, hors périmètre par
   design.
2. Ajouter `<Vars port="…" name="…" />` juste avant la première commande qui l'utilise.
3. Remplacer chaque occurrence par `%%port=…%%` / `%%name=…%%` (syntaxe `=`, jamais `:` — voir
   `src/components/Vars/substitute.js`).
4. `yarn start`, vérifier : valeurs par défaut identiques à l'article actuel, édition met à jour
   toutes les commandes, bouton copier renvoie la valeur résolue.
5. `yarn lint && yarn format:check` après chaque article ; `yarn build` en fin de lot (pas après
   chaque article — coûteux, voir le vécu de 0088 sur un dépôt partagé).

## Risque

Mêmes risques que 0088 (voir ce fichier), plus spécifiquement pour ce lot :

- **Confondre deux configurations parallèles avec une valeur répétée.** `install-docker` et
  `docker-gui-in-browser` montrent volontairement deux exemples différents côte à côte — une
  substitution naïve à une seule paire de variables romprait cette démonstration.
- **`${CONTAINER_PREFIX:-joomla}` déjà en place.** `docker-joomla-part-2` et
  `docker-joomla-restore-jpa` ont déjà un mécanisme de substitution artisanal (variable d'env
  Compose avec valeur par défaut) — c'est probablement l'une des « tentatives artisanales » citées
  par 0088 comme preuve du besoin. Décider explicitement : `<Vars>` remplace ce mécanisme, ou les
  deux coexistent (auquel cas expliquer pourquoi dans l'article).
- **Oublier un fichier `files/*` chargé via `source=`.** Plusieurs articles de ce lot ont leur
  commande principale dans `files/terminal-1.txt`/`files/makefile`/`files/compose*.yaml`, pas dans
  `index.md`/`index.mdx` — vérifier aussi ces fichiers.

## Acceptance

- [ ] Les 26 articles du lot principal sont rétrofités, chacun validé visuellement (`yarn start`)
- [ ] `install-docker` et `docker-gui-in-browser` gèrent correctement leurs deux configurations
      parallèles (deux jeux de variables, ou une seule variable partagée là où la valeur est
      réellement identique)
- [ ] `docker-joomla-part-2` et `docker-joomla-restore-jpa` : décision explicite sur
      `${CONTAINER_PREFIX:-joomla}` vs `<Vars>`, documentée dans le statut de clôture
- [ ] Le sort du lot optionnel (21 articles) est tranché et écrit dans le statut de clôture
- [ ] `yarn lint && yarn format:check && yarn build` passent
- [ ] Aucun avertissement « unknown component »/« unknown directive » au build ni à l'export
      markdown
