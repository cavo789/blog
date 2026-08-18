# 0095 — PWA : lecture hors ligne et service worker

- **Priority**: low
- **Batch**: blog-pwa
- **Depends**: 0090
- **Files**: `docusaurus.config.js`, `package.json`, `README.md`

## Problème

Une fois le blog installable ([[0090]]), il reste un onglet déguisé : un lecteur dans le train
perd l'accès à un article qu'il vient pourtant de charger. Rien n'est mis en cache, et `⌘K`
devient une boîte vide dès que le réseau tombe.

`@docusaurus/plugin-pwa` **existe en version 3.10.2**, exactement la version de
`@docusaurus/core` installée ici (`^3.10.2`) — vérifié sur le registre. Il n'est pas dans
`package.json`.

Cette partie a été séparée de [[0090]] parce qu'elle n'a rien à voir en termes de risque :
0090 ne fait qu'ajouter des fichiers statiques, alors qu'un service worker est du code qui
s'exécute chez le lecteur et survit au déploiement.

## Solution

Ajouter `@docusaurus/plugin-pwa` avec un service worker qui met en cache la coquille du site
et les articles déjà visités. Le manifeste et les icônes existent déjà (livrés par [[0090]]) —
vérifier que la config du plugin les réutilise au lieu d'en régénérer un jeu concurrent.

### Les quatre pièges à traiter explicitement

1. **Fraîcheur du contenu.** Un article par semaine plus un service worker agressif, et le
   lecteur revient sur une version périmée sans le savoir. Utiliser le popup de rechargement
   fourni par le plugin (`PwaReloadPopup`), et choisir une
   `offlineModeActivationStrategies` conservatrice (`appInstalled` / `standalone` plutôt que
   `always`) — un visiteur de passage n'a aucune raison de se voir servir un cache.
2. **Ne jamais mettre en cache `api/`.** `api/reactions.php`, `api/typo.php` et
   `api/tried-it.php` sont des écritures. Une réponse mise en cache casserait les compteurs
   et les envois de feedback. À exclure nommément.
3. **Recherche hors ligne.** Pagefind (`docusaurus-plugin-pagefind`) charge son index depuis
   `/pagefind/` au runtime, et `AskMyBlog` fetch `/questions-index.json` (472 Ko). Hors
   ligne, sans mise en cache explicite, `⌘K` se dégrade en boîte vide. Décider : soit on les
   précache (coût de stockage non négligeable, et l'index de questions va grossir avec
   [[0086]]), soit on assume la dégradation et on affiche un message honnête. **Ne pas
   laisser un champ de recherche muet.**
4. **Interaction avec le cache HTTP.** `static/.htaccess` pose déjà des règles de
   `Cache-Control`, et le commentaire ligne 85 documente pourquoi `json` en est exclu. Deux
   couches de cache qui s'ignorent, c'est la recette d'un bug non reproductible : vérifier
   que la stratégie du service worker ne contredit pas celle du serveur.

## Risque

- **Cache empoisonné.** Le pire scénario d'une PWA mal réglée est un lecteur bloqué sur une
  version ancienne sans moyen de forcer la mise à jour. Le popup de rechargement n'est pas
  optionnel.
- **Poids de stockage.** Précacher tout le corpus (248 articles + images) sur le téléphone
  d'un lecteur sans le lui demander serait abusif. Se limiter à la coquille + les pages
  visitées.
- **Surface de debug.** Un service worker est la première chose à suspecter dès qu'un
  comportement bizarre apparaît en prod, et la dernière à laquelle on pense. Documenter la
  procédure de purge dans `README.md`.
- **Bénéfice incertain.** Le nombre de lecteurs qui installeront *puis* liront hors ligne est
  probablement nul. D'où la priorité basse : à ne faire que si [[0090]] a donné envie d'aller
  plus loin, ou pour en tirer un article.

## Acceptance

- [ ] `@docusaurus/plugin-pwa` installé et configuré ; il réutilise le manifeste et les icônes
      de [[0090]] au lieu d'en générer un second jeu
- [ ] Un article déjà visité reste lisible réseau coupé
- [ ] `api/*.php` n'est jamais servi depuis le cache (vérifié dans l'onglet réseau)
- [ ] Le sort de la recherche hors ligne (Pagefind + `questions-index.json`) est tranché, et
      dans tous les cas `⌘K` affiche un message explicite plutôt qu'un résultat vide
- [ ] Le popup de rechargement fonctionne : publier un article, recharger, constater la
      proposition de mise à jour
- [ ] La stratégie du service worker ne contredit pas les règles `Cache-Control` de
      `static/.htaccess`
- [ ] La procédure de purge du service worker est notée dans `README.md`
- [ ] `yarn lint && yarn format:check && yarn build` passent
