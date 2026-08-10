# Reader review : drawdb-app

**Détecté :** 2026-08-09
**Article :** blog/2024/11/11/drawdb-app/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **11 %** (preuve l. 45 — le diagramme rendu — sur un corps de 145 lignes après
le truncate en l. 29). La preuve elle-même arrive tôt et n'est pas en cause.
Drapeaux : aucun sur la preuve. En revanche l'article échoue le critère "Landing" du Pass 1 :
il n'a **pas de section Conclusion** et se termine brutalement sur un titre vide
(`### Database Diagram`, l. 174) sans image ni texte après.
Redondance : bloc mort massif — le contenu auto-généré par drawDB (l. 67-174, soit 111 lignes
sur 145, ~77 % du corps) empile sept tableaux de schéma bruts sans commentaire éditorial, à la
suite d'un simple avertissement "Auto-generated content" (l. 63-65) qui ne dit pas "optionnel"
ni "vous pouvez sauter cette partie".

Test des 30 secondes : le lecteur qui arrive garde la lecture — la preuve (le diagramme importé)
est visible dès 11 %. Le problème se révèle seulement pour qui va au bout : l'article s'arrête
en pleine section, sans retour sur la promesse d'ouverture ni pointeur vers la suite.

## Risque

Un lecteur qui scrolle jusqu'au bout ne trouve ni résumé ni prochaine étape — juste un titre de
section sans contenu. Le dump auto-généré, non marqué comme "à sauter", dilue par ailleurs le
ratio signal/bruit de la deuxième moitié de l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Import du `.sql` + diagramme obtenu (déjà bien placé) | l. 29-47 |
| 2 | Auto-hébergement via Docker | l. 49-53 |
| 3 | Fonctionnalité d'export (PNG/JSON/Mermaid/Markdown) | l. 55-61 |
| 4 | Exemple de sortie Markdown auto-générée, sous un titre **"Under the Hood (skip this if you just want to use it)"**, condensé à 1-2 tables représentatives au lieu des sept | l. 63-172 (à réduire) |
| 5 | Nouvelle section `## Conclusion` : ce qu'on retient + lien vers un article connexe (ex. `docker-python-mermaid` ou `docker-diagram-as-code`, déjà cités l. 61) | à écrire |

Cible : time to value < 15 % (déjà atteint) ; l'enjeu ici est la clôture de l'article, pas
l'ouverture. Structure de référence : `.claude/skills/blog-post-structure/SKILL.md`.
