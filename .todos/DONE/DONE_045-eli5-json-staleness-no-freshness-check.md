# 045 — Fichiers `.eli5.json` : aucune vérification de fraîcheur, dérive silencieuse

**Priority:** Low

## Problème

44 fichiers `*.eli5.json` dans `src/components` (790 dans tout le repo) associent des explications
pédagogiques à des **numéros de ligne exacts** du fichier source (ex.
`PostCard/index.js.eli5.json` → `"13": "...", "36": "...", "63": "..."`), générés une seule fois
par `npm run eli5` (`scripts/generate-eli5.mjs`, appel à l'API Anthropic).

Rien ne vérifie que ces numéros de ligne correspondent encore au fichier source actuel :
- Le JSON contient un `"generated"` (timestamp) et une `"version": 1`, mais aucun hash de contenu
  du fichier source.
- Aucun script CI, hook pre-commit, ou test ne compare la date de modification ou le hash du
  fichier source à celle du `.eli5.json` associé.
- Les deux workflows GitHub Actions existants ne mentionnent jamais `eli5`.

Toute modification d'un composant qui ajoute/supprime des lignes au-dessus d'une ligne annotée
désynchronise silencieusement l'explication de son contexte réel (elle s'affichera sur la
mauvaise ligne, ou sur du code qui a changé de sens).

## Risque

Sur un blog qui documente et enseigne (composant `<Snippet>` avec tooltips ELI5, cf. `DONE_004`),
une explication qui pointe vers la mauvaise ligne ou décrit un comportement obsolète est pire que
l'absence d'explication : elle induit le lecteur en erreur avec une fausse autorité.

## Solution proposée

Ajouter un hash de contenu (ex. SHA-1 du fichier source au moment de la génération) dans le JSON
de sortie de `generate-eli5.mjs`, puis un petit script `check-eli5-freshness.mjs` (exécutable en
CI ou en pre-commit) qui compare ce hash au fichier source actuel et échoue/avertit en cas de
désynchronisation — sans bloquer le build tant que ce n'est pas stabilisé (avertissement d'abord,
échec strict ensuite une fois la CI en place, cf. [[036]]).

## Lien avec l'existant

Étend `DONE_004` (création de la fonctionnalité ELI5) sans le dupliquer : ce TODO couvre
uniquement la maintenance dans la durée, absente de la conception initiale.
