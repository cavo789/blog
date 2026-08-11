# Reader review : linux-xmlstarlet

**Détecté :** 2026-08-11
**Article :** blog/2023/12/13/linux-xmlstarlet/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **48 %** (la preuve — le XML formaté, l. 46 — arrive après 20 lignes sur un
corps de 42, truncate l. 26).

Drapeaux : **install-avant-preuve** — première ligne du corps (l. 28) :
`sudo apt-get update && sudo apt-get -y install xmlstarlet`. Même gabarit que son article
jumeau <Link to="/blog/linux-jq">linux-jq</Link>, même défaut.

Redondance : le XML source est réaffiché **4 fois** sous le même nom de fichier
`data.xml` — l. 36 (minifié), l. 46 (formaté), l. 54 (pour expliquer XPath), l. 66 (pour
expliquer le filtre). Les l. 54 et 66 remontrent une structure que le lecteur a déjà sous
les yeux depuis la l. 46. 🟠

Détail trompeur : les `<Snippet filename="data.xml">` des l. 46, 54 et 66 ne sont pas le
fichier `data.xml` — ce sont des **sorties**. Le nom de fichier affiché ment.

Test des 30 secondes : **je reste, mais l'article me fait travailler avant de me payer** —
`apt-get install`, puis `mkdir`, puis créer un fichier, et seulement là je vois à quoi sert
l'outil.

## Risque

Le lecteur d'une minute ne voit jamais l'argument massue de l'article : le filtre XPath
`//book[@category='children']/title` qui renvoie `Harry Potter` (l. 58-62). C'est ça qui
donne envie d'installer `xmlstarlet` — pas le `format --indent-spaces 4`, que n'importe quel
éditeur fait aussi.

Toute la matière existe et est bonne : jeu de données court, trois commandes, trois sorties
réelles. Seul l'ordre pénalise.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse + la phrase « c'est à XML ce que `jq` est à JSON » (excellent hameçon, à garder), `<!-- truncate -->` | l. 22-26 (inchangé) |
| 2 | **Le résultat** : le XML minifié, puis `xmlstarlet sel -t -v "//book[@category='children']/title"` → `Harry Potter`. Une commande, une réponse d'un mot | l. 36 + l. 58-62 |
| 3 | Le formatage — le deuxième usage : `xmlstarlet format --indent-spaces 4` et sa sortie | l. 40-46 |
| 4 | Installation, repliée dans un `<AlertBox variant="tip">` ou un `<Prerequisite name="xmlstarlet" …/>` | l. 28 |
| 5 | `## Let's play` — le pas-à-pas reproductible : `mkdir -p /tmp/xmlstarlet`, créer `data.xml` | l. 30-36 |
| 6 | Comprendre XPath : la structure `bookstore / book / title`, l'expression `/bookstore/book/title` et sa sortie, puis l'explication du filtre par attribut | l. 48-52 + l. 64 |
| 7 | Conclusion + doc officielle + renvoi vers `linux-jq` | l. 68 + l. 22 |

Fusionner les rappels de structure des l. 54 et 66 en **un seul** bloc au mouvement 6 : le
lecteur n'a besoin de voir l'arbre `bookstore` qu'une fois.

Renommer les `<Snippet filename="data.xml">` de sortie : soit passer par `<Terminal>` (c'est
une sortie de commande), soit retirer le `filename` trompeur.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
