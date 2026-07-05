# Fix — Footer toujours dark en light mode

## Problème

Dans `docusaurus.config.js`, le footer est configuré avec `style: "dark"` :

```js
footer: {
  style: "dark",
  copyright: `Copyright © ${new Date().getFullYear()} Christophe Avonture. Powered by Docusaurus.`,
},
```

En **light mode**, le passage contenu blanc → footer noir crée un choc visuel abrupt et non cohérent avec le thème.

## Visuel

```
LIGHT MODE — AVANT                     LIGHT MODE — APRÈS
─────────────────────────              ─────────────────────────
┌─────────────────────────┐            ┌─────────────────────────┐
│  article / contenu      │            │  article / contenu      │
│  fond blanc             │            │  fond blanc             │
│                         │            │                         │
├─────────────────────────┤            ├─────────────────────────┤
│████ FOND NOIR ██████████│ ← choc !   │  fond gris très clair   │ ← cohérent
│ © 2025 Christophe       │            │  bordure top subtile    │
└─────────────────────────┘            │  © 2025 Christophe      │
                                       └─────────────────────────┘

DARK MODE — identique dans les deux cas (fond sombre conservé)
```

## Fix

**Étape 1 — `docusaurus.config.js` :** retirer ou changer `style: "dark"` en `style: "light"`

**Étape 2 — `src/css/custom.css` :** ajouter à la fin :

```css
/* --- FOOTER THEME-AWARE --- */

.footer {
  background: var(--ifm-color-emphasis-100);
  color: var(--ifm-font-color-base);
  border-top: 1px solid var(--ifm-color-emphasis-200);
}

.footer__copyright {
  color: var(--ifm-color-emphasis-600);
}

[data-theme="dark"] .footer {
  background: #1b1b1d;
  color: var(--ifm-font-color-base);
  border-top: 1px solid var(--ifm-color-emphasis-300);
}
```

## Impact

- Fichiers : `docusaurus.config.js` + `src/css/custom.css`
- Toutes les pages (le footer est global)
- Test : homepage + article → basculer light/dark → footer doit s'adapter proprement
