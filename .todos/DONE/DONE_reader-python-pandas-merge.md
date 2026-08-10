# Reader review : python-pandas-merge

**Détecté :** 2026-08-09
**Article :** blog/2024/12/06/python-pandas-merge/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **74 %** (preuve l. 109 sur un corps de 77 lignes, `T` = l. 52).
Drapeaux : abstraction-avant-preuve (le `<Snippet>` `generate_fake_data.py` l. 74 précède la
première image, `generate_fake_data.webp` l. 91, elle-même une étape intermédiaire — la vraie
preuve, `merged.webp` l. 109, arrive encore plus tard).

Test des 30 secondes : après l'accroche (avant `<!-- truncate -->`, qui montre déjà un avant/
après CSV — bien), le corps repart de zéro avec un `<AlertBox>` sur les cas limites puis un
script complet de génération de fausses données avant de montrer le moindre résultat de
fusion — *"le vrai sujet, c'est le merge, pourquoi je lis un générateur de données d'abord ?"*.

## Risque

L'avant/après du CSV placé avant `<!-- truncate -->` (l. 40-49) prouve déjà l'idée dans
l'extrait — bon signal — mais le corps ne capitalise pas dessus : il repart en arrière vers la
génération de données factices au lieu d'enchaîner directement sur le résultat fusionné
(`merged.webp` l. 109, `excel.webp` l. 115) qui est la vraie preuve du merge Pandas.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Accroche + avant/après CSV existant | l. 23-52 |
| 2. Le résultat | `merge.py` en une ligne de contexte + `merged.webp` + `excel.webp` (le fichier fusionné) | l. 93-115 |
| 3. Pourquoi ça marche | 3-5 puces : `outer join` sur l'identifiant, gestion des arrivées/départs (`<AlertBox>` condensée), pas de VLOOKUP à maintenir | l. 54-58 (AlertBox) |
| 4. Installation | Script `generate_fake_data.py` pour reproduire l'exemple localement | l. 61-91 |
| 5. Plus de démos | `merge.py` en détail, ligne par ligne | l. 97-107 |
| 6. Sous le capot (optionnel) | Pourquoi `outer` plutôt que `inner`/`left`, gestion des colonnes suffixées par année | nouveau, à extraire du code existant |
| 7. Landing | Conclusion existante | l. 119-129 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
