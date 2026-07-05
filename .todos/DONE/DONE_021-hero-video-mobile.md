# Amélioration — Hero : masquer la vidéo sur petit écran mobile

## Problème

`src/components/Blog/HeroSection/styles.module.css` : sur mobile (< 996px), la grille hero passe en colonne unique (`grid-template-columns: 1fr`). La vidéo (ratio 1:1, max-width 500px) s'affiche **sous** le texte d'intro. Sur un téléphone en portrait (390px de large), la vidéo prend environ 390px de hauteur → le hero dépasse 700px de hauteur totale avant que le visiteur ne voit le moindre contenu de blog.

## Visuel

```
MOBILE — AVANT (> 700px de hero)       MOBILE — APRÈS (hero compact)
─────────────────────────              ─────────────────────────
┌─────────────────────────┐            ┌─────────────────────────┐
│ Hi, I'm Christophe      │            │ Hi, I'm Christophe      │
│ Personal blog about...  │            │ Personal blog about...  │
│ [Read Blog] [About me]  │            │ [Read Blog] [About me]  │
├─────────────────────────┤            └─────────────────────────┘
│                         │            ← vidéo masquée < 600px
│   ┌─────────────────┐   │            → hero ~200px au lieu de 700px
│   │                 │   │
│   │   VIDEO 1:1     │   │ ← 390px
│   │                 │   │   de haut!
│   └─────────────────┘   │
└─────────────────────────┘
```

## Fix

**Fichier :** `src/components/Blog/HeroSection/styles.module.css`

Ajouter dans le bloc `@media (max-width: 996px)` existant, ou ajouter un nouveau breakpoint :

```css
/* Option A — masquer la vidéo uniquement sur très petit écran */
@media (max-width: 600px) {
  .videoWrapper {
    display: none;
  }
  .heroGrid {
    gap: 1rem;
  }
}

/* Option B — réduire la taille de la vidéo sur mobile */
@media (max-width: 996px) {
  .videoWrapper {
    max-width: 280px;
  }
}
```

L'**option A** est recommandée : sur téléphone, la vidéo est rarement visible (autoplay muted mais potentiellement bloquée), et sa suppression améliore significativement la performance et l'expérience mobile.

## Impact

- Fichier : `src/components/Blog/HeroSection/styles.module.css`
- Page d'accueil `/` uniquement, sur mobile (< 600px)
- Test : ouvrir la homepage en DevTools en mode mobile (iPhone 12 Pro, 390px) → le hero doit être compact
