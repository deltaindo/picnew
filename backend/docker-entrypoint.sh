#!/bin/bash

################################################################################
# PicNew Backend - Docker Entrypoint with Auto Migration
#
# This script runs on container startup and automatically handles:
# 1. Waiting for PostgreSQL to be ready
# 2. Generating Prisma Client
# 3. Running pending migrations
# 4. Seeding the database (first time only)
# 5. Starting the backend server
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[ENTRYPOINT]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

################################################################################
# Step 1: Wait for PostgreSQL
################################################################################

log "Waiting for PostgreSQL to be ready..."

max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" > /dev/null 2>&1; then
        log_success "PostgreSQL is ready"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "PostgreSQL did not become ready after $max_attempts attempts"
        exit 1
    fi
    
    echo -n "."
    attempt=$((attempt + 1))
    sleep 1
done

echo ""
log "PostgreSQL connection verified"

################################################################################
# Step 2: Generate Prisma Client
################################################################################

log "Generating Prisma Client..."
if npx prisma generate > /dev/null 2>&1; then
    log_success "Prisma Client generated"
else
    log_error "Failed to generate Prisma Client"
    exit 1
fi

################################################################################
# Step 3: Deploy Pending Migrations
################################################################################

log "Deploying pending migrations..."
if npx prisma migrate deploy > /dev/null 2>&1; then
    log_success "Migrations deployed"
else
    # Check if error is due to no pending migrations (which is OK)
    if npx prisma migrate status 2>&1 | grep -q "No pending migrations"; then
        log_success "No pending migrations (schema already up-to-date)"
    else
        log_error "Failed to deploy migrations"
        exit 1
    fi
fi

################################################################################
# Step 4: Seed Database (if SEED_DB=true)
################################################################################

if [ "${SEED_DB:-true}" = "true" ]; then
    log "Checking if seed data is needed..."
    
    # Check if PIC table has data
    RECORD_COUNT=$(npx prisma db execute --stdin <<SQL 2>/dev/null | wc -l
        SELECT COUNT(*) FROM \"PIC\" LIMIT 1;
SQL
    ) || RECORD_COUNT=0
    
    if [ "$RECORD_COUNT" -eq 0 ]; then
        log "Seeding database with initial data..."
        if npm run prisma:seed > /dev/null 2>&1; then
            log_success "Database seeded successfully"
        else
            log_warn "Seed completed with warnings (continuing startup)"
        fi
    else
        log_success "Database already seeded (skipping)"
    fi
fi

################################################################################
# Step 5: Start Backend Server
################################################################################

echo ""
log "Starting backend server..."
echo ""

# Execute the original command (from docker CMD instruction)
exec "$@"
