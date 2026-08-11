---
slug: docker-postgrest
title: Don't query your PostgreSQL db anymore, prefer PostgREST
date: 2024-01-06
description: Use Docker and PostgREST to instantly turn your PostgreSQL database into a powerful RESTful API. Eliminate SQL queries and complex database models from your application code with this simple setup tutorial.
authors: [christophe]
image: /img/v2/postgrest.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - database
  - docker
language: en
updates:
  - date: 2026-07-30
    note: "Updated PostgREST download from v10.1.1 to v14.16; archive filename changed from linux-static-x64 to linux-static-x86-64."
---
![Don't query your PostgreSQL db anymore, prefer PostgREST](/img/v2/postgrest.webp)

<TLDR>
This article introduces PostgREST, a tool that turns a PostgreSQL database directly into a RESTful API, removing the need to write models and queries in your application code. It walks through creating a sample database in Docker, running PostgREST against it, and querying the resulting API with `curl`, including filtering, full-text search, joins, pagination, casting, and output formats (JSON/CSV/text).
</TLDR>

Last year I had a large application developed in Laravel that required a MySQL database. When I was migrating to PostgreSQL I discovered PostgREST, which allowed me to completely remove queries from my code.

Don't get me wrong: my Laravel/PHP code was launching dozens of queries to the database and, after migration, none at all.

My tables, my models, my SQL queries, I was able to remove everything from my code. My PHP code has been greatly lightened and simplified.

<!-- truncate -->

## What PostgREST does for you

There is a `todos` table in a PostgreSQL database. No controller, no route file, no model — nothing has been written. And yet:

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

Ready-to-consume JSON, straight from the table, without a single line of backend code. It's awfully easy, isn't it?

## Why it works

- **The database schema *is* the API.** "PostgREST is a standalone web server that turns your PostgreSQL database directly into a RESTful API. The structural constraints and permission in the database determine the API endpoints and operations" (the [official documentation](https://postgrest.org/en/)). A table becomes an endpoint, a column becomes a field.
- **Permissions are the security layer**, and they live where they belong: in PostgreSQL. A `users` table you never grant to the anonymous role simply doesn't exist as far as the API is concerned.
- **There's nothing left to keep in sync.** After my own migration, I deleted 100% of the code declaring tables and fields, the relationship declarations, and the queries. What used to be a model layer became URLs.

## Let's play

For this post, let's create a temporary folder in your `/tmp` folder: start a Linux console and run `mkdir /tmp/postgrest && cd $_`.

### Step 1 - Create and populate our PostgreSQL database

We'll create a Docker container for our PostgreSQL database:

<Terminal typewriter>
$ docker run --name tutorial -p 5433:5432 \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -d postgres
</Terminal>

Now, we'll enter in our PostgreSQL container and run `psql`:

<Terminal typewriter>
$ docker exec -it tutorial psql -U postgres
</Terminal>

Copy/Paste the code below in your console. This will create a database called `api` with a table called `todos`; with two records. This will also create a `web_anon` user that we'll use with PostgREST to query our data:

<Snippet filename="create_db.sql" source="./files/create_db.sql" />

Now, to leave the postgres console, just type `\q`.

### Step 2 - Install and execute PostgREST

PostgREST is a binary, download it by running:

<Terminal typewriter>
curl -o postgrest-v14.16-linux-static-x86-64.tar.xz -L https://github.com/PostgREST/postgrest/releases/download/v14.16/postgrest-v14.16-linux-static-x86-64.tar.xz

tar xJf postgrest-v14.16-linux-static-x86-64.tar.xz && rm -f postgrest-v14.16-linux-static-x86-64.tar.xz

</Terminal>

You've now a file called `postgrest` in your folder.

We need to create a configuration, please create a file called `tutorial.conf` with this content:

<Snippet filename="tutorial.conf" source="./files/tutorial.conf" />

<AlertBox variant="info" title="PostgREST will start as a service on port 3000 by default">
The instruction `./postgrest tutorial.conf` will start a service. You can stop it by pressing <kbd>CTRL</kbd>-<kbd>C</kbd> but leave it right now and start a new console.

Add the line below to your conf file if you wish to use another port; f.i. port `3001`:

<Snippet filename="tutorial.conf" source="./files/tutorial.part2.conf" />


</AlertBox>

Now, we'll run a Docker container for PostgREST:

<Terminal typewriter>
$ ./postgrest tutorial.conf
</Terminal>

## More queries

So, in step 1, we've created and populated our PostgreSQL database and, in step 2, we've installed and configured PostgREST to use that database. From now, we can directly use it like any API.

Every query is made of a fixed part (the URL of our PostgREST server), which is `http://localhost:3000`, followed by the query itself. To get the content of a table, just mention its name — that's the `http://localhost:3000/todos` call shown at the top of this article.

For aesthetic reasons here, I'm using `| jq` (you can remove that part if you want). See my <Link to="/blog/linux-jq">The jq utility for Linux</Link> article to learn more about `jq`.

### Using a filter

You can use filters by typing f.i. `?` followed by a field name and a criteria. To get only the record having the `id` 2, here is how to do:

<Terminal typewriter>
$ curl http://localhost:3000/todos\?id\=eq.2 | jq
</Terminal>

And if you wish to make a *Full text search* to retrieve a content based on a value, here is how to do:

<Terminal typewriter>
$ curl http://localhost:3000/todos\?task=fts.tutorial | jq
</Terminal>

In the example above, we'll search any todo where the field `task` contains the word `tutorial`.

Below, a query on the field `done` which should be true.

<Terminal typewriter>
$ curl http://localhost:3000/todos\?done=is.true | jq
</Terminal>

Below, we are asking for getting only fields `id` and `task`:

<Terminal typewriter>
$ curl http://localhost:3000/todos?select=id,task | jq
</Terminal>

### From the frontend

Since these are plain HTTP endpoints, your frontend consumes them directly. In JavaScript, using axios:

```js
const todos = axios.create({
    baseURL: 'http://localhost:3000/todos',
    headers: {
      'Accept': 'application/json'
    }
})
```

## Under the hood (skip this if you just want to use it)

### Permissions required

By using PostgREST you expose your tables and records through a RESTful API. Naturally, there is a system of permission so that you can define what can be accessed (e.g. a `users` table will remain secret) and what can be done (e.g. one user will only have read access but another will have read-write access).

### OpenAPI

PostgREST is compliant with [OpenAPI](https://swagger.io/specification/). It's then possible to auto-document its routes using the [Swagger UI](https://hub.docker.com/r/swaggerapi/swagger-ui) Docker image.

This means that running `curl http://localhost:3000` (the PostgREST URL), you'll get the list of all tables accessible to you (using your access key). This makes your database open to the world (once again, only what you've allowed using correct permission).

### Close PostgREST

Return to the console in which you've started PostgREST and press <kbd>CTRL</kbd>-<kbd>C</kbd> to stop PostgREST from running.

If you've started PostgreSQL here above, you can stop and kill it using `docker container stop tutorial ; docker container rm tutorial`.

## Illustration of some calls

<AlertBox variant="caution" title="These queries target another database">
The examples below come from my [PostgREST](https://github.com/cavo789/postgrest) demo repository, whose database holds `citizens`, `workers`, `levels`, `translations` and `generic_profiles` tables. They will **not** run against the `todos` database built earlier in this article — read them as a syntax catalogue, not as commands to copy right now.
</AlertBox>

### Citizens

- Get the list of all citizens: `clear ; curl http://127.0.0.1:3000/citizens | jq` / [URL](http://127.0.0.1:3000/citizens)
- Only citizen ID 69: `clear ; curl http://127.0.0.1:3000/citizens\?id\=eq.69 | jq` / [URL](http://127.0.0.1:3000/citizens?id=eq.69)
- Only citizen ID 69 and id, firstname and lastname: `clear ; curl http://127.0.0.1:3000/citizens\?select\=id,first_name,last_name\&id\=eq.69 | jq` / [URL](http://127.0.0.1:3000/citizens?select=id,first_name,last_name&id=eq.69)
- Get Jean but only the one speaking Dutch (language ID `2`) (i.e. a WHERE with two conditions): `clear ; curl http://127.0.0.1:3000/citizens\?first_name\=fts.Jean\&language_id\=eq.2 | jq` / [URL](http://127.0.0.1:3000/citizens?first_name=fts.Jean&language_id=eq.2)

### Workers

- Get the list of all workers, the first five: `clear ; curl http://127.0.0.1:3000/workers\?select\=id,email\&limit=5 | jq` / [URL](http://127.0.0.1:3000/workers?select=id,email&limit=5)
- Get the list of all workers, the next five: `clear ; curl http://127.0.0.1:3000/workers\?select\=id,email\&limit=5\&offset=5 | jq` / [URL](http://127.0.0.1:3000/workers?select=id,email&limit=5&offset=5)
- Reverse order, get the last 10: `clear ; curl http://127.0.0.1:3000/workers\?select\=id,email\&limit\=10\&offset\=0\&order\=id.desc | jq` / [URL](http://127.0.0.1:3000/workers\?select=id,email&limit=10&offset=0&order=id.desc)

- Get worker id 15: `clear ; curl http://127.0.0.1:3000/workers\?id\=eq.15  | jq` — as we can see, the output is an array with only one record / [URL](http://127.0.0.1:3000/workers?id=eq.15)
- Get worker id 15 - no more array: `clear ; curl http://127.0.0.1:3000/workers\?id\=eq.15 -H "Accept: application/vnd.pgrst.object+json" | jq` (here it's easier and more logic for the frontend)

### Using inner join

- Get the list of workers and their first_name and last_name (limit to worker ID `73`): `clear ; curl http://127.0.0.1:3000/workers\?select\=id,email,citizens\(first_name,last_name\)\&id\=eq.73 | jq` / [URL](http://127.0.0.1:3000/workers?select=id,email,citizens(first_name,last_name)&id=eq.73)
- Add the language code: `clear ; curl http://127.0.0.1:3000/workers?select=id,email,citizens(first_name,last_name,language_id),languages(code)&id=eq.73 | jq` / [URL](http://127.0.0.1:3000/workers?select=id,email,citizens(first_name,last_name,language_id),languages(code)&id=eq.73)

### Levels

- Get the list of all levels: `clear ; curl http://127.0.0.1:3000/levels | jq` / [URL](http://127.0.0.1:3000/levels)
- Get the list of levels where ID is greater than 10, only ID and code: `clear ; curl http://127.0.0.1:3000/levels\?select\=id,code\&id\=gt.10 | jq` / [URL](http://127.0.0.1:3000/levels?select=id,code&id=gt.10)

### Translations

- Get the list of translations with the word *Technical*: `clear ; curl http://127.0.0.1:3000/translations\?value\=fts.Technical | jq` / [URL](http://127.0.0.1:3000/translations?value=fts.Technical)
- Get the list of translations starting with the word *Technical*, case insensitive: `clear ; curl http://127.0.0.1:3000/translations\?value\=ilike.technical\* | jq` / [URL](http://127.0.0.1:3000/translations?value=ilike.technical*)

### Generic profiles

- Get the list of active generic profiles: `clear ; curl http://127.0.0.1:3000/generic_profiles\?active\=is.true | jq` / [URL](http://127.0.0.1:3000/generic_profiles?active=is.true)
- and rename the field `code` to `GenericProfileCode`: `curl http://127.0.0.1:3000/generic_profiles\?select\=id,GenericProfileCode:code\&active\=is.true | jq` / [URL](http://127.0.0.1:3000/generic_profiles?select=id,GenericProfileCode:code&active=is.true)

### Output format

- Get the list as JSON: `clear ; curl http://127.0.0.1:3000/workers -H "Accept: application/json"`
- Get the list as CSV: `clear ; curl http://127.0.0.1:3000/workers -H "Accept: text/csv"`
- Get the list as TEXT - Here we need to return only one value: `clear ; curl http://127.0.0.1:3000/workers\?select\=email\&id\=eq.15 -H "Accept: text/plain"`

### Casting

- Get the ID and email of worker `15`: `clear ; curl http://127.0.0.1:3000/workers\?select\=id,email\&id=eq.75 | jq` / [URL](http://127.0.0.1:3000/workers?select=id,email&id=eq.75)
- Cast the ID as string: `clear ; curl http://127.0.0.1:3000/workers\?select\=id::text,email\&id=eq.75 | jq` / [URL](http://127.0.0.1:3000/workers?select=id::text,email&id=eq.75)

## Conclusion

A container, a binary and a `.conf` file, and your database answers HTTP. What I find remarkable isn't the speed of the setup, it's what disappears afterwards: the models, the relationship declarations, the query builder calls — an entire layer whose only job was to describe, in your language, something PostgreSQL already knew.

Oracle has its own equivalent, described in <Link to="/blog/docker-oracle-ords">Transform an Oracle DB as OpenData using Oracle REST Data Services</Link>. And to look at the database behind the API, <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Adminer, pgadmin or phpmyadmin</Link> remains handy.
