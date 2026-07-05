# Amélioration — Cards blog : afficher le temps de lecture estimé

## Problème

Les cards de `/blog` et de la section "Latest posts" de la homepage affichent uniquement la date de publication. Le temps de lecture (`readingTime`) est pourtant calculé par Docusaurus (`showReadingTime: true` dans `docusaurus.config.js`) et disponible dans les métadonnées de chaque post.

Sans indication de durée, le lecteur ne peut pas évaluer s'il a le temps de lire un article avant de cliquer — friction inutile.

## Visuel

```
AVANT — carte actuelle
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│ [DOCKER]                        │
│ Titre de l'article              │
│ Description en deux lignes...   │
│ 5 janv. 2026                    │  ← date seule
└─────────────────────────────────┘

APRÈS — avec lecture estimée
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│ [DOCKER]                        │
│ Titre de l'article              │
│ Description en deux lignes...   │
│ 5 janv. 2026  ·  8 min read     │  ← date + temps
└─────────────────────────────────┘
```

## Fix

**Fichier :** `src/theme/BlogListPage/index.js`

Étape 1 — extraire `readingTime` dans la liste des données :
```js
// Ajouter dans le .map() qui construit les posts :
readingTime: m.readingTime,
```

Étape 2 — dans le JSX de `BlogCard`, après la date :
```jsx
{post.readingTime && (
  <span className={styles.cardReadingTime}>
    · {Math.ceil(post.readingTime)} min read
  </span>
)}
```

**Fichier :** `src/theme/BlogListPage/styles.module.css` — ajouter :
```css
.cardReadingTime {
  font-size: 0.8rem;
  color: var(--ifm-color-secondary-dark);
  font-style: italic;
}

[data-theme='dark'] .cardReadingTime {
  color: var(--ifm-color-secondary-light);
}
```

## Impact

- Fichiers : `src/theme/BlogListPage/index.js` + `styles.module.css`
- Page `/blog` et section "Latest posts" de la homepage
- Test : `/blog` → chaque card doit afficher "5 janv. 2026 · 8 min read"
