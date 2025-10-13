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
