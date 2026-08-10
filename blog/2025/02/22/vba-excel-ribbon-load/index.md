---
slug: vba-excel-ribbon-load
title: MS Office - Load dropdown from Excel's range
date: 2025-02-22
description: Load an Excel range into your custom VBA Ribbon dropdown control. This step-by-step tutorial covers the VBA code, Custom UI XML, and named ranges needed for a dynamic solution.
authors: [christophe]
image: /img/v2/ribbon.webp
series: VBA & MS Office automation
mainTag: excel
tags:
  - excel
  - vba
  - vscode
language: en
review_date: 2026-07-30
blueskyRecordKey: 3lwgc3uymnc2i
---
![MS Office - Load dropdown from Excel's range](/img/v2/ribbon.webp)

<TLDR>
Learn how to create a dynamic dropdown menu in a custom Excel ribbon that is populated with values from a worksheet range. This step-by-step guide walks you through the entire process: naming your data range in Excel, defining the custom ribbon layout with XML using the Custom UI Editor, and writing the necessary VBA callback functions to load the items, handle selections, and write the chosen value back to a specific cell. This technique allows for flexible and user-friendly interfaces in your VBA projects.
</TLDR>

In this article, we'll see how, very easily, we can load an Excel range into a ribbon and display it inside a dropdown. *If you've never built a custom ribbon before, start with <Link to="/blog/vba-excel-ribbon">MS Office - How to create a ribbon in Excel</Link>.*

The idea is to provide a list of values in a ribbon but to not have to hardcode values in the list but, just, to link to a range, anywhere in your workbook.

I've used this technique in many of my Excel applications (i.e. Excel files having VBA code).

For this blog post, we'll create a list of periods (YYYYMM) in a worksheet and load that list in our custom ribbon.

In this way, we could offer a nicer user experience by proposing a list and executing, for example, <Link to="/blog/vba-excel-sql-server-part-2">a query to a database</Link> to obtain the data for this period (or anything else).

<!-- truncate -->

Here's the result: the dropdown loaded straight from the worksheet range, and the selected value written back into a cell.

![Demo](./images/demo.webp)

## Why It Works

- The dropdown's items come from a **named range** (`_rngParamsPeriod`), not hardcoded values in the XML — update the range in the sheet and the ribbon list updates with it.
- A VBA callback (`getItemCount`, wired in the ribbon's XML) does the reading; selecting a value in the ribbon writes it straight into a named cell (`_Period`) elsewhere in the workbook.

## Let's play

First, create an empty workbook. Create then a new sheet called f.i. `Params` with a list of values. For this article, let's create a list of periods:

![The range](./images/range.webp)

Nothing difficult right now. To be flexible, please select the range and name it: `_rngParamsPeriod`. This is much better than hardcoding a range like `$A$2:$A$14`, isn't it?

The second thing to do is to foresee a cell in your sheet where the selected value will be written i.e. when the user selects a value from the list, we'll ask Excel to put the selected value there. To do this, just click on the cell where you wish to see the selected period and name that cell `_Period`. On the image below, I'll select cell `$C$2` on the same sheet but it can be elsewhere.

![The period range](./images/selected_period.webp)

Time to save your Excel file for the first time, let's say in `c:\temp\ribbon.xlsx`, then close the workbook.

## Adding a ribbon

Time to add our ribbon. To do this, just download this free tool: [https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm](https://bettersolutions.com/vba/ribbon/custom-ui-editor-download.htm). You'll find an executable called `CustomUIEditor.exe`. Double-click on it to start the editor then open your `c:\temp\ribbon.xlsx` file:

![Custom UI editor](./images/editor.webp)

Click on the Insert menu then select `Office 2010 Custom UI Part`.

Paste the XML below in the editor window:

<Snippet filename="customui.xml" source="./files/customui.xml" />

You'll then have this:

![Custom UI editor](./images/xml.webp)

Save your changes and quit the editor.

## Time to add our VBA code

From your explorer, double-click on your `c:\temp\ribbon.xlsx` file to start Excel and open the workbook again.

You'll get an error message and it's perfectly normal: we still need to add some VBA code so just press on **Ok**.

![Error](./images/missing_code.webp)

<AlertBox variant="info">
In our ribbon, we wrote, among other things, the following: `getItemCount="modToolbar_cbxPeriod.getItemCount"`. So, Excel is trying to run a function called `getItemCount` from a module called `modToolbar_cbxPeriod` and ... we don't have it yet.

</AlertBox>

Press <kbd>ALT</kbd>-<kbd>F11</kbd> to open the VBE editor

As illustrated below, right-click on the `VBEProject` project and insert a new module.

![Inserting a new module](./images/insert_module.webp)

This done, click on the added module and bottom left, you can give it a name, f.i. `modToolbar_cbxPeriod`.

In the right, main, part of the screen, please paste this code:

<Snippet filename="module.bas" source="./files/module.bas" />

We're almost done: we need to give a name to the sheet where the range is located. If you still remember the beginning of this blog post, we've added the range in a sheet called `Params` so, now in the VBE editor, just select the `Params` sheet as illustrated below (see 1.) and name the sheet `shParams` (see 2).

![Naming the sheet](./images/shParams.webp)

<AlertBox variant="caution" title="You should now use the .xlsm extension">
Save the Excel workbook but, this time, with the `.xlsm` extension since the workbook contains VBA code.

</AlertBox>

Time to test our feature: close the workbook and re-open it again and, this time, your list has been populated and by selecting a value from the list, the value will be injected in your worksheet; ready to be used — the same result already shown at the top of this article.

## Conclusion

A named range, a bit of Custom UI XML and one VBA callback module: that's the whole recipe for a ribbon dropdown that never needs its values hardcoded again — update the range, and every workbook using this ribbon follows. <Link to="/blog/vba-excel-ribbon">Want to keep playing with ribbons? Check out my other articles on the subject.</Link>
