# 046 — ShortcutList Component

**WOW level: 5/10**
**Effort: Low**
**Inspired by: repeated `<kbd>` bullet lists found in the blog itself**

## Concept

Un composant MDX `<ShortcutList />` pour afficher une liste de raccourcis clavier (touches + description) de façon cohérente, au lieu de taper une liste à puces `<kbd>` à la main dans chaque article.

Ce n'est **pas** un remplacement de `StepsCard` (qui reste le bon choix pour des listes de référence textuelles type "flag → explication"). `ShortcutList` est spécifiquement pensé pour l'affichage visuel des touches (chips `<kbd>`), avec un layout aligné touches/description.

## AVANT (code actuel, copié tel quel)

Trouvé dans `blog/2026/04/27/ssh_with_fzf/index.md:111-113` :

```md
- For <kbd>CTRL</kbd>+<kbd>A</kbd>, I've set up a secondary screen that displays a list of actions to execute on the selected host.
- For <kbd>CTRL</kbd>+<kbd>I</kbd>, I run an inventory management script that scans all my hosts (or just the filtered ones) and generates a web page with an up-to-date inventory of installed software (such as PHP, Python, PostgreSQL versions).
- For <kbd>E</kbd>, you could, for example, open an editor to directly modify the configuration file of the selected host.
```

Autre exemple, celui qui existait dans `blog/2026/01/12/windows_terminal_split_panes/index.md` avant sa correction manuelle du 2026-07-09 (remplacé entre-temps par un `StepsCard`, mais illustre bien le pattern répété) :

```md
- <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>+</kbd> : Split the current pane vertically.
- <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>-</kbd> : Split the current pane horizontally.
- <kbd>Alt</kbd> + <kbd>Shift</kbd> and use the arrow keys : Increase or decrease the size of the current pane in the direction of the arrow key.
```

Problèmes : séparateur incohérent (`+` tapé en dur vs `and`), pas de style visuel dédié au-delà du `<kbd>` natif, aucune réutilisabilité (copier-coller à chaque article).

<AlertBox variant="note" title="Portée réelle, à ne pas surestimer">
Une recherche sur l'ensemble de blog/2026 ne montre que 2 vraies listes à puces de raccourcis (ci-dessus). Le reste des `<kbd>` dans le blog sont des mentions isolées en pleine prose (ex. "press <kbd>Enter</kbd>"), pour lesquelles ce composant n'apporte rien — il ne faut pas les convertir.
</AlertBox>

## APRÈS (usage proposé du composant)

```mdx
<ShortcutList
  items={[
    {
      keys: ["Ctrl", "A"],
      desc: "Open a secondary screen listing actions available for the selected host.",
    },
    {
      keys: ["Ctrl", "I"],
      desc: "Run an inventory script that scans hosts and generates an up-to-date software inventory page.",
    },
    {
      keys: ["E"],
      desc: "Open an editor to directly modify the configuration file of the selected host.",
    },
  ]}
/>
```

Rendu attendu : une liste où chaque ligne affiche les touches sous forme de "chips" `<kbd>` (avec un `+` visuel automatique entre elles, pas tapé en dur) suivies de la description, alignées verticalement.

## Architecture

### Frontend — `src/components/ShortcutList/index.js`

```jsx
export default function ShortcutList({ items = [] }) {
  return (
    <ul className={styles.list}>
      {items.map(({ keys, desc }, i) => (
        <li key={i} className={styles.row}>
          <span className={styles.keys}>
            {keys.map((k, j) => (
              <React.Fragment key={j}>
                {j > 0 && <span className={styles.plus}>+</span>}
                <kbd>{k}</kbd>
              </React.Fragment>
            ))}
          </span>
          <span className={styles.desc}>{desc}</span>
        </li>
      ))}
    </ul>
  );
}
```

Props :

- `items`: `Array<{ keys: string[], desc: string }>` (requis)

Style : réutiliser la CSS `kbd` déjà définie dans `src/css/custom.css:318` (et sa variante `[data-theme="dark"] kbd` ligne 333) pour la cohérence visuelle avec le reste du site.

### Export global

Ajouter dans `src/components/index.js` (ou l'équivalent qui enregistre les composants MDX globaux) pour un usage sans `import` dans les articles, comme `StepsCard`/`AlertBox`.

## TODO steps

- [ ] Créer `src/components/ShortcutList/index.js` + `styles.module.css`
- [ ] Réutiliser le style `kbd` existant de `src/css/custom.css`
- [ ] Enregistrer le composant dans les MDX globaux
- [ ] Migrer `blog/2026/04/27/ssh_with_fzf/index.md:111-113` comme premier cas d'usage réel
- [ ] Parcourir le folder blog/ et chercher chaque occurences à adapter
- [ ] Ajouter un snippet VS Code `ShortcutList` dans `.vscode/markdown.code-snippets`
