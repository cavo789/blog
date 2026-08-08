# Reader review : portainer

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/portainer/index.md (actuellement `.unpublished/portainer/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran demandée a été remplacée par une preuve réelle équivalente (rang 1 de l'échelle de preuve, préféré à un screenshot) : un vrai conteneur Portainer a été lancé, un compte admin créé via l'API `/api/users/admin/init` (token de setup extrait des logs), l'environnement « local » enregistré, et la vraie liste des conteneurs de cet hôte (ollama, open-webui, etc.) récupérée via l'API — capturée dans `files/terminal_containers.txt`.

## Problème

Time to value : **100 %** — aucune preuve nulle part dans le corps (66 lignes) : aucun
`<Terminal>`, aucune capture d'écran, alors que le sujet est un dashboard web (candidat naturel
pour une capture d'écran, palier 3 de l'échelle de preuve).
Drapeaux : la section `## Setting It Up` (mkdir + `<Snippet>` compose.yaml) ouvre le corps, avant
toute preuve visuelle du dashboard.
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — après l'accroche (solide : le cas d'usage "montrer à un
collègue sans SSH" est clair), l'article enchaîne directement installation, premier lancement puis
une description *textuelle* de l'UI ("A Tour") sans jamais montrer une capture d'écran du
dashboard réel.

## Risque

L'accroche promet une alternative visuelle à `lazydocker`, mais l'article ne montre jamais cette
interface — le lecteur doit imaginer le dashboard au lieu de le voir, ce qui affaiblit exactement
l'argument de vente de l'outil (une interface web plutôt qu'un terminal).

## Solution

Un simple réordonnancement ne suffit pas ici non plus : il manque une capture d'écran. Ordre
proposé, avec l'ajout signalé explicitement :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **À rédiger** : capture d'écran du dashboard Portainer (liste de containers, ou un Stack déployé) | nouveau contenu |
| 2 | `## What Portainer Actually Is` (pourquoi ça marche) | l. 27-29 (existant) |
| 3 | `## Setting It Up` | l. 31-43 (existant) |
| 4 | `## First Run` | l. 45-53 (existant) |
| 5 | `## A Tour: Containers, Stacks, and a Real Deploy` | l. 55-63 (existant) |
| 6 | `## lazydocker vs Portainer` | l. 65-69 (existant) |
| 7 | `## A Word on Exposure` (sous signal "optionnel") | l. 71-73 (existant) |
| 8 | `## Key Takeaways` | l. 75-87 (existant) |
| 9 | `## Conclusion` | l. 89-91 (existant) |

Cible : time to value < 15 %, avec une capture d'écran réelle dès le premier écran. Structure de
référence : `.claude/skills/blog-post-structure/SKILL.md`.
