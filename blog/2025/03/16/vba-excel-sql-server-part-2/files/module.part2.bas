cData.ServerName = cServerName
    cData.DatabaseName = cDBName
    ' highlight-next-line
    cData.UserName = "SA"
    ' highlight-next-line
    cData.Password = "2Secure*Password2"

    ' When cData.UserName and cData.Password are not supplied
    ' the connection will be made as "trusted" i.e. with the connected
    ' user's credentials.

    Set rng = cData.SQL_CopyToSheet("SELECT * FROM dbo.Customers", ActiveSheet.Range("A1"))
