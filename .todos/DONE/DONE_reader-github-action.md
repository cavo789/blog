# Reader review : github-action

**Détecté :** 2026-08-11
**Article :** blog/2024/01/14/github-action/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **72 %** (preuve ligne 50 sur un corps de 29 lignes, `T = 29`).
Drapeaux : **abstraction-avant-preuve** — le `<Snippet .github/workflows/deploy.yml>` (l. 33)
est le tout premier élément du corps, avant qu'aucune capture n'ait montré une action qui tourne.
Redondance : 🟢 (article court, aucun fait répété plus de 2 fois).

Test des 30 secondes : *je reste, mais à contrecœur* — la première chose que je vois après le
`<!-- truncate -->` est un fichier YAML complet que je ne sais pas encore lire, sans avoir vu à
quoi ressemble un déploiement réussi.

## Risque

Le lecteur d'une minute voit un workflow YAML brut et se demande combien de temps ça va lui
prendre. Or les deux captures d'écran (`action_is_running.webp` l. 50, `pushing.webp` l. 54) et
la phrase clé — « quatre minutes, blog déployé » (l. 56) — existent déjà dans l'article : elles
sont simplement à la fin, là où seul le lecteur déjà convaincu arrive.

Point secondaire : pas de `## Conclusion`. L'article s'arrête sur un lien vers
`github-profile-last-blogposts` sans récapituler ce qui vient d'être mis en place.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook inchangé (script FTP manuel, ses limites) + `<!-- truncate -->` | l. 22-29 |
| 2 | `## What GitHub Actions Does For You` — « à chaque push, le blog se met à jour tout seul » + capture `action_is_running.webp` + capture `pushing.webp` + « quatre minutes plus tard, blog à jour » | l. 50-56 |
| 3 | Une phrase : « trois ingrédients — un fichier workflow, trois secrets de dépôt, un utilisateur FTP restreint » | nouveau (une phrase, issue du TLDR l. 17-19) |
| 4 | `## Setting It Up` → le `<Snippet deploy.yml>` puis la création des trois secrets et le push | l. 31-48 |
| 5 | `<AlertBox>` utilisateur FTP restreint, gardé à sa place dans l'installation | l. 37-41 |
| 6 | `## Conclusion` — ce qui a disparu (le script WinSCP lancé à la main), + le lien existant vers `github-profile-last-blogposts` | l. 58 + nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
