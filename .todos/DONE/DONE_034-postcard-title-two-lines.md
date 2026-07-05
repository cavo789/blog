# Fix — PostCard : titres tronqués silencieusement sur une ligne

## Problème

`src/components/Blog/PostCard/styles.module.css` (layout enhanced, utilisé sur `/series`) tronque les titres à une seule ligne :

```css
.cardTitle {
  white-space: nowrap;        /* ← force une seule ligne */
  text-overflow: ellipsis;    /* ← coupe avec "..." */
  overflow: hidden;
}
```

Des titres comme "Docker Desktop vs Docker Engine in WSL2 — which one should you use?" apparaissent comme "Docker Desktop vs Docker Engine in WSL2 — which..." — le lecteur perd le contexte de l'article.

## Visuel

```
AVANT — une ligne tronquée
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│                                 │
│ Docker Desktop vs Docker Engi…  │  ← coupé, sens perdu
│ Description...                  │
└─────────────────────────────────┘

APRÈS — deux lignes avec clamp
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│                                 │
│ Docker Desktop vs Docker        │
│ Engine in WSL2 — which one…     │  ← 2 lignes, clamp propre
│ Description...                  │
└─────────────────────────────────┘
```

## Fix

**Fichier :** `src/components/Blog/PostCard/styles.module.css`

```css
/* Remplacer : */
.cardTitle {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Par : */
.cardTitle {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## Impact

- Fichier : `src/components/Blog/PostCard/styles.module.css`
- Page `/series` (layout enhanced) et section "Related posts" des articles (layout small)
- Test : `/series` → les titres longs doivent tenir sur 2 lignes proprement sans tronquer abruptement
