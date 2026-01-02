# 📄 Database Migration Fix - Missing Tables

**Issue Date:** December 31, 2025, 10:01 AM +07  
**Status:** 튠 Requires database migration

---

## 🔴 Problem

The application throws errors when trying to access PIC, Marketing, and ProgramType dropdowns:

```
ERROR: relation "PIC" does not exist
ERROR: relation "Marketing" does not exist
ERROR: relation "ProgramType" does not exist
ERROR: column RegistrationLink.picId does not exist
```

**Cause:** Prisma schema defines these tables, but the **database migration hasn't been applied yet**. The actual database doesn't have these tables.

---

## ✅ Solution

### Step 1: Generate Missing Migration

```bash
# Enter backend container
docker exec -it pic_backend bash

# Generate migration from schema changes
npm run prisma:generate

# Create migration
npm run prisma:migrate
# Or
prisma migrate dev --name add_pic_marketing_programtype
```

### Step 2: Apply Migration to Database

```bash
# Still in container - deploy the migration
npm run prisma:deploy
# Or
prisma migrate deploy
```

### Step 3: Seed the Database with Data

```bash
# Seed with PIC, Marketing, ProgramType data
npm run prisma:seed
# Or
ts-node prisma/seed.ts
```

### Step 4: Verify Tables Exist

```bash
# Exit backend container
exit

# Connect to PostgreSQL
docker exec -it pic_postgres psql -U postgres -d pic_app

# Check if tables exist
\dt "PIC"
\dt "Marketing"
\dt "ProgramType"
\dt "RegistrationLink"

# Should show:
#  public | PIC           | table | postgres
#  public | Marketing     | table | postgres
#  public | ProgramType   | table | postgres

# Exit psql
\q
```

---

## 🚀 Quick Fix (One Command)

If you want to do everything at once:

```bash
# Reset database, run all migrations, and seed data
docker exec -it pic_backend npm run prisma:reset

# ⚠️ WARNING: This will DELETE all existing data and reset to clean state
# Only use if you're in development and data loss is acceptable
```

---

## 🔍 Troubleshooting

### If migration still fails:

```bash
# Check migration status
docker exec -it pic_backend npm run prisma:status

# View pending migrations
prisma migrate status

# Force reset (⚠️ deletes all data)
docker exec -it pic_backend npm run prisma:reset
```

### If seed data isn't in database:

```bash
# Verify data was seeded
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) as pic_count FROM \"PIC\";"
# Should return: 7

# If empty, run seed again
docker exec -it pic_backend npm run prisma:seed
```

### Check which migrations have been applied:

```bash
# View migration history
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT * FROM \"_prisma_migrations\";"
```

---

## 📊 What Each Step Does

| Step | Command | What It Does |
|------|---------|-------------|
| 1 | `prisma generate` | Regenerates Prisma client from schema |
| 2 | `prisma migrate dev` | Creates migration file for schema changes |
| 3 | `prisma migrate deploy` | Applies migration to database |
| 4 | `prisma db seed` | Runs seed.ts to populate data |
| 5 | Verify | Checks that tables exist with data |

---

## ✅ After Fix - Verification

### Check Backend Logs

```bash
docker logs pic_backend | tail -30

# Should show:
# ✅ [Prisma] Successfully connected to database
# ✅ Ready to receive requests!
```

### Test Endpoints

```bash
# List PIC
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: { "success": true, "data": [...] }

# List Marketing  
curl http://localhost:5000/api/admin/master-data/marketing \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: { "success": true, "data": [...] }

# List ProgramType
curl http://localhost:5000/api/admin/master-data/program_types \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: { "success": true, "data": [...] }
```

### Verify in Admin Panel

1. Open: http://localhost:3000/admin/links
2. Click "Buat Link Baru"
3. Open DevTools Network tab
4. Should see:
   - ✅ `GET /api/admin/master-data/pic` → 200 OK
   - ✅ `GET /api/admin/master-data/marketing` → 200 OK
   - ✅ `GET /api/admin/master-data/program_types` → 200 OK
5. Dropdowns populated with values

---

## 💡 Why This Happened

Prisma schema changes require database migrations:

1. **Schema Updated** ✅ (added PIC, Marketing, ProgramType models)
2. **Migration NOT Created** ❌ (no migration file for these changes)
3. **Database NOT Updated** ❌ (old schema still in database)
4. **Code Tries to Use New Tables** ❌ (gets "table doesn't exist" errors)

**Solution:** Create and apply the missing migration

---

## 📄 Migration Files Location

Migration files are stored in:
```
backend/prisma/migrations/
```

After running `prisma migrate dev`, you'll see a new folder with a timestamp and migration SQL:
```
backend/prisma/migrations/20251231_add_pic_marketing_programtype/
├── migration.sql  ← The actual SQL changes
└── (migration metadata)
```

This SQL file will contain:
```sql
CREATE TABLE "PIC" (...);
CREATE TABLE "Marketing" (...);
CREATE TABLE "ProgramType" (...);
ALTER TABLE "RegistrationLink" ADD "picId" ...;
... etc
```

---

## 🔃 Complete Step-by-Step Solution

```bash
# 1. Stop containers
docker-compose down

# 2. Start just the backend and database
docker-compose up -d pic_backend pic_postgres

# 3. Wait 5 seconds for database to be ready
sleep 5

# 4. Enter backend container
docker exec -it pic_backend bash

# 5. Generate Prisma client
npm run prisma:generate

# 6. Create migration for schema changes
npm run prisma:migrate
# When prompted for name, type: add_pic_marketing_programtype

# 7. Deploy migration (applies to database)
npm run prisma:deploy

# 8. Seed database with data
npm run prisma:seed

# 9. Exit container
exit

# 10. Restart all containers
docker-compose up -d

# 11. Verify
docker logs pic_backend | grep -i "ready\|error"
docker logs pic_frontend | grep -i "ready\|error"
```

---

## 퉪 Warning: prisma:reset

```bash
# This will:
# 1. Delete all data in the database
# 2. Drop all tables
# 3. Re-run all migrations
# 4. Re-seed data

# ⚠️ USE ONLY IF YOU DON'T CARE ABOUT LOSING DATA
docker exec -it pic_backend npm run prisma:reset
```

**Use this only in development!** Never run this on production data.

---

## 📝 Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Tables missing | Migration not applied | Run `prisma migrate deploy` |
| Data empty | Seed not run | Run `prisma db seed` |
| Client outdated | Schema changed | Run `prisma generate` |
| Everything broken | Schema out of sync | Run `prisma reset` |

**Status after fix:** ✅ All tables created, populated with data, dropdowns working

---

**Last Updated:** December 31, 2025 10:01 AM +07