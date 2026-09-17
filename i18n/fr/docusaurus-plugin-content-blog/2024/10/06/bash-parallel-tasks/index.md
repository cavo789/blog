---
slug: bash-parallel-task
title: Linux - Tirez parti du nombre de CPU dont vous disposez ; lancez des jobs concurrents
date: 2024-10-06
description: Optimisez vos scripts Bash ! Apprenez à lancer des jobs concurrents et à exploiter tous vos cœurs CPU avec les identifiants de processus (pids), wait et nproc pour réduire drastiquement le temps d'exécution.
authors: [christophe]
image: /img/v2/linux_parallel.webp
series: Writing better Bash scripts
mainTag: bash
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3m2szdit6sc2y
---
<!-- cspell:ignore bashpid, pids, nproc -->

![Linux - Tirez parti du nombre de CPU dont vous disposez ; lancez des jobs concurrents](/img/v2/linux_parallel.webp)

<TLDR>
Cet article montre comment exécuter des appels de fonctions Bash en parallèle plutôt qu'en séquence, en utilisant `&` pour passer chaque appel en arrière-plan, `nproc` pour dimensionner un pool de threads adapté aux cœurs CPU disponibles, et le suivi des identifiants de processus avec `jobs | wc -l` pour limiter le nombre d'exécutions simultanées — transformant une boucle séquentielle de 10 appels et 30 secondes en une version parallèle d'environ 3 secondes (avec une note pour respecter aussi les limites de débit imposées par l'API cible).
</TLDR>

Dans mon activité professionnelle, j'ai été confronté au besoin suivant : traiter chaque ligne d'un fichier CSV et faire un appel API POST pour envoyer un document.

Une ligne du CSV contenait les informations à communiquer à un service API, et chaque ligne correspondait à un fichier PDF. Donc s'il y a 1000 lignes dans le fichier CSV, je dois faire 1000 appels API pour envoyer 1000 PDF.

J'ai écrit mon script en Bash sous Linux puis est venu le temps d'optimiser : pas un seul appel API à la fois, mais autant que possible.

Voyons comment lancer plus d'une tâche à la fois avec Bash sous Linux.

<!-- truncate -->

Prenons cette petite démo :

<Snippet filename="demo.sh" source="./files/demo.sh" />

Avant d'appeler la fonction `main`, je retiens l'heure de départ réelle, j'appelle `main` puis je calcule le temps écoulé en secondes.

La fonction `main` est plutôt basique ici : je fais une boucle de 1 à 10 et, à chaque tour, j'appelle la fonction `demo`. Cette fonction attend 3 secondes.

Donc, en lançant le script, puisqu'on appelle notre fonction demo dix fois et que la fonction attend trois secondes, la durée totale n'a rien de surprenant :

<Terminal typewriter source="./files/terminal-2.txt" />

<AlertBox variant="caution" title="Hé mec ! J'ai plus d'un CPU">
Mais ce code est complètement dépassé, non ? Combien de CPU avais-je ? Un seul ? Oh merci les dieux de l'informatique, j'en ai bien plus que ça ! Alors, pourquoi n'en utiliser qu'un ?

</AlertBox>

## Maintenant, la version optimisée {#now-the-optimized-version}

Ok, maintenant, on ne va plus lancer notre fonction de manière séquentielle mais l'appeler une fois et **ne pas attendre la fin de la fonction** : on continue la boucle et on appelle la même fonction une deuxième fois, une troisième fois, ...

Il faut juste s'assurer de ne pas tuer nos performances et, pour cela, on va récupérer le nombre de cœurs CPU de la machine. Sous Linux, c'est très simple : la commande `nproc` fait le travail.

Sur mon ordinateur, j'ai 32 processeurs logiques et comme je peux lancer 2 threads par CPU, je peux calculer le nombre maximum de threads comme ceci : `NUMBER_OF_THREADS=$(( $(nproc) * 2 ))`.

<AlertBox variant="info" title="Attention aussi aux limitations imposées par le tiers">
Dans le script Bash ci-dessous, pas de souci, c'est juste mon ordinateur, mais dans mon introduction j'ai mentionné « je dois appeler un service API POST ». Ici, je m'assure simplement de ne pas être blacklisté par le serveur web. Par exemple, il y a peut-être une limitation du type « pas plus de 32 appels par seconde pour la même IP ». Dans ce cas, je dois en tenir compte et ne pas lancer plus de 32 processus à la fois (je fixerai alors `NUMBER_OF_THREADS=32`).

</AlertBox>

On va adapter notre exemple comme ceci :

<Snippet filename="demo.sh" source="./files/demo.part2.sh" />

### En détail {#in-depth}

En ajoutant le caractère `&`, je demande à Bash de ne pas attendre que la fonction termine son travail avant de rendre la main. Donc, le code ci-dessous va exécuter `demo` 10 fois avant même que le premier appel à `demo` ne soit terminé.

```bash
for i in {1..10}; do
    demo &
done
```

Si je dois faire 100, 500 ou 1 000 appels, mon ordinateur va commencer à peiner et, peut-être, ne plus répondre du tout. Mon ordinateur ne peut pas gérer 1 000 appels en même temps.

Que faire ?

Je sais que j'ai un nombre précis de cœurs (voir la commande `nproc`) et je sais que je peux lancer deux threads par cœur *(donc, dans mon cas, je peux lancer 64 jobs en même temps)*.

Alors, avant de lancer l'appel suivant de `demo`, je dois faire deux choses :

1. je garde l'identifiant de processus (`pid`) de la fonction `demo` qui vient d'être lancée (chaque appel a son propre `pid`) et je stocke cette valeur dans un tableau,
2. je dois vérifier combien de jobs tournent et ne sont pas encore terminés (récupéré via `$( jobs | wc -l )`) et comparer ce nombre au nombre de threads qu'on peut lancer (*64* pour moi). Dès que le nombre de jobs en cours atteint mon maximum, ok, je dois attendre. Je ne dois pas lancer un 65e job mais attendre que les 64 précédents soient terminés.

Et, une fois que c'est fait, je peux continuer avec la vague suivante et ainsi de suite.

Enfin, après la boucle, je fais la même chose, c'est-à-dire m'assurer que tous les jobs définis dans notre tableau `pids` sont terminés.

### Combien de secondes aurais-je attendu ? {#how-many-seconds-would-i-have-waited}

Savez-vous combien de temps je dois attendre ? Rappelez-vous, dans la première version du script, j'ai attendu 30 secondes.

Avec la version optimisée ci-dessus et pour faire **exactement la même chose**, j'ai attendu ... trois secondes seulement :

<Terminal typewriter source="./files/terminal-1.txt" />

<AlertBox variant="info" title="Exécuter la fonction 50 fois">
Dans la première version du script, en changeant la ligne `for i in {1..10}; do` en `for i in {1..50}; do`, j'attendrai 150 secondes ; non ? Avec la version optimisée, 4 secondes seulement. Pourquoi 4 et pas 3 ? Sans doute un léger délai introduit par le processeur (qui doit gérer 50 threads concurrents).

Comme les jobs se terminent maintenant dans le désordre, deux articles complémentaires deviennent utiles : <Link to="/blog/bash-progression-bar">Linux - Using a progression bar in your script</Link> pour garder un œil sur l'avancement global et <Link to="/blog/bash-logging">Bash - Script to add logging features to your script</Link> pour savoir quel appel a échoué et quand.

</AlertBox>
