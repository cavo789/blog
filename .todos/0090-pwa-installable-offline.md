# 0090 — PWA : rendre le blog installable et lisible hors ligne

- **Priority**: Low
- **Batch**: blog-pwa
- **Depends**: —
- **Files**: `docusaurus.config.js`, `package.json`, `static/manifest.json`, `static/img/`

## Problème

Le blog est un site statique, rapide et soigné côté performance — mais il reste un onglet de
navigateur parmi d'autres. Rien ne permet de l'épingler à un écran d'accueil, et un lecteur
dans le train perd l'accès à un article qu'il vient pourtant de charger.

`@docusaurus/plugin-pwa` **existe en version 3.10.2**, exactement la version de
`@docusaurus/core` installée ici (`^3.10.2`) — vérifié sur le registre. Il n'est pas dans
`package.json`, et `static/` ne contient aucun `manifest.json`.

L'enjeu n'est pas la performance (elle est déjà bonne) : c'est **l'identité**. Un blog qui
s'installe, s'ouvre dans sa propre fenêtre, avec le suricate en icône sur l'écran d'accueil,
ne se lit plus comme un blog.

## Solution

Ajouter `@docusaurus/plugin-pwa` avec un manifeste et un jeu d'icônes, et un service worker
qui met en cache la coquille du site et les articles déjà visités.

### Ce qui existe déjà et sert de base

- `static/img/favicon.png`, `avatar.png`, `avatar.webp` — mais **il faut des icônes 192×192
  et 512×512, dont une `maskable`** ; aucune n'est au bon format aujourd'hui.
- Le suricate (`static/img/meerkat/`) est le candidat évident pour l'icône d'application —
  c'est la seule image du site qui soit une identité et pas un logo générique.
- La prod est bien en HTTPS (`https://www.avonture.be`), condition nécessaire à l'installation.

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
4. **iOS.** Pas d'invite d'installation : l'ajout se fait manuellement via « Sur l'écran
   d'accueil » dans Safari, et il faut `apple-touch-icon` plus les balises
   `apple-mobile-web-app-*`. À documenter comme une limite, pas à contourner.

## Risque

- **Cache empoisonné.** Le pire scénario d'une PWA mal réglée est un lecteur bloqué sur une
  version ancienne sans moyen de forcer la mise à jour. Le popup de rechargement n'est pas
  optionnel.
- **Poids de stockage.** Précacher tout le corpus (248 articles + images) sur le téléphone
  d'un lecteur sans le lui demander serait abusif. Se limiter à la coquille + les pages
  visitées.
- **Bénéfice réel à mesurer.** Avec le trafic actuel, le nombre d'installations sera
  probablement proche de zéro. C'est assumé : la valeur est identitaire et technique (et
  fait un bon article), pas statistique. Ne pas surdimensionner l'effort en conséquence.
- **Surface de debug.** Un service worker est la première chose à suspecter dès qu'un
  comportement bizarre apparaît en prod, et la dernière à laquelle on pense. Documenter la
  procédure de purge dans `README.md`.

## Acceptance

- [ ] `@docusaurus/plugin-pwa` installé et configuré ; `manifest.json` servi
- [ ] Icônes 192, 512 et maskable générées à partir du suricate ; `apple-touch-icon` présent
- [ ] L'invite d'installation apparaît réellement sur Chrome desktop et Android (testé, pas
      supposé) ; le comportement iOS est documenté comme limite connue
- [ ] Un article déjà visité reste lisible réseau coupé
- [ ] `api/*.php` n'est jamais servi depuis le cache (vérifié dans l'onglet réseau)
- [ ] Le sort de la recherche hors ligne (Pagefind + `questions-index.json`) est tranché, et
      dans tous les cas `⌘K` affiche un message explicite plutôt qu'un résultat vide
- [ ] Le popup de rechargement fonctionne : publier un article, recharger, constater la
      proposition de mise à jour
- [ ] La procédure de purge du service worker est notée dans `README.md`
- [ ] `yarn lint && yarn format:check && yarn build` passent
