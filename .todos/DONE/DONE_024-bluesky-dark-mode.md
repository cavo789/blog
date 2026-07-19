# Fix — Bluesky : dark mode totalement cassé

## Problème

`src/components/Bluesky/styles.module.css` (ligne 169) utilise `@media (prefers-color-scheme: dark)` au lieu de `[data-theme="dark"]`.

```css
/* ACTUEL — NE FONCTIONNE PAS pour Docusaurus */
@media (prefers-color-scheme: dark) { ... }

/* CORRECT pour Docusaurus */
[data-theme="dark"] .blueskyCommentsContainer { ... }
```

Le thème de Docusaurus est contrôlé via `data-theme="dark"` sur `<html>` (toggle manuel de l'utilisateur). La media query `prefers-color-scheme` reflète uniquement le thème du système d'exploitation. Résultat : un utilisateur qui a activé le dark mode Docusaurus mais dont l'OS est en light mode voit les commentaires Bluesky **avec les couleurs hardcodées claires** sur fond sombre — illisible.

De plus, toutes les couleurs sont hardcodées (`#f5f5f5`, `#f9f9f9`, `#333`, `#555`, `gray`, `#0062cc`…) et ne s'adaptent pas au design system Infima du site.

## Problèmes supplémentaires

- `blueskyCommentsContainer` a `border: solid 10px #f5f5f5` — bordure de 10px hardcodée light grey, très lourde visuellement
- `blueskyButton:hover` utilise `#0062cc` (Bootstrap blue) — incohérent avec le vert primaire du site
- `blueskyButton` dark mode hover utilise `#007bff` (autre Bootstrap blue) — idem

## Visuel

```
LIGHT MODE — correct (par chance)
┌─────────────────────────────────┐
│░░░░ BORDURE 10px GRIS CLAIR ░░░│
│  💬 Commentaire Bluesky        │  ← fond #f9f9f9 lisible en light
│  @handle · il y a 2j          │
└─────────────────────────────────┘

DARK MODE — cassé (le plus fréquent chez les devs)
┌─────────────────────────────────┐
│████████ FOND SOMBRE ████████████│
│░░░░░░░ BORDURE 10px GRIS ░░░░░│  ← gris clair sur fond sombre
│  💬 Commentaire Bluesky        │  ← fond #f9f9f9 sur fond #1b1b1d
│  texte #333 sur fond sombre    │  ← texte foncé illisible !!!
└─────────────────────────────────┘
```

## Fix

**Fichier :** `src/components/Bluesky/styles.module.css`

1. Remplacer `@media (prefers-color-scheme: dark)` par `[data-theme="dark"]` sur chaque sélecteur
2. Réduire la bordure : `border: solid 10px #f5f5f5` → `border: 1px solid var(--ifm-color-emphasis-200)`
3. Remplacer les hex hardcodés par des variables CSS :

```css
/* Commentaire container */
.blueskyCommentContainer {
  background-color: var(--ifm-color-emphasis-100);
  border-left: 2px solid var(--ifm-color-emphasis-300);
  color: var(--ifm-font-color-base);
}

/* Handles et dates */
.blueskyCommentAuthorHandle,
.blueskyCommentDate {
  color: var(--ifm-font-color-secondary);
}

/* Bouton */
.blueskyButton {
  background-color: var(--ifm-color-emphasis-200);
  border-color: var(--ifm-color-emphasis-300);
  color: var(--ifm-font-color-base);
}

.blueskyButton:hover {
  background-color: var(--ifm-color-primary);
  border-color: var(--ifm-color-primary);
  color: white;
}

/* Remplacer toute la section @media par [data-theme="dark"] */
[data-theme="dark"] .blueskyCommentContainer {
  background-color: var(--ifm-color-emphasis-100);
  border-left-color: var(--ifm-color-emphasis-400);
}
```

## Impact

- Fichier : `src/components/Bluesky/styles.module.css`
- Tous les articles avec `blueskyRecordKey` en frontmatter
- Test : ouvrir un article avec des commentaires Bluesky → toggle dark mode → tout doit être lisible
