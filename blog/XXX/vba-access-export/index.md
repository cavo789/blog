---
slug: vba-access-export
title: Export MS Access objects
authors: [christophe]
image: /img/database_tips_social_media.jpg
tags: [database, msaccess, vba, vbs]
enableComments: true
drafts: true
---
![Export MS Access objects](/img/database_tips_banner.jpg)

A long time ago, in a previous life, I developed a lot of MS Access databases and unlike modern tools, it wasn't possible to version the code (modules, macros, queries, etc.) in a tool like Github.

These objects are an integral part of the database in the same way as the tables and their data. If you want to version them, you must first extract them.

Let's look at how to do this.

<!-- truncate -->

## Description

My [https://github.com/cavo789/vbs_access_export](https://github.com/cavo789/vbs_access_export) vbs script will export all code objects (forms, macros, modules, queries and reports) from a MS Access database / application (can be `.accdb` or `.mdb`) to flat files on your disk.

This way, you'll get a quick backup of your code and you'll be able to synchronize your code on a versioning platform like GitHub.

The script will start MS Access (hidden way), open the specified database, process every code object and export them, one by one, in a `\src\your_database.mdb` folder.

The src folder will be automatically created if needed and you'll find a subfolder having the same name of your file (so you can have more than one exported file in the same src folder).

## Install

Just get a copy of the [https://github.com/cavo789/vbs_access_export](https://github.com/cavo789/vbs_access_export) `.vbs` script, perhaps the `.cmd` too (for your easiness) and save them in the same folder of your database.

## Usage

Just edit the `.cmd` file and you'll see how it works: you just need to run the `.vbs` with one parameter, the name of your database.

## Sample

For instance, by running `cscript vbs_access_export.vbs C:\Christophe\db1.mdb` in a DOS console, you'll get this:

```text
Process database C:\Christophe\db1.mdb

Exporting sources to C:\Christophe\src\db1.mdb\

Export all forms
        Export form 1/2 - frmCustomers to Forms\frmCustomers.frm
        Export form 2/2 - frmInvoices to Forms\frmInvoices.frm

Export all macros
        Export macro 1/15 - mcrPrint to Macros\mcrPrint.txt
        [...]

Export all modules
        Export module 1/2 - Helper to Modules\Helper.bas
        Export module 2/2 - SQL_Server to Modules\SQL_Server.bas

Export all queries
        Export query 1/23 - qryCustomers to Queries\qryCustomers.sql
        Export query 2/23 - qryInvoices to Queries\qryInvoices.sql
        [...]

Export all reports
        Export report 1/8 - Invoice to Reports\Invoice.txt
        [...]
```

Once finished, you'll have a subfolder called src with one file by object so, indirectly, you've a backup of your code 👌.
