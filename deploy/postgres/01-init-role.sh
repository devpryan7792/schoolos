#!/bin/sh
set -e

echo "Initializing SchoolOS PostgreSQL roles and security privileges..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create non-superuser application role for strict RLS enforcement
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'schoolos_app') THEN
            CREATE ROLE schoolos_app WITH LOGIN PASSWORD 'schoolos_app_secret' NOSUPERUSER NOCREATEDB NOCREATEROLE;
        END IF;
    END
    \$\$;

    GRANT ALL ON DATABASE schoolos TO schoolos_app;
EOSQL
