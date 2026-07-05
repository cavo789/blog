# Amélioration — Hero homepage : ajouter le suricate comme mascotte

## Idée

La page d'accueil présente une vidéo `welcome.mp4` dans la colonne droite du hero. Sur mobile (< 600px) la vidéo est maintenant masquée. Entre 600px et 996px, la vidéo reste présente en version réduite.

La page **admin** utilise déjà `suricate_no_background.webp` avec une animation `float` (montée/descente de 10px en 4s) — effet charmant et cohérent avec la marque.

Opportunité : ajouter le suricate **en complément de la vidéo** (superposé ou dans sa propre zone), ou comme **remplacement de la vidéo sur tablette** (600px–996px). Les 4 variantes de position (`suricate_positions_1-4.webp`) permettent même d'animer un personnage qui change de pose.

## Visuel

```
DESKTOP — hero avec suricate (option A : sous la vidéo)
┌──────────────────────────────────────────────────────┐
│  Hi, I'm Christophe          ┌──────────────────┐   │
│  Personal blog about...      │   welcome.mp4    │   │
│  [Read Blog] [About me]      │   (vidéo)        │   │
│                              └──────────────────┘   │
│                                     🐾 ↕ float      │
└──────────────────────────────────────────────────────┘

TABLETTE 600–996px (option B : suricate remplace la vidéo)
┌──────────────────────────────────────┐
│  Hi, I'm Christophe                  │
│  Personal blog about...              │
│  [Read Blog] [About me]              │
│                                      │
│           🐾 (float animation)       │  ← 160px, centré
└──────────────────────────────────────┘

MOBILE < 600px — inchangé (texte seul, vidéo masquée)
```

## Approche recommandée (option B — tablette)

**Fichier :** `src/components/Blog/HeroSection/styles.module.css`

```css
/* Masquer la vidéo sur tablette, montrer le suricate */
@media (max-width: 996px) and (min-width: 601px) {
  .videoWrapper { display: none; }
  .mascotWrapper { display: flex; justify-content: center; }
}

/* Sur desktop : masquer le suricate (la vidéo suffit) */
@media (min-width: 997px) {
  .mascotWrapper { display: none; }
}

/* Sur mobile : le suricate reste masqué aussi */
@media (max-width: 600px) {
  .mascotWrapper { display: none; }
}

/* Animation float identique à l'admin page */
.mascotImg {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
  animation: floatMascot 4s ease-in-out infinite;
}

@keyframes floatMascot {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

**Fichier :** `src/components/Blog/HeroSection/index.js`

```jsx
{/* Ajouter juste après videoWrapper : */}
<div className={styles.mascotWrapper}>
  <img
    src="/img/meerkat/suricate_no_background.webp"
    alt="Christophe's meerkat mascot"
    className={styles.mascotImg}
  />
</div>
```

## Impact

- Fichiers : `HeroSection/index.js` + `HeroSection/styles.module.css`
- Page d'accueil `/` uniquement
- Test : redimensionner la fenêtre entre 600px et 996px → le suricate doit remplacer la vidéo avec l'animation float
