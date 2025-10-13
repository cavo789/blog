#!/usr/bin/env bash

sqlplus -S sys/admin@localhost:1521/ORCLCDB AS SYSDBA <<EOF
ALTER SESSION SET CONTAINER = ORCLPDB1;
CONNECT system/admin@orclpdb1
@/docker-entrypoint-initdb.d/startup/sql/hr_create.sql
@/docker-entrypoint-initdb.d/startup/sql/hr_populate.sql
COMMIT;
EXIT;
EOF
