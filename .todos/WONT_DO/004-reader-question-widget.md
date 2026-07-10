# 004 — Reader Question Widget

**WOW level: 8/10**
**Effort: Medium**
**Inspired by: HelpScout Beacon, Intercom**

## Concept

En bas de chaque article (ou via un bouton flottant), un petit formulaire discret :

> **Une question sur cet article ?**
> [ Votre question... ] [Envoyer]

La question est liée au slug de l'article, stockée sur le serveur, et envoyée par email. L'auteur peut ensuite décider de :
- Répondre directement si un email de contact est fourni
- Enrichir l'article pour clarifier ce point
- Ajouter une FAQ en bas de l'article

## Architecture

### Frontend — `src/components/ReaderQuestion/index.js`

États :
1. **Initial** : bouton "💬 Ask a question about this article"
2. **Open** : textarea + champ email optionnel + bouton Submit
3. **Sent** : "Thanks! I'll look into it."
4. **Error** : message d'erreur discret

Validation minimale côté client : question non vide, longueur max 500 chars.

### Backend — `api/questions.php`

```
POST { slug, question, email? }
  → stocke dans questions.json
  → envoie email

GET ?admin=TOKEN
  → retourne toutes les questions
```

### Stockage — `api/questions.json`

```json
{
  "blog/docker-compose-tips": [
    {
      "id": "uuid-1234",
      "timestamp": 1749600000,
      "question": "Does this work with Docker Compose v2?",
      "email": "reader@example.com",
      "answered": false
    }
  ]
}
```

## Email de notification

```
Subject: [Blog] New question on: blog/docker-compose-tips

Question: "Does this work with Docker Compose v2?"
Email   : reader@example.com (optional — to reply directly)
Article : https://www.avonture.be/blog/docker-compose-tips
```

## UX details

- Le champ email est explicitement optionnel et marqué "for a reply only, never shared"
- Rate limiting côté PHP : max 3 questions par IP par heure (évite le spam)
- Anti-spam basique : honeypot field caché + vérification longueur minimale (10 chars)
- Le bouton peut être affiché uniquement si `frontMatter.questions: true` pour commencer

## Dashboard admin

Affiche les questions non répondues avec un flag `answered: false`.
Permettre de marquer comme répondu via un endpoint `POST ?admin=TOKEN&action=mark_answered&id=uuid`.

## TODO steps

- [ ] Créer `api/questions.php` avec rate limiting IP
- [ ] Créer `src/components/ReaderQuestion/index.js` + styles
- [ ] Intégrer dans le layout BlogPostPage (toujours affiché ou via frontmatter)
- [ ] Implémenter l'endpoint `mark_answered` pour le dashboard
- [ ] Ajouter section "Open Questions" au dashboard admin
