# Amélioration — Stylisation des tables Markdown

## Problème

`custom.css` ne définit aucun style personnalisé pour les tables Markdown. Docusaurus/Infima applique ses styles de base : pas de hover sur les lignes, pas de header coloré, pas de border-radius. Les tables ne s'intègrent pas bien dans la charte graphique verte du site.

## Visuel

```
AVANT — style Infima par défaut

┌──────────┬──────────┬──────────┐
│ Header 1 │ Header 2 │ Header 3 │  ← fond gris Infima standard
├──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │
├──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │
└──────────┴──────────┴──────────┘

──────────────────────────────────────────────

APRÈS — style personnalisé

Light mode :
╔══════════╦══════════╦══════════╗
║ Header 1 ║ Header 2 ║ Header 3 ║  ← fond vert primaire, texte blanc
╠══════════╬══════════╬══════════╣
│ Cell     │ Cell     │ Cell     │
├──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │  ← hover gris clair
└──────────┴──────────┴──────────┘

Dark mode :
╔══════════╦══════════╦══════════╗
║ Header 1 ║ Header 2 ║ Header 3 ║  ← fond vert foncé, texte blanc
╠══════════╬══════════╬══════════╣
│ Cell     │ Cell     │ Cell     │
├──────────┼──────────┼──────────┤
│ Cell     │ Cell     │ Cell     │  ← hover blanc 5% opacité
└──────────┴──────────┴──────────┘
```

## Fix

**Fichier :** `src/css/custom.css` — ajouter à la fin :

```css
/* --- TABLES --- */

.markdown table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.markdown th {
  background: var(--ifm-color-primary);
  color: white;
  font-weight: 600;
  padding: 0.6rem 1rem;
  text-align: left;
}

.markdown td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
}

.markdown tr:last-child td {
  border-bottom: none;
}

.markdown tr:hover td {
  background: var(--ifm-color-emphasis-100);
}

[data-theme="dark"] .markdown th {
  background: var(--ifm-color-primary-dark);
}

[data-theme="dark"] .markdown td {
  border-bottom-color: var(--ifm-color-emphasis-300);
}

[data-theme="dark"] .markdown tr:hover td {
  background: rgba(255, 255, 255, 0.05);
}
```

## Impact

- Fichier : `src/css/custom.css`
- Tous les articles contenant des tables Markdown
- Test : ouvrir un article avec une table → vérifier en light ET dark mode, tester le hover sur les lignes
