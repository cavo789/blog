---
slug: vba-excel-list-references
title: MS Excel - Get the list of references used in your modules
authors: [christophe]
image: /img/excel_tips_social_media.jpg
mainTag: excel
tags: [excel, vba]
enableComments: true
draft: true
---
![MS Excel - Get the list of references used in your modules](/img/excel_tips_banner.jpg)

So you're a VBA developer and you've created a lot of Excel `.xlsm` workbooks i.e. files having VBA modules in it.

How can you retrieve the list of references used by any of your files? For sure you can open the workbook, open the VBE editor, click on the `Tools` menu then `References` to get the dialog window with the list of references. Yes, you can.

Or you can use my [https://github.com/cavo789/vbs_xls_list_references](https://github.com/cavo789/vbs_xls_list_references) script to automate this.

<!-- truncate -->

Simply get the `run.vbs` script from [https://github.com/cavo789/vbs_xls_list_references](https://github.com/cavo789/vbs_xls_list_references) and save it on your disk.

Save that file in a folder where you've `.xlam` or `.xlsm` files.

Start a DOS console, go to that folder and run `cscript run.vbs`.

That's all. The script will retrieve any `.xlam` or `.xlsm` files and do automation to open Excel, open the file (by disabling the execution of macros) and retrieve the list of references.

The output you'll get will be something like this:

```text
Processing files in C:\Christophe

Get the list of references used in C:\Christophe\Application.xlsm

    Name My_AddIn
    Full Path: C:\Christophe\My_Addin\My_AddIn.xlam

    Name A_Second_AddIn
    Full Path: C:\Christophe\A_Second_AddIn\A_Second_AddIn.xlam

Get the list of references used in C:\Christophe\Invoices.xlam

    Name My_AddIn
    Full Path: C:\Christophe\My_Addin\My_AddIn.xlam
```
