---
slug: sql-formatter
title: SQL - Formatting tool
authors: [christophe]
image: ./images/sql_formatter_social_media.jpg
tags: [code quality, sql, tips, tool]
enableComments: true
---
![SQL - Formatting tool](./images/sql_formatter_banner.jpg)

When faced with legacy code, it is often useful to reformat it to make it readable.  And from there, the study of the code can begin.

There are plenty of reformatting tools for json, php, javascript and other languages, but far fewer for a query written in SQL.

Just copy/paste `SELECT LAT_N, CITY, TEMP_F FROM STATS, STATION WHERE MONTH = 7 AND STATS.ID = STATION.ID ORDER BY TEMP_F` in the tool and get 

```sql
SELECT
    LAT_N,
    CITY,
    TEMP_F
FROM
    STATS,
    STATION
WHERE
    MONTH = 7
    AND STATS.ID = STATION.ID
ORDER BY
    TEMP_F
```

<!-- truncate -->

Retrieve my **SQL Formatter** tool and sources on [https://github.com/cavo789/sql_formatter](https://github.com/cavo789/sql_formatter).

The tool is accessible online: [https://sql-formatter.avonture.be/](https://sql-formatter.avonture.be/)

![Demo](./images/sql_formatter_demo.gif)