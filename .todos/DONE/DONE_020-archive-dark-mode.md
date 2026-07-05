# Fix — Page Archive : filtres et timeline cassés en dark mode

## Problème

`src/theme/BlogArchivePage/styles.module.css` n'a **aucun** sélecteur `[data-theme="dark"]`. Plusieurs valeurs hardcodées sont problématiques en dark mode :

1. **Select des filtres** (`filterGroupSidebar select`) :
   - `background-color: var(--ifm-color-gray-100)` → gris très clair sur fond sombre (jarring)
   - `border: 1px solid var(--ifm-color-primary-light)` → ok, mais le fond est le problème

2. **Liens de la timeline** (`timelineMonthLink`) :
   - `color: var(--ifm-color-secondary-darkest)` → couleur très sombre, quasi-invisible sur fond sombre en dark mode
   - `.timelineMonthLink:hover` → `background-color: var(--ifm-color-secondary-lightest)` → fond très clair au hover sur fond sombre

3. **Lien actif** (`activeMonth`) :
   - `background-color: var(--ifm-color-primary-light)` + `color: var(--ifm-color-primary-darker)` → fond clair, texte sombre → illisible en dark mode

## Visuel

```
DARK MODE — AVANT (bugs)
┌────────────────────────────────┐
│ Filters:                       │
│ ┌──────────────────────────┐   │ ← select avec fond gris CLAIR
│ │ Année ▾                  │   │   sur fond de page SOMBRE
│ └──────────────────────────┘   │
│                                │
│ ● 2026                         │ ← texte quasi-invisible (#secondary-darkest)
│   ├ Janvier (12)               │
│   └ Juin (8) ← ACTIF           │ ← fond clair + texte sombre = illisible
└────────────────────────────────┘

DARK MODE — APRÈS
┌────────────────────────────────┐
│ Filters:                       │
│ ┌──────────────────────────┐   │ ← select avec fond adapté dark
│ │ Année ▾                  │   │
│ └──────────────────────────┘   │
│                                │
│ ● 2026                         │ ← texte clair lisible
│   ├ Janvier (12)               │
│   └ Juin (8) ← ACTIF           │ ← fond teal foncé + texte teal clair
└────────────────────────────────┘
```

## Fix

**Fichier :** `src/theme/BlogArchivePage/styles.module.css` — ajouter à la fin :

```css
/* --------- Dark Mode Overrides --------- */

[data-theme="dark"] .filterGroupSidebar select {
  background-color: var(--ifm-background-surface-color);
  color: var(--ifm-font-color-base);
  border-color: var(--ifm-color-emphasis-400);
}

[data-theme="dark"] .filterGroupSidebar select:hover,
[data-theme="dark"] .filterGroupSidebar select:focus {
  border-color: var(--ifm-color-primary);
  box-shadow: 0 0 0 2px rgba(37, 194, 160, 0.2);
}

[data-theme="dark"] .timelineMonthLink {
  color: var(--ifm-color-emphasis-700);
}

[data-theme="dark"] .timelineMonthLink:hover {
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-font-color-base);
}

[data-theme="dark"] .timelineMonthLink.activeMonth,
[data-theme="dark"] .activeMonth {
  background-color: rgba(37, 194, 160, 0.15);
  color: var(--ifm-color-primary-lighter);
}
```

## Impact

- Fichier : `src/theme/BlogArchivePage/styles.module.css`
- Page `/archive` uniquement
- Test : aller sur `/archive` → basculer en dark mode → filtres et timeline doivent être lisibles
