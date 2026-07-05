# Fix — OldPostNotice : fond jaune cassé en dark mode

## Problème

`src/components/Blog/OldPostNotice/styles.module.css` utilise des couleurs hardcodées light-only :

```css
.oldPostNotice {
  background-color: #fff3cd;   /* ← jaune clair toujours */
  color: #856404;               /* ← texte brun toujours */
  border: 1px solid #ffeeba;   /* ← bordure jaune toujours */
}
```

Le composant utilise aussi la classe Docusaurus `alert alert--warning` qui gère le dark mode, mais le CSS personnalisé **écrase** ces couleurs. Résultat : en dark mode, une boîte jaune vif (fond clair) sur fond sombre — très perturbant.

## Visuel

```
LIGHT MODE — correct                   DARK MODE — AVANT (bug)
─────────────────────────              ─────────────────────────
┌─────────────────────────┐            ┌─────────────────────────┐
│ ⚠️ #fff3cd background   │            │████████████████████████ │ ← fond sombre
│  This article is over…  │            │ ⚠️ #fff3cd background   │ ← FOND JAUNE CLAIR
│  brun #856404           │            │  This article is over…  │   sur fond noir!
└─────────────────────────┘            └─────────────────────────┘

DARK MODE — APRÈS
┌─────────────────────────┐
│████████████████████████ │ ← fond sombre
│ ⚠️ fond ambre foncé     │ ← discret, cohérent
│  This article is over…  │   texte clair
└─────────────────────────┘
```

## Fix

**Fichier :** `src/components/Blog/OldPostNotice/styles.module.css`

```css
.oldPostNotice {
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #ffeeba;
  margin-bottom: 1.5rem;
}

/* Ajouter : */
[data-theme="dark"] .oldPostNotice {
  background-color: rgba(133, 100, 4, 0.15);
  color: #f0c040;
  border-color: rgba(133, 100, 4, 0.4);
}
```

## Impact

- Fichier : `src/components/Blog/OldPostNotice/styles.module.css`
- Tous les articles publiés il y a plus d'un an
- Test : ouvrir un vieil article → basculer en dark mode → la boîte doit être discrète (fond ambré sombre, texte jaune clair)
