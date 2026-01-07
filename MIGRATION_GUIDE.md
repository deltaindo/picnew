# 🚀 Automated Database Migration Guide

> **Fix database schema mismatch automatically in one command**

## 🎯 What This Does

This automated migration script:
1. ✅ Stops all Docker containers
2. ✅ Removes old database volume
3. ✅ Rebuilds Docker images with fresh schema
4. ✅ Starts all services
5. ✅ Waits for PostgreSQL initialization
6. ✅ Verifies database schema (`personnel_type_id` → `bidang_id`)
7. ✅ Checks backend health
8. ✅ Displays completion status

**Result:** Fresh database with NEW schema, all errors fixed, system ready to use.

---

## 🔴 Problem Solved

### Error Before Migration
```
Error: column registration_links.bidang_id does not exist
```

### Cause
```
✅ Code: bidangId
✅ Prisma Schema: bidangId
❌ Database: personnel_type_id (OLD!)
❌ Result: MISMATCH → ERROR!
```

### After Migration
```
✅ Code: bidangId
✅ Prisma Schema: bidangId
✅ Database: bidang_id
✅ Result: EVERYTHING SYNCED → WORKS!
```

---

## 📋 Quick Start

### For Linux/Mac Users

```bash
# Make script executable (first time only)
chmod +x scripts/migrate-db.sh

# Run migration
./scripts/migrate-db.sh
```

**Time:** ~5 minutes
**Result:** ✅ Full database migration with verification

### For Windows Users

```cmd
# Double-click to run:
scripts\migrate-db.bat

# Or from PowerShell:
.\scripts\migrate-db.bat

# Or from Command Prompt:
scripts\migrate-db.bat
```

**Time:** ~5 minutes
**Result:** ✅ Full database migration with verification

---

## 📊 What Changes

### Database Schema Before
```sql
CREATE TABLE registration_links (
    id INT PRIMARY KEY,
    unique_token VARCHAR UNIQUE,
    training_program_id INT,
    training_class_id INT,
    personnel_type_id INT,        ← OLD COLUMN
    created_by_admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Schema After
```sql
CREATE TABLE registration_links (
    id INT PRIMARY KEY,
    unique_token VARCHAR UNIQUE,
    training_program_id INT,
    training_class_id INT,
    bidang_id INT,                ← NEW COLUMN ✅
    created_by_admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⏱️ Timeline

| Step | Action | Time |
|------|--------|------|
| 1 | Stop containers | 10 sec |
| 2 | Rebuild images | 30 sec |
| 3 | Start containers | 5 sec |
| 4 | Wait for PostgreSQL | 20 sec |
| 5 | Initialize schema | 10 sec |
| 6 | Seed data | 5 sec |
| 7 | Backend startup | 10 sec |
| 8 | Verify health | 10 sec |
| **TOTAL** | | **~5 minutes** |

Then:
- ✅ Wait for background tasks: ~2 minutes
- **Total elapsed: ~7 minutes**

---

## ✅ How to Verify Success

### Check 1: Database Column Updated ✅

```bash
# Check database columns
docker exec -it pic_postgres psql -U postgres -d pic_app -c \
  "SELECT column_name FROM information_schema.columns WHERE table_name='registration_links';"

# Should show: bidang_id (NOT personnel_type_id)
```

### Check 2: Backend Health ✅

```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Should return: {"status":"ok"}
```

### Check 3: Frontend ✅

```
1. Open: http://localhost:3000
2. Login: admin@example.com / admin123
3. Go to: "Tambah Link Pendaftaran"
4. Check: Bidang dropdown shows 13 sectors ✅
```

### Check 4: API Endpoint ✅

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.data.token')

# Test endpoint
curl -X GET http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[0].bidang'

# Should show bidang data ✅
```

---

## 🔧 Script Details

### migrate-db.sh (Linux/Mac)

**Features:**
- ✅ Colored output (easier to read)
- ✅ Error checking at each step
- ✅ Automatic retry logic
- ✅ Detailed progress messages
- ✅ Health verification
- ✅ Helpful next steps

**File size:** ~7.3 KB
**Lines:** ~200

### migrate-db.bat (Windows)

**Features:**
- ✅ Windows batch syntax
- ✅ Error handling
- ✅ Progress feedback
- ✅ Health checks
- ✅ Detailed logging
- ✅ Compatible with CMD and PowerShell

**File size:** ~5.6 KB
**Lines:** ~150

---

## 🚨 Troubleshooting

### Error: "Docker not found"

**Solution:** Install Docker
```bash
# macOS
brew install docker

# Linux (Ubuntu)
sudo apt-get install docker.io docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

### Error: "Permission denied" (Linux/Mac)

**Solution:** Make script executable
```bash
chmod +x scripts/migrate-db.sh
./scripts/migrate-db.sh
```

### Error: "PostgreSQL failed to start"

**Solution:** Check Docker resources
```bash
# Allocate more resources to Docker
# Go to Docker Desktop → Preferences → Resources
# Set:
#   - CPU: 4 cores
#   - Memory: 8 GB
#   - Disk: 50 GB

# Then try again
./scripts/migrate-db.sh
```

### Error: "Port 5000 already in use"

**Solution:** Stop other services
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Try again
./scripts/migrate-db.sh
```

### Error: "Cannot connect to Docker daemon"

**Solution:** Start Docker
```bash
# Make sure Docker daemon is running
# On Mac: Start Docker Desktop application
# On Linux: sudo systemctl start docker
# On Windows: Start Docker Desktop
```

### Script hangs after "Waiting for PostgreSQL"

**Solution:** Increase Docker resources or wait longer
```bash
# Give it more time (watch logs)
docker-compose logs postgres

# Check CPU usage
docker stats

# If still hung, restart Docker
docker-compose down -v
docker system prune -a
./scripts/migrate-db.sh
```

---

## 📝 Manual Alternative (If Script Fails)

### Step 1: Stop and Clean
```bash
docker-compose down -v --remove-orphans
```

### Step 2: Rebuild
```bash
docker-compose build --no-cache backend postgres
```

### Step 3: Start
```bash
docker-compose up -d
```

### Step 4: Wait (3-5 minutes)
```bash
sleep 180  # Wait 3 minutes for initialization
```

### Step 5: Verify
```bash
curl http://localhost:5000/api/health
```

---

## 📚 Additional Resources

### Related Files
- **`backend/prisma/schema.prisma`** - Prisma schema with bidangId
- **`backend/routes/links.js`** - API endpoints updated for bidang
- **`docker-compose.yml`** - Docker compose configuration

### Documentation
- **`MIGRATION_URGENT.md`** - Detailed technical explanation
- **`FIX_NOW_STEPS.md`** - Step-by-step fix guide
- **`IMMEDIATE_ACTION_REQUIRED.txt`** - Quick reference

### Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart services
docker-compose restart backend
docker-compose restart postgres

# Access database
docker exec -it pic_postgres psql -U postgres -d pic_app

# Check database schema
docker exec -it pic_postgres psql -U postgres -d pic_app -c \
  "\d registration_links"

# Clear everything
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

---

## ✨ Features

✅ **Automated** - One command, everything else automatic
✅ **Safe** - Comprehensive error checking
✅ **Fast** - Optimized for speed (~5 minutes)
✅ **Verified** - Health checks at each step
✅ **Cross-platform** - Works on Linux, Mac, Windows
✅ **Informative** - Clear progress messages
✅ **Recovery** - Helpful troubleshooting info
✅ **Complete** - Database validation included

---

## 🎯 Success Criteria

After running the migration script, you should see:

```
[OK] All services running
[OK] Database schema updated (personnel_type_id → bidang_id)
[OK] PostgreSQL is healthy
[OK] Backend is ready

✓ Migration script completed successfully!
```

Then:
1. ✅ Open http://localhost:3000
2. ✅ Login with admin@example.com / admin123
3. ✅ Go to "Tambah Link Pendaftaran"
4. ✅ Select Bidang dropdown → Shows 13 sectors
5. ✅ Submit form → Success
6. ✅ No errors in logs

---

## 📞 Support

If the script fails:

1. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   ```

2. **Try manual steps** (see "Manual Alternative" section above)

3. **Full reset:**
   ```bash
   docker system prune -a --volumes
   ./scripts/migrate-db.sh
   ```

4. **Check issues:**
   - Port conflicts (5000, 3000, 5432)
   - Insufficient Docker resources
   - Corrupted volumes

---

## 🚀 Ready?

### Run Now

**Linux/Mac:**
```bash
chmod +x scripts/migrate-db.sh
./scripts/migrate-db.sh
```

**Windows:**
```cmd
scripts\migrate-db.bat
```

**Then wait ~5 minutes and check http://localhost:3000**

✅ **Migration complete!**
