# 0108 — Migrer `docusaurus.config.js` vers `docusaurus.config.ts`

- **Priority**: Low
- **Batch**: unassigned
- **Depends**: —
- **Files**: `docusaurus.config.js` → `docusaurus.config.ts`, `tsconfig.json`, `eslint.config.js`, `package.json`, **~14 articles de `blog/` + 6 drafts de `.unpublished/`** (voir « Portée » ci-dessous)

## Problème

`docusaurus.config.js` est en JavaScript avec `// @ts-check` et des annotations JSDoc
`@type`. C'est déjà mieux que rien — le fichier est dans le `include` du `tsconfig.json` et
`yarn lint:types` le vérifie — mais le JSDoc `@type` sur `config` ne contrôle que la forme
globale. Les blocs imbriqués les plus risqués (`presets[0][1]`, `themeConfig`) sont typés via
des annotations `@type` inline fragiles, faciles à oublier lors d'un ajout d'option, et qui
ne remontent pas une clé inconnue ou mal orthographiée.

## Solution

Renommer en `docusaurus.config.ts` et utiliser l'opérateur `satisfies` :

```ts
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config = {
  // ...
  presets: [
    ["classic", { /* ... */ } satisfies Preset.Options],
  ],
  themeConfig: { /* ... */ } satisfies Preset.ThemeConfig,
} satisfies Config;
```

`satisfies` valide chaque bloc contre son type exact **sans élargir** le type inféré : une
clé inconnue dans `themeConfig` ou une valeur du mauvais type devient une erreur `tsc`, ce
que la config actuelle laisse passer.

### Points à trancher pendant l'implémentation

- **Imports de plugins locaux.** La config importe six plugins/remark en `.cjs`
  (`./plugins/**/index.cjs`). Vérifier que `moduleResolution: "bundler"` +
  `esModuleInterop` (hérités de `@docusaurus/tsconfig`) les résolvent proprement en `.ts`,
  ou ajouter des `// @ts-expect-error` ciblés / un `.d.ts` par plugin.
- **`eslint.config.js`** : le glob `**/*.{ts,tsx}` va désormais matcher la config à la
  racine. Vérifier qu'aucune règle `typescript-eslint` ne casse (ex. `no-var-requires` si
  des `require` subsistent) et ajuster le bloc `ignores` si besoin.
- **`tsconfig.json`** : remplacer `"docusaurus.config.js"` par `"docusaurus.config.ts"` dans
  `include`.
- **Chaîne de build / scripts** : `grep -rn "docusaurus.config" .` — s'assurer qu'aucun
  script `.mjs` sous `scripts/` ne `require`/`import` le fichier par son ancien nom.
- Docusaurus charge nativement `docusaurus.config.ts` (support TS intégré) — aucun ajout de
  runtime nécessaire.

## Portée : les articles du blog qui documentent `docusaurus.config.js`

C'est le vrai coût de ce TODO, plus lourd que le rename lui-même.

**Inventaire au 2026-08-28** (`grep -rln "docusaurus\.config" blog/ .unpublished/`) :

- **14 articles publiés** citent `docusaurus.config.js` dans la prose (~50 occurrences
  littérales de la chaîne `docusaurus.config.js`) :
  - `blog/2023/11/03/site-creation/` (+ 3 snippets `files/docusaurus.config*.js`)
  - `blog/2024/02/07/docker-docusaurus-own-blog/`
  - `blog/2025/08/18/docusaurus-bluesky-comments/`
  - `blog/2025/08/21/docusaurus-override-img/`
  - `blog/2025/09/08/docusaurus-cards/`
  - `blog/2025/09/09/docusaurus-series/` (2 snippets)
  - `blog/2025/09/18/docusaurus-plugin-replace/`
  - `blog/2025/09/24/docusaurus-snippets/`
  - `blog/2025/11/23/docusaurus-ascii-art/`
  - `blog/2025/12/07/blog-post-feed/`
  - `blog/2026/02/02/docusaurus-tags/`
  - `blog/2026/07/13/docusaurus-easter-eggs/`
  - `blog/2026/07/27/reactions/`
  - `blog/2026/08/24/docusaurus-llms-txt/` (seul à avoir un fence `title="docusaurus.config..."`)
- **6 drafts** de `.unpublished/` : `copy-as-markdown`, `docusaurus-blog-map`, `docusaurus-pwa`,
  `removing-algolia-for-pagefind`, `tried_it` (+ `plan.md`).
- Chaque article a aussi un `files/docusaurus.config.js.eli5.json` co-localisé — régénéré par
  `yarn eli5`, pas à éditer à la main.

Deux natures de références, à traiter différemment :

1. **Fragments de config** (« ajoutez ceci à votre `themeConfig` », une entrée de `plugins`,
   un objet `navbar`). Ce sont des littéraux objet **identiques en JS et en TS** — rien à
   changer sur le fond, seulement d'éventuelles mentions du nom de fichier dans le texte.
2. **Fichier complet montré / entête du fichier / nom de fichier dans un `title=` de fence**.
   Là seulement, le passage `.js` → `.ts` (import `type`, `satisfies`) est visible.

**Décision à prendre** (voir question ouverte ci-dessous avant de trancher) :

- **A — découpler les articles du fichier interne du blog.** Les articles continuent
  d'enseigner `docusaurus.config.js` (le défaut de `create-docusaurus`, ce que la majorité
  des lecteurs ont). Le fait que *ce blog* utilise `.ts` en interne n'a pas à transparaître.
  Coût quasi nul : une note ponctuelle sur les 1–2 articles qui montrent le fichier entier.
- **B — montrer les deux** via des `<Tabs>` JS / TS sur les snippets « fichier complet ».
  Lourd sur 14 articles, beaucoup de duplication.
- **C — ne pas faire le rename du tout** (voir question ouverte : le gain `satisfies` est
  peut-être atteignable en restant en `.js`).

## Question ouverte : compatibilité JS / TSX pour les lecteurs

**Contexte du souci (Christophe, 2026-08-28) :** « Mes lecteurs actuels utilisent
probablement JS et pas TSX. Quand j'aurai réécrit les articles pour TS, ils ne pourront plus
faire ce que j'explique. Existe-t-il une possibilité d'être compatible JS / TSX ? »

### Réponses à creuser (à valider avant implémentation)

1. **Un projet Docusaurus a UN seul fichier de config, `.js` OU `.ts`, jamais les deux.**
   `create-docusaurus` scaffolde `.js` par défaut ; `--typescript` donne `.ts`. Donc un
   lecteur en `.js` qui copie-colle un fichier `.ts` entier : `import type` et `satisfies`
   sont des mots-clés TypeScript, invalides dans un `.js` exécuté par Node → **le
   copier-coller brut du fichier complet casse**. En revanche les *fragments* d'objet
   (points 1 ci-dessus) se collent tels quels des deux côtés.

2. **Piste principale — rester en `.js` et gagner quand même `satisfies` via JSDoc.**
   TypeScript ≥ 5.0 comprend le tag `@satisfies` dans un fichier `.js` sous `// @ts-check` :

   ```js
   // @ts-check
   /** @satisfies {import('@docusaurus/preset-classic').Options} */
   const presetOptions = { /* ... */ };

   /** @satisfies {import('@docusaurus/preset-classic').ThemeConfig} */
   const themeConfig = { /* ... */ };
   ```

   Ça apporte la vérification « clé inconnue / mauvais type sans élargissement » qui est
   toute la justification de ce TODO — **sans rename, sans toucher un seul article**, et le
   fichier reste copiable par un lecteur en `.js`. Le repo est déjà en `typescript@^5.7` et
   le fichier est déjà `// @ts-check`. **À tester en priorité : si ça suffit, ce TODO se
   réduit à "durcir le JSDoc" et la partie articles disparaît.**

3. **Si on migre quand même en `.ts`** : le contenu du blog n'a pas à suivre. Un article
   peut parfaitement enseigner `.js` alors que le repo qui le sert est en `.ts` — le lecteur
   ne voit jamais le fichier réel. Option A ci-dessus. Réserver les `<Tabs>` JS/TS aux 1–2
   articles qui affichent explicitement un fichier de config complet
   (`site-creation`, éventuellement `docusaurus-llms-txt`).

4. **À vérifier aussi :** est-ce que `create-docusaurus` a changé son défaut vers TS dans une
   version récente ? Si oui, l'argument « la majorité des lecteurs sont en JS » se périme, et
   l'option A devient « enseigner les deux » plutôt que « rester en JS ».

## Risque

Faible et local **côté code** : le pire cas est une résolution de module `.cjs` récalcitrante
qui demande un ou deux `.d.ts` de contournement. Aucun impact sur le site rendu.

Le vrai risque est **côté contenu** : réécrire 14 articles publiés pour un bénéfice de build
modeste est un mauvais ratio, surtout si la piste JSDoc `@satisfies` (question ouverte n°2)
rend le rename inutile. **Trancher la question ouverte AVANT de commencer.** À ne pas
entamer avant que la migration TSX des composants (`0106`) ait stabilisé la stack TS.

## Acceptance

- La question ouverte est tranchée et sa conclusion écrite ici (JSDoc `@satisfies` suffisant,
  ou rename `.ts` assumé avec stratégie articles).
- **Si rename :** `docusaurus.config.ts` remplace le `.js`, avec `satisfies Config` +
  `satisfies Preset.Options` / `satisfies Preset.ThemeConfig`.
- **Si JSDoc :** `docusaurus.config.js` reste, annoté `@satisfies`, et une clé bidon dans
  `themeConfig` fait échouer `yarn lint:types`.
- Dans les deux cas : `yarn lint:types`, `yarn lint:js`, `yarn build` passent ; ajouter
  volontairement une clé inconnue dans `themeConfig` fait échouer `yarn lint:types` (ce qui
  n'est pas le cas aujourd'hui).
- Les 14 articles + 6 drafts recensés ci-dessus sont soit inchangés (option A / JSDoc), soit
  adaptés selon la stratégie retenue — aucun snippet copiable ne devient invalide pour un
  lecteur resté en `.js`.
- `yarn start` et `yarn build` produisent un site identique à l'actuel (diff `build/` vide
  hors horodatages).
