# 0105 — Facepile d'engagement unifié (likes + reposts + commentateurs) dans BlueskyLikes

- **Priority**: Medium
- **Batch**: bluesky-component
- **Depends**: —
- **Files**: `src/components/Bluesky/likes.js`, `src/components/Bluesky/styles.module.css`

## Problème

`BlueskyLikes` (`src/components/Bluesky/likes.js`) n'affiche qu'un compteur brut (nombre de likes,
nombre de reposts). Aucune indication visuelle de *qui* a interagi avec l'article, alors que l'API
Bluesky expose cette info avec avatar pour les likes, les reposts et les commentaires.

Scope initial (likes uniquement) élargi le 2026-08-27 : afficher séparément un avatar de commentateur
à côté des likers a été jugé trompeur (ça casse le lien visuel entre le compteur "N likes" et le
nombre d'avatars affichés). Décision : un seul facepile "engagement" dédupliqué par personne, plutôt
que trois facepiles distincts.

## Solution

Un seul fetch `getPostThread?depth=5` donne à la fois `likeCount`/`repostCount` **et** l'arbre des
réponses (commentateurs), en réutilisant `data.thread.post.uri` (résolu avec le DID — voir point
technique ci-dessous) pour deux appels en parallèle :

- `app.bsky.feed.getLikes?uri=...` → likers (`actor.did/handle/displayName/avatar`)
- `app.bsky.feed.getRepostedBy?uri=...` → reposters (tableau plat d'acteurs, pas wrappé dans
  `{actor: ...}`, contrairement à `getLikes`)

Les commentateurs sont extraits en aplatissant `data.thread.replies` (même algorithme que
`flattenReplies` dans `comments.js`, mais on ne garde que `reply.post.author`) — pas besoin d'un
fetch supplémentaire pour ça.

Fusionner les trois listes dans une `Map` clé par `did`, chaque entrée portant un `Set` d'actions
(`liked`/`reposted`/`commented`). Trier par nombre d'actions décroissant (une personne qui a liké
**et** commenté remonte en premier — c'est le signal social le plus fort). Afficher jusqu'à
`MAX_AVATARS` (10) en facepile superposé + badge `+N` pour le reste, tooltip par avatar listant les
actions (`"X (@handle) liked and commented on this post"`).

Point technique vérifié en amont (conversation du 2026-08-27) : `getLikes`/`getRepostedBy` exigent
l'URI **canonique avec le DID** (`at://did:plc:.../app.bsky.feed.post/...`) — l'URI construite à
partir du handle (`at://avonture.be/...`) renvoie une liste vide.

Pas de badge par action sur chaque avatar (❤️/🔁/💬) pour garder le rendu simple — l'info reste
disponible via le tooltip. À reconsidérer seulement si demandé explicitement.

## Risque

- Deux appels API supplémentaires par article affiché → latence/flicker légèrement accrus au
  chargement ; garder le rendu actuel (compteurs + avatars des commentateurs déjà connus) tant que
  ces fetches ne sont pas résolus, ne pas bloquer l'affichage des compteurs dessus.
- Gérer le cas 0 engagement (pas de facepile à afficher) et le cas d'échec d'un des fetches (fallback
  silencieux, comme le fait déjà le composant pour `getPostThread`).
