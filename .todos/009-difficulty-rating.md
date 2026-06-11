# 009 — Reader Difficulty Rating

**WOW level: 7/10**
**Effort: Low-Medium**
**Inspired by: O'Reilly books difficulty levels, Exercism**

## Concept

L'auteur peut indiquer le niveau prévu d'un article en frontmatter. Le lecteur peut voter pour dire si ce niveau correspond à son ressenti. Cela crée un signal utile pour :
- Calibrer l'écriture future
- Aider les lecteurs à choisir leurs articles
- Détecter les articles "mal étiquetés"

## Frontmatter

```yaml
---
title: Advanced Docker Networking
difficulty: intermediate   # beginner | intermediate | advanced
---
```

## UX

Après la lecture, un widget s'affiche :

> **Author's level:** Intermediate
>
> **Your experience?**
> [Too easy] [Just right] [Too hard]

Résultats agrégés (après vote) :
> 12 readers: 8% too easy · 67% just right · 25% too hard

## Architecture

### Frontend — `src/components/DifficultyRating/index.js`

- Lit `metadata.frontMatter.difficulty`
- Si non défini → ne s'affiche pas
- GET `/api/difficulty.php?slug=...` pour charger les counts
- POST `{ slug, rating: 'too_easy' | 'just_right' | 'too_hard' }`
- localStorage pour éviter le double vote

### Backend — `api/difficulty.php`

```
GET ?slug=... → { too_easy: 1, just_right: 8, too_hard: 3 }
POST { slug, rating }
GET ?admin=TOKEN → tous les articles avec écart auteur/lecteurs
```

### Stockage — `api/difficulty-data.json`

```json
{
  "blog/docker-networking": {
    "author_level": "intermediate",
    "too_easy": 1,
    "just_right": 8,
    "too_hard": 3
  }
}
```

## Email d'alerte

Si le ratio "too_hard" dépasse 50% avec au moins 5 votes → email d'alerte :

```
Subject: [Blog] ⚠️ Difficulty mismatch: blog/docker-networking

Author level  : intermediate
Reader votes  : 1 too easy / 8 just right / 3 too hard
"Too hard" rate: 25% (below threshold, no action needed)
```

## Valeur pour le dashboard admin

Tableau trié par "écart maximal" entre niveau auteur et ressenti lecteurs → liste des articles à réviser en priorité.

## TODO steps

- [ ] Créer `api/difficulty.php` avec alerte ratio
- [ ] Créer `src/components/DifficultyRating/index.js` + styles
- [ ] Intégrer dans le layout (conditionnel sur `frontMatter.difficulty`)
- [ ] Ajouter `difficulty` aux conventions de frontmatter
- [ ] Section "Difficulty Mismatches" dans le dashboard admin
