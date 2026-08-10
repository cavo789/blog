# Reader review : docker-oracle-ords

**Détecté :** 2026-08-09
**Article :** blog/2025/04/11/docker-oracle-ords/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **18 %** (première capture ligne 86 "Getting service name", plus proche d'une
preuve réelle vers l. 116 "Installation of ORDS" sur un corps de 448 lignes,
`<!-- truncate -->` en ligne 34).
Drapeaux : **installation-avant-preuve** — `## Some prerequisites` (l. 40, `<StepsCard>`) arrive
juste après le `<!-- truncate -->`, avant toute preuve.
Redondance : aucune notable.

Test des 30 secondes : le lecteur voit d'abord une checklist de 6 prérequis (reprise à
l'identique de l'article précédent de la série) puis un `docker pull` avant de voir la première
image utile. Le titre ("Transform an Oracle DB as OpenData") promet un résultat concret (accéder
aux données via REST) mais le corps ouvre sur de la configuration.

## Risque

L'objectif final de l'article — interroger `http://oursite/api/employees` et récupérer du JSON —
est déjà décrit en une phrase avant le `<!-- truncate -->` (l. 28) mais n'est montré visuellement
qu'à la ligne 298 (`getting_employees_as_json_curl.webp`), soit à 66 % du corps. C'est la preuve
la plus convaincante de l'article et elle est enterrée après le prérequis, le téléchargement de
l'image, la création du conteneur ORDS, la création de l'utilisateur et l'activation REST du
schéma.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 20-32 |
| 2 | **Résultat d'abord** : capture `getting_employees_as_json_curl.webp` (l. 298) — la commande `curl` et le JSON obtenu | l. 298 |
| 3 | `## Some prerequisites` (déplacé après la preuve) | l. 40-53 |
| 4 | `## Download a Docker image for Oracle REST Data Services` | l. 55-63 |
| 5 | `## Create an Oracle ORDS container` (et sous-sections) | l. 65 et suivantes |
| 6 | Création de l'utilisateur ORDS, activation REST, filtrage avancé (peut être marqué comme approfondissement optionnel pour la partie filtrage) | reste de l'article |
| 7 | `## Further reading` (déjà présente, sert de landing) | l. 477 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
