# Reader review : docker-volumes

**Détecté :** 2026-08-11
**Article :** blog/2023/11/22/docker-volumes/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **8 % en surface, 38 % pour la vraie preuve**.
Le premier `<Terminal>` du corps (l. 47) est un `docker image list` qui affiche la taille de
l'image (5.61 MB) — c'est une sortie réelle, mais elle ne prouve rien du sujet de l'article.
La preuve du propos (le compteur qui survit à un `docker compose down/up` grâce au volume) est
`terminal-7.txt` en **l. 125**, soit 38 % d'un corps de 260 lignes.

Drapeaux : **abstraction-avant-preuve** — `<Snippet>` du `Dockerfile` (l. 39) et de
`counter.sh` (l. 43) avant la moindre sortie.
Redondance : 🟢 (« éphémère / on a perdu les données » 8 occurrences mais réparties sur les
trois cas d'usage, chacune sur un cas différent — pas de dead weight).

Poids des sections : `Creation of our Docker image` 111 mots · `Using our image` 197 mots ·
`Introducing the notion of volume` 1039 mots · `Conclusion` 169 mots.

Test des 30 secondes : **j'abandonne** — on me demande de créer un dossier, d'écrire un
`Dockerfile`, d'écrire un script shell et de builder une image avant de m'avoir montré quoi que
ce soit sur les volumes, qui sont pourtant le titre de l'article.

## Risque

Le lecteur d'une minute vient pour comprendre **quand utiliser quel type de volume**. Il tombe
sur un tutoriel de construction d'image de démonstration. Le moment le plus fort de l'article —
la paire avant/après « compteur remis à 1 » (l. 86-97) puis « compteur conservé » (l. 115-127) —
existe déjà, entièrement écrite, mais elle arrive après 90 lignes de mise en place.

De même, la `<StepsCard>` de la Conclusion (l. 271-279) énonce les trois stratégies en trois
lignes limpides : c'est le meilleur résumé de l'article, et il est en dernière position.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | inchangé, jusqu'au `<!-- truncate -->` | l. 1-31 |
| 2. Le résultat | la paire avant/après : compteur remis à 1 après un `down/up` (AlertBox « We've lost our data »), puis le même compteur conservé une fois le volume déclaré | l. 86-97 + l. 115-127 |
| 3. Pourquoi ça marche | les trois stratégies en 3 puces, sans code : pas de volume / volume géré par Docker / bind mount | `<StepsCard>` de la Conclusion l. 271-279 + AlertBox l. 94-97 |
| 4. Installation | le `Dockerfile`, `counter.sh`, `compose.yaml` et le build — `<Snippet defaultOpen={false} />` | l. 33-75 |
| 5. Plus de démos | volumes gérés par Docker (compose.volumes.yaml, terminal-7) puis volumes montés (compose.mounted_volumes.yaml, terminal-5 à 1) | l. 103-143 + l. 217-243 |
| 6. Sous le capot *(à sauter si vous voulez juste l'utiliser)* | où Docker range les volumes gérés, captures Docker Desktop, accès VSCode au conteneur, le problème `root` et le `1000:1000` | l. 145-215 + l. 245-267 |
| 7. Conclusion | inchangée, moins la `<StepsCard>` remontée en 3 | l. 269-287 |

Titrer explicitement la section 6 comme optionnelle (`## Under the Hood (skip this if you just
want to use it)`) : ses 1039 mots sont légitimes, mais rien ne signale aujourd'hui au lecteur
qu'il a déjà obtenu ce pour quoi il est venu.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
