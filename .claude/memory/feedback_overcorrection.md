---
name: feedback-overcorrection
description: "Ne pas transformer un incident unique en règle d'architecture — revérifier toute correction contre l'exigence d'origine"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 92d522aa-c7b6-4e25-9bf6-719bef0ff9b0
  modified: 2026-09-25T13:43:26.095Z
---

Après un incident réel, la correction doit être **relue contre l'exigence d'origine** avant d'être
implémentée. Un seul cas observé ne suffit pas à justifier un changement de conception.

Cas fondateur (2026-09-25, TODO 0131, backend Ollama pour les ELI5). Un `--backend ollama --force`
a écrasé un sidecar publié par une version dégradée. Deux corrections proposées, **les deux
mauvaises, les deux rejetées par Christophe** :

1. Un second flag `--i-know` en plus de `--force` → il a fait remarquer que `--force` *est* déjà
   le geste « oui, j'écrase », et que le seul chemin vers l'accident passe par lui. Un second flag
   se colle au premier et cesse de vouloir dire quelque chose.
2. Rediriger la sortie locale vers `.eli5-local/` → implémenté, puis retiré : rien ne lit ce
   répertoire, la justification avancée (« tu peux differ contre le publié ») ne tenait pas
   puisque Claude n'est pas déterministe non plus, et surtout **cela cassait le critère
   d'acceptation 2 du TODO que je venais de clore moi-même**, écrit trois lignes plus haut.

La bonne réponse était la traçabilité, pas l'interdiction : une passe PROVENANCE dans
`check-eli5-freshness.mjs` qui signale tout sidecar publié écrit par un modèle non-`claude-*`.

**Why:** le bench avait été vérifié ligne à ligne ; la correction issue du bench, pas du tout.
La discipline de vérification s'applique aussi — surtout — aux décisions de conception prises
sous le coup d'un incident. Voir [[feedback-verification-discipline]].

**How to apply:** avant d'implémenter un garde-fou né d'un incident, répondre à trois questions.
(a) Est-ce que j'interdis un geste que l'utilisateur veut légitimement faire ? (b) Est-ce que ma
correction contredit une exigence écrite ailleurs — TODO, CLAUDE.md, critère d'acceptation ?
(c) Est-ce que « rendre visible » suffirait au lieu d'« empêcher » ? Dans un dépôt mono-auteur où
c'est Christophe seul qui décide ce qui se publie, (c) est presque toujours la bonne réponse.
Voir aussi [[feedback-challenge-me]] : il contredit, et il a raison assez souvent pour qu'une
objection de sa part vaille un réexamen complet, pas une défense.
