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
2. **`backend/package.json`** - Updated Prisma version to 5.22.0
3. **`docker-compose.yml`** - Added DATABASE_URL for Prisma + uses npm install
4. **`MIGRATION_FIX.md`** - Documentation (new file)

### What It Does

When container starts:
```
1. npm install              → Install dependencies (syncs lock file)
2. prisma migrate deploy    → Apply pending migrations
3. npm run dev              → Start application
```

This ensures the `bidang_id` column is created in the database before the app tries to use it.

---

## Expected Output

```bash
$ docker-compose up -d --build

# You should see in logs:
# backend_1 | npm install
# backend_1 | added/up to date XXX packages in 5s
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

## ❌ Still Getting npm Error?

### Error: "npm ci` can only install packages when your package.json and package-lock.json are in sync"

✅ **FIXED!** Now using `npm install` instead of `npm ci` - this is already resolved in the latest commit.

### Check 1: Pull Latest Changes
```bash
git pull origin automated-migration
# Make sure you have commit: 5f133a166 and 7ebe23400
```

### Check 2: Rebuild Fresh
```bash
docker-compose down
docker system prune -f  # Clean up docker cache
docker-compose up -d --build
```

### Check 3: Verify Changes
```bash
grep "npm install" docker-compose.yml  # Should find npm install
grep "@prisma/client" backend/package.json  # Should show ^5.22.0
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
docker system prune -f
docker-compose up -d
# Wait 30 seconds for migrations to run
```

---

## Recent Commits Applied

| Commit | Message |
|--------|----------|
| `7ebe234` | fix: docker-compose use npm install |
| `5f133a1` | fix: Dockerfile use npm install |
| `e9a503f` | fix: package.json Prisma version 5.22.0 |
| `4348342` | docs: quick start guide |
| `16e6c6c` | docs: comprehensive migration fix |
| `fee7e9b` | fix: docker-compose DATABASE_URL |
| `68a0cdb` | fix: Dockerfile migrations |

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
