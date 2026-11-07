# 0140 — Contrastes WCAG AA insuffisants (Terminal, boutons primaires, navbar, Bluesky, palette)

- **Priority**: High
- **Batch**: a11y
- **Depends**: —
- **Files**: `src/css/custom.css`, `src/components/Terminal/`, `src/components/Bluesky/styles.module.css`, `src/components/CommandPalette/styles.module.css`

## Problème

Mesures axe-core 4.14 (2026-11-07), sous le seuil 4.5:1 : titre Terminal 4.12 clair / 3.46 sombre ; `.button--primary` sombre 2.38 ; lien actif navbar et `.footer-cmdk-hint` clair 4.41 ; `blueskyNoCommentYet` 3.99 clair ; `statusRow` palette 3.42 clair. Corriger les tokens plutôt que composant par composant, puis ajouter le soulignement des liens en paragraphe (`link-in-text-block`).

## Risque

Lecteurs malvoyants, au clavier, à la voix ou au lecteur d'écran gênés sur la plupart des pages.

## Solution

Corriger puis revérifier avec l'image `a11y-check` du draft `.unpublished/docusaurus-components-accessibility-audit`, en clair et en sombre.
