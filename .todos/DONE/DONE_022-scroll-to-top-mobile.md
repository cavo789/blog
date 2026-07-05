# Amélioration — ScrollToTopButton : trop imposant sur mobile

## Problème

`src/components/ScrollToTopButton/styles.module.css` : le bouton est fixé à 60×60px et positionné à `bottom: 30px; right: 30px`. Sur un téléphone (390px de large), un bouton de 60px dans le coin représente ~15% de la largeur — il masque potentiellement du contenu (réactions, dates, liens de pagination).

De plus, `right: 30px` + `60px` de largeur = 90px occupés depuis le bord droit, soit près de 25% de la largeur utile.

## Visuel

```
MOBILE 390px — AVANT                   MOBILE 390px — APRÈS
─────────────────────────              ─────────────────────────
┌─────────────────────────┐            ┌─────────────────────────┐
│  ...contenu de l'article│            │  ...contenu de l'article│
│                         │            │                         │
│  [Helpful] [Not helpful]│            │  [Helpful] [Not helpful]│
│                    ╔════╗│            │                    ╔══╗ │
│                    ║ ↑  ║│            │                    ║↑ ║ │  ← 44px
│                    ║ 60 ║│ ← 60px    │                    ╚══╝ │     bottom: 16px
│                    ╚════╝│           └─────────────────────────┘     right: 16px
└─────────────────────────┘
```

## Fix

**Fichier :** `src/components/ScrollToTopButton/styles.module.css`

```css
/* Ajouter à la fin : */

@media (max-width: 600px) {
  .scrollBtn {
    width: 44px;
    height: 44px;
    bottom: 16px;
    right: 16px;
  }
}
```

## Impact

- Fichier : `src/components/ScrollToTopButton/styles.module.css`
- Sur tous les articles et pages longues, uniquement sur mobile (< 600px)
- Test : ouvrir un article en DevTools mobile → le bouton scroll-to-top doit être plus petit et moins intrusif
