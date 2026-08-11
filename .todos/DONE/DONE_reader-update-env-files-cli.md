# Reader review : update-env-files-cli

**Détecté :** 2026-08-11
**Article :** blog/2024/01/26/update-env-files-cli/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **54 %** (preuve ligne 93 — `<Terminal source="./files/terminal-1.txt" />`,
la sortie `UPDATED` / `ADDED` — sur un corps de 116 lignes, `<!-- truncate -->` en ligne 30).

Attention au faux positif : le `<Terminal>` de la ligne 56 (`./files/terminal-2.txt`) n'est
**pas** une preuve, c'est du décor — sept `echo` qui fabriquent un `.env` de test, aucune
sortie.

Drapeaux :

- **abstraction-avant-preuve** : la fonction `updateEnv` complète (l. 60-90, 31 lignes de Bash
  avec un `grep -E -q … && sed -i -r … || sed -i -e …` sur trois lignes) est donnée avant que
  le lecteur ait vu une seule ligne de résultat.

Redondance : 🟢. Rien à couper — la seconde version de la fonction (l. 105-138) diffère
réellement de la première (argument `add`, branche `SKIP`).

Pas de `## Conclusion` : l'article s'arrête l. 146 sur le `<Terminal>` des deux `SKIP`.

Test des 30 secondes : **j'abandonne** — on m'explique en quatre paragraphes ce que la fonction
va faire (« elle recevra trois arguments », « elle utilisera `grep` et `sed` », « puis `printf`
affichera »), on me fait créer un fichier d'exemple, puis on me colle 31 lignes de Bash. À
aucun moment je n'ai vu ce que ça donne à l'écran.

## Risque

Le lecteur d'une minute rate la seule chose qui rend cet article convaincant, et **elle existe
déjà** : la sortie colorée de `terminal-1.txt`, où quatre variables sont marquées `UPDATED` et
une seule `ADDED`. C'est cette colonne de statuts qui répond à la vraie question du lecteur
(« comment je sais que rien n'a été oublié sur ce serveur ? »).

Il rate aussi l'appel type `updateEnv "APP_DEBUG" "false" ".env"` (l. 52), enterré dans le
paragraphe d'explication : c'est la ligne qu'un lecteur pressé copierait.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | `.env` par serveur, `cp .env.example .env`, « c'est là que la minutie commence » | l. 24-30 (inchangé) |
| 2. `## What `updateEnv` Does For You` | Les cinq appels `updateEnv "APP_DEBUG" "false" "${dotEnv}"` … puis la sortie `UPDATED` / `ADDED`, puis « quatre variables mises à jour, une ajoutée » | l. 52 + l. 80-86 (les seuls appels, sans la définition) + l. 93 + l. 95 |
| 3. `## Why It Works` | 3 puces sans code : `grep` décide, `sed` met à jour ou ajoute, `printf` rend le résultat lisible | reformulé depuis l. 44-50 |
| 4. `## The Function` | Le `.env` d'exemple puis la définition complète | l. 54-56 puis l. 58-90 |
| 5. `## Adding a Skip Boolean` | Le 4ᵉ argument + la sortie `SKIP` | l. 97-146 (inchangé) |
| 6. `## Conclusion` | À écrire : ce qu'on retient (une fonction copiable, statut affiché pour chaque variable), et le lien de sortie vers `compare-env-files-cli` pour vérifier ce qui manque encore | nouveau — l'article n'a pas de landing |

Détails à traiter pendant le déplacement :

- Le mouvement 2 ne doit contenir **que** le bloc d'appels (l. 80-86) et la sortie : extraire
  ces sept lignes du grand bloc `bash` l. 58-90, et laisser la définition complète en
  mouvement 4. Le sous-shell `( … )` se scinde proprement.
- Les trois liens internes inline (l. 40, l. 46) restent dans le hook et le mouvement 4 —
  vérifier avec `yarn links:check blog/2024/01/26/update-env-files-cli/index.md` après coup.

Cible : time to value < 15 % (preuve avant la ligne 47). Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
