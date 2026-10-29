# Reader review : docusaurus-typo-report-component

**Détecté :** 2026-10-29
**Article :** blog/2026/10/29/typo-report-docusaurus/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **1,7 % mécanique** (bloc `plaintext` l. 37 sur un corps de 347 lignes, T=31). Ce bloc est un schéma de conception, pas un résultat. **Il n'y a aucune image** dans l'article : le lecteur ne voit jamais le widget. TTV réel : **100 %**.
Drapeaux : abstraction-avant-preuve. Le tableau de 12 fichiers (l. 48-63), les 9 couches de sécurité (l. 87-146) et `typo.php` déplié (l. 152) passent tous avant le moindre aperçu.
Manques signalés par l'auteur (2026-10-29) :
- pas de section « comprendre en 30 secondes » ;
- pas de section finale `## Create the component` avec `<ProjectSetup>` (modèle : `blog/2026/06/22/terminal-typewriter-animation/index.md` l. 307-340) ;
- pas de `series: Creating Docusaurus components` dans le front matter.
Redondance : « one-way signal » **×5** 🟠.
Atterrissage : `## Summary` (l. 364-376) est un bloc mort, sans `## Conclusion` ni lien vers la suite.
Bruit narratif 🟠 : l. 271, la justification `const` vs `function`.
Coquille l. 212 : « synchronous and, the collision risk ».

Test des 30 secondes : j'abandonne. On me montre un arbre de fichiers avant le widget.

## Risque

Le lecteur d'une minute ne sait pas ce qu'il va construire. Or **le widget est actif sur cette page même** (`src/theme/BlogPostItem/index.js` l. 62) : la meilleure preuve existe déjà, l'article ne la signale simplement pas.

## Solution

### Ordre proposé

| # | Section | Contenu | Vient de |
| --- | --- | --- | --- |
| 0 | front matter | ajouter `series: Creating Docusaurus components` (mainTag `docusaurus` → `component` comme le reste de la série, à confirmer) | — |
| 1 | après `truncate` | `<QuickJump>` : « See it in action » / « Create the component » | modèle typewriter l. 32-37 |
| 2 | `## See It in Action` | *« Try it now: select any few words of this paragraph. »* Puis 3 captures dans `<BrowserWindow url="https://www.avonture.be/blog/docusaurus-typo-report-component">` : popover 2×2 (`selecting`), formulaire (`confirming`) et badge `done`. Une phrase sur le disclaimer one-way. | **à produire** (captures) + l. 225-238, l. 270 |
| 3 | idem | capture du dashboard `/typo-dashboard` dans `<BrowserWindow>` + extrait de l'e-mail reçu | **à produire** + l. 303-311 |
| 4 | `## How It Works` (sans code) | 4-5 puces : sélection → type → POST PHP → JSON + e-mail ; pas de base de données ; sécurité multicouche ; SSR-safe | l. 25-29, l. 37-46 (schéma conservé ici) |
| 5 | `## Part 1 — The PHP API` | Why PHP, structure serveur, implémentation, .htaccess, .env | l. 67-85, 148-173 |
| 6 | `## Part 2 — The React component` | SSR, state machine, localStorage, types, contexte, positionnement, implémentation | l. 177-271 (puce l. 271 retirée) |
| 7 | Parts 3-5 | CSS, wiring (swizzle), dashboard | l. 275-313 |
| 8 | `## Part 6 — Deployment` | PHP 8.1, permissions, smoke test | l. 317-348 |
| 9 | `## Create the component` | `<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>` avec **tous** les fichiers d'un coup (voir ci-dessous), puis la retouche de `BlogPostItem` et de `admin.js` | nouveau ; reprend les Snippets l. 152-166, 264, 279, 295, 309, 313 |
| 10 | `## Security Design — Layer by Layer (skip this if you just want it running)` | les 9 couches | l. 87-146 |
| 11 | `## Known limitations` | inchangé | l. 352-360 |
| 12 | `## Conclusion` | rattacher à la douleur d'ouverture (« readers won't open an issue ») + lien vers `/blog/docusaurus-reactions` et vers la série ; les puces du Summary disparaissent | l. 364-378 |

Les Parts 1-5 gardent leurs explications, mais leurs `<Snippet>` passent en `defaultOpen={false}` : la copie complète se fait dans `## Create the component`.

### Contenu de `<ProjectSetup>`

```text
api/typo.php                                   ← ./files/typo.php
api/.htaccess                                  ← ./files/.htaccess
api/.env.example                               ← ./files/.env.example
src/components/TypoReport/index.tsx            ← ./files/index.tsx
src/components/TypoReport/styles.module.css    ← src/components/TypoReport/styles.module.css
src/pages/typo-dashboard.js                    ← src/pages/typo-dashboard.js
src/pages/typo-dashboard.module.css            ← src/pages/typo-dashboard.module.css (absent de l'article aujourd'hui !)
```

`BlogPostItem/index.js` et `admin.js` modifient des fichiers existants. Ils restent donc des Snippets à part, sous le `ProjectSetup`, avec les lignes surlignées, comme pour `MDXComponents.js` dans le modèle typewriter.

### Point de vigilance : source des fichiers

Le `src/components/TypoReport/index.tsx` du site **diffère** de `./files/index.tsx`. La version du site est i18n : elle a `Translate`, `useTranslationState` et un 5ᵉ type `translation`. `api/typo.php` diffère aussi de `./files/typo.php`. Le `ProjectSetup` doit pointer sur les copies génériques de `./files/`, pas sur `src/` : la version du site dépend de `Blog/utils/translations` et casserait chez le lecteur. Pour la même raison, vérifier que `src/pages/typo-dashboard.js` et le CSS n'importent rien de propre au site. Sinon, en faire une copie dans `./files/`.

### Coupes

- l. 271 : la puce `const`/`function` part en commentaire dans `files/index.tsx`.
- « one-way » : ramener à 3 occurrences (TLDR, section 2, disclaimer).
- l. 212 : corriger la virgule.

Après coup : sweep complet (`above|below|earlier`, ancres `](#`), puis `translate blog/2026/10/29/typo-report-docusaurus` (le titre et la description ne changent pas → patch incrémental).

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
