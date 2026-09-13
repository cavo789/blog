---
name: feedback-snippet-relative-paths
description: Snippet/Terminal source= toujours relatif à l'article (./…) ; jamais le préfixe .unpublished/<slug> ni blog/YYYY/MM/DD/
metadata:
  type: feedback
---

Dans un article (`blog/**` ou `.unpublished/**`), l'attribut `source=` d'un `<Snippet>` ou
d'un `<Terminal>` doit **toujours** être relatif à l'article :

```mdx
<Snippet filename="app.py" source="./files/app.py" defaultOpen={false} />
<Terminal title="user@machine: ~/myapp" source="./files/terminal.txt" />
```

La règle porte sur le **préfixe**, quel que soit le fichier visé : un `source` ne doit
**jamais** contenir `.unpublished/` ni `blog/YYYY/MM/DD/`. Interdit quelle que soit la suite :

```text
source=".unpublished/<slug>/…"        ❌  (n'importe quel fichier, pas seulement files/*)
source="blog/2026/09/14/<slug>/…"     ❌
source="./files/app.py"               ✅
source="./images/schema.txt"          ✅
```

**Seule exception** : les sources du repo lui-même que l'article commente (composants React,
CSS, plugins, `.claude/`) — là le chemin part de la racine du projet :
`source="src/components/Card/index.tsx"`, `source="plugins/ascii-injector/index.mjs"`,
`source=".claude/commands/links.md"`.

`filename=` est un **label d'affichage**, pas un chemin résolu : mettre le nom tel qu'on veut
le montrer au lecteur (`app.py`, `Dockerfile.bad`, `.devcontainer/Dockerfile`), jamais un
chemin contenant `.unpublished/`.

**Why:** la publication d'un brouillon se fait par drag & drop du dossier `.unpublished/<slug>/`
vers `blog/YYYY/MM/DD/`. Tout chemin absolu depuis la racine casse silencieusement au moment du
déplacement, et `.unpublished` ne doit jamais subsister dans un article publié.

**How to apply:** à chaque `<Snippet>`/`<Terminal>` écrit ou déplacé, vérifier que `source`
commence par `./`. Audit corpus :
`grep -rnoE 'source="[^"]+"' blog/ .unpublished/ --include="*.md*" | grep -vE 'source="\./'`
— tout hit doit être un fichier du repo (src/, plugins/, .claude/), sinon c'est un bug.
Voir [[project-blog-conventions]] et [[feedback-post-creation]].
