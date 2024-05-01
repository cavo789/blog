---
slug: joomla-show-table
title: Joomla - Run a SQL statement outside Joomla and display a nice HTML table
authors: [christophe]
image: /img/excel_tips_social_media.jpg
tags: [database, joomla, tips]
enableComments: true
draft: true
---
<!-- cspell:ignore showtable -->
![Joomla - Run a SQL statement outside Joomla and display a nice HTML table](/img/excel_tips_header.jpg)

A long time ago, years from now, I needed to expose data from my Joomla site in a simple web page, a silly HTML table. This was so that I could link an Excel file to this table and therefore, in Excel, do a ‘Refresh’ to obtain the most recent data from my Joomla site.

The aim was to find the list of people who had bought software or services from me. Among other things, I needed their surname, first name, address, etc. so that I could create an invoice in Word using mail merge.

Oh, wait, so a web page that would execute a SQL query of the type `SELECT ... FROM ...` to the Joomla database, retrieve the records then display them in an HTML page and link an Excel file to this page and then Word to the Excel workbook. Cool, isn't it?

<!-- truncate -->

You can find all the information on my repo at [https://github.com/cavo789/joomla_show_table](https://github.com/cavo789/joomla_show_table); compatible up to Joomla 5.1.

The only thing you need to do is to download a copy of the `showtable.php` script and put that script in the root folder of your Joomla site.

This done, edit the script and

1. Locate the definition of the SQL statement to run ([see here](https://github.com/cavo789/joomla_show_table/blob/master/src/showtable.php#L72-L79)) and put yours and
2. Update the password to a custom one ([see here](https://github.com/cavo789/joomla_show_table/blob/master/src/showtable.php#L131)).

Save the file and access it using your browser.

If the SQL is correct, you'll get a nice HTML table using the [DataTables framework](https://datatables.net/). You'll have sorting, filtering, navigation options and much more.

If you plan to synchronize the list with Excel; please read this section of the readme file: [Run it](https://github.com/cavo789/joomla_show_table/tree/master?tab=readme-ov-file#run-it).