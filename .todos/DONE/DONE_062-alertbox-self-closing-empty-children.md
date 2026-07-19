# 062 — `<AlertBox>` auto-fermées sans enfants (violation PropTypes, corps vide)

**Priority:** Medium
**Category:** bug

## Problem

`AlertBox.propTypes.children` est requis (`src/components/Blog/AlertBox/index.js`), mais 3
occurrences dans le blog utilisent la balise en auto-fermante avec tout le texte fourré dans
`title`, ce qui produit un corps de composant vide et un warning PropTypes en console :

- `blog/2024/01/27/planethoster-n0c-spam/index.md:44` — `<AlertBox variant="note" title="In my
case, all the emails coming from .su can only be unsolicited emails." />`
- `blog/2024/01/28/planethoster-n0c-spam-roundcube-action/index.md:206` et `:232` —
  `<AlertBox variant="info" title="Skip this chapter if you don't want full automation" />`

## Proposed solution

Restructurer chacune des 3 occurrences en donnant un `title` court et en déplaçant le texte actuel
dans le corps (`children`) du composant, par exemple :

```jsx
<AlertBox variant="note" title="Unsolicited emails">
  In my case, all the emails coming from `.su` can only be unsolicited emails.
</AlertBox>
```

## Affected posts

`blog/2024/01/27/planethoster-n0c-spam/index.md`,
`blog/2024/01/28/planethoster-n0c-spam-roundcube-action/index.md` (2 occurrences).

## Relationship to existing TODOs

Aucun TODO existant. Trouvé lors de l'audit `/review_blog` complet (lot blog/2024 janvier).
