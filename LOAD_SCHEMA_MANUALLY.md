# 🚀 LOAD SCHEMA MANUALLY - QUICK FIX

## The Issue

Docker volumes didn't auto-load schema. We need to load manually.

## Quick Fix (Copy-Paste These Commands)

```bash
# 1. Copy schema file into container
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql

# 2. Load schema
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql

# 3. Copy constraints
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql

# 4. Load constraints
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql

# 5. Copy seeder
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql

# 6. Load seeder
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql

# 7. Verify tables exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"

# 8. Check data
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19
```

---

## If You Get Errors

### Error: "relation already exists"

Tables already partially loaded. That's OK, continue.

### Error: "permission denied"

```bash
# Make sure file is readable
docker exec -it pic_postgres chmod 644 /tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql
```

### Error: "syntax error at or near"

Schema has a syntax error. Run:
```bash
docker logs pic_postgres 2>&1 | tail -30
```

Share the error!

---

## Verify It Worked

```bash
# List all tables
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"

# Should show:
#  public | audit_logs                | table
#  public | bidang                    | table
#  public | certificates              | table
#  ...
#  public | users                     | table  <-- THIS MUST EXIST
#  public | trainings                 | table

# Count training data
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19
```

---

## Then Test Backend

```bash
# Restart backend
docker restart pic_backend

# Check logs
docker logs pic_backend 2>&1 | tail -20

# Should show:
# ✅ [DB] Connection test successful
# 📋 Registering API routes...
#    ✅ /api/admin/auth
#    ✅ /api/admin/training
#    ✅ /api/admin/links

# Test
curl http://localhost:5000/health
```

---

## All In One Command

```bash
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql && \
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql && \
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql && \
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql && \
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql && \
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql && \
echo "=== VERIFICATION ===" && \
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) as trainings_count FROM trainings;" && \
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"
```

**Run this and tell me if you see 19 trainings and all tables!** 🚀
