# Reader review : python-fastapi

**Détecté :** 2026-08-09
**Article :** blog/2025/02/09/python-fastapi/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **21 %** (preuve ligne 77 sur un corps de 198 lignes, l.35-233).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="Dockerfile">` l.49 et
`<Snippet filename="main.py">` l.55, tous deux avant la capture `BrowserWindow` "Hello World"
l.77-83).
Redondance : aucune notable.

Test des 30 secondes : le lecteur est prévenu dès le TLDR/l'intro ("one minute ... copy/paste
two files ... run one Docker statement", l.25-27) donc il n'est pas pris au dépourvu — mais la
preuve visuelle (le JSON "Hello World" dans le navigateur) tombe juste après la fenêtre des 40
lignes, ce qui la rend structurellement tardive même si le contenu affiché avant elle est court.

## Risque

Rien de grave, mais l'ordre actuel oblige à lire deux fichiers complets (Dockerfile + main.py)
avant de voir le résultat tourner. Montrer d'abord le résultat, puis expliquer les deux fichiers
comme étape d'installation, respecterait mieux le mouvement 2 de la structure cible.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Le résultat | Capture `BrowserWindow` "Hello World" | l. 75-83 |
| 2. Pourquoi ça marche | 2-3 puces sans code : FastAPI expose la route définie dans `main.py`, Docker embarque tout l'environnement Python | nouveau, distillé des l. 39-57 |
| 3. Installation | `mkdir`, création du `Dockerfile`, création de `main.py`, build & run | l. 37-73 |
| 4. Autres démos | Documentation auto Swagger/ReDoc (l. 85-107), générateur de blagues + hot reload (l. 109-226) | l. 85-226 |
| 5. Sous le capot (marquer le titre "optionnel") | Le mécanisme de cache d'Uvicorn et pourquoi le hot reload est nécessaire | l. 117-160 |
| 6. Conclusion | Section existante, déjà correcte | l. 227-233 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
