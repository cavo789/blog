# Reader review : docker-java

**Détecté :** 2026-08-11
**Article :** blog/2023/11/28/docker-java/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **40 %** mécanique (preuve ligne 57 sur un corps de 68 lignes,
`<!-- truncate -->` l. 30) — mais cette « preuve » n'est qu'un `ls -alh` montrant que
`Main.class` existe. La **vraie** preuve, le programme Java qui affiche `Hello, World`, est à la
ligne 66, soit **53 %**.
Drapeaux : **abstraction-avant-preuve** — `<Snippet filename="Main.java">` l. 36.
Redondance : « rien à installer, rien à configurer » énoncé **5 fois** (TLDR l. 18, l. 21, l. 23,
AlertBox l. 26, AlertBox l. 59-61) — la dernière occurrence, `And without having to install
something`, est un `<AlertBox>` entier consacré à redire ce que le TLDR annonçait déjà.

Deep-dive non signalé : l'`<AlertBox>` « Docker CLI reminder » (l. 40-51, 12 lignes) s'intercale
**entre** la commande `javac` et son résultat. Le lecteur perd le fil de l'action pour lire la
documentation de `-it`, `--rm`, `-v` et `-u`.

Pas de landing : l'article finit sur « You are ready to start your Java coding journey. Have
fun. » suivi d'une ligne de liens. Aucun récapitulatif.

Test des 30 secondes : **je reste, mais à contrecœur** — pour un article intitulé « Play with
Docker and Java », la première sortie que je vois est un listing de répertoire. Le moment où Java
dit enfin quelque chose arrive à la moitié de la page.

## Risque

Le lecteur d'une minute repart avec l'idée que l'article parle de compilation, pas d'exécution.
Or l'argument de vente — deux commandes `docker run` et un programme Java tourne sans JDK
installé — tient en six lignes qui existent déjà (l. 66-69) mais arrivent trop tard.

Le second exemple, l'appel REST qui affiche du JSON (l. 71-94), est le meilleur argument de
l'article : il montre que l'approche tient sur autre chose qu'un « Hello World ». Il est en
dernier.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | « Je ne connais rien à Java » — garder l'AlertBox `note`, c'est l'angle de l'article. Supprimer la redite l. 21 (« you do not need to install or configure anything ») : l'AlertBox le dit déjà. | AlertBox l. 25-28, l. 21-23 élaguées |
| 2. La preuve | Nouvelle section `## Two commands, and Java runs` : les deux `docker run` (compilation puis exécution) enchaînés, et le `<Terminal>` `Hello, World`. Rien n'est installé, rien n'est expliqué. | `<Terminal>` l. 66-69 + commandes l. 38 et l. 64 |
| 3. Pourquoi ça marche | Trois puces sans code : l'image `eclipse-temurin:21` embarque le JDK, le volume partage le dossier courant, `-u 1000:1000` fait que le `.class` généré vous appartient. | extrait de l'AlertBox l. 40-51 |
| 4. Le code | `## The source` — `<Snippet>` `Main.java`, puis le `ls -alh` qui prouve que `Main.class` a bien été créé. Il garde sa valeur ici : c'est la vérification, plus la preuve. | `<Snippet>` l. 36, `<Terminal>` l. 57, phrases l. 53-55 |
| 5. Démo plus solide | `## A slightly more difficult example, calling a REST API` — inchangée. Elle prouve la portée réelle et mérite de rester la dernière démo. | l. 71-94 |
| 6. Sous le capot (facultatif) | `## Under the Hood: the docker run flags (skip this if you just want to use it)` — l'AlertBox « Docker CLI reminder » convertie en section signalée, sortie du chemin critique. | AlertBox l. 40-51 |
| 7. Atterrissage | `## Conclusion` : rappel (compiler et exécuter du Java sans JDK local), lien vers les autres articles « zero local install » déjà présents. Supprimer l'AlertBox « And without having to install something » (l. 59-62), 5ᵉ occurrence du même fait. | l. 96-98 + suppression l. 59-62 |

Cible : time to value < 15 %, redondance ≤ 3. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
