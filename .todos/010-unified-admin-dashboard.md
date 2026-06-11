# 010 — Unified Admin Dashboard

**WOW level: 7/10**
**Effort: Medium**
**Dépend de: 001, 002, 003, 004, 005, 006, 009**

## Concept

Une page admin unifiée `/reactions-dashboard` (ou `/admin`) protégée par token, qui agrège toutes les données interactives du blog :

- Reactions (helpful / not helpful)
- TriedIt (worked / didn't work)
- Polls (résultats)
- Annotations / signalements de typos
- Questions des lecteurs
- Outdated flags
- Code copy counts
- Difficulty ratings

## Architecture actuelle

La page existe peut-être déjà partiellement pour `reactions.php`. Ce TODO est une extension / refonte vers un dashboard complet.

## Layout du dashboard

```
┌─────────────────────────────────────────────────┐
│  📊 Blog Interactive Dashboard                  │
│  Protected by token · Last updated: just now    │
├─────────────────────────────────────────────────┤
│  🔥 Top Articles (by engagement)                │
│  ┌──────────────────────────────────────┐       │
│  │ 1. docker-tips         👍94% · ✅89% │       │
│  │ 2. wsl2-setup          👍87% · ✅76% │       │
│  └──────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│  ⚠️  Action Required                            │
│  • 3 unread reader questions                    │
│  • 2 articles flagged as outdated               │
│  • 1 tutorial with >30% failure rate            │
├─────────────────────────────────────────────────┤
│  💬 Recent Reader Questions    [Mark answered]  │
│  📌 Outdated Flags                              │
│  🔤 Text Annotations (typos, errors)            │
│  📈 Poll Results                                │
│  🖥️  Top Copied Code Snippets                   │
└─────────────────────────────────────────────────┘
```

## Backend

Un endpoint unique `api/dashboard.php?admin=TOKEN` retourne tout en une seule requête :

```json
{
  "reactions": { ... },
  "tried_it": { ... },
  "polls": { ... },
  "annotations": [ ... ],
  "questions": [ ... ],
  "outdated": [ ... ],
  "copy_counts": { "top50": [ ... ] },
  "difficulty": { ... },
  "generated_at": 1749600000
}
```

## Frontend — page Docusaurus

`src/pages/admin/index.js` ou swizzle de la page existante `/reactions-dashboard`.

- Token lu depuis `window.location.hash` → envoyé en query param
- Si 403 : affiche un formulaire pour saisir le token
- Sections collapsibles par catégorie
- Bouton "Refresh"
- "Mark as answered" pour les questions
- Export CSV pour les power users

## TODO steps

- [ ] Créer `api/dashboard.php` agrégeant tous les endpoints
- [ ] Refondre/créer la page `src/pages/admin/index.js`
- [ ] Implémenter les actions (mark answered, dismiss flag)
- [ ] Section "Action Required" avec alertes
- [ ] Styling responsive
