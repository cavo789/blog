# Reader review : docker-git

**Détecté :** 2026-08-09
**Article :** blog/2025/01/25/docker-git/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve visuelle nulle part dans le corps (l.35-120) : ni
image, ni capture, ni bloc `<Terminal>` montrant une vraie sortie. Les deux moments où le
résultat est censé se vérifier (`git --version`, l.66, et `git config --list`, l.86) sont
seulement racontés ("which is the case", "The sharing has worked as expected"), jamais montrés.
Drapeaux : install-avant-preuve (Dockerfile + `compose.yaml` dès la sortie du truncate, l.37-58)
et abstraction-avant-preuve (`<Snippet filename="Dockerfile">` l.49, `<Snippet
filename="compose.yaml">` l.53).
Redondance : aucune notable.

Test des 30 secondes : le lecteur doit faire confiance à la prose plutôt qu'à une preuve — pas
rédhibitoire pour un article aussi court, mais rien ne prouve, à l'œil, que le partage
`.gitconfig` + clé SSH fonctionne réellement.

## Risque

Un article de configuration Docker sans aucune sortie terminal capturée est le seul cas de ce
lot où le vrai manque n'est pas seulement l'ordre mais le contenu : il manque une preuve à
produire, pas seulement à déplacer.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat *(preuve à capturer)* | Un vrai `<Terminal>` montrant `git --version` puis `git config --list` avec la config de l'hôte visible dans le conteneur | à produire, remplace la narration l. 66, 86 |
| 2. Pourquoi ça marche | 2 puces sans code : `.gitconfig` et la clé SSH sont montés en lecture (seule pour la clé) dans le conteneur | nouveau, distillé des l. 68-111 |
| 3. Installation | `mkdir`, `Dockerfile`, `compose.yaml`, build + entrer dans le conteneur | l. 37-66 |
| 4. Partage config et credentials | Sections existantes, avec le vrai terminal du point 1 inséré ici | l. 68-111 |
| 5. Conclusion | Section existante, déjà correcte | l. 113-119 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
