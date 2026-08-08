# Reader review : gemini-tldr

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/02/16/gemini-tldr/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. L'exemple avant/après manquant a été produit réellement : les vrais paragraphes d'ouverture de l'article `lovable-dev-ai` comme « avant », et un screenshot Playwright du `<TLDR>` réellement rendu sur ce même post publié comme « après » — enregistré dans `images/example_tldr_output.png`.

## Problème

Time to value : **100 %** — aucune preuve nulle part dans le corps : aucune image hors bannière, et les
3 `<Terminal>` ne montrent que des commandes à lancer, jamais une sortie capturée ni un exemple de
résumé TLDR généré.
Drapeaux : **abstraction-avant-preuve** — le composant React `<TLDR>` (implémentation, l. 58-60) est
donné avant toute preuve que le script produit effectivement un bon résumé.

Test des 30 secondes : le lecteur comprend le principe (scanner → résumer → injecter) mais ne voit
jamais un exemple concret de résumé généré par le script, alors que c'est précisément ce qui devrait
convaincre qu'il vaut la peine d'être automatisé.

## Risque

Un article sur la génération de résumés qui ne montre jamais un résumé généré est le même piège que
`docusaurus-ai-gemini` : la preuve existe forcément quelque part sur le blog (les TLDR déjà publiés)
mais n'est pas montrée ici.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 20-30 |
| 2 | **Nouveau** : un exemple avant/après — texte brut d'un article vs le `<TLDR>` généré (capture ou extrait) — à produire | — |
| 3 | The Concept (le principe en 5 étapes) | l. 34-46 |
| 4 | The React Component | l. 48-60 |
| 5 | The Automation Script (Docker, exécution, erreur 429) | l. 62-130 |
| 6 | Conclusion + fichiers du projet (inchangé) | l. 132-159 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** comme pour `docusaurus-ai-gemini`, ce RESTRUCTURE nécessite un exemple concret (capture ou
extrait de texte) qui n'existe pas encore dans l'article.
