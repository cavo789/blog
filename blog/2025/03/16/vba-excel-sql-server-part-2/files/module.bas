Sub CopyToSheet()

Dim rng As Range

    cData.ServerName = cServerName
    cData.DatabaseName = cDBName
    ' highlight-next-line
    cData.UserName = "SA"
    ' highlight-next-line
    cData.Password = "2Secure*Password2"

    Set rng = cData.SQL_CopyToSheet(cSQLStatement, ActiveSheet.Range("A1"))

End Sub
