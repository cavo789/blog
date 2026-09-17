# 0125 — AnythingLLM : indexer le corpus français

- **Priority**: Low — n'affecte pas le site ; ~10 minutes, aucune modification de script
- **Batch**: i18n-fr
- **Depends**: 0119
- **Files**: `.gitignore`, `.devcontainer/scripts/interactive.sh` (optionnel)

Extrait de 0120 le 2026-09-17 : « Ask my blog » est une recherche BM25 côté navigateur et
n'utilise pas AnythingLLM. Les deux chantiers sont indépendants.

## Problème

Signalé par l'auteur le 2026-09-16. Le workspace `blog` d'AnythingLLM est alimenté par
`.scripts/anythingllm-index.sh`, qui lit `BLOG_DIR` (`blog/` par défaut) — donc **le corpus
anglais uniquement**. Interroger le blog en français depuis AnythingLLM cherche dans des
embeddings anglais et ne trouve rien de pertinent.

Révisé le 2026-09-17 après vérification dans le code :

- Le corpus français compte **104 articles traduits**, pas 5 comme estimé initialement
  (257 en anglais). Ce n'est plus un corpus marginal.
- **Le script n'a besoin d'aucune modification.** Tout est déjà paramétrable par variable
  d'environnement : `ANYTHINGLLM_WORKSPACE`, `BLOG_DIR`, `SITE_URL` (ligne 24) et `STATE_FILE`
  (ligne 23). Le `link://` de citation est construit depuis `SITE_URL` (ligne 138), donc un
  préfixe `/fr` produit les bonnes URLs sans toucher une ligne.
- **L'index anglais lui-même est périmé** : dernière indexation le 2026-08-28, 6 articles
  publiés depuis ne sont pas indexés (`docusaurus-ollama-tags`, `lazydocker`,
  `vscode-remote-ssh-proxyjump-devcontainer`, `copy-as-markdown`, `atuin-bash-history`,
  `docling`). À rattraper d'abord — c'est ce qui sert réellement aujourd'hui.

## Solution

- [ ] Rattraper l'anglais : `ai-index` tout court (6 articles manquants).
- [ ] Créer le workspace `blog-fr` dans l'UI AnythingLLM. Le script refuse de tourner si le
      workspace n'existe pas (ligne 69) — il ne le crée pas.
- [ ] Ajouter `.anythingllm-indexed-fr` au `.gitignore`. La ligne 38 est un chemin exact,
      pas un glob : `.anythingllm-indexed` ne couvre pas le fichier français.
- [ ] Indexer le français, sans modifier le script :

      ```bash
      ANYTHINGLLM_WORKSPACE=blog-fr \
      BLOG_DIR=i18n/fr/docusaurus-plugin-content-blog \
      SITE_URL=https://www.avonture.be/fr \
      STATE_FILE=.anythingllm-indexed-fr \
      ai-index
      ```

- [ ] Optionnel : une fonction `ai-index-fr` dans `interactive.sh` pour ne pas retaper les
      quatre variables. À ne faire que si l'usage se confirme.
- [ ] Vérifier que le `topN` de 20 reste pertinent sur un corpus de 104 articles.

Deux points du TODO initial sont tombés à la vérification :

- Filtrer sur `translatedSlugs()` est inutile : `i18n/fr/docusaurus-plugin-content-blog/` ne
  contient **que** des traductions réelles, le filtrage est intrinsèque au répertoire.
- Le risque « le script vit dans les `files/` d'un article publié » ne s'applique plus,
  puisqu'aucune modification de script n'est nécessaire.

Workspace séparé (`blog-fr`) et non fusionné : mélanger deux langues dans un même espace
vectoriel dégrade la recherche dans les deux, et l'embedder retenu (`mxbai-embed-large`) est
multilingue mais pas magique.

Voir [[project_anythingllm_instance]] pour l'accès et les réglages d'embedder à ne pas changer.

## Critère d'acceptation

Une question posée en français au workspace `blog-fr` renvoie des passages des articles
traduits, avec des URLs citées en `/fr/blog/<slug>`. Le workspace anglais `blog` est à jour
et n'est pas modifié par l'indexation française.

## Status — PARTIAL (2026-09-17)

### Done

- Index anglais rattrapé : `ai-index` → 6 ajoutés, 36 mis à jour, 0 échec. Le workspace `blog`
  compte 257 documents, soit la totalité du corpus publié.
- Workspace `blog-fr` créé via l'API (`POST /api/v1/workspace/new`), avec les réglages du
  workspace anglais : `topN: 20`, `similarityThreshold: 0.2`, `openAiHistory: 20`, et le prompt
  système de `.scripts/anythingllm-workspace-prompt.txt` appliqué verbatim.
- `.gitignore` : `.anythingllm-indexed` remplacé par `.anythingllm-indexed*`, avec un commentaire
  nommant les deux fichiers. La ligne exacte précédente ne couvrait pas la variante française.
- Corpus français indexé : **103 des 104 articles traduits**, 0 échec hors le cas ci-dessous.
  Aucune modification de `anythingllm-index.sh` — tout est passé par `ANYTHINGLLM_WORKSPACE`,
  `BLOG_DIR`, `SITE_URL` et `STATE_FILE`, comme prévu.
- Fonctions `ai-index-fr` et `ai-search-fr` ajoutées à `.devcontainer/scripts/interactive.sh`
  (catégorie `AnythingLLM`). L'item était marqué optionnel ; il a été fait parce que l'oubli de
  `SITE_URL` en ligne de commande produit silencieusement des URLs `/blog/` au lieu de `/fr/blog/`
  dans la seconde passe frontmatter — erreur commise du premier coup pendant ce TODO.
- `topN: 20` vérifié sur le corpus français : deux questions de contrôle renvoient 2-3 sources
  pertinentes, sans bruit. Le réglage reste bon, aucun changement nécessaire.
- Critère d'acceptation atteint : une question en français à `blog-fr` renvoie des passages
  français avec des URLs `/fr/blog/<slug>` dans les deux passes (vectorielle et frontmatter).
  Le workspace `blog` est intact — 257 documents, non modifié par l'indexation française.

### Not done

- **`docling` français non indexé** (103/104). Le document s'uploade mais l'embedding échoue :

  ```text
  [OllamaEmbedder] the input length exceeds the context length
  Failed to vectorize Docling - Convertir PDF, Word, PowerPoint, Excel et HTML en Markdown…
  ```

  **Reason:** l'embedder tourne avec `num_ctx: 400` et le `chunkHeader` (titre + date + URL) est
  ajouté **après** le découpage en chunks de 400 : header + chunk dépasse la fenêtre. Vérifié
  expérimentalement — le même fichier, ré-uploadé avec un titre d'un seul caractère, s'indexe sans
  erreur. Le français pèse plus de tokens que l'anglais à nombre de caractères égal, donc c'est la
  version française qui bascule la première ; l'article anglais passe.

  Ce n'est donc pas un problème de contenu ni de script : la correction est un **réglage global**
  de l'instance (augmenter `num_ctx` / la longueur de chunk, ou la baisser à ~350 pour laisser de
  la place au header). Global veut dire qu'il s'appliquera aussi aux futurs ré-embeddings du
  workspace anglais, et [[project_anythingllm_instance]] note les réglages d'embedder comme
  « à ne pas changer » — c'est une décision de l'auteur, pas un choix à prendre seul.

  État laissé propre pour reprendre : le document orphelin a été supprimé du store AnythingLLM et
  la ligne `docling` retirée de `.anythingllm-indexed-fr`, donc un simple `ai-index-fr` le
  retentera une fois le réglage tranché. Rien d'autre à refaire.

  **À surveiller** : le problème se reproduira sur d'autres articles français au fil des
  traductions. `docling` est simplement le premier à franchir le seuil.
