# Fix — Page Séries : H1 absent et aucune statistique visible

## Problème

La page `/series` n'a **aucun titre `h1` visible**. Le frontmatter `title: "All articles series"` alimente l'onglet du navigateur mais rien ne s'affiche sur la page. La première chose que voit le lecteur est le paragraphe `.seriesIntro` en couleur secondaire (quasi-invisible) puis directement les cards.

De plus, aucune statistique n'est affichée : combien de séries ? combien d'articles au total ? Ces informations guident le lecteur.

## Visuel

```
AVANT — page /series (actuel)
─────────────────────────────────────────────────────
  (nav bar)

  Articles published as a series. Each serie is      ← petit texte gris,
  a coherent set of posts around a common topic.       quasi-invisible

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  image   │  │  image   │  │  image   │          ← cards directement
  │ Série A  │  │ Série B  │  │ Série C  │
  └──────────┘  └──────────┘  └──────────┘

─────────────────────────────────────────────────────
APRÈS
─────────────────────────────────────────────────────
  (nav bar)

  All Series                                         ← h1 visible

  A collection of 12 series · 87 articles total      ← stats en sous-titre
  Articles published as a series...                   ← texte intro

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  image   │  │  image   │  │  image   │
  │ Série A  │  │ Série B  │  │ Série C  │
  └──────────┘  └──────────┘  └──────────┘
```

## Fix

**Fichier :** `src/series.md` (ou la page MDX équivalente qui render `/series`)

Option A — ajouter directement dans le MDX :

```mdx
# All Series

import SeriesStats from "@site/src/components/Blog/SeriesStats";

<SeriesStats /> {/* Nouveau composant optionnel */}
```

Option B (sans nouveau composant) — modifier simplement le fichier MDX :

```mdx
---
title: All Series
---

# All Series

<div className="seriesIntro">
  A curated collection of in-depth series — each one is a coherent set of articles around
  a single topic, meant to be read in order.
</div>

<SeriesCards />
```

**Fichier CSS :** `src/css/series.css` — améliorer `.seriesIntro` :

```css
.seriesIntro {
  text-align: center;
  font-size: 1.1rem;
  color: var(--ifm-font-color-secondary);
  max-width: 640px;
  margin: 0 auto 2rem;
  line-height: 1.65;
}
```

## Impact

- Fichier : page MDX de la route `/series` + `src/css/series.css`
- Page `/series` uniquement
- Test : ouvrir `/series` → un h1 clair et une intro lisible doivent apparaître avant les cards
