# 🚨 QUICK FIX: 404 Error on /api/admin/links

## The Problem
Frontend shows: **404 Not Found** when trying to fetch `/api/admin/links`

## Root Cause
**Backend is not running OR database connection failed**

---

## 🚀 IMMEDIATE ACTIONS (Do This Now)

### Step 1: Kill Everything
```bash
pkill -f "node"
```

### Step 2: Start Fresh Backend
```bash
cd backend
npm install  # Ensure all deps installed
npm run dev
```

**WAIT FOR THIS OUTPUT:**
```
==================================================
PIC App Backend running on port 5000
Environment: development
Database: localhost:5432/pic_app
==================================================
```

**If you DON'T see that, backend has an error. Check output for errors!**

### Step 3: In NEW Terminal, Start Frontend
```bash
cd frontend
rm -rf .next       # Clear cache
npm run dev
```

### Step 4: Test in Browser
- Open: `http://localhost:3000/admin/setup`
- Try clicking "🔗 Buat Link Baru" button

---

## 🔍 Troubleshooting If Still 404

### Check #1: Backend Actually Running?
```bash
# In a NEW terminal:
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"..."}

# If error = backend not running
```

### Check #2: Database Connected?
```bash
# Check PostgreSQL running
psql -l

# If error about connection, start PostgreSQL:
brew services start postgresql  # macOS
# or
sudo service postgresql start   # Linux
```

### Check #3: .env File Correct?
```bash
cat backend/.env

# Must have these (at minimum):
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_NAME=pic_app
PORT=5000
```

**If wrong, copy and fix:**
```bash
cp backend/.env.example backend/.env
# Then edit backend/.env with correct values
```

### Check #4: Routes File Exists?
```bash
ls backend/routes/

# Must have:
# auth.js ✓
# training.js ✓
# links.js ✓
# registration.js ✓
# master-data.js ✓
# public.js ✓
```

If any missing, copy from repo!

---

## 📋 Step-by-Step Nuclear Reset

**Only if all above fails:**

```bash
# 1. Kill all node processes
pkill -f "node"

# 2. Reset database completely
dropdb pic_app
createdb pic_app
psql pic_app < backend/database/schema.sql
psql pic_app < backend/database/constraints.sql

# 3. Reinstall everything
rm -rf backend/node_modules
rm -rf frontend/node_modules
cd backend && npm install
cd ../frontend && npm install

# 4. Start backend fresh
cd ../backend
npm run dev

# 5. WAIT for the success message above ^

# 6. In NEW TERMINAL, start frontend
cd frontend
rm -rf .next
npm run dev

# 7. Visit http://localhost:3000/admin/setup
```

---

## ✅ How to Know It's Fixed

1. **Backend console shows:**
   ```
   ==================================================
   PIC App Backend running on port 5000
   Environment: development
   Database: localhost:5432/pic_app
   ==================================================
   ```

2. **Health check works:**
   ```bash
   curl http://localhost:5000/health
   # Returns: {"status":"OK",...}
   ```

3. **Frontend loads without errors**
   - No red errors in console (F12)
   - No 404 in Network tab

4. **Button works**
   - Click "🔗 Buat Link Baru"
   - Form appears with training dropdown
   - Select training and click button

---

## 💥 What NOT to Do

❌ **Don't**: Use `npm start` (use `npm run dev` instead)
❌ **Don't**: Run frontend before backend
❌ **Don't**: Skip the "WAIT FOR OUTPUT" step
❌ **Don't**: Ignore database connection errors
❌ **Don't**: Change .env without restarting backend

---

## 📋 Common Errors & Fixes

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Fix:** PostgreSQL not running
```bash
brew services start postgresql
# or
sudo service postgresql start
```

### Error: "database \"pic_app\" does not exist"
**Fix:** Create database
```bash
createdb pic_app
psql pic_app < backend/database/schema.sql
```

### Error: "Cannot find module './routes/links.js'"
**Fix:** File missing, copy from repo!
```bash
# Check git status
git status backend/routes/

# If missing, restore:
git checkout backend/routes/links.js
```

### Error: "LISTEN EADDRINUSE: address already in use :::5000"
**Fix:** Port 5000 already in use
```bash
pkill -f "node"  # Kill all node processes
# OR
lsof -i :5000    # Find what's using port
kill -9 <PID>    # Kill that process
```

---

## 🙋 Need More Help?

**Do this:**
1. Copy the output from `npm run dev` in backend terminal
2. Copy browser console errors (F12 → Console tab)
3. Copy terminal errors if any
4. Send me all of that

**I'll debug the exact issue!**

---

**Try the "IMMEDIATE ACTIONS" section first. It solves 95% of 404 issues.** 🙋
