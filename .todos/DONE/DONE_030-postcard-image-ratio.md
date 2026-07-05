# Fix — PostCard : hauteur d'image fixe 180px (SeriesCards + RelatedPosts)

## Problème

`src/components/Blog/PostCard/styles.module.css` définit deux hauteurs fixes à 180px :

```css
--card-img-height: 180px;          /* variable CSS utilisée par .cardImageEnhanced */
.cardSmallImage { height: 180px; } /* hardcodé pour le layout "small" */
```

Ces deux règles affectent :
- **SeriesCards** (layout `enhanced`) → page `/series`
- **RelatedPosts** (layout `small`) → bas de chaque article

Même problème que celui déjà corrigé dans `BlogListPage/styles.module.css` : hauteur fixe = recadrage arbitraire selon la composition de l'image de bannière.

## Fix

**Fichier :** `src/components/Blog/PostCard/styles.module.css`

```css
/* Remplacer : */
:root {
  --card-img-height: 180px;
}

/* Par : */
:root {
  --card-img-height: auto;  /* ou simplement supprimer la variable */
}

/* Et pour .cardImageEnhanced : */
.cardImageEnhanced {
  width: 100%;
  aspect-ratio: 2 / 1;    /* ← au lieu de height: var(--card-img-height) */
  object-fit: cover;
  ...
}

/* Et pour .cardSmallImage : */
.cardSmallImage {
  width: 100%;
  aspect-ratio: 2 / 1;    /* ← au lieu de height: 180px */
  object-fit: cover;
  ...
}
```

## Impact

- Fichier : `src/components/Blog/PostCard/styles.module.css`
- Page `/series` (cards enhanced) + section "Related posts" en bas de chaque article (cards small)
- Test : ouvrir `/series` et un article → les images doivent être proportionnelles quelle que soit la largeur
