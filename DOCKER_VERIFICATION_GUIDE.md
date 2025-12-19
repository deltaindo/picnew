# 🐳 Docker PostgreSQL Verification Guide

## Step 1: Check if Docker is Running

```bash
# Check Docker daemon
docker ps

# Should show running containers, or:
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (empty if nothing running)
```

If error "Cannot connect to Docker daemon":
```bash
# Start Docker
docker daemon  # macOS/Linux
# OR open Docker Desktop app
```

---

## Step 2: Check if PostgreSQL Container is Running

```bash
# List all containers (running + stopped)
docker ps -a

# Look for: pic_postgres
# Should show:
# CONTAINER ID   IMAGE              STATUS                    NAMES
# abc123...      postgres:15-alpine Up 2 minutes (healthy)   pic_postgres
```

### If Container Exists but STOPPED:
```bash
# Start it
docker start pic_postgres

# Check status
docker ps -a | grep pic_postgres
# Should now show: "Up X minutes"
```

### If Container Doesn't Exist:
```bash
# Start everything
cd your-project-root
docker-compose up -d

# Check
docker ps -a
# Should show pic_postgres, pic_backend, pic_frontend
```

---

## Step 3: Connect to PostgreSQL in Docker

### Option A: Using Docker Exec (Recommended)

```bash
# Connect to PostgreSQL inside Docker
docker exec -it pic_postgres psql -U postgres -d pic_app

# You should see:
# psql (15.X)
# Type "help" for help.
# pic_app=# 

# Exit with:
# \q
```

### Option B: Using Local psql (If Installed)

```bash
# PostgreSQL runs on localhost:5432 (from docker-compose port mapping)
psql -h localhost -U postgres -d pic_app

# If error "psql: command not found" → install psql first
```

---

## Step 4: List All Databases

Once connected via docker exec:

```bash
docker exec -it pic_postgres psql -U postgres -c "\l"

# Should show:
#                                    List of databases
#      Name      | Owner    | Encoding |  Collate   |    Ctype    | Access privileges 
# ---------------+----------+----------+------------+-------------+-------------------
#  pic_app       | postgres | UTF8     | en_US.utf8 | en_US.utf8  | 
#  postgres      | postgres | UTF8     | en_US.utf8 | en_US.utf8  | 
#  template0     | postgres | UTF8     | en_US.utf8 | en_US.utf8  | ...
#  template1     | postgres | UTF8     | en_US.utf8 | en_US.utf8  | ...
```

**If you DON'T see "pic_app" database:**
```bash
# Create it
docker exec -it pic_postgres psql -U postgres -c "CREATE DATABASE pic_app;"
```

---

## Step 5: List All Tables in pic_app

```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"

# Should show all tables:
#                  List of relations
#  Schema |           Name            | Type  | Owner 
# --------+---------------------------+-------+----------
#  public | registration_links        | table | postgres
#  public | trainings                 | table | postgres
#  public | users                     | table | postgres
#  public | registrations             | table | postgres
#  public | documents                 | table | postgres
#  public | ... (more tables)
```

**If NO tables shown:**
- Database exists but is empty
- Schema files not loaded
- See: "Load Schema Files" section below

---

## Step 6: Check Table Contents

### Count Records in Each Table

```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
  SELECT 
    'trainings' as table_name, COUNT(*) as count FROM trainings
  UNION ALL
  SELECT 'users', COUNT(*) FROM users
  UNION ALL
  SELECT 'registration_links', COUNT(*) FROM registration_links
  UNION ALL
  SELECT 'registrations', COUNT(*) FROM registrations
  UNION ALL
  SELECT 'documents', COUNT(*) FROM documents;
"

# Should show something like:
#       table_name      | count 
# ----------------------+-------
#  trainings            |    19
#  users                |     0  (or 1 if admin created)
#  registration_links   |     0
#  registrations        |     0
#  documents            |     0
```

### View Training Programs (If Seeded)

```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c "
  SELECT id, name, duration_days, start_date, end_date FROM trainings LIMIT 5;
"

# Should show:
#  id |           name            | duration_days |  start_date  |  end_date  
# ----+---------------------------+---------------+--------------+----------
#   1 | AHLI K3 UMUM               |            16 | 2026-01-19   | 2026-02-04
#   2 | AUDITOR SMK3               |             5 | 2026-01-26   | 2026-01-30
#  ...
```

---

## Step 7: Check Backend Connection

### View Backend Logs

```bash
# Show last 50 lines of backend logs
docker logs pic_backend | tail -50

# Watch logs in real-time
docker logs -f pic_backend

# Look for:
# ✅ [DB] Connection test successful
# ✅ /api/admin/auth registered
# ✅ Ready to receive requests!

# OR errors like:
# ❌ [DB CRITICAL] DATABASE CONNECTION TEST FAILED!
# Error: connection refused
```

---

## Step 8: Test Database Connection from Backend

```bash
# Connect to backend container
docker exec -it pic_backend sh

# Once inside, test:
node -e "const pool = require('./db'); pool.query('SELECT NOW()', (err, res) => { if(err) console.error('ERROR:', err.message); else console.log('SUCCESS:', res.rows[0]); });"

# Should output: SUCCESS: { now: 2025-12-19T... }
```

---

## Common Issues & Fixes

### Issue 1: "pic_app database does not exist"

```bash
# Create database
docker exec -it pic_postgres psql -U postgres -c "CREATE DATABASE pic_app;"

# Verify
docker exec -it pic_postgres psql -U postgres -l | grep pic_app
```

### Issue 2: "No tables in pic_app"

Schema files not loaded. Load them:

```bash
# Copy schema file into container
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql

# Load them
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql

# Verify tables exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"
```

### Issue 3: "Connection refused 127.0.0.1:5432"

Backend trying to connect to localhost, but PostgreSQL is in Docker container.

**Check backend/.env:**
```
DB_HOST=localhost  ❌ WRONG (localhost doesn't work from Docker)
DB_HOST=postgres   ✅ CORRECT (Docker service name)
```

If using docker-compose, use service name `postgres`.
If using local PostgreSQL, use `localhost`.

### Issue 4: "Port 5432 already in use"

```bash
# Find what's using port 5432
lsof -i :5432

# Kill it
kill -9 <PID>

# OR change docker-compose port mapping:
# Change: "5432:5432"
# To:     "5433:5432"
```

---

## Full Docker Verification Checklist

```bash
# 1. Docker is running
docker ps
# ✅ Should show containers

# 2. PostgreSQL container exists and is running
docker ps -a | grep pic_postgres
# ✅ Should show: "Up X minutes (healthy)"

# 3. pic_app database exists
docker exec -it pic_postgres psql -U postgres -l | grep pic_app
# ✅ Should show: pic_app | postgres | ...

# 4. Tables exist in pic_app
docker exec -it pic_postgres psql -U postgres -d pic_app -c "\dt"
# ✅ Should show: trainings, users, registration_links, registrations, documents

# 5. Training data seeded
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# ✅ Should show: count = 19

# 6. Backend container running
docker ps -a | grep pic_backend
# ✅ Should show: "Up X minutes"

# 7. Backend logs show successful DB connection
docker logs pic_backend 2>&1 | grep "Connection test"
# ✅ Should show: "✅ [DB] Connection test successful"

# 8. Backend port 5000 accessible
curl http://localhost:5000/health
# ✅ Should return: {"status":"OK",...}
```

---

## Complete Fresh Start (Nuclear Reset)

If everything is broken:

```bash
# 1. Stop all containers
docker-compose down

# 2. Remove volumes (DELETE all data)
docker-compose down -v

# 3. Remove images
docker image rm pic_postgres:15-alpine 2>/dev/null || true
docker image prune -f

# 4. Start fresh
docker-compose up -d

# 5. Wait for PostgreSQL to be healthy
# (check logs)
docker logs pic_postgres

# 6. Load schema
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql

# 7. Load constraints
docker cp backend/database/constraints.sql pic_postgres:/tmp/constraints.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/constraints.sql

# 8. Load training data
docker cp backend/database/2026-training-seeder-FINAL.sql pic_postgres:/tmp/seeder.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/seeder.sql

# 9. Verify
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
# Should show: 19
```

---

## See Database Content Directly

```bash
# Open interactive PostgreSQL shell
docker exec -it pic_postgres psql -U postgres -d pic_app

# Now you can run SQL commands:

# List all trainings
SELECT id, name, duration_days FROM trainings ORDER BY id;

# See a specific training
SELECT * FROM trainings WHERE id = 1;

# Count total records
SELECT COUNT(*) FROM trainings;

# Exit
\q
```

---

## Useful Docker Commands

```bash
# View logs
docker logs pic_postgres      # PostgreSQL logs
docker logs pic_backend       # Backend logs
docker logs pic_frontend      # Frontend logs

# Interactive shell
docker exec -it pic_postgres sh   # PostgreSQL container shell
docker exec -it pic_backend sh    # Backend container shell

# Restart container
docker restart pic_postgres

# Remove and recreate
docker-compose down
docker-compose up -d

# View resource usage
docker stats

# Inspect container
docker inspect pic_postgres
```

---

**Now go check your Docker setup! Follow the checklist and let me know what you find.** 🐳
