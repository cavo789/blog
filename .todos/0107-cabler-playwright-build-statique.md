# 0107 — Câbler Playwright : tests smoke / hydratation sur le build statique

- **Priority**: Medium
- **Batch**: unassigned
- **Depends**: —
- **Files**: `package.json`, `playwright.config.*` (à créer), `tests/` ou `e2e/` (à créer), `.github/workflows/quality.yml`

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
`yarn serve`), pas contre le dev server :

1. `playwright.config.ts` — `webServer` lance `yarn serve` sur le `build/`, un seul projet
   Chromium, pas de dépendance navigateur lourde en CI (`--with-deps` sur le runner).
2. Un test unique qui parcourt un échantillon représentatif de routes — accueil, un article
   `.md`, un article `.mdx` riche en composants, une page tag, une page série, `/admin` — et
   **échoue** sur :
   - toute erreur console (`page.on("console")` / `page.on("pageerror")`) ;
   - tout warning d'hydratation React (`Warning: Text content did not match`,
     `Hydration failed`, `did not expect server HTML to contain`).
3. Job CI dans `quality.yml`, **informatif d'abord** (`continue-on-error` au niveau du step,
   comme le job `internal-links`) : on observe la stabilité quelques semaines avant de le
   rendre bloquant.

### Points à trancher pendant l'implémentation

- **Où lister les routes ?** En dur dans le test (simple, mais dérive) ou dérivées du
  `sitemap.xml` généré (exhaustif, plus lent). Un échantillon en dur de ~8 routes suffit
  probablement pour commencer.
- **Coût CI.** `quality.yml` fait déjà un `yarn install` de 2,6 Go. Ajouter un `yarn build`
  (~60 s) + le download Chromium. À mesurer ; envisager de réutiliser le `build/` d'un job
  existant via `actions/upload-artifact` plutôt que de rebuilder.
- **Docker-first.** Idéalement le test tourne dans l'image `blog-docusaurus:development`
  plutôt que sur le runner nu — cohérent avec le reste du repo. À arbitrer contre la
  complexité ajoutée.
- **Faux positifs d'hydratation** connus et documentés (voir commentaire dans
  `src/components/Reaction/index.tsx` et la règle `react-hooks/set-state-in-effect` passée
  en `warn`) : prévoir une allowlist de messages tolérés, sinon le job sera rouge en
  permanence.

## Risque

Faible. Le pire cas est un job CI bruyant qu'on finit par ignorer — d'où le démarrage en
mode informatif et l'allowlist. Ne pas sur-investir : le but est d'attraper la régression
d'hydratation grossière, pas de couvrir chaque page.

## Acceptance

- `yarn test:e2e` (ou équivalent) lance Playwright contre le `build/` servi localement et
  passe au vert sur l'état actuel du site.
- Le test échoue si on réintroduit volontairement un `localStorage.getItem(...)` au niveau
  du rendu d'un composant monté sur une page testée.
- Un job CI exécute ce test sur chaque push/PR, en mode informatif (step
  `continue-on-error`), findings visibles en annotations.
- `playwright` n'est plus une dépendance orpheline : `grep -rn playwright` renvoie la config
  et au moins un test.
