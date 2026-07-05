# Amélioration — Homepage : rythme visuel entre les sections

## Problème

La page d'accueil enchaîne trois sections (HomeCards → LatestPosts → MainTags) sur un fond blanc uniforme, avec des titres identiques (`font-size: 2rem; font-weight: 800`). Aucun élément visuel ne permet au lecteur de percevoir la transition d'une section à l'autre. La page ressemble à un long scroll monotone.

De plus, la transition entre le hero (fond crème `#fcfcec`) et le `<main>` (fond blanc) est abrupte — une ligne dure sans fondu.

## Visuel

```
AVANT — trois sections identiques sans rythme
─────────────────────────────────────────────────────
 [hero #fcfcec]
─────────────────────────────────────────────────────  ← coupure abrupte
 Explore the site        ← h2 2rem bold
 [cards] [cards] [cards]

 Latest 9 posts          ← h2 2rem bold (identique)
 [cards] [cards] [cards]

 Explore the main topics ← h2 2rem bold (identique)
 [cards] [cards] [cards]
─────────────────────────────────────────────────────

APRÈS — sections alternées avec rythme
─────────────────────────────────────────────────────
 [hero #fcfcec]
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ← vague/fondu SVG optionnel
 Explore the site        ← fond blanc (normal)
 [cards] [cards] [cards]

──────────────────────────────────────────────────── ← séparateur
 Latest 9 posts          ← fond légèrement teinté
 [cards] [cards] [cards]

──────────────────────────────────────────────────── ← séparateur
 Explore the main topics ← fond blanc
 [cards] [cards] [cards]
─────────────────────────────────────────────────────
```

## Fix

**Option A — fond alterné sur la section LatestPosts (recommandée)**

**Fichier :** `src/css/custom.css` — ajouter :

```css
/* Alternance de fond sur la section "Latest posts" de la homepage */
.latestPostsSection {
  background: var(--ifm-color-emphasis-100);
  padding: 3rem 0;
  margin: 0 calc(-50vw + 50%); /* full-bleed */
  padding-left: calc(50vw - 50%);
  padding-right: calc(50vw - 50%);
}
```

**Option B — séparateur décoratif entre sections**

```css
/* Séparateur avec couleur primaire */
.sectionDivider {
  border: none;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--ifm-color-primary-lightest),
    transparent
  );
  margin: 0 auto;
  max-width: 400px;
}
```

**Option C — transition hero → main avec pseudo-élément (plus technique)**

```css
/* Fond du hero avec transition douce vers le blanc */
.heroHeader::after {
  content: '';
  display: block;
  height: 40px;
  background: linear-gradient(
    to bottom,
    var(--hero-background-light),
    transparent
  );
  margin-top: -40px;
  position: relative;
  z-index: 1;
}
```

## Impact

- Fichier : `src/css/custom.css` + potentiellement `src/pages/index.js`
- Page d'accueil `/` uniquement
- Test : parcourir la homepage → les sections doivent être visuellement distinctes, le scroll doit révéler un rythme clair
