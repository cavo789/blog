# 0116 — Fil d'Ariane sur les articles + graph `BreadcrumbList` dans les données structurées

- **Priority**: High — effet SEO direct, périmètre fermé
- **Batch**: blog-article-header
- **Depends**: —
- **Files**: `src/components/Blog/Breadcrumb/` (à créer), `src/theme/BlogPostItem/Header/index.js`, `src/components/StructuredData/index.tsx`

## Problème

[actuia.com](https://www.actuia.com/) affiche en tête d'article un fil d'Ariane cliquable
(`Accueil › Nouveau modèle › GPT-6 Astra…`) et l'expose en JSON-LD.

Chez nous, deux manques distincts :

1. **Visuellement**, la seule trace de hiérarchie est le badge `mainTag` dans la ligne d'info
   (`src/theme/BlogPostItem/Header/Info/index.js`, composant `MainTagBadge`). Il n'y a ni retour vers
   `/blog`, ni mention de la série alors que **176 articles sur 255 appartiennent à une série** — un
   lecteur qui atterrit au milieu de « Creating Docusaurus components » (22 articles) ou de « Modern
   CLI tools for your terminal » (8 articles) n'a aucun signal de position dans le parcours à cet
   endroit de la page.
2. **En données structurées**, `src/components/StructuredData/index.tsx` n'émet que les types
   `BlogPosting`, `Person`, `Organization`, `ImageObject` et `WebPage`. **Aucun `BreadcrumbList`.**
   Vérifié par grep sur les `"@type"` du fichier.

C'est le second point qui porte la valeur : sans `BreadcrumbList`, Google affiche l'URL brute sous le
titre dans les résultats de recherche au lieu du chemin lisible `avonture.be › docker › lazydocker`.

Une recherche a été faite dans tout `.todos/` : le mot « breadcrumb » n'apparaît que dans
`src/components/FaqThemePage/` et `src/css/custom.css` (usage sans rapport, page FAQ). Aucun TODO
existant ne couvre le sujet.

## Solution

Un composant `Breadcrumb` (TypeScript, CSS Module, `readme.md` — conventions `AGENTS.md`) rendu en
tête de `BlogPostItemHeader`, page article uniquement :

```text
Home › <mainTag> › <série, si présente> › <titre de l'article, non cliquable>
```

Puis ajouter le graph `BreadcrumbList` correspondant dans `StructuredData`, avec les mêmes niveaux
et dans le même ordre — un fil d'Ariane visible qui ne correspond pas au JSON-LD est pire que pas de
JSON-LD du tout aux yeux d'un crawler.

Points d'attention :

- **Le lien du tag doit être construit comme dans `MainTagBadge`**, qui applique
  `.replace("/blog/tags/tags/", "/blog/tags/")` — il y a un doublon de segment dans les permaliens
  générés. Ne pas réinventer la construction du lien : soit factoriser cette logique, soit la
  réutiliser telle quelle.
- **`onBrokenLinks: "throw"`** est actif : un article dont le `mainTag` ne correspond à aucun tag
  résolu doit dégrader en sautant simplement ce niveau, pas produire un lien mort.
- Les articles **sans série** (79 sur 255) sautent ce niveau.
- Le dernier niveau (le titre) n'est pas un lien, mais reste un `ListItem` dans le JSON-LD.

## Risque

- **Empilement visuel en tête d'article.** Avec le chapeau du TODO 0115, la tête d'article gagne deux
  blocs. Le fil d'Ariane doit rester discret (petite taille, couleur secondaire) et ne pas concurrencer
  le `<h1>`. Les deux TODOs partagent le même batch précisément pour être arbitrés ensemble à l'œil.
- **Incohérence silencieuse entre l'affichage et le JSON-LD** si les deux sont construits
  séparément : dériver les deux de la même fonction, pas de deux calculs parallèles.
- **Redondance avec le badge `mainTag`** déjà présent dans la ligne d'info : si le fil d'Ariane
  reprend le tag, le badge fait doublon. À trancher pendant l'implémentation — garder l'un des deux.

## Acceptance

- [ ] Le fil d'Ariane s'affiche en tête de la page d'article, et nulle part en vue liste
- [ ] Les niveaux sont cliquables et mènent à des routes réelles (`yarn build` avec
      `onBrokenLinks: "throw"` passe)
- [ ] Un article sans série, et un article dont le `mainTag` ne résout pas, dégradent proprement
- [ ] `StructuredData` émet un `BreadcrumbList` dont les items correspondent **exactement** aux
      niveaux affichés
- [ ] Le JSON-LD est validé sur au moins deux articles (avec et sans série) via le test des résultats
      enrichis de Google ou `validator.schema.org`
- [ ] Le doublon avec le badge `mainTag` est tranché et le perdant est retiré
- [ ] `yarn lint && yarn format:check && yarn build` passent
