# 0128 — Composant `<Meerkat>` pour illustrer les articles avec les 68 emojis

- **Priority**: Medium
- **Batch**: meerkat-mascot
- **Depends**: —
- **Files**: `src/components/Meerkat/index.tsx`, `src/components/Meerkat/styles.module.css`, `src/theme/MDXComponents.js`

## Problème

`static/img/meerkat/emojis/` contient 68 vignettes 256×256 en `.webp`, nommées
`categorie_concept_variante` : `emotion_` (26), `job_` (14), `tech_` (10), `activity_` (10),
`gesture_` (8).

Ce stock est aujourd'hui **inexploitable en rédaction**. Pour illustrer un paragraphe, il faut
écrire à la main le chemin complet, l'extension, et réinventer un `alt` à chaque fois :

```mdx
<Image src="/img/meerkat/emojis/emotion_angry_red.webp" alt="..." />
```

Personne ne retient 68 chemins. C'est déjà le sort des poses existantes (`suricate_*.webp`),
utilisées uniquement depuis du code de composant, jamais depuis un article.

## API visée

```mdx
<Meerkat variant="angry_red" size="small" />
```

Le composant cache le chemin, l'extension et le `alt`, et porte le CSS/JS que l'image réclame
(voir Risque 1) — un auteur écrit un concept, pas une URL.

Noter que `variant="angry"` **ne résout vers rien** : les deux images fâchées s'appellent
`angry_red` et `angry_steaming`, le second mot décrit l'image et n'est pas un numéro de variante.
Voir « Comment `variant` résout » pour l'arbitrage.

## Risque

### 1. Le fond n'est pas transparent — c'est ce qui justifie le composant

Les 68 `.webp` ont `alpha=false` et un fond crème uniforme `#FAFBF6`. Posées telles quelles, elles
dessinent un carré clair : discret en light, franchement visible en dark mode.

Le contournement en place dans `AskMyBlog` et `BlogListPage` est un masque circulaire
(`border-radius: 50%` + `object-fit: cover`). Il ne marche que parce que les sujets sont centrés —
mesuré sur les 68 : boîte de contenu 0,084 → 0,916, centrée.

C'est exactement le CSS que le composant doit porter **une fois pour toutes**. Sans lui, chaque
auteur le réinvente ou l'oublie, et le troisième article affiche un carré crème sur fond sombre.

### 2. Ne pas réécrire `Image`

`src/components/Image/index.tsx` fait déjà la résolution de `baseUrl` et le `loading="lazy"`.
`<Meerkat>` doit être un wrapper mince par-dessus (variant → chemin + `alt` + taille + masque), pas
une seconde implémentation qui divergera.

### 3. Ne pas importer les images, les référencer

Ces `.webp` font 5–18 KB, donc **sous le seuil d'inline de webpack**. Un
`import x from "@site/static/..."` les envoie en base64 dans le chunk : mesuré sur `/map`, un
`require.context` sur le dossier a gonflé le chunk à 502 KB (363 KB gzip) pour 68 images.
Passer par `withBaseUrl("/img/meerkat/emojis/<nom>.webp")`, comme le font déjà les deux états vides.

### 4. Le `alt` doit être traduit

Le site est bi-locale. Un `alt` codé en dur dans l'article ne suivra pas dans `i18n/fr/`. Soit le
composant fournit un `alt` par défaut via `translate()`, soit il impose la prop à l'auteur — mais
le choix doit être explicite.

## À trancher avant d'implémenter

### Comment `variant` résout vers un fichier

Bonne nouvelle mesurée sur le corpus : **une fois le préfixe de catégorie retiré, les 63 noms
courts sont uniques** — aucune collision entre catégories. `variant="angry_red"` suffit donc, le
composant retrouve `emotion_` tout seul. L'auteur n'a jamais à écrire la catégorie.

Reste un seul cas à arbitrer : **5 concepts ont deux images** (63 concepts pour 68 fichiers).

| Concept | Fichiers |
| ------- | -------- |
| `angel` | `emotion_angel_1`, `emotion_angel_2` |
| `heart_eyes` | `emotion_heart_eyes_1`, `emotion_heart_eyes_2` |
| `laughing` | `emotion_laughing_1`, `emotion_laughing_2` |
| `dancing` | `activity_dancing_1`, `activity_dancing_2` |
| `chef` | `job_chef_1`, `job_chef_2` |

Trois options :

- `variant="chef"` → prend `_1` par défaut, `variant="chef_2"` pour l'autre. **Recommandé** : le cas
  courant reste court, le cas rare reste possible.
- exiger toujours le suffixe (`chef_1`) — cohérent, mais verbeux pour 58 concepts sur 63.
- choix aléatoire — à éviter : rend le rendu non reproductible entre deux builds.

Et si le variant n'existe pas : échouer visiblement en dev plutôt que rendre une image cassée.

#### Le cas des noms composés

Quatre familles partagent un premier mot sans être des variantes d'un même sujet :

| Famille | Fichiers | Même sujet ? |
| ------- | -------- | ------------ |
| `thumbs` | `gesture_thumbs_up`, `gesture_thumbs_down` | non — gestes opposés |
| `ai` | `tech_ai_brain`, `tech_ai_vision` | non — deux illustrations distinctes |
| `approved` | `tech_approved_check`, `tech_approved_sign` | non — coche seule vs panneau |
| `angry` | `emotion_angry_red`, `emotion_angry_steaming` | **oui** — même émotion, deux rendus |

Pour les trois premières, exiger le nom complet est la seule lecture correcte : `variant="thumbs"`
n'a pas de sens. Seul `angry` est un vrai doublon sémantique, et le résoudre demanderait de
renommer les deux fichiers en `angry_1` / `angry_2` — ce qui perdrait l'information portée par
`red` et `steaming`.

**Conséquence sur l'API :** `variant` prend le nom court complet (63 valeurs, uniques), pas un
concept tronqué. Le raccourci sans suffixe ne vaut que pour les 5 concepts numérotés du tableau
ci-dessus.

### Ce que couvre `size`

Des tokens (`small` / `medium` / `large`) plutôt qu'une largeur libre, pour que les articles ne
dérivent pas vers 68 tailles arbitraires. Reste à fixer les valeurs et le défaut.

### Position dans le texte

L'usage visé est une illustration à côté d'un paragraphe, pas une image pleine largeur : prévoir
`align` (`left` / `right` / `center`) avec un flottement propre, et vérifier le rendu mobile où le
flottement doit tomber.

### Animation, éventuellement

`src/pages/admin.js` anime déjà `suricate_no_background.webp` avec un `float` (±10 px sur 4 s). Si
le composant doit pouvoir faire pareil, c'est une prop opt-in — jamais par défaut : une animation
permanente à côté d'un paragraphe gêne la lecture.

## La liste des noms existe déjà — la réutiliser

`src/components/BlogGraph/meerkats.ts` (écrit pour les bulles de `/map`) expose déjà ce dont le
composant a besoin :

- `MEERKAT_NAMES` — les 68 noms de base, sans extension, triés, **lus du dossier au build**. Ajouter
  ou renommer une vignette ne demande donc aucune édition de code.
- `MEERKAT_BY_MAIN_TAG` — la correspondance `mainTag` → sticker, spécifique à `/map`.
- `meerkatPathFor(node)` — construit le chemin servi.

`<Meerkat>` doit importer `MEERKAT_NAMES` plutôt que de redéclarer la liste à la main : deux
inventaires du même dossier divergeraient au premier renommage.

Le module lit le dossier avec `require.context(dir, false, /\.webp$/, "weak")`. Le mode `"weak"` est
le point à ne pas perdre : `keys()` reste peuplé, donc la liste vient bien du dossier, mais webpack
n'embarque aucun module — c'est ce qui a ramené le chunk de `/map` de 502 KB (363 KB gzip) à 32 KB
(10 KB gzip). Reprendre le même import, jamais un `require.context` classique (cf. Risque 3).
