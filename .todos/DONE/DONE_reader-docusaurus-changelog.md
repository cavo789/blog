# Reader review : docusaurus-changelog

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2025/11/18/updated_component/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « Demo » déplacée en position 2. La conclusion existante (lien vers l'article connexe) a été étoffée en une vraie clôture.

## Problème

Time to value : **93 %** (preuve ligne 87 sur un corps de 54 lignes [37-91]).
Drapeaux : abstraction-avant-preuve — le code du composant `Updated` (l. 45, 47) et le swizzle
de `BlogPostItem/Content` (l. 63) sont montrés avant toute preuve visuelle.
Redondance : aucune répétition significative.

Test des 30 secondes : *"j'abandonne"* — l'article enchaîne directement sur la création de deux
fichiers de composant puis le swizzle d'un theme Docusaurus, sans montrer à quoi ressemble le
changelog une fois affiché sur un article.

## Risque

La preuve (capture l. 87, *"Demo"*) existe déjà mais arrive tout à la fin, après tout le code
du composant et le swizzle.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro (limite du `last_update` natif) + exemple YAML natif | l. 25-35 |
| 2. Résultat | Capture "Demo" (le changelog affiché sur un article) + une phrase | l. 87 |
| 3. Pourquoi ça marche | Puces : parse un tableau `updates` en frontmatter, plusieurs dates/notes possibles, s'affiche automatiquement via le theme swizzlé | nouveau, condensé de l. 21, 49 |
| 4. Installation | Créer le composant `Updated` + swizzler `BlogPostItem/Content` + injecter le code | l. 41-63 |
| 5. Démo supplémentaire | Ajouter une entrée `updates` à un article existant | l. 65-83 |
| 7. Conclusion | Étoffer le lien final vers l'article complémentaire (bannière "over a year old") en une vraie conclusion | l. 89-91 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
