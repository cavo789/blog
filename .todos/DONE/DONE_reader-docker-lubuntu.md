# Reader review : docker-lubuntu

**Détecté :** 2026-08-09
**Article :** blog/2024/10/24/docker-lubuntu/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **74 %** (preuve ligne 62 sur un corps de 43 lignes, entre les lignes 30 et 73).

Drapeaux : install-avant-preuve (l'« Étape 2 - Installer Windows X Server », l. 42-54, précède
toute preuve) et abstraction-avant-preuve (le `Dockerfile` en `<Snippet>`, l. 38, est montré avant
tout résultat).

Redondance : aucune, l'article est court.

Test des 30 secondes : « j'abandonne » — le lecteur doit créer un `Dockerfile` puis installer un
serveur X sur Windows avant de savoir à quoi ressemble le résultat final (un vrai bureau Lubuntu
qui s'affiche). Rien ne prouve, avant ces deux étapes, que l'effort en vaut la peine.

## Risque

La capture d'écran du bureau Lubuntu qui tourne (l. 62, `./images/lubuntu-desktop.webp`) est
exactement la preuve qui manque en ouverture — elle existe déjà, mal placée. Le lecteur qui
n'a jamais vu ce genre de setup ne sait pas, avant la ligne 62, s'il regarde un gadget ou un
véritable environnement de travail jetable.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture du bureau Lubuntu tournant dans le conteneur | l. 62 (image) |
| 2 | Pourquoi ça marche (Docker + jetable, aucune trace sur l'hôte) | l. 22-28, reformulé sans code |
| 3 | Étape 1 - Créer le Dockerfile | l. 34-40 |
| 4 | Étape 2 - Installer le serveur X Windows | l. 42-54 |
| 5 | Étape 3 - Démarrer le conteneur | l. 56-60, 64-67 (AlertBox multi-écran) |
| 6 | Conclusion (ex. « Impressive ») | l. 69-73 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
