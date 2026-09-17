---
slug: docker-postgrest
title: N'interrogez plus votre base PostgreSQL, préférez PostgREST
date: 2024-01-06
description: Utilisez Docker et PostgREST pour transformer instantanément votre base de données PostgreSQL en une puissante API RESTful. Éliminez les requêtes SQL et les modèles de base de données complexes du code de votre application grâce à ce tutoriel de mise en place tout simple.
authors: [christophe]
image: /img/v2/postgrest.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - database
  - docker
language: fr
updates:
  - date: 2026-07-30
    note: "Updated PostgREST download from v10.1.1 to v14.16; archive filename changed from linux-static-x64 to linux-static-x86-64."
---
![N'interrogez plus votre base PostgreSQL, préférez PostgREST](/img/v2/postgrest.webp)

<TLDR>
Cet article présente PostgREST, un outil qui transforme une base de données PostgreSQL directement en API RESTful, ce qui évite d'écrire des modèles et des requêtes dans le code de votre application. On y crée une base d'exemple dans Docker, on lance PostgREST dessus et on interroge l'API obtenue avec `curl` : filtres, recherche full-text, jointures, pagination, casting et formats de sortie (JSON/CSV/texte).
</TLDR>

L'année dernière, j'avais une grosse application développée en Laravel qui nécessitait une base MySQL. En migrant vers PostgreSQL, j'ai découvert PostgREST, qui m'a permis de supprimer complètement les requêtes de mon code.

Ne vous trompez pas : mon code Laravel/PHP lançait des dizaines de requêtes vers la base et, après migration, plus aucune.

Mes tables, mes modèles, mes requêtes SQL : j'ai pu tout retirer de mon code. Mon code PHP a été considérablement allégé et simplifié.

<!-- truncate -->

## Ce que PostgREST fait pour vous {#what-postgrest-does-for-you}

Il y a une table `todos` dans une base PostgreSQL. Aucun contrôleur, aucun fichier de routes, aucun modèle — rien n'a été écrit. Et pourtant :

<Terminal typewriter>
$ curl http://localhost:3000/todos | jq
</Terminal>

```json
[
  {
    "id": 1,
    "done": false,
    "task": "finish tutorial 0",
    "due": null
  },
  {
    "id": 2,
    "done": false,
    "task": "pat self on back",
    "due": null
  }
]
```

Du JSON prêt à consommer, directement issu de la table, sans une seule ligne de code backend. C'est terriblement simple, non ?

## Pourquoi ça fonctionne {#why-it-works}

- **Le schéma de la base *est* l'API.** « PostgREST is a standalone web server that turns your PostgreSQL database directly into a RESTful API. The structural constraints and permission in the database determine the API endpoints and operations » ([documentation officielle](https://postgrest.org/en/)). Une table devient un endpoint, une colonne devient un champ.
- **Les permissions sont la couche de sécurité**, et elles sont là où elles doivent être : dans PostgreSQL. Une table `users` que vous n'accordez jamais au rôle anonyme n'existe tout simplement pas du point de vue de l'API.
- **Il n'y a plus rien à maintenir synchronisé.** Après ma propre migration, j'ai supprimé 100 % du code déclarant les tables et les champs, les déclarations de relations et les requêtes. Ce qui était une couche de modèles est devenu des URLs.

## À nous de jouer {#lets-play}

Pour cet article, créons un dossier temporaire dans votre dossier `/tmp` : ouvrez une console Linux et lancez `mkdir /tmp/postgrest && cd $_`.

### Étape 1 - Créer et alimenter notre base PostgreSQL {#step-1---create-and-populate-our-postgresql-database}

<Vars port="5433" restPort="3000" name="tutorial" labels={{ port: "Port sur l'host", restPort: "Port PostgREST par défaut", name: "Nom du container" }} />

Nous allons créer un container Docker pour notre base PostgreSQL :

<Terminal typewriter>
$ docker run --name %%name=tutorial%% -p %%port=5433%%:5432 \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -d postgres
</Terminal>

Maintenant, entrons dans notre container PostgreSQL et lançons `psql` :

<Terminal typewriter>
$ docker exec -it %%name=tutorial%% psql -U postgres
</Terminal>

Copiez/collez le code ci-dessous dans votre console. Cela va créer une base appelée `api` avec une table `todos` contenant deux enregistrements. Cela va aussi créer un utilisateur `web_anon` que nous utiliserons avec PostgREST pour interroger nos données :

<Snippet filename="create_db.sql" source="./files/create_db.sql" />

Pour quitter la console postgres, tapez simplement `\q`.

### Étape 2 - Installer et exécuter PostgREST {#step-2---install-and-execute-postgrest}

PostgREST est un binaire, téléchargez-le en lançant :

<Terminal typewriter>
curl -o postgrest-v14.16-linux-static-x86-64.tar.xz -L https://github.com/PostgREST/postgrest/releases/download/v14.16/postgrest-v14.16-linux-static-x86-64.tar.xz

tar xJf postgrest-v14.16-linux-static-x86-64.tar.xz && rm -f postgrest-v14.16-linux-static-x86-64.tar.xz

</Terminal>

Vous avez maintenant un fichier `postgrest` dans votre dossier.

Il nous faut une configuration : créez un fichier `tutorial.conf` avec ce contenu :

<Snippet filename="tutorial.conf" source="./files/tutorial.conf" />

<AlertBox variant="info" title="PostgREST démarre comme un service sur le port 3000 par défaut">
L'instruction `./postgrest tutorial.conf` démarre un service. Vous pouvez l'arrêter avec <kbd>CTRL</kbd>-<kbd>C</kbd> mais laissez-le tourner pour l'instant et ouvrez une nouvelle console.

Ajoutez la ligne ci-dessous à votre fichier de conf si vous souhaitez utiliser un autre port ; p.ex. le port <Var name="restPort">3000</Var> :

<Snippet filename="tutorial.conf" source="./files/tutorial.part2.conf" />


</AlertBox>

Lançons maintenant un container Docker pour PostgREST :

<Terminal typewriter>
$ ./postgrest tutorial.conf
</Terminal>

## D'autres requêtes {#more-queries}

À l'étape 1, nous avons créé et alimenté notre base PostgreSQL ; à l'étape 2, nous avons installé et configuré PostgREST pour utiliser cette base. À partir de maintenant, on peut l'utiliser directement comme n'importe quelle API.

Chaque requête est composée d'une partie fixe (l'URL de notre serveur PostgREST), à savoir <Code>http://localhost:<Var name="restPort">3000</Var></Code>, suivie de la requête elle-même. Pour récupérer le contenu d'une table, mentionnez simplement son nom — c'est l'appel <Code>http://localhost:<Var name="restPort">3000</Var>/todos</Code> montré en haut de cet article.

Pour des raisons esthétiques, j'utilise ici `| jq` (vous pouvez retirer cette partie si vous voulez). Consultez mon article <Link to="/blog/linux-jq">The jq utility for Linux</Link> pour en savoir plus sur `jq`.

### Utiliser un filtre {#using-a-filter}

Vous pouvez utiliser des filtres en tapant p.ex. `?` suivi d'un nom de champ et d'un critère. Pour obtenir uniquement l'enregistrement dont l'`id` vaut 2, voici comment faire :

<Terminal typewriter source="./files/terminal-1.txt" />

Et si vous souhaitez faire une *recherche full text* pour retrouver un contenu à partir d'une valeur, voici comment faire :

<Terminal typewriter source="./files/terminal-2.txt" />

Dans l'exemple ci-dessus, on recherche tous les todos dont le champ `task` contient le mot `tutorial`.

Ci-dessous, une requête sur le champ `done` qui doit être vrai.

<Terminal typewriter source="./files/terminal-3.txt" />

Ci-dessous, nous demandons uniquement les champs `id` et `task` :

<Terminal typewriter source="./files/terminal-4.txt" />

### Depuis le frontend {#from-the-frontend}

Comme il s'agit de simples endpoints HTTP, votre frontend les consomme directement. En JavaScript, avec axios :

```js
const todos = axios.create({
    baseURL: 'http://localhost:3000/todos',
    headers: {
      'Accept': 'application/json'
    }
})
```

## Sous le capot (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Permissions requises {#permissions-required}

En utilisant PostgREST, vous exposez vos tables et vos enregistrements via une API RESTful. Naturellement, il existe un système de permissions qui permet de définir ce qui est accessible (p.ex. une table `users` restera secrète) et ce qui peut être fait (p.ex. un utilisateur n'aura qu'un accès en lecture, un autre un accès en lecture-écriture).

### OpenAPI {#openapi}

PostgREST est conforme à [OpenAPI](https://swagger.io/specification/). Il est donc possible de documenter automatiquement ses routes avec l'image Docker [Swagger UI](https://hub.docker.com/r/swaggerapi/swagger-ui).

Cela signifie qu'en lançant <Code>curl http://localhost:<Var name="restPort">3000</Var></Code> (l'URL de PostgREST), vous obtenez la liste de toutes les tables auxquelles vous avez accès (avec votre clé d'accès). Votre base devient ainsi ouverte au monde (encore une fois, uniquement ce que vous avez autorisé avec les bonnes permissions).

### Arrêter PostgREST {#close-postgrest}

Retournez dans la console où vous avez démarré PostgREST et appuyez sur <kbd>CTRL</kbd>-<kbd>C</kbd> pour l'arrêter.

Si vous avez démarré PostgreSQL plus haut, vous pouvez l'arrêter et le supprimer avec <Code>docker container stop <Var name="name">tutorial</Var> ; docker container rm <Var name="name">tutorial</Var></Code>.

## Illustration de quelques appels {#illustration-of-some-calls}

<AlertBox variant="caution" title="Ces requêtes visent une autre base de données">
Les exemples ci-dessous viennent de mon repository de démo [PostgREST](https://github.com/cavo789/postgrest), dont la base contient les tables `citizens`, `workers`, `levels`, `translations` et `generic_profiles`. Elles ne fonctionneront **pas** sur la base `todos` construite plus haut dans cet article — voyez-les comme un catalogue de syntaxe, pas comme des commandes à copier tout de suite.
</AlertBox>

### Citizens {#citizens}

- Obtenir la liste de tous les citizens : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/citizens | jq</Code>
- Uniquement le citizen ID 69 : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/citizens?id=eq.69 | jq</Code>
- Uniquement le citizen ID 69, avec id, firstname et lastname : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/citizens?select=id,first_name,last_name&id=eq.69 | jq</Code>
- Obtenir Jean, mais seulement celui qui parle néerlandais (language ID `2`) (c'est-à-dire un WHERE avec deux conditions) : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/citizens?first_name=fts.Jean&language_id=eq.2 | jq</Code>

### Workers {#workers}

- Obtenir la liste de tous les workers, les cinq premiers : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email&limit=5 | jq</Code>
- Obtenir la liste de tous les workers, les cinq suivants : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email&limit=5&offset=5 | jq</Code>
- Ordre inverse, obtenir les 10 derniers : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email&limit=10&offset=0&order=id.desc | jq</Code>

- Obtenir le worker id 15 : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?id=eq.15 | jq</Code> — comme on le voit, la sortie est un tableau avec un seul enregistrement
- Obtenir le worker id 15 - sans tableau : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?id=eq.15 -H "Accept: application/vnd.pgrst.object+json" | jq</Code> (c'est ici plus simple et plus logique pour le frontend)

### Utiliser une inner join {#using-inner-join}

- Obtenir la liste des workers avec leurs first_name et last_name (limité au worker ID `73`) : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email,citizens(first_name,last_name)&id=eq.73 | jq</Code>
- Ajouter le code de langue : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email,citizens(first_name,last_name,language_id),languages(code)&id=eq.73 | jq</Code>

### Levels {#levels}

- Obtenir la liste de tous les levels : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/levels | jq</Code>
- Obtenir la liste des levels dont l'ID est supérieur à 10, uniquement ID et code : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/levels?select=id,code&id=gt.10 | jq</Code>

### Translations {#translations}

- Obtenir la liste des traductions contenant le mot *Technical* : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/translations?value=fts.Technical | jq</Code>
- Obtenir la liste des traductions commençant par le mot *Technical*, sans tenir compte de la casse : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/translations?value=ilike.technical* | jq</Code>

### Generic profiles {#generic-profiles}

- Obtenir la liste des generic profiles actifs : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/generic_profiles?active=is.true | jq</Code>
- et renommer le champ `code` en `GenericProfileCode` : <Code>curl http://127.0.0.1:<Var name="restPort">3000</Var>/generic_profiles?select=id,GenericProfileCode:code&active=is.true | jq</Code>

### Format de sortie {#output-format}

- Obtenir la liste en JSON : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers -H "Accept: application/json"</Code>
- Obtenir la liste en CSV : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers -H "Accept: text/csv"</Code>
- Obtenir la liste en TEXT - ici, il faut ne retourner qu'une seule valeur : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=email&id=eq.15 -H "Accept: text/plain"</Code>

### Casting {#casting}

- Obtenir l'ID et l'email du worker `15` : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id,email&id=eq.75 | jq</Code>
- Caster l'ID en chaîne : <Code>clear ; curl http://127.0.0.1:<Var name="restPort">3000</Var>/workers?select=id::text,email&id=eq.75 | jq</Code>

## Conclusion {#conclusion}

Un container, un binaire et un fichier `.conf`, et votre base de données répond en HTTP. Ce que je trouve remarquable, ce n'est pas la rapidité de la mise en place, c'est ce qui disparaît ensuite : les modèles, les déclarations de relations, les appels au query builder — tout un layer dont le seul rôle était de décrire, dans votre langage, quelque chose que PostgreSQL savait déjà.

Oracle a son équivalent, décrit dans <Link to="/blog/docker-oracle-ords">Transform an Oracle DB as OpenData using Oracle REST Data Services</Link>. Et pour regarder la base derrière l'API, <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Adminer, pgadmin or phpmyadmin</Link> reste bien pratique.
