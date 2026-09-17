# 0120 — « Ask my blog » : un index de questions en français

- **Priority**: Medium — dépend de la traduction des articles, donc du rythme du lot I de 0119
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `blog/2026/08/17/anythingllm-chat-with-your-docs/files/anythingllm-index.sh`, `scripts/generate-questions.mjs`, `scripts/check-questions-freshness.mjs`, `plugins/questions-index-plugin/index.cjs`, `src/components/AskMyBlog/`, `src/components/AskMyBlogWidget/`, `src/pages/faq.js`

## Problème

L'interface de « Ask my blog » est traduite (placeholder, titre, état vide — TODO 0119), mais
**les questions elles-mêmes restent en anglais** sur `/fr/`. Un lecteur francophone tape une
question en français et interroge un index rédigé en anglais : la recherche ne peut pas
fonctionner, et ce qui s'affiche est incompréhensible dans le contexte de la page.

C'est pire qu'une simple chaîne non traduite. L'interface promet une fonctionnalité qui, dans
cette locale, **ne rend pas le service annoncé**.

## Ce qui existe aujourd'hui

- `scripts/generate-questions.mjs` produit un `index.md.questions.json` par article, généré
  depuis le texte **anglais** via l'API Claude.
- `plugins/questions-index-plugin/index.cjs` agrège ces fichiers en un index par thème, écrit
  dans `generatedFilesDir` et servi en asset statique.
- Le plugin est **déjà conscient de la locale** pour ses routes (`normalizeUrl([context.baseUrl,
  "faq", theme.key])`, corrigé dans 0119), mais pas pour son **contenu**.

## Solution

- [ ] Décider où vivent les questions françaises. Deux options :
      **(a)** `i18n/fr/docusaurus-plugin-content-blog/<rel>/index.md.questions.json`, à côté de
      la traduction — cohérent avec le reste de l'arborescence i18n, et le sidecar suit
      naturellement l'article ;
      **(b)** un suffixe de locale dans le nom de fichier. **(a) est recommandé** : c'est déjà la
      convention du dépôt pour les traductions, et `collectTranslations()` sait la parcourir.
- [ ] `generate-questions.mjs` : accepter `--locale fr` et générer **depuis le fichier traduit**,
      pas depuis l'anglais. Générer depuis l'anglais puis traduire les questions produirait des
      formulations qui ne correspondent pas au texte que le lecteur a sous les yeux.
- [ ] `questions-index-plugin` : charger l'index de la locale courante
      (`context.i18n.currentLocale`), avec repli **vide** plutôt que sur l'anglais. Un index
      anglais servi en français est exactement le problème qu'on corrige.
- [x] **Garde-fou écrit — ne pas réimplémenter le filtre.**
      `scripts/lib/i18n-eligibility.mjs` applique les trois conditions : article réellement
      traduit, sidecar anglais déjà présent, sidecar localisé absent ou périmé. Un générateur
      `--locale` doit **consommer ce module**, pas recoder la logique.
      `yarn i18n:budget` affiche ce qui serait touché et ce que ça coûterait, avant de dépenser.
      Mesuré le 2026-09-16 avec 4 articles traduits : **34 fichiers ELI5 éligibles sur 798**,
      **4 index de questions sur 257** — 0,54 $ au lieu de 20,83 $ sans le filtre.
      Une case à cocher est une discipline ; ce module est un mécanisme.

## AnythingLLM : le même problème, en amont

Signalé par l'auteur le 2026-09-16. Le workspace `blog` d'AnythingLLM est alimenté par
`blog/2026/08/17/anythingllm-chat-with-your-docs/files/anythingllm-index.sh`, qui lit `BLOG_DIR`
(`blog/` par défaut) — donc **le corpus anglais uniquement**. Interroger le blog en français
depuis AnythingLLM cherche dans des embeddings anglais et ne trouve rien de pertinent.

- [ ] Indexer aussi `i18n/fr/docusaurus-plugin-content-blog/`. Le script accepte déjà
      `BLOG_DIR` en variable d'environnement — vérifier si un second passage suffit ou s'il faut
      le rendre multi-répertoires.
- [ ] Trancher : **un workspace `blog-fr` séparé**, ou les deux langues dans le même workspace ?
      Recommandé : **séparé**. Mélanger deux langues dans un même espace vectoriel dégrade la
      recherche dans les deux — et l'embedder retenu (`mxbai-embed-large`) est multilingue mais
      pas magique. Un workspace par langue permet aussi de router la question selon la locale.
- [ ] N'indexer que les articles réellement traduits, et re-déclencher l'indexation à chaque
      nouvelle traduction — l'état vit dans `.anythingllm-indexed` (gitignoré).
- [ ] Vérifier que le `topN` de 20 et le chunk de 400 restent pertinents sur un corpus français
      bien plus petit (4 articles aujourd'hui contre 257).

Voir [[project_anythingllm_instance]] pour l'accès (`http://172.17.0.1:3200` depuis le
devcontainer) et les réglages d'embedder à ne pas changer.

## Risque

**Coût API** : une génération de questions par article traduit, en plus de la traduction
elle-même. À n'engager qu'au fur et à mesure du lot I de 0119, article par article — pas en masse.

**Ne pas générer les questions françaises avant que l'article ne soit traduit** : elles seraient
produites depuis l'anglais et décriraient un texte que le lecteur ne voit pas.

## Critère d'acceptation

Sur `/fr/faq/`, chaque question affichée est en français et renvoie vers un article **traduit**.
Aucune question anglaise ne subsiste dans l'index français, et un article non traduit n'y apparaît
pas du tout.
