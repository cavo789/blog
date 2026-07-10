# 047 — Prerequisite / ToolCheck Component

**WOW level: 5/10**
**Effort: Low-Medium**
**Inspired by: repeated "install → verify with `--version`" blocks found in the blog itself**

## Concept

Un composant MDX `<Prerequisite />` qui encapsule le pattern "installer un outil CLI, puis vérifier avec `--version`", répété à l'identique dans plusieurs articles avec deux blocs `<Terminal>` séparés + phrases de liaison ("Verify:", "If not, install it:") retapées à chaque fois.

## AVANT (code actuel, copié tel quel)

`blog/2026/06/15/git-delta/index.md:40-51` :

```md
## Install

<Terminal>
$ sudo apt install git-delta
</Terminal>

Verify:

<Terminal>
$ delta --version
delta 0.18.2
</Terminal>
```

`blog/2026/06/08/fzf-ripgrep/index.md:40-65` (deux outils, même pattern répété deux fois dans le même article, ordre inversé check-puis-install) :

```md
<Terminal typewriter>
$ rg --version
ripgrep 14.1.0
</Terminal>

If not, install it:

<Terminal typewriter>
$ sudo apt install ripgrep
</Terminal>
```

```md
<Terminal typewriter>
$ bat --version
bat 0.24.0
</Terminal>

If not installed:

<Terminal typewriter>
$ sudo apt install bat
</Terminal>
```

`blog/2026/07/06/ripgrep/index.md:61-67` : encore le même pattern check + AlertBox "want the latest version?".

Problèmes : la phrase de liaison change à chaque fois ("Verify:", "If not, install it:", "If not installed:"), l'ordre install/check est inversé selon les articles, deux composants `<Terminal>` à écrire à la main à chaque fois pour un besoin strictement identique.

## APRÈS (usage proposé du composant)

```mdx
<Prerequisite
  name="git-delta"
  install="sudo apt install git-delta"
  check="delta --version"
  checkOutput="delta 0.18.2"
/>
```

Rendu attendu : un seul bloc visuel avec le nom de l'outil, la commande d'installation, puis la commande + sortie de vérification — même structure et même wording partout, sans avoir à réécrire "Verify:"/"If not installed:" ni à dupliquer deux `<Terminal>`.

Cas à deux outils (fzf-ripgrep) :

```mdx
<Prerequisite name="ripgrep" install="sudo apt install ripgrep" check="rg --version" checkOutput="ripgrep 14.1.0" />
<Prerequisite name="bat" install="sudo apt install bat" check="bat --version" checkOutput="bat 0.24.0" />
```

## Architecture

### Frontend — `src/components/Prerequisite/index.js`

```jsx
export default function Prerequisite({ name, install, check, checkOutput }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.name}>Prerequisite: <code>{name}</code></p>
      <Terminal typewriter>
        {`$ ${install}`}
      </Terminal>
      <p className={styles.verify}>Verify:</p>
      <Terminal typewriter>
        {`$ ${check}${checkOutput ? `\n${checkOutput}` : ""}`}
      </Terminal>
    </div>
  );
}
```

Props :
* `name`: `string` (requis) — nom de l'outil affiché
* `install`: `string` (requis) — commande d'installation
* `check`: `string` (requis) — commande de vérification (ex. `--version`)
* `checkOutput`: `string` (optionnel) — sortie attendue affichée sous la commande

Peut réutiliser directement le composant `Terminal` existant en interne (pas de réinvention du rendu terminal).

### Export global

Enregistrer dans les MDX globaux comme les autres composants (`StepsCard`, `AlertBox`, `Terminal`).

## TODO steps

* [ ] Créer `src/components/Prerequisite/index.js` + `styles.module.css` (réutilise `Terminal` en interne)
* [ ] Enregistrer le composant dans les MDX globaux
* [ ] Migrer les 3 occurrences existantes comme premiers cas d'usage réels : `git-delta/index.md`, `fzf-ripgrep/index.md` (x2), `ripgrep/index.md`
* [ ] Parcourir le folder blog/ et chercher chaque occurences à adapter
* [ ] Ajouter un snippet VS Code `Prerequisite` dans `.vscode/markdown.code-snippets`
