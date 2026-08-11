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
