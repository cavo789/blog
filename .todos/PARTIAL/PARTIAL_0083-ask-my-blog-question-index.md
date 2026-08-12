# 0083 — « Ask my blog » : index de questions généré par Ollama au build

- **Priority**: Medium
- **Batch**: blog-questions
- **Depends**: —
- **Files**: `scripts/generate-questions.mjs`, `scripts/check-questions-freshness.mjs`, `plugins/questions-index-plugin/index.cjs`, `src/pages/faq.js`, `src/components/AskMyBlog/index.js`, `package.json`

## Problème

Pagefind fait bien son travail sur le lexical : « PHP-CS-Fixer » est trouvé exactement,
instantanément, pour 0 Ko. Ce qu'il ne sait pas faire, c'est répondre à une **intention**
formulée avec un vocabulaire absent de l'article — « comment réduire la taille de mes
images » ne ramène pas l'article sur `dive`, parce que ni le titre ni le corps n'emploient
ces mots.

## Ce qu'on ne fait pas, et pourquoi

La solution réflexe — embeddings + recherche sémantique dans le navigateur — a été évaluée
et **écartée** :

- MiniLM-L6-v2 quantifié int8 pèse ~23 Mo (~90 Mo en fp32) à télécharger par le lecteur.
- Surtout, les embeddings denses sont **mauvais sur les tokens rares et exacts**.
  « PHP-CS-Fixer » est découpé en sous-tokens et ramène des articles sur PHPStan ou le
  linting en général. On paierait 23 Mo pour **dégrader** la recherche là où Pagefind
  excelle déjà.

Décision : le travail sémantique se fait **une fois, au build, sur la machine de l'auteur**
— pas 10 000 fois dans le CPU des lecteurs.

## Solution

### 1. Génération — `scripts/generate-questions.mjs`

Pour chaque article, Ollama en local (`qwen2.5:7b` ou `llama3.1:8b` suffisent : c'est de
l'extraction, pas du raisonnement) reçoit titre, description, headings et corps, et produit
8-12 questions **en anglais, telles qu'un développeur les taperait dans une barre de
recherche**, chacune associée à l'ancre `##`/`###` qui y répond.

Sortie JSON strict, validée avant écriture (une réponse malformée doit faire échouer
l'article, pas polluer l'index).

### 2. Stockage — `index.md.questions.json`, à côté de l'article

Même convention que les `.eli5.json` existants. Conséquences voulues :

- versionné dans git, donc diffable ;
- **éditable à la main** — ces questions deviennent du contenu public, il faut pouvoir
  corriger une formulation ratée sans relancer le modèle ;
- régénération incrémentale par hash de la source, sur le modèle de
  `scripts/check-eli5-freshness.mjs`.

Premier passage : ~45 min pour 248 articles. Ensuite quelques secondes par nouvel article.

### 3. Agrégation et exécution

Un plugin de build fusionne les ~2 500 paires `question → (article, ancre)` en un index
statique (~400 Ko, ~120 Ko gzippé).

Au runtime : **matching lexical** (BM25 / fuzzy) de la question du lecteur contre ces
2 500 questions. Aucun modèle, aucun téléchargement, instantané.

L'effet sémantique vient du fait que le modèle a écrit « how do I reduce my image size »
au build en lisant l'article sur `dive` — le pont entre l'intention et le vocabulaire de
l'article est **précalculé**, pas recalculé chez le lecteur. Et « PHP-CS-Fixer » marche
aussi, parce que les questions générées contiennent le terme littéral.

### 4. Deux surfaces d'exposition

- Le mode `?` de la palette ([[0084]]).
- Une **page `/faq` statique** listant les questions par thème. C'est du contenu indexable
  qui répond littéralement aux « Autres questions posées » de Google — l'index n'est donc
  pas seulement une fonctionnalité, c'est aussi un actif SEO.

## Risque

La qualité dépend du prompt. Un modèle bavard produira des questions génériques
(« What is Docker? ») qui pollueront l'index et la page FAQ. Prévoir dès le départ :

- un jeu de contrôle de ~10 articles relus à la main avant de lancer les 248 ;
- une contrainte explicite dans le prompt : la question doit être **spécifique à cet
  article**, pas au sujet en général ;
- un filtre de déduplication inter-articles (si 40 articles génèrent « How do I install
  Docker? », l'index est cassé).

## Notes

- Réutiliser le chargeur de corpus de `scripts/lib/` extrait par [[0081]].
- Ajouter les scripts `questions`, `questions:bulk`, `questions:check` dans `package.json`,
  en miroir des scripts `eli5:*`.

## Status — PARTIAL (2026-08-12)

### Done

- `scripts/generate-questions.mjs` : génération par article via Ollama local (`/api/chat`,
  `format` = JSON Schema strict), extraction des headings `##`/`###` avec anchors via
  `github-slugger` (même package que le pipeline MDX de Docusaurus, `{#custom-id}` honoré),
  validation stricte (JSON invalide ou < 5 questions valides → échec de l'article, rien n'est
  écrit). Mode `--all --dir --limit --dry-run` intégré au même fichier (pas de fichier bulk
  séparé, hors du `Files:` déclaré). Skip les articles `draft: true`.
- `scripts/check-questions-freshness.mjs` : miroir exact de `check-eli5-freshness.mjs`,
  détecte les sidecars `STALE`/`ORPHANED` via hash SHA1 (réutilise `scripts/lib/eli5-hash.mjs`).
- `plugins/questions-index-plugin/index.cjs` : agrège tous les `*.questions.json` en une
  donnée globale (`usePluginData`), dédoublonnage inter-articles strict (toute question dont
  le texte normalisé apparaît dans ≥ 2 articles est retirée — cf. section Risque), dégrade
  proprement si aucun sidecar n'existe encore. Enregistré dans `docusaurus.config.js`.
- `src/components/AskMyBlog/index.js` (+ `utils.js`, `styles.module.css`) : recherche
  lexicale BM25 pure (aucune dépendance ajoutée), 100% côté client sur l'index précalculé.
- `src/pages/faq.js` (+ `.module.css`) : `<AskMyBlog />` + liste statique complète groupée
  par `mainTag` (labels via `blog/tags.yml`/`src/data/tags.js`) — rendue en SSR, donc
  indexable même sans JS, conformément à l'objectif SEO du TODO.
- `package.json` : scripts `questions` / `questions:bulk` / `questions:check` ajoutés ;
  `github-slugger` promu en dépendance directe (`devDependencies`, déjà présent en transitif).
- **Modèle** : `qwen2.5:7b`/`llama3.1:8b` (suggérés par le TODO) ne sont pas installés sur
  l'instance Ollama de ce devcontainer (`172.17.0.1:11434`). Comparé en pratique
  `task-tiny:latest` (Qwen2.5-Coder 3B, ~5-9s/article) contre `qwen3.6:35b-a3b` (36B MoE,
  ~79s/article pour un article court) : qualité comparable, mais le modèle 36B est ~10x trop
  lent pour tenir le budget de ~45 min/248 articles visé par le TODO. `task-tiny:latest` est
  donc le modèle par défaut (`OLLAMA_MODEL` reste surchargeable).
- **Pilote de 12 articles** généré et relu à la main (le lot de contrôle demandé par la
  section Risque) : qualité correcte, anchors vérifiés exacts (headings réels, y compris
  `PHP-CS-Fixer` → `php-cs-fixer`), un seul defect trouvé et corrigé pendant le pilote
  (`headingIndex` hors bornes sur un article sans aucun heading → items droppés à tort ;
  fix : clamp vers "général" au lieu de drop, cf. commentaire dans
  `toValidatedQuestions()`).
- **Bout en bout vérifié réellement** : `yarn questions:bulk`, `yarn questions:check`,
  `yarn build` (SSR de `/faq` contient bien le texte des questions, vérifié par grep sur le
  HTML généré), et une recherche live testée au clavier via Playwright sur `yarn start`
  (requêtes "switch PHP version docker", "keepass putty" → résultats pertinents en tête,
  requête absurde → état vide correct).
- `yarn lint && yarn format:check && yarn build` : verts (aucune erreur, warnings
  pré-existants sans rapport avec ce chantier).

### Not done

- **Génération complète des ~248 articles** (`yarn questions:bulk` sans `--limit`) n'a
  volontairement pas été lancée. La section Risque du TODO demande explicitement un lot
  pilote relu à la main *avant* le lot complet — c'est fait (12 articles), mais lancer les
  236 restants (~20-30 min avec `task-tiny`) publierait d'un coup ~2000 questions générées
  par un modèle 3B non explicitement validé par l'auteur (substitution de modèle par rapport
  à ceux suggérés dans le TODO, faute de disponibilité locale) sans second passage de
  relecture. À lancer par l'auteur : `yarn questions:bulk`, puis relire (au moins par
  sondage) avant de committer les sidecars restants.
  **Reason:** décision délibérée de ne pas publier du contenu public en masse sans revue
  humaine du choix de modèle — cohérent avec la philosophie "first draft, reviewed before
  it's trusted" déjà appliquée aux autres scripts Ollama de ce blog.
- **Mode `?` de la palette de commandes** ([[0084]]) n'est pas câblé — 0084 n'est pas encore
  implémenté. `AskMyBlog` est conçu pour être réutilisable tel quel par 0084 le moment venu
  (lit son propre `usePluginData`, aucune prop requise).
  **Reason:** hors scope de ce TODO (0083 ne couvre que la génération + la page `/faq`).
- **Filtre de déduplication inter-articles** implémenté au niveau agrégation
  (`questions-index-plugin`) uniquement — pas de re-génération automatique de l'article
  perdant après dédoublonnage (le TODO n'exige pas ce niveau d'automatisation, mentionné
  pour transparence).
  **Reason:** portée suffisante pour l'objectif du TODO (l'index final ne contient jamais de
  doublon inter-articles) ; une boucle de re-génération ciblée serait un raffinement futur.
