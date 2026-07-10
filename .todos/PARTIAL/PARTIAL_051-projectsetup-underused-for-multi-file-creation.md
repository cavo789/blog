# 051 — `ProjectSetup` non rétrofité sur 3 articles qui créent plusieurs fichiers

**Priority:** Low

## Problème

`<ProjectSetup>` existe pour envelopper une série de `<Snippet>`/`<Guideline>` dans une boîte
pliable avec script d'installation en un clic + téléchargement ZIP. L'article
`blog/2025/12/15/running-revealjs-with-docker/index.md` (lignes ~57-63) l'utilise correctement.
Mais trois articles antérieurs enchaînent des `<Snippet>` bruts, sans wrapper, pour le même genre
de séquence "créez ces N fichiers" :

- `blog/2025/10/13/docker-prod-devcontainer/index.md` — deux lots distincts : fichiers de
  production (`.env`, `Dockerfile`, `compose.yaml`, `requirements.txt`, `src/main.py`) et fichiers
  devcontainer (5 fichiers supplémentaires dans `.devcontainer/`)
- `blog/2025/11/03/quarto-devcontainer/index.md` (lignes ~65-69) — 3 `Snippet` consécutifs
  (`compose.yaml`, `Dockerfile`, `devcontainer.json`) après "We'll need to create three files."
- `blog/2025/11/11/running-docusaurus-using-docker/index.md` (lignes ~80-90 et ~150-164) — deux
  lots de 6-7 `Snippet` consécutifs (fichiers racine puis `.devcontainer/`)

Le composant a manifestement été adopté en cours de route (décembre) mais jamais rétrofité sur ces
trois articles antérieurs.

## Risque

Incohérence visuelle : le lecteur d'un article d'octobre/novembre n'a pas la boîte pliable + le
bouton "installer en un clic" / ZIP que le lecteur de décembre obtient pour un besoin identique.
Perte d'une fonctionnalité utile (installation en un clic) sur les articles les plus longs
(`docker-prod-devcontainer` a deux lots de 5+ fichiers chacun).

## Solution proposée

Envelopper chaque séquence "créez ces fichiers" dans `<ProjectSetup folderName="..."
createFolder={true}>...</ProjectSetup>`, avec le `folderName` correspondant au dossier de travail
déjà utilisé dans les commandes `<Terminal>` juste au-dessus. Pour `docker-prod-devcontainer` et
`running-docusaurus-using-docker`, prévoir deux `ProjectSetup` distincts (un pour les fichiers
racine, un pour `.devcontainer/`).

## Lien avec l'existant

Aucun TODO existant. Trouvé lors du même audit `blog/2025` que [[049]] et [[050]].

## Status — PARTIAL (2026-07-10)

### Done

* `blog/2025/11/03/quarto-devcontainer/index.md` (lignes ~65-69) — les 3 `Snippet` consécutifs
  (`compose.yaml`, `Dockerfile`, `devcontainer.json`) enveloppés dans un seul
  `<ProjectSetup folderName="/tmp/quarto-examples/brand/brand-simple">`. Aucun contenu interstitiel
  entre les `Snippet`, retrofit sûr et identique au pattern de référence.
* `blog/2025/11/11/running-docusaurus-using-docker/index.md` — deux lots enveloppés dans
  `<ProjectSetup folderName="/tmp/docux-blog">` : (1) les 6 fichiers racine
  (`compose.yaml`, `Dockerfile`, `localhost-key.pem`, `localhost.pem`, `makefile`, `nginx.conf`) ;
  (2) les 6 fichiers `.devcontainer/` (`.env`, `bootstrap.sh`, `bash_helpers.sh`, `compose.yaml`,
  `devcontainer.json`, `Dockerfile`). Le second lot contenait un `<AlertBox variant="danger">`
  ("Make sure to use your own UID/GID") intercalé juste après `.env` — déplacé **après** le
  `</ProjectSetup>` plutôt que supprimé, pour rester visible au lecteur (voir "Not done" ci-dessous
  pour l'explication de pourquoi il ne pouvait pas rester à l'intérieur).
* Vérifié : `markdownlint-cli2` passe sur les deux fichiers et `yarn build` compile sans erreur
  MDX ; le HTML généré contient bien 1 boîte "Project setup:" sur `quarto-devcontainer` et 2 sur
  `running-docusaurus-with-docker`.

### Not done

* `blog/2025/10/13/docker-prod-devcontainer/index.md` (les deux lots, fichiers racine et
  `.devcontainer/`) — **non enveloppé**.
  **Reason:** contrairement aux deux autres articles, chaque `Snippet` y est entrecoupé de
  paragraphes explicatifs uniques, de `<StepsCard>` et de plusieurs `<AlertBox>` propres à ce
  fichier précis (voir lignes ~79-153 et ~235-330). Le composant `ProjectSetup`
  (`src/components/ProjectSetup/index.js`) ne fait remonter dans son rendu que les enfants
  `Snippet`/`Guideline`/`EmptyFolder` : tout autre nœud passé en enfant (paragraphe, `AlertBox`,
  `StepsCard`) est parcouru pour y chercher des `Snippet` imbriqués mais n'est **jamais
  lui-même réaffiché** — l'envelopper aurait donc supprimé silencieusement ce contenu pédagogique
  du rendu final. Découper en une multitude de `ProjectSetup` à un seul fichier chacun éviterait la
  perte de contenu mais casserait le rythme narratif de l'article (StepsCard puis AlertBox après
  chaque fichier) pour un bénéfice ~nul (pas de vrai "lot" de fichiers à scripter/zipper). Solution
  correcte hors scope de ce TODO low-priority : réorganiser l'article pour séparer la présentation
  des fichiers de leurs explications approfondies, ou accepter des boîtes à un seul fichier.
  Nécessiterait une décision éditoriale explicite avant d'y toucher.
