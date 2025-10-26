---
slug: vbs-files-csv
title: VBS - Get list of files and generate a CSV
date: 2024-11-28
description: Need a file list in CSV format? Use this VBScript to scan a folder, including sub-folders, and output file details like size, date, and owner for easy analysis.
authors: [christophe]
image: /img/v2/vbs.webp
mainTag: vbs
tags: [dos, vbs]
language: en
---
![VBS - Get list of files and generate a CSV](/img/v2/vbs.webp)

Six years ago, I needed a DOS script that would allow me to find the list of every file in a folder on a Windows machine and generate a `.csv` file with that list.

Once the `.csv` file had been generated, I could then process it in MS Excel, for example, and sort/filter it or, why not, in Python using the Pandas library.

<!-- truncate -->

To run this script, first copy/paste the source below and save it to a file, let's say `c:\files2csv.vbs`. Start a DOS console, run `cd c:\` then `cscript files2csv.vbs`. When the job has been done, you'll get the listing in `files2csv.csv`.

<Snippet filename="files2csv.vbs" source="./files/files2csv.vbs" />

The output file will be something like this:

```csv
"FilePathAndName";"ParentFolder";"Name";"DateCreated";"DateLastAccessed";"DateLastModified";"Size";"Type";"Suffix";"Owner";
"C:\temp\test\test.csv";"C:\temp\test";"test.csv";"21-01-24 09:07:44";"21-01-24 09:09:08";"21-01-24 09:09:08";"472";"CSV Microsoft Excel File";"csv";"Christophe";
"C:\temp\test\test.vbs";"C:\temp\test";"test.vbs";"21-01-24 08:43:49";"21-01-24 09:09:03";"21-01-24 09:09:03";"3246";"VBScript File";"vbs";"Christophe";
```

<AlertBox variant="info" title="Did you need tab delimited?">
If so, just make a search & replace to change `";"` to `vbTab` everywhere.

</AlertBox>