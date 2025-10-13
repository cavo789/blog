<?php

declare(strict_types=1);

// cspell:ignore orclpdb1,rownum,sqlt

$dbUser = "system";
$dbPassword = "admin";
$dbHost = "oracle-db";
$dbPort = "1521";
$dbServiceName = "orclpdb1";

$connection = null;
$statement = null;

try {
    $dsn = "(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST={$dbHost})(PORT={$dbPort})))(CONNECT_DATA=(SERVICE_NAME={$dbServiceName})))";

    /** @var resource|false $connection */
    $connection = oci_connect($dbUser, $dbPassword, $dsn, "");

    if (!$connection) {
        $e = oci_error();
        throw new Exception("Error connecting to Oracle: " . $e['message']);
    }

    $sql = "SELECT employee_id, first_name, last_name, email FROM system.employees WHERE ROWNUM <= :max_rows";

    /** @var resource|false $statement */
    $statement = oci_parse($connection, $sql);

    if (!$statement) {
        $e = oci_error($connection);
        throw new Exception("Error parsing SQL statement: " . $e['message']);
    }

    $numRows = 25;
    oci_bind_by_name($statement, ":max_rows", $numRows, SQLT_INT);

    $result = oci_execute($statement);

    if (!$result) {
        $e = oci_error($statement);
        throw new Exception("Error executing SQL statement: " . $e['message']);
    }

    echo "Employee ID | First Name          | Last Name           | Email\n";
    echo str_repeat("-", 80) . "\n";

    while (($row = oci_fetch_array($statement, OCI_ASSOC + OCI_RETURN_NULLS)) !== false) {
        $employeeId = (int) $row['EMPLOYEE_ID'];
        $firstName = $row['FIRST_NAME'];
        $lastName = $row['LAST_NAME'];
        $email = $row['EMAIL'];
        printf("%-12d| %-20s| %-20s| %-26s\n", $employeeId, $firstName, $lastName, $email);
    }

} catch (Exception $exception) {
    echo "Error: " . $exception->getMessage() . "\n";
} finally {
    if (is_resource($statement)) {
        oci_free_statement($statement);
    }
    if (is_resource($connection)) {
        oci_close($connection);
    }
}

?>
