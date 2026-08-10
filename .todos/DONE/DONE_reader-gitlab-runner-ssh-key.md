# Reader review : gitlab-runner-ssh-key

**Détecté :** 2026-08-08
**Article :** blog/2025/05/30/gitlab-runner-ssh-key/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve n'existe dans le corps de l'article. Ni `<Terminal>`
ni capture d'écran entre `<!-- truncate -->` (l.35) et la fin (l.102). Tout le corps est une
suite d'étapes (générer une clé, l'encoder, créer une variable CI, adapter le YAML) et un
`<Snippet>` du `.gitlab-ci.yml` final (l.94), sans jamais montrer un clone privé réussir en CI.
Drapeaux : **abstraction-avant-preuve** — le `<Snippet>` `.gitlab-ci.yml` (l.94) est la seule
pièce concrète et elle n'est pas suivie d'une preuve d'exécution.
Redondance : "SSH key" / "SSH_PRIVATE_KEY" cité 12 fois — 🔴, réparti sur les quatre étapes du
tutoriel plutôt qu'une redite du même fait.

Test des 30 secondes : "on me fait générer une clé SSH, l'encoder en base64, créer une variable
CI masquée, adapter mon YAML — et je n'ai toujours pas vu un job GitLab cloner mon dépôt privé
avec succès" — la promesse du titre n'est jamais visuellement confirmée.

## Risque

Sans extrait de log de pipeline montrant le clone privé réussir (et sans lui, difficile de
distinguer un `id_ed25519` bien formé d'une erreur `invalid format` déjà documentée en fin
d'article, l.96-101), le lecteur suit quatre étapes de configuration à l'aveugle.

## Solution

**Comme pour les deux autres articles GitLab de ce lot, il manque une preuve à déplacer.**
Capturer un extrait de log de pipeline GitLab montrant le clone du dépôt privé réussir grâce à
la clé SSH, puis réordonner :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **Nouvelle preuve** — extrait de log de pipeline GitLab montrant le clone privé réussir | à créer |
| 2 | `## Why it works` — 2-3 puces sans code : clé encodée en base64 dans une variable masquée, réutilisable au niveau repo/groupe/instance | nouveau, condensé depuis l.60-64, l.72-79 |
| 3 | `## First, I need to have an SSH key` | l.44-50 |
| 4 | `## Then, I will encode it for better security` | l.52-56 |
| 5 | `## Third, I have to create a SSH_PRIVATE_KEY CI variable` | l.58-80 |
| 6 | `## Finally, I have to adjust my .gitlab-ci.yml file` (avec l'`<AlertBox>` de dépannage `invalid format` déjà présente) | l.82-101 |
| 7 | `## Conclusion` — à ajouter, l'article n'en a pas actuellement | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
