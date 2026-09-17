---
name: feedback-continuous-improvement
description: "Carte blanche permanente : enrichir mémoire, rules, skills et agents à tout moment pertinent, sans demander"
metadata:
  node_type: memory
  type: feedback
---

**Permission permanente accordée le 2026-09-16.** Ne plus demander l'autorisation pour :

- **enrichir la mémoire** (`.claude/memory/`) dès qu'une revue de code, un build ou un diagnostic
  révèle quelque chose de non évident sur le blog — architecture, pièges, invariants ;
- **écrire ou réécrire les rules** (`.claude/rules/`), **skills** (`.claude/skills/`) et
  **agents** (`.claude/agents/`) pour que l'enseignement d'une session serve aux suivantes.

**Why:** l'auteur constate qu'une session qui parcourt beaucoup de code produit du savoir qui se
perd. Il préfère le voir capitalisé immédiatement plutôt que résumé en fin de session.

**How to apply:** capitaliser **pendant** le travail, pas à la fin — une règle écrite juste après
le bug qui la motive est précise ; la même écrite deux heures plus tard est vague. Une règle vaut
surtout par son **critère de recherche** (« comment aurais-je trouvé ce bug ? »), pas par la liste
des symptômes. Voir [[project_i18n_architecture]] et les rules `i18n-locale-safety` /
`build-verification`, nées de la session du 2026-09-16.
