---
slug: miller-csv-cli
title: "Miller: awk That Finally Knows Your Column Names"
authors: [christophe, claude]
image: /img/v2/csv.webp
mainTag: linux
tags: [linux, bash, docker]
date: 2026-11-07
description: "Miller (mlr) filters, sorts, aggregates and converts CSV, TSV and JSON by column name, in one readable line. Compare it with awk and try it in a throwaway Docker container."
series: Modern CLI tools for your terminal
ai_assisted: true
draft: true
---

![Miller: awk That Finally Knows Your Column Names](/img/v2/csv.webp)

<TLDR>
`awk` can process a CSV, but you have to count columns, skip the header and hope that nobody ever reorders the file. Miller (`mlr`) works with column names, so that a total per region fits in one line that you can still read next week. It also sorts, filters, joins and converts between CSV, TSV and JSON, and you can try it right away in a disposable container.
</TLDR>

Somebody sends you a CSV export and asks a simple question: "What's the total per region?" Opening a spreadsheet feels like too much, so you start with `awk`. Which column was the region again? The third? And the amount? And don't forget to skip the header… Then, next month, the export has one more column, and your one-liner silently returns nonsense.

By the end of this article, you will ask that question by name, and get a clean table back.

<!-- truncate -->

## Seeing It in Action with Docker

*Already know Miller? [Skip to installing it](#install-it--or-keep-using-docker) — this chapter is only a throwaway container to try it risk-free.*

Here is the same question, asked twice about the same file. First `awk`, then Miller:

<Terminal>
{`$ awk -F, 'NR>1 {t[$3]+=$5; n[$3]++} END {for (r in t) print r, t[r], n[r]}' orders.csv
Asia 328.9 2
Europe 452.4 4
America 288.5 2

$ mlr --icsv --opprint stats1 -a sum,count -f amount -g region orders.csv
region  amount_sum amount_count
Europe  452.4      4
Asia    328.9      2
America 288.5      2`}
</Terminal>

Same numbers, but one of the two commands can be read aloud: *statistics, sum and count, of `amount`, grouped by `region`*. The result even has headers, and it still works if somebody moves a column. To follow along, this image has Miller, `jq` and the sample files:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, then:

<Terminal>
$ docker build -t miller-demo .
$ docker run --rm -it miller-demo
</Terminal>

## Why It Reads So Well

- Miller treats each line as a record with named fields, like a JSON object, so you always refer to `amount` and never to `$5`.
- It has separate options for the input and output formats, which is why converting a file is simply a matter of asking for another output.
- It processes the file as a stream when it can, and chains operations with `then`, like a Unix pipe inside one command.

## From the Simplest Command to the Most Useful

Let's start by simply reading the file. `--icsv` is the input format and `--opprint` an aligned output for your eyes:

<Terminal>
{`$ mlr --icsv --opprint cat orders.csv
id   date       region  product  amount
1001 2026-10-01 Europe  Keyboard 89.90
1002 2026-10-01 Asia    Monitor  249.00
...`}
</Terminal>

Which orders are above 100, biggest first? Chain a `filter` and a `sort` with `then`:

<Terminal>
{`$ mlr --icsv --opprint filter '$amount > 100' then sort -nr amount orders.csv
id   date       region  product amount
1007 2026-10-05 America Monitor 259.00
1002 2026-10-01 Asia    Monitor 249.00
1003 2026-10-02 Europe  Monitor 239.00`}
</Terminal>

Need a calculated column? `put` adds it, and `cut` keeps only what you want to see:

<Terminal>
{`$ mlr --icsv --opprint put '$vat = fmtnum($amount * 0.21, "%.2f")' then cut -f id,amount,vat then head -n 2 orders.csv
id   amount vat
1001 89.90  18.88
1002 249.00 52.29`}
</Terminal>

Your colleague wants JSON, not CSV? Only the output option changes:

<Terminal>
{`$ mlr --icsv --ojson head -n 1 orders.csv
[
{
  "id": 1001,
  "date": "2026-10-01",
  "region": "Europe",
  "product": "Keyboard",
  "amount": 89.90
}
]`}
</Terminal>

So Miller also serves as a bridge to the rest of your toolbox. Here is a CSV becoming a list of products with <Link to="/blog/linux-jq">`jq`</Link>:

<Terminal>
{`$ mlr --icsv --ojson filter '$region == "Asia"' orders.csv | jq -r '.[].product'
Monitor
Keyboard`}
</Terminal>

And finally, the one that usually sends people to a database: a second file contains the manager of each region. `join` brings them together, then you total per manager:

<Terminal wrap={true}>
{`$ mlr --icsv --opprint join -j region -f managers.csv then stats1 -a sum -f amount -g manager orders.csv
manager amount_sum
Alice   452.4
Bob     328.9
Carol   288.5`}
</Terminal>

## Install It — or Keep Using Docker

No need to install anything for an occasional file. The image you've built works on your own folder too, if you mount it over the demo:

<Terminal wrap={true}>
$ docker run --rm -v "$PWD":/demo miller-demo mlr --icsv --opprint cat my-file.csv
</Terminal>

If it becomes a daily tool, it's also available from package managers:

<Terminal>
{`$ brew install miller       # macOS and Linux
$ sudo apt install miller   # Debian and Ubuntu`}
</Terminal>

Distribution packages may be behind the latest version, but every command in this article works with the version in the Docker image above.

## A Short Reference

| You want to | Command |
| --- | --- |
| Convert CSV to JSON | `mlr --icsv --ojson cat file.csv` |
| Convert CSV to TSV | `mlr --c2t cat file.csv` |
| Keep some columns | `mlr --csv cut -f id,amount file.csv` |
| Sort by a number, descending | `mlr --csv sort -nr amount file.csv` |
| Modify the file in place | `mlr -I --csv put '$x = 1' file.csv` |

Miller is the tabular member of the family, with <Link to="/blog/linux-yq">`yq`</Link> for YAML and <Link to="/blog/linux-xmlstarlet">`xmlstarlet`</Link> for XML. As long as your question fits in a pipeline, it's the shortest answer. Once you need several joins, window functions or real SQL, it's time to move to a database engine.

## Conclusion

At the beginning of this article, a simple total per region meant counting columns and hoping that the file wouldn't change. With Miller, you ask for what you want by name, and the command still makes sense next month. I still use `awk` for quick text work, but for anything with a header row, I now reach for `mlr` first. Take the last CSV somebody sent you, and try one `stats1` on it: that one line will sell it better than I can.
