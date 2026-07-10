# 042 — StructuredData utilise l'image brute du frontmatter, pas l'image résolue

**Priority:** Medium

## Problème

`src/components/StructuredData/index.jsx` construit le JSON-LD `BlogPosting.image` à partir de
`frontMatter.image` **brut** :

```js
image: frontMatter?.image
  ? { "@type": "ImageObject", url: `${siteUrl}${frontMatter.image}` }
  : undefined,
```

Or `Blog/utils/posts.js` (`getBlogMetadata`) résout déjà ce même champ pour gérer le cas d'une
image co-localisée en chemin relatif (`./banner.jpg` → `/blog/{dir}/banner.jpg`) — logique que
`AGENTS.md` documente explicitement comme pattern supporté ("Co-location pattern" pour les
images). `StructuredData` ne passe pas par cette résolution : si un post utilise
`image: ./banner.jpg` (chemin relatif), le JSON-LD produira
`https://www.avonture.be./banner.jpg` — une URL invalide.

Actuellement **aucun article publié n'utilise ce format relatif** (tous utilisent
`/img/v2/...`), donc le bug est latent, pas actif — mais `getBlogMetadata` continue de
maintenir explicitement le support de ce format, ce qui signifie qu'il est censé rester utilisable.

## Risque

Bug silencieux par nature : une URL d'image cassée dans le JSON-LD n'affecte pas le rendu visuel de
la page, seulement les résultats enrichis Google / prévisualisations sociales. Il ne serait détecté
qu'via Google Search Console ou un test manuel avec le Rich Results Test, bien après publication.

## Solution proposée

Faire consommer `StructuredData` par la même résolution que `getBlogMetadata`, ou factoriser la
logique de résolution d'image dans une fonction exportée réutilisable (`resolvePostImage(image,
dir)`) appelée à la fois par `posts.js` et par `StructuredData`.

## Lien avec l'existant

Aucun TODO existant. Complémentaire à [[035]] (même fichier `utils/posts.js` comme point de
centralisation).
