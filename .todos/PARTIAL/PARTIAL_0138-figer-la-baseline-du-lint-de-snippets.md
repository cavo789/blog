# 0138 — Figer la baseline du lint de snippets, puis brancher la CI

- **Priority**: Medium — l'outil existe et tourne ; sans baseline verte il ne protège encore rien
- **Batch**: snippet-lint
- **Depends**: 0132
- **Files**: `.snippet-lint.json`, `.github/workflows/quality.yml`, `scripts/lint-snippets.mjs`

## Problème

Le 0132 a livré la passe 1 (`yarn snippets:lint`). Son premier run de référence rapporte encore :

- **6 erreurs**, toutes réelles et vérifiées une par une ;
- **330 warnings**, non triés.

Tant que ces deux chiffres ne sont pas descendus à un état assumé, le branchement CI est
impossible : `quality.yml` échouerait dès le premier push. Le 0132 le disait déjà — *« brancher sur
CI seulement après que la baseline soit verte »*.

## Les 6 erreurs — vérifiées, non corrigées, et pourquoi

Chacune casse chez le lecteur qui copie le fichier :

| Fichier | Défaut |
| --- | --- |
| `blog/2024/04/07/php-jakzal-phpqa/files/composer.json` | virgule traînante — `composer` refuse |
| `blog/2024/04/07/php-jakzal-phpqa/files/composer.part2.json` | idem |
| `blog/2025/04/04/docker-oracle-database-server/files/config.json` | virgule traînante — le parseur Go de Docker refuse |
| `blog/2024/04/13/quarto-callout/files/markdown.json` | virgule traînante (tolérée par VS Code, gratuite à retirer) |
| `blog/2024/04/28/docker-docusaurus-prod/files/Dockerfile:31` | `COPY package.json yarn.lock .` — plusieurs sources exigent une destination finissant par `/` |
| `blog/2024/04/28/docker-docusaurus-prod/files/Dockerfile.part3:13` | idem |

**Elles n'ont délibérément pas été corrigées par le 0132**, pour une raison qui doit être tranchée
ici et non en passant : ces 6 fichiers portent **12 sidecars ELI5** (EN + FR). Les modifier périme
les 12 hashes, alors que retirer une virgule ne change rien au sens du snippet. Deux issues
possibles, au choix de l'auteur :

- régénérer les ELI5 (coût API réel, pour un contenu inchangé) ;
- corriger le fichier **et** réécrire le hash du sidecar sans appel API, puisque le texte ELI5
  reste exact.

La seconde est la bonne si et seulement si on accepte d'écrire un hash à la main — ce que le dépôt
n'a jamais fait ailleurs. À décider explicitement.

## Les 330 warnings — une décision de politique, pas de code

La répartition après retrait des règles de présentation yamllint :

| Code | Nb | Nature |
| --- | --- | --- |
| `DL3008` | 59 | épingler les versions dans `apt-get install` |
| `DL3015` | 36 | `--no-install-recommends` absent |
| `DL3064` | 31 | — |
| `DL3059` | 24 | `RUN` consécutifs à fusionner |
| `SC2028` | 23 | `echo` et séquences d'échappement |
| `DL3066`, `DL4006`, `DL3013`, `DL3007`, `DL3018`, `DL3003`, `DL3046` | ~70 | bonnes pratiques Dockerfile |
| `SC2016`, `SC2004`, `SC2164`, … | ~60 | shell |

Le conflit à arbitrer : ces règles sont pour la plupart **celles que le skill
`dockerfile-best-practices` du dépôt tient pour MUST/SHOULD**. Les taire par configuration
contredirait la gouvernance du projet ; les corriger toutes touche ~40 Dockerfiles publiés (et
autant de sidecars ELI5, voir ci-dessus). Un Dockerfile d'article est pédagogique : épingler chaque
version apt le rendrait illisible, ce qui est précisément pourquoi l'auteur ne l'a pas fait.

Trois politiques possibles, à choisir explicitement plutôt que par défaut :

1. les warnings restent visibles et non bloquants — la CI ne coupe que sur `error` (état actuel) ;
2. un sous-ensemble assumé passe en silencieux, documenté code par code dans `lint-snippets.mjs` ;
3. la correction de fond, article par article, étalée — un TODO de contenu séparé.

## Critère d'acceptation

1. Les 6 erreurs sont soit corrigées (avec le sort des sidecars ELI5 tranché), soit `excluded` avec
   une raison écrite.
2. La politique de warnings est choisie et écrite dans l'en-tête de `scripts/lint-snippets.mjs`.
3. `yarn snippets:lint --ci` sort en 0 sur un arbre propre.
4. `quality.yml` lance `yarn snippets:lint --ci` — **après** que 3 soit vrai, jamais avant.
5. `.unpublished/**` reste hors du gate CI et dans le run manuel (`--ci` le fait déjà).

## Status — PARTIAL (2026-09-25)

Décisions prises par l'auteur au lancement du `/todo` : **corriger les 6 erreurs et régénérer les
12 sidecars ELI5** (≈ 0,12 $), et pour les warnings **« corriger maintenant, bloquant »**.

### Done

- **Critère 1 — les 6 erreurs sont corrigées.** Six éditions d'une seule ligne, sans changement de
  numérotation : virgule traînante retirée dans `composer.json`, `composer.part2.json`,
  `config.json`, `markdown.json` ; `COPY package.json yarn.lock .` → `./` dans `Dockerfile:31` et
  `Dockerfile.part3:13`. Les quatre JSON parsent désormais (`JSON.parse` vérifié un par un).
- **Les 12 sidecars ELI5 sont régénérés** (6 EN + 6 FR, `generate-eli5.mjs --force [--locale fr]`).
  Les 12 `sourceHash` correspondent au nouveau contenu, et aucune ancre `explanations` ne dépasse
  le nombre de lignes du fichier. `yarn eli5:check` : 1694 fresh, les 2 stale restants
  (`.claude/commands/links.md`, `src/components/Bluesky/comments.tsx`) préexistent et n'ont rien à
  voir avec ce TODO.
- **Trois explications ELI5 étaient périmées ou fausses, ce que le TODO n'avait pas vu.** Le TODO
  supposait que retirer une virgule ne change rien au sens et que seuls les hashes seraient à
  refaire. C'était vrai pour 9 sidecars sur 12, pas pour 3 :
  - `composer.json.eli5.fr.json` L6 affirmait *« Cette virgule finale est une convention valide en
    JSON (dans les versions récentes) »* — **factuellement faux, et déjà publié**.
  - `composer.part2.json.eli5.json` L6 signalait correctement la virgule comme invalide, donc
    décrivait après correction quelque chose qui n'existe plus.
  - `Dockerfile.part3.eli5.fr.json` L13 citait `COPY package.json yarn.lock .` mot pour mot.

  La régénération a réparé les trois. C'est l'argument décisif en faveur de l'option retenue :
  l'option « réécrire le hash à la main » aurait conservé l'affirmation fausse en français.
- **Critère 2 — la politique de warnings est écrite dans l'en-tête de `scripts/lint-snippets.mjs`**,
  sous une section `## Warning policy (TODO 0138)`, avec le partage des 276 warnings publiés en
  trois populations chiffrées (156 / 78 / 42 = 276) et la raison technique de chaque refus.
- **Critère 3 — `yarn snippets:lint --ci` sort en 0** sur un arbre propre : *0 error(s), 276
  warning(s)*. Vérifié aussi en négatif : la virgule réintroduite volontairement dans
  `composer.json` fait sortir le script en **1** avec l'erreur nommée, puis la correction remise
  le ramène à 0 — le gate mord réellement, ce n'est pas un exit code de complaisance.
- **Critère 4 — `quality.yml` lance `yarn snippets:lint --ci`**, dans un job `snippet-lint`
  **bloquant** (pas de `continue-on-error`, contrairement à `internal-links` et `e2e`), ajouté
  après que le critère 3 soit vrai. YAML validé, pass-through de `--ci` par yarn v1 vérifié.
  Le job fait `yarn install` : le script n'a pas de dépendance propre mais résout les
  `<Snippet source>` via `plugins/remark-snippet-loader`, qui requiert `unist-util-visit`.
- **Critère 5 — `.unpublished/**` reste hors du gate.** Mesuré, pas lu : périmètre `--ci` = 977
  fichiers contre 1098 en run nu, et zéro chemin `.unpublished` dans la sortie `--ci`.

### Not done

- **La correction des 156 warnings fixables, et le durcissement du gate qui en dépend.**
  **Reason:** périmètre réel mesuré après décision — **156 warnings, 62 fichiers, 51 articles
  publiés**, dont 39 corrections qui déplacent des lignes et périment les ancres ELI5 des deux
  locales. C'est un chantier de contenu multi-sessions, pas un `/todo` : le faire à moitié
  laisserait 30 articles modifiés sans relecture de prose, ce qui est pire que de ne pas
  commencer. Suivi dans **`.todos/0139`**, avec l'énumération reproductible, les trois pièges
  (hash global, ancres décalées, prose qui cite le code) et une méthode par lots.

  Deux sous-populations que le choix « corriger maintenant » ne peut pas couvrir, et qui sont
  donc closes plutôt que reportées — la mesure faite ici les a montrées non actionnables :
  - **78 warnings d'épinglage de versions** (`DL3008` 48, `DL3007` 12, `DL3013` 9, `DL3018` 9).
    Les corriger dégrade l'article : un `apt-get install pkg=1.2.3` épinglé disparaît du miroir
    Debian en quelques mois et le build du lecteur casse alors sur `Version '1.2.3' for 'pkg' was
    not found`. Le TODO le disait déjà en passant ; c'est désormais écrit dans l'en-tête du script.
  - **42 faux positifs** : `DL3064` (31) se déclenche sur `ARG OS_USERNAME=quarto` /
    `ARG USERNAME=johndoe` — l'heuristique de nom de hadolint, aucun secret en jeu ; `DL3066` (11)
    sur `USER node` / `USER www-data` / `USER root`, où un UID numérique masquerait la ligne même
    que l'article explique. Aucune correction n'existe.

### À faire avant de pousser

`.snippet-lint.json` doit être **committé** : c'est la baseline que le job CI relit. Sur un push
qui ne touche aucun snippet, rien n'est linté et le job réaffiche les verdicts stockés en moins
d'une seconde ; sans ce fichier, la CI relance les ~400 linters en conteneur à chaque run.
