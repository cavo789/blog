---
name: project-i18n-architecture
description: "Architecture i18n du blog : la locale fr, les 5 plugins maison qui la portent, et les invariants à ne pas casser"
metadata:
  node_type: memory
  type: project
---

Le blog est **bi-locale depuis le 2026-09-16** : `en` par défaut, `fr` sous `/fr/`. Plan complet
et cases à cocher dans `.todos/DONE/DONE_0119-traduction-francaise-automatique-des-articles.md` (clos le 2026-09-17 ; suite dans `.todos/0124-deploiement-progressif-de-la-locale-fr.md`).

## Les cinq pièces à connaître avant de toucher quoi que ce soit

- **`plugins/translations-manifest-plugin/`** — LA source de vérité « cet article est-il
  traduit ? ». Scanne `i18n/<locale>/docusaurus-plugin-content-blog/`, expose en
  `setGlobalData()`. Exporte aussi `collectTranslations()` et `collectAllArticleSlugs()` pour les
  plugins. **Ne jamais deviner l'état de traduction autrement** : le fallback i18n de Docusaurus
  sert la source anglaise sous l'URL française, donc « la route existe » ne prouve rien.
- **`plugins/i18n-seo-guard/`** — `postBuild` : `noindex, follow` + `canonical` vers l'anglais sur
  chaque article non traduit d'une locale non-défaut. Sans lui, 256 pages anglaises sous `/fr/`
  = contenu dupliqué visant précisément le bénéfice SEO recherché.
- **`plugins/remark-i18n-assets/`** — **doit rester le premier** de
  `beforeDefaultRemarkPlugins`. Réécrit les chemins `./`-relatifs d'un article traduit vers le
  dossier de l'article **anglais** : `files/` et `images/` (201 et 186 articles, 84 Mo) ne sont
  jamais dupliqués sous `i18n/`.
- **`src/components/Blog/TranslationNotice/`** — trois états : ligne d'invitation « Cet article
  existe aussi en français » sur la page **anglaise** quand la traduction existe (en français,
  non traduite, c'est voulu) ; bandeau « traduction automatique » sur la page FR traduite ;
  bandeau « pas encore traduit » sur la page FR non traduite. **Un badge drapeau a existé puis a
  été supprimé (2026-09-16)** : la phrase dit la même chose en mots, le badge faisait doublon au
  moment précis où le lecteur cherche à commencer l'article.
- **`.claude/scripts/safe_build.sh`** — refuse de lancer un build si un autre tourne. Trois
  builds concurrents ont produit des `ENOENT` qui ressemblaient à des bugs de code.
- **`src/components/Blog/utils/translations.ts`** — `useTranslationState()`. Deux questions
  **distinctes** : `isTranslated(slug)` = « lisible ici » (toujours vrai sur la locale par
  défaut) et `hasTranslationIn(locale, slug)` = « une traduction existe ». Les confondre a mis un
  drapeau FR sur les 257 articles anglais.
- **`src/components/Blog/utils/posts.ts`** — `useBlogMetadata()` remplace `getBlogMetadata()`
  dans tout composant de rendu. **Limite connue** : il *filtre* le corpus anglais, il ne le
  traduit pas — les titres des articles traduits restent anglais dans les cartes et les listes.

## L'invariant qui casse tout

Le `require.context` de `posts.ts` lit `blog/`, jamais `i18n/`. Tout composant maison affiche donc
des données **anglaises**, quelle que soit la locale rendue. `markdown-export-plugin` a été
corrigé à la source (il lit le fichier traduit quand il existe) ; `posts.ts` ne l'est pas encore.

## Chaîne d'outillage de traduction

`scripts/translate-post.mjs` + `lib/translate-{contract,validate,hash,anchors}.mjs` : Opus 5,
glossaire de 47 termes avec genre, 10 familles de contrôles structurels, hash du contenu
*traduisible* seulement, et épinglage déterministe des ancres anglaises (`{#english-slug}`) qui
rend `write-heading-ids` inutile sur le corpus. Coût mesuré : **0,16 $/article**.

Voir aussi [[feedback_i18n_translation_rejected]] et les rules `i18n-locale-safety` /
`build-verification`.
