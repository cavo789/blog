# 055 — Pattern "checkpoint de diagnostic" à surveiller (candidat composant futur)

**Priority:** Low

## Problème

`blog/2025/12/22/docker-networking-troubleshooting/index.md` utilise à répétition (6 fois : lignes
~44, 70, 82, 108, 127, 133) `<AlertBox variant="tip" title="Ok, ...">` purement comme marqueur
"étape de diagnostic validée" après chaque test (ex. "Ok, they're running on the same network.",
"Ok, both containers have a service running..."). Les titres aux lignes 108 et 133 sont quasi
identiques, signe probable d'un copier-coller du même AlertBox comme template.

Ce n'est **pas encore** un pattern répété sur 3+ articles différents (seuil habituel pour justifier
un nouveau composant) — un seul article l'utilise, mais de façon très répétée en interne (6x).

## Risque

Aucun risque immédiat. Simplement : si un futur article de troubleshooting reprend ce même besoin
("case cochée après chaque étape de diagnostic"), on aura deux implémentations légèrement
différentes si on ne standardise pas maintenant.

## Solution proposée

Ne rien faire dans l'immédiat. Si un deuxième article de type troubleshooting/diagnostic apparaît
avec le même besoin, envisager un variant dédié (`StepsCard variant="diagnostic"` ou petit
composant `Checkpoint` avec label + état pass/fail) plutôt que de recopier des `AlertBox` avec des
titres quasi dupliqués.

## Lien avec l'existant

Aucun TODO existant. Trouvé lors du même audit `blog/2025` que [[049]]-[[054]]. Priorité basse
volontairement : pas encore assez de répétition inter-articles pour agir.
