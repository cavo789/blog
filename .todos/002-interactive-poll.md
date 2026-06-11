# 002 — In-Article Interactive Polls

**WOW level: 9/10**
**Effort: Medium**
**Inspired by: Twitter/X polls, Substack**

## Concept

Un composant MDX `<Poll />` à placer n'importe où dans un article. Les lecteurs votent, les résultats s'affichent en temps réel (ou au rechargement). Parfait pour un blog technique : "Quel outil utilisez-vous ?", "Quelle version de Docker tourne-vous ?", etc.

## Usage dans un article `.mdx`

```mdx
<Poll
  id="docker-vs-podman-2025"
  question="What container runtime do you use in 2025?"
  options={["Docker", "Podman", "nerdctl", "Other"]}
/>
```

L'`id` est un slug unique par sondage (indépendant du slug de l'article, ce qui permet de réutiliser un poll dans plusieurs articles).

## Architecture

### Frontend — `src/components/Poll/index.js`

- Charge les résultats au montage via GET `/api/polls.php?id=docker-vs-podman-2025`
- Envoie le vote via POST `{ id, option }`
- Stocke le vote dans `localStorage` pour éviter le double vote
- Affiche les barres de progression animées après le vote

### Backend — `api/polls.php`

Même pattern que `reactions.php` :
- GET `?id=...` → counts pour ce poll
- GET `?admin=TOKEN` → tous les polls
- POST `{ id, option }` → incrémente le compteur

### Stockage — `api/polls-data.json`

```json
{
  "docker-vs-podman-2025": {
    "question": "What container runtime do you use in 2025?",
    "options": {
      "Docker": 42,
      "Podman": 18,
      "nerdctl": 5,
      "Other": 3
    }
  }
}
```

## UX details

- Avant le vote : boutons radio élégants
- Après le vote : barres de progression avec % et count
- Option gagnante mise en valeur
- Total des votes affiché : "68 votes"
- Pas de notification email (trop fréquent), mais visible dans le dashboard admin

## TODO steps

- [ ] Créer `api/polls.php`
- [ ] Créer `src/components/Poll/index.js` + `styles.module.css`
- [ ] Exporter dans `src/components/index.js` pour import MDX global
- [ ] Documenter l'usage dans un article de blog "meta"
- [ ] Ajouter au dashboard admin
