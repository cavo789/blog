# Reader review : windows-terminal-ssh-profile

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/01/19/windows-terminal-ssh-profile/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la capture « The new SSH profile » déplacée en position 2, avant les instructions de navigation dans les Settings.

## Problème

Time to value : **65 %** (preuve ligne 70 sur un corps de 63 lignes [29-92]).
Drapeaux : aucun déclencheur dur au sens strict (pas de `<Prerequisite>` / `apt install` /
`<Snippet>` avant la preuve), mais le TTV seul dépasse le seuil rouge (≥ 30 %).
Redondance : aucune répétition significative détectée.

Test des 30 secondes : *"j'abandonne"* — les deux premières sections montrent comment ouvrir
les Settings de Windows Terminal (navigation pure), pas le résultat ; le lecteur ne voit le
profil SSH terminé qu'après avoir suivi deux séries d'étapes.

## Risque

La preuve la plus parlante existe déjà (l. 70, capture *"The new SSH profile in Windows
Terminal"* — le profil visible dans le menu déroulant, juste un clic pour se connecter) mais
elle arrive après les instructions de navigation dans les Settings.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Accroche | Intro + lien vers l'article de connexion SSH | l. 25-27 |
| 2. Résultat | Capture "The new SSH profile in Windows Terminal" + phrase de transition | l. 70 |
| 3. Pourquoi ça marche | 2-3 puces : plus besoin de retaper la commande `ssh`, accès direct via le menu déroulant, personnalisable (icône, image de fond) | nouveau, condensé de l. 68, 86-90 |
| 4. Installation | "Open Windows Terminal Settings" (StepsCard + capture) puis "Add a profile for any SSH connection" (StepsCard) | l. 31-45, 47-66 |
| 5. Démo supplémentaire | Personnaliser avec une image de fond | l. 72-82 |
| 7. Conclusion | Inchangée | l. 84-92 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
