# Amélioration — Cards blog : afficher le tag principal

## Problème

Les cards de la page `/blog` (et de la homepage section "Latest posts") ne montrent aucune indication du sujet. Le lecteur doit ouvrir chaque article pour savoir si c'est du Docker, du WSL, du Python, etc. Sur un blog avec 242 articles, c'est une vraie friction à la découverte.

Le tag principal (`mainTag`) est déjà disponible dans `frontMatter` de chaque article et est déjà stylé (`.mainTagBadge`) dans `src/theme/BlogPostItem/Header/Info/styles.module.css` — il suffit de le réutiliser sur les cards de liste.

## Visuel

```
AVANT — card sans tag
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│                                 │
│ Titre de l'article              │
│ Description en deux lignes...   │
│ 5 janv. 2026                    │
└─────────────────────────────────┘

APRÈS — card avec badge tag
┌─────────────────────────────────┐
│ ████████ image ████████████████ │
│                                 │
│ [DOCKER]  Titre de l'article    │  ← badge vert en haut du body
│ Description en deux lignes...   │
│ 5 janv. 2026                    │
└─────────────────────────────────┘
```

## Fix

**Fichier :** `src/theme/BlogListPage/index.js` (le composant BlogCard swizzlé)

Dans le JSX du `BlogCard`, après l'image et avant le titre, ajouter :

```jsx
{
  metadata.frontMatter?.mainTag && (
    <a
      href={`/tags/${metadata.frontMatter.mainTag}`}
      className={styles.cardTagBadge}
      onClick={(e) => e.stopPropagation()}
    >
      {metadata.frontMatter.mainTag}
    </a>
  );
}
```

**Fichier :** `src/theme/BlogListPage/styles.module.css` — ajouter :

```css
.cardTagBadge {
  display: inline-block;
  margin-bottom: 0.4rem;
  padding: 0.1rem 0.55rem;
  border-radius: 2rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  background-color: var(--ifm-color-primary);
  color: #fff;
  transition: background-color 0.2s ease;
}

.cardTagBadge:hover {
  background-color: var(--ifm-color-primary-dark);
  color: #fff;
  text-decoration: none;
}

[data-theme="dark"] .cardTagBadge {
  background-color: var(--ifm-color-primary-dark);
}
```

## Impact

- Fichiers : `src/theme/BlogListPage/index.js` + `src/theme/BlogListPage/styles.module.css`
- Page `/blog` et section "Latest posts" de la homepage
- Test : ouvrir `/blog` → chaque card doit afficher un badge coloré avec le mainTag · cliquer le badge doit mener à `/tags/{tag}`
