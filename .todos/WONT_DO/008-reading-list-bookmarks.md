# 008 — Reading List / Bookmarks

**WOW level: 6/10**
**Effort: Low**
**Inspired by: Pocket, dev.to bookmarks, browser read-later**

## Concept

Un bouton "🔖 Save for later" sur chaque article. Les articles sauvegardés sont accessibles via une page `/reading-list` qui affiche la liste des articles mis de côté par le visiteur.

Tout est en `localStorage` — aucun backend, aucun compte requis.

## UX Flow

1. Lecteur arrive sur un article → voit le bouton "🔖 Save for later" (ou "📌 Bookmark")
2. Clic → l'article est ajouté à la reading list, bouton passe à "✅ Saved — View list"
3. Sur `/reading-list` : liste de tous les articles sauvegardés avec titre, date, tags, lien
4. Bouton "Remove" par article
5. Bouton "Clear all"

## Architecture

### Frontend — `src/components/BookmarkButton/index.js`

```js
// lit metadata.permalink + metadata.title
// stocke dans localStorage['readingList'] = JSON array de { permalink, title, date, tags }
// button state géré localement
```

### Page — `src/pages/reading-list.js`

```jsx
// Page Docusaurus normale (pas un article)
// Lit localStorage['readingList']
// Affiche les articles sous forme de cards
// Si liste vide : "Your reading list is empty. Browse the blog to save articles."
```

## LocalStorage schema

```json
[
  {
    "permalink": "/blog/docker-tips",
    "title": "10 Docker Tips I Wish I Knew Earlier",
    "date": "2024-11-15",
    "tags": ["docker", "linux"]
  }
]
```

## Intégration

Dans le swizzle `BlogPostPage`, ajouter `<BookmarkButton metadata={metadata} />` près du header ou du composant `Reaction`.

## Limite SSR

`localStorage` n'est pas disponible côté serveur (SSR Docusaurus). Utiliser `useEffect` pour lire l'état initial, comme dans `Reaction`.

## TODO steps

- [ ] Créer `src/components/BookmarkButton/index.js` + styles
- [ ] Créer `src/pages/reading-list.js`
- [ ] Intégrer dans le layout BlogPostPage
- [ ] Gérer le cas SSR (localStorage non disponible)
- [ ] Ajouter un lien "Reading List" dans la navbar
