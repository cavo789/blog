# 0092 — Les liens internes cassés passent en silence

- **Priority**: Medium
- **Batch**: blog-routing
- **Depends**: —
- **Files**: `docusaurus.config.js`, `plugins/docusaurus-plugin-tag-route/`, `plugins/docusaurus-plugin-series-route/`

## Problème

`docusaurus.config.js` fixe `onBrokenLinks: "ignore"`. Un `<Link to="/blog/slug-qui-nexiste-pas">`
ne produit donc **aucun avertissement** : ni au build local, ni en CI, ni au déploiement. Il
part en production et renvoie le lecteur sur le fallback SPA.

Le réglage est délibéré et documenté dans le fichier : le vérificateur de liens de Docusaurus ne
connaît pas les routes créées dynamiquement par nos plugins, donc `throw` ferait échouer tous les
builds. Mesure faite le 2026-08-18 en repassant temporairement à `throw` : **15 cibles en échec,
toutes des faux positifs** — 13 pages de tags (`/blog/tags/ai`, `/blog/tags/docker`, …) et
2 pages de séries (`/series/ollama-daily-use`, `/series/writing-better-bash-scripts`).

Autrement dit : le mécanisme de détection existe et fonctionne, il est simplement noyé sous du
bruit qu'on ne sait pas faire taire. On a donc désactivé le détecteur d'incendie parce qu'il
sonnait à chaque fois qu'on faisait griller du pain.

Le coût est réel et croissant : 247 articles publiés, 779 `<Link>` recensés, et un renommage de
slug ne casse rien de visible tant que personne ne clique.

## Solution

Faire déclarer leurs routes aux deux plugins de façon que le vérificateur les connaisse, puis
repasser `onBrokenLinks` à `"throw"`.

Docusaurus expose `addRoute()` dans le cycle `contentLoaded` d'un plugin, et les routes ainsi
déclarées **sont** prises en compte par `handleBrokenLinks`. À vérifier : nos deux plugins
créent-ils leurs routes autrement (route unique paramétrée `/:slug` plutôt qu'une route par
valeur) ? Si oui, c'est précisément la cause du faux positif, et le correctif consiste à énumérer
les valeurs réelles au build pour déclarer une route par tag et par série.

### Étapes

1. Lire les deux plugins et identifier comment les routes sont enregistrées.
2. Remplacer la route paramétrée par une énumération, ou ajouter les routes concrètes en plus.
3. Passer `onBrokenLinks: "throw"` et lancer `yarn build`.
4. Les faux positifs doivent tomber à zéro. Ceux qui restent sont de **vrais** liens cassés :
   les corriger, ce sera le premier bénéfice.

### Repli acceptable

Si l'énumération se révèle impraticable, `onBrokenLinks: "warn"` est déjà supérieur à `"ignore"` :
les 15 faux positifs deviennent du bruit visible en CI, mais un vrai lien cassé apparaît dans la
même liste au lieu de disparaître. À combiner avec un `grep -c` dans le workflow qui échoue si le
nombre d'avertissements dépasse le plancher connu de 15.

## Risque

Faible. Le pire cas est de découvrir que Docusaurus ne sait pas prendre en compte nos routes,
auquel cas on retombe sur le repli ci-dessus. Aucune régression possible côté production : le
changement ne touche que la détection au build.

Attention en revanche à l'ordre : passer à `"throw"` **avant** d'avoir corrigé les faux positifs
bloquerait tous les déploiements.

## Acceptance

- `yarn build` échoue sur un `<Link to="/blog/slug-inexistant">` introduit volontairement.
- `yarn build` réussit sur le corpus actuel, sans exception ni liste d'ignorés.
- Aucun des 15 faux positifs de tags/séries ne subsiste.
