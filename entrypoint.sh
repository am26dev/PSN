#!/bin/sh
set -e

echo "A aguardar o PostgreSQL..."

DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@[^:]+:([0-9]+).*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')

TRIES=0
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 30 ]; then
    echo "ERRO: PostgreSQL não respondeu em 30s."
    exit 1
  fi
  sleep 1
done
echo "PostgreSQL pronto ($DB_HOST:$DB_PORT)."

export PGPASSWORD="$DB_PASS"

# Aplica migrations SQL se existirem
MIGRATIONS_DIR="/app/prisma/migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
  echo "A verificar migrations..."
  
  # Cria tabela _prisma_migrations se não existir
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -q <<'SQL'
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           TIMESTAMPTZ,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMPTZ,
    "started_at"            TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
SQL

  # Aplica cada migration que ainda não foi executada
  for dir in $(ls -1d "$MIGRATIONS_DIR"/*/ 2>/dev/null | sort); do
    MIGRATION_NAME=$(basename "$dir")
    SQL_FILE="$dir/migration.sql"
    
    if [ ! -f "$SQL_FILE" ]; then
      continue
    fi
    
    ALREADY=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
      "SELECT 1 FROM \"_prisma_migrations\" WHERE \"migration_name\" = '$MIGRATION_NAME' LIMIT 1;" 2>/dev/null)
    
    if [ "$ALREADY" = "1" ]; then
      echo "  ✓ $MIGRATION_NAME (já aplicada)"
    else
      echo "  → A aplicar $MIGRATION_NAME..."
      psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$SQL_FILE"
      
      CHECKSUM=$(md5sum "$SQL_FILE" | cut -d' ' -f1)
      psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -q <<SQL2
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
VALUES ('$(cat /proc/sys/kernel/random/uuid)', '$CHECKSUM', now(), '$MIGRATION_NAME', now(), 1);
SQL2
      echo "  ✓ $MIGRATION_NAME (aplicada)"
    fi
  done
  echo "Migrations concluídas."
fi

unset PGPASSWORD
echo "A iniciar o servidor..."
exec node server.js
