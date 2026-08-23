#!/usr/bin/env bash

sqlplus -S sys/admin@localhost:%%port=1521%%/%%cdb=ORCLCDB%% AS SYSDBA <<EOF
ALTER SESSION SET CONTAINER = %%pdb=ORCLPDB1%%;
CONNECT system/admin@%%pdb=orclpdb1%%
@/docker-entrypoint-initdb.d/startup/sql/hr_create.sql
@/docker-entrypoint-initdb.d/startup/sql/hr_populate.sql
COMMIT;
EXIT;
EOF
