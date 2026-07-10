# 059 — `StepsCard` sous-utilisé pour des listes d'étapes numérotées (2023-2024)

**Priority:** Low
**Category:** component-reuse

## Problem

`<StepsCard variant="steps">` (créé 2025-08-22) rend une liste d'étapes numérotées avec un style
cohérent. De nombreux articles de 2023-2024, tous retouchés après août 2025 (donc le composant
existait), continuent à utiliser une liste Markdown numérotée manuelle pour ce même besoin, alors
que le même article utilise déjà `AlertBox`/`Terminal`/`Snippet` correctement :

- `blog/2024/01/03/quarto-project-variables/index.md:34-38` — 3 étapes
- `blog/2024/01/28/matomo/index.md:28-33` — liste imbriquée (3 étapes, une avec 3 sous-étapes,
  bon candidat pour le support natif `substeps` de StepsCard)
- `blog/2024/01/28/planethoster-n0c-spam-roundcube-action/index.md:47-52` — 6 étapes
- `blog/2024/04/01/windows-terminal/index.md:43-46`
- `blog/2024/04/28/docker-docusaurus-prod/index.md:78-80`
- `blog/2026/01/12/windows_terminal_split_panes/index.md:44-49`
- `blog/2026/01/19/windows-terminal-ssh-profile/index.md:34-37,49-55`
- `blog/2024/12/01/docker-python-devcontainer-windows/index.md:102-162` — particulièrement visible
  car l'article jumeau publié le lendemain, `docker-python-devcontainer-microsoft`, utilise déjà
  `StepsCard` pour le même type de séquence (même série "Coding using a devcontainer")

## Proposed solution

Convertir chaque liste numérotée manuelle listée ci-dessus en `<StepsCard variant="steps"
steps={[...]}>`. Commencer par `docker-python-devcontainer-windows` (gain de cohérence immédiat
avec son article jumeau) et `matomo` (bénéficie du support `substeps`).

## Affected posts

`quarto-project-variables`, `matomo`, `planethoster-n0c-spam-roundcube-action`, `windows-terminal`,
`docker-docusaurus-prod`, `docker-python-devcontainer-windows` (2024) ;
`windows_terminal_split_panes`, `windows-terminal-ssh-profile` (2026).

## Relationship to existing TODOs

Aucun TODO existant sur StepsCard spécifiquement (049/050/051 couvrent BrowserWindow/Terminal/
ProjectSetup). Même thème général que [[049]]-[[051]]/[[058]], composant différent.

## Status — PARTIAL (2026-07-10)

### Done

Converti en `<StepsCard variant="steps" steps={[...]}>` :

- `blog/2024/01/03/quarto-project-variables/index.md` — 3 étapes
- `blog/2024/01/28/matomo/index.md` — 3 étapes, la 3e avec `substeps` (3 sous-étapes) comme suggéré
- `blog/2024/01/28/planethoster-n0c-spam-roundcube-action/index.md` — 6 étapes
- `blog/2024/04/01/windows-terminal/index.md` — liste à puces (pas numérotée) convertie aussi,
  car son contenu est bien une séquence d'actions ; l'image intermédiaire est passée en `content`
  React (`require(...).default` + classe `screenshot`) car StepsCard n'interprète pas le Markdown
  image dans un `string`
- `blog/2026/01/12/windows_terminal_split_panes/index.md` — 4 étapes (méthodes pour ouvrir les
  settings)
- `blog/2026/01/19/windows-terminal-ssh-profile/index.md` — deux listes converties (4 étapes puis
  7 étapes)

Vérification : chaque fichier modifié compilé avec succès via `@mdx-js/mdx` (frontmatter et
commentaires HTML retirés avant compilation, ces derniers nécessitant le plugin remark spécifique
de Docusaurus absent d'une compilation MDX brute). `yarn build` complet échoue mais pour une raison
préexistante et sans rapport : un backtick mal échappé dans un `<kbd>` de
`docker-python-devcontainer-windows/index.md` (fichier non modifié par ce TODO, diff déjà présent
dans l'arbre de travail avant le début de cette session).

### Not done

- `blog/2024/04/28/docker-docusaurus-prod/index.md:78-80` — non converti.
  **Reason:** cet article est marqué `deprecated` en tête de page (redirige vers
  `running-docusaurus-with-docker`) et la liste numérotée en question n'est pas une suite d'étapes
  à suivre par le lecteur mais une énumération explicative intégrée à un paragraphe narratif
  (« Before being able to do this, we need to: 1. ... 2. ... 3. ... This is our three stages. »).
  Convertir forcerait une sémantique « étapes » inadaptée sur un article que l'auteur a déjà
  remplacé.
- `blog/2024/12/01/docker-python-devcontainer-windows/index.md:102-162` — non converti.
  **Reason:** en relisant le contenu, il ne s'agit pas d'une liste Markdown numérotée mais d'une
  suite de sous-sections `###` (« Build the Python Docker image », « Create a Docker container »,
  « Entering the container », « Starting VSCode... »), chacune avec ses propres captures d'écran
  et `AlertBox`. `StepsCard` ne supporte des images/`AlertBox` par étape qu'en passant des noeuds
  React complexes dans `content`, ce qui détruirait la structure actuelle (ancres de titres,
  mise en page par section) pour un gain de cohérence discutable face à l'article jumeau
  (`docker-python-devcontainer-microsoft`), qui lui est un tutoriel bien plus court sans captures
  d'écran intermédiaires. Prémisse du TODO invalidée à la lecture du fichier réel ; nécessiterait
  une décision éditoriale humaine plutôt qu'une conversion mécanique.
