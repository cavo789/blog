---
slug: docusaurus-eli5-snippet-tooltips
title: "Tooltips de code assistés par l'IA dans Docusaurus — Explique-moi comme à un enfant de cinq ans"
date: 2026-07-20
authors: [christophe]
image: /img/v2/ai_snippets.webp
description: Ajoutez des tooltips au survol sur les lignes de code délicates de votre blog Docusaurus — propulsés par Claude, générés au moment du build, zéro latence côté navigateur. On couvre le plugin remark, le renderer React et le script CLI.
series: Creating Docusaurus components
mainTag: component
tags:
  - docusaurus
  - component
  - react
  - ai
language: fr
ai_assisted: true
blueskyRecordKey: 3mqyc3vlxy22p
---
<!-- markdownlint-disable MD025 -->

![Tooltips de code assistés par l'IA dans Docusaurus — Explique-moi comme à un enfant de cinq ans](/img/v2/ai_snippets.webp)

<TLDR>
Votre Dockerfile est limpide pour vous. Pour un lecteur débutant, `RUN npm ci --omit=dev` est du charabia. Cet article ajoute un badge `?` sur les lignes délicates de vos blocs de code `<Snippet>`. Au survol, une explication en langage simple apparaît, générée une seule fois par Claude et stockée dans un fichier JSON — pas de clé API dans le navigateur, pas de latence au survol. Le système compte trois parties : un script Node.js qui appelle l'API Claude et écrit un fichier `.eli5.json`, une extension d'une ligne à votre plugin `remark-snippet-loader` existant qui injecte automatiquement les annotations, et un renderer React personnalisé dans le composant `Snippet` qui superpose les badges. Le workflow de l'auteur : lancer le script, committer le JSON, terminé.
</TLDR>

Quand vous écrivez un tutoriel destiné à des développeurs en apprentissage, il y a toujours un écart entre ce que vous supposez qu'ils savent et ce qu'ils savent réellement. Vous pourriez ajouter des explications inline — mais ça alourdit l'article. Vous pourriez ajouter un glossaire — mais les lecteurs le sautent. Ce que vous voulez vraiment, c'est du contexte optionnel, à la demande, qui apparaît exactement là où le lecteur bloque.

C'est ce que fait cette fonctionnalité. Un petit badge `?` flotte au bord droit des lignes annotées. Survolez-le, et un tooltip explique la ligne en langage simple. Éloignez la souris, et le code redevient propre.

<!-- truncate -->

## À quoi ça ressemble {#what-it-looks-like}

```plaintext
  ┌─ Dockerfile ─────────────────────────────────────────── ▾ ─┐
  │  1  FROM node:20-alpine                               [?]  │
  │  2                                                         │
  │  3  WORKDIR /app                                           │
  │  4  COPY package*.json ./                             [?]  │
  │  5  RUN npm ci --omit=dev                             [?]  │
  │  6                                                         │
  │  7  COPY . .                                               │
  │  8  EXPOSE 3000                                       [?]  │
  │  9  CMD ["node", "server.js"]                         [?]  │
  └────────────────────────────────────────────────────────────┘
             ↓ hover [?] on line 5
  ┌──────────────────────────────────────────────────────────────┐
  │  npm ci installs exactly what's in package-lock.json.        │
  │  --omit=dev skips dev tools — keeps your image smaller.      │
  └──────────────────────────────────────────────────────────────┘
```

Les badges `?` n'apparaissent que sur les lignes que Claude a jugées non triviales. Les lignes vides, les accolades fermantes et les affectations évidentes sont ignorées automatiquement.

## Architecture {#architecture}

Le système comporte trois pièces mobiles qui fonctionnent indépendamment :

```plaintext
  ① scripts/generate-eli5.mjs          (run once, by the author)
        ↓  calls Claude API
        ↓  writes blog/2026-xx-xx-my-post/files/Dockerfile.eli5.json
        ↓  commit that file

  ② plugins/remark-snippet-loader       (runs at build time, automatically)
        ↓  reads Dockerfile
        ↓  finds Dockerfile.eli5.json alongside it
        ↓  injects eli5json="..." prop into <Snippet>

  ③ src/components/Snippet/index.tsx   (runs in the browser)
        ↓  parses eli5json prop
        ↓  renders Prism-highlighted code line by line
        ↓  overlays ? badges with tooltips
```

La décision de conception clé, c'est que **les appels à l'IA ont lieu au moment de la rédaction, pas au moment de la lecture** — exactement le même pattern que celui utilisé pour <Link to="/blog/gemini-tldr">générer mes résumés TL;DR avec Gemini</Link>. Les fichiers `.eli5.json` sont committés dans git et embarqués avec le site comme n'importe quel autre asset statique. Les lecteurs n'attendent jamais un appel API, et votre clé API ne quitte jamais votre machine.

## Étape 1 — Le script d'annotation {#step-1--the-annotation-script}

Créez `scripts/generate-eli5.mjs`. Ce script lit un fichier source, l'envoie à Claude avec un prompt qui demande des explications ligne par ligne, et écrit le résultat dans un fichier JSON à côté de la source.

<Snippet filename="scripts/generate-eli5.mjs" source="scripts/generate-eli5.mjs" />

Quelques détails à noter :

- **La détection du langage** reproduit le mapping de `remark-snippet-loader`, pour que les deux composants soient toujours d'accord sur le langage d'un fichier.
- **Le prompt** indique à Claude d'ignorer les lignes triviales et de ne renvoyer qu'un objet JSON. Le message `system` lui impose de produire du JSON pur ; la température est maintenue basse pour des explications factuelles et cohérentes.
- **Le nettoyage du JSON** vérifie que toutes les clés sont des chaînes de chiffres dans l'intervalle attendu et que toutes les valeurs sont des chaînes non vides, pour qu'une réponse malformée de Claude ne puisse pas casser le build.
- **Génération incrémentale** : si le `.eli5.json` existe déjà, le script s'arrête sans appeler l'API. Utilisez `--force` pour régénérer.

### Utilisation {#usage}

<Terminal source="./files/usage.sh" wrap={true} typewriter />

Vous pouvez aussi ajouter un alias pratique dans `package.json` :

```json
"scripts": {
  "eli5": "node scripts/generate-eli5.mjs",
  "eli5:bulk": "node scripts/bulk-eli5.mjs"
}
```

L'appel devient alors `yarn eli5 blog/2026-01-01-my-post/files/Dockerfile`.

### Le format de sortie {#the-output-format}

Le script écrit un fichier comme celui-ci :

<Snippet source="./files/output_format.json" defaultOpen={false} />

Seules les lignes annotées apparaissent. Le consommateur (le plugin remark et le composant React) considère les lignes absentes comme n'ayant pas de badge.

## Étape 2 — Le script par lot {#step-2--the-batch-script}

Quand vous avez beaucoup d'articles, lancer le générateur fichier par fichier est fastidieux. `scripts/bulk-eli5.mjs` parcourt tout votre répertoire `blog/`, trouve chaque référence `<Snippet source="...">`, résout le path et génère le `.eli5.json` en une seule passe.

<Snippet filename="scripts/bulk-eli5.mjs" source="scripts/bulk-eli5.mjs" />

### Référence des options {#options-reference}

| Flag | Défaut | Description |
| --- | --- | --- |
| `--dir <path>` | `blog/` | Répertoire à parcourir (relatif à la racine du projet) |
| `--force` | off | Régénère même si `.eli5.json` existe déjà |
| `--dry-run` | off | Montre ce qui se passerait, sans appel API |

## Comment fonctionne le script par lot {#how-the-bulk-script-works}

Avant de passer au workflow de migration, il est utile de comprendre exactement ce que fait le script — et ce qu'il ne fait pas.

### Comment il trouve les fichiers à annoter {#how-it-finds-files-to-annotate}

Le script lit chaque fichier `.md` et `.mdx` sous `--dir` (par défaut : `blog/`), et cherche dans chacun les occurrences de `<Snippet source="...">` à l'aide d'une expression régulière. Pour chaque correspondance, il résout le chemin source en chemin absolu, déduplique (un fichier référencé dans plusieurs articles n'est traité qu'une fois), puis traite la liste.

Il n'annote **pas** les blocs de code inline — uniquement les appels `<Snippet>` qui référencent un fichier externe via `source="./files/..."`.

### La règle de saut — idempotent par conception {#the-skip-rule--idempotent-by-design}

Pour chaque fichier source, le script vérifie d'abord si `<source-file>.eli5.json` existe déjà :

- **Le fichier existe → `⏭ skipped`** — zéro appel API, zéro coût, instantané.
- **Le fichier manque → `✅ N annotations`** — un appel API vers Claude, fichier écrit.

Ce qui signifie :

- Vous pouvez lancer `yarn eli5:bulk` autant de fois que vous voulez. Seuls les fichiers dont le `.eli5.json` manque déclencheront un appel API.
- **La première exécution** est la seule qui coûte de l'argent (pour les articles existants). Toutes les suivantes sont gratuites.
- Si vous ajoutez un nouvel article avec un `<Snippet>` le mois prochain, relancer `yarn eli5:bulk` n'annotera que ce nouveau fichier.
- Si le script est interrompu (erreur réseau, Ctrl+C), relancez-le simplement — les fichiers déjà générés sont ignorés, seuls les restants sont traités.

N'utilisez `--force` que lorsque vous avez volontairement modifié un fichier source et voulez régénérer ses annotations à zéro.

## Annoter vos articles existants {#annotating-your-existing-articles}

Si vous avez un blog avec beaucoup d'articles — disons 240 — vous ne voulez pas lancer le générateur fichier par fichier. Voici le workflow de migration recommandé.

### Phase 1 — Auditer avec dry-run {#phase-1--audit-with-dry-run}

Avant de toucher à l'API, faites-vous une idée claire de ce que vous avez. Lancez le script par lot avec `--dry-run` sur tout votre blog :

<Terminal  wrap={true} typewriter>
$ node scripts/bulk-eli5.mjs --dry-run
</Terminal>

C'est instantané — aucun appel API n'est fait. La sortie montre chaque fichier source référencé par un `<Snippet source="...">` dans un article, et vous dit si son `.eli5.json` existe déjà ou doit encore être généré :

```plaintext
🔍 Scanning blog/ for Snippet usages...
Found 47 unique source file(s) across 240 posts.

  [SKIP]     blog/2025/03/12-wsl2-tricks/files/wsl.conf
             ← blog/2025/03/12-wsl2-tricks/index.md
  [GENERATE] blog/2025/04/05-docker-compose/files/compose.yaml
             ← blog/2025/04/05-docker-compose/index.md
  [GENERATE] blog/2025/04/05-docker-compose/files/Dockerfile
             ← blog/2025/04/05-docker-compose/index.md
  [GENERATE] blog/2025/06/20-zsh-config/files/.zshrc
             ← blog/2025/06/20-zsh-config/index.md
  ...

──────────────────────────────────────
Generated: 0  Skipped: 3  Errors: 0
```

Deux choses à remarquer ici :

1. **Seulement 47 fichiers sources pour 240 articles.** La plupart des articles n'utilisent pas du tout `<Snippet source="...">` — ils utilisent des blocs de code inline. Le script par lot les ignore automatiquement. Vous n'annotez pas 240 fichiers ; vous annotez seulement les articles qui utilisent déjà le composant Snippet avec un fichier source externe.

2. **Les labels `SKIP` / `GENERATE`** vous indiquent d'un coup d'œil quels fichiers ont déjà une annotation et lesquels en attendent une. Ça rend le dry-run utile aussi après des exécutions partielles.

Sauvegardez la sortie du dry-run si vous voulez garder une trace d'audit :

<Terminal wrap={true} typewriter>
$ node scripts/bulk-eli5.mjs --dry-run > eli5-audit.txt
</Terminal>

### Phase 2 — Estimer le coût {#phase-2--estimate-the-cost}

`claude-haiku-4-5-20251001` coûte une fraction de centime par appel. Un fichier source typique (20 à 60 lignes) coûte environ **0,0002 à 0,001 $**. Multipliez par le nombre d'entrées `[GENERATE]` de votre dry-run.

Pour 47 fichiers sources, vous êtes sous les **0,05 $** au total. Même si chacun de vos 240 articles avait un fichier source, le coût total resterait sous **0,25 $**.

### Phase 3 — Générer par périmètre {#phase-3--generate-by-scope}

Vous pouvez traiter tout le blog en une commande, ou restreindre à une année ou un mois précis. Tous les chemins sont relatifs à la racine du projet.

**Tout traiter d'un coup :**

<Terminal wrap={true} typewriter>
$ node scripts/bulk-eli5.mjs
</Terminal>

Le script s'exécute séquentiellement (un appel API à la fois), donc aucun risque d'atteindre les limites de débit. Sur une connexion classique, 47 fichiers prennent environ deux minutes.

**Traiter une seule année :**

<Terminal wrap={true} typewriter>
node scripts/bulk-eli5.mjs --dir blog/2025
node scripts/bulk-eli5.mjs --dir blog/2026
</Terminal>

**Traiter un seul mois :**

<Terminal wrap={true} typewriter>
node scripts/bulk-eli5.mjs --dir blog/2026/06
</Terminal>

**Traiter un seul dossier d'article :**

<Terminal wrap={true} typewriter>
node scripts/bulk-eli5.mjs --dir blog/2025/04/05-docker-compose
</Terminal>

Cette dernière forme équivaut à lancer `generate-eli5.mjs` individuellement pour chaque fichier source de cet article — mais le script par lot gère la déduplication automatiquement (si le même fichier source est référencé deux fois dans le même article, il n'est généré qu'une fois).

### Phase 4 — À quoi ressemble la sortie pendant l'exécution {#phase-4--what-the-output-looks-like-while-running}

```plaintext
🔍 Scanning blog/2025 for Snippet usages...
Found 31 unique source file(s) across 140 posts.

  📄 blog/2025/04/05-docker-compose/files/compose.yaml ... ✅ 6 annotations
  📄 blog/2025/04/05-docker-compose/files/Dockerfile ... ✅ 5 annotations
  📄 blog/2025/04/12-zsh-setup/files/.zshrc ... ✅ 9 annotations
  📄 blog/2025/05/01-devcontainer/files/devcontainer.json ... ✅ 7 annotations
  📄 blog/2025/06/20-fzf/files/fzf-preview.sh ... ⏭  skipped
  ...

──────────────────────────────────────
Generated: 30  Skipped: 1  Errors: 0
```

Chaque ligne vous dit combien de lignes Claude a décidé d'annoter. Un fichier avec `0 annotations` signifierait que Claude n'a rien trouvé de non trivial — ça peut arriver pour des fichiers très courts ou très simples. Un fichier avec `⏭  skipped` avait déjà un `.eli5.json` issu d'une exécution précédente.

**Le script peut être interrompu et relancé sans risque.** S'il s'arrête en cours de route (erreur réseau, erreur API, Ctrl+C), relancez-le. Les fichiers déjà générés afficheront `⏭  skipped` ; seuls les restants seront traités.

### Phase 5 — Gérer les erreurs {#phase-5--handle-errors}

Si un fichier échoue (Claude renvoie du JSON malformé, timeout réseau), ça affiche :

```plaintext
  📄 blog/2025/04/05-docker-compose/files/Makefile ... ❌ Invalid JSON from Claude
```

Le script continue avec le fichier suivant et se termine avec le code `1` (pour qu'un pipeline CI puisse le détecter). Pour ne réessayer que le fichier en échec :

<Terminal wrap={true} typewriter>
node scripts/generate-eli5.mjs blog/2025/04/05-docker-compose/files/Makefile
</Terminal>

Si le même fichier échoue de nouveau, ajoutez `--force` pour régénérer avec un nouvel appel API.

### Phase 6 — Vérifier un échantillon {#phase-6--verify-a-sample}

Avant de committer, ouvrez un article avec `yarn start` et vérifiez que les badges `?` apparaissent sur les bonnes lignes. Inspectez un ou deux fichiers `.eli5.json` pour confirmer la qualité des explications.

:::tip Aucun build nécessaire — le mode dev fonctionne d'emblée
Les badges `?` sont injectés par le plugin remark pendant le build MDX, pas à l'exécution. Autrement dit, `yarn start` (port 3000) et `yarn build` produisent des résultats identiques pour les annotations ELI5. Vous n'avez jamais besoin de lancer un build complet juste pour prévisualiser les tooltips.

Si vous générez un nouveau `.eli5.json` alors que le serveur de dev tourne déjà, enregistrez le fichier `.md` correspondant pour relancer le build MDX — les badges apparaîtront au prochain hot reload.
:::

Si une explication est fausse ou trop verbeuse, éditez directement le fichier JSON — c'est du texte brut, aucune régénération nécessaire.

### Phase 7 — Committer {#phase-7--commit}

Committez les fichiers `.eli5.json` à côté des fichiers sources qu'ils annotent. C'est volontaire : le CI/CD n'a pas besoin de `ANTHROPIC_API_KEY` puisque les annotations sont pré-générées et stockées dans git.

<Terminal wrap={true} typewriter>
# Stage all newly generated annotation files {#stage-all-newly-generated-annotation-files}
git add blog/**/*.eli5.json

git commit -m "feat: add ELI5 annotations for existing Snippet blocks"
</Terminal>

### Résumé — la migration en cinq commandes {#summary--migration-in-five-commands}

<Terminal wrap={true} typewriter>
# 1. Preview scope (no API calls) {#1-preview-scope-no-api-calls}
node scripts/bulk-eli5.mjs --dry-run

# 2. Generate by year (repeat for each year) {#2-generate-by-year-repeat-for-each-year}

node scripts/bulk-eli5.mjs --dir blog/2025
node scripts/bulk-eli5.mjs --dir blog/2026

# 3. Verify in the browser {#3-verify-in-the-browser}

yarn start

# 4. Commit {#4-commit}

git add blog/**/*.eli5.json && git commit -m "feat: ELI5 annotations"
</Terminal>

## Étape 3 — Étendre le plugin remark {#step-3--extend-the-remark-plugin}

Votre `remark-snippet-loader` lit déjà le fichier source et injecte les props `code` et `lang` dans le nœud `<Snippet>` au moment du build. Si vous n'avez jamais écrit un tel plugin, mon article <Link to="/blog/docusaurus-plugin-replace">search&replace plugin for Docusaurus</Link> explique l'anatomie d'un plugin remark depuis zéro. Ajoutez onze lignes pour injecter aussi les annotations ELI5 quand un `.eli5.json` existe à côté du fichier source.

Dans `plugins/remark-snippet-loader/index.cjs`, après le bloc qui ajoute l'attribut `lang` :

<Snippet filename="./files/extend_remark.js"  source="./files/extend_remark.js" defaultOpen={false} />

Les annotations sont sérialisées en chaîne JSON (prop `eli5json`) pour rentrer dans le modèle d'attributs MDX sans devoir construire un nœud d'expression estree. Le composant `Snippet` reparse cette chaîne en objet avec `JSON.parse`.

Cette approche signifie que **l'auteur n'a pas une seule ligne de MDX à changer**. Ajoutez le fichier `.eli5.json`, relancez le build — les tooltips apparaissent automatiquement.

## Étape 4 — Mettre à jour le composant Snippet {#step-4--update-the-snippet-component}

Le <Link to="/blog/docusaurus-snippets">Snippet component</Link> demande deux changements : un nouveau sous-composant `Eli5CodeBlock` qui affiche le code ligne par ligne avec les badges, et une petite mise à jour de la fonction principale `Snippet` pour parser `eli5json` et router vers le nouveau renderer.

<Snippet filename="src/components/Snippet/index.tsx" source="src/components/Snippet/index.tsx" />

### Comment fonctionne le renderer {#how-the-renderer-works}

Quand `eli5json` est présent et que `code` est une chaîne, le composant appelle directement `Prism.highlight()` au lieu de déléguer au `<CodeBlock>` de Docusaurus. Prism est déjà embarqué par Docusaurus — l'importer est sans risque et n'a aucun coût sur la taille du bundle.

Le HTML colorisé est découpé aux retours à la ligne. Chaque ligne devient un `<div>` contenant :

- Un `<span>` avec le code colorisé (via `dangerouslySetInnerHTML` — sans risque puisque Prism n'entoure les tokens que d'éléments `<span>`)
- Soit un bouton `?` (si la ligne a une explication), soit un placeholder invisible de même largeur (pour garder toutes les lignes alignées)

Le tooltip apparaît au survol via une paire `onMouseEnter`/`onMouseLeave` sur le wrapper du badge, et bascule au clic pour l'accès clavier/mobile. Les handlers focus/blur le rendent accessible au clavier sans acrobaties ARIA supplémentaires.

Quand `eli5json` est absent (le cas normal), le composant se comporte exactement comme avant — `<CodeBlock>` est utilisé, rien ne change.

## Étape 5 — Ajouter le CSS {#step-5--add-the-css}

Ajoutez ces classes à `src/components/Snippet/styles.module.css` :

<Snippet filename="src/components/Snippet/styles.module.css" source="./files/styles.module.css" defaultOpen={false} />

Le `eli5_badge_placeholder` mérite une explication : chaque ligne du bloc de code doit avoir un élément de droite de même largeur, qu'elle ait un badge ou non. Sans le placeholder, les lignes sans `?` seraient plus étroites et le code paraîtrait irrégulier.

## Workflow de l'auteur (de bout en bout) {#author-workflow-end-to-end}

Pour chaque article de blog contenant des blocs `<Snippet>`, le workflow après une première publication est :

<Terminal wrap={true} typewriter>

# 1. Write your post. Place source files in ./files/ as usual {#1-write-your-post-place-source-files-in-files-as-usual}

# Example: blog/2026-07-01-my-docker-post/files/Dockerfile {#example-blog2026-07-01-my-docker-postfilesdockerfile}

# 2. Generate ELI5 annotations {#2-generate-eli5-annotations}

$ yarn eli5 blog/2026-07-01-my-docker-post/files/Dockerfile

# 3. Preview locally — the ? badges appear automatically {#3-preview-locally--the--badges-appear-automatically}

$ yarn start

# 4. Commit the source file and the annotation file {#4-commit-the-source-file-and-the-annotation-file}

$ git add blog/2026-07-01-my-docker-post/files/Dockerfile
$ git add blog/2026-07-01-my-docker-post/files/Dockerfile.eli5.json

# 5. Build and deploy as usual — no ANTHROPIC_API_KEY needed in CI {#5-build-and-deploy-as-usual--no-anthropic_api_key-needed-in-ci}

$ yarn build
</Terminal>

Si le fichier source change après publication, régénérez avec `--force` :

<Terminal wrap={true} typewriter>
$ yarn eli5 blog/2026-07-01-my-docker-post/files/Dockerfile --force
</Terminal>

## Mise en place de l'environnement {#environment-setup}

### Étape 1 — Créer un compte Anthropic et obtenir une clé API {#step-1--create-an-anthropic-account-and-get-an-api-key}

:::info L'accès API est distinct de Claude Pro
Si vous avez déjà un abonnement **Claude Pro** (claude.ai), il ne couvre que l'interface de chat — il n'inclut pas l'accès API. Les scripts de génération utilisent l'**API Anthropic**, un produit séparé, à l'usage, facturé à la consommation de tokens. Il vous faut un compte distinct sur `console.anthropic.com` avec un solde de crédit. La bonne nouvelle : annoter 240 articles avec `claude-haiku-4-5` coûte quelques centimes au total (Haiku est le modèle Claude le moins cher, à 1 $ par million de tokens en entrée, et chaque fichier source ne fait que quelques centaines de tokens).
:::

Rendez-vous sur **[https://console.anthropic.com](https://console.anthropic.com)** et inscrivez-vous (ou connectez-vous si vous avez déjà un compte). Une fois connecté :

1. Cliquez sur **Settings** dans la barre latérale gauche (ou allez directement sur `https://console.anthropic.com/settings/keys`).
2. Sélectionnez **API Keys** dans le menu des paramètres.
3. Cliquez sur **Create Key**.
4. Donnez un nom à votre clé (par exemple `docusaurus-eli5`) pour pouvoir l'identifier plus tard.
5. **Copiez la clé immédiatement** — elle n'est affichée qu'une fois et ne peut pas être récupérée après la fermeture de la boîte de dialogue. Elle ressemble à `sk-ant-api03-...`.

Stockez la clé en lieu sûr (un gestionnaire de mots de passe fait très bien l'affaire). Si vous la perdez, il faudra en créer une nouvelle.

:::caution N'exposez jamais votre clé API
Ne collez pas votre clé dans du code source, ne la committez pas dans git, ne la partagez pas publiquement. Une clé fuitée peut servir à faire des appels API facturés sur votre compte.
:::

Il vous faudra aussi un **solde de crédit de facturation** pour passer des appels API. Dans la console Anthropic, allez dans **Settings → Billing** et ajoutez un petit crédit (quelques dollars suffisent largement pour annoter des centaines d'articles avec Haiku — le coût est de l'ordre d'une fraction de centime par fichier).

### Étape 2 — Ajouter la clé à votre projet {#step-2--add-the-key-to-your-project}

Créez un fichier `.env` à la racine de votre projet Docusaurus (à côté de `package.json`) :

```dotenv
# .env — do not commit this file
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Assurez-vous ensuite que `.env` est dans votre `.gitignore` :

<Terminal wrap={true} typewriter>
$ echo ".env" >> .gitignore
</Terminal>

La clé n'est lue par les scripts de génération qu'au moment de la rédaction. Elle n'est **jamais** incluse dans le site généré, ni nécessaire en CI — les fichiers d'annotation `.eli5.json` sont committés dans git à côté des fichiers sources.

### Étape 3 — Installer les dépendances {#step-3--install-dependencies}

`dotenv` et `@anthropic-ai/sdk` sont déjà présents comme dépendances dans ce projet. Si vous partez d'un projet Docusaurus neuf, installez-les en dépendances de développement :

<Terminal wrap={true} typewriter>
$ yarn add --dev @anthropic-ai/sdk dotenv
</Terminal>

## Limitations connues {#known-limitations}

- **Nécessite la prop `source`** — le renderer ELI5 ne s'active que lorsque le plugin remark injecte `code` sous forme de chaîne (c'est-à-dire quand vous utilisez `source="./files/myfile"`). Les snippets qui utilisent des `children` inline (blocs de code dans le MDX) ne sont pas annotés.
- **Annotations obsolètes** — si vous modifiez fortement un fichier source après avoir généré `.eli5.json`, les annotations peuvent ne plus correspondre aux lignes. Lancez `--force` pour rafraîchir. Il n'y a pas de détection automatique d'obsolescence.
- **Lignes longues** — si une ligne se replie visuellement (scroll en overflow-x), le badge `?` reste à la fin de la ligne logique, potentiellement hors écran. C'est un cas limite pour la plupart des types de fichiers (Dockerfile, YAML, bash) où les lignes sont courtes.
- **Couverture des langages Prism** — `Prism.highlight()` retombe sur du texte brut pour les langages non enregistrés dans le bundle Prism de Docusaurus. Les types de fichiers les plus courants (Dockerfile, YAML, Bash, JSON, JavaScript) sont tous dans le bundle par défaut.

## Quel modèle Claude utiliser {#what-claude-model-to-use}

Les scripts utilisent `claude-haiku-4-5-20251001`, le modèle Claude le plus rapide et le moins cher. Pour un Dockerfile de 20 lignes, un appel coûte une fraction de centime et répond en moins de deux secondes. La qualité suffit pour l'usage ELI5 — des explications courtes et factuelles de constructions bien connues.

Si vous voulez des explications plus nuancées (par exemple pour des pipelines shell complexes ou des ancres YAML avancées), passez à `claude-sonnet-4-6` dans les scripts. Le prompt et le format de sortie restent identiques.

## Prolonger l'idée {#extending-the-idea}

Quelques pistes à explorer une fois la fonctionnalité de base en place :

- **Niveaux de difficulté** — le prompt pourrait demander à Claude de taguer chaque explication en `beginner` / `intermediate` / `advanced`, et le badge pourrait changer de couleur en conséquence (`?` en vert/jaune/rouge).
- **Localisation** — passez une prop `lang` au script et ajoutez `Please respond in French` au prompt système. Le format `.eli5.json` a déjà un champ `lang` pour ça.
- **Détection d'obsolescence** — ajoutez un champ `sourceHash` (SHA-256 du fichier source au moment de la génération) dans `.eli5.json`. Le plugin remark peut le comparer au hash actuel du fichier et émettre un avertissement pendant le build en cas de divergence.
- **Hook de régénération automatique** — un pre-hook `yarn build` (`"prebuild": "node scripts/bulk-eli5.mjs"`) régénérerait toutes les annotations manquantes avant chaque build. Combiné avec `ANTHROPIC_API_KEY` dans les secrets CI, ça rend la génération d'annotations entièrement automatique.
