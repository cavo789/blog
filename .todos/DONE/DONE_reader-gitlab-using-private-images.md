# Reader review : gitlab-using-private-images

**Détecté :** 2026-08-08
**Article :** blog/2025/06/06/gitlab-using-private-images/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve d'un pipeline qui fonctionne n'existe dans le corps.
La seule image (l.50, `variables.webp`) montre l'écran de *création* des variables CI/CD, pas
le résultat (un `docker login`/`docker pull` réussi en CI). Le `<Snippet>` final (l.61) est le
`.gitlab-ci.yml`, pas une sortie.
Drapeaux : **abstraction-avant-proof implicite** — tout le corps est une suite d'étapes de
configuration (créer un token, créer des variables, écrire le YAML) sans jamais montrer le
`docker login`/`docker pull` réussir.
Redondance : "token" / "private" cité 13 fois — 🔴, mais réparti sur des étapes distinctes
(création, variables, usage) plutôt qu'une redite du même fait.

Test des 30 secondes : "on me fait créer un token Docker Hub puis deux variables GitLab, mais
rien ne me montre que l'image privée se télécharge vraiment en CI avec cette config" — la
promesse du titre (utiliser une image privée) n'est jamais visuellement confirmée.

## Risque

Sans preuve que le `docker login` fonctionne en CI (un extrait de log de pipeline), le lecteur
doit suivre trois étapes de configuration à l'aveugle avant de savoir si elles marchent.

## Solution

**Comme pour l'article `gitlab-docker-out-of-docker`, il manque une preuve à déplacer.**
Capturer un extrait de log de pipeline GitLab montrant le job faire `docker login` puis
`docker pull` de l'image privée avec succès, puis réordonner :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **Nouvelle preuve** — extrait de log de pipeline GitLab montrant le `docker login`/`docker pull` réussir | à créer |
| 2 | `## Why it works` — 2-3 puces sans code : token en lecture seule, variables masquées et protégées | nouveau, condensé depuis l.23-29, l.52-55 |
| 3 | `## Create a token` | l.33-39 |
| 4 | `## Create two CI/CD variables in your repository page` (avec la capture existante l.50) | l.41-55 |
| 5 | `## Your gitlab-ci.yml file` | l.57-61 |
| 6 | `## Conclusion` — à ajouter, l'article n'en a pas actuellement | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
