# Reader review : ollama-installation

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/03/30/ollama-installation/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — « Try it in your terminal » (les 3 captures : comparaison, blague, français) déplacé en position 2, avant l'installation et le choix du modèle.

## Problème

Time to value : **38 %** (preuve l. 131 sur un corps de 269 lignes, l. 28-297).
Drapeaux : **install-avant-preuve** (`<Snippet compose.yaml>` l. 44 et `docker exec ... ollama pull` l. 69-70,
tous deux avant la première preuve).
Redondance : aucune majeure détectée.

Test des 30 secondes : "j'abandonne peut-être" — la promesse (« un LLM local et gratuit ») est suivie
immédiatement d'une installation Docker et d'une vérification `free -h`, sans qu'on ait encore vu le
modèle répondre à quoi que ce soit.

## Risque

Les trois images qui prouvent que ça marche (comparaison Quarto/Docusaurus l. 131, blague l. 135,
question en français l. 151) existent déjà et sont convaincantes, mais elles arrivent après la moitié
de l'article (install + choix du modèle + téléchargement). Le lecteur qui doute encore de l'intérêt d'un
LLM local n'a aucune preuve visuelle avant d'avoir lu ~40 % du corps.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 20-27 |
| 2 | Aperçu du résultat : `ollama run`, les 3 captures (comparaison, blague, français) | l. 121-151 |
| 3 | Pourquoi le faire (vie privée, automatisation, coût) | l. 30-34 |
| 4 | Installer et lancer Ollama (`compose.yaml`) | l. 36-46 |
| 5 | Choisir et télécharger un modèle (`free -h`, `ollama pull`, `ollama list`) | l. 48-119 |
| 6 | Interface web (Open WebUI) | l. 153-169 |
| 7 | Extension VSCode (Continue) | l. 171-296 |
| 8 | Conclusion (inchangée) | fin |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
