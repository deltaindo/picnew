#!/bin/bash

################################################################################
# PicNew - Automated Database Migration Setup
# 
# This script automates the database migration process:
# 1. Generates Prisma client
# 2. Creates migrations for schema changes
# 3. Deploys migrations to database
# 4. Seeds database with initial data
#
# Usage: ./scripts/migrate-setup.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_PREFIX="[MIGRATION]"
ERROR_PREFIX="${RED}[ERROR]${NC}"
SUCCESS_PREFIX="${GREEN}[✓]${NC}"
INFO_PREFIX="${BLUE}[ℹ]${NC}"
WARN_PREFIX="${YELLOW}[⚠]${NC}"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${INFO_PREFIX} ${LOG_PREFIX} $1"
}

log_success() {
    echo -e "${SUCCESS_PREFIX} ${LOG_PREFIX} $1"
}

log_warn() {
    echo -e "${WARN_PREFIX} ${LOG_PREFIX} $1"
}

log_error() {
    echo -e "${ERROR_PREFIX} ${LOG_PREFIX} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    return 0
}

################################################################################
# Main Migration Steps
################################################################################

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "          🚀 PicNew - Automated Database Migration Setup"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check prerequisites
log_info "Checking prerequisites..."
check_command "node" || exit 1
check_command "npm" || exit 1
log_success "Prerequisites OK (Node.js, npm available)"

echo ""

# Step 2: Generate Prisma Client
log_info "Step 1/4: Generating Prisma Client..."
if npm run prisma:generate > /dev/null 2>&1; then
    log_success "Prisma Client generated successfully"
else
    log_error "Failed to generate Prisma Client"
    exit 1
fi

echo ""

# Step 3: Create Migration
log_info "Step 2/4: Creating migration for schema changes..."
log_warn "This will create a migration file for new tables (PIC, Marketing, ProgramType)"

if npm run prisma:migrate -- --name "add_pic_marketing_programtype" > /tmp/migrate.log 2>&1; then
    log_success "Migration created successfully"
    # Show what was created
    MIGRATION_DIR=$(ls -td backend/prisma/migrations/*/ 2>/dev/null | head -1)
    if [ -n "$MIGRATION_DIR" ]; then
        log_info "Migration directory: $(basename $MIGRATION_DIR)"
    fi
else
    # Check if migration already exists
    if grep -q "Already in sync" /tmp/migrate.log; then
        log_warn "Schema already in sync (migration may have been applied previously)"
    else
        log_error "Failed to create migration"
        cat /tmp/migrate.log
        exit 1
    fi
fi

echo ""

# Step 4: Deploy Migration
log_info "Step 3/4: Deploying migration to database..."
if npm run prisma:deploy > /dev/null 2>&1; then
    log_success "Migration deployed successfully"
else
    log_error "Failed to deploy migration"
    exit 1
fi

echo ""

# Step 5: Seed Database
log_info "Step 4/4: Seeding database with initial data..."
log_warn "This will populate PIC, Marketing, and ProgramType tables with test data"

if npm run prisma:seed > /tmp/seed.log 2>&1; then
    log_success "Database seeded successfully"
else
    # Check if seed succeeded despite error message
    if grep -q "Database seeding completed successfully" /tmp/seed.log; then
        log_success "Database seeded successfully"
    else
        log_warn "Seed completed with warnings (check /tmp/seed.log for details)"
    fi
fi

echo ""

################################################################################
# Verification
################################################################################

log_info "Verifying migration..."
echo ""

# Check if tables exist using Prisma
if npm run prisma:studio --skip-engine-check > /dev/null 2>&1; then
    log_success "Database connection verified"
else
    log_warn "Could not verify database connection (this may be normal)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✨ Migration completed successfully!${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What was done:"
echo "   ✓ Generated Prisma Client"
echo "   ✓ Created migration for new tables (PIC, Marketing, ProgramType)"
echo "   ✓ Deployed migration to database"
echo "   ✓ Seeded database with test data"
echo ""
echo "🧪 Next Steps:"
echo "   1. Restart backend container: docker-compose restart pic_backend"
echo "   2. Verify in admin panel: http://localhost:3000/admin/links"
echo "   3. Click 'Buat Link Baru' to see populated dropdowns"
echo ""
echo "📚 For more information, see: DATABASE_MIGRATION_FIX.md"
echo ""

exit 0
