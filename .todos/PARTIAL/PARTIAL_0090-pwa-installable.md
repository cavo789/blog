# 0090 — PWA : rendre le blog installable

- **Priority**: medium
- **Batch**: blog-pwa
- **Depends**: —
- **Files**: `docusaurus.config.js`, `static/manifest.webmanifest`, `static/.htaccess`, `static/img/icons/`, `scripts/generate-pwa-icons.mjs`

## Problème

Le blog n'est pas une PWA, et deux symptômes le montrent depuis un smartphone (constaté le
2026-08-18, Chrome sur Android) :

1. **Aucune proposition d'installation.** Chrome n'affiche la bannière « Ajouter à l'écran
   d'accueil » que s'il trouve un manifeste valide (`name`, `short_name`, `start_url`,
   `display: standalone`, icônes ≥ 192px). Il n'y en a aucun : `static/` ne contient pas de
   manifeste et `headTags` dans `docusaurus.config.js` ne déclare aucun `rel="manifest"`.
2. **Le raccourci manuel n'a pas d'icône.** `docusaurus.config.js` déclare
   `favicon: "img/favicon.png"`, et ce fichier fait **32×32**. Android veut du 192×192 ;
   face à un 32×32 Chrome refuse d'upscaler et génère une pastille avec la première lettre
   du titre. Les autres candidats ne sauvent pas la mise : `favicon-sleeping.png` est en
   64×64, `favicon.ico` ne contient que des petites tailles, et `logo.svg` a une viewBox de
   200×200.

Il manque aussi `apple-touch-icon` et `theme-color`, absents des `headTags`.

L'enjeu n'est pas la performance (elle est déjà bonne) : c'est **l'identité**. Un blog qui
s'installe, s'ouvre dans sa propre fenêtre, avec le suricate en icône sur l'écran d'accueil,
ne se lit plus comme un blog.

## Solution

Le strict nécessaire pour être installable — **sans service worker ni cache offline**, qui
partent dans [[0095]]. Aucune dépendance npm nouvelle : `sharp` est déjà présent via
`@docusaurus/plugin-ideal-image`.

### 1. Générer le jeu d'icônes

Source : `static/img/meerkat/suricate_no_background.png` (585×742, fond transparent) — la
seule image du site qui soit une identité et pas un logo générique.

**Piège : elle est en portrait, pas carrée.** Un `resize` direct en 192×192 la déformera. Il
faut la placer sur un canevas carré (`sharp().resize({ fit: "contain", background })`) avant
de décliner les tailles.

Sorties attendues dans `static/img/icons/` :

- `icon-192.png`, `icon-512.png` — les deux tailles que Chrome exige.
- `icon-maskable-512.png` — avec la **safe zone** : le contenu doit tenir dans le cercle
  central de 80% du canevas, sinon Android rogne la tête du suricate.
- `apple-touch-icon.png` en 180×180 — **fond opaque obligatoire**, iOS ne gère pas la
  transparence et la remplacerait par du noir.

Script dédié `scripts/generate-pwa-icons.mjs`, versionné, pour que le jeu soit reproductible
si le suricate change. Les icônes générées sont commitées (pas de génération au build).

### 2. Le manifeste

`static/manifest.webmanifest` : `name`, `short_name` (≤ 12 caractères, c'est ce qui s'affiche
sous l'icône), `start_url: "/"`, `display: "standalone"`, `background_color`, `theme_color`,
et les entrées `icons` avec `purpose: "any"` / `purpose: "maskable"`.

Aligner `theme_color` sur la variable Infima du thème plutôt que de figer un hex arbitraire.

### 3. Le câblage dans `headTags`

`rel="manifest"`, `rel="apple-touch-icon"`, `<meta name="theme-color">`, plus les
`apple-mobile-web-app-*`.

### 4. Servir le manifeste avec le bon type MIME

`static/.htaccess` doit gagner `AddType application/manifest+json .webmanifest`.

**Attention au commentaire existant ligne 85** : `json` est *délibérément* absent des règles
de cache longue durée, parce qu'aucun JSON du site n'est content-hashé. Le manifeste est dans
le même cas — nom fixe, contenu qui peut changer. Ne pas le faire tomber dans un
`Cache-Control` d'un an.

### 5. iOS reste une limite connue

Safari n'affiche aucune invite d'installation : l'ajout est manuel via « Sur l'écran
d'accueil ». Avec l'`apple-touch-icon` en place, l'icône sera au moins correcte. À documenter
comme limite, pas à contourner.

## Risque

- **Faible.** Pas de service worker, donc pas de cache empoisonné, pas de surface de debug
  nouvelle en prod. Le pire cas est une icône moche ou un manifeste ignoré.
- **Icône maskable ratée.** Le seul vrai piège visuel : safe zone non respectée et Android
  rogne le suricate. À vérifier sur un vrai téléphone, pas dans un simulateur.
- **Bénéfice réel à mesurer.** Avec le trafic actuel, le nombre d'installations sera
  probablement proche de zéro. C'est assumé : la valeur est identitaire et technique (et fait
  un bon article), pas statistique. Ne pas surdimensionner l'effort en conséquence.

## Acceptance

- [ ] `scripts/generate-pwa-icons.mjs` produit `icon-192`, `icon-512`, `icon-maskable-512` et
      `apple-touch-icon` (180, fond opaque) depuis le suricate, sans déformation
- [ ] `static/manifest.webmanifest` existe et est référencé dans `headTags`
- [ ] `apple-touch-icon` et `theme-color` présents dans le HTML généré
- [ ] `AddType application/manifest+json .webmanifest` ajouté sans faire tomber le manifeste
      dans le cache longue durée
- [ ] L'invite d'installation apparaît réellement sur Chrome Android (testé, pas supposé)
- [ ] Le raccourci sur l'écran d'accueil affiche le suricate, pas une pastille à lettre
- [x] L'icône maskable n'est pas rognée sur la tête du suricate
- [x] Le comportement iOS est documenté comme limite connue
- [x] `yarn lint && yarn format:check && yarn build` passent

## Status — PARTIAL (2026-08-18)

### Done

- `scripts/generate-pwa-icons.mjs` génère `icon-192.png`, `icon-512.png`,
  `icon-maskable-512.png` (contenu dans un carré de 80 % du canevas, sans rognage — vérifié
  visuellement) et `apple-touch-icon.png` (180×180, fond opaque) depuis
  `static/img/meerkat/suricate_no_background.png`, sans déformation. Script commité, sortie
  commitée. Alias `yarn pwa:icons`.
- `static/manifest.webmanifest` créé (`name`, `short_name: "cavo789"`, `start_url: "/"`,
  `display: "standalone"`, `theme_color` aligné sur `--ifm-color-primary` clair (`#2e8555`,
  voir `src/css/custom.css`), icônes `any`/`maskable`) et référencé via `rel="manifest"` dans
  `headTags` (`docusaurus.config.js`).
- `rel="apple-touch-icon"`, `<meta name="theme-color">` et les deux
  `apple-mobile-web-app-*` ajoutés dans `headTags`, vérifiés présents dans le HTML généré
  (`yarn build` → `build/index.html`).
- `static/.htaccess` : `AddType application/manifest+json .webmanifest` ajouté, et
  `webmanifest` ajouté à la liste `no-cache` (pas à la liste `immutable`) — même raisonnement
  que pour `json`, documenté dans le commentaire existant.
- Limite iOS (pas d'invite d'installation, ajout manuel via « Sur l'écran d'accueil »)
  documentée dans ce fichier (section Solution, point 5) — reprise ici pour mémoire.
- `yarn lint && yarn format:check && yarn build` passent tous les trois.

### Not done

- Les deux cases « testé sur un vrai téléphone » (invite d'installation Chrome Android,
  raccourci avec l'icône du suricate) restent non cochées.
  **Reason:** nécessitent un test manuel sur un appareil Android physique avec Chrome — hors
  de portée d'une session Claude Code. Tout ce qui est vérifiable par build/lint/inspection
  visuelle du HTML et des PNG générés l'a été ; il reste à confirmer le rendu réel sur
  téléphone après déploiement.

### Deviation from the TODO's stated assumption

- Le TODO affirme que `suricate_no_background.png` a un **fond transparent**. Vérifié avec
  `sharp().metadata()` : `channels: 3`, `hasAlpha: false` — le fond est en fait blanc opaque
  malgré le nom du fichier. Ce n'est pas bloquant (le blanc de la source correspond au blanc
  choisi comme `background_color` du manifeste et au fond des canevas d'icônes), mais la
  génération traite bien un fond blanc plein, pas une transparence.
