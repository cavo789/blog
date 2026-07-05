# Amélioration — Page 404 : animer le suricate

## Problème

La page 404 (`src/theme/NotFound/index.js`) utilise une image statique avec un style inline minimal :

```jsx
<img
  src="/img/404.webp"
  style={{ maxWidth: "400px", width: "100%", marginBottom: "2rem" }}
/>
```

Aucune animation, aucune classe CSS. Or la page admin utilise déjà le suricate avec une animation `float` (montée/descente de 10px, 4s infinie) et un `drop-shadow`. La page 404 devrait avoir le même soin visuel.

Un suricate qui flotte doucement sur une page 404 = page d'erreur mémorable et fidèle au personnage du site.

## Visuel

```
AVANT — image statique
─────────────────────────────────────
  [      404.webp — groupe fixe     ]
  Oh no! It looks like you're lost.
  [Take me back to the homepage]

APRÈS — image flottante animée
─────────────────────────────────────
       ↕ (float 10px, 4s loop)
  [      404.webp — groupe animé    ]
  Oh no! It looks like you're lost.
  [Take me back to the homepage]
```

## Fix

**Fichier :** `src/theme/NotFound/index.js`

Remplacer le style inline par une className :
```jsx
import styles from './styles.module.css';  // à créer

<img
  src="/img/404.webp"
  alt="A group of meerkats looking confused."
  className={styles.notFoundImg}
/>
```

**Créer** `src/theme/NotFound/styles.module.css` :
```css
.notFoundImg {
  max-width: 400px;
  width: 100%;
  margin-bottom: 2rem;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2));
  animation: floatMeerkat 4s ease-in-out infinite;
}

@keyframes floatMeerkat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}

[data-theme="dark"] .notFoundImg {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
}
```

## Impact

- Fichiers : `src/theme/NotFound/index.js` + nouveau `src/theme/NotFound/styles.module.css`
- Page 404 uniquement
- Test : naviguer vers une URL inexistante → le groupe de suricates doit doucement flotter
