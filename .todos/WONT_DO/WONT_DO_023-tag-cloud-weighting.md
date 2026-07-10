# Amélioration — Tags : nuage sans pondération par popularité

> **WONT DO** — Décision 2026-07-05 : l'affichage uniforme actuel est intentionnellement conservé.
> Tous les tags ont la même taille visuelle, indépendamment de leur popularité. Ce choix est préféré.

## Problème

`src/theme/BlogTagsListPage/styles.module.css` : dans la section "All tags", tous les `.tagPill` ont exactement la même taille (font-size 0.875rem, padding 0.35rem 0.75rem) quelle que soit la popularité du tag. Le nombre d'articles est affiché en petit badge `.tagCount`, mais le pill lui-même ne change pas de taille.

Résultat : Docker (40+ articles), WSL (30+ articles) et "joomla-plugin" (1 article) ont la même apparence visuelle → le nuage de tags ne guide pas la découverte de contenu.

## Visuel

```
AVANT — tous identiques
─────────────────────────────────────────────────────────────────
[docker 43] [wsl 31] [linux 28] [php 19] [bash 14] [joomla 2] ...
  ← tous la même taille, même police, même padding

APRÈS — pondéré par nombre d'articles
─────────────────────────────────────────────────────────────────
[ D O C K E R  43 ]   [ W S L  31 ]   [linux 28]  [php 19]
  ← font 1.1rem          ← font 1rem     ← 0.9rem   ← 0.85rem

[bash 14]  [joomla 2]
  ← 0.85rem   ← 0.8rem (taille minimale)
```

## Approche recommandée

Le composant `BlogTagsListPage` est swizzlé dans `src/theme/BlogTagsListPage/`. La pondération peut être calculée côté JSX à partir du nombre d'articles par tag, puis appliquée via un style inline ou des classes utilitaires.

### Seuils suggérés (basés sur votre corpus) :

| Count | Font-size | Padding horizontal | Classe CSS |
|-------|-----------|-------------------|------------|
| ≥ 30 | 1.05rem | 1rem | `tagPillXL` |
| 15–29 | 0.95rem | 0.875rem | `tagPillL` |
| 7–14 | 0.875rem | 0.75rem | (défaut) |
| 3–6 | 0.8rem | 0.65rem | `tagPillS` |
| 1–2 | 0.75rem | 0.6rem | `tagPillXS` |

### CSS à ajouter dans `styles.module.css` :

```css
.tagPillXL { font-size: 1.05rem; padding: 0.4rem 1rem; }
.tagPillL  { font-size: 0.95rem; padding: 0.38rem 0.875rem; }
.tagPillS  { font-size: 0.8rem;  padding: 0.3rem 0.65rem; }
.tagPillXS { font-size: 0.75rem; padding: 0.28rem 0.6rem; }
```

### JSX dans le composant `index.js` :

```js
function getTagSizeClass(count) {
  if (count >= 30) return styles.tagPillXL;
  if (count >= 15) return styles.tagPillL;
  if (count >= 3)  return '';  // défaut
  if (count >= 2)  return styles.tagPillS;
  return styles.tagPillXS;
}
// puis dans le rendu :
className={clsx(styles.tagPill, getTagSizeClass(tag.count))}
```

## Impact

- Fichiers : `src/theme/BlogTagsListPage/styles.module.css` + `src/theme/BlogTagsListPage/index.js`
- Page `/tags` uniquement
- Test : ouvrir `/tags` → les tags populaires (Docker, WSL, Linux) doivent visuellement ressortir plus que les tags rares
