# Fix — RelatedPosts : h3 sans séparation visuelle

## Problème

`src/components/Blog/RelatedPosts/index.js` rend un `<h3>` brut sans classe CSS ni wrapper :

```jsx
<h3>
  <Translate id="blog.relatedPosts.title">Related posts</Translate>
</h3>
<div className="row">
  {related.map(...)}
</div>
```

Le h3 n'a pas de `margin-top` spécifique — il se colle directement contre la section Bluesky qui le précède. Sur la page, l'enchaînement visuel est :

```
[Zone Bluesky — commentaires]
Related posts               ← h3 sans séparation
[cards cards cards]
```

De plus, le style du h3 ne correspond pas à la charte des autres titres de section du site.

## Visuel

```
AVANT
─────────────────────────────────────────────
  ┌─────────────────────────────────────┐
  │  💬 Bluesky — 3 commentaires        │
  └─────────────────────────────────────┘
  Related posts                           ← h3 brut, sans espace
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  card    │  │  card    │  │  card    │

APRÈS
─────────────────────────────────────────────
  ┌─────────────────────────────────────┐
  │  💬 Bluesky — 3 commentaires        │
  └─────────────────────────────────────┘

  ─────────────────────────────────────────  ← séparateur
  Related posts                              ← h3 avec style cohérent
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  card    │  │  card    │  │  card    │
```

## Fix

**Fichier :** `src/components/Blog/RelatedPosts/index.js`

```jsx
return (
  <>
    <div
      style={{
        borderTop: "1px solid var(--ifm-color-emphasis-200)",
        margin: "2.5rem 0 1.5rem",
      }}
    >
      <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
        <Translate id="blog.relatedPosts.title">Related posts</Translate>
      </h3>
    </div>
    <div className="row">...</div>
  </>
);
```

Ou mieux, créer un module CSS `styles.module.css` pour RelatedPosts et styler proprement avec `border-left: 4px solid var(--ifm-color-primary)` comme les h2/h3 d'article.

## Impact

- Fichier : `src/components/Blog/RelatedPosts/index.js`
- Tous les articles ayant des posts liés (la majorité)
- Test : ouvrir un article avec "Related posts" → une séparation claire doit apparaître avant la section
