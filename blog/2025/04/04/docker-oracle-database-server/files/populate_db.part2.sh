# highlight-next-line
sqlplus -S sys/admin@localhost:1521/ORCLCDB AS SYSDBA <<EOF
# highlight-next-line
ALTER SESSION SET CONTAINER = ORCLPDB1;
# highlight-next-line
CONNECT system/admin@orclpdb1
@/docker-entrypoint-initdb.d/startup/sql/hr_create.sql
@/docker-entrypoint-initdb.d/startup/sql/hr_populate.sql
COMMIT;
EXIT;
EOF
