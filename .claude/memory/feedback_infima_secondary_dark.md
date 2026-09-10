---
name: feedback-infima-secondary-dark
description: --ifm-color-content-secondary vaut blanc pur en thème sombre — ne jamais l'utiliser pour du texte secondaire
metadata:
  node_type: memory
  type: feedback
---

`--ifm-color-content-secondary` **n'est pas** un gris secondaire dans les deux thèmes :

- clair : `#525860` (gris foncé, OK)
- **sombre : `rgba(255,255,255,1)` — blanc pur**, alors que le corps du texte (`--ifm-color-content`) vaut `#e3e3e3`

Un texte censé être « discret » devient donc **plus lumineux que le corps** en thème sombre — l'effet exactement inverse de celui recherché.

**Why:** Découvert en implémentant le chapeau d'article (`.standfirst`) et le fil d'Ariane. Le nom du token est trompeur : il désigne un rôle Infima, pas une teinte atténuée. Plusieurs composants du blog l'utilisent déjà (`TriedIt`, `Reaction`, `FaqThemePage`, `OfflineNotice`, …) — tolérable sur de petits labels, pas sur un paragraphe.

**How to apply:** Pour du texte secondaire, utiliser **`--ifm-color-emphasis-700`** : `#606770` en clair (5,7:1 sur blanc → AA) et `#dadde1` en sombre, soit un cran sous le corps du texte. L'échelle `emphasis-*` s'inverse proprement entre les deux thèmes, contrairement à `content-secondary`.

Attention aussi au contraste sur les crans clairs : `--ifm-color-emphasis-600` = `#8d949e` en thème clair, soit **3,0:1 sur blanc** — sous le seuil AA pour du texte normal. Le réserver au décoratif (séparateurs, bordures), jamais à du texte lisible.

Voir aussi [[feedback-flex-column-basis]] et [[feedback-coding-style]].
