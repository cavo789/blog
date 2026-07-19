# Fix — Image de card : hauteur fixe 180px → aspect-ratio

## Problème

Dans `src/theme/BlogListPage/styles.module.css` (ligne 76), les images des cards du blog sont définies avec une hauteur fixe :

```css
.cardImage {
  width: 100%;
  height: 180px; /* ← fixe, crée des recadrages arbitraires */
  object-fit: cover;
  flex-shrink: 0;
}
```

Avec `object-fit: cover`, les images sont recadrées de façon imprévisible selon leur composition. Sur grands écrans les cards sont très larges → proportion très aplatie.

## Visuel

```
AVANT — hauteur 180px fixe (card large)
┌──────────────────────────────────────┐  ← 180px quelque soit la largeur
│  ████ image recadrée arbitrairement  │
└──────────────────────────────────────┘
│  titre                               │
│  description...                      │
└──────────────────────────────────────┘

APRÈS — aspect-ratio 2/1 (proportionnel)
┌──────────────────────────────────────┐  ← hauteur = largeur / 2
│  ████████████████████████████████████│
│  ██ image bien proportionnée ████████│
└──────────────────────────────────────┘
│  titre                               │
│  description...                      │
└──────────────────────────────────────┘
```

## Fix

**Fichier :** `src/theme/BlogListPage/styles.module.css`

```css
/* Remplacer : */
.cardImage {
  width: 100%;
  height: 180px;
  object-fit: cover;
  flex-shrink: 0;
}

/* Par : */
.cardImage {
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  flex-shrink: 0;
}
```

## Impact

- Fichier : `src/theme/BlogListPage/styles.module.css`
- Page `/blog` (liste des articles) et homepage (section "Latest 9 posts")
- Test : `/blog` → vérifier que toutes les cards ont des images proportionnelles sur desktop et mobile
