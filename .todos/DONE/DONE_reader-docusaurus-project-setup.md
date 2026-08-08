# Reader review : docusaurus-project-setup

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/02/23/docusaurus-project-setup/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la démo immédiate (premier `<ProjectSetup>`, installer LogoIcon) déplacée en position 2, avant les sections purement descriptives.

## Problème

Time to value : **35 %** (preuve l. 58, le premier `<ProjectSetup>` réellement utilisé, sur un corps de
85 lignes, l. 28-113).
Drapeaux : aucune image hors bannière n'existe dans l'article ; la seule preuve possible est le composant
`<ProjectSetup>` lui-même rendu en direct, ce qui n'arrive qu'après "What is ProjectSetup", "Core
Features" et "Dependencies" — trois sections purement descriptives.

Test des 30 secondes : le TLDR et l'intro (l. 18-26) vendent bien la "killer feature" (un clic → script
→ arborescence créée), mais rien ne la montre avant la ligne 58.

## Risque

L'article démontre son propre composant en l'utilisant pour s'auto-installer — c'est une bonne idée,
mais elle est retardée par 25 lignes de description avant la première démonstration concrète.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 16-27 |
| 2 | Démo immédiate : le premier `<ProjectSetup>` (installer LogoIcon) + le commentaire "in fact, not at all" | l. 54-65 |
| 3 | What is ProjectSetup + Core Features (le "pourquoi", sans code) | l. 30-41 |
| 4 | Dependencies | l. 43-48 |
| 5 | Installer Snippet, ProjectSetup, la page d'aide | l. 80-109 |
| 6 | Conclusion (inchangée) | l. 111-113 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
