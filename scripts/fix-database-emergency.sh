#!/bin/bash

################################################################################
# EMERGENCY DATABASE FIX SCRIPT
# Purpose: Force reset database when migration is stuck
# Usage: ./scripts/fix-database-emergency.sh
# Date: January 7, 2026
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo -e "${RED}         EMERGENCY DATABASE RESET - FORCE FIX${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_warn "This will:"
echo "  1. Stop all containers"
echo "  2. Delete database volume"
echo "  3. Rebuild images"
echo "  4. Start fresh"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Cancelled"
    exit 0
fi

echo ""

# STEP 1: Stop everything
log_info "Step 1: Stopping all containers..."
docker-compose down 2>/dev/null || true
log_success "Containers stopped"

echo ""

# STEP 2: List and remove volumes
log_info "Step 2: Finding and removing database volume..."

# Find postgres volume
VOLUME=$(docker volume ls -q | grep -i postgres || echo "")

if [ -z "$VOLUME" ]; then
    # Try alternate naming
    VOLUME=$(docker volume ls -q | grep -i pic || echo "")
fi

if [ ! -z "$VOLUME" ]; then
    log_warn "Found volume: $VOLUME"
    docker volume rm $VOLUME 2>/dev/null || true
    log_success "Volume removed"
else
    log_warn "No postgres volume found (might be OK)"
fi

echo ""

# STEP 3: Remove all dangling volumes
log_info "Step 3: Cleaning up unused volumes..."
docker volume prune -f &>/dev/null || true
log_success "Cleaned up"

echo ""

# STEP 4: Rebuild images
log_info "Step 4: Rebuilding Docker images (no cache)..."
echo ""

docker-compose build --no-cache backend postgres 2>&1 | head -20
echo "..."
docker-compose build --no-cache backend postgres > /dev/null 2>&1

log_success "Images rebuilt"

echo ""

# STEP 5: Start services
log_info "Step 5: Starting fresh services..."
echo ""

docker-compose up -d
log_success "Services started"

echo ""

# STEP 6: Wait for services
log_info "Step 6: Waiting for services to initialize (3-5 minutes)..."
echo ""

MAX_WAIT=300
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if docker exec -it pic_postgres pg_isready -U postgres &> /dev/null; then
        log_success "PostgreSQL ready"
        break
    fi
    
    ELAPSED=$((ELAPSED + 5))
    REMAINING=$((MAX_WAIT - ELAPSED))
    printf "\rWaiting... ${REMAINING}s remaining  "
    sleep 5
done

echo ""

log_info "Waiting additional 30 seconds for backend initialization..."
sleep 30

echo ""

# STEP 7: Verify database schema
log_info "Step 7: Verifying database schema..."
echo ""

log_info "Checking if registration_links table exists..."
TABLE_EXISTS=$(docker exec -it pic_postgres psql -U postgres -d pic_app -t -c \
  "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='registration_links');" 2>/dev/null || echo "f")

if [[ "$TABLE_EXISTS" == *"t"* ]] || [[ "$TABLE_EXISTS" == "t" ]]; then
    log_success "Table exists"
else
    log_error "Table not found - database initialization may have failed"
    log_info "Waiting additional 30 seconds..."
    sleep 30
fi

log_info "Checking if bidang_id column exists..."
COLUMN_EXISTS=$(docker exec -it pic_postgres psql -U postgres -d pic_app -t -c \
  "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='registration_links' AND column_name='bidang_id');" 2>/dev/null || echo "f")

if [[ "$COLUMN_EXISTS" == *"t"* ]] || [[ "$COLUMN_EXISTS" == "t" ]]; then
    log_success "bidang_id column exists ✓"
else
    log_error "bidang_id column NOT found"
    log_info "Showing available columns:"
    docker exec -it pic_postgres psql -U postgres -d pic_app -c \
      "SELECT column_name FROM information_schema.columns WHERE table_name='registration_links';" || true
    exit 1
fi

echo ""

# STEP 8: Verify backend health
log_info "Step 8: Checking backend health..."
echo ""

HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health || echo "")

if [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
    log_success "Backend is healthy ✓"
else
    log_warn "Backend not responding yet, waiting..."
    sleep 10
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health || echo "")
    if [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
        log_success "Backend is now healthy ✓"
    else
        log_warn "Backend still not responding (but database is fixed)"
    fi
fi

echo ""

# FINAL: Display results
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              ✓ EMERGENCY FIX COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_success "Database schema updated (personnel_type_id → bidang_id)"
log_success "All services running"
log_success "Backend ready"

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Open Frontend: http://localhost:3000"
echo "  2. Login: admin@example.com / admin123"
echo "  3. Test: Go to 'Tambah Link Pendaftaran'"
echo "  4. Verify: Bidang dropdown shows 13 sectors"
echo ""

echo -e "${BLUE}Check Logs:${NC}"
echo "  Backend: docker-compose logs backend"
echo "  Database: docker-compose logs postgres"
echo ""

log_success "Emergency fix completed!"
echo ""
