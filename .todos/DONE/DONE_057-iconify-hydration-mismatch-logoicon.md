# 057 — Avertissement d'hydratation React (#418) lié à LogoIcon / Iconify

**Priority:** Low

## Problème

Sur certaines pages (`/about`, et les articles de blog qui utilisent `Snippet` ou les composants
`Trees/Folder/File`), la console du navigateur affiche une erreur React au chargement :

```
Docusaurus React Root onRecoverableError: Error: Minified React error #418
```

**C'est quoi, une "hydration warning" ?** Docusaurus génère les pages en HTML statique côté serveur
(pour le SEO et un affichage rapide), puis React "reprend la main" dans le navigateur en comparant
ce HTML statique à ce qu'il obtiendrait s'il générait la page lui-même — c'est l'"hydratation". Si
les deux ne correspondent pas exactement, React jette cet avertissement, jette le HTML généré côté
serveur pour ce fragment, et le regénère côté client. Le visiteur ne voit donc **aucun bug visuel**
(le screenshot de `/about` est identique après coup), mais c'est un travail de rendu inutile et un
signal que quelque chose diffère entre le rendu serveur et le rendu client.

Confirmé lors de l'upgrade Docusaurus 3.9.2 → 3.10.1 (2026-07-10) : **ce problème existe déjà en
3.9.2**, donc ce n'est pas une régression de l'upgrade — juste un bug préexistant découvert à cette
occasion.

## Cause probable

`LogoIcon` (`src/components/Blog/LogoIcon/index.js`) enveloppe le composant `Icon` de
`@iconify/react`, qui va chercher les données SVG de l'icône de façon asynchrone / avec un cache
interne. Le rendu serveur (sans icône encore chargée) peut donc différer du tout premier rendu
client (qui peut déjà avoir l'icône en cache si une icône du même set a été chargée plus tôt sur la
page) — c'est un problème connu de ce composant en contexte SSR.

`LogoIcon` est enregistré globalement dans `src/theme/MDXComponents.js` et utilisé :

- directement dans `src/pages/about.mdx` (icônes Bluesky/GitHub/Mattermost) ;
- indirectement via `src/components/Snippet/index.js` et
  `src/components/Trees/{Folder,File}/index.js` (icônes de type de fichier) — donc potentiellement
  sur n'importe quel article de blog qui utilise ces composants.

## Risque

Aucun risque fonctionnel ou visuel pour les lecteurs (React se corrige tout seul). Impact réel :
travail de rendu superflu (perf marginale) + bruit dans la console qui masquerait une vraie erreur
si un jour il y en a une.

## Solution proposée

1. Vérifier si une version plus récente de `@iconify/react` (actuellement `^6.0.2`) corrige ce
   comportement SSR, ou si un flag existe pour forcer un rendu synchrone/statique côté serveur.
2. Alternative : remplacer `@iconify/react` dans `LogoIcon` par des imports SVG statiques (comme
   `react-icons`, déjà utilisé ailleurs dans le projet) pour les icônes utilisées de façon fixe
   (Bluesky, GitHub, Mattermost, icônes de fichiers) — élimine le chargement asynchrone et donc le
   risque de mismatch SSR/client.

## Lien avec l'existant

Aucun TODO existant sur Iconify. Trouvé pendant la vérification post-upgrade Docusaurus 3.10.1
(vérification des pages `/`, `/blog`, `/series`, `/blog/tags`, `/repositories`, `/blog/archive`,
`/about` + 2 articles via Playwright).
