# Amélioration — ScrollToTopButton : remplacer up.webp par le suricate

## Idée

Le bouton "scroll to top" utilise actuellement `/img/up.webp` — une image générique. Or :

1. Le fichier `/img/meerkat/suricate_no_background.webp` existe (transparent background, propre pour overlay)
2. L'animation `flyUp` est déjà en place : le bouton **décolle vers le haut** quand on clique dessus

Résultat si on remplace l'image : **le suricate s'envole littéralement vers le ciel quand on clique** — fidèle au personnage et mémorable pour le lecteur.

C'est le genre de petit détail qu'on remarque une fois, qu'on adore, et dont on se souvient.

## Visuel

```
AVANT                                  APRÈS
─────────────────────────              ─────────────────────────

                    ╔════╗                              ╔════╗
                    ║ ↑  ║                              ║ 🐾 ║  ← suricate debout
                    ╚════╝                              ╚════╝

Au clic :                              Au clic :
  ║ ↑  ║                                ║ 🐾 ║
     ↑                                     ↑
  ║ ↑  ║  → monte                       ║ 🐾 ║  → décolle !
     ↑         vers le haut                ↑         vers le ciel !
    (petit)    disparaît                  (petit)    s'envole
```

## Fix

**Fichier :** `src/components/ScrollToTopButton/index.js`

```js
// Remplacer :
import buttontop from '@site/static/img/up.webp'

// Par :
import buttontop from '@site/static/img/meerkat/suricate_no_background.webp'
```

C'est tout. L'image est déjà ronde (CSS `border-radius: 50%`), le drop-shadow existe (`box-shadow`), et l'animation `flyUp` fait déjà partir l'image vers le haut.

**Optionnel — ajuster l'image pour qu'elle soit centrée dans le cercle** :
Le suricate a de l'espace transparent tout autour. Si le rendu est trop "petit", réduire le `width/height` du bouton de 44px → 52px sur desktop ou ajouter `object-fit: contain` sur l'img.

## Impact

- Fichier : `src/components/ScrollToTopButton/index.js`
- Toutes les pages (le bouton est global)
- Test : scroller vers le bas d'un article → le suricate apparaît → cliquer → il s'envole vers le haut
