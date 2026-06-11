# 011 — Article Changelog / Update History

**WOW level: 7/10**
**Effort: Low**
**Inspired by: MDN changelog, Wikipedia history, Changelog.md**

## Concept

Chaque article peut afficher un historique de ses révisions importantes via le frontmatter. Cela rassure le lecteur que le contenu est maintenu, et permet de communiquer clairement ce qui a changé.

```yaml
---
title: Install Docker on Ubuntu 24.04
changelog:
  - date: 2025-03-10
    note: Updated for Docker Engine 26.x — new GPG key URL
  - date: 2024-08-05
    note: Added section on Docker socket permissions (rootless mode)
  - date: 2024-04-12
    note: Initial publication
---
```

## UX

Un composant discret affiché en bas de l'article ou sous la date de publication :

```
📋 Update history
▼ 2025-03-10 — Updated for Docker Engine 26.x (new GPG key URL)
  2024-08-05 — Added section on Docker socket permissions
  2024-04-12 — Initial publication
```

Collapsible si plus de 2 entrées. La date la plus récente est toujours visible.

## Architecture

### Frontend — `src/components/ArticleChangelog/index.js`

```jsx
export default function ArticleChangelog({ changelog }) {
  if (!changelog?.length) return null;
  // Trie par date desc
  // Affiche la première entrée visible, les autres dans un <details>
}
```

### Intégration dans le layout

Dans le swizzle `BlogPostPage`, lire `metadata.frontMatter.changelog` :

```jsx
{metadata.frontMatter.changelog && (
  <ArticleChangelog changelog={metadata.frontMatter.changelog} />
)}
```

## Valeur ajoutée

- Réduit les signalements "outdated" sur des articles récemment mis à jour
- Signal de confiance pour les lecteurs ("ce blog est maintenu")
- SEO : Google aime les contenus mis à jour avec une date explicite

## Combinaison avec OutdatedFlag (005)

Si un article a un changelog récent (< 90 jours), supprimer ou dimmer le bouton "Flag as outdated" avec un tooltip : "This article was recently updated (March 2025)."

## TODO steps

- [ ] Créer `src/components/ArticleChangelog/index.js` + styles
- [ ] Intégrer dans le layout BlogPostPage
- [ ] Documenter le format `changelog` dans les conventions frontmatter
- [ ] Rétroactivement enrichir les articles majeurs avec leur historique
- [ ] (Bonus) Lier à 005 pour inhiber le flag outdated si récemment mis à jour
