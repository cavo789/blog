# Reader review : python-qa

**Détecté :** 2026-08-09
**Article :** blog/2024/12/30/python-qa/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** — aucune preuve (sortie de commande, capture, avant/après) n'existe
nulle part dans le corps (159 lignes). Seule la description textuelle du message
**CONGRATULATIONS** (l. 191) laisse deviner qu'un `make qa` produit un résultat concret, mais
rien ne le montre.
Drapeaux : aucun install-avant-preuve, mais l'article est un catalogue de 9 outils avec
config chacun sans jamais illustrer le résultat combiné qui en est pourtant le vrai
argument (section « Running them all at once », l. 182, la seule qui prouve que l'assemblage
fonctionne).

Test des 30 secondes : le lecteur voit un catalogue « Pylint, puis Autoflake, puis isort… »
avec, pour chacun, une citation de doc et un fichier de config — utile en référence, mais rien
ne prouve au lecteur pressé que la chaîne complète (`make qa`) fonctionne et vaut la mise en
place. Contrairement à des listicles pures de ce blog (`quarto-extensions`,
`claude-ia-spare-tokens`, classés MINOR car sans démo possible), ici une démo existe déjà en
germe (`makefile` l. 190) mais est enterrée en fin d'article.

## Risque

La section « Running them all at once » (l. 182-194) explique la logique d'enchaînement et
mentionne le message final, mais elle est la toute dernière chose de l'article — le pire cas
de l'anti-pattern « démo cachée à 70 % » : le lecteur qui abandonne avant la fin ne saura
jamais que ces 9 outils s'enchaînent en une seule commande.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Accroche inchangée (comparaison avec l'outillage PHP) | l. 19-24 |
| 2. Le résultat | `make qa` : capture ou transcript terminal montrant les 9 étapes numérotées et le message **CONGRATULATIONS** (à produire — aucun fichier `terminal-*.txt` n'existe encore, voir `./files/makefile`) | l. 182-192 |
| 3. Pourquoi ça marche | 3-5 puces : ordre du plus rapide/fondamental au plus lent, arrêt au premier échec, un seul point d'entrée pour CI et pré-commit | l. 184-186 |
| 4. Installation | `makefile` avec la cible `qa` | l. 190 |
| 5. Plus de démos | Les 9 outils en détail (Pylint → Prospector), chacun avec sa commande et sa config | l. 39-180 |
| 6. Sous le capot (optionnel) | Section Ruff en remplacement potentiel de plusieurs outils | l. 164-180 |
| 7. Landing | Conclusion existante : pré-commit / Dagger pour automatiser | l. 192-194 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
