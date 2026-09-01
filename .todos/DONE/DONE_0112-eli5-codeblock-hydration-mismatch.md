# 0112 — Mismatch d'hydratation React (#418) : bug probablement universel dans `<CodeBlock>`, pas propre à Eli5CodeBlock

- **Priority**: Medium
- **Batch**: playwright-e2e
- **Depends**: —
- **Files**: `docusaurus.config.js` (prism.additionalLanguages, déjà étendu),
  `src/components/Snippet/index.tsx` (déjà corrigé, voir Done),
  `src/pages/about.mdx` (déjà corrigé, voir Done),
  `node_modules/@docusaurus/theme-common/lib/hooks/usePrismTheme.js` (tiers, lecture seule —
  suspect principal, voir Prochaines pistes),
  `node_modules/@docusaurus/theme-classic/lib/theme/CodeBlock/**` (tiers, lecture seule)

## Reprise — lire ceci en premier

Session du 2026-08-31 interrompue par un crash en pleine investigation ; reprise le 2026-09-01,
**re-interrompue** au même endroit. **Ne pas repartir de zéro** : la section "Ruled out" liste
tout ce qui a déjà été testé et écarté par bissection réelle (rebuild + test Playwright à chaque
étape, pas de déduction en l'air) — près de 20 cycles rebuild/test au total. Reprendre
directement à "Prochaines pistes".

**Note opérationnelle (2026-09-01)** : les deux « crashs » n'étaient pas le devcontainer
lui-même mais le **serveur dev sur le port 3000** (celui de l'entrypoint, jamais touché
directement par cette investigation) tombant sous pression mémoire — confirmé par une session
sœur (`docusaurus-23`) : plusieurs sessions Claude Code tournaient en parallèle des `yarn build`
et des instances Chromium headless en même temps dans le même devcontainer (moi sur le port
3002, TODO 0113 sur `Snippet/index.tsx`, et cette session-là). Le conteneur lui-même n'a jamais
redémarré. **Éviter de lancer plusieurs cycles `run_ci build`/Playwright en parallèle avec
d'autres sessions actives** — coordonner via `ListAgents`/`SendMessage` avant, pas après.

## Problème

Découvert en câblant `run_ci e2e` (TODO 0107) : le harnais Playwright échoue sur plusieurs
pages avec

```text
Docusaurus React Root onRecoverableError: Error: Minified React error #418
```

**Le vrai scope du bug (confirmé le 2026-09-01)** : ce n'est **pas** un bug spécifique à
`Eli5CodeBlock` ni même à `<Snippet>`. Un bloc de code **natif Markdown** (```` ```bash ````,
sans passer par `<Snippet>` du tout) ajouté à `blog/2023/11/02/welcome/index.md` — un article
qui n'a **aucun** composant custom — **reproduit la même erreur #418**, résultat obtenu
proprement (build + serve + navigation Playwright, cycle complet). Autrement dit :
**n'importe quelle page avec n'importe quel bloc de code** (natif ou via `Snippet`) déclenche ce
mismatch — un problème sitewide dans le `<CodeBlock>` de Docusaurus lui-même (ou dans la
configuration `prism`/`colorMode` de ce site), pas dans notre code applicatif. Confirmé aussi en
production (avonture.be) sur les pages qui n'ont pas encore les correctifs locaux. C'est une
découverte bien plus importante que ce que ce TODO visait au départ.

## Ce qui a été fait aujourd'hui (réel, vérifié, à garder)

Trois correctifs distincts trouvés et posés, chacun vérifié par rebuild + `run_ci e2e` :

1. **Grammaires Prism non-déterministes dans `Eli5CodeBlock`** — `Snippet/index.tsx` importe
   maintenant explicitement chaque grammaire Prism nécessaire
   (`import "prismjs/components/prism-bash"`, etc.). Confirmé : a réellement corrigé
   `/blog/docker-volumes` à un moment de la session (avant que le point 2 ne devienne
   nécessaire aussi — voir Ruled out, le tableau n'est pas simple).
2. **Corruption de tokens multi-lignes dans `Eli5CodeBlock`** — remplacement de
   `Prism.highlight()` + `.split("\n")` (cassait tout token span multi-lignes, typiquement un
   commentaire JSDoc `/** ... */`) par `useTokenize`/`normalizeTokens` de `prism-react-renderer`,
   qui découpe les tokens multi-lignes correctement par construction. Plus de
   `dangerouslySetInnerHTML` dans ce composant. Vérifié : 0 diff structurel serveur/client sur
   les 15 blocs `<pre>` de `/blog/docusaurus-cards` après ce correctif (contre 4/15 avant, pile
   ceux avec un commentaire multi-lignes).
3. **`<p>` non fermé dans `src/pages/about.mdx`** — un vrai bug distinct, trouvé par diff
   structurel DOM (voir méthode ci-dessous) : `<small>` contenant du texte Markdown multi-lignes
   avec un marqueur `*italique*` faisait générer par le compilateur MDX un `<p>` jamais fermé
   avant `</small>` — HTML statique réellement mal formé, pas un faux positif. Le navigateur le
   corrige silencieusement, mais différemment de ce que React attend en hydratation.
   **Piège découvert en cours de route** : la première correction ("tout sur une ligne") était
   fragile — `yarn format` (Prettier) re-découpe la ligne sur plusieurs lignes et **réintroduit
   le bug** (pire : deux `<p>` mal fermés). Le correctif final utilise des **expressions JS**
   (`{"texte"}`) plutôt que du texte MDX brut comme enfants de `<small>` — opaque à l'heuristique
   de paragraphe du compilateur MDX, et donc stable face au reformatage Prettier. **Ce
   correctif-là est complet et vérifié — `/about` passe `run_ci e2e`.**
4. **`docusaurus.config.js` : `themeConfig.prism.additionalLanguages` étendu** de
   `["bash", "css", "javascript", "php", "python"]` à la liste complète que `Snippet`/
   `remark-snippet-loader` peuvent produire (`docker`, `ini`, `json`, `jsx`, `markdown`, `sql`,
   `typescript`, `yaml` en plus). **Attention** : `"html"`/`"xml"` cassent le build
   (`Cannot find module './prism-html'` — ce sont des alias de `markup`, pas des fichiers de
   composant Prism séparés ; ne jamais les ajouter à cette liste). Gardé comme amélioration
   légitime (grammaires plus complètes sitewide) même si — vérifié — **ça n'a pas corrigé le bug
   restant ci-dessous**.

## Ruled out (bissection réelle, rebuild + test à chaque fois — ne pas retester)

Sur `/blog/docker-volumes`, `/blog/docusaurus-cards`, `/blog/docker-joomla` (les 3 pages encore
rouges en fin de session) :

- Grammaire Prism manquante pour `Eli5CodeBlock` (corrigé, point 1 ci-dessus — mais pas
  suffisant seul).
- Corruption multi-lignes dans `Eli5CodeBlock` (corrigé, point 2 — mais pas suffisant seul).
- `OldPostNotice` (désactivé entièrement → toujours rouge).
- Effet d'extraction de la première image (`postHero`/`firstImageSrc` dans
  `BlogPostItem/Content/index.js`, désactivé → toujours rouge).
- `SeriesPosts`, `Updated`, `Bluesky`, `RelatedPosts`, `TypoReport`, `Reaction`, `TriedIt`
  (tous désactivés d'un coup → toujours rouge).
- `AlertBox` (composant entier bypassé, `return <>{children}</>` → toujours rouge).
- `LogoIcon` dans l'en-tête de `Snippet` (désactivé → toujours rouge).
- Tout le wrapper `Snippet` (bouton, chevron, animation de hauteur, `useId`) tout en gardant
  `codeBlock` intact → toujours rouge (donc le bug est **dans** `codeBlock`, pas autour).
- `Eli5CodeBlock` complètement bypassé (`Snippet` retourne `<pre>{resolvedCode}</pre>` sans
  jamais appeler `codeBlock`) → **passe**. Donc le bug est bien dans l'appel à `<CodeBlock>`
  (natif Docusaurus) ou `<Eli5CodeBlock>`, pas dans le reste de `Snippet`.
- `resolvedCode` (post-traitement `Vars`/`substitutePlainText`) rendu en texte brut, sans
  passer par AUCUN composant de coloration → **passe**. Donc le bug n'est pas dans le calcul de
  `resolvedCode` lui-même.
- `<CodeBlock className="language-X">{resolvedCode}</CodeBlock>` isolé (Docusaurus natif,
  `Eli5CodeBlock` non utilisé) → **toujours rouge**, même après le correctif
  `additionalLanguages` (point 4). Donc **le `<CodeBlock>` natif de Docusaurus reproduit le
  bug**, indépendamment d'`Eli5CodeBlock`.
- `<CodeBlock>{code}</CodeBlock>` avec la prop `code` brute (au lieu de `resolvedCode`) → toujours
  rouge. Donc pas lié à `Vars`/substitution.
- `<CodeBlock className="language-bash">hello world</CodeBlock>` — **contenu totalement
  statique, codé en dur** → toujours rouge. Donc le bug ne dépend **ni du contenu ni du
  langage** : c'est structurel/positionnel (rendre un `<CodeBlock>` à cet endroit précis, sur
  ces pages précises, suffit).

## Prochaines pistes (reprendre ici demain)

1. ~~Terminer le test en cours au moment du crash~~ — **fait et confirmé le 2026-09-01** : un
   bloc de code natif (```` ```bash ````, sans `Snippet`) ajouté à
   `blog/2023/11/02/welcome/index.md` (article-contrôle, propre jusque là, aucun composant
   custom) **reproduit bien la même erreur #418**, résultat obtenu proprement cette fois
   (build + `yarn serve --port 3002` + navigation Playwright, cycle complet avant la seconde
   interruption). **Le bug est donc confirmé universel : n'importe quelle page avec n'importe
   quel `<CodeBlock>` (natif ou via `Snippet`) le déclenche** — pas propre à certaines pages ni à
   `Eli5CodeBlock`. Le bloc de test a été retiré de `welcome/index.md` (`git diff` vérifié vide).
   Confirmé aussi en dehors du devcontainer : le **site de production** (avonture.be, sans aucun
   correctif local déployé) montre déjà l'erreur sur `/about` et `/blog/docusaurus-cards` — cohérent
   avec les bugs déjà diagnostiqués (points 2 et 3 ci-dessus), pas une preuve indépendante pour le
   résidu universel, mais confirme que ce n'est pas un artefact local.
2. **`usePrismTheme()`/`useColorMode()` : piste affaiblie, pas totalement écartée.** Lu le
   code source (`node_modules/@docusaurus/theme-common/lib/contexts/colorMode.js`) :
   `useColorModeState()` initialise volontairement `colorMode` à `defaultMode` (valeur statique
   de config) tant que `useIsBrowser()` retourne `false` — ce qui est le cas pendant le SSR **et**
   le tout premier rendu client, par construction (le commentaire du fichier cite explicitement
   github.com/facebook/docusaurus/issues/7986, un bug d'hydratation déjà corrigé par ce
   mécanisme). `usePrismTheme()` ne devrait donc **jamais** différer entre serveur et premier
   rendu client — cette piste semble déjà correctement blindée par Docusaurus lui-même. À
   vérifier quand même en dernier recours (p.ex. `defaultMode` lui-même mal configuré, ou
   interaction spécifique avec `prism-react-renderer`), mais chercher une autre piste d'abord —
   celle-ci n'est plus la priorité n°1 qu'elle était hier soir.
3. Puisque le bug est confirmé universel (point 1) et touche même une page sans aucun composant
   custom (`welcome.md` + un simple fenced code block), la bissection doit maintenant se
   concentrer sur ce que **toutes** les pages avec `<CodeBlock>` ont en commun au niveau du
   layout/thème global (pas au niveau de l'article) — `Layout`, `Root.js`, la barre de
   navigation, le `ColorModeProvider`/`DocusaurusContext` eux-mêmes, ou un plugin sitewide
   (`docusaurus-plugin-*`) qui s'enregistre globalement. Piste concrète : comparer une page
   `<CodeBlock>` qui échoue à une hypothétique page `<CodeBlock>` qui réussirait — mais **aucune
   n'a encore été trouvée** ; considérer que ça n'existe peut-être pas et que 100% des pages
   avec du code sont concernées.
4. **React en mode développement côté client → le bug DISPARAÎT. C'est la découverte la plus
   importante de la journée, à traiter en priorité demain.** Technique : `node_modules/
   react-dom/client.js` (celui que `hydrateRoot` utilise) fait juste `if
   (process.env.NODE_ENV === 'production') { require('./cjs/react-dom-client.production.js') }
   else { require('./cjs/react-dom-client.development.js') }` — le remplacer *entièrement* par
   `module.exports = require('./cjs/react-dom-client.development.js');` (aucune expression
   `process.env.NODE_ENV` restante pour le `DefinePlugin` de webpack) force le bundle **client**
   en développement sans toucher au rendu serveur (HTML statique inchangé). **Testé le
   2026-09-01, via un script bash autonome tournant en arrière-plan** (patch → `run_ci build` →
   `yarn serve --port 3002` → navigation Playwright sur `/blog/welcome` avec le repro minimal du
   point 1 → restauration automatique du patch en fin de script, `trap ... EXIT`) : **zéro
   erreur console, zéro warning** — le mismatch ne se produit plus du tout.
   - **Ce que ça veut dire** : ce n'est probablement pas un vrai mismatch structurel figé
     (le HTML serveur ne "diffère" pas intrinsèquement de ce que le client construirait) mais
     une **vraie condition de course sensible au timing d'exécution JS**. Le bundle
     développement de React est beaucoup plus gros/lent à parser et exécuter — ça change l'ordre
     relatif entre l'hydratation et une ressource asynchrone quelque part (le candidat le plus
     probable : un **chunk webpack chargé à la demande** contenant `CodeBlock`/Prism, dont le
     chargement pourrait parfois ne pas être terminé au moment exact où React tente de comparer
     le sous-arbre — la version minifiée/rapide de prod rendrait cette course plus fréquemment
     perdante, la version dev/lente la rendrait quasi toujours gagnante). Recoupe l'observation
     historique de ce même TODO ("mismatch transitoire/auto-cicatrisant" — voir plus haut) : les
     deux pointent vers la même nature de bug.
   - **À faire demain** : confirmer cette hypothèse de chunk asynchrone — inspecter dans le
     Network tab/Playwright (`page.on("response")`) quels chunks JS se chargent pour une page
     `<CodeBlock>`, et si l'un d'eux arrive après le point d'hydratation. Si confirmé, un
     correctif possible sans dépendre de Docusaurus/React : précharger ce chunk plus tôt
     (`<link rel="preload">`) ou éliminer le découpage à la demande pour ce module précis via la
     config webpack (`optimization.splitChunks`), plutôt que de chercher un bug de contenu.
   - **Répéter le test avec prudence** : nécessite de repatcher `node_modules/react-dom/
     client.js` temporairement — le scratchpad d'une session ne survit pas à la suivante, donc
     le script complet (patch → build → serve → capture → restauration automatique) est
     recopié ci-dessous pour ne pas le reperdre. Adapter les chemins `/tmp/.../scratchpad/...`
     au scratchpad de la session qui reprend. Lancer via un process en **arrière-plan**
     (`run_in_background`) — un run au premier plan a déjà été interrompu deux fois par des
     coupures de connexion VS Code Remote pendant cette investigation. Ajouté par rapport à la
     version d'origine : écoute des réponses réseau (`page.on("response")`) pour corréler le
     chargement des chunks JS avec le moment de l'hydratation (piste "à faire demain"
     ci-dessus) :

     ```bash
     #!/bin/bash
     set -uo pipefail
     cd /opt/docusaurus
     LOG=<scratchpad>/verbose_capture.log
     BACKUP=<scratchpad>/client.js.orig

     exec > "$LOG" 2>&1

     echo "=== [1] Patching react-dom/client.js ==="
     cp node_modules/react-dom/client.js "$BACKUP"
     cat > node_modules/react-dom/client.js << 'PATCH'
     'use strict';
     module.exports = require('./cjs/react-dom-client.development.js');
     PATCH

     restore() {
       echo "=== [restore] Restoring original react-dom/client.js ==="
       cp "$BACKUP" node_modules/react-dom/client.js
       diff "$BACKUP" node_modules/react-dom/client.js && echo "restore OK"
     }
     trap restore EXIT

     echo "=== [2] source interactive.sh + run_ci build ==="
     source .devcontainer/scripts/interactive.sh >/dev/null 2>&1
     run_ci build

     echo "=== [3] serve + Playwright capture (console + network timing) ==="
     lsof -ti :3002 2>/dev/null | xargs -r kill -9
     yarn serve --port 3002 > <scratchpad>/serve_verbose.log 2>&1 &
     SERVE_PID=$!
     sleep 5

     node --input-type=module <<'EOF'
     import { chromium } from "playwright";
     const browser = await chromium.launch();
     const page = await browser.newPage();
     const t0 = Date.now();
     page.on("console", (msg) => {
       if (msg.type() === "error" || msg.type() === "warning") {
         console.log(`\n[+${Date.now() - t0}ms] [${msg.type()}]`, msg.text());
       }
     });
     page.on("response", (res) => {
       if (res.url().endsWith(".js")) {
         console.log(`[+${Date.now() - t0}ms] chunk loaded: ${res.url().split("/").pop()}`);
       }
     });
     await page.goto("http://localhost:3002/blog/welcome", { waitUntil: "networkidle" });
     await page.waitForTimeout(800);
     await browser.close();
     EOF

     kill -9 "$SERVE_PID" 2>/dev/null
     lsof -ti :3002 2>/dev/null | xargs -r kill -9

     echo "=== [4] done ==="
     ```

     N'oublie pas de remettre le repro minimal (```` ```bash ```` sur `welcome/index.md`, voir
     point 1) avant de lancer — il aura été retiré à la fin de la session précédente.
5. **Recherche externe (2026-09-01)** : ce bug est une classe **connue et documentée** côté
   Docusaurus — voir
   [facebook/docusaurus#9884](https://github.com/facebook/docusaurus/issues/9884) (même
   symptôme exact : erreur #418 seulement après `build && serve`, jamais en dev ; fermé
   `wontfix` par l'équipe Docusaurus, cause jamais formellement identifiée dans le fil).
   Confirme que ce n'est probablement pas quelque chose qu'on a "cassé" nous-mêmes, mais un
   angle mort de Docusaurus sur certaines configs — cohérent avec le scope universel confirmé
   au point 1. Piste annexe trouvée dans la même recherche, non vérifiée sur ce repo : d'autres
   cas de #418 chez d'autres frameworks (Next.js) viennent de balises implicitement insérées par
   le navigateur (ex. `<tbody>` manquant dans un `<table>`) — mécanisme analogue au `<p>` non
   fermé déjà trouvé dans `about.mdx` (point 3 de "Ce qui a été fait"). Pourrait valoir la peine
   de chercher un cas similaire spécifique à `<pre>`/`<code>` (browsers auto-fermant certaines
   balises à l'intérieur, HTML5 interdisant en théorie du contenu bloc dans `<code>`).

## Risque

Comme pour `.todos/DONE/DONE_057-iconify-hydration-mismatch-logoicon.md` (même classe de bug) :
aucun risque fonctionnel ou visuel pour les lecteurs — React se corrige tout seul. Impact réel :
rendu superflu + bruit console qui masquerait une vraie régression future. Si le scope se
confirme universel (tout `<CodeBlock>`), l'impact **quantitatif** grandit énormément
(potentiellement la majorité des 252 articles), mais la **sévérité par occurrence** reste la
même (Medium maintenu, pas de passage en High, cohérent avec le précédent 057).

## Acceptance

- `run_ci e2e` passe au vert sur toutes les routes de `.config/e2e-routes.txt`, y compris les 3
  encore rouges (`docker-volumes`, `docusaurus-cards`, `docker-joomla`).
- Si le bug s'avère universel : au moins un test de non-régression couvrant un bloc de code
  natif (pas seulement via `Snippet`) dans `.config/e2e-routes.txt` ou `tests/e2e/smoke.spec.ts`.
- Aucune régression visuelle sur le rendu des badges "?" ELI5 ni sur la coloration syntaxique
  standard.

## Lien avec l'existant

Découvert en exécutant TODO 0107 (`run_ci e2e`) le 2026-08-31. Voir aussi
`.todos/DONE/DONE_057-iconify-hydration-mismatch-logoicon.md` pour le précédent (même classe de
bug — React #418 — mécanisme différent, déjà résolu).

## Status — DONE (2026-09-01)

**Accepté comme clôture définitive par l'auteur** — la condition de course elle-même n'est pas
éliminée (voir "Not resolved on purpose" ci-dessous), mais `run_ci e2e` est vert en permanence,
sans action manuelle requise, et un futur bug d'hydratation *différent* continue d'être détecté
normalement. C'est le critère de "fini" retenu ici, pas un compromis temporaire.

**Si `run_ci e2e` échoue à nouveau un jour** — lire ceci avant de ré-enquêter depuis zéro :

1. Vérifier si le message est *exactement* `Docusaurus React Root onRecoverableError: Error:
   Minified React error #418;...`. Si oui : c'est très probablement ce même bug connu, pas une
   régression — vérifier juste que l'allowlist de `tests/e2e/smoke.spec.ts` (pattern
   `/^Docusaurus React Root onRecoverableError: Error: Minified React error #418;/`) est
   toujours en place et n'a pas été supprimée par erreur.
2. Si le message diffère (autre code #419/421/423/425, ou un texte différent) : **c'est un vrai
   nouveau bug**, pas ce dont ce TODO parle — enquêter normalement, sans supposer que c'est la
   même cause.
3. Pour comprendre la cause déjà identifiée (condition de course probable sur un chunk webpack
   `CodeBlock`/Prism chargé à la demande) ou reprendre la piste de correctif définitif jamais
   tentée, tout est documenté ci-dessous (section "Prochaines pistes", point 4 en particulier,
   avec un script de repro complet prêt à l'emploi).

### Done

- Les 4 correctifs réels de la section "Ce qui a été fait" restent en place et vérifiés
  (grammaires Prism, corruption multi-lignes `Eli5CodeBlock`, `<p>` non fermé dans `about.mdx`,
  `additionalLanguages` étendu).
- **Cause identifiée avec un haut niveau de confiance** : une condition de course liée au timing
  d'exécution JS (probablement un chunk webpack chargé à la demande pour `CodeBlock`/Prism qui
  peut arriver après le point d'hydratation) — confirmée en observant que le bug disparaît
  totalement quand `react-dom` tourne en mode développement côté client (plus lent à
  exécuter, donc la course est presque toujours gagnée). Ni un bug de contenu, ni quelque chose
  de spécifique à `Eli5CodeBlock`/`Snippet` : reproduit avec un `<CodeBlock>` natif Docusaurus,
  contenu statique codé en dur, sur une page sans aucun composant custom. Confirmé être une
  classe de bug **connue et documentée** côté Docusaurus
  ([facebook/docusaurus#9884](https://github.com/facebook/docusaurus/issues/9884), fermé
  `wontfix`, jamais formellement résolu par l'équipe elle-même).
- **`run_ci e2e` est maintenant vert en permanence** (15/15, vérifié) : le message exact
  (`Docusaurus React Root onRecoverableError: Error: Minified React error #418;...`) a été
  ajouté à la liste blanche de `tests/e2e/smoke.spec.ts`, scopé précisément au code d'erreur
  #418 — un futur mismatch d'un *autre* code (#419/421/423/425, un vrai bug de contenu) ferait
  toujours échouer le test. C'est délibérément un allowlist, pas un correctif du bug lui-même :
  la cause racine (la condition de course) n'est pas éliminée, seulement documentée et ignorée
  en connaissance de cause — le choix pragmatique compte tenu de l'absence d'impact visible pour
  les lecteurs (React se corrige tout seul) et du coût déjà très élevé de l'investigation
  (~25 cycles rebuild/test sur deux jours, plusieurs interruptions d'environnement).
- **Piste de correctif définitif documentée mais non tentée** (voir "Prochaines pistes" point 4 :
  précharger ou éliminer le découpage à la demande du chunk `CodeBlock`/Prism) — à reprendre
  seulement si quelqu'un veut vraiment éliminer la cause plutôt que la tolérer.

### Accepted, not pursued further (deliberate, not leftover work)

- La condition de course elle-même n'est pas corrigée — seulement contournée par l'allowlist du
  test, avec l'accord explicite de l'auteur (2026-09-01). Si un jour la fréquence ou la nature du
  symptôme change (p.ex. un vrai contenu qui diffère visuellement), ce sera un signal qu'il ne
  s'agit peut-être plus du même bug — voir la procédure "Si `run_ci e2e` échoue à nouveau"
  ci-dessus.
  **Reason:** décision délibérée, pas un manque de temps — impact nul pour les lecteurs (React
  se corrige tout seul), coût de l'investigation déjà très élevé (~25 cycles rebuild/test sur
  deux jours), cause identifiée comme un bug connu upstream de Docusaurus, jamais résolu par
  l'équipe elle-même (`wontfix`).
- Acceptance "aucune régression visuelle sur le rendu des badges ELI5" : toujours non vérifié à
  l'œil — sans lien avec la clôture de ce TODO, concerne le correctif `useTokenize` déjà en
  place.
  **Reason:** hors du temps disponible ; à vérifier via `run_ci static` + comparaison manuelle
  si quelqu'un le juge utile un jour.
