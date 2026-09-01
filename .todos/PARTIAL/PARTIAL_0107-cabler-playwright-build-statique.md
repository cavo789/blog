# 0107 — Câbler Playwright : tests smoke / hydratation sur le build statique

- **Priority**: Medium
- **Batch**: playwright-e2e
- **Depends**: —
- **Files**: `.devcontainer/scripts/interactive.sh`, `playwright.config.ts` (à créer), `tests/e2e/` (à créer), `.config/e2e-routes.txt` (à créer), `package.json`, `.github/workflows/quality.yml`

## Problème

`playwright` est une devDependency depuis le commit `2c06ffdd`, mais rien ne l'utilise :
aucun `playwright.config`, aucun test, aucun job CI. Le paquet est donc du poids mort.

Conséquence réelle : **il n'existe aucun filet runtime**. `tsc --noEmit` valide les types,
`yarn build` attrape les erreurs de compilation MDX et les liens internes morts — mais un
composant peut compiler proprement et casser au rendu :

- mismatch d'hydratation React (SSG produit un HTML que le client réécrit) — c'est déjà
  arrivé, voir `.todos/DONE/DONE_057-iconify-hydration-mismatch-logoicon.md` ;
- accès `window` / `document` / `localStorage` hors garde, sur une page que le build
  n'exerce jamais ;
- erreur JS console-only qui ne fait pas planter le build.

Atténuation actuelle : la discipline. Tous les accès DOM vérifiés (`Vars`, `Reaction`,
`ReadingProgress`, `OfflineNotice`, `theme/Root.js`) sont sous `useEffect` ou
`typeof window === "undefined"`. Mais rien ne l'impose et rien ne le vérifie.

## Solution

Un harnais Playwright minimal qui tourne **contre le build statique** (`yarn build` puis
`yarn serve`), pas contre le dev server — câblé comme une nouvelle brique de `run_ci`
(`.devcontainer/scripts/interactive.sh`), pas comme un script isolé : `run_ci` reproduit déjà en
local les jobs de `quality.yml`/`deploy.yml` (voir aussi TODO 0111, qui lui porte le sanity-check
de build de `deploy.yml` dans `run_ci build`) ; ce test Playwright en est une brique de plus.

1. `playwright.config.ts` — `webServer.command` lance `yarn serve` sur le `build/` déjà
   construit (pas de `yarn build` intégré au config : `run_ci` construit une seule fois et
   enchaîne), un seul projet Chromium. Le Chromium + deps sont déjà pré-installés dans l'image
   devcontainer (`Dockerfile`, stage `devcontainer` : `npx playwright install --with-deps
   chromium`) — rien à ajouter côté image pour un usage local.
2. `.config/e2e-routes.txt` — un chemin par ligne, commentaires `#` autorisés. Remplace le choix
   « en dur dans le test » de la version précédente de ce TODO : cohérent avec
   `.config/typos.toml`/`.config/.markdownlint.json`, et modifiable sans toucher au code du
   test. Contenu de départ : accueil (`/`), un article `.md` simple, un article `.mdx` riche en
   composants, une page tag, une page série, `/admin`.
3. Un test unique qui lit `.config/e2e-routes.txt` et **échoue** sur :
   - toute erreur console (`page.on("console")` / `page.on("pageerror")`) ;
   - tout warning d'hydratation React (`Warning: Text content did not match`,
     `Hydration failed`, `did not expect server HTML to contain`).
4. `package.json` — script `test:e2e` (`playwright test`), pas de `yarn build` dedans (voir
   point 1).
5. Nouvelle sous-commande `run_ci e2e` dans `interactive.sh` :
   - ajoutée à la liste fzf et au chaînage `run_ci all` (case `all`), **après** `build` —
     `run_ci all` construit une seule fois et le step `e2e` réutilise ce même `build/` ; un
     garde-fou explicite (`[[ -d build ]] || { …message clair…; return 1; }`) plutôt qu'un
     rebuild silencieux si `run_ci e2e` est appelé seul sans `build/` existant.
   - étend le menu fzf existant (`hooks`, `lint`, `format`, `links`, `build`, `all`) avec `e2e`.
6. Job CI dans `quality.yml`, **informatif d'abord** (`continue-on-error` au niveau du step,
   comme le job `internal-links`) : `yarn build && yarn test:e2e` — le **même** script
   `package.json` que `run_ci e2e` invoque en local, donc parité garantie par construction (pas
   juste « ça devrait donner le même résultat ») : on observe la stabilité quelques semaines
   avant de le rendre bloquant.

### Points à trancher pendant l'implémentation

- **Coût CI.** `quality.yml` fait déjà un `yarn install` de 2,6 Go. Ajouter un `yarn build`
  (~60 s) + le download Chromium (`npx playwright install --with-deps chromium`, pas
  pré-installé sur le runner GitHub nu, contrairement à l'image devcontainer). À mesurer ;
  envisager de réutiliser le `build/` d'un job existant via `actions/upload-artifact` plutôt que
  de rebuilder.
- **Docker-first.** Idéalement le test tourne dans l'image `blog-docusaurus:development`
  plutôt que sur le runner nu — cohérent avec le reste du repo, et évite le download Chromium
  en CI (déjà dans l'image). À arbitrer contre la complexité ajoutée (docker-outside-of-docker
  ou équivalent dans le workflow) ; rester sur le runner nu pour cette première itération est
  acceptable (le TODO reste informatif, pas bloquant).
- **Faux positifs d'hydratation** connus et documentés (voir commentaire dans
  `src/components/Reaction/index.tsx` et la règle `react-hooks/set-state-in-effect` passée
  en `warn`) : prévoir une allowlist de messages tolérés, sinon le job sera rouge en
  permanence.

## Risque

Faible. Le pire cas est un job CI bruyant qu'on finit par ignorer — d'où le démarrage en
mode informatif et l'allowlist. Ne pas sur-investir : le but est d'attraper la régression
d'hydratation grossière, pas de couvrir chaque page.

## Acceptance

- `run_ci e2e` (menu fzf ou en argument direct) lance Playwright contre le `build/` servi
  localement et passe au vert sur l'état actuel du site ; `run_ci all` l'enchaîne après `build`
  sans reconstruire une seconde fois.
- Le test échoue si on réintroduit volontairement un `localStorage.getItem(...)` au niveau
  du rendu d'un composant monté sur une page testée.
- Un job CI exécute `yarn build && yarn test:e2e` sur chaque push/PR, en mode informatif (step
  `continue-on-error`), findings visibles en annotations — le même script `package.json` que
  `run_ci e2e`, pas une commande dupliquée.
- `playwright` n'est plus une dépendance orpheline : `grep -rn playwright` renvoie la config
  et au moins un test.
- `.config/e2e-routes.txt` liste au moins les 6 catégories de route citées dans la Solution
  (accueil, `.md`, `.mdx` riche, tag, série, `/admin`).

## Status — PARTIAL (2026-08-31)

### Done

- `playwright.config.ts` créé — `webServer.command: yarn serve --port 3002` (port dédié, ni 3000
  ni 3001, voir commentaire dans le fichier), pas de `yarn build` intégré.
- `.config/e2e-routes.txt` créé avec les 6 routes prévues (`/`, `/blog/docker-volumes`,
  `/blog/docusaurus-cards`, `/blog/tags/docker`, `/series/discovering-docusaurus`, `/admin`).
- `tests/e2e/smoke.spec.ts` créé — lit `.config/e2e-routes.txt`, échoue sur tout
  `console.error`/`pageerror`, avec un allowlist scopé aux 3 endpoints `${siteConfig.url}/api/*.php`
  (Reaction/TriedIt/TypoReport, CORS attendu en local, pas un vrai bug — voir commentaire dans le
  test).
- `package.json` : script `test:e2e`. `tsconfig.json` : `playwright.config.ts` et `tests/**/*`
  ajoutés à `include` (couverts par `yarn lint:types`).
- `run_ci e2e` câblé dans `.devcontainer/scripts/interactive.sh` — menu fzf, chaîné dans
  `run_ci all` après `build`, garde-fou explicite si `build/` est absent.
- Job `e2e` ajouté à `.github/workflows/quality.yml`, informatif (`continue-on-error` au niveau du
  step), exécute exactement `yarn test:e2e` — même script que `run_ci e2e`.
- `.gitignore` : `test-results/`, `playwright-report/`, `blob-report/` ajoutés.
- Vérifié : `yarn lint` (js/css/types/snippets), `yarn format:check` passent. `run_ci e2e` tourne
  réellement contre un build frais et échoue/réussit comme attendu (4/6 routes vertes).

### Not done

- Acceptance "passe au vert sur l'état actuel du site" — pas atteint : `/blog/docker-volumes` et
  `/blog/docusaurus-cards` échouent avec un vrai mismatch d'hydratation React (#418) dans
  `Eli5CodeBlock` (`src/components/Snippet/index.tsx`), découvert par ce harnais lui-même — pas
  un faux positif, pas un défaut du test.
  **Reason:** bug préexistant, distinct de la portée de ce TODO (câbler Playwright, pas auditer
  chaque composant). Documenté en détail avec cause probable et pistes de correctif dans
  **TODO 0112** — une fois corrigé, cette suite devrait passer au vert sans aucun changement ici.
- Job CI `quality.yml` non observé en conditions réelles (pas de push/PR déclenché depuis cette
  session) — le step est `continue-on-error`, donc sans risque, mais le coût réel (install
  Chromium + build sur le runner nu) n'a pas été mesuré en CI, seulement en local (déjà
  pré-installé dans l'image devcontainer).
  **Reason:** nécessite un vrai push/PR pour observer le comportement GitHub Actions ; hors de
  portée d'une session locale.
- "Docker-first" (faire tourner le test dans l'image `blog-docusaurus:development` plutôt que sur
  le runner nu) — resté au statut "à trancher", non implémenté, comme accepté dans la section
  Points à trancher de ce TODO.
  **Reason:** complexité jugée non justifiée pour cette première itération (le job reste
  informatif).
