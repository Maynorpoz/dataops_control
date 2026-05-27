#!/bin/bash
set -e
# Permite conexiones de replicación desde cualquier host de la red Docker
echo "host replication target_admin 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
# md5 tiene mayor compatibilidad con clientes JDBC (DataGrip, DBeaver, etc.)
sed -i 's/host all all all scram-sha-256/host all all all md5/' "$PGDATA/pg_hba.conf"
