# Reader review : joomla-db-kill-tables-prefix

**Détecté :** 2026-08-09
**Article :** blog/2024/02/28/joomla-db-kill-tables-prefix/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **61 %** (capture `kill_tables.webp` l. 37 sur un corps de 13 lignes).
Drapeaux : liste de 5 étapes (télécharger, uploader en FTP, ouvrir dans le navigateur, cliquer,
supprimer le script) juste après le `truncate`, avant toute preuve — équivalent d'un
install-avant-preuve.

Test des 30 secondes : sur un article aussi court, demander de suivre 5 étapes avant de montrer
à quoi ressemble l'outil est disproportionné — le lecteur ne sait pas encore si l'interface vaut
le détour.

## Risque

La capture `kill_tables.webp` montre l'écran complet de l'utilitaire (champ de saisie du
préfixe, liste des tables trouvées, bouton de suppression) — c'est la preuve la plus parlante de
l'article, actuellement en dernière position avant les deux avertissements de sécurité.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture de l'écran de l'utilitaire (`kill_tables.webp`) | l. 37 |
| 2 | Comment l'utiliser : les 5 étapes (télécharger, uploader, ouvrir, cliquer, supprimer le script) | l. 31-35 |
| 3 | Avertissements sécurité (backup + suppression obligatoire du script) | l. 39-41 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
