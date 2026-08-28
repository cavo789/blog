# 0109 — Passer `onBrokenMarkdownLinks` à `throw`

- **Priority**: Medium
- **Batch**: unassigned
- **Depends**: —
- **Files**: `docusaurus.config.js`

## Problème

`docusaurus.config.js` durcit déjà `onBrokenLinks: "throw"`, `onBrokenAnchors: "throw"` et
`onDuplicateRoutes: "throw"`. Mais `onBrokenMarkdownLinks` n'est pas défini : il vaut donc
son défaut `"warn"`. Un lien Markdown cassé **à l'intérieur d'un article** (`[texte](./autre-article)`
vers un fichier renommé ou supprimé) ne fait que logger un warning noyé dans la sortie du
build, et le site part en prod avec le lien mort.

C'est exactement la classe de bug que le reste de la config a choisi de faire planter au
build plutôt qu'en CI ou en prod.

## Solution

En Docusaurus 3.10, l'option a migré sous `markdown.hooks` (l'ancienne clé racine est
dépréciée et sera retirée en v4) :

```js
markdown: {
  mermaid: true,
  hooks: {
    onBrokenMarkdownLinks: "throw",
  },
},
```

### Points à trancher pendant l'implémentation

- **Faire d'abord un run à `"warn"` bruyant** : `yarn build 2>&1 | grep -i "broken markdown"`
  pour lister l'existant. S'il y a des liens cassés aujourd'hui, les corriger dans le même
  lot avant de passer à `throw` — sinon le premier build échoue.
- **`.unpublished/`** n'est pas dans le build de prod, donc hors périmètre ; mais `yarn start`
  les compile — vérifier que le dev server ne devient pas inutilisable.
- Garder `mermaid: true` dans le bloc `markdown` existant, ne pas l'écraser.

## Risque

Très faible. Le seul risque est qu'un lien cassé préexistant fasse échouer le prochain
build — d'où l'audit préalable à `"warn"`. Bénéfice net immédiat une fois le socle propre.

## Acceptance

- `markdown.hooks.onBrokenMarkdownLinks` vaut `"throw"` dans la config.
- `yarn build` passe (donc aucun lien Markdown interne cassé au moment du merge).
- Introduire volontairement `[test](./fichier-inexistant)` dans un article fait échouer
  `yarn build`.
