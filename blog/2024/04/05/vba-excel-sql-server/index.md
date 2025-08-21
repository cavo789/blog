---
slug: vba-excel-sql-server
title: MS Excel - Connect to a SQL Server database, run a query and get the results
authors: [christophe]
image: /img/excel_tips_social_media.jpg
series: MS Excel - Connect to a SQL Server database
mainTag: excel
tags: [excel, ribbon, mssql-server, vba]
blueSkyRecordKey: 3lvnkbm63nc2v
enableComments: true
---
![MS Excel - Connect to a SQL Server database, run a query and get the results](/img/excel_tips_banner.jpg)

:::info
Please read my new article [MS Excel - Connect to a SQL Server database, run a query and get the results - Step by step](/blog/vba-excel-sql-server-part-2) which is more complete than this one.
:::

Imagine you can execute a query like `SELECT customer_id, first_name, last_name, email FROM customers ORDER BY last_name ASC;` in your Excel sheet and that Excel will connect your Microsoft SQL Server database, run the query there, get the result and put the data directly in your sheet. Would be nice, no?

Imagine your sheet has already a nice layout with colors, titles having filters enabled and f.i. has a name (like `rngMyCustomers`). It would be nice if the updated data still keep all the layouts and just extends the name; no?

Stop imagining, it's just so easy!

<!-- truncate -->

Years ago, I've published [https://github.com/cavo789/vba_excel_sql](https://github.com/cavo789/vba_excel_sql) for this.

You'll retrieved in my GitHub repository all the explanations to do this i.e. a VBA code to add in your Excel file ([quick access](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/clsData.cls)) and a [demo](https://github.com/cavo789/vba_excel_sql/blob/master/src/SQL2Excel.xlsm/test.bas).

This time, I won't rewrite the whole explanation in the form of a post because everything is already listed on GitHub; please follow this link: [https://github.com/cavo789/vba_excel_sql](https://github.com/cavo789/vba_excel_sql)

:::info AddQueryTable or CopyToSheet
You'll see there are two methods: `AddQueryTable` and `CopyToSheet`. With the first one, data will be injected into your Excel sheet as a *query table* and this gives immense powers like the requery one. In other words, the next time, you just need to right-click on your table and from the contextual menu, chose `Refresh` and hop, the query is executed back on SQL Server and you'll get the update in a matter of seconds.

With `CopyToSheet`, you'll lose the connectivity: it'll be safe to send the sheet to someone else. The credentials needed to connect to the server won't be kept in the sheet contrary to the `AddQueryTable` feature.
:::
