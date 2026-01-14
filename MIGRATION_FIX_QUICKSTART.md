# Quick Start: Migration Fix 🚀

## TL;DR - Just Run This

```bash
# Pull latest changes
git pull origin automated-migration

# Rebuild container (applies migrations automatically)
docker-compose down
docker-compose up -d --build

# Verify fix
docker-compose logs backend | grep -i migration

# Test API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/links

# Should return 200 OK (no bidang_id error)
```

---

## What Changed?

### Files Modified

1. **`backend/Dockerfile`** - Now runs migrations on startup
2. **`docker-compose.yml`** - Added DATABASE_URL for Prisma
3. **`MIGRATION_FIX.md`** - Documentation (new file)

### What It Does

When container starts:
```
1. npm ci               → Install dependencies
2. prisma migrate      → Apply pending migrations
3. npm run dev         → Start application
```

This ensures the `bidang_id` column is created in the database before the app tries to use it.

---

## Expected Output

```bash
$ docker-compose up -d --build

# You should see in logs:
# backend_1 | npm ci
# backend_1 | added 1234 packages in 5s
# backend_1 | 
# backend_1 | > Running Prisma migrations...
# backend_1 | prisma:info Using environment variable DATABASE_URL
# backend_1 | ✔ Applying migration(s): 20260109_add_bidang_to_registration_links
# backend_1 | Successfully applied migrations
# backend_1 | 
# backend_1 | > npm run dev
# backend_1 | Server running on port 5000
```

---

## ??? Still Getting Error?

### Check 1: Logs
```bash
docker-compose logs -f backend
# Look for "Applying migration" or errors
```

### Check 2: Manual Migration
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Check 3: Database Column Exists
```bash
docker-compose exec postgres psql -U postgres -d pic_app \
  -c "\d registration_links" | grep bidang
```

### Check 4: Nuclear Option (Loses Data ⚠️)
```bash
# WARNING: This deletes the database
docker-compose down -v
docker-compose up -d
# Wait 30 seconds for migrations to run
```

---

## Commits Applied

| Commit | Message |
|--------|----------|
| `68a0cdb` | fix: update Dockerfile to run migrations |
| `fee7e9b` | fix: update docker-compose.yml with DATABASE_URL |
| `16e6c6c` | docs: add MIGRATION_FIX.md documentation |

---

## Next Step

Read `MIGRATION_FIX.md` for complete documentation:
- Root cause explanation
- Detailed changes made
- Verification steps
- Prevention tips
- Troubleshooting guide

---

**Status:** ✅ Fixed and Ready to Use
