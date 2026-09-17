# 0120 — « Ask my blog » : un index de questions en français

- **Priority**: Medium — à traiter avant 0121 (décision de l'auteur, 2026-09-17)
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `scripts/generate-questions.mjs`, `scripts/check-questions-freshness.mjs`, `scripts/lib/i18n-eligibility.mjs`, `plugins/questions-index-plugin/index.cjs`, `src/components/AskMyBlog/utils.ts`, `src/components/AskMyBlog/`, `src/components/AskMyBlogWidget/`, `src/components/FaqThemePage/index.tsx`, `src/pages/faq.js`

## Problème

L'interface de « Ask my blog » est traduite (placeholder, titre, état vide — TODO 0119), mais
**les questions elles-mêmes restent en anglais** sur `/fr/`. Un lecteur francophone tape une
question en français et interroge un index rédigé en anglais : la recherche ne peut pas
fonctionner, et ce qui s'affiche est incompréhensible dans le contexte de la page.

C'est pire qu'une simple chaîne non traduite. L'interface promet une fonctionnalité qui, dans
cette locale, **ne rend pas le service annoncé**.

La partie AnythingLLM, initialement ici, est sortie dans **0125** : « Ask my blog » est une
recherche BM25 dans le navigateur et n'utilise pas AnythingLLM.

## Ce qui existe aujourd'hui

- `scripts/generate-questions.mjs` produit un `index.md.questions.json` par article, généré
  depuis le texte **anglais** par **Ollama en local** (`task-tiny:latest`, modèle 3B,
  `OLLAMA_URL`). Aucun appel à l'API Claude, aucun coût monétaire.
- `plugins/questions-index-plugin/index.cjs` agrège ces fichiers en un index par thème, écrit
  dans `generatedFilesDir` et servi en asset statique (`/questions-index.json`, chargé via
  `withBaseUrl`, donc déjà `/fr/questions-index.json` sous la locale).
- Le plugin est **déjà conscient de la locale** pour ses routes (`normalizeUrl([context.baseUrl,
  "faq", theme.key])`, corrigé dans 0119), mais pas pour son **contenu**.

## Solution

### Génération

- [ ] Emplacement : **option (a)** —
      `i18n/fr/docusaurus-plugin-content-blog/<rel>/index.md.questions.json`, à côté de la
      traduction. Cohérent avec l'arborescence i18n, et le plugin y trouve aussi le **titre
      traduit** dans le front matter voisin (voir plus bas). L'option (b), un suffixe de locale
      dans le nom, est écartée.
- [ ] `generate-questions.mjs` : accepter `--locale fr` et générer **depuis le fichier traduit**,
      pas depuis l'anglais. Les ancres des titres doivent venir du texte français — c'est ce que
      Docusaurus slugifie sous `/fr/`.
- [ ] **Prompt** : demander explicitement des questions en français. Le prompt actuel est écrit
      pour l'anglais.
- [ ] **Qualité du modèle** : `task-tiny` fait 3B. Générer d'abord **un seul** article, relire
      les questions avec l'auteur, et seulement ensuite les autres. Si le français est mauvais,
      tester un modèle plus gros via `OLLAMA_MODEL` avant de conclure.
- [ ] `check-questions-freshness.mjs` : étendre aux sidecars français.

### Filtre d'éligibilité

- [x] **Garde-fou écrit — ne pas réimplémenter le filtre.** `scripts/lib/i18n-eligibility.mjs`
      porte les conditions ; un générateur `--locale` doit **consommer ce module**.
- [ ] **Aligner `questionCandidates()` sur l'option (a)** : l'expression actuelle
      (`.questions.[a-z]{2}.json`) suppose l'option (b). Le sidecar localisé est à chercher sous
      `i18n/<locale>/docusaurus-plugin-content-blog/`.
- [ ] **Ajouter la 3e condition** (sidecar localisé absent ou périmé), comme `eli5Candidates()`
      le fait déjà. Aujourd'hui `questionCandidates()` ne vérifie que les deux premières.
      Le `sourceHash` du sidecar français porte sur le **fichier traduit**.

### Plugin

- [ ] `questions-index-plugin` : sous une locale autre que `en`
      (`context.i18n.currentLocale`), lire les articles et les sidecars dans
      `i18n/<locale>/docusaurus-plugin-content-blog/`. Si aucun sidecar localisé n'existe,
      **aucune question** — ne pas retomber sur l'anglais : le lecteur tape sa recherche en
      français.
- [ ] **Titres** : prendre `title` dans le front matter du fichier traduit.
- [ ] **Liens** : `permalinkFor()` renvoie `/blog/...` sans `/fr/`. Vérifier comment
      `AskMyBlog`, `AskMyBlogWidget`, `FaqThemePage` et `CommandPalette` construisent le lien.
      Si c'est un `href` brut, préfixer avec `context.baseUrl` (via `normalizeUrl`) côté plugin.
      Une question française doit ouvrir l'article français.
- [ ] **Noms des thèmes** : ils viennent de `blog/tags.yml`, en anglais. Décider : traduire via
      `code.json` (`translate()` côté composant, clé stable = `theme.key`) ou laisser tel quel.
      Recommandé : `code.json`, peu de libellés concernés.
- [ ] **Dédoublonnage** : `normalizeForDedupe()` fait `[^a-z0-9]+ → " "`, ce qui supprime
      les lettres accentuées (« créer » → « cr er »). Normaliser en NFD, retirer les diacritiques,
      puis filtrer.
- [ ] `getPathsToWatch()` : ajouter `i18n/*/docusaurus-plugin-content-blog/**/*.questions.json`
      et les `index.md` traduits.

### Recherche

- [ ] **Découpage en mots** : `tokenize()` dans `src/components/AskMyBlog/utils.ts` ne garde que
      `[a-z0-9]` — « déployer » devient `d` + `ployer`, la recherche française est cassée même
      avec des questions françaises. Passer à `\p{L}\p{N}` (flag `u`) **et** retirer les
      diacritiques (NFD) des deux côtés, pour que « deployer » trouve « déployer ».
      Attention à la regex CamelCase (`[a-z0-9][A-Z]`), à garder cohérente.
- [ ] Vérifier que le changement ne dégrade pas la recherche anglaise : quelques requêtes
      connues (`caesium`, `wordpress`, `php-cs-fixer`) avant/après.

### Page `/faq`

- [ ] `<TranslationCoverage />` dans `src/pages/faq.js` est déjà en place ; relire le
      commentaire qui l'accompagne une fois l'index localisé, il décrit l'état d'avant.

## Risque

**Qualité du français** produit par un modèle 3B — d'où la génération d'un seul article avant
le reste.

**Ne pas générer les questions françaises avant que l'article ne soit traduit** : elles seraient
produites depuis l'anglais et décriraient un texte que le lecteur ne voit pas.

**Volume** : 5 articles traduits aujourd'hui, donc environ 40 à 60 questions sur `/fr/faq`
contre plus de 2 000 en anglais. C'est attendu.

## Critère d'acceptation

- Sur `/fr/faq/`, chaque question affichée est en français et ouvre un article **traduit**, sous
  `/fr/`, avec son titre français.
- Aucune question anglaise ne subsiste dans l'index français, et un article non traduit n'y
  apparaît pas du tout.
- Dans « Ask my blog » sous `/fr/`, une requête accentuée ou non (« déployer », « deployer »)
  trouve la même question.
- La recherche anglaise renvoie les mêmes résultats qu'avant.
