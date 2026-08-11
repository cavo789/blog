# Reader review : linux-sed-tips

**Détecté :** 2026-08-11
**Article :** blog/2024/01/25/linux-sed-tips/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **94 %** (preuve ligne 111 — le `<Terminal>` qui affiche enfin le contenu du
fichier, `APP_NAME = My application` / `APP_ENV = production` — sur un corps de 88 lignes,
`<!-- truncate -->` en ligne 28).

Aucun des six `<Terminal>` précédents (l. 40, 46, 60, 73, 83, 89, 102) ne montre de sortie :
ce sont des commandes seules. La prose annonce le résultat (« you'll get a `NOT FOUND`
message », l. 58 ; « By running `cat .env`, you will get, as expected », l. 85) sans jamais
l'afficher.

Drapeaux : aucun (pas d'installation, pas de `<Snippet>` d'implémentation).

Redondance : 🟠. `echo 'APP_NAME = My application' > .env` apparaît **4 fois** (l. 61, 70,
90, 103) et le `grep -q "^APP_ENV =" .env && sed -i …` **3 fois** (l. 91-93, 104-106, plus la
variante l. 62). C'est inhérent à la construction incrémentale — mais cette construction est
justement ce que la restructuration remet à sa place.

Pas de `## Conclusion` : l'article s'arrête l. 116 sur le `<Terminal>` du `cat .env`.

Test des 30 secondes : **j'abandonne** — le titre promet « search and replace (or add) using
sed », mais après le truncate on me fait remonter tout le raisonnement : d'abord `sed` seul,
puis `grep -q` seul, puis les deux combinés à moitié, et la commande que je suis venu chercher
n'arrive qu'en ligne 102, à 84 % de l'article.

## Risque

C'est l'anti-pattern « la démo cachée à 70 % » à l'état pur : la section s'appelle littéralement
`## The final instruction`, elle contient la seule chose copiable de l'article, et elle est la
dernière. Le lecteur d'une minute — celui qui arrive par une recherche « sed replace or append »
— rate exactement les 15 lignes qu'il cherchait, alors que **tout est déjà écrit** :

- le one-liner `grep -q … && sed -i "s/…/…/" … || sed -i -e '$a…'` (l. 102-109) ;
- sa vérification `cat .env` avec les deux lignes de sortie (l. 111-116) — la seule preuve
  littérale de l'article.

Ce qui reste (les trois sections de construction) est de la bonne pédagogie, mais c'est du
« pourquoi ça marche », pas du « voilà ce que ça fait ».

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | « Je dois mettre à jour un réglage, et l'ajouter s'il n'existe pas » + la question « comment faire un append avec `sed` ? » | l. 22-28 (inchangé) |
| 2. `## The One-Liner` | Le `grep -q … && sed -i … \|\| sed -i -e '$a…'` complet, puis le `cat .env` qui montre les deux lignes du fichier | l. 102-109 + l. 111-116 |
| 3. `## Why It Works` | 3 puces sans code : `grep -q` teste sans rien afficher, `&&` = trouvé donc on substitue, `\|\|` = absent donc on ajoute | reformulé depuis l. 68-70 et l. 96 |
| 4. `## Search and Replace` | `sed -i "s/APP_ENV =.*/…/"`, le rôle de `s`, du délimiteur et de `-i` | l. 36-50 |
| 5. `## Don't Replace but Add if Not Found` | `grep -q` seul, les cas `FOUND` / `NOT FOUND`, puis `sed -i -e '$a…'` | l. 52-77 + l. 96 |
| 6. `## Combine Both` | L'assemblage progressif des deux moitiés | l. 79-94 |
| 7. `## Conclusion` | À écrire : ce qu'on retient, et le lien de sortie vers `update-env-files-cli` (déjà cité en l. 32) où ce motif devient une fonction réutilisable | nouveau — l'article n'a pas de landing |

Détails à traiter pendant le déplacement :

- Une fois le one-liner remonté, la section `## The final instruction` (l. 98-116) disparaît :
  son contenu est intégralement consommé par les mouvements 2 et 6. Ne pas laisser un titre
  vide derrière.
- Les `<Terminal>` des mouvements 4 à 6 gagneraient à afficher leur sortie plutôt qu'à
  l'annoncer en prose (l. 58, l. 85). Chantier optionnel, mais c'est ce qui ferait passer
  l'article de « je te raconte » à « je te montre ».
- Le lien interne inline vers `update-env-files-cli` (l. 32) reste dans le hook ; vérifier avec
  `yarn links:check blog/2024/01/25/linux-sed-tips/index.md`.

Cible : time to value < 15 % (preuve avant la ligne 42). Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
