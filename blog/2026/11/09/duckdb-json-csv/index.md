---
slug: duckdb-json-csv
title: "DuckDB - Query JSON and CSV Files With SQL, No Database Required"
authors: [christophe, claude]
image: /img/v2/duckdb-json-csv.webp
mainTag: database
tags: [database, docker, linux]
date: 2026-11-09
description: "Run real SQL — joins, window functions, GROUP BY — directly against JSON and CSV files, no import step, no server, no schema to define. Dockerized, with a duckdb shell function that works from any folder. The tool I reach for once awk or jq stop being enough."
language: en
ai_assisted: true
---

![DuckDB - Query JSON and CSV Files With SQL, No Database Required](/img/v2/duckdb-json-csv.webp)

<!-- cspell:ignoreCase duckdb -->

<TLDR>
[DuckDB](https://duckdb.org/) is an embedded analytical database that queries CSV and JSON files directly with SQL — `SELECT * FROM 'file.csv'` just works, no import, no server, no schema to define first. This article sets it up as a Docker image with a `duckdb` shell function loaded by your zsh or bash, the same pattern as [Markitdown](/blog/markitdown) and [Docling](/blog/docling): one command, works from any folder. It's the tool that picks up exactly where `awk` and `jq` stop being enough — the moment a question needs a join, a window function, or a GROUP BY across two different file formats at once.
</TLDR>

I wrote [Pandas — merge two or more files](/blog/python-pandas-merge) a while back for exactly this kind of job, and it works, but it means writing a script: import pandas, read the files, merge, maybe export again. Most of the time what I actually want is one query, run once, answered once. `awk` handles the simple version of that — group-by-and-count, filtering — but the moment I need an actual `JOIN` or a window function, I'm back to writing Python for a question that's genuinely one line of SQL.

<!-- truncate -->

## Demo

<Snippet filename="orders.csv" source="./files/orders.csv" defaultOpen={true} />
<Snippet filename="users.json" source="./files/users.json" defaultOpen={true} />
<Snippet filename="regions.json" source="./files/regions.json" defaultOpen={true} />

<Terminal source="./files/terminal_duckdb.txt" typewriter />

Four genuinely different query shapes, none of which required writing a script: a `GROUP BY`/`SUM` on the CSV, a `WHERE` filter through `read_json_auto` on the JSON, a `RANK() OVER (PARTITION BY ...)` window function, and a `JOIN` between the CSV and a JSON file, in the same query — the kind of question `awk` simply doesn't have a clean answer for.

## What Makes DuckDB Different

DuckDB is a real SQL engine — the syntax, the query planner, the works — except it runs in-process, needs no server, and reads CSV/JSON/Parquet files directly as if they were tables:

```sql
SELECT * FROM 'orders.csv';
SELECT * FROM read_json_auto('users.json');
```

No `CREATE TABLE`, no import step, no schema to define — it infers column types by sampling the file, the same idea as [`jq`](/blog/linux-jq)'s automatic parsing but with full SQL on top instead of a filter language.

## Installation

### Try It in Two Minutes

Click the button below to get a script that creates `/tmp/duckdb-json` with the Dockerfile and the three demo files:

<ProjectSetup folderName="/tmp/duckdb-json" createFolder={true}>
  <Guideline>
    Now, run 'docker build -t duckdb-cli .' to create the Docker image, then
    install the duckdb function as explained below.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />
<Snippet filename="orders.csv" source="./files/orders.csv" defaultOpen={false} />
<Snippet filename="users.json" source="./files/users.json" defaultOpen={false} />
<Snippet filename="regions.json" source="./files/regions.json" defaultOpen={false} />
</ProjectSetup>

There's no apt or pip package for the DuckDB CLI itself (only for the Python bindings), so the Dockerfile downloads the official release binary.

<AlertBox variant="note" title="Version pinned on purpose">
`DUCKDB_VERSION` is a build arg, pinned to `2.0.0` — the version current as of writing. Check the [releases page](https://github.com/duckdb/duckdb/releases) for a newer one and bump the arg; DuckDB ships new versions often enough that pinning explicitly, rather than tracking `latest`, keeps the build reproducible.
</AlertBox>

### Make `duckdb` Available Everywhere

`/tmp/duckdb-json` was only for the demo: it vanishes at the next reboot. What has to stay on your PC is the **Dockerfile**, so the image can be rebuilt any time (new machine, `docker image prune`, a new DuckDB version). Give it a permanent home in `~/tools/duckdb`, and build the image from there:

```bash
mkdir -p ~/tools/duckdb
cp /tmp/duckdb-json/Dockerfile ~/tools/duckdb/
docker build -t duckdb-cli ~/tools/duckdb
```

What turns that image into a command is one function, and it gets its own file in a folder your shell loads at startup, the same organisation as in <Link to="/blog/modular-zsh-workflow">my modular ZSH workflow</Link>: your rc file stays short, and removing the tool is deleting one file.

The code is the same for zsh and bash; only the folder and the loader differ.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Create the file** in `~/.zsh/fns/`:

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="duckdb.zsh" source="./files/duckdb.sh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed one of my <Link to="/series/ollama-daily-use">"Ollama daily use"</Link> articles. Otherwise, add at the end of `~/.zshrc`:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Create the file** in `~/.bash/fns/`:

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="duckdb.sh" source="./files/duckdb.sh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.bashrc`.** Add at the end of `~/.bashrc` (the `-r` test keeps an empty folder from printing an error):

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec bash`).

</TabItem>
</Tabs>

Check that the shell knows the function: `type duckdb` must answer `duckdb is a shell function`. Then go to the demo folder and replay the first query of this article:

```bash
cd /tmp/duckdb-json
duckdb -c "SELECT region, COUNT(*) AS orders, SUM(amount) AS total FROM 'orders.csv' GROUP BY region ORDER BY total DESC"
```

From now on, it works the same in any folder holding a CSV or JSON file. The function mounts the **current folder** as `/workspace`, so paths in your SQL are relative to where you are. That folder is mounted **read-only** unless the first argument is `--write`; `--read-only` on its side locks the container's own filesystem, so nothing can be written inside the image either; a file outside the current folder isn't visible, `cd` to it first. With no argument, `duckdb` opens the interactive SQL shell; with `-c "SQL"`, it runs one query and exits; piped SQL (`cat report.sql | duckdb`) works too.

If the image is missing, the function doesn't fail with a cryptic Docker error, it tells you how to rebuild it from `~/tools/duckdb`:

```text
Error: the Docker image "duckdb-cli" does not exist on this machine.

How to continue:
  1. docker build -t duckdb-cli "${HOME}/tools/duckdb"
  2. Run your duckdb command again.
```

And if `~/tools/duckdb/Dockerfile` is gone too, the message points back to this article to get it again.

<AlertBox variant="caution" title="It shadows a native duckdb">
The function is called `duckdb`, so it takes precedence over a `duckdb` binary installed locally. That's the point here (no local install), but if you install DuckDB natively one day, remove the function or rename it.
</AlertBox>

## Working With `duckdb`

### The Interactive Console

With the function in place, typing `duckdb` with no argument opens an interactive SQL console, the most comfortable place to play with the two statements from [What Makes DuckDB Different](#what-makes-duckdb-different):

<Terminal source="./files/terminal_console.txt" />

Look at the second table: nobody declared anything, yet `birth_date` came back as a `date` and `active` as a `boolean`, inferred from the JSON values themselves. The `memory D` prompt means the session runs on a throw-away in-memory database: a `SELECT` reads your files and changes nothing. `.help` lists the console commands.

<AlertBox variant="tip" title="To leave the console, type .quit">
Console commands start with a **dot**: type `.quit` (or `.exit`, or press <kbd>Ctrl</kbd>+<kbd>D</kbd>) to get back to your shell. A bare `exit` or `quit` does **not** work: DuckDB reads it as the beginning of a SQL statement and silently waits for the rest of it, until a `;` ends it with a syntax error.
</AlertBox>

### UPDATE and DELETE: Read-Only by Default, `--write` When You Mean It

DuckDB runs `UPDATE` and `DELETE` on **tables**, never on a file read directly: `UPDATE 'orders.csv' SET …` is refused with `Can only update base table`, whatever the permissions. Changing a file is therefore always the same three steps: load it into a table, change the table, write it back with `COPY ... TO`.

That last step is a write, and the `duckdb` function refuses it by default: it mounts the current folder **read-only**, so no query can alter your files by accident. Put `--write` first to allow it:

<Terminal source="./files/terminal_write.txt" />

The original `orders.csv` is untouched; `orders_fixed.csv` holds the EMEA amounts with 21% VAT and no APAC rows. Write back to `'orders.csv'` instead and the file itself is rewritten. `COPY ... TO` writes CSV, JSON (`'out.json'`) or Parquet (`'out.parquet'`), picked from the extension. To keep tables between two sessions instead of a throw-away memory database, attach a database file, which is a write too: `duckdb --write`, then `ATTACH 'shop.duckdb' AS shop;`.

## Key Takeaways

<StepsCard
  variant="remember"
  title="duckdb quick reference"
  steps={[
    { content: "**No import step** — `SELECT * FROM 'file.csv'` and `read_json_auto('file.json')` query files directly" },
    { content: "**Real SQL** — joins, window functions, `GROUP BY`, exactly like a full database, no server required" },
    { content: "**No CLI package** — the Dockerfile downloads the official release binary, version-pinned" },
    { content: "**One file in `~/.zsh/fns/` or `~/.bash/fns/`** — `duckdb` works from any folder, and explains how to rebuild when the image is gone" },
    { content: "**Interactive or one-shot** — bare `duckdb` for a REPL, `-c \"SQL\"` for a single query" },
    { content: "**Read-only by default** — `duckdb --write` to save files with `COPY ... TO` or `ATTACH`" },
    { content: "**Complements `ai-data`** — reach for `awk`/`jq` first, DuckDB once the question needs a join or a window function" }
  ]}
/>

## Conclusion

Between [`python-pandas-merge`](/blog/python-pandas-merge) for anything that needs real scripting, `jq`/`awk`/[`ai-data`](/blog/ollama-ai-data) for quick one-liners, and now DuckDB for everything in between that's genuinely a SQL question, I've stopped reaching for "let me write a quick Python script" nearly as often. A `.csv` and a `.json` file, queried and joined together with one line of actual SQL, no server, no import — that's a tool that earns a permanent spot in my `~/.zsh/fns/`.
