Option Base 0
Option Compare Text

' Name of the range in the workbook, with the list of periods
Private Const cRangeName = "_rngParamsPeriod"

' When a period will be selected from the ribbon, a "name"
' will be created in the active workbook so, in a cell formula,
' it's possible to retrieve the selected value.
' Formula example :
'     = "Selected period is " & _Period
Private Const cName = "_Period"

Private sValue As String

' -------------------------------------------------------------
'
' Initialization, define default value : select the last value
' of the range
'
' -------------------------------------------------------------

Public Sub Initialize()

Dim wLastIndex As Byte

    ' Get the last value of the range
    wLastIndex = shParams.Range(cRangeName).Rows.Count
    sValue = shParams.Range(cRangeName).Cells(wLastIndex, 1).Value

    ' Create / Update the name
    Range(cName).Value = sValue

End Sub

' -------------------------------------------------------------
'
' Return the selected value to the calling code.
'
' For instance, from within a VBA module just call
'    Msgbox modToolbar_cbxPeriod.GetValue()
'
' -------------------------------------------------------------

Public Function GetValue() As String
    GetValue = sValue
End Function

' -------------------------------------------------------------
'
' Remember the selected value : the user has selected a value from
' the ribbon
'
' -------------------------------------------------------------

Sub onAction(control As IRibbonControl, id As String, index As Integer)
    sValue = id

    Range(cName).Value = sValue

    ' Optional, inform the user in the Excel's statusbar
    Application.StatusBar = "Set to [" & sValue & "]"
End Sub

' -------------------------------------------------------------
'
' Return the number of entries for the combobox
'
' -------------------------------------------------------------

Sub getItemCount(control As IRibbonControl, ByRef returnedVal)
    returnedVal = shParams.Range(cRangeName).Rows.Count
End Sub

' -------------------------------------------------------------
'
' Set the ID for each entry (the ID can be different of the displayed caption)
'
' -------------------------------------------------------------

Public Sub getItemID(control As IRibbonControl, index As Integer, ByRef id)
    id = shParams.Range(cRangeName).Cells(index + 1, 1).Value
End Sub

' -------------------------------------------------------------
'
' Define the label (the caption) of each entry in the list
'
' -------------------------------------------------------------

Public Sub getItemLabel(control As IRibbonControl, index As Integer, ByRef returnedVal)
    returnedVal = shParams.Range(cRangeName).Cells(index + 1, 1).Value
End Sub

' -------------------------------------------------------------
'
' Get the default value for the combobox
'
' -------------------------------------------------------------

Public Sub getSelectedItemID(control As IRibbonControl, ByRef id)
    id = sValue
End Sub
