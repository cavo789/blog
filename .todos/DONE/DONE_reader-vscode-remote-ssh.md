# Reader review : vscode-remote-ssh

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/01/05/vscode-remote-ssh/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « Working on the production server » déplacée en position 2, avant la simulation Docker et l'installation de l'extension.

## Problème

Time to value : **21 %** (preuve ligne 67 sur un corps de 157 lignes [34-191]).
Drapeaux : abstraction-avant-preuve — le `Dockerfile` complet (`<Snippet>`, l. 50) est affiché
avant toute preuve de résultat.
Redondance : aucune répétition significative.

Test des 30 secondes : *"j'abandonne"* — les 40 premières lignes après `<!-- truncate -->`
ne parlent que de construire un conteneur Docker simulant un serveur SSH ; le vrai sujet de
l'article (éditer des fichiers distants depuis VS Code) n'apparaît qu'à la ligne 77, hors de
l'écran d'évaluation.

## Risque

Le lecteur venu pour "VS Code Remote-SSH" doit d'abord lire toute la mise en place d'un
conteneur de démonstration avant de voir VS Code entrer en jeu. La preuve du concept (capture
l. 71, *"Playing with the SSH terminal"*, ou mieux l. 162 *"Working on the production
server"*) existe déjà mais arrive très tard.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro + cas d'usage (accès DB via serveur Linux) | l. 26-32 |
| 2. Résultat | Capture "Working on the production server" (édition distante active dans VS Code) + une phrase | l. 162 |
| 3. Pourquoi ça marche | Puces : pas de copie manuelle de fichiers, terminal intégré exécuté sur l'hôte distant, un seul outil pour éditer + exécuter | nouveau, condensé de l. 26, 164 |
| 4. Installation — Simuler un serveur en local | Dockerfile + build/run + test SSH (bac à sable) | l. 38-75 |
| 5. Démo supplémentaire — Serveur de production réel | Connexion au vrai serveur (Remote Explorer, config SSH Windows) | l. 77-164 |
| 6. Sous le capot (optionnel) | Bonus : un couple de clés SSH par serveur | l. 170-182 |
| 7. Conclusion | Inchangée | l. 184-190 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
