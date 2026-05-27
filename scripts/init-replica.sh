#!/bin/bash
set -e

rm -rf /var/lib/postgresql/data/*

until pg_basebackup -h postgres-target -D /var/lib/postgresql/data -U target_admin -vP --no-password 2>/dev/null; do
  echo 'Waiting for primary...'
  sleep 3
done

chmod 700 /var/lib/postgresql/data

# primary_conninfo debe ir entre comillas simples para que postgresql.conf lo parsee correctamente
cat >> /var/lib/postgresql/data/postgresql.conf << EOF
primary_conninfo = 'host=postgres-target port=5432 user=target_admin password=$POSTGRES_PASSWORD'
EOF

touch /var/lib/postgresql/data/standby.signal
exec postgres -D /var/lib/postgresql/data
