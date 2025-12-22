#!/bin/bash
# Database initialization script
# This runs inside the PostgreSQL container to load schema on startup

set -e

echo "=== PIC App Database Initialization ==="

echo "Creating database..."
psql -U postgres -c "CREATE DATABASE IF NOT EXISTS pic_app;" || true

echo "Loading schema..."
psql -U postgres -d pic_app < /docker-entrypoint-initdb.d/01-schema.sql || true

echo "Loading constraints..."
psql -U postgres -d pic_app < /docker-entrypoint-initdb.d/02-constraints.sql || true

echo "Seeding training data..."
psql -U postgres -d pic_app < /docker-entrypoint-initdb.d/03-seeder.sql || true

echo "=== Verification ==="
echo "Tables created:"
psql -U postgres -d pic_app -c "\\dt" | grep -c "public" || echo "0 tables"

echo "Training programs:"
psql -U postgres -d pic_app -c "SELECT COUNT(*) as training_count FROM trainings;" || echo "ERROR: trainings table not found"

echo "=== Initialization Complete ==="
