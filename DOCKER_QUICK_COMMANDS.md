# 🐳 Docker Quick Commands - Copy & Paste Ready

## Check if Docker PostgreSQL is Running

```bash
docker ps -a | grep pic_postgres
```

**Expected output:**
```
PIC_ID  IMAGE              COMMAND                 STATUS                NAMES
abc123  postgres:15-alpine "docker-entrypoint.s…"  Up 2 minutes (healthy)  pic_postgres
```

**If you see:**
- `Status: Exited` → Container stopped, start it: `docker start pic_postgres`
- Nothing → Container doesn't exist, run: `docker-compose up -d`

---

## Connect to PostgreSQL and See Tables

```bash
# List all databases
docker exec -it pic_postgres psql -U postgres -l
```

**Look for:** `pic_app` in the list

If missing:
```bash
docker exec -it pic_postgres psql -U postgres -c "CREATE DATABASE pic_app;"
```

---

## See All Tables in pic_app Database

```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"
```

**Expected output:**
```
                 List of relations
 Schema |           Name            | Type  | Owner 
--------+---------------------------+-------+----------
 public | documents                 | table | postgres
 public | registration_links        | table | postgres
 public | registrations             | table | postgres
 public | trainings                 | table | postgres
 public | users                     | table | postgres
```

If empty, schema not loaded. Load it:
```bash
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql
```

---

## See Training Data

```bash
# Count how many trainings
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"

# Expected: 19 (if seeded)
```

```bash
# See first 5 trainings
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT id, name, duration_days FROM trainings LIMIT 5;"

# Expected:
#  id |           name            | duration_days 
# ----+---------------------------+---------------
#   1 | AHLI K3 UMUM               |            16
#   2 | AUDITOR SMK3               |             5
#   ...
```

---

## Load Training Data (If Missing)

```bash
# Copy seeder file
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql

# Load it
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql

# Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19
```

---

## Check Backend Connection to Database

```bash
# View backend logs
docker logs pic_backend | grep -i "connection\|error\|database"

# Look for:
# ✅ [DB] Connection test successful  → GOOD
# ❌ [DB CRITICAL] DATABASE CONNECTION TEST FAILED  → BAD
```

If bad, check .env inside container:
```bash
docker exec -it pic_backend cat /app/.env | grep DB_

# Should show:
# DB_HOST=postgres  (NOT localhost)
# DB_PORT=5432
# DB_NAME=pic_app
```

---

## Start Everything Fresh

```bash
# Stop everything
docker-compose down -v

# Start everything
docker-compose up -d

# Wait 30 seconds for PostgreSQL to be ready
sleep 30

# Load schema
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql

# Load training data
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql

# Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
```

---

## Open Interactive PostgreSQL Shell

```bash
# Enter the shell
docker exec -it pic_postgres psql -U postgres -d pic_app

# Now you can type SQL commands:
SELECT * FROM trainings WHERE id = 1;
SELECT COUNT(*) FROM users;
SELECT * FROM registration_links;

# Exit with: \q
```

---

## View All Container Logs

```bash
# PostgreSQL logs
docker logs pic_postgres

# Backend logs
docker logs pic_backend

# Frontend logs
docker logs pic_frontend

# Real-time logs (press Ctrl+C to exit)
docker logs -f pic_backend
```

---

## Restart Containers

```bash
# Restart PostgreSQL
docker restart pic_postgres

# Restart backend
docker restart pic_backend

# Restart frontend
docker restart pic_frontend

# Restart all
docker-compose restart
```

---

## Remove Everything (Complete Reset)

```bash
# Stop and remove all containers, volumes
docker-compose down -v

# Remove all images
docker image prune -f

# Start fresh
docker-compose up -d
```

---

## Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api

# Check if trainings endpoint works (requires auth)
curl -H "Authorization: Bearer FAKE_TOKEN" http://localhost:5000/api/admin/training
```

---

## One-Command Verification

Copy and run this entire block:

```bash
echo "=== Docker Status ==="  && \
docker ps -a | grep pic_ && \
echo && \
echo "=== Databases ===" && \
docker exec -it pic_postgres psql -U postgres -l | grep pic_app && \
echo && \
echo "=== Tables ===" && \
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt" && \
echo && \
echo "=== Training Count ===" && \
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) as training_count FROM trainings;" && \
echo && \
echo "=== Backend Status ===" && \
curl -s http://localhost:5000/health | jq .
```

---

## Still Getting 404?

Check these in order:

```bash
# 1. Container running?
docker ps -a | grep pic_backend

# 2. Backend logs show routes registered?
docker logs pic_backend 2>&1 | tail -20

# 3. Database connected?
docker logs pic_backend 2>&1 | grep -i "connection"

# 4. Health check works?
curl http://localhost:5000/health

# 5. Check .env variables
docker exec -it pic_backend cat /app/.env | head -10
```

---

## Pro Tips

**See last N lines of logs:**
```bash
docker logs --tail 50 pic_backend  # Last 50 lines
```

**Follow logs in real-time:**
```bash
docker logs -f pic_backend
```

**Search logs for errors:**
```bash
docker logs pic_backend 2>&1 | grep -i "error\|failed\|connection"
```

**Run command in container:**
```bash
docker exec pic_backend npm run dev     # In backend container
docker exec pic_postgres pg_dump pic_app > backup.sql  # Backup database
```

---

**Copy-paste any of these commands and let me know the output!** 🚀
