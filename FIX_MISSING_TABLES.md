# 🚀 URGENT: Missing Tables - QUICK FIX

## The Problem

You have this error:
```
ERROR: relation "trainings" does not exist
```

**Why:** Docker database was created but the schema SQL files were NEVER loaded.

---

## The Solution (Pick One)

### Option 1: Automatic (RECOMMENDED - Using Updated docker-compose)

I just updated `docker-compose.yml` to **automatically load schema on startup**.

**Do this:**

```bash
# 1. Delete existing database volume
docker-compose down -v

# 2. Start fresh (schema will auto-load)
docker-compose up -d

# 3. Wait 30 seconds
sleep 30

# 4. Verify tables exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"

# Should show:
# public | documents                 | table
# public | registration_links        | table
# public | registrations             | table
# public | trainings                 | table
# public | users                     | table

# 5. Verify training data
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"

# Should show: 19
```

---

### Option 2: Manual (If Option 1 doesn't work)

```bash
# 1. Load schema
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql

# 2. Load constraints
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql

# 3. Load training data
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql

# 4. Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19
```

---

## What Changed

**I updated `docker-compose.yml`:**

Added these volume mounts to PostgreSQL:
```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
  - ./backend/database/constraints.sql:/docker-entrypoint-initdb.d/02-constraints.sql
  - ./backend/database/2026-training-seeder-FINAL.sql:/docker-entrypoint-initdb.d/03-seeder.sql
```

PostgreSQL automatically runs files in `/docker-entrypoint-initdb.d/` alphabetically on first startup.

---

## After Tables Are Loaded

**Check backend connection:**

```bash
docker logs pic_backend 2>&1 | grep -i "connection\|database" | head -5
```

Should show:
```
✅ [DB] Connection test successful
```

---

## Test Everything

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Auth status
curl http://localhost:5000/api/admin/auth/status

# 3. Training count via backend (won't work without token, but check error type)
curl http://localhost:5000/api/admin/training
```

---

## If Still Getting 404

After tables are loaded, if still getting 404:

```bash
# Check backend logs
docker logs pic_backend -f

# Should show:
# 📋 Registering API routes...
#    ✅ /api/admin/auth
#    ✅ /api/admin/training
#    ✅ /api/admin/links
#    ✅ Ready to receive requests!
```

If not showing, backend isn't starting properly. Share the full logs!

---

## Summary

✅ **Option 1 (Recommended):**
```bash
docker-compose down -v && docker-compose up -d && sleep 30 && \
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
```

Run this and tell me the output! 🚀
