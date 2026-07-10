# 048 — AlertBox : le shorthand `border` écrase silencieusement le `border-left` accentué

**Priority:** Low

## Problème

Repéré pendant [[DONE_039]] (nettoyage des couleurs hex) par la règle stylelint
`declaration-block-no-shorthand-property-overrides`, mais hors scope de ce TODO-là (règle
distincte de `color-no-hex`, non liée aux tokens de couleur).

`src/components/Blog/AlertBox/styles.module.css` déclare, pour deux variantes, un `border-left`
plus épais/coloré **avant** un `border`/`border-color` shorthand qui s'applique aux 4 côtés — le
shorthand écrase donc silencieusement ce qui vient d'être posé sur le côté gauche :

```css
/* highlyImportant — le pire cas, couleurs différentes */
.alertBox.highlyImportant {
  border-left: 5px solid #e53935;  /* thicker left border */  ← posé...
  border: 1px solid #f44336;       /* border all around */    ← ...puis écrasé (1px, mauvaise couleur)
}

[data-theme='dark'] .alertBox.highlyImportant {
  border-left-color: #e53935;  ← posé...
  border-color: #f44336;       ← ...puis écrasé (même bug, en dark)
}

/* coreConcept — bug plus discret, la couleur est la même des deux côtés */
.alertBox.coreConcept {
  border-left: 6px solid #f9c846;  ← posé (6px)...
  border: 1.5px solid #f9c846;     ← ...puis écrasé (1.5px, même couleur donc invisible)
}
```

Vérifié visuellement (Playwright, light + dark) sur `variant="highlyImportant"` dans l'article
`joomla-db-kill-tables-prefix` : la bordure rendue est uniforme (1px, `#f44336`), pas de liseré
gauche plus épais/rouge vif comme le suggèrent les commentaires `/* thicker left border */`.

## Risque

Cosmétique, pas de casse fonctionnelle. Mais l'intention de design (liseré gauche accentué pour
signaler visuellement les alertes les plus graves — `highlyImportant` en particulier) ne se
produit jamais depuis l'introduction de ce composant. Risque de résurgence : toute nouvelle
variante suivant ce même pattern (`border-left` puis `border`) reproduira le bug.

## Solution proposée

Inverser l'ordre : déclarer le shorthand `border`/`border-color` **avant** le `border-left`/
`border-left-color` qui doit primer sur le côté gauche.

```css
.alertBox.highlyImportant {
  border: 1px solid #f44336;
  border-left: 5px solid #e53935;
  background-color: #ffebee;
  ...
}

[data-theme='dark'] .alertBox.highlyImportant {
  border-color: #f44336;
  border-left-color: #e53935;
  ...
}

.alertBox.coreConcept {
  border: 1.5px solid #f9c846;
  border-left: 6px solid #f9c846;
  ...
}
```

Après correction, `highlyImportant` doit afficher un liseré gauche visiblement plus épais et plus
vif (`#e53935`) que le reste du contour (`#f44336`) — vérifier en light **et** dark avant de
fermer. `coreConcept` n'aura pas de différence visuelle (couleurs identiques des deux côtés) mais
la largeur effective du liseré gauche passera de 1.5px à 6px comme annoncé par le commentaire.

## Lien avec l'existant

Trouvé pendant [[DONE_039]] ; la règle stylelint qui le détecte (
`declaration-block-no-shorthand-property-overrides`) a été ajoutée dans le même lot que
`color-no-hex` lors de [[PARTIAL_036]], mais couvre un problème distinct — non traité par 039 pour
rester focalisé sur les couleurs.
