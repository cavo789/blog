# 0142 — SeriesPosts : contrôle imbriqué dans summary ; labels ARIA différents du texte visible

- **Priority**: Medium
- **Batch**: a11y
- **Depends**: —
- **Files**: `src/components/Blog/SeriesPosts/index.tsx`, `src/components/Reaction/index.tsx`, `src/components/TriedIt/index.tsx`, `src/components/Bluesky/`

## Problème

axe `nested-interactive` (2 par page) sur `.seriesBlogPost details > summary`. Et `label-content-name-mismatch` (4 par page) sur `.button_lbxS`, `.blueskyButton`, `.btnNeutral` : l'`aria-label` doit contenir le texte visible.

## Risque

Lecteurs malvoyants, au clavier, à la voix ou au lecteur d'écran gênés sur la plupart des pages.

## Solution

Corriger puis revérifier avec l'image `a11y-check` du draft `.unpublished/docusaurus-components-accessibility-audit`, en clair et en sombre.
