# 044 — Échecs fetch avalés silencieusement dans les widgets d'engagement

**Priority:** Low

## Problème

`Reaction/index.js` et les sous-composants `Bluesky/*` (likes, post, comments) suivent tous le même
pattern : `fetch(...).catch(() => {})` ou `try { ... } catch {}`, sans aucun retour visuel à
l'utilisateur en cas d'échec. Concrètement dans `Reaction/index.js` :

```js
const handleVote = useCallback(async (vote) => {
  try {
    const res = await fetch(apiUrl, { ... });
    if (!res.ok) return;
    ...
  } catch {}
}, ...);
```

Si l'API `/api/reactions.php` est indisponible (maintenance, erreur serveur, CORS), l'utilisateur
clique sur "👍 Helpful", rien ne se passe visuellement, et rien n'indique si c'est parce que le vote
a été pris en compte silencieusement ou parce que l'appel a échoué.

## Risque

Mauvaise expérience utilisateur discrète : un lecteur peut croire avoir voté (le bouton ne change
pas d'état) alors que rien n'a été enregistré côté serveur. Duplication du même pattern
fetch+catch dans 4 composants indépendants (`Reaction`, `Bluesky/likes`, `Bluesky/post`,
`Bluesky/comments`) — toute amélioration doit être répliquée 4 fois.

## Solution proposée

1. Extraire un petit hook partagé, ex. `useJsonFetch(url, options)`, qui retourne
   `{ data, error, loading }` et centralise la gestion d'erreur.
2. Sur échec, afficher un état minimal ("Impossible de charger, réessayer" / icône discrète) plutôt
   que de ne rien afficher — cohérent avec l'esprit "coach" demandé pour l'expérience développeur,
   appliqué ici à l'expérience lecteur.

## Lien avec l'existant

Aucun TODO existant. Priorité basse : le comportement actuel n'est pas cassé, seulement peu
transparent en cas de panne backend (déjà noté comme code smell mineur via le `console.debug` dans
`Bluesky/share.js`).
