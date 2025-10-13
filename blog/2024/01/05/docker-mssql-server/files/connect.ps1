$SqlServer = 'localhost,1433';
$SqlDatabase = 'MyDB';

$SqlConnectionString = 'Data Source={0};Initial Catalog={1};User Id=SA;Password=2Secure*Password2;' -f $SqlServer, $SqlDatabase;
$SqlQuery = "SELECT FirstName, LastName FROM dbo.Person ORDER BY LastName;";

$SqlConnection = New-Object -TypeName System.Data.SqlClient.SqlConnection -ArgumentList $SqlConnectionString;

$SqlCommand = $SqlConnection.CreateCommand();
$SqlCommand.CommandText = $SqlQuery;

$SqlConnection.Open();
$SqlDataReader = $SqlCommand.ExecuteReader();

Write-Host "Here is the content of dbo.Person"
Write-Host "---------------------------------"
Write-Host ""

while ($SqlDataReader.Read()) {
    Write-Host $SqlDataReader['LastName'] $SqlDataReader['FirstName'];
}

$SqlConnection.Close();
$SqlConnection.Dispose();

Write-Host ""
