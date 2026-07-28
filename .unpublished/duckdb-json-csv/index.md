---
slug: duckdb-json-csv
title: "DuckDB - Query JSON and CSV Files With SQL, No Database Required"
authors: [christophe, claude]
image: /img/v2/database_admin.webp
mainTag: python
tags: [python, docker, database]
date: 2026-12-31
description: "Run real SQL — joins, window functions, GROUP BY — directly against JSON and CSV files, no import step, no server, no schema to define. Dockerized, with a global duckdb-query wrapper. The tool I reach for once awk or jq stop being enough."
language: en
ai_assisted: true
draft: true
---

![DuckDB - Query JSON and CSV Files With SQL, No Database Required](/img/v2/database_admin.webp)

<!-- cspell:ignoreCase duckdb -->

<TLDR>
[DuckDB](https://duckdb.org/) is an embedded analytical database that queries CSV and JSON files directly with SQL — `SELECT * FROM 'file.csv'` just works, no import, no server, no schema to define first. This article sets it up as a Docker image with a global `duckdb-query` wrapper, the same pattern as [Markitdown](/blog/markitdown) and [Docling](/blog/docling): one command, works from any folder. It's the tool that picks up exactly where `awk` and `jq` stop being enough — the moment a question needs a join, a window function, or a GROUP BY across two different file formats at once.
</TLDR>

I wrote [Pandas — merge two or more files](/blog/python-pandas-merge) a while back for exactly this kind of job, and it works, but it means writing a script: import pandas, read the files, merge, maybe export again. Most of the time what I actually want is one query, run once, answered once. `awk` handles the simple version of that — group-by-and-count, filtering — but the moment I need an actual `JOIN` or a window function, I'm back to writing Python for a question that's genuinely one line of SQL.

<!-- truncate -->

## What Makes DuckDB Different

DuckDB is a real SQL engine — the syntax, the query planner, the works — except it runs in-process, needs no server, and reads CSV/JSON/Parquet files directly as if they were tables:

```sql
SELECT * FROM 'orders.csv';
SELECT * FROM read_json_auto('users.json');
```

No `CREATE TABLE`, no import step, no schema to define — it infers column types by sampling the file, the same idea as `jq`'s automatic parsing but with full SQL on top instead of a filter language.

## Building the Docker Image

There's no apt or pip package for the interactive shell itself — only for the Python bindings — so the Dockerfile pulls the official CLI release directly:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="note" title="Version pinned on purpose">
`DUCKDB_VERSION` is a build arg, pinned to `1.5.5` — the version current as of writing. Check the [releases page](https://github.com/duckdb/duckdb/releases) for a newer one and bump the arg; DuckDB ships new versions often enough that pinning explicitly, rather than tracking `latest`, keeps the build reproducible.
</AlertBox>

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

`stdin_open` and `tty` are set to `true` this time — unlike Markitdown or Docling, DuckDB's CLI is an interactive REPL by default, and the container needs a real terminal attached to support that.

Build it with `docker compose build`.

## The Global Wrapper

<Snippet filename="/usr/local/bin/duckdb-query" source="./files/duckdb-query.sh" />

Make it executable: `sudo chmod +x /usr/local/bin/duckdb-query`. Called with `-c "SQL"`, it runs one query and exits; called with no arguments, it drops into the interactive shell, tables and all.

## Demo

<Snippet filename="orders.csv" source="./files/orders.csv" defaultOpen={false} />
<Snippet filename="users.json" source="./files/users.json" defaultOpen={false} />

<Terminal source="./files/terminal_duckdb.txt" typewriter />

Three genuinely different query shapes on two different file formats, none of which required writing a script: a `GROUP BY`/`SUM` on the CSV, a `WHERE` filter through `read_json_auto` on the JSON, and a `RANK() OVER (PARTITION BY ...)` window function — the kind of query `awk` simply doesn't have a clean answer for.

<AlertBox variant="tip" title="Same spirit as ai-data, one level up">
If you've read [`ai-data`](/blog/ollama-ai-data) from the Ollama series: think of DuckDB as what you reach for once the question stops being a one-liner. `jq`/`awk` still win for quick filters and simple counts; the moment it's a join, a window function, or "group by this, order by that, limit 10", DuckDB answers it in one query instead of a script.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="duckdb-query quick reference"
  steps={[
    { content: "**No import step** — `SELECT * FROM 'file.csv'` and `read_json_auto('file.json')` query files directly" },
    { content: "**Real SQL** — joins, window functions, `GROUP BY`, exactly like a full database, no server required" },
    { content: "**No CLI package** — the Dockerfile downloads the official release binary, version-pinned" },
    { content: "**Interactive or one-shot** — bare `duckdb-query` for a REPL, `-c \"SQL\"` for a single query" },
    { content: "**Complements `ai-data`** — reach for `awk`/`jq` first, DuckDB once the question needs a join or a window function" }
  ]}
/>

## Conclusion

Between [`python-pandas-merge`](/blog/python-pandas-merge) for anything that needs real scripting, `jq`/`awk`/[`ai-data`](/blog/ollama-ai-data) for quick one-liners, and now DuckDB for everything in between that's genuinely a SQL question, I've stopped reaching for "let me write a quick Python script" nearly as often. A `.csv` and a `.json` file, queried and joined together with one line of actual SQL, no server, no import — that's a tool that earns a permanent spot in `/usr/local/bin`.
