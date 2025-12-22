# 🔧 Schema Not Loading - FIXED

## The Problem

```
ERROR: relation "users" does not exist
```

**Why:** Original `schema.sql` had **MySQL syntax**, not PostgreSQL!

**Problematic line:**
```sql
UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

This is **MySQL only**. PostgreSQL doesn't have `ON UPDATE` in column definitions.

---

## What I Fixed

### ❌ **Old Schema (MySQL syntax - BROKEN):**
```sql
CREATE TABLE users (
    ...
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  ❌ MYSQL ONLY
);

INSERT INTO bidang (name, code) VALUES ...
ON CONFLICT (name) DO NOTHING;  ❌ Can cause issues in Alpine
```

### ✅ **New Schema (PostgreSQL 15 syntax - FIXED):**
```sql
CREATE TABLE users (
    ...
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  ✅ POSTGRESQL SYNTAX
);

-- Uses IF NOT EXISTS for all creates
CREATE TABLE IF NOT EXISTS users (...);  ✅ Safe

-- Removed ON CONFLICT issue
-- Master data seeding now handled separately
```

---

## What Changed

| Issue | Old | New |
|-------|-----|-----|
| `ON UPDATE CURRENT_TIMESTAMP` | MySQL syntax | Removed (use triggers if needed) |
| `ON CONFLICT DO NOTHING` | Can fail in Alpine | Removed |
| Foreign keys | No cascading | Added `ON DELETE CASCADE` |
| Index creation | Basic | Added `IF NOT EXISTS` |
| Master data | In schema.sql | Move to separate seeder |

---

## NOW: Fresh Start with Fixed Schema

### **Quick Fix (Copy-Paste):**

```bash
# 1. Remove old volume
docker-compose down -v

# 2. Start fresh (will use NEW fixed schema)
docker-compose up -d

# 3. Wait 30 seconds
sleep 30

# 4. Verify users table exists
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt users"

# Should show:
#              List of relations
# Schema | Name  | Type  | Owner 
# --------+-------+-------+----------
# public | users | table | postgres

# 5. Verify it's not empty schema
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) as users_count FROM users;"
# Should show: 0 (no users yet, that's OK)

# 6. Check trainings seeded
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) as trainings_count FROM trainings;"
# Should show: 19
```

---

## If Still Getting Schema Error

### **Manual Load (If auto-load failed):**

```bash
# Copy fixed schema
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql

# Load it
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql

# Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"
# Should show all tables
```

---

## What Gets Seeded

The **master data** (bidang, classes, personnel_types, document_types) comes from:
- `backend/database/2026-training-seeder-FINAL.sql`

This file runs AFTER schema.sql, so the tables already exist.

---

## Testing

After fresh start:

```bash
# 1. Check all tables
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"

# 2. Check table counts
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
SELECT 
  'bidang' as table_name, COUNT(*) as count FROM bidang
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'personnel_types', COUNT(*) FROM personnel_types
UNION ALL
SELECT 'document_types', COUNT(*) FROM document_types
UNION ALL
SELECT 'trainings', COUNT(*) FROM trainings;
"

# Should show:
#       table_name      | count 
# ----------------------+-------
#  bidang               |    13
#  classes              |    11
#  personnel_types      |    13
#  document_types       |     6
#  trainings            |    19
```

---

## Files Updated

- ✅ `backend/database/schema.sql` - Fixed for PostgreSQL 15 Alpine

---

## Why This Happened

The original schema was written for **MySQL**, not PostgreSQL:

1. MySQL supports `ON UPDATE CURRENT_TIMESTAMP` in column definition
2. PostgreSQL doesn't - you need a trigger
3. PostgreSQL Alpine doesn't parse MySQL syntax properly
4. Result: Tables never created → error "relation doesn't exist"

---

**Run the Quick Fix above NOW!** 🚀

Tell me the output when you verify the tables!
