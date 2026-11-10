---
name: feedback-mdx-terminal-braces
description: "Un ${VAR} dans un <Terminal> inline fait planter la page (« VAR is not defined ») ; utiliser source=\"./files/x.txt\" ; une compilation MDX OK ne le détecte pas"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5fcf43af-5813-4b8a-afc0-d766cfc7777a
  modified: 2026-11-10T13:50:01.216Z
---

Dans un article, tout `{...}` écrit dans les enfants d'un composant JSX inline (`<Terminal>…</Terminal>`)
est une **expression JavaScript** pour MDX. `"${VERSION}"` compile sans erreur puis plante au rendu :
*This page crashed. VERSION is not defined* (draft `hurl`, 2026-11-10).

**Why:** `@mdx-js/mdx compile()` réussit — l'expression est du JS valide — donc « MDX OK » ne prouve rien ;
le plantage n'arrive qu'à l'exécution, dans le preview du site.

**How to apply:**
- Toute commande shell contenant `${…}`, `$(…)` avec accolades, ou `{…}` → fichier `./files/terminal_*.txt`
  chargé par `<Terminal source=…>` : `remark-snippet-loader` l'injecte comme `Literal`, sans évaluation.
- Vérification mécanique avant de rendre un article : parser avec `micromark-extension-mdxjs` +
  `mdast-util-mdx` et lister les nœuds `mdxTextExpression`/`mdxFlowExpression` ; il ne doit rester que
  des attributs voulus (`defaultOpen={false}`, `wrap={true}`). Voir [[verification-discipline]].
