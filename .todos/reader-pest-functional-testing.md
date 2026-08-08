# Reader review : pest-functional-testing

**Détecté :** 2026-08-08
**Article :** blog/2025/08/30/pest-functional-testing/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **≈67 %** (premier terminal montrant une exécution réelle l. 112, sur un corps
de 114 lignes ; le screenshot de l'échec du test, l. 123, arrive encore plus tard).
Drapeaux : install-avant-preuve (`sudo apt-get -y install make`, l. 83, avant toute preuve) et
abstraction-avant-preuve (`Dockerfile`, `makefile`, `HomepageTest.php` en `<Snippet>`, l. 52-62,
avant toute preuve).

Test des 30 secondes : le lecteur doit créer un dossier, un `Dockerfile`, un `makefile`, un
fichier de test, construire une image de ~2 Go, puis lancer un container avant de voir le
moindre résultat de test. Le TLDR promet "screenshots on failure" et "results" mais rien de ça
n'apparaît avant la ligne 112.

## Risque

Le vrai argument de vente de Pest v4 (tests fonctionnels + capture d'écran automatique en cas
d'échec) est déjà entièrement illustré dans l'article (l. 112-139 : succès et échec, captures
incluses) — il est juste enterré après toute la phase d'installation Docker.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 28-38 |
| 2 | **Déplacé devant** : "Congratulations, we've just tested 10 features..." + capture `success.webp`, et la capture de l'échec `it_can_search_for_a_post.webp` avec le screenshot automatique | l. 123-139 |
| 3 | Let's create a temporary project (inchangé) | l. 40-72 |
| 4 | Create the image (inchangé, avec l'`<AlertBox>` `make` déplacée en `<Prerequisite>` optionnel) | l. 74-93 |
| 5 | Create the container (inchangé) | l. 95-104 |
| 6 | Run tests, avec le détail du fix du sélecteur (inchangé) | l. 106-139 |
| 7 | In-depth (marquer le titre "skip this if you just want to use it") | l. 141-150 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
