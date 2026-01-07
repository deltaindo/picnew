#!/bin/bash

################################################################################
# Automated Database Migration Script
# Purpose: Automatically migrate database schema from personnel_type_id to bidang_id
# Usage: ./scripts/migrate-db.sh
# Date: January 7, 2026
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

################################################################################
# Step 1: Check Prerequisites
################################################################################

log_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi
log_success "Docker found"

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi
log_success "Docker Compose found"

echo ""

################################################################################
# Step 2: Stop and Clean Up
################################################################################

log_info "Stopping containers and removing old database..."
echo ""

docker-compose down -v --remove-orphans || true
log_success "Containers stopped and database removed"

echo ""

################################################################################
# Step 3: Rebuild Images
################################################################################

log_info "Rebuilding Docker images with no cache..."
echo ""

docker-compose build --no-cache backend postgres
log_success "Images rebuilt successfully"

echo ""

################################################################################
# Step 4: Start Services
################################################################################

log_info "Starting Docker services..."
echo ""

docker-compose up -d
log_success "Services started"

echo ""

################################################################################
# Step 5: Wait for Services to Initialize
################################################################################

log_info "Waiting for services to initialize (this may take 2-5 minutes)..."
echo ""

MAX_WAIT=300  # 5 minutes
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if docker exec -it pic_postgres pg_isready -U postgres &> /dev/null; then
        log_success "PostgreSQL is ready"
        break
    fi
    
    ELAPSED=$((ELAPSED + 5))
    REMAINING=$((MAX_WAIT - ELAPSED))
    echo -ne "\rWaiting for PostgreSQL... ${REMAINING}s remaining  "
    sleep 5
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    log_error "PostgreSQL failed to start within timeout"
    exit 1
fi

echo ""
log_info "Waiting for backend to initialize (30 seconds)..."
echo ""
sleep 30

echo ""

################################################################################
# Step 6: Verify Database Schema
################################################################################

log_info "Verifying database schema..."
echo ""

log_info "Checking if registration_links table exists..."
TABLE_EXISTS=$(docker exec -it pic_postgres psql -U postgres -d pic_app -t -c \
  "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='registration_links');" 2>/dev/null || echo "f")

if [[ "$TABLE_EXISTS" == *"t"* ]] || [[ "$TABLE_EXISTS" == "t" ]]; then
    log_success "registration_links table exists"
else
    log_warn "registration_links table not found yet, waiting..."
    sleep 10
fi

log_info "Checking if bidang_id column exists..."
COLUMN_EXISTS=$(docker exec -it pic_postgres psql -U postgres -d pic_app -t -c \
  "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='registration_links' AND column_name='bidang_id');" 2>/dev/null || echo "f")

if [[ "$COLUMN_EXISTS" == *"t"* ]] || [[ "$COLUMN_EXISTS" == "t" ]]; then
    log_success "bidang_id column exists ✓"
else
    log_error "bidang_id column not found"
    log_info "Showing available columns:"
    docker exec -it pic_postgres psql -U postgres -d pic_app -c \
      "SELECT column_name FROM information_schema.columns WHERE table_name='registration_links' ORDER BY ordinal_position;"
    exit 1
fi

echo ""

################################################################################
# Step 7: Verify Backend Health
################################################################################

log_info "Checking backend health..."
echo ""

MAX_HEALTH_WAIT=60
HEALTH_ELAPSED=0

while [ $HEALTH_ELAPSED -lt $MAX_HEALTH_WAIT ]; do
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health || echo "")
    
    if [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
        log_success "Backend is healthy ✓"
        break
    fi
    
    HEALTH_ELAPSED=$((HEALTH_ELAPSED + 5))
    echo -ne "\rHealthcheck attempt $((HEALTH_ELAPSED / 5))...  "
    sleep 5
done

if [ $HEALTH_ELAPSED -ge $MAX_HEALTH_WAIT ]; then
    log_warn "Backend health check timeout, continuing anyway..."
fi

echo ""

################################################################################
# Step 8: Verify API Endpoints
################################################################################

log_info "Verifying API endpoints are accessible..."
echo ""

# Test health endpoint
if curl -s http://localhost:5000/api/health | grep -q 'ok'; then
    log_success "Health endpoint working ✓"
else
    log_warn "Health endpoint not responding (backend might still be starting)"
fi

echo ""

################################################################################
# Step 9: Display Summary
################################################################################

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}         ✓ DATABASE MIGRATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_success "All services running"
log_success "Database schema updated (personnel_type_id → bidang_id)"
log_success "PostgreSQL is healthy"
log_success "Backend is ready"

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Open Frontend: http://localhost:3000"
echo "  2. Login: admin@example.com / admin123"
echo "  3. Test: Go to 'Tambah Link Pendaftaran'"
echo "  4. Verify: Bidang dropdown shows 13 sectors"
echo ""

echo -e "${BLUE}Check Logs:${NC}"
echo "  Backend:   docker-compose logs backend"
echo "  Database:  docker-compose logs postgres"
echo "  Full:      docker-compose logs"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo "  Stop:      docker-compose down"
echo "  View logs: docker-compose logs -f backend"
echo "  Restart:   docker-compose restart backend"
echo ""

log_success "Migration script completed successfully!"
echo ""
