# Fix — H4 quasi-illisible en dark mode

## Problème

Dans `custom.css` (lignes 358-362), les `h4` d'article sont définis avec :

```css
article h4 {
  text-transform: uppercase; /* ← brutal, réduit la lisibilité */
  letter-spacing: 0.05em;
  font-size: 0.9rem; /* ← très petit */
  color: var(--ifm-color-emphasis-600); /* ← gris moyen */
  margin-top: 1.25rem;
}
```

En **dark mode**, `emphasis-600` donne un gris très peu contrasté sur fond sombre. Combiné au uppercase et à la petite taille, les h4 sont quasi-invisibles.

## Visuel

```
AVANT (actuel)

INSTALLATION DES DÉPENDANCES   ← uppercase, 0.9rem, gris — difficile à scanner
Lorem ipsum dolor sit amet...

──────────────────────────────────────────────────────

APRÈS (proposition)

Installation des dépendances   ← small-caps, 0.95rem, couleur primaire
Lorem ipsum dolor sit amet...
```

## Fix

**Fichier :** `src/css/custom.css` — remplacer le bloc `article h4` :

```css
/* Remplacer : */
article h4 {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-600);
  margin-top: 1.25rem;
}

/* Par : */
article h4 {
  font-variant: small-caps;
  letter-spacing: 0.04em;
  font-size: 0.95rem;
  color: var(--ifm-color-primary-dark);
  margin-top: 1.25rem;
}

[data-theme="dark"] article h4 {
  color: var(--ifm-color-primary-light);
}
```

## Impact

- Fichier : `src/css/custom.css`
- Tous les articles utilisant des titres `####`
- Test : ouvrir un article avec des h4 → vérifier contraste en light ET dark mode
