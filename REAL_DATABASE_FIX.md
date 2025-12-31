# 🔥 REAL DATABASE FIX - Duplicate Table Issue

**Status:** 🚨 CRITICAL - Database has duplicate tables in BOTH PascalCase and snake_case

**Problem Found:**
```
PASCAL CASE (PIC, Marketing, ProgramType):  ← Prisma expects these
snake_case (pic, marketing, program_type):  ← Old migrations created these
```

This creates **DUPLICATE TABLE DEFINITIONS** - your database is confused!

---

## 🎯 The Issue Explained

### What Happened:
1. Old migrations created tables in **snake_case** naming
2. Current Prisma schema expects **PascalCase** models
3. Prisma has `@@map()` directives to handle the mapping
4. But **BOTH table versions exist in database** = CONFLICT!

### Why Dropdowns Don't Work:
- API queries using Prisma (PascalCase models)
- But Prisma `@@map()` points to snake_case tables
- If old snake_case tables have wrong/no data = API returns empty!

---

## ✅ REAL FIX (3 OPTIONS)

### Option A: Clean Start (Recommended for Development) 🔄

**This will DELETE all data and recreate everything!**

```bash
# 1. Stop containers
docker-compose down

# 2. Remove PostgreSQL volume (DELETES ALL DATA!)
docker volume rm picnew_postgres_data

# 3. Start fresh
docker-compose up -d

# 4. Wait for backend to start (check logs)
docker logs pic_backend -f

# 5. Watch for:
# ✓ Migrations deployed
# ✓ Database seeded successfully
# ✓ Ready to receive requests!
```

**Result:** Fresh database with correct tables only.

---

### Option B: Cleanup Duplicate Tables (Keep Existing Data) 🧹

**This will DELETE duplicate snake_case tables while keeping actual data!**

```bash
# 1. Connect to database
docker exec -it pic_postgres psql -U postgres -d pic_app

# 2. Run these SQL commands to DROP duplicates:

-- CHECK what tables exist
\dt

-- DROP the snake_case duplicates ONLY (the wrong ones)
DROP TABLE IF EXISTS pic CASCADE;
DROP TABLE IF EXISTS marketing CASCADE;
DROP TABLE IF EXISTS program_type CASCADE;

-- VERIFY only PascalCase tables remain
\dt

# 3. Exit
\q

# 4. Restart backend
docker-compose restart pic_backend

# 5. Check logs
docker logs pic_backend -f
```

**Caution:** Only works if your data is in the PascalCase tables. If data is in snake_case tables, this will lose it!

---

### Option C: Migrate Data Between Table Versions 📊

**For when you have important data in BOTH table versions!**

```bash
# 1. Connect to database
docker exec -it pic_postgres psql -U postgres -d pic_app

# 2. Check which table has data
SELECT 'PIC' as table_name, COUNT(*) as count FROM "PIC"
UNION ALL
SELECT 'pic' as table_name, COUNT(*) as count FROM "pic";

# 3a. If data is in lowercase 'pic', copy to uppercase 'PIC':
INSERT INTO "PIC" (id, name, "createdAt", "updatedAt") 
SELECT id, name, "createdAt", "updatedAt" FROM "pic"
ON CONFLICT DO NOTHING;

# 3b. Then drop the snake_case table:
DROP TABLE IF EXISTS pic CASCADE;

# Similar for Marketing and ProgramType...

# 4. Exit and restart
\q
docker-compose restart pic_backend
```

---

## 🚀 Recommended Path Forward

### For Development Environment:
**Use Option A** (Clean Start) - Fastest and cleanest
```bash
docker-compose down
docker volume rm picnew_postgres_data
docker-compose up -d
```

### For Production Environment:
**Use Option C** (Migrate Data) - Preserves existing registrations
```bash
# Check data first
# Copy where needed
# Drop duplicates
# Restart
```

---

## 🔍 How to Verify the Fix Works

### Step 1: Check Database Structure
```bash
# Connect
docker exec -it pic_postgres psql -U postgres -d pic_app

# List tables
\dt

# Should ONLY show:
#  public | Bidang                 | table | postgres
#  public | Marketing              | table | postgres  ← PascalCase only!
#  public | PIC                    | table | postgres  ← PascalCase only!
#  public | ProgramType            | table | postgres  ← PascalCase only!
#  ... other tables ...
#
# Should NOT show:
#  public | pic                    | table | postgres  ← DELETE THESE
#  public | marketing              | table | postgres  ← DELETE THESE  
#  public | program_type           | table | postgres  ← DELETE THESE
```

### Step 2: Check Data Count
```sql
-- Count records in each table
SELECT COUNT(*) as pic_count FROM "PIC";
SELECT COUNT(*) as marketing_count FROM "Marketing";
SELECT COUNT(*) as program_type_count FROM "ProgramType";

-- Should show:
-- pic_count      | 7
-- marketing_count| 12  
-- program_type_count | 3
```

### Step 3: Test API
```bash
# Get PIC (should return 7 records)
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Marketing (should return 12 records)
curl http://localhost:5000/api/admin/master-data/marketing \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Program Types (should return 3 records)
curl http://localhost:5000/api/admin/master-data/program_types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Test Admin Panel
1. Open: http://localhost:3000/admin/links
2. Click "Buat Link Baru"
3. Dropdowns should all be populated:
   - ✓ PIC: 7 options
   - ✓ Marketing: 12 options
   - ✓ Program Type: 3 options

**All working = FIX SUCCESSFUL!** ✅

---

## 🆘 Troubleshooting

### If Dropdowns Still Empty:
```bash
# 1. Check backend logs
docker logs pic_backend -f | grep -i "error\|pic\|marketing"

# 2. Check database directly
docker exec -it pic_postgres psql -U postgres -d pic_app -c \
  "SELECT * FROM \"PIC\" LIMIT 10;"

# 3. If table doesn't exist:
docker exec pic_backend npm run prisma:migrate
docker exec pic_backend npm run prisma:seed

# 4. Restart
docker-compose restart pic_backend
```

### If Migrations Fail:
```bash
# Check migration status
docker exec pic_backend npm run prisma:status

# Reset and restart
docker exec pic_backend npm run prisma:reset
docker-compose restart pic_backend
```

---

## 📋 Table Naming Reference

**Correct (PascalCase) - What Prisma Expects:**
```
PIC
Marketing
ProgramType
Bidang
TrainingClass
PersonnelType
```

**Wrong (snake_case) - Delete These:**
```
pic                  ← DELETE
marketing            ← DELETE
program_type         ← DELETE
bidang
training_class
personnel_type
```

---

## 🎯 Why This Matters

**Prisma Schema Mapping:**
```typescript
model PIC {
  id    Int @id @default(autoincrement())
  name  String @unique
  @@map("pic")  // ← Maps PIC model to "pic" table
}
```

**Translation:**
- Prisma code queries: `prisma.pic.findMany()` (camelCase model)
- Actual table in DB: `"pic"` (snake_case, via @@map)
- BUT if BOTH `PIC` and `pic` tables exist → CONFUSION!

**Solution:** Keep ONLY PascalCase tables with `@@map()` directives!

---

## ✨ Summary

| Issue | Fix | Time |
|-------|-----|------|
| Duplicate tables | Delete snake_case duplicates | 2 min |
| Empty dropdowns | Reseed database | 1 min |
| API still failing | Check table names in DB | 1 min |
| Data lost | Restore from backup | varies |

---

## 🚀 Next Action

**Choose your path:**

1. **Clean Start** (Dev): Delete volume, restart
2. **Preserve Data** (Prod): Migrate and cleanup
3. **Verify**: Run checks in Step 2
4. **Test**: Try API and admin panel
5. **Success**: Dropdowns populate! ✅

---

**Status:** Ready for execution  
**Risk Level:** Low (if following Option A) / Medium (if following Option C)  
**Expected Outcome:** Working dropdowns with correct database schema
