# Reader review : docker-prod-devcontainer

**Détecté :** 2026-08-08
**Article :** blog/2025/10/13/docker-prod-devcontainer/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **42 %** (preuve l. 208-214 sur un corps de 417 lignes, l. 31-448).
Drapeaux : abstraction-avant-preuve (`<Snippet>` de `.env`, `Dockerfile`, `requirements.txt`,
`src/main.py` l. 78-152, quatre fichiers créés avant toute preuve visuelle).
Redondance : correcte pour un article de cette ampleur (concepts expliqués une fois en tête
d'article, cf. `<AlertBox variant="coreConcept">` l. 33-36 et 52-54).

Test des 30 secondes : mitigé — l'ouverture conceptuelle (deux images Docker, séparation
prod/dev, l. 33-56) est solide et sans code, donc elle passe le test de crédibilité. Mais dès
`## Step 1`, l'article enchaîne quatre créations de fichiers avant tout signe que "ça marche".

## Risque

La preuve la plus parlante (l. 208-214 : `http://localhost:8000` répond
`{"message":"Hello, FastAPI - PRODUCTION!"}`) arrive après la création de quatre fichiers
et deux commandes Docker. Pour un article dont la promesse est "une seule image, propre,
pour la prod ET le devcontainer", montrer les deux images qui tournent tôt renforcerait
immédiatement la crédibilité de la démarche.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + concepts clés (deux `<AlertBox coreConcept>`, schéma des deux images) | l. 31-56 |
| 2 | Résultat final : capture du conteneur PROD (l. 228) + réponse FastAPI (`<BrowserWindow>` l. 208-214) — déplacés tôt comme teaser | l. 208-228 |
| 3 | `## Step 1 - We have to create the production docker image` (création des fichiers, build, run — inchangé, incluant la preuve déjà teasée) | l. 58-228 |
| 4 | `## Step 2 - Override (or extend)...` et suite (inchangé) | l. 230-448 |

Le teaser en position 2 réutilise telles quelles les deux preuves déjà présentes dans
l'article ; rien n'est coupé, l'étape 3 garde tout le détail (fichiers, `docker compose
build`, vérification de l'utilisateur non privilégié) pour le lecteur qui continue.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
