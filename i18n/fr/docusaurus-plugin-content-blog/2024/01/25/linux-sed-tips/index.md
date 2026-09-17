---
slug: linux-sed-tips
title: Rechercher et remplacer (ou ajouter) avec sed
date: 2024-01-25
description: Maîtrisez sed sous Linux pour éditer vos fichiers dynamiquement. Apprenez à remplacer une variable existante ou à ajouter simplement une nouvelle ligne si la variable est absente de votre fichier de configuration.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
![Rechercher et remplacer (ou ajouter) avec sed](/img/v2/bash.webp)

<TLDR>
Cet article explique comment utiliser `sed` pour mettre à jour une variable dans un fichier de config ou un `.env` quand elle existe déjà, et comment le combiner avec `grep -q` pour l'ajouter quand elle est absente — un seul pattern fiable « rechercher et remplacer, ou insérer » pour éditer des fichiers depuis un script.
</TLDR>

Aujourd'hui, j'ai rencontré (encore une fois) le besoin suivant : je dois mettre à jour un paramètre dans un fichier texte mais si la variable n'est pas encore présente, je dois l'ajouter.

Bref, je dois faire un *rechercher et remplacer ou insérer une nouvelle ligne*.

Avec `sed`, automatiser le rechercher/remplacer est assez simple, mais comment ajouter une ligne ?

<!-- truncate -->

## Le one-liner {#the-one-liner}

Le voici — mettre à jour `APP_ENV` si la clé existe, l'ajouter sinon :

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ grep -q "^APP_ENV =" .env \
    && sed -i "s/APP_ENV =.*/APP_ENV = production/" .env \
    || sed -i -e '$aAPP_ENV = production' .env
</Terminal>

Le fichier `.env` ne contenait que `APP_NAME`, donc la clé a été ajoutée. Relisons le fichier :

<Terminal typewriter>
$ cat .env

APP_NAME = My application
APP_ENV = production
</Terminal>

Relancez exactement le même bloc — ou lancez-le sur un fichier où `APP_ENV` existe déjà — et la ligne est remplacée au lieu d'être dupliquée. C'est tout l'intérêt : la commande est idempotente, vous pouvez l'utiliser dans un script de déploiement sans rien vérifier au préalable.

## Pourquoi ça marche {#why-it-works}

- **`grep -q` teste sans rien afficher.** `-q` signifie quiet : aucune sortie, seulement un code de retour, exactement ce dont une condition a besoin.
- **`&&` est la branche « trouvé ».** La clé existe → on remplace la valeur sur place.
- **`||` est la branche « absent ».** La clé n'existe pas → on ajoute une nouvelle ligne à la fin du fichier.

Vous trouverez plein d'autres solutions sur Internet, certaines n'utilisant que l'instruction `sed`, mais... arrivez-vous à les lire ? Je préfère cette approche, peut-être pas la plus *native*, mais au moins je peux la relire.

La suite de cet article construit la commande morceau par morceau, si vous voulez comprendre chaque moitié avant de l'utiliser.

## Rechercher et remplacer {#search-and-replace}

Imaginez un fichier `.env` avec une seule ligne (<Link to="/blog/bash-load-env">que votre script Bash peut ensuite charger comme de vraies variables d'environnement</Link>), par exemple :

<Terminal typewriter>
$ echo 'APP_ENV = local' > .env
</Terminal>

Je peux mettre à jour `APP_ENV` par exemple avec :

<Terminal typewriter>
$ sed -i "s/APP_ENV =.*/APP_ENV = production/" .env
</Terminal>

Facile, non ? Le `s` de la commande signifie `substitute` (remplacer) et le délimiteur utilisé est `/`. `sed` va donc chercher `APP_ENV =.*` et, si trouvé, remplacer par `APP_ENV = production`. Le flag `-i` indique que le nouveau contenu (après remplacement) doit être réécrit dans le fichier.

## Ne pas remplacer mais ajouter si absent {#dont-replace-but-add-if-not-found}

Mais que se passe-t-il si `APP_ENV` n'est pas du tout présent dans le fichier ?

Évidemment, en lançant `sed -i "s/APP_ENV =.*/APP_ENV = production/" .env` il ne se passera rien (vous pouvez le vérifier avec `cat .env`).

Avant de voir comment faire, lancez le bloc suivant et vous obtiendrez un message `NOT FOUND`.

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env

$ grep -q "^APP_ENV =" .env && echo "FOUND" || echo "NOT FOUND"

</Terminal>

Donc si `grep -q` réussit (on a bien trouvé `APP_ENV` dans le fichier) alors on continue (`&&`) et on affiche `FOUND`, sinon (`||`) on affiche `NOT FOUND`.

`&&` signifie que la commande précédente a réussi (c'est-à-dire que `grep` a trouvé la ligne) et `||` signifie qu'elle a échoué (rien trouvé).

L'exemple suivant affichera donc `FOUND`.

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ echo 'APP_ENV = local' >> .env
$ grep -q "^APP_ENV =" .env && echo "FOUND" || echo "NOT FOUND"
</Terminal>

La commande pour *insérer une nouvelle ligne* est celle-ci : `sed -i -e '$aAPP_ENV = production' .env`. L'argument `-e` permet d'exécuter un script et c'est assez étrange, mais le script c'est `$a`. Cette commande sert à *ajouter une ligne*. Vous avez donc compris que sed va ici ajouter une nouvelle ligne dans le fichier.

## Combiner les deux {#combine-both}

Ok, commençons par brancher l'instruction de remplacement sur la branche `&&` :

<Terminal typewriter source="./files/terminal-1.txt" />

`APP_ENV` était présent, il a donc été remplacé : lancer `cat .env` donne bien, comme prévu, `APP_ENV = production`.

Et le bloc suivant affichera toujours `NOT FOUND`, parce que cette fois la clé est absente :

<Terminal typewriter>
$ echo 'APP_NAME = My application' > .env
$ grep -q "^APP_ENV =" .env \
    && sed -i "s/APP_ENV =.*/APP_ENV = production/" .env \
    || echo "NOT FOUND"
</Terminal>

Remplacez ce `echo "NOT FOUND"` par la commande d'*ajout* vue plus haut et vous obtenez le one-liner présenté en début d'article. Les deux moitiés sont maintenant en place.

## Conclusion {#conclusion}

`grep -q` pour le test, `&&` pour remplacer, `||` pour ajouter : trois morceaux que vous pouvez lire à voix haute, dans une seule commande qui se comporte pareil que la clé soit déjà là ou non. C'est le genre de ligne qu'on finit par coller dans tous ses scripts de déploiement.

Ce pattern est la brique de base de <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link>, où la même logique devient une fonction réutilisable qui signale `UPDATED` ou `ADDED` pour chaque clé traitée.
