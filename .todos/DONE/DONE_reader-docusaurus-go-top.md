# Reader review : docusaurus-go-top

**Détecté :** 2026-08-08
**Article :** blog/2025/09/12/docusaurus-go-top/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (aucune preuve visuelle dans tout le corps, sur 50 lignes).
Drapeaux : abstraction-avant-preuve (les deux `<Snippet>` du composant, l. 39-41, arrivent
immédiatement après le sous-titre, sans qu'aucun rendu ne soit montré).
Redondance : aucune (article court, une seule répétition normale sur "restart Docusaurus").

Test des 30 secondes : le lecteur sait qu'un bouton "back to top" existe quelque part sur ce
blog (l. 29 le décrit en mots) mais ne le voit jamais capturé — il doit scroller lui-même la
page en cours pour vérifier que ça marche vraiment. J'abandonne si je ne suis pas déjà motivé,
faute d'une preuve visuelle immédiate du résultat.

## Risque

Le lecteur ne peut pas juger en un coup d'œil si le petit gadget (l'icône animée, son
comportement au clic) vaut la peine d'ajouter deux fichiers et de swizzler `BlogPostItem`. La
preuve existe déjà — cet article même en est un exemple vivant — mais elle n'est jamais capturée
ni montrée dans le texte.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 25-29 |
| 2 | **Nouveau** : capture d'écran (ou GIF) du bouton "back to top" en action (icône visible en bas à droite, clic → retour en haut) — à produire | — |
| 3 | How it works (inchangé) | l. 33-48 |
| 4 | Overriding the BlogPostItem page (inchangé) | l. 50-75 |
| 5 | You can do this for other pages for sure (inchangé, sert de conclusion/ouverture) | l. 77-81 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** ce RESTRUCTURE nécessite une capture qui n'existe pas encore — à produire avant
d'implémenter, sinon l'article reste à 100 % de TTV même réordonné.

---

## Contre-audit du 2026-08-11 — rouvert en PARTIAL

Le TODO avait été classé `DONE` mais le blocage réel n'a pas été levé : aucune capture n'a été
produite. La restructuration du commit `638b86c5` s'est contentée d'insérer un commentaire HTML
dans l'article :

```html
<!-- TODO(author): capture a real screenshot (or short GIF) of the meerkat "back to top" icon
     appearing bottom-right while scrolled down on this blog, plus the click-to-top behavior
     — not reproducible in this session (requires a live browser). -->
```

Mesures inchangées depuis le 2026-08-08 :

- Time to value : **100 %** — corps de 52 lignes, toujours aucune preuve visuelle.
- Drapeau : abstraction-avant-preuve — `<Snippet>` `ScrollToTopButton/index.js` l. 41, puis
  `styles.module.css` l. 43, avant tout rendu.
- Pas de `## Conclusion` : l'article se termine sur « You can do this for other pages for sure ».

**Ce qu'il reste à faire (une seule chose) :** produire l'asset. Le bouton tourne en production
sur ce blog — il suffit d'une capture (ou d'un GIF) de l'icône suricate en bas à droite pendant
le scroll, à déposer dans `blog/2025/09/12/docusaurus-go-top/images/`, puis de l'insérer juste
après le `<!-- truncate -->` (l. 31) à la place du commentaire `TODO(author)`. Le réordonnancement
proposé plus haut est déjà appliqué pour tout le reste.

Tant que l'asset n'existe pas, le réordonnancement seul laisse l'article à 100 % de TTV — c'est
exactement ce qui s'est produit.

---

## Résolution du 2026-08-11 — DONE

Le blocage « requires a live browser » n'en était pas un : **Playwright et son Chromium sont déjà
installés** dans ce dépôt (`package.json` l. 82, `~/.cache/ms-playwright/chromium-1228`). Les
captures ont donc été produites pour de vrai, pas simulées.

Méthode : `yarn build` puis `yarn serve --port 3210`, et un script Playwright qui ouvre
`/blog/docusaurus-go-top`, scrolle à 1400 px (le composant n'affiche le bouton qu'au-delà de
300 px, cf. `window.scrollY > 300` dans `ScrollToTopButton/index.js`), attend la fin de la
transition, puis capture. Conversion PNG → WebP via `sharp`, déjà présent lui aussi.

### Assets produits

- `images/go_top_button.webp` — viewport 1280x800, `deviceScaleFactor: 2` : la page elle-même
  scrollée, le suricate visible en bas à droite au-dessus du contenu.
- `images/go_top_button_zoom.webp` — crop serré (`deviceScaleFactor: 3`) sur le bouton rond,
  pour que l'icône soit lisible.

### Modifications de l'article

- Le commentaire `<!-- TODO(author) -->` (l. 33) est remplacé par une vraie section
  `## What it looks like` portant les deux captures — mouvement 2 du skill.
- **Time to value : 100 % → 8,8 %** (preuve l. 37, truncate l. 31, corps de 68 lignes). Cible
  < 15 % atteinte.
- Le drapeau abstraction-avant-preuve tombe : les `<Snippet>` du composant arrivent désormais
  après la preuve.
- `## Conclusion` ajoutée (son absence était relevée par le contre-audit), avec lien de sortie
  vers `docusaurus-relatedposts`.
- **Correction annexe :** l'`<AlertBox variant="info">` demandait de créer `/img/up.png`, alors
  que le `<Snippet>` juste au-dessus importe
  `@site/static/img/meerkat/suricate_no_background.webp`. La consigne contredisait le code
  affiché ; elle pointe maintenant vers l'import réel.

`yarn build` : exit 0, 0 warning, 0 lien cassé.
