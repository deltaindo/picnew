# 🐌 Frontend Loading Slowly - Diagnosis & Fix

## Common Causes for Slow `localhost:3000`

### 1. **Initial Compilation** (First Load)
Next.js compiles pages on-demand in dev mode:
- ✅ Normal: 5-15 seconds first load
- ❌ Slow: 30+ seconds

### 2. **Docker Volume Sync Issues**
File watching in Docker containers can be slow on Windows/Mac:
- Node modules syncing
- Hot reload overhead
- Volume mount performance

### 3. **Missing node_modules**
Container might be rebuilding node_modules on every start.

### 4. **Memory/CPU Constraints**
Docker resource limits too low.

---

## Quick Diagnosis

### Check Frontend Container Logs

```bash
# See what's happening
docker logs pic_frontend -f
```

**Look for:**
- ✅ `ready - started server on 0.0.0.0:3000` (good)
- ⚠️ `wait - compiling...` (compiling on demand)
- ❌ `npm ERR!` (dependency issues)
- ❌ Long silence (stuck building)

### Check Container Status

```bash
# Is it running?
docker ps | grep pic_frontend

# Resource usage
docker stats pic_frontend --no-stream
```

---

## Solutions

### Solution 1: Check If It's Just Initial Compilation

**Wait for first compile:**
```bash
# Watch logs
docker logs pic_frontend -f

# When you see:
# ✓ Compiled / in XXms
# ○ Compiling /
# ✓ Compiled / in XXms
```

Then reload browser. Second load should be faster.

---

### Solution 2: Increase Docker Resources

**Windows/Mac Docker Desktop:**
1. Open Docker Desktop Settings
2. Go to Resources
3. Increase:
   - **CPUs**: 4+ cores
   - **Memory**: 4GB+ (6GB recommended)
4. Apply & Restart

```bash
# Restart containers
docker-compose restart frontend
```

---

### Solution 3: Optimize Volume Mounts

**The issue:** Docker volume mounts are slow on Windows/Mac.

**Quick fix - Use named volume for node_modules:**

Update `docker-compose.yml` frontend section:

```yaml
frontend:
  # ... existing config ...
  volumes:
    - ./frontend:/app
    - /app/node_modules     # Don't sync node_modules
    - /app/.next            # Don't sync build cache
```

This is already in your docker-compose! ✅

---

### Solution 4: Rebuild Frontend Container

**Force clean rebuild:**

```bash
# Stop and remove
docker-compose stop frontend
docker-compose rm -f frontend

# Rebuild without cache
docker-compose build --no-cache frontend

# Start fresh
docker-compose up -d frontend

# Watch logs
docker logs pic_frontend -f
```

---

### Solution 5: Check for Errors

```bash
# Look for errors in logs
docker logs pic_frontend 2>&1 | grep -i "error\|warn\|fail"

# Check if process is running inside container
docker exec -it pic_frontend ps aux | grep node
```

---

### Solution 6: Access via Backend Port (Workaround)

If frontend is very slow, test backend directly:

```bash
# Backend health
curl http://localhost:5000/health

# Backend trainings API (needs auth but shows if backend works)
curl http://localhost:5000/api/admin/training
```

---

## Expected Performance

### Normal Development Mode Times:

| Action | Expected Time |
|--------|---------------|
| Container startup | 10-20 seconds |
| First page load (/) | 5-15 seconds |
| Subsequent pages | 1-3 seconds |
| Hot reload (after code change) | 2-5 seconds |

### If Slower Than This:

1. **Check Docker resources** (most common)
2. **Rebuild container clean**
3. **Check Windows firewall** (can block Docker networking)
4. **Try accessing from container IP directly**

---

## Quick Performance Test

```bash
# Time the page load
time curl -s http://localhost:3000 > /dev/null

# Should be:
# real    0m2-5s  (OK)
# real    0m30s+  (TOO SLOW)
```

---

## Alternative: Run Frontend Locally (Fastest)

If Docker is too slow:

```bash
cd frontend
npm install
npm run dev

# Will start on http://localhost:3000
# Much faster than Docker on Windows
```

Update `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Still Slow? Debug Steps

```bash
# 1. Check what's using resources
docker stats --no-stream

# 2. See all processes in frontend container
docker exec -it pic_frontend top

# 3. Check network
ping localhost

# 4. Test direct connection to frontend port
telnet localhost 3000
```

---

## Most Likely Fix

**90% of slow Next.js in Docker = First-time compilation**

**Try this:**

```bash
# Restart frontend
docker restart pic_frontend

# Watch logs until you see "ready - started server"
docker logs pic_frontend -f

# Wait 30 seconds

# Open browser and wait for first compile
# Subsequent loads will be fast
```

The first page load triggers Next.js to compile. It's normal to be slow (10-20s). After that, it should be fast (2-3s).

---

**Which solution do you want to try first?**

1. ✅ Wait for initial compile (easiest)
2. 🔧 Increase Docker resources
3. 🔨 Rebuild container clean
4. 💻 Run frontend locally (fastest)
