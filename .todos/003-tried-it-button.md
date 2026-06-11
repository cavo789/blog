# 003 — "I Tried This" Button for Tutorial Articles

**WOW level: 8/10**
**Effort: Low-Medium**
**Inspired by: DigitalOcean tutorials, dev.to**

## Concept

Pour les articles de type tutoriel / how-to (Docker, WSL, etc.), un bouton additionnel en bas de page :

> ✅ I tried this and it worked! &nbsp;&nbsp; ❌ It didn't work for me

Plus précis que "helpful/not helpful" pour du contenu technique procédural. Un lecteur peut avoir trouvé l'article bien écrit mais ne pas avoir réussi à reproduire les étapes.

## Différence avec `Reaction`

| Reaction | TriedIt |
|---|---|
| Article globalement utile ? | Les commandes/étapes fonctionnent-elles ? |
| Qualitatif | Fonctionnel / reproductible |
| Tous types d'articles | Articles tutoriels uniquement |

## Activation via frontmatter

```yaml
---
title: Install Docker on Ubuntu 24.04
tags: [docker, linux]
tried_it: true   # active le composant TriedIt
---
```

## Architecture

### Frontend — `src/components/TriedIt/index.js`

- Même mécanique que `Reaction` (fetch GET au chargement, POST au clic)
- localStorage key : `tried_it_${slug}`
- Endpoint : `/api/tried-it.php`

### Backend — `api/tried-it.php`

Stockage dans `tried-it-data.json` :
```json
{
  "blog/install-docker-ubuntu": {
    "worked": 34,
    "didnt_work": 7
  }
}
```

Email de notification si ratio "didn't work" dépasse 30% avec au moins 10 votes → signal d'alerte "cet article est peut-être cassé".

## Email d'alerte spéciale

```
Subject: [Blog] ⚠️ Tutorial may be broken: blog/install-docker-ubuntu

Success rate has dropped to 63% (7 failures out of 19 attempts).
Consider reviewing the steps.
```

## Intégration dans le layout

Dans le swizzle `BlogPostPage`, lire `frontMatter.tried_it` :
```jsx
{metadata.frontMatter.tried_it && <TriedIt metadata={metadata} />}
```

## TODO steps

- [ ] Créer `api/tried-it.php` avec logique d'alerte ratio
- [ ] Créer `src/components/TriedIt/index.js` + `styles.module.css`
- [ ] Modifier le layout swizzled pour lire `frontMatter.tried_it`
- [ ] Ajouter `tried_it` aux frontmatter docs/conventions
- [ ] Tagger les articles tutoriels existants
