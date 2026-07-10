# 035 — Fuite de contenu draft/unlisted dans les listings publics

**Priority:** Critical

## Problème

`getBlogMetadata()` (`src/components/Blog/utils/posts.js`) charge **tous** les fichiers MDX de
`blog/` via `require.context` et retourne les flags `draft` / `unlisted` sans jamais filtrer
dessus. Chaque composant consommateur est censé filtrer lui-même — et la moitié ne le fait pas :

| Consommateur | Filtre `draft`/`unlisted` ? |
|---|---|
| `Blog/PostCount/index.js` | ✅ (`!post.draft`) |
| `Blog/utils/series.js` (compteurs) | ✅ (`!post.draft` / `post.draft`) |
| `Blog/SeriesStats/index.js` | ✅ (`!post.draft`) |
| `Blog/LatestPosts/index.js` | ❌ (ne filtre que `p.date`) |
| `Blog/RelatedPosts/index.js` | ❌ |
| `Blog/SeriesPosts/index.js` | ❌ |
| `Blog/Series/SeriesArticlesPage.js` | ❌ |
| `Blog/Tags/TagArticlesPage.js` | ❌ |

Un article marqué `draft: true` (utilisé pour les "in progress" d'une série, cf. compteur dans
`series.js`) ou `unlisted: true` peut donc apparaître :
- en page d'accueil dans "Latest posts",
- dans les "Related posts" en bas d'un article publié,
- dans la liste complète d'une série (`/series/:slug`),
- dans une page de tag (`/blog/tags/:tag`).

`require.context` lit les fichiers source directement, indépendamment du filtrage que le plugin
blog de Docusaurus applique en production — rien ne garantit que ces pages soient absentes du
build final.

## Risque

Contenu non finalisé (brouillon, article "in progress" d'une série) visible publiquement, avec un
lien qui peut mener vers une page 404 en production si Docusaurus exclut effectivement la route du
build. Silencieux : personne ne le remarque avant qu'un lecteur signale le lien mort ou le contenu
brut.

## Solution proposée

Centraliser le filtrage dans `getBlogMetadata()` :

```js
export function getBlogMetadata({ includeDrafts = false, includeUnlisted = false } = {}) {
  return posts.keys().map(...).filter((post) =>
    (includeDrafts || !post.draft) && (includeUnlisted || !post.unlisted)
  );
}
```

Puis retirer les filtres redondants dans `PostCount`, `series.js`, `SeriesStats` (ou les faire
passer explicitement `{ includeDrafts: true }` là où le compteur "in progress" doit rester visible
à l'auteur) et ajouter le filtre par défaut partout ailleurs sans rien changer à leur code.

## Lien avec l'existant

Aucun TODO existant ne couvre ce point. `DONE_027` (stats de série) et le compteur "in progress"
de `series.js` supposent que le calcul du nombre de brouillons est correct — ce TODO ne change pas
ce comportement, il corrige uniquement les endroits qui affichent les *cards* elles-mêmes.
