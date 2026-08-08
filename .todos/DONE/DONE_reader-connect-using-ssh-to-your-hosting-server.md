# Reader review : connect-using-ssh-to-your-hosting-server

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2025/12/29/connect-using-ssh-to-your-hosting-server/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « Success » déplacée en position 2, avant la collecte des 4 informations et la création de la clé.

## Problème

Time to value : **39 %** (preuve ligne 85 sur un corps de 146 lignes [28-174]).
Drapeaux : install-avant-preuve — deux `<StepsCard variant="prerequisites">` (l. 30, l. 60)
demandent de récupérer les identifiants du compte avant toute preuve de connexion.
Redondance : aucune répétition significative.

Test des 30 secondes : *"j'abandonne"* — la toute première chose demandée est de récupérer 4
informations (utilisateur, serveur, port, mot de passe) sur le tableau de bord PlanetHoster ;
rien ne montre encore que `ssh planethoster` fonctionne au final.

## Risque

La preuve la plus parlante (capture l. 161, *"Success"* — connexion immédiate sans mot de
passe grâce à l'alias `ssh planethoster`) existe déjà mais arrive tout à la fin, après la
collecte d'informations et la création de la clé SSH.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro + promesse (`ssh planethoster` en une commande) | l. 22-26 |
| 2. Résultat | Capture "Success" (connexion immédiate, sans mot de passe) + une phrase | l. 161 |
| 3. Pourquoi ça marche | Puces : clé publique déposée côté serveur, alias dans `~/.ssh/config`, plus de mot de passe à retaper | nouveau, condensé de l. 18, 119, 127 |
| 4. Installation | Prérequis (4 infos à récupérer) + connexion manuelle + création de la clé + copie de la clé + fichier config | l. 30-159 |
| 5. Démo supplémentaire | Troubleshooting & tips | l. 163-167 |
| 7. Conclusion | Inchangée | l. 169-174 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
