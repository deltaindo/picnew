# 🛨 Pull Automated Migration Branch

**TL;DR:** Everything is automated - just checkout, rebuild, and start! 🚀

---

## 🪤 What You Get

When you pull this branch, you get:

✅ **Automatic Database Migration**
- No manual SQL commands
- Runs on container startup
- Migrates new tables (PIC, Marketing, ProgramType)

✅ **Automatic Data Seeding**
- Populates PIC, Marketing, ProgramType with initial data
- Runs only on first startup
- Safe to restart containers

✅ **Zero Configuration**
- Just pull the branch
- Rebuild containers
- Everything works!

---

## 🚀 How to Pull

### Option A: Fresh Pull (Recommended)

```bash
# Navigate to repo
cd ~/deltaindo/picnew

# Switch to automated migration branch
git checkout automated-migration

# Pull latest changes
git pull origin automated-migration

# Verify you're on right branch
git branch
# Should show: * automated-migration
```

### Option B: From new-local-version Branch

```bash
# If you're already on new-local-version
git checkout automated-migration
git pull origin automated-migration
```

---

## 💻 Build & Start

### Step 1: Stop Old Containers
```bash
docker-compose down
```

### Step 2: Clean Up Old Images (Optional but Recommended)
```bash
docker image prune -a -f
```

### Step 3: Rebuild Backend Container
```bash
# Rebuild with new Dockerfile that includes entrypoint
docker-compose build --no-cache pic_backend
```

### Step 4: Start All Containers
```bash
docker-compose up -d
```

---

## 튳 Watch the Magic Happen

### View Real-Time Logs
```bash
docker logs pic_backend -f
```

### You'll See This:
```
[ENTRYPOINT] Waiting for PostgreSQL to be ready...
[✓] PostgreSQL is ready
[ENTRYPOINT] Generating Prisma Client...
[✓] Prisma Client generated
[ENTRYPOINT] Deploying pending migrations...
[✓] Migrations deployed
[ENTRYPOINT] Seeding database with initial data...
[✓] Database seeded successfully
[ENTRYPOINT] Starting backend server...

🚀 PIC APP BACKEND - STARTED
✅ Ready to receive requests!
```

**That's it!** Everything is automated. 🌟

---

## ✅ Verify It Works

### Test 1: Check Backend Status
```bash
# Backend should be running
docker ps | grep pic_backend
# Status: UP

# Should see "Ready to receive requests!"
docker logs pic_backend | grep "Ready to receive requests"
```

### Test 2: Check Database Tables
```bash
# List all tables
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"

# Should show new tables:
#  PIC
#  Marketing
#  ProgramType
#  RegistrationLink (updated columns)
```

### Test 3: Test API Endpoints
```bash
# Get PIC data (requires token - you'll get auth errors initially which is OK)
curl http://localhost:5000/api/admin/master-data/pic

# Should eventually return:
# {"success": true, "data": [{"id": 1, "name": "Ghaida Trisnanda", ...}, ...]}
```

### Test 4: Admin Panel
1. Open: http://localhost:3000/admin/login
2. Click "Buat Link Baru"
3. All dropdowns should be populated:
   - ✅ PIC: Ghaida Trisnanda, Yuyun, Echasita, ...
   - ✅ Marketing: Agustyani, Atikah, Anik, ...
   - ✅ Program Type: Reguler, Inhouse, BNSP

---

## 😸 Switching Back to new-local-version

If you want to go back to the original branch:

```bash
# Stash any local changes
git stash

# Switch back
git checkout new-local-version
git pull origin new-local-version

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📄 Files in This Branch

New files added to `automated-migration` branch:

```
backend/
├── docker-entrypoint.sh ← Auto-migration script
├── Dockerfile ← Updated with entrypoint
├── scripts/
│  └── migrate-setup.sh ← Manual migration script
├── .env.migration ← Migration config


root/
├── AUTOMATED_MIGRATION_README.md ← Detailed guide
└── PULL_AUTOMATED_MIGRATION.md ← This file
```

---

## ❓ FAQ

### Q: Will it delete my data?
**A:** No! It only:
- Creates new tables (doesn't modify existing ones)
- Adds new columns to RegistrationLink
- Seeds new data only if tables are empty

### Q: What if I restart the container?
**A:** 
Safe to restart. The migration script:
- Checks if migrations are already applied (skips if yes)
- Checks if data is already seeded (skips if yes)
- Idempotent - safe to run multiple times

### Q: How long does it take?
**A:** Usually 5-10 seconds:
- 1-2s: Wait for PostgreSQL
- 1-2s: Generate Prisma client
- 1-2s: Deploy migrations
- 1-2s: Seed data
- 1-2s: Start backend

### Q: Can I use this in production?
**A:** Yes! It's designed for both dev and prod:
- Automated setup reduces human error
- Idempotent design ensures safety
- Works with CI/CD pipelines

### Q: What if something goes wrong?
**A:** Check logs:
```bash
docker logs pic_backend -f

# Look for errors and refer to:
# - AUTOMATED_MIGRATION_README.md (Troubleshooting section)
# - DATABASE_MIGRATION_FIX.md (Manual fixes)
```

---

## 🚧 Before Pulling

Make sure you:
- [ ] Have Docker and Docker Compose installed
- [ ] Have ~2GB free disk space (for rebuilt image)
- [ ] PostgreSQL data will NOT be deleted (only new tables added)
- [ ] Backend will restart (normal)
- [ ] Existing links/registrations will NOT be affected

---

## 🚀 You're Ready!

### Quick Command Copy-Paste

```bash
# 1. Pull branch
git checkout automated-migration && git pull origin automated-migration

# 2. Rebuild & start
docker-compose down && docker-compose build --no-cache pic_backend && docker-compose up -d

# 3. Watch logs
docker logs pic_backend -f

# 4. Wait for "Ready to receive requests!"
# 5. Test: http://localhost:3000/admin/links
```

**Done!** 🎉 Dropdowns will work perfectly.

---

**Need help?**
- 📄 See: `AUTOMATED_MIGRATION_README.md`
- 📄 See: `DATABASE_MIGRATION_FIX.md`
- 📄 See: `FIXES_APPLIED.md`

---

**Status:** ✅ Production Ready  
**Date:** December 31, 2025  
**Branch:** automated-migration
