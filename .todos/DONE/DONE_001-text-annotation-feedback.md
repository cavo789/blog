# 001 — Text Annotation & Inline Feedback

**WOW level: 9/10**
**Effort: High**
**Inspired by: Genius.com, Medium, Hypothesis**

## Concept

Le lecteur sélectionne un passage de texte, un mini-popover apparaît avec des options :

- 🔤 Typo / faute d'orthographe
- ❌ Information incorrecte
- ⏰ Article / section obsolète
- 💡 Suggestion d'amélioration
- (optionnel) champ texte libre pour préciser

L'annotation est envoyée au backend PHP, stockée dans `annotations.json`, et un email est envoyé (même mécanique throttling que `reactions.php`).

## Architecture

### Frontend — `src/components/TextAnnotation/index.js`

```js
// Écoute l'événement `mouseup` sur le conteneur article
// Si window.getSelection() renvoie un texte non vide :
//   → afficher un popover flottant positionné à la sélection
//   → l'utilisateur choisit un type de feedback
//   → POST vers /api/annotations.php avec { slug, selectedText, context, type }
```

### Backend — `api/annotations.php`

Même squelette que `reactions.php` :
- GET `?admin=TOKEN` → retourne toutes les annotations
- POST `{ slug, selectedText, context, type, note? }` → stocke + notifie

### Stockage — `api/annotations.json`

```json
{
  "blog/mon-article": [
    {
      "id": "uuid",
      "timestamp": 1234567890,
      "type": "typo",
      "selectedText": "Docke",
      "context": "...installer Docke sur Ubuntu...",
      "note": null
    }
  ]
}
```

## Email notification

```
Subject: [Blog] Annotation on: blog/mon-article
Type    : typo
Text    : "Docke"
Context : "...installer Docke sur Ubuntu..."
```

## UX details

- Popover disparaît si on clique ailleurs (blur)
- Confirmation visuelle : "Merci pour le signalement !"
- Pas de login requis
- Le contexte (50 chars avant/après) est capturé côté JS pour aider à localiser la typo

## TODO steps

- [ ] Créer `api/annotations.php`
- [ ] Créer `src/components/TextAnnotation/index.js` + `styles.module.css`
- [ ] Intégrer dans le layout swizzled (BlogPostPage ou DocPage)
- [ ] Ajouter la route au dashboard admin
- [ ] Tester sur mobile (touch selection)
