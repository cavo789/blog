# Amélioration — Stylisation des blockquotes

## Problème

`custom.css` ne définit aucun style pour les blockquotes Markdown. Docusaurus/Infima applique son style par défaut : simple bordure gauche grise, sans background, sans personnalisation. Ce n'est pas cohérent avec la charte graphique verte du site.

## Visuel

```
AVANT — style Infima par défaut

│ "Du texte de citation qui peut
│  s'étaler sur plusieurs lignes."

─────────────────────────────────────────────

APRÈS — style personnalisé

Light mode :
┌────────────────────────────────────────────┐
│  "Du texte de citation qui peut            │  ← fond gris très clair
│   s'étaler sur plusieurs lignes."          │     bordure gauche verte
└────────────────────────────────────────────┘  ← coins arrondis droite

Dark mode :
┌────────────────────────────────────────────┐
│  "Du texte de citation qui peut            │  ← fond blanc 4% opacité
│   s'étaler sur plusieurs lignes."          │     bordure gauche teal
└────────────────────────────────────────────┘
```

## Fix

**Fichier :** `src/css/custom.css` — ajouter à la fin :

```css
/* --- BLOCKQUOTES --- */

blockquote {
  border-left: 4px solid var(--ifm-color-primary);
  background: var(--ifm-color-emphasis-100);
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1.25rem;
  margin: 1.5rem 0;
  color: var(--ifm-font-color-base);
  font-style: italic;
}

blockquote p {
  margin-bottom: 0;
}

[data-theme="dark"] blockquote {
  background: rgba(255, 255, 255, 0.04);
  border-left-color: var(--ifm-color-primary);
}
```

## Impact

- Fichier : `src/css/custom.css`
- Tous les articles contenant des `> citation` Markdown
- Test : ouvrir un article avec un blockquote → vérifier en light ET dark mode
