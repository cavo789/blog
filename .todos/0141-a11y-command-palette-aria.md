# 0141 — Palette de commandes : structure ARIA listbox/option invalide

- **Priority**: Medium
- **Batch**: a11y
- **Depends**: —
- **Files**: `src/components/CommandPalette/index.tsx`

## Problème

axe `aria-required-children` et `aria-required-parent` (critical) quand les résultats sont présents, et `list` sur `.groupList`. Les options sont dans des groupes sans `role=group` valide, listes mal formées. Appliquer le pattern APG combobox/listbox.

## Risque

Lecteurs malvoyants, au clavier, à la voix ou au lecteur d'écran gênés sur la plupart des pages.

## Solution

Corriger puis revérifier avec l'image `a11y-check` du draft `.unpublished/docusaurus-components-accessibility-audit`, en clair et en sombre.
