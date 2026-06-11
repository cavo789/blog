# 007 — Reading Progress Bar

**WOW level: 5/10**
**Effort: Very Low**
**Inspired by: Medium, dev.to**

## Concept

Une fine barre de progression (2-3px) en haut de page qui indique visuellement l'avancement dans la lecture de l'article. Disparaît quand on quitte l'article.

Simple mais très soigné. Donne une sensation de "qualité" au blog.

## Implementation

Aucun backend requis. Purement CSS + JS côté client.

### Option A — Swizzle du layout `BlogPostPage`

```jsx
// src/theme/BlogPostPage/index.js (swizzle wrap)
import ReadingProgress from '@site/src/components/ReadingProgress';

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <ReadingProgress />
      <BlogPostPage {...props} />
    </>
  );
}
```

### `src/components/ReadingProgress/index.js`

```js
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={styles.bar}
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
```

### `styles.module.css`

```css
.bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--ifm-color-primary);
  z-index: 9999;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}
```

## Variante

Ajouter un indicateur "X min remaining" dans la barre de navigation, calculé à partir du scroll position et du reading time estimé.

## TODO steps

- [ ] Créer `src/components/ReadingProgress/index.js` + `styles.module.css`
- [ ] Swizzler `BlogPostPage` pour l'inclure
- [ ] Tester sur mobile (ne pas gêner la navigation)
- [ ] Vérifier que la barre ne s'affiche pas sur les pages non-article
