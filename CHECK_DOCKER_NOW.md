# 🚀 CHECK YOUR DOCKER NOW - QUICK VERSION

## Copy This ONE Command:

```bash
docker ps -a | grep pic_postgres && docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"
```

### What You Should See:

**First line:**
```
PIC_ID  postgres:15-alpine  ...  Up X minutes (healthy)  pic_postgres
```

**Second line:**
```
 count 
-------
    19
```

---

## If You See:

### ❌ "No such table: trainings"

**Problem:** Database exists but schema not loaded

**Fix:**
```bash
docker cp backend/database/schema.sql pic_postgres:/tmp/schema.sql
docker exec -it pic_postgres psql -U postgres -d pic_app -f /tmp/schema.sql
```

---

### ❌ "database 'pic_app' does not exist"

**Problem:** Database not created

**Fix:**
```bash
docker exec -it pic_postgres psql -U postgres -c "CREATE DATABASE pic_app;"
```

---

### ❌ "Cannot connect to Docker daemon"

**Problem:** Docker not running

**Fix:**
- Open Docker Desktop app, OR
- Run: `docker daemon` in terminal

---

### ❌ "No such container: pic_postgres"

**Problem:** Container not started

**Fix:**
```bash
cd your-project-root
docker-compose up -d
```

---

## Once You See Count = 19:

Then check backend connection:

```bash
docker logs pic_backend 2>&1 | grep -i "connection\|database"
```

**Look for:**
```
✅ [DB] Connection test successful  → GOOD!
❌ [DB CRITICAL] DATABASE CONNECTION TEST FAILED  → BAD - check logs
```

---

## Final Test:

```bash
curl http://localhost:5000/health
```

**Should return:**
```json
{"status":"OK","timestamp":"2025-12-19T...","backend":"running"}
```

---

## If STILL Getting 404:

1. Share output of: `docker logs pic_backend | tail -30`
2. Share output of: `docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM trainings;"`
3. Share backend connection error

**I can debug from there!** 🔍

---

**Run the first command NOW and paste the output here!** 🙋
