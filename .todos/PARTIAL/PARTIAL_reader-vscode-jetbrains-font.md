# Reader review : vscode-jetbrains-font

**Détecté :** 2026-08-09
**Article :** blog/2024/09/19/vscode-jetbrains-font/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve visuelle n'existe nulle part dans l'article (corps de
30 lignes, entre les lignes 30 et 60). Les deux images présentes (l. 40, 52) sont des captures
de l'installation elle-même (l'écran d'installation Windows, le bouton « Open Settings JSON »),
pas du résultat (le code affiché avec la police et ses ligatures).

Drapeaux : install-avant-preuve — la première section après le `<!-- truncate -->` est
`## Install JetBrains Mono font` (l. 34), sans qu'aucun rendu de la police n'ait été montré
avant.

Redondance : aucune, l'article est court.

Test des 30 secondes : « j'abandonne » — la TLDR promet une police « particulièrement lisible »
avec de « belles ligatures », mais rien dans l'article ne montre à quoi ça ressemble avant de
demander l'installation.

## Risque

C'est l'argument central de l'article (une police plus lisible, avec ligatures) qui n'est
jamais démontré visuellement — la promesse de la TLDR reste abstraite du début à la fin.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture d'un extrait de code affiché avec JetBrains Mono (ligatures visibles, `0`/`O` et `l`/`I` distincts) | **à créer** — aucune capture de ce type n'existe actuellement |
| 2 | Pourquoi cette police (lisibilité, ligatures, gratuite) | l. 26-28, reformulé sans code |
| 3 | Installer la police | l. 34-40 |
| 4 | Configurer VSCode (`settings.json`) | l. 42-56 |
| 5 | Conclusion (à étoffer légèrement — lien vers CodeSnap déjà présent) | l. 58-60 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

Note : ce TODO nécessite la création d'une nouvelle capture d'écran (police en usage avec
ligatures) avant de pouvoir être appliqué intégralement.

## Status — PARTIAL (2026-08-09)

### Fait

- Point 2 (Pourquoi cette police) : nouvelle section « Why this font » ajoutée avant
  l'installation, avec les 3 arguments (gratuite, lisibilité O/0 et I/l, ligatures).
- Point 3 et 4 (Installer / Configurer) : ordre inchangé, déjà correctement placés après la
  promesse.
- Point 5 (Conclusion) : section `## Conclusion` ajoutée, récap + lien CodeSnap conservé.
- Ajout d'une `<AlertBox variant="note">` transparente indiquant que la preuve visuelle
  (ligatures en usage) manque encore, pour ne pas laisser croire qu'elle existe.

### Non fait

- Point 1 (Résultat : capture du code avec ligatures visibles) — **bloqué**.
  **Raison :** capture d'écran à créer manuellement (prendre du code avec des ligatures
  JetBrains Mono actives dans VSCode, puis un screenshot) ; hors de portée d'une session
  d'édition de texte. Une fois l'image ajoutée dans `./images/`, ouvrir cet article et déplacer
  cette capture en tête de section (juste après le `<!-- truncate -->`) pour clore ce TODO.
