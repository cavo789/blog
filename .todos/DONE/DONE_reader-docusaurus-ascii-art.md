# Reader review : docusaurus-ascii-art

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2025/11/23/docusaurus-ascii-art/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « HTML meerkat » déplacée en position 2. Une vraie section `## Conclusion` a été écrite (absente avant, l'article s'arrêtait sur deux AlertBox).

## Problème

Time to value : **83 %** (preuve ligne 66 sur un corps de 41 lignes [32-73]).
Drapeaux : abstraction-avant-preuve — le code du plugin (`plugins/ascii-injector/index.mjs`,
l. 46) et la config Docusaurus (l. 50) sont montrés avant toute preuve.
Redondance : aucune répétition significative.

Test des 30 secondes : *"j'abandonne"* — l'article demande de créer un fichier ASCII art, un
plugin, puis de modifier `docusaurus.config.js`, avant même de montrer à quoi ressemble le
résultat dans le code source HTML.

## Risque

La preuve (capture l. 66, *"HTML meerkat"* — la bannière visible en vue "source de la page")
existe déjà mais arrive tout à la fin, après les 3 fichiers à créer. L'article n'a par ailleurs
pas de section "## Conclusion" : il s'arrête sur deux `AlertBox`.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro (idée décalée mais amusante) + astuce CTRL+U | l. 24-30 |
| 2. Résultat | Capture "HTML meerkat" (vue source avec la bannière ASCII) + une phrase | l. 66 |
| 3. Pourquoi ça marche | Puces : plugin déclenché au `postBuild`, scan des fichiers générés, injection en commentaire HTML | nouveau, condensé de l. 26-28 |
| 4. Installation | Créer le logo ASCII + le plugin + activer dans `docusaurus.config.js` | l. 34-52 |
| 5. Démo supplémentaire | Générer/servir le site et vérifier | l. 54-64 |
| 6. Sous le capot (optionnel) | Limite : uniquement en mode `postBuild`, pas en preview | l. 71-73 |
| 7. Conclusion (à créer) | Récap + lien vers un article connexe (ex. `/blog/bash-ascii-art`) | à écrire |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
