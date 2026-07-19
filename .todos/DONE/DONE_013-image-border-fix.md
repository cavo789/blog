# Fix — Bordure d'image lime néon

## Problème

Dans `src/theme/MDXComponents.js` (ligne 84), toutes les images Markdown inline reçoivent une bordure codée en dur :

```js
style={{
  border: "6px solid #c0e967",
  borderRadius: "6px",
  ...style,
}}
```

- En **light mode** : bordure lime vive, agressive
- En **dark mode** : effet néon (lime fluo sur fond sombre) — très perturbant
- La valeur écrase le styling élégant déjà défini dans `custom.css` (`border-radius: 10px`, `box-shadow`)

## Visuel

```
AVANT                                  APRÈS (option A — sans bordure)
──────────────────────────             ──────────────────────────
┌──────────────────────┐               ┌──────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← lime 6px    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← shadow + radius
│▓▓▓▓ image ▓▓▓▓▓▓▓▓▓▓│ #c0e967       │  ▓▓▓▓ image ▓▓▓▓▓▓▓  │   de custom.css
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│               │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────┘               └──────────────────────┘

APRÈS (option B — bordure theme-aware fine)
──────────────────────────
Light : border: 2px solid #2e8555  (vert primaire)
Dark  : border: 2px solid #25c2a0  (teal primaire)
```

## Fix

**Fichier :** `src/theme/MDXComponents.js`

**Option A — supprimer la bordure (recommandée) :**

```js
img: (props) => {
  const { loading, decoding, className, style, height, width, ...rest } = props;
  return (
    <img
      {...rest}
      height="auto"
      width=""
      loading={loading || "lazy"}
      decoding={decoding || "async"}
      className={`${className || ""}`}
      style={{ ...style }}
    />
  );
},
```

**Option B — bordure theme-aware :**

```js
style={{
  border: "2px solid var(--ifm-color-primary)",
  borderRadius: "10px",
  ...style,
}}
```

## Impact

- Fichier : `src/theme/MDXComponents.js`
- Toutes les pages d'articles avec des images Markdown
- Test : ouvrir un article avec des images → vérifier en light ET dark mode
