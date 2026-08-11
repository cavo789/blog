# Reader review : install-docker

**Détecté :** 2026-08-11
**Article :** blog/2023/11/03/install-docker/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **34 %** (capture `php_container_is_running.webp` l. 80 sur un corps de
145 lignes) — et cette capture ne montre que Docker Desktop listant une image présente. La vraie
preuve, un `phpinfo()` servi dans le navigateur par un conteneur (`phpinfo_7_4_29.webp`), est en
**l. 126**, soit **66 %**.

Drapeaux : **théorie-avant-preuve** — 41 lignes s'écoulent entre le `<!-- truncate -->` (l. 30)
et la première commande exécutable (l. 71) : une section `## Why Docker images` de 149 mots sur
Docker Hub et la gratuité des images, puis quatre `<AlertBox>` consécutives (l. 48-68) qui
préparent le terrain sans rien montrer.

Redondance : 🟠 — « pas besoin d'installer PHP/Apache » énoncé **4 fois** (TLDR l. 21, l. 34,
l. 46 « Not to install sounds crazy but yes », l. 155 « No headaches and zero conflicts! », plus
l. 175 « This same *zero local install* approach »).

Poids des sections : `Why Docker images` 149 mots · `Real use case: PHP and Apache` 867 mots.

Test des 30 secondes : **j'abandonne** — l'article s'appelle « Install Docker and play with
PHP », et pendant les 40 premières lignes du corps on m'explique ce qu'est Docker Hub et que les
images sont gratuites. Rien à taper, rien à voir.

## Risque

Le lecteur d'une minute est un débutant Docker : c'est l'article d'entrée de la série. Il repart
avant d'avoir vu la seule chose qui convainc — une page PHP qui tourne sans avoir installé PHP.
Cette capture existe déjà (l. 126), tout comme la démonstration la plus spectaculaire de
l'article : passer de PHP 8.3 à PHP 8.4 en changeant un tag d'image (l. 128-153).

La `<StepsCard variant="remember">` finale (l. 162-173) est correcte et fait office de landing —
elle n'est pas à jeter, seulement à conserver en place.

**Note factuelle à corriger au passage** (indépendante de la structure) : l. 135 affirme encore
« This shows that we are targeting PHP version 7.4.29 » alors que la commande juste au-dessus
utilise `php:8.3-apache` ; les deux captures s'appellent toujours `phpinfo_7_4_29.webp` et
`phpinfo_8_1_5.webp` avec des alt-texts « PHP 8.3 » / « PHP 8.4 ». Reliquat d'une mise à jour de
version antérieure.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | inchangé, jusqu'au `<!-- truncate -->` | l. 1-30 |
| 2. Le résultat | `## One Command, a Working PHP Server` : la commande `docker run --detach --name step_1_1a -p 80:80 php:8.3-apache`, puis directement la capture du `phpinfo()` dans le navigateur | l. 71-73 + l. 126 |
| 3. Pourquoi ça marche | `## Why Docker images` réduit à 3 puces sans code : images plug-and-play, Docker Hub, rien à installer localement | l. 32-42 |
| 4. Installation | Docker Desktop sur Windows, puis l'explication des flags `--detach` / `--name` / `-p` / le tag d'image | l. 28 + l. 85-90 |
| 5. Plus de démos | changer de version PHP : `php:8.4-apache` sur le port 801, avec sa capture — la démonstration la plus convaincante de l'article | l. 128-155 |
| 6. Sous le capot *(à sauter si vous voulez juste l'utiliser)* | comment le fichier `index.php` a été créé dans le conteneur (`docker exec`, `echo`), la page *Forbidden* avant qu'il existe, et la note sur les numéros de port différents à chaque étape | l. 57-60 + l. 99-124 |
| 7. Conclusion | la `<StepsCard variant="remember">` + le paragraphe de liens vers les autres langages | l. 162-175 |

Au passage : supprimer deux des quatre formulations « pas besoin d'installer » (garder celle du
mouvement 2 et celle de la Conclusion) et fusionner les quatre `<AlertBox>` de l. 48-68 — deux
d'entre elles (numéros de port, « les commandes sont les mêmes sur Linux/Mac/Windows ») sont des
notes de mise en place qui appartiennent au mouvement 4.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
