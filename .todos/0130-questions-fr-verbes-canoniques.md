---
Priority: medium
Batch: content-quality
Depends: —
Files: scripts/generate-questions.mjs
---

## Problème

Le modèle FR diversifie le vocabulaire là où le modèle EN est systématique. Pour Joomla, les questions FR utilisent "lancer", "déployer", "Télécharger" — mais rarement "installer". Résultat : une recherche "comment installer joomla" ne retrouve que 5 questions sur 56, contre un rappel quasi-parfait en EN.

Cause racine : en anglais, la convention FAQ impose presque toujours "install", "configure", "run". En français, la langue tolère davantage de synonymes et le modèle les exploite librement.

## Risque

La qualité de recherche de l'index FR est structurellement inférieure à l'index EN pour les requêtes avec un verbe d'action précis. L'écart est invisible dans les métriques (les questions FR sont correctes), mais perceptible dès qu'on compare les résultats côte à côte.

## Solution

Dans le system prompt FR de `generate-questions.mjs`, ajouter une contrainte explicite :

> Pour chaque question qui décrit une action (installation, configuration, démarrage, suppression…), inclure le verbe canonique français correspondant ("installer", "configurer", "lancer" / "démarrer", "supprimer"). Les synonymes peuvent apparaître dans d'autres questions du même article, mais au moins une question par action doit contenir le verbe le plus courant.

Regénérer ensuite les questions des articles les plus consultés (Joomla, Docker, Bash) pour valider l'amélioration avant un passage en masse.
