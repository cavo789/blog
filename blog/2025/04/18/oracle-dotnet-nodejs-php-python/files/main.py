from typing import Optional, Tuple, List

# cspell:ignore oracledb,orclpdb1,sysdba,rownum

DB_USER: str = "SYS"
DB_PASSWORD: str = "admin"
DB_HOST: str = "oracle-db"
DB_PORT: int = 1521
DB_SERVICE_NAME: str = "orclpdb1"

connection: Optional[oracledb.Connection] = None
cursor: Optional[oracledb.Cursor] = None

try:
    dsn: str = f"{DB_HOST}:{DB_PORT}/{DB_SERVICE_NAME}"

    connection = oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=dsn,
        mode=oracledb.AuthMode.SYSDBA,
    )

    cursor = connection.cursor()

    sql: str = (
        "SELECT employee_id, first_name, last_name, email "
        "FROM system.employees "
        "WHERE ROWNUM <= :max_rows"
    )

    num_rows: int = 25
    cursor.execute(sql, max_rows=num_rows)

    records: List[Tuple[int, str, str, str]] = cursor.fetchall()

    print("Employee ID | First Name          | Last Name           | Email")
    print("-" * 80)

    employee_id: int
    first_name: str
    last_name: str
    email: str

    for record in records:
        employee_id, first_name, last_name, email = record
        print(f"{employee_id:<12}| {first_name:<20}| {last_name:<20}| {email:<26}")

except oracledb.Error as exception:
    print(f"Error connecting to Oracle: {exception}")

finally:
    if cursor:
        try:
            cursor.close()
        except oracledb.Error as exception:
            print(f"Error closing cursor: {exception}")
    if connection:
        try:
            connection.close()
        except oracledb.Error as exception:
            print(f"Error closing connection: {exception}")
