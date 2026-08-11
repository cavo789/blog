# Reader review : compare-env-files-cli

**Détecté :** 2026-08-11
**Article :** blog/2024/01/26/compare-env-files-cli/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **44 %** (preuve ligne 70 — le bloc ```` ```diff ```` montrant
`> CACHE_DRIVER = redis` — sur un corps de 75 lignes, `<!-- truncate -->` en ligne 37).

Faux positif à ne pas compter : le `<Terminal source="./files/terminal-1.txt" />` de la ligne
47 n'est pas une preuve, c'est du décor — huit `echo`/`cp`/`sort` qui fabriquent les deux
`.env` de test, aucune sortie.

Drapeaux : aucun (pas d'installation demandée, pas de `<Snippet>` d'implémentation avant la
preuve — la commande `diff` de la l. 51-62 *est* le livrable, pas une abstraction).

Redondance : 🟢. Les trois blocs `diff` (l. 70, l. 83, l. 100) montrent trois cas différents,
chacun ajoute une colonne de lecture. Rien à couper.

Pas de `## Conclusion` : l'article s'arrête l. 112 sur la dernière puce de « How to read ».

Test des 30 secondes : **je reste, mais de justesse** — le titre et le `<TLDR>` disent déjà
tout, et l'`AlertBox variant="danger"` avant le truncate pose bien le problème. Ce qui coince,
c'est qu'après le truncate on m'explique pendant trois paragraphes *pourquoi `diff` seul ne
suffit pas*, puis on me fait construire un jeu d'essai, avant de me montrer la commande — et
son résultat arrive encore 19 lignes plus loin.

## Risque

L'article n'a qu'une seule chose à vendre — la sortie deux colonnes du `diff` — et elle arrive
après 33 lignes. Le lecteur d'une minute rate :

- le bloc `diff` de la l. 70-73 : la preuve que la commande ignore bien commentaires, ordre et
  `APP_KEY` ;
- les quatre puces « How to read » (l. 107-112), qui sont ce qu'un lecteur revient chercher :
  gauche = premier fichier, droite = second, `|` = valeurs divergentes.

Les deux existent, ils sont juste aux deux extrémités de l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | La feature buggée, l'`AlertBox variant="danger"`, « personne n'y pense » | l. 22-35 (inchangé) |
| 2. `## The One-Liner and Its Output` | La commande `diff --suppress-common-lines -y` complète, sa sortie deux colonnes, puis les puces de lecture (gauche / droite / `\|`) | l. 51-62 + l. 70-73 + l. 107-112 |
| 3. `## Why Plain `diff` Isn't Enough` | Les trois raisons : commentaires, ordre, variables volontairement différentes | l. 39-45 |
| 4. `## Reproduce It` | Le `<Terminal>` qui fabrique `.env` et `.env.example`, puis l'explication des flags `-y` / `--suppress-common-lines` | l. 47 + l. 64-68 |
| 5. `## More Cases` | Clé ajoutée seulement dans `.env`, puis valeurs divergentes des deux côtés | l. 75-105 |
| 6. `## Conclusion` | À écrire : ce qu'on retient, et le lien de sortie vers `update-env-files-cli` pour corriger ce que le `diff` a révélé | nouveau — l'article n'a pas de landing |

Détails à traiter pendant le déplacement :

- Le bloc `diff` de la l. 70 suppose le jeu d'essai construit en l. 47. Une fois remonté en
  mouvement 2, il lui faut une phrase d'amorce du type « sur deux `.env` qui divergent d'une
  seule clé, voici ce que ça donne » — et le mouvement 4 reprend le jeu d'essai pour ceux qui
  veulent rejouer.
- Les puces « How to read » remontées en mouvement 2 décrivent trois marqueurs (`<`, `>`, `|`)
  alors que le premier bloc n'en montre qu'un (`>`). Soit remonter aussi le troisième exemple
  (l. 100-105) en mouvement 2, soit alléger les puces à ce stade et garder la version complète
  en mouvement 5 — à trancher à l'implémentation.
- Les trois liens internes inline (l. 35, l. 39) restent en place ; vérifier avec
  `yarn links:check blog/2024/01/26/compare-env-files-cli/index.md`.

Cible : time to value < 15 % (preuve avant la ligne 48). Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
