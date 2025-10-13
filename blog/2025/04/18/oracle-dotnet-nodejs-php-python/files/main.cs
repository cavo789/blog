// cspell:ignore orclpdb1

using Oracle.ManagedDataAccess.Client;
using System;

namespace OracleConnector
{
    class Program
    {
        static void Main(string[] args)
        {
            string dbHost = Environment.GetEnvironmentVariable("ORACLE_HOST") ?? "oracle-db";
            string dbPort = Environment.GetEnvironmentVariable("ORACLE_PORT") ?? "1521";
            string dbService = Environment.GetEnvironmentVariable("ORACLE_SERVICE") ?? "orclpdb1";
            string dbUser = Environment.GetEnvironmentVariable("ORACLE_USER") ?? "system";
            string dbPassword = Environment.GetEnvironmentVariable("ORACLE_PASSWORD") ?? "admin";

            string connectionString = $"Data Source=(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST={dbHost})(PORT={dbPort})))(CONNECT_DATA=(SERVICE_NAME={dbService})));User ID={dbUser};Password={dbPassword};";

            try
            {
                using (OracleConnection connection = new OracleConnection(connectionString))
                {
                    connection.Open();

                    string sql = "SELECT employee_id, first_name, last_name, email FROM employees WHERE ROWNUM <= 25";

                    using (OracleCommand command = new OracleCommand(sql, connection))
                    using (OracleDataReader reader = command.ExecuteReader())
                    {
                        Console.WriteLine("\nEmployee ID | First Name           | Last Name            | Email");
                        Console.WriteLine("------------|----------------------|----------------------|-------------------------");

                        while (reader.Read())
                        {
                            int employeeId = reader.GetInt32(0);
                            string firstName = reader.GetString(1);
                            string lastName = reader.GetString(2);
                            string email = reader.GetString(3);

                            Console.WriteLine($"{employeeId,-12}| {firstName,-21}| {lastName,-21}| {email}");
                        }
                    }
                }
            }
            catch (OracleException ex)
            {
                Console.WriteLine($"Error connecting to or querying Oracle: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}
