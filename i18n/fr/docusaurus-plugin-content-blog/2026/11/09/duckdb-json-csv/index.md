---
slug: duckdb-json-csv
title: "DuckDB - Interroger des fichiers JSON et CSV en SQL, sans base de données"
authors: [christophe, claude]
image: /img/v2/duckdb-json-csv.webp
mainTag: database
tags: [database, docker, linux]
date: 2026-11-09
description: "Exécutez du vrai SQL — jointures, fonctions de fenêtrage, GROUP BY — directement sur des fichiers JSON et CSV, sans import, sans serveur, sans schéma à définir. Dockerisé, avec une fonction shell duckdb utilisable depuis n'importe quel dossier. L'outil que je sors dès qu'awk ou jq ne suffisent plus."
language: fr
ai_assisted: true
---

![DuckDB - Interroger des fichiers JSON et CSV en SQL, sans base de données](/img/v2/duckdb-json-csv.webp)

<!-- cspell:ignoreCase duckdb -->

<TLDR>
[DuckDB](https://duckdb.org/) est une base de données analytique embarquée qui interroge directement des fichiers CSV et JSON en SQL — `SELECT * FROM 'file.csv'` fonctionne tel quel, sans import, sans serveur, sans schéma à définir au préalable. Cet article le met en place sous forme d'image Docker avec une fonction shell `duckdb` chargée par votre zsh ou votre bash, exactement comme pour [Markitdown](/blog/markitdown) et [Docling](/blog/docling) : une seule commande, utilisable depuis n'importe quel dossier. C'est l'outil qui prend le relais précisément là où `awk` et `jq` ne suffisent plus — dès qu'une question demande une jointure, une fonction de fenêtrage ou un GROUP BY sur deux formats de fichiers différents à la fois.
</TLDR>

J'ai écrit [Pandas — merge two or more files](/blog/python-pandas-merge) il y a quelque temps pour exactement ce genre de besoin, et ça marche, mais il faut écrire un script : importer pandas, lire les fichiers, fusionner, éventuellement réexporter. La plupart du temps, ce que je veux vraiment, c'est une requête, lancée une fois, répondue une fois. `awk` gère la version simple — group-by-and-count, filtrage — mais dès que j'ai besoin d'un vrai `JOIN` ou d'une fonction de fenêtrage, me revoilà à écrire du Python pour une question qui tient littéralement en une ligne de SQL.

<!-- truncate -->

## Démo {#demo}

<Snippet filename="orders.csv" source="./files/orders.csv" defaultOpen={false} />
<Snippet filename="users.json" source="./files/users.json" defaultOpen={false} />

<Terminal source="./files/terminal_duckdb.txt" typewriter />

Trois formes de requêtes vraiment différentes sur deux formats de fichiers différents, sans écrire le moindre script : un `GROUP BY`/`SUM` sur le CSV, un filtre `WHERE` via `read_json_auto` sur le JSON, et une fonction de fenêtrage `RANK() OVER (PARTITION BY ...)` — le genre de requête pour laquelle `awk` n'a tout simplement pas de réponse propre.

## Ce qui rend DuckDB différent {#what-makes-duckdb-different}

DuckDB est un vrai moteur SQL — la syntaxe, le planificateur de requêtes, tout — sauf qu'il tourne dans le processus, ne nécessite aucun serveur et lit directement les fichiers CSV/JSON/Parquet comme s'il s'agissait de tables :

```sql
SELECT * FROM 'orders.csv';
SELECT * FROM read_json_auto('users.json');
```

Pas de `CREATE TABLE`, pas d'import, pas de schéma à définir — il déduit les types de colonnes en échantillonnant le fichier, la même idée que le parsing automatique de [`jq`](/blog/linux-jq) mais avec du SQL complet par-dessus au lieu d'un langage de filtres.

## Installation {#installation}

### Essayez en deux minutes {#try-it-in-two-minutes}

Cliquez sur le bouton ci-dessous pour obtenir un script qui crée `/tmp/duckdb-json` avec le Dockerfile et les deux fichiers de démo :

<ProjectSetup folderName="/tmp/duckdb-json" createFolder={true}>
  <Guideline>
    Lancez maintenant 'docker build -t duckdb-cli .' pour créer l'image Docker, puis
    installez la fonction duckdb comme expliqué ci-dessous.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />
<Snippet filename="orders.csv" source="./files/orders.csv" defaultOpen={false} />
<Snippet filename="users.json" source="./files/users.json" defaultOpen={false} />
</ProjectSetup>

Il n'existe pas de package apt ou pip pour le CLI DuckDB lui-même (seulement pour les bindings Python), donc le Dockerfile télécharge le binaire officiel de la release.

<AlertBox variant="note" title="Version figée volontairement">
`DUCKDB_VERSION` est un build arg, figé à `2.0.0` — la version actuelle au moment de l'écriture. Consultez la [page des releases](https://github.com/duckdb/duckdb/releases) pour une version plus récente et mettez l'arg à jour ; DuckDB publie assez souvent de nouvelles versions pour que figer explicitement, plutôt que suivre `latest`, garde le build reproductible.
</AlertBox>

### Rendre `duckdb` disponible partout {#make-duckdb-available-everywhere}

`/tmp/duckdb-json` ne servait qu'à la démo : il disparaît au prochain redémarrage. Ce qui doit rester sur votre PC, c'est le **Dockerfile**, pour pouvoir reconstruire l'image à tout moment (nouvelle machine, `docker image prune`, nouvelle version de DuckDB). Donnez-lui un emplacement permanent dans `~/tools/duckdb`, et construisez l'image depuis là :

```bash
mkdir -p ~/tools/duckdb
cp /tmp/duckdb-json/Dockerfile ~/tools/duckdb/
docker build -t duckdb-cli ~/tools/duckdb
```

Ce qui transforme cette image en commande, c'est une fonction, et elle a son propre fichier dans un dossier que votre shell charge au démarrage, la même organisation que dans <Link to="/blog/modular-zsh-workflow">mon workflow ZSH modulaire</Link> : votre fichier rc reste court, et désinstaller l'outil revient à supprimer un fichier.

<Snippet filename="duckdb.sh" source="./files/duckdb.sh" defaultOpen={true} />

Le code est identique pour zsh et bash ; seuls le dossier et le loader changent.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Créez le fichier** dans `~/.zsh/fns/` :

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="duckdb.zsh" source="./files/duckdb.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.zshrc`.** Déjà fait si vous avez suivi un de mes articles « Ollama au quotidien ». Sinon, ajoutez à la fin de `~/.zshrc` :

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Créez le fichier** dans `~/.bash/fns/` :

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="duckdb.sh" source="./files/duckdb.sh" defaultOpen={false} />
</ProjectSetup>

**2. Chargez le dossier depuis `~/.bashrc`.** Ajoutez à la fin de `~/.bashrc` (le test `-r` évite une erreur si le dossier est vide) :

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Ouvrez un nouveau terminal** (ou lancez `exec bash`).

</TabItem>
</Tabs>

Vérifiez que le shell connaît la fonction : `type duckdb` doit répondre `duckdb is a shell function`. Allez ensuite dans le dossier de démo et rejouez la première requête de cet article :

```bash
cd /tmp/duckdb-json
duckdb -c "SELECT region, COUNT(*) AS orders, SUM(amount) AS total FROM 'orders.csv' GROUP BY region ORDER BY total DESC"
```

Désormais, ça fonctionne de la même façon dans n'importe quel dossier contenant un fichier CSV ou JSON. La fonction monte le **dossier courant** comme `/workspace`, donc les chemins dans votre SQL sont relatifs à l'endroit où vous êtes. Ce dossier est monté en **lecture seule** sauf si le premier argument est `--write` ; `--read-only` de son côté verrouille le système de fichiers du container lui-même, donc rien ne peut non plus être écrit dans l'image ; un fichier hors du dossier courant n'est pas visible, faites d'abord un `cd` dessus. Sans argument, `duckdb` ouvre le shell SQL interactif ; avec `-c "SQL"`, il exécute une requête et se termine ; le SQL envoyé par un pipe (`cat report.sql | duckdb`) fonctionne aussi.

Si l'image est absente, la fonction n'échoue pas avec une erreur Docker cryptique, elle vous explique comment la reconstruire depuis `~/tools/duckdb` :

```text
Error: the Docker image "duckdb-cli" does not exist on this machine.

How to continue:
  1. docker build -t duckdb-cli "/home/you/tools/duckdb"
  2. Run your duckdb command again.
```

Et si `~/tools/duckdb/Dockerfile` a disparu aussi, le message renvoie vers cet article pour le récupérer.

<AlertBox variant="caution" title="Elle masque un duckdb natif">
La fonction s'appelle `duckdb`, elle a donc priorité sur un binaire `duckdb` installé localement. C'est l'objectif ici (pas d'installation locale), mais si vous installez DuckDB nativement un jour, supprimez la fonction ou renommez-la.
</AlertBox>

## Travailler avec `duckdb` {#working-with-duckdb}

### La console interactive {#the-interactive-console}

Une fois la fonction en place, taper `duckdb` sans argument ouvre une console SQL interactive, l'endroit le plus confortable pour jouer avec les deux instructions de [Ce qui rend DuckDB différent](#what-makes-duckdb-different) :

<Terminal source="./files/terminal_console.txt" />

Regardez la deuxième table : personne n'a rien déclaré, et pourtant `birth_date` revient en `date` et `active` en `boolean`, déduits des valeurs JSON elles-mêmes. Le prompt `memory D` signifie que la session tourne sur une base en mémoire jetable : un `SELECT` lit vos fichiers et ne change rien. `.help` liste les commandes de la console.

<AlertBox variant="tip" title="Pour quitter la console, tapez .quit">
Les commandes de la console commencent par un **point** : tapez `.quit` (ou `.exit`, ou appuyez sur <kbd>Ctrl</kbd>+<kbd>D</kbd>) pour revenir à votre shell. Un simple `exit` ou `quit` ne fonctionne **pas** : DuckDB le lit comme le début d'une instruction SQL et attend silencieusement la suite, jusqu'à ce qu'un `;` y mette fin avec une erreur de syntaxe.
</AlertBox>

### UPDATE et DELETE : lecture seule par défaut, `--write` quand vous le voulez vraiment {#update-and-delete-read-only-by-default---write-when-you-mean-it}

DuckDB exécute `UPDATE` et `DELETE` sur des **tables**, jamais sur un fichier lu directement : `UPDATE 'orders.csv' SET …` est refusé avec `Can only update base table`, quelles que soient les permissions. Modifier un fichier passe donc toujours par les trois mêmes étapes : le charger dans une table, modifier la table, la réécrire avec `COPY ... TO`.

Cette dernière étape est une écriture, et la fonction `duckdb` la refuse par défaut : elle monte le dossier courant en **lecture seule**, donc aucune requête ne peut modifier vos fichiers par accident. Mettez `--write` en premier pour l'autoriser :

<Terminal source="./files/terminal_write.txt" />

Le `orders.csv` d'origine est intact ; `orders_fixed.csv` contient les montants EMEA avec 21 % de TVA et aucune ligne APAC. Écrivez vers `'orders.csv'` à la place et le fichier lui-même est réécrit. `COPY ... TO` écrit du CSV, du JSON (`'out.json'`) ou du Parquet (`'out.parquet'`), choisi d'après l'extension. Pour conserver des tables entre deux sessions au lieu d'une base en mémoire jetable, attachez un fichier de base de données, ce qui est aussi une écriture : `duckdb --write`, puis `ATTACH 'shop.duckdb' AS shop;`.

## DuckDB ou jq/awk ? {#duckdb-or-jqawk}

<AlertBox variant="tip" title="Même esprit qu'ai-data, un cran au-dessus">
Si vous avez lu [`ai-data`](/blog/ollama-ai-data) de la série Ollama : voyez DuckDB comme ce que vous sortez dès que la question n'est plus une one-liner. `jq`/`awk` restent gagnants pour les filtres rapides et les comptages simples ; dès qu'il s'agit d'une jointure, d'une fonction de fenêtrage ou d'un « groupe par ceci, trie par cela, limite à 10 », DuckDB y répond en une requête au lieu d'un script.
</AlertBox>

## À retenir {#key-takeaways}

<StepsCard
  variant="remember"
  title="duckdb en bref"
  steps={[
    { content: "**Aucun import** — `SELECT * FROM 'file.csv'` et `read_json_auto('file.json')` interrogent les fichiers directement" },
    { content: "**Du vrai SQL** — jointures, fonctions de fenêtrage, `GROUP BY`, exactement comme une base complète, sans serveur" },
    { content: "**Pas de package pour le CLI** — le Dockerfile télécharge le binaire officiel de la release, version figée" },
    { content: "**Un fichier dans `~/.zsh/fns/` ou `~/.bash/fns/`** — `duckdb` fonctionne depuis n'importe quel dossier, et explique comment reconstruire l'image si elle a disparu" },
    { content: "**Interactif ou one-shot** — `duckdb` seul pour un REPL, `-c \"SQL\"` pour une requête unique" },
    { content: "**Lecture seule par défaut** — `duckdb --write` pour enregistrer des fichiers avec `COPY ... TO` ou `ATTACH`" },
    { content: "**Complémentaire d'`ai-data`** — commencez par `awk`/`jq`, passez à DuckDB dès que la question demande une jointure ou une fonction de fenêtrage" }
  ]}
/>

## Conclusion {#conclusion}

Entre [`python-pandas-merge`](/blog/python-pandas-merge) pour tout ce qui demande du vrai scripting, `jq`/`awk`/[`ai-data`](/blog/ollama-ai-data) pour les one-liners rapides, et maintenant DuckDB pour tout l'entre-deux qui relève vraiment d'une question SQL, je sors beaucoup moins souvent le « allez, un petit script Python ». Un fichier `.csv` et un fichier `.json`, interrogés et joints ensemble avec une ligne de vrai SQL, sans serveur, sans import — voilà un outil qui mérite une place permanente dans mon `~/.zsh/fns/`.
