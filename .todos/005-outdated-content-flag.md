# 005 — Outdated Content Flag

**WOW level: 8/10**
**Effort: Low**
**Inspired by: MDN Web Docs "Is this page helpful?" + outdated banners**

## Concept

Un bouton simple, discret, placé près de la date de publication :

> 📅 Published 2023-04-12 · [Flag as outdated]

Quand un lecteur clique, un mini-formulaire apparaît avec un choix de raisons :

- 🔗 Broken links
- 📦 Software version changed (e.g., different CLI flags)
- 🐛 Commands no longer work
- 📖 Missing important context
- ✍️ Other (free text)

## Pourquoi c'est utile

Un blog technique vieillit vite. Docker change ses APIs, WSL évolue, les versions de packages changent. Les lecteurs détectent souvent ces problèmes avant l'auteur. Ce mécanisme crée un signal passif de maintenance.

## Architecture

### Frontend — `src/components/OutdatedFlag/index.js`

- Intégré près du header ou du footer de l'article
- Texte neutre : "Something seem outdated?" pour ne pas alarmer
- Après signalement : "Thanks! I'll review this article."
- localStorage pour éviter le double signalement par article

### Backend — `api/outdated.php`

```
POST { slug, reason, note? }
  → stocke dans outdated.json
  → envoie email

GET ?admin=TOKEN → tous les signalements
```

### Stockage — `api/outdated.json`

```json
{
  "blog/install-wsl2": [
    {
      "timestamp": 1749600000,
      "reason": "version_changed",
      "note": "WSL 2.x now uses wsl --update instead of the old method"
    }
  ]
}
```

## Intégration visuelle

Peut être intégré dans le composant `DocMetadata` swizzled ou en tant que footer discret.

Option : si un article reçoit 3+ signalements "outdated", afficher automatiquement une bannière jaune :

```jsx
{signalCount >= 3 && (
  <div className="admonition admonition-caution">
    <p>Readers have flagged this article as potentially outdated. Use with caution.</p>
  </div>
)}
```

(Nécessite que le count soit exposé via l'API GET public)

## Email de notification

```
Subject: [Blog] Article flagged as outdated: blog/install-wsl2

Reason : version_changed
Note   : "WSL 2.x now uses wsl --update instead of the old method"
Article: https://www.avonture.be/blog/install-wsl2

Total flags on this article: 1
```

## TODO steps

- [ ] Créer `api/outdated.php`
- [ ] Créer `src/components/OutdatedFlag/index.js` + styles
- [ ] Intégrer dans le layout BlogPostPage (toujours visible)
- [ ] Implémenter la bannière automatique si seuil dépassé
- [ ] Ajouter section "Outdated Signals" au dashboard admin
