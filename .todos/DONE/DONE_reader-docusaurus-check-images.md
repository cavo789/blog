# Reader review : docusaurus-check-images

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/01/26/docusaurus-check-images/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — la démo (lancer le script + capture `output.webp`) déplacée en position 2, avant les deux dumps de code complets.

## Problème

Time to value : **78 %** (preuve l. 97, capture `output.webp`, sur un corps de 80 lignes, l. 35-115).
Drapeaux : **abstraction-avant-preuve** — deux dumps de code (`MDXComponents.js` l. 45, puis
`check-images.py` en entier l. 75) précèdent la seule preuve visuelle de l'article.

Test des 30 secondes : la promesse (vérifier automatiquement le lazy-loading sur 200+ articles) est
claire, mais le lecteur traverse la quasi-totalité du corps — deux sections d'implémentation complètes —
avant de voir le rapport que le script produit réellement.

## Risque

C'est le TTV le plus élevé du lot pour un article qui a pourtant sa preuve prête (`output.webp`,
l. 97) : elle est juste placée au tout dernier moment, après que le lecteur ait déjà lu l'intégralité
du code source des deux étapes.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 21-33 |
| 2 | Démo : lancer le script, capture `output.webp` | l. 79-97 |
| 3 | Step 1 : forcer le lazy loading (`MDXComponents.js`) | l. 37-47 |
| 4 | Step 2 : le script de vérification (Playwright, BeautifulSoup, Pillow) | l. 49-75 |
| 5 | Vérifications additionnelles + Conclusion (inchangés) | l. 101-115 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
