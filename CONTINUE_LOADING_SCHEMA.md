# ✅ Fixed Constraints - Continue Loading

## The Issue (Now Fixed)

```
ERROR: cannot use subquery in check constraint
```

**Why:** PostgreSQL doesn't allow subqueries in CHECK constraints.

**What I Fixed:** Removed invalid subqueries and replaced with:
- Simple CHECK constraints (valid role/status values)
- Unique indexes with partial WHERE clause (for 1 admin enforcement)

---

## Load Again (Updated constraints.sql)

```bash
# 1. Load fixed constraints
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql && \
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql && \
echo "✅ Constraints loaded successfully!"
```

Should show:
```
ALTER TABLE
ALTER TABLE
...
CREATE INDEX
✅ Constraints loaded successfully!
```

---

## Then Load Seeder

```bash
# Load training data
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql && \
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql && \
echo "✅ Seeder loaded successfully!"
```

---

## Verify Everything

```bash
# Check all tables exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\dt"

# Count trainings
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19

# Check indexes
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\\di idx_only*"
# Should show the two unique indexes
```

---

## Then Restart Backend

```bash
docker restart pic_backend
sleep 5
docker logs pic_backend 2>&1 | tail -30

# Should show:
# ✅ [DB] Connection test successful
# 📋 Registering API routes...
```

---

## Test API

```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status": "OK", "timestamp": "...", "version": "1.0.0"}
```

---

**Run the commands above and tell me if everything loads!** 🚀
