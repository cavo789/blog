---
slug: docker-postgrest
title: Don't query your PostgreSQL db anymore, prefer PostgREST
authors: [christophe]
image: ./images/social_media.png
tags: [docker, openapi, postgrest, postgresql, swagger-ui]
enableComments: true
---
# Don't query your PostgreSQL db anymore, prefer PostgREST

![Don't query your PostgreSQL db anymore, prefer PostgREST](./images/social_media.png)

Last year I had a large application developed in Laravel that required a MySQL database. When I was migrating to PostgreSQL I discovered PostgREST, which allowed me to completely remove queries from my code.

Don't get me wrong: my Laravel/PHP code was launching dozens of queries to the database and, after migration, none at all.

My tables, my models, my SQL queries, I was able to remove everything from my code. My PHP code has been greatly lightened and simplified.

<!-- truncate -->

"PostgREST is a standalone web server that turns your PostgreSQL database directly into a RESTful API. The structural constraints and permission in the database determine the API endpoints and operations". You can retrieve the official documentation [here](https://postgrest.org/en/).

:::tip Will return JSON
In short: using an API, PostgREST will retrieve data from your PostgreSQL database and will return a JSON answer to you.
:::

:::info PostgREST is magic: it takes all the complexity out of accessing your data
Back to my experience: after the migration from MySQL to PostgreSQL, I deleted 100% of my code that had to declare my tables and their fields (the models), I deleted the declaration of my relationships between tables, I deleted my queries, ... After my migration to PostgREST, I no longer had any PHP code of the "database" type. Everything was replaced by web calls to APIs. On top, in Javascript and using axios, I can directly access to my database using f.i.

```script
const todos = axios.create({
    baseURL: 'http://localhost:3000/todos',
    headers: {
      'Accept': 'application/json'
    }
})
```

:::

## Let's play

For this post, let u's create a temporary folder in your `/tmp` folder: start a Linux console and run `mkdir /tmp/postgrest && cd $_`.

### Step 1 - Create and populate our PostgreSQL database

We'll create a Docker container for our PostgreSQL database:

```bash
docker run --name tutorial -p 5433:5432 \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -d postgres
```

Now, we'll enter in our PostgreSQL container and run `psql`:

```bash
docker exec -it tutorial psql -U postgres
```

Copy/Paste the code below in your console. This will create a database called `api` with a table called `todos`; with two records. This will also create a `web_anon` user that we'll use with PostgREST to query our data:

```sql
create schema api;

create table api.todos (
  id serial primary key,
  done boolean not null default false,
  task text not null,
  due timestamptz
);

insert into api.todos (task) values
  ('finish tutorial 0'), ('pat self on back');

create role web_anon nologin;

grant usage on schema api to web_anon;
grant select on api.todos to web_anon;

create role authenticator noinherit login password 'mysecretpassword';
grant web_anon to authenticator;
```

Now, to leave the postgres console, just type `\q`.

### Step 2 - Install and execute PostgREST

PostgREST is a binary, download it by running:

```bash
curl -o postgrest-v10.1.1-linux-static-x64.tar.xz -L https://github.com/PostgREST/postgrest/releases/download/v10.1.1/postgrest-v10.1.1-linux-static-x64.tar.xz
tar xJf postgrest-v10.1.1-linux-static-x64.tar.xz && rm -f postgrest-v10.1.1-linux-static-x64.tar.xz
```

You've now a file called `postgrest` in your folder.

We need to create a configuration, please create a file called `tutorial.conf` with this content:

```conf
db-uri = "postgres://authenticator:mysecretpassword@localhost:5433/postgres"
db-schemas = "api"
db-anon-role = "web_anon"
```

:::info PostgREST will start as a service on port 3000 by default
The instruction `./postgrest tutorial.conf` will start a service. You can stop it by pressing <kbd>CTRL</kbd>-<kbd>C</kbd> but leave it right now and start a new console.

Add the line below to your conf file if you wish to use another port; f.i. port `3001`:

```conf
server-port = 3001
```

:::

Now, we'll run a Docker container for PostgREST:

```bash
./postgrest tutorial.conf
```

### Step 3 - Play with PostgREST

So, in step 1, we've created and populate our PostgreSQL database and, in step 2, we've installed and configured PostgREST to use that database.

So, from now, we can directly use it like any API.

How do you usually run an API? Most probably by starting your web browser and by accessing a specific URL. Let's try but in this article, I'll use `curl`.

The query below is made by a fix part (the URL for our postgREST server) which is `http://localhost:3000` and, after it, our query.

To get the content of a table, just mention his name so `http://localhost:3000/todos` will return all the records of the `todos` table.

For esthetic reason here, I'm using `| jq` (you can remove that part if you want). See my [The jq utility for Linux](/blog/linux-jq) article to learn more about `jq`.

```bash
curl http://localhost:3000/todos | jq
```

And the result:

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

It's awfully easy, isn't it?

#### Using a filter

You can use filters by typing f.i. `?` followed by a field name and a criteria. To get only the record having the `id` 2, here is how to do:

```bash
curl http://localhost:3000/todos\?id\=eq.2 | jq
```

And if you wish to make a *Full text search* to retrieve a content based on a value, here is how to do:

```bash
curl http://localhost:3000/todos\?task=fts.tutorial | jq
```

In the example above, we'll search any todo where the field `task` contains the word `tutorial`.

Below, a query on the field `done` which should be true.

```bash
curl http://localhost:3000/todos\?done=is.true | jq
```

Below, we are asking for getting only fields `id` and `task`:

```bash
curl http://localhost:3000/todos?select=id,task | jq
```

### Close PostgREST

Return to the console in which you've started PostgREST and press <kbd>CTRL</kbd>-<kbd>C</kbd> to stop PostgREST from running.

If you've started PostgreSQL here above, you can stop and kill it using `docker container stop tutorial ; docker container rm tutorial`.

## Permissions required

By using PostgREST you expose your tables and records through a RESTfull API. Naturally, there is a system of permission so that you can define what can be accessed (e.g. a `users` table will remain secret) and what can be done (e.g. one user will only have read access but another will have read-write access).

## Get more examples

Consult my [PostgREST](https://github.com/cavo789/postgrest) repository on GitHub to get more examples.

## OpenAPI

PostgREST is compliant with [OpenAPI](https://swagger.io/specification/). It's then possible to auto-document his routes using the [Swagger UI](https://hub.docker.com/r/swaggerapi/swagger-ui) Docker image.

This means that running `curl http://localhost:3000` (the PostgREST URL), you'll get the list of all tables accessible to you (using your access key). This makes your database open to the world (once again, only what you've allowed using correct permission).
