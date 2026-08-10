# Reader review : docker-out-of-docker-dood

**Détecté :** 2026-08-09
**Article :** blog/2024/12/20/docker-out-of-docker-dood/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **19 %** (preuve l. 63 sur un corps de 130 lignes, `T` = l. 39) — 🟠 seul mais
combiné à un drapeau bloquant.
Drapeaux : abstraction-avant-preuve (les `<Snippet>` `Dockerfile` l. 49 et `compose.yaml`
l. 53 arrivent avant la capture `version.webp` l. 63, seule preuve visuelle de l'article).

Test des 30 secondes : le lecteur lit l'accroche (pourquoi appeler Docker depuis un
conteneur), puis on lui demande directement de créer un `Dockerfile` et un `compose.yaml`
avant d'avoir vu la technique fonctionner une seule fois — *"je copie deux fichiers à
l'aveugle, pour voir quoi ?"*.

## Risque

La preuve existe (`docker version` exécuté depuis le conteneur, l. 63) mais elle arrive après
la création de deux fichiers dont le lecteur ne connaît pas encore l'utilité. Le second bloc
(utilisateur non privilégié, l. 91-152) est un renforcement légitime de la preuve, pas un
doublon — il doit rester en position 5, pas en position 2.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Accroche inchangée (cas d'usage : phplint/portainer depuis un conteneur) | l. 24-37 |
| 2. Le résultat | `docker version` + `docker image list` fonctionnant depuis le conteneur (`version.webp`) | l. 59-65 |
| 3. Pourquoi ça marche | 3-5 puces : montage du socket `/var/run/docker.sock`, le conteneur parle au démon hôte, aucune install Docker-in-Docker complète nécessaire | nouveau, condensé depuis le TLDR |
| 4. Installation | Créer `Dockerfile` + `compose.yaml`, `docker compose up --detach --build`, entrer dans le conteneur | l. 41-61 |
| 5. Plus de démos | Variante utilisateur non privilégié (`group_add`, GID du groupe `docker` hôte) | l. 91-152 |
| 6. Sous le capot (optionnel) | Pourquoi le GID doit correspondre à l'hôte, limites de sécurité de DooD | l. 122-150 (à enrichir) |
| 7. Landing | Conclusion existante (l. 154) + lien vers l'article GitLab CI | l. 154-165 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
