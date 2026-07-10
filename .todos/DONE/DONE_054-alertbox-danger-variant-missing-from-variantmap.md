# 054 — `AlertBox variant="danger"` n'existe pas dans `variantMap` (icône/titre par défaut faux)

**Priority:** Medium

## Problème

`src/components/Blog/AlertBox/index.js` définit `variantMap` avec les clés `info`, `note`, `tip`,
`caution`, `important`, `highlyImportant`, `coreConcept` — **pas `danger`**. Pourtant `danger` est
un variant utilisé dans plusieurs articles (ex. `blog/2025/11/11/running-docusaurus-using-docker/
index.md:152`, `blog/2025/09/09/docusaurus-series/index.md:269`,
`blog/2025/03/16/vba-excel-sql-server-part-2/index.md:179,202`) et **existe bien côté CSS**
(`src/components/Blog/AlertBox/styles.module.css:82` et `:125`, classes `.alertBox.danger` en
light et dark mode).

Dans le composant :

```js
const { Icon, label } = variantMap[variant] || variantMap.info;
```

Comme `variantMap["danger"]` est `undefined`, le fallback `variantMap.info` s'applique : une
AlertBox `variant="danger"` (bordure/fond rouge via CSS) affiche silencieusement l'icône et le
label par défaut de `info` ("ℹ️ Information") quand aucun `title` explicite n'est fourni — ce qui
s'est justement produit sur plusieurs des occurrences repérées avant le nettoyage de [[052]]/du
ménage `title=""` fait dans ce même audit.

## Risque

Incohérence visuelle : une alerte censée signaler un danger (style rouge) affiche l'icône et le
texte "Information" par défaut. Silencieux — aucune erreur de build, juste un mauvais rendu.

## Solution proposée

Ajouter une entrée `danger` dans `variantMap` (icône type `FaExclamationCircle` ou similaire,
label "Danger" via `Translate`), au même niveau que les autres variants. Mettre à jour aussi
`AlertBox.propTypes.variant` implicitement via `Object.keys(variantMap)` (déjà dynamique, donc pas
besoin de retoucher cette ligne).

## Lien avec l'existant

Découvert lors de l'audit `blog/2025` ([[049]]-[[053]]) en nettoyant les `title=""` vides : les
AlertBox `variant="danger" title=""` révélaient ce fallback incorrect. Aucun TODO existant ne
couvre ce point.
