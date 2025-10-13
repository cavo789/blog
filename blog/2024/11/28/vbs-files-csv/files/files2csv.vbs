'------------------------------------------------------------
'
' Get the list of files of the current folder + sub-folders and
' generate a .csv file with file information like path, size,
' extensions, author, ... making then easy to work with that list
' in Excel
'
' Based on a script of
' @author Peter Pinchao Liu (https://github.com/lpcclown)
' then modified by Christophe Avonture
'
' @Link : https://github.com/lpcclown/fileScan
'
'------------------------------------------------------------

Option Explicit

Dim objFSO, objCSVFile

' ------------------------------------
' Loop all file under one folder
' ------------------------------------
Function FilesTree(sPath)

Dim objFolder, objSubFolders, objSubFolder, objFiles, objFile
Dim objShell
Dim strFileName

  Set objFolder = objFSO.GetFolder(sPath)
  Set objSubFolders = objFolder.SubFolders
  Set objFiles = objFolder.Files

  For Each objFile In objFiles
    objCSVFile.Write chr(34) & objFile.Path & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.ParentFolder & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.Name & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.DateCreated & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.DateLastAccessed & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.DateLastModified & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.Size & chr(34) & ";"
    objCSVFile.Write chr(34) & objFile.Type & chr(34) & ";"
    objCSVFile.Write chr(34) & objFSO.getextensionname(objFile.Path) & chr(34) & ";"

    ' Get file owner
    Set objShell = CreateObject ("Shell.Application")
    Set objFolder = objShell.Namespace (sPath)

    For Each strFileName in objFolder.Items
      if objFolder.GetDetailsOf (strFileName, 0) = objFile.Name Then
        objCSVFile.Write chr(34) & objFolder.GetDetailsOf (strFileName, 10) & chr(34) & ";"
      End If
    Next

    objCSVFile.Writeline

  Next

  For Each objSubFolder In objSubFolders
    FilesTree(objSubFolder.Path) ' Recursion
  Next

  Set objFiles = Nothing
  Set objSubFolders = Nothing
  Set objFolder = Nothing

End Function

Dim sResultFileName, sFolderName
Dim wshShell

Const ForWriting = 2

  ' Create new CSV file : same name of this script but with
  ' .csv extension
  sResultFileName = wScript.ScriptFullName
  sResultFileName = replace(sResultFileName, ".vbs", ".csv")

  Set objFSO = CreateObject("Scripting.FileSystemObject")
  Set objCSVFile = objFSO.CreateTextFile(sResultFileName, ForWriting, True)

  ' Write comma delimited list of columns in new CSV file.
  objCSVFile.Write chr(34) & "FilePathAndName" & chr(34) & ";" & _
  chr(34) & "ParentFolder" & chr(34) & ";" & _
  chr(34) & "Name" & chr(34) & ";" & _
  chr(34) & "DateCreated" & chr(34) & ";" & _
  chr(34) & "DateLastAccessed" & chr(34) & ";" & _
  chr(34) & "DateLastModified" & chr(34) & ";" & _
  chr(34) & "Size" & chr(34) & ";" & _
  chr(34) & "Type" & chr(34) & ";" & _
  chr(34) & "Suffix" & chr(34) & ";" & _
  chr(34) & "Owner" & chr(34) & ";"

  objCSVFile.Writeline

  Set wshShell = CreateObject("WScript.Shell")
  sFolderName = wshShell.CurrentDirectory
  Set wshShell = Nothing

  wScript.echo "Scan the " & sFolderName & ", please wait..."
  wScript.echo ""

  FilesTree(sFolderName)

  wScript.echo "Done, file " & sResultFileName & " has been created"
