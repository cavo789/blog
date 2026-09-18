# 0127 — PWA : la coquille précachée casse la home après chaque déploiement

- **Priority**: High — incident constaté en production le 2026-09-17
- **Batch**: blog-pwa
- **Depends**: —
- **Files**: `docusaurus.config.js`, `README.md`, `.todos/PARTIAL/PARTIAL_0095-pwa-lecture-hors-ligne.md`

## Problème

Constaté sur smartphone le 2026-09-17 à 23:02, sur `avonture.be/` : le bandeau rouge
**« Your Docusaurus site did not load properly »**, page entièrement dé-stylée, navigation en
serif brut. Le même site sur PC, et depuis `curl`, est parfaitement sain.

Vérifications faites côté serveur — **rien d'anormal** :

| Vérification | Résultat |
| --- | --- |
| `https://www.avonture.be/` | HTTP 200, 41 Ko |
| `/assets/css/styles.5462367a.css` | HTTP 200 |
| `/assets/js/main.89e3c01f.js` | HTTP 200 |
| En-tête HTML | `no-cache, no-store, must-revalidate` |
| Redirection FR (`Accept-Language: fr-BE`) | 302 → `/fr/` ✅ |

Le HTML étant servi en `no-store`, le cache HTTP classique **ne peut pas** conserver une vieille
page. Le seul mécanisme capable de ça est le service worker installé par [[0095]].

### Cause racine

Le `fetch` généré par `@docusaurus/plugin-pwa` (lu dans le `sw.js` de prod) est **cache-first
inconditionnel** — il ne teste pas la connectivité et ne retombe pas sur le réseau :

```js
self.addEventListener("fetch", async (e) => {
  if (t.offlineMode) {
    // toute URL same-origin présente dans le précache → réponse depuis le cache, point.
  }
});
```

Le précache déployé contient 6 entrées, dont `index.html` — mais `injectManifestConfig.globIgnores`
exclut `assets/**`. **La coquille et ses assets hachés ont donc des cycles de vie découplés.**

L'enchaînement :

1. La PWA est installée sur le téléphone → stratégie `appInstalled` → `offlineMode` actif même
   dans un onglet Chrome normal (la capture montre bien la barre d'adresse, pas du standalone).
2. Le SW y détient un `index.html` d'un build antérieur.
3. Déploiement du 2026-09-17 à 19:45 (`last-modified` de la home) → les assets hachés changent de nom.
4. À 23:02 le SW sert la vieille coquille, qui réclame `/assets/js/main.<ancien-hash>.js` → **404**,
   servi en `text/html` par-dessus le marché, donc même pas parsable.
5. React ne démarre jamais → le bandeau, présent en dur dans le HTML et normalement masqué par JS,
   reste visible. Aucun CSS non plus.

Ça explique aussi pourquoi la page s'affichait **en anglais** alors que le téléphone annonce le
français : la réponse venant du cache, aucune requête réseau n'a eu lieu, donc la règle `.htaccess`
de redirection vers `/fr/` n'a jamais été évaluée.

### Correction à apporter au Status de [[0095]]

Le Status de [[0095]] affirme que le repli « coquille hors ligne » fonctionne de façon fiable
(`the shell-offline fallback that DOES work reliably`). C'est **trop fort**. Il ne fonctionne que
tant que le cache HTTP du navigateur détient encore `main.*.js` et `styles.*.css` — ce qui est
plausible, ces fichiers étant servis `immutable, max-age=31536000` par `static/.htaccess:143`.
Mais ce cache-là n'appartient pas au site, les navigateurs mobiles l'évincent agressivement, et
rien ne le synchronise avec le précache du SW. Le repli marche **par accident**, pas par
construction. Ajouter cette nuance au Status de [[0095]] fait partie de ce TODO : la prochaine
personne qui lira « works reliably » repartira sinon sur une prémisse fausse.

## Solution

Le handler `fetch` n'est pas modifiable sans `swCustom`, et [[0095]] a **empiriquement démontré**
que `swCustom` est plus dangereux que le problème qu'il résout (import dynamique non garanti au
respawn du worker). On ne peut donc jouer que sur le contenu du précache. Deux options réelles :

| | Option 1 — sortir les documents HTML du précache | Option 2 — précacher aussi la coquille |
| --- | --- | --- |
| Corrige la panne | ✅ définitivement | ✅ |
| Poids par lecteur installé, à **chaque** déploiement | 0 | **1,58 Mo** |
| Home périmée servie aux lecteurs **en ligne** | ✅ supprimé | ❌ **conservé** |
| Offline réellement fonctionnel | non (comme aujourd'hui) | **non vérifié** |

Les 1,58 Mo de l'option 2 sont mesurés : `build/index.html` ne référence que trois fichiers
(`assets/css/styles.*.css`, `assets/js/main.*.js`, `assets/js/runtime~main.*.js`). Techniquement
sélectionnables par glob, les 777 chunks de route étant tous préfixés hex et ces trois-là non.

**Retenu : option 1.** Trois raisons :

1. Elle supprime le mode de panne au lieu d'en réduire la fenêtre.
2. Elle corrige aussi la **péremption**, que l'option 2 conserve intégralement : le handler étant
   cache-first inconditionnel, un lecteur installé et parfaitement connecté se voit servir une home
   ancienne. Pour une page d'accueil qui est un flux des derniers articles, c'est une régression
   réelle.
3. Le gain de l'option 2 n'est pas démontré : même avec les trois fichiers en cache, l'hydratation
   réclame le chunk de route `/`, non sélectionnable par glob parmi 777 noms hachés. Payer 1,58 Mo
   par déploiement pour un bénéfice non vérifié n'est pas défendable.

### Mise en œuvre

Ajouter à `injectManifestConfig.globIgnores` les documents HTML précachés : `index.html`,
`404.html`, `follow/**`, `shake-debug.html`.

### Aller jusqu'au bout : le plugin sert-il encore à quelque chose ?

Une fois ces entrées retirées, le précache ne contient plus que `questions-index.json`, et comme
`sw.js` n'enregistre **aucune route runtime** (vérifié : zéro `registerRoute`, zéro
`StaleWhileRevalidate`/`NetworkFirst`/`CacheFirst`), le service worker ne fait plus rien du tout.
La conclusion logique est de retirer `@docusaurus/plugin-pwa`.

Point vérifié qui rend ça envisageable : **l'installabilité ne dépend pas du plugin**. Elle vient
de `headTags` + `static/manifest.webmanifest`, livrés par [[0090]], que le plugin ne touche pas
(`pwaHead` volontairement non défini) :

```text
/manifest.webmanifest → HTTP 200, application/manifest+json
<link rel=manifest href=/manifest.webmanifest>   ← présent dans le HTML de prod
```

**Réserve bloquante à lever avant d'y toucher :** Chrome a historiquement exigé un service worker
avec un handler `fetch` pour l'installation WebAPK sur Android. Ce critère a peut-être été
assoupli, mais ce n'est pas vérifié — et se tromper coûterait l'icône sur l'écran d'accueil des
lecteurs, c'est-à-dire tout le bénéfice de [[0090]]. À trancher sur la doc Chrome **et** un
Lighthouse sur la prod, pas de mémoire.

Séquencement : l'option 1 d'abord, comme socle sûr — elle est correcte quelle que soit la réponse
et ne ferme aucune porte. Le retrait du plugin, seulement si la réserve est levée.

## Risque

- **Les lecteurs déjà touchés ne seront pas réparés par le déploiement.** Un SW ne se remplace
  qu'à l'activation du suivant. Procédure de purge manuelle (Chrome Android → Informations sur le
  site → Paramètres du site → Effacer et réinitialiser ; désinstaller l'icône d'accueil d'abord) —
  à ajouter à la section « purging the service worker » du `README.md`, qui ne documente
  aujourd'hui que le parcours DevTools desktop.
- **Combien de lecteurs sont concernés ?** Inconnu, et non mesurable a posteriori. Ça n'atténue pas
  la priorité : le symptôme est une home totalement cassée, pas une dégradation.
- **Ne pas retirer par erreur `manifest.webmanifest` du précache** en croyant ranger : il est déjà
  couvert par la règle `no-store` du `.htaccess` et son précache n'a jamais posé problème.

## Acceptance

- [ ] `index.html`, `404.html`, `follow/**` et `shake-debug.html` ne sont plus dans le précache —
      vérifié en lisant le manifeste du `build/sw.js` produit, pas en relisant la config
- [ ] Un build + déploiement simulé sur un profil ayant l'ancien SW ne reproduit plus le bandeau
- [ ] La home servie à un lecteur installé et connecté est celle du dernier build (plus de
      péremption)
- [ ] Le Status de [[0095]] est corrigé sur le point « shell-offline fallback works reliably »
- [ ] `README.md` documente la purge côté mobile, pas seulement DevTools desktop
- [ ] Le critère d'installabilité Chrome (SW requis ou non) est tranché et **écrit** ici, avec sa
      source — condition d'ouverture du retrait du plugin
- [ ] `yarn lint && yarn format:check && yarn build` passent

## Question ouverte

`shake-debug.html` est précaché **et** répond HTTP 200 en production. Page de debug publiée
involontairement ? Si oui, elle relève d'un TODO distinct (retrait de la sortie de build), pas de
celui-ci.
