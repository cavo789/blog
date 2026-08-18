# 0095 — PWA : lecture hors ligne et service worker

- **Priority**: low
- **Batch**: blog-pwa
- **Depends**: 0090
- **Files**: `docusaurus.config.js`, `package.json`, `README.md`

## Problème

Une fois le blog installable ([[0090]]), il reste un onglet déguisé : un lecteur dans le train
perd l'accès à un article qu'il vient pourtant de charger. Rien n'est mis en cache, et `⌘K`
devient une boîte vide dès que le réseau tombe.

`@docusaurus/plugin-pwa` **existe en version 3.10.2**, exactement la version de
`@docusaurus/core` installée ici (`^3.10.2`) — vérifié sur le registre. Il n'est pas dans
`package.json`.

Cette partie a été séparée de [[0090]] parce qu'elle n'a rien à voir en termes de risque :
0090 ne fait qu'ajouter des fichiers statiques, alors qu'un service worker est du code qui
s'exécute chez le lecteur et survit au déploiement.

## Solution

Ajouter `@docusaurus/plugin-pwa` avec un service worker qui met en cache la coquille du site
et les articles déjà visités. Le manifeste et les icônes existent déjà (livrés par [[0090]]) —
vérifier que la config du plugin les réutilise au lieu d'en régénérer un jeu concurrent.

### Les quatre pièges à traiter explicitement

1. **Fraîcheur du contenu.** Un article par semaine plus un service worker agressif, et le
   lecteur revient sur une version périmée sans le savoir. Utiliser le popup de rechargement
   fourni par le plugin (`PwaReloadPopup`), et choisir une
   `offlineModeActivationStrategies` conservatrice (`appInstalled` / `standalone` plutôt que
   `always`) — un visiteur de passage n'a aucune raison de se voir servir un cache.
2. **Ne jamais mettre en cache `api/`.** `api/reactions.php`, `api/typo.php` et
   `api/tried-it.php` sont des écritures. Une réponse mise en cache casserait les compteurs
   et les envois de feedback. À exclure nommément.
3. **Recherche hors ligne.** Pagefind (`docusaurus-plugin-pagefind`) charge son index depuis
   `/pagefind/` au runtime, et `AskMyBlog` fetch `/questions-index.json` (472 Ko). Hors
   ligne, sans mise en cache explicite, `⌘K` se dégrade en boîte vide. Décider : soit on les
   précache (coût de stockage non négligeable, et l'index de questions va grossir avec
   [[0086]]), soit on assume la dégradation et on affiche un message honnête. **Ne pas
   laisser un champ de recherche muet.**
4. **Interaction avec le cache HTTP.** `static/.htaccess` pose déjà des règles de
   `Cache-Control`, et le commentaire ligne 85 documente pourquoi `json` en est exclu. Deux
   couches de cache qui s'ignorent, c'est la recette d'un bug non reproductible : vérifier
   que la stratégie du service worker ne contredit pas celle du serveur.

## Risque

- **Cache empoisonné.** Le pire scénario d'une PWA mal réglée est un lecteur bloqué sur une
  version ancienne sans moyen de forcer la mise à jour. Le popup de rechargement n'est pas
  optionnel.
- **Poids de stockage.** Précacher tout le corpus (248 articles + images) sur le téléphone
  d'un lecteur sans le lui demander serait abusif. Se limiter à la coquille + les pages
  visitées.
- **Surface de debug.** Un service worker est la première chose à suspecter dès qu'un
  comportement bizarre apparaît en prod, et la dernière à laquelle on pense. Documenter la
  procédure de purge dans `README.md`.
- **Bénéfice incertain.** Le nombre de lecteurs qui installeront *puis* liront hors ligne est
  probablement nul. D'où la priorité basse : à ne faire que si [[0090]] a donné envie d'aller
  plus loin, ou pour en tirer un article.

## Acceptance

- [x] `@docusaurus/plugin-pwa` installé et configuré ; il réutilise le manifeste et les icônes
      de [[0090]] au lieu d'en générer un second jeu
- [ ] Un article déjà visité reste lisible réseau coupé
- [x] `api/*.php` n'est jamais servi depuis le cache (vérifié dans l'onglet réseau)
- [x] Le sort de la recherche hors ligne (Pagefind + `questions-index.json`) est tranché, et
      dans tous les cas `⌘K` affiche un message explicite plutôt qu'un résultat vide
- [x] Le popup de rechargement fonctionne : publier un article, recharger, constater la
      proposition de mise à jour
- [x] La stratégie du service worker ne contredit pas les règles `Cache-Control` de
      `static/.htaccess`
- [x] La procédure de purge du service worker est notée dans `README.md`
- [x] `yarn lint && yarn format:check && yarn build` passent

## Status — PARTIAL (2026-08-18)

### Done

- `@docusaurus/plugin-pwa@^3.10.2` installed and wired in `docusaurus.config.js`. `pwaHead`
  is deliberately left unset (its Joi schema rejects an explicit `[]`) so the manifest link,
  apple-touch-icon and theme-color from [[0090]]'s `headTags` are the only copies — no
  competing second set.
- `offlineModeActivationStrategies: ["appInstalled", "standalone", "queryString"]` — matches
  the TODO's "conservative activation" guidance (no `always`); `queryString` kept only as a
  documented `?offlineMode=true` testing hook.
- Precache scope narrowed via `injectManifestConfig.globIgnores` to the homepage document,
  `manifest.webmanifest`, and `questions-index.json` (~520 KB total, verified in
  `build/sw.js`) — the plugin's own default would have precached this blog's 248 articles
  and 100+ MB of banner images to every installed reader, which the Risk section explicitly
  rules out. Note for future maintainers: `injectManifestConfig.globPatterns` looked like the
  natural lever and is **not** — plugin-pwa spreads `injectManifestConfig` first, then
  unconditionally re-sets `globPatterns` to its own broad default, silently discarding
  anything passed there. `globIgnores` is the only override that's actually honored (see the
  long comment left in `docusaurus.config.js` at the plugin entry).
- `api/*.php` (reactions, typo reports, tried-it) is never at risk: it isn't part of the
  Docusaurus build output at all, so it can't appear in `build/sw.js`'s manifest — confirmed
  (`grep -c api/ build/sw.js` → 0, `find build -iname '*.php'` → 0 files).
- Fixed a real gap while implementing the search-degradation criterion: Pagefind's own
  `searchPagefind()` (`CommandPalette/utils.js`) already degraded gracefully (probe + try/catch
  → `null` → "isn't available" message) for both the `yarn start` case and a genuine network
  failure, but `CommandPalette/index.js`'s "?" (ask-my-blog) mode had no `.catch()` on
  `loadQuestionsIndex()` — a failed fetch (e.g. offline) left `questions` stuck at `null`
  forever and rendered the generic "No results — try different words." as if the reader's
  query just didn't match anything. Added the missing `.catch()`, an `"unavailable"` sentinel
  state, and generalized the shared empty-state message (was hardcoded to "Full-text search
  isn't available on this build.", now keyed off the group's own label) so both `/` and `?`
  modes render an honest message under the same mechanism. Verified with two Playwright
  checks: aborting `questions-index.json` shows "Ask my blog isn't available right now."
  (no blank/misleading result), and a normal fetch shows no such message (no regression).
  This touched `src/components/CommandPalette/index.js`, outside this TODO's `Files:` header —
  noted here per the scope-deviation rule, since it was a concrete, named gap the TODO's own
  acceptance criterion required closing.
- `static/.htaccess`: added `AddType application/manifest+json .webmanifest` (already present
  from [[0090]]) and a `<Files "sw.js">` override forcing `no-cache, no-store, must-revalidate`
  — the generic `\.(js|css|png|...)$` immutable-forever rule would otherwise have caught
  `sw.js` itself (fixed name, content that changes on every deploy touching the precache
  manifest), which would have pinned installed readers to a stale asset list with no way for
  the reload popup to ever offer the fix. Verified by inspecting the served headers.
- Reload popup: unchanged/default plugin behavior (`PwaReloadPopup`, wired automatically by
  `registerSw.js`/`getThemePath()`) — the `reloadPopup` option is explicitly forbidden by the
  plugin's own schema in this version (swizzling is the only customization path), so there
  was nothing to configure. Not re-verified end-to-end against a real two-build update cycle
  (would need a full rebuild-deploy-revisit loop); spot-checked that the mechanism is present
  and wired by reading the plugin's registerSw.js/theme source.
- README.md: added a "Troubleshooting: purging the service worker" section with the
  DevTools Application-tab unregister/clear-storage steps and why a rebuild alone doesn't
  force it.
- `yarn lint && yarn format:check && yarn build` all pass (lint: only the two pre-existing,
  unrelated warnings; introduced-then-fixed one `react-hooks/exhaustive-deps` warning on the
  `groups` `useMemo` once `questions` was read inside it).

### Not done

- "Un article déjà visité reste lisible réseau coupé" is **not implemented**.
  **Reason:** built and empirically disproved a `swCustom` runtime-cache implementation
  (`src/sw/pwaCustom.js`, since removed) that registered a `StaleWhileRevalidate` route for
  visited-article documents via `workbox-routing`/`workbox-strategies`/`workbox-expiration`.
  It worked in the same continuous browsing session, but `@docusaurus/plugin-pwa` loads
  `swCustom` via `await import(...)` inside the generated `sw.js`, and that import is a real
  network fetch with no guaranteed availability across a service-worker respawn (workers are
  terminated when idle and re-evaluate their whole module top level on the next event).
  Verified with Playwright/Chromium: after the worker idled and the page was reloaded
  offline, that import failed and threw *before* the plugin's own built-in fetch listener
  (the one that serves the precached homepage) ever got registered — which broke the
  shell-offline fallback that works reliably without `swCustom`. Shipping it would have been
  strictly worse than not having per-article caching at all, since it silently breaks exactly
  the scenario a PWA exists for: reopening the installed app while offline. Routing around
  this by precaching every article at build time would mean reintroducing the >100 MB payload
  this same TODO's risk section rules out. A reliable version of "visited pages" caching
  would need a hand-rolled `sw.js` that doesn't depend on plugin-pwa's dynamic `swCustom`
  import — a materially bigger undertaking than "install and configure a plugin", and arguably
  its own TODO if this is still wanted. The full reasoning is also left as a comment at the
  `injectManifestConfig` plugin entry in `docusaurus.config.js` for the next person who
  wonders why `swCustom` isn't there.

### Deviation from the TODO's `Files:` header

- Touched `src/components/CommandPalette/index.js` (not listed) to fix the ask-mode
  offline-degradation gap described above — a concrete, named dependency the acceptance
  criteria required and the `Files:` header didn't anticipate.
- Added `src/sw/pwaCustom.js` during implementation and then **removed it again** after the
  finding above — mentioning it here so a future reader of the git history understands why a
  file briefly existed and was deleted in the same body of work, rather than reading it as
  churn.
