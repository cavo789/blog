
' -----------------------------------------------------------------
' Author: Christophe AVONTURE
' Date	: January 2019
'
' Retrieve the list of references used in an Excel file
' (.xlam files f.i.) and display them on the console.
' Loop and process all Excel files in the current folder

' @src https://github.com/cavo789/vbs_xls_list_references
' -----------------------------------------------------------------

Option Explicit

Class clsMSExcel

    Private oApplication
    Private sFileName
    Private bVerbose, bEnableEvents, bDisplayAlerts
    Private bAppHasBeenStarted
    Private objFSO

    Public Property Let verbose(bYesNo)
        bVerbose = bYesNo
    End Property

    Public Property Let EnableEvents(bYesNo)
        bEnableEvents = bYesNo

        If Not (oApplication Is Nothing) Then
            oApplication.EnableEvents = bYesNo
        End if
    End Property

    Public Property Let DisplayAlerts(bYesNo)
        bDisplayAlerts = bYesNo

        If Not (oApplication Is Nothing) Then
            oApplication.DisplayAlerts = bYesNo
        End if

    End Property

    Public Property Let FileName(ByVal sName)
        sFileName = sName
    End Property

    Public Property Get FileName
        FileName = sFileName
    End Property

    Private Sub Class_Initialize()

        bVerbose = False
        bAppHasBeenStarted = False
        bEnableEvents = False
        bDisplayAlerts = False

        Set oApplication = Nothing

        Set objFSO = CreateObject("Scripting.FileSystemObject")
    End Sub

    Private Sub Class_Terminate()

        oApplication.EnableEvents = True
        oApplication.DisplayAlerts = True

        Set oApplication = Nothing
        Set objFSO = Nothing

    End Sub

    ' --------------------------------------------------------
    ' Initialize the oApplication object variable : get a pointer
    ' to the current Excel.exe app if already in memory or start
    ' a new instance.
    '
    ' If a new instance has been started, initialize the variable
    ' bAppHasBeenStarted to True so the rest of the script knows
    ' that Excel should then be closed by the script.
    ' --------------------------------------------------------
    Public Function Instantiate()

        If (oApplication Is Nothing) Then

            On error Resume Next

            Set oApplication = GetObject(,"Excel.Application")

            If (Err.number <> 0) or (oApplication Is Nothing) Then
                Set oApplication = CreateObject("Excel.Application")
                ' Remember that Excel has been started by
                ' this script ==> should be released
                bAppHasBeenStarted = True
            End If

            oApplication.EnableEvents = bEnableEvents
            oApplication.DisplayAlerts = bDisplayAlerts

            Err.clear

            On error Goto 0

        End If

        ' Return True if the application was created right
        ' now
        Instantiate = bAppHasBeenStarted

    End Function

    Public Sub Quit()
        If not (oApplication Is Nothing) Then
            oApplication.Quit
        End If
    End Sub

    ' --------------------------------------------------------
    ' Open a standard Excel file and allow to specify if the
    ' file should be opened in a read-only mode or not
    ' --------------------------------------------------------
    Public Sub Open(bReadOnly)

        If not (oApplication Is nothing) Then

            If bVerbose Then
                wScript.echo "Open " & sFileName & _
                    " (clsMSExcel::Open)"
            End If

            ' False = UpdateLinks
            oApplication.Workbooks.Open sFileName, False, _
                bReadOnly

        End If

    End sub

    ' --------------------------------------------------------
    ' Close the active workbook
    ' --------------------------------------------------------
    Public Sub CloseFile()

        Dim wb
        Dim I
        Dim sBaseName

        If Not (oApplication Is Nothing) Then

            If bVerbose Then
                wScript.echo "Close " & FileName & " (clsMSExcel::CloseFile)"
            End if

            ' Only the basename and not the full path
            sBaseName = objFSO.GetFileName(FileName)

            On Error Resume Next
            Set wb = oApplication.Workbooks(sBaseName)
            If Not (err.number = 0) Then
                ' Not found, workbook not loaded
                Set wb = Nothing
            Else
                If bVerbose Then
                    wScript.echo "	Closing " & sBaseName & " (clsMSExcel::CloseFile)"
                End if

                ' Close without saving
                wb.Close False

            End if

            On Error Goto 0

        End If

    End Sub

    ' --------------------------------------------------------
    ' Display the list of references used by the file
    ' --------------------------------------------------------
    Public Sub References_ListAll()

        Dim wb, ref
        Dim bShow, bEmpty

        If Not (oApplication Is Nothing) Then

            Set wb = oApplication.Workbooks(objFSO.GetFileName(sFileName))
            bEmpty = True

            If Not (wb Is Nothing) Then

                For Each ref In wb.VBProject.References

                    bShow = (LCase(Right(ref.FullPath,5)) = ".xlam")

                    If bShow then

                        bEmpty = False

                        wScript.echo "    Name " & ref.Name
                        'wScript.echo "    Built In: " & ref.BuiltIn
                        wScript.echo "    Full Path: " & ref.FullPath
                        'wScript.echo "     Is Broken: " & ref.IsBroken
                        'wScript.echo "    Version: " & ref.Major & "." & ref.Minor
                        wScript.echo ""

                    End If
                Next
            End If

            If bEmpty Then
                wScript.echo "    The file didn't use references"
                wScript.echo ""
            End If

            Set wb = Nothing

        End If
    End sub

End Class

' ----------------------------------------------------------
' When the user double-click on a .vbs file (from Windows explorer f.i.)
' the running process will be WScript.exe while it's CScript.exe when
' the .vbs is started from the command prompt.
'
' This subroutine will check if the script has been started with cscript
' and if not, will run the script again with cscript and terminate the
' "wscript" version. This is useful when the script generate a lot of
' wScript.echo statements, easier to read in a command prompt.'
' ----------------------------------------------------------
Sub ForceCScriptExecution()

    Dim sArguments, Arg, sCommand

    If Not LCase(Right(WScript.FullName, 12)) = "\cscript.exe" Then

        ' Get command lines parameters'
        sArguments = ""
        For Each Arg In WScript.Arguments
            sArguments=sArguments & Chr(34) & Arg & Chr(34) & Space(1)
        Next

        sCommand = "cmd.exe cscript.exe //nologo " & Chr(34) & _
        WScript.ScriptFullName & Chr(34) & Space(1) & Chr(34) & sArguments & Chr(34)

        ' 1 to activate the window
        ' true to let the window opened
        Call CreateObject("Wscript.Shell").Run(sCommand, 1, true)

        ' This version of the script (started with WScript) can be terminated
        wScript.quit

    End If

End Sub

' ------------------------------------------------------
' Get the current folder
'
' Use the wScript.ScriptFullName and not the
' wshShell.CurrentDirectory property to make the folder dependant of
' where the script is located since the script can be fired with, f.i.,
' c:\temp > cscript i:\folder\app.vbs.
' We wish to get "i:\folder"
' ------------------------------------------------------
Public Function CurrentFolder

    Dim objFSO, objFile

    Set objFSO = CreateObject("Scripting.FileSystemObject")
    Set objFile = objFSO.GetFile(wScript.ScriptFullName)

    CurrentFolder = objFSO.GetParentFolderName(objFile)

    ' Be sure to have the final slash
    If Not (Right(CurrentFolder, 1) = "\") THen
        CurrentFolder = CurrentFolder & "\"
    End If

    Set objFile = Nothing
    Set objFSO = Nothing

End Function

Dim cMSExcel
Dim sCurrentFolder, sFiles, sFile, sExt
Dim arrFiles
Dim objFSO, objFolder, objFiles, objFile
Dim I

    Call ForceCScriptExecution

    sCurrentFolder = CurrentFolder()

    sFiles = ""

    Set objFSO = CreateObject("Scripting.FileSystemObject")

    ' Get the list of files present in the current folder
    Set objFolder = objFSO.GetFolder(sCurrentFolder)
    Set objFiles = objFolder.Files

    ' Loop every files
    For Each objFile In objFiles

        ' Don't process files starting with ~ since Excel use such
        ' filename for files already opened
        If Not (Left(objFile.Name, 1) = "~") Then

            sExt = LCase(objFSO.getExtensionName(objFile.Name))

            ' Process only xlsx files
            If (sExt = "xlsm") or (sExt = "xlam") Then
                ' Just concatenate the filename with a delimiter
                sFiles = sFiles & objFile.Name & "#"
            End If

        End If

    Next

    If (Right(sFiles, 1) = "#") Then
        sFiles = Left(sFiles, Len(sFiles) -1)
    End If

    ' No more needed, release objects
    Set objFile = Nothing
    Set objFiles = Nothing
    Set objFolder = Nothing
    Set objFSO = Nothing

    ' sFiles is a string that contains the list of files we need to process
    ' Like f.i. "file1.xlsx#file2.xlsx#file3.xlsx"
    ' Explode the string into an array
    If (Not (sFiles = "")) Then

        ' We've at least one file to process
        wScript.echo "Processing files in " & sCurrentFolder
        wScript.echo " "

        arrFiles=Split(sFiles, "#")

        If (isArray(arrFiles)) Then

            Set cMSExcel = New clsMSExcel
            cMSExcel.Verbose = False
            cMSExcel.EnableEvents = False

            cMSExcel.Instantiate

            For I = 0 To UBound(arrFiles)

                sFile = sCurrentFolder & arrFiles(I)

                wScript.echo "Get the list of references used in " & sFile
                wScript.echo ""

                cMSExcel.FileName = sFile

                Call cMSExcel.Open(True)
                Call cMSExcel.References_ListAll()
                Call cMSExcel.CloseFile()

            Next

            cMSExcel.Quit
            Set cMSExcel = Nothing

        End If

    Else

        wScript.echo "The folder " & sCurrentFolder & " doesn't contains any Excel file"
        wScript.echo " "

    End If
