---
slug: vbs-auto-update
title: VBS - Auto update script
authors: [christophe]
image: /img/vbs_tips_social_media.jpg
mainTag: github
tags: [dos, Github, vbs]
enableComments: true
---
![VBS - Auto update script](/img/vbs_tips_banner.jpg)

Before switching to [WSL2](/blog/tags/wsl) and the Linux console, I wrote VBS scripts from time to time. It looks like VBA but for the DOS console.

A VBS script for DOS is a text file written in the Visual Basic Scripting Edition (VBScript) programming language that can be executed directly from the DOS command prompt. It allows you to automate tasks and perform repetitive operations on your computer.

It's just like [Linux Bash](/blog/tags/bash) scripts but for the DOS.

Do you think it would be possible to offer an auto-update function in such scripts? The answer is yes.

<!-- truncate -->

Imagine a script called `get_folder_size.vbs` you've publicly saved on Github (source [here](https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs)).

Someone download it his computer and enjoy using it.

By adding to it a new *auto-update* function, each time the script will be started, first, a connection to Github will be made, download the script from there and a check will be made if the downloaded version is different and, if so, the script will be overridden.

Here is the content of such function:

<Snippets filename="get_folder_size.vbs">

```vbs
' -----------------------------------------------------------------
'
' Connect to GitHub, get the raw version of a file and download it
'
' The script will check for newer version on GitHub and if
' there is one, the script will overwrite himself with
' that newer version.
'
' Based on a script of
' @author Michi Lehenauer §https://github.com/michiil)
' then modified by Christophe Avonture
'
' @src https://github.com/michiil/vbs_scrips/blob/master/WZV-Excel.vbs
' -----------------------------------------------------------------

' The content to download
url = "https://raw.githubusercontent.com/cavo789/vbs_utilities/master/src/folders/get_folder_size/get_folder_size.vbs"

Set req = CreateObject("Msxml2.ServerXMLHttp.6.0")

req.setTimeouts 500, 500, 500, 500

' If you're behind a firewall, uncomment the following line
' and mention the proxy address and port
'req.setProxy 2, "your.proxy.net:8080", ""

req.open "GET", url, False
req.send

If Err.Number = 0 Then
  If req.Status = 200 Then
    ' Get the content, just downloaded
    downloadedContent = req.responseText

    ' Get the original content, this script

    scriptName = wScript.ScriptFullName
    Set objFSO = CreateObject("Scripting.FileSystemObject")
    Set textFile = objFSO.OpenTextFile(scriptName, 1)
    originalContent = textFile.ReadAll
    textFile.Close

    ' Compare if the two contents are different
    If (originalContent <> downloadedContent) Then
      ' If yes, for instance, rewrite this script by
      ' the new content ==> auto-update
      Set textFile = objFSO.OpenTextFile(scriptName, 2)

      textFile.Write (downloadedContent)
      textFile.Close

      'wScript.echo scriptName & " has been updated"
    End If

    Set textFile = Nothing
    Set objFSO = Nothing

  End If
Else
    ' Ok, in case of error, don't panic, just do nothing
    Err.Clear
End If
```

</Snippets>