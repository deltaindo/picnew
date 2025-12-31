# 🪤 Automated Database Migration Setup

**Branch:** `automated-migration`  
**Status:** Ready for deployment  
**Date:** December 31, 2025

---

## ⭐ Overview

This branch includes **fully automated database migration** that runs on container startup. No manual SQL commands needed!

### What's Automated:
- ✅ Waits for PostgreSQL to be ready
- ✅ Generates Prisma Client
- ✅ Deploys pending migrations
- ✅ Seeds database with initial data
- ✅ Starts backend server

**Result:** Everything happens automatically when you start the containers. 🚀

---

## 🚀 Quick Start (3 Steps)

### Step 1: Switch to Automated Migration Branch
```bash
git checkout automated-migration
git pull origin automated-migration
```

### Step 2: Rebuild and Start
```bash
# Stop old containers
docker-compose down

# Rebuild with new Dockerfile
docker-compose build --no-cache pic_backend

# Start all services
docker-compose up -d
```

### Step 3: Watch the Automatic Setup
```bash
# Watch logs while migration runs automatically
docker logs pic_backend -f

# You'll see:
# [ENTRYPOINT] Waiting for PostgreSQL to be ready...
# [✓] PostgreSQL is ready
# [ENTRYPOINT] Generating Prisma Client...
# [✓] Prisma Client generated
# [ENTRYPOINT] Deploying pending migrations...
# [✓] Migrations deployed
# [ENTRYPOINT] Seeding database with initial data...
# [✓] Database seeded successfully
# [ENTRYPOINT] Starting backend server...
# ✅ Ready to receive requests!
```

**That's it!** 🌟 Everything is done automatically.

---

## 📄 What's Included

### 1. Docker Entrypoint Script
**File:** `backend/docker-entrypoint.sh`

Automatically runs on container startup:
- Checks PostgreSQL is ready
- Generates Prisma client
- Deploys migrations
- Seeds database
- Starts backend

### 2. Manual Migration Script
**File:** `backend/scripts/migrate-setup.sh`

For manual migration if needed:
```bash
cd backend
chmod +x scripts/migrate-setup.sh
./scripts/migrate-setup.sh
```

### 3. Updated Backend Dockerfile
**File:** `backend/Dockerfile`

Now includes:
- PostgreSQL client (for readiness checks)
- Entrypoint script mounting
- Automatic migration on startup

### 4. Migration Config
**File:** `backend/.env.migration`

Environment variables for migration automation

---

## ✅ Verification

After containers start, verify everything works:

### Check Backend Logs
```bash
docker logs pic_backend | grep -i "ready\|error"

# Should show:
# ✅ Ready to receive requests!
```

### Test API Endpoints
```bash
# List PIC
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"

# List Marketing
curl http://localhost:5000/api/admin/master-data/marketing \
  -H "Authorization: Bearer YOUR_TOKEN"

# List Program Types
curl http://localhost:5000/api/admin/master-data/program_types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

All should return:
```json
{
  "success": true,
  "data": [ ... ]
}
```

### Test in Admin Panel
1. Open: http://localhost:3000/admin/links
2. Click "Buat Link Baru"
3. Dropdowns should be populated:
   - ✅ PIC: 7 options
   - ✅ Marketing: 12 options
   - ✅ Program Type: 3 options (Reguler, Inhouse, BNSP)

---

## 🧪 Troubleshooting

### If Migration Doesn't Run

```bash
# Check entrypoint script exists
ls -la backend/docker-entrypoint.sh

# Make sure it's executable
chmod +x backend/docker-entrypoint.sh

# Rebuild container
docker-compose build --no-cache pic_backend
docker-compose up -d pic_backend
```

### If PostgreSQL Connection Fails

```bash
# Check PostgreSQL is running
docker logs pic_postgres | tail -20

# Verify connection from backend container
docker exec pic_backend pg_isready -h pic_postgres -p 5432
```

### If Seed Data Doesn't Load

```bash
# Check if tables exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"

# Manually seed
docker exec -it pic_backend npm run prisma:seed
```

### If Migrations Don't Deploy

```bash
# Check migration status
docker exec -it pic_backend npm run prisma:status

# Manually deploy
docker exec -it pic_backend npm run prisma:deploy
```

---

## 📁 How It Works

### Migration Flow
```
Container Startup
      ↓
  ENTRYPOINT script runs
      ↓
  Wait for PostgreSQL
      ↓
  Generate Prisma Client
      ↓
  Deploy pending migrations
      ↓
  Seed database (first time only)
      ↓
  Execute CMD (start backend server)
      ↓
  Backend running with migrated database
```

### Idempotent Design
The migration is **safe to run multiple times**:
- 🌟 Already applied migrations are skipped
- 🌟 Already seeded data is not duplicated
- 🌟 No data loss on restart

---

## 💱 Environment Variables

Optional configuration in `docker-compose.yml`:

```yaml
environment:
  # Skip auto-seeding (if you want to seed manually)
  SEED_DB: "false"
  
  # Database connection (usually automatic)
  DB_HOST: "pic_postgres"
  DB_PORT: "5432"
  DB_USER: "postgres"
```

---

## 📈 What Gets Migrated

The automatic migration creates:

### New Tables
- 🗑 `PIC` - Person In Charge (7 initial records)
- 🗑 `Marketing` - Marketing team members (12 initial records)
- 🗑 `ProgramType` - Program types (3: Reguler, Inhouse, BNSP)

### New Columns in RegistrationLink
- `picId` - Foreign key to PIC
- `marketingId` - Foreign key to Marketing
- `programTypeId` - Foreign key to ProgramType
- `tanggalPelaksanaan` - Training date
- `tanggalSelesai` - Training end date

---

## 🌟 Comparison: Before vs After

### Before (Manual Process)
```bash
# Had to manually run 4-5 commands inside container
docker exec -it pic_backend npm run prisma:generate
docker exec -it pic_backend npm run prisma:migrate
docker exec -it pic_backend npm run prisma:deploy
docker exec -it pic_backend npm run prisma:seed
```

### After (Automated)
```bash
# Just start containers - everything runs automatically!
docker-compose up -d
```

**Result:** 🚀 Faster deployment, fewer mistakes, better DX!

---

## 😸 Merging Back to main-local-version

When ready to merge back:

```bash
# Switch to new-local-version
git checkout new-local-version

# Merge automated-migration branch
git merge automated-migration

# Resolve any conflicts if needed
# Then push
git push origin new-local-version
```

---

## 📄 Files Changed

| File | Purpose |
|------|----------|
| `backend/docker-entrypoint.sh` | Auto-migration on startup |
| `backend/scripts/migrate-setup.sh` | Manual migration script |
| `backend/Dockerfile` | Updated with entrypoint |
| `backend/.env.migration` | Migration config |

---

## 🚀 Deployment Checklist

- [ ] Switched to `automated-migration` branch
- [ ] Pulled latest changes
- [ ] Rebuilt backend container: `docker-compose build --no-cache pic_backend`
- [ ] Started containers: `docker-compose up -d`
- [ ] Watched logs: `docker logs pic_backend -f`
- [ ] Verified migration completed: "Ready to receive requests!"
- [ ] Tested API endpoints (PIC, Marketing, Program Type)
- [ ] Tested admin panel dropdowns
- [ ] All dropdowns populated correctly

**Status:** ✅ Ready for production!

---

## 특 Questions?

Refer to:
- `DATABASE_MIGRATION_FIX.md` - Detailed migration guide
- `FIXES_APPLIED.md` - All fixes applied
- `backend/docker-entrypoint.sh` - Migration logic

---

**Last Updated:** December 31, 2025 10:10 AM +07  
**Branch:** automated-migration  
**Status:** ✅ Production Ready
