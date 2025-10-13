cData.ServerName = cServerName
    cData.DatabaseName = cDBName
    ' highlight-next-line
    cData.UserName = "SA"
    ' highlight-next-line
    cData.Password = "2Secure*Password2"

    sSQL = "SELECT * FROM dbo.Customers"

    Call cData.RunSQLAndExportNewWorkbook(sSQL, "My Title", False)
