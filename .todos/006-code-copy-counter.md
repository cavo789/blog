# 006 — Code Block Copy Counter

**WOW level: 7/10**
**Effort: Low**
**Inspired by: npm download counts, GitHub star counts**

## Concept

Chaque code block affiche discrètement combien de fois il a été copié :

```
$ docker compose up -d          [Copy]  · copied 47×
```

Ce chiffre donne de la crédibilité aux snippets les plus utilisés et aide à identifier les commandes "hot" dans les articles.

## Architecture

### Tracking

Docusaurus swizzle du composant `CodeBlock` (ou hook sur le bouton "Copy" existant via `onCopy`).

Chaque code block a besoin d'un identifiant stable. Options :
1. Hash MD5/SHA du contenu du bloc → stable tant que le code ne change pas
2. `id` explicite dans la fence : `````bash id="compose-up"`````

Option 1 plus pratique (aucun changement dans les articles).

### Frontend — `src/theme/CodeBlock/index.js` (swizzle)

```js
// Wrapper autour du CodeBlock Docusaurus
// Au clic sur "Copy", envoie POST /api/copy-count.php { blockId, slug }
// Affiche le compteur chargé via GET /api/copy-count.php?blockId=...
```

### Backend — `api/copy-count.php`

Léger, pas d'email. Juste du comptage.

```
GET ?blockId=abc123 → { count: 47 }
POST { blockId, slug } → incrémente
GET ?admin=TOKEN → top 50 des blocks les plus copiés, groupés par article
```

### Stockage — `api/copy-counts.json`

```json
{
  "a3f8c1d2": { "slug": "blog/docker-tips", "count": 47 },
  "b9e2a4f1": { "slug": "blog/wsl2-setup", "count": 23 }
}
```

## UX details

- Le compteur n'est affiché que si count > 0 (pas de "copied 0×" qui fait vide)
- Format court : "47×" plutôt que "47 times"
- Pas de deduplication nécessaire (chaque copie = 1 intent d'utilisation réel)
- Ne ralentit pas la copie : le POST est fire-and-forget

## Dashboard admin

Top des snippets les plus copiés → identifier le contenu le plus utilisé pratiquement.

## TODO steps

- [ ] Créer `api/copy-count.php`
- [ ] Swizzler `src/theme/CodeBlock/index.js`
- [ ] Générer un blockId stable (hash du contenu)
- [ ] Afficher le compteur de façon non-intrusive
- [ ] Ajouter "Top copied snippets" au dashboard admin
