---
slug: vba-excel-list-references
title: MS Excel - Get the list of references used in your modules
date: 2025-10-27
description: VBA developer? Stop manually checking references! Use this VBS script to automatically retrieve a list of all VBA references in multiple Excel .xlsm or .xlam files.
authors: [christophe]
image: /img/v2/excel.webp
mainTag: excel
tags: [excel, vba]
language: en
blueskyRecordKey: 3m45z7onhnc2o
---
![MS Excel - Get the list of references used in your modules](/img/v2/vba_export_xlsm.webp)

<TLDR>
This article presents a VBS script that automates the process of retrieving VBA references from multiple Excel `.xlsm` or `.xlam` files. Instead of manually checking each workbook, developers can run a simple `run.vbs` script in a target folder. The script will then open the files, disable macros, and output a list of all references found.
</TLDR>


So you're a VBA developer and you've created a lot of Excel `.xlsm` (or `.xlam`) workbooks i.e. files having VBA modules in it.

How can you retrieve the list of references used by any of your files? For sure you can open the workbook, open the VBE editor, click on the `Tools` menu then `References` to get the dialog window with the list of references. Yes, you can.

Or you can use my [https://github.com/cavo789/vbs_xls_list_references](https://github.com/cavo789/vbs_xls_list_references) script to automate this.

<!-- truncate -->

Locate a folder on your hard disk where you've one or more `.xlam` or `.xlsm` files.

Simply create there a file called `run.vbs` on your hard disk and copy/paste the source below in it:

<Snippet filename="run.vbs" source="./files/run.vbs" />

Now, start a DOS or Powershell console, go to that folder and run `cscript run.vbs`.

That's all. The script will retrieve any `.xlam` or `.xlsm` files and do automation to open Excel, open the file (by disabling the execution of macros) and retrieve the list of references.

The output you'll get will be something like this:

<Terminal>
Processing files in C:\Christophe

Get the list of references used in C:\Christophe\Application.xlsm

    Name My_AddIn
    Full Path: C:\Christophe\My_Addin\My_AddIn.xlam

    Name A_Second_AddIn
    Full Path: C:\Christophe\A_Second_AddIn\A_Second_AddIn.xlam

Get the list of references used in C:\Christophe\Invoices.xlam

    Name My_AddIn
    Full Path: C:\Christophe\My_Addin\My_AddIn.xlam
</Terminal>