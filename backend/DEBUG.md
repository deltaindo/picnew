# 🔧 Backend Debugging Guide

## ❌ Error: 404 Not Found on `/api/admin/links`

### What This Means
The backend received your request but couldn't find the route handler.

### Root Causes (Check These)

#### 1. **Backend NOT Running**
```bash
# Check if backend process is running
lsof -i :5000
# If nothing shows, backend is NOT running

# Start backend
cd backend
npm run dev
```

**Expected output:**
```
PIC App Backend running on port 5000
Environment: development
Database: localhost:5432/pic_app
```

---

#### 2. **Database Connection Failed**
If you see errors like:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
```bash
# Start PostgreSQL
psql -l  # Should list databases

# If error:
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Create database if missing
createdb pic_app

# Load schema
psql pic_app < database/schema.sql
```

---

#### 3. **Wrong .env Configuration**
```bash
# Check backend/.env
cat backend/.env

# Should look like:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

If wrong, update:
```bash
cp backend/.env.example backend/.env
# Then edit with your values
```

---

#### 4. **Routes Not Properly Exported**
Check each route file exports correctly:

```bash
# Check if files exist
ls -la backend/routes/

# Should have:
# - auth.js
# - training.js
# - links.js
# - registration.js
# - master-data.js
# - public.js
```

If missing, that's the problem!

---

## ✅ Test Backend Endpoints

### 1. Health Check (No Auth Needed)
```bash
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"2025-12-19T..."}
```

### 2. Auth Status (Check if initialized)
```bash
curl http://localhost:5000/api/admin/auth/status

# Response if initialized:
# {"success":true,"data":{"initialized":true,"user_count":1,...}}

# Response if not:
# {"success":true,"data":{"initialized":false,"user_count":0,...}}
```

### 3. List Trainings (Requires Token)
```bash
# First, get token
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delta-indonesia.com","password":"Admin123!"}'

# Copy the token from response
# Then:
curl http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return:
# {"success":true,"message":"Trainings fetched successfully","data":[...]}
```

### 4. List Links (Requires Token)
```bash
curl http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return:
# {"success":true,"message":"Links fetched successfully","data":[...]}
```

---

## 🔍 Frontend Issues

### Check .env.local
```bash
cat frontend/.env.local

# Should have:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Clear Cache
```bash
# Delete .next folder
rm -rf frontend/.next

# Restart frontend
cd frontend
npm run dev
```

---

## 📝 Full Diagnostic Checklist

- [ ] Backend running: `npm run dev` from `backend/` folder
- [ ] PostgreSQL running: `psql -l` returns list
- [ ] Database created: `psql pic_app -c "SELECT 1"`
- [ ] Tables exist: `psql pic_app -c "\dt"`
- [ ] .env configured: `cat backend/.env` looks correct
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Auth status works: `curl http://localhost:5000/api/admin/auth/status`
- [ ] Frontend .env correct: `cat frontend/.env.local`
- [ ] Frontend running: `npm run dev` from `frontend/` folder
- [ ] No browser cache: Clear cookies/cache or use incognito

---

## 🆘 If Still 404

### Check Server Console
When backend starts, you should see:
```
==================================================
PIC App Backend running on port 5000
Environment: development
Database: localhost:5432/pic_app
==================================================
```

**If you don't see this, backend didn't start properly.**

### Check for Errors
```bash
# Run with verbose logging
cd backend
DEBUG=* npm run dev

# Or check logs:
cd backend
npm run dev 2>&1 | tee backend.log
```

### Verify Routes Are Registered
Add this temporary logging to `server.js` right before `app.listen()`:

```javascript
// Temporary: List all routes
const listRoutes = (stack, prefix = '') => {
  stack.forEach(middleware => {
    if (middleware.route) {
      console.log(`${prefix}${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      const routerPrefix = middleware.regexp.source
        .replace('\\', '')
        .replace('(?:', '')
        .replace(')?', '')
        .replace('$', '');
      listRoutes(middleware.handle.stack, prefix + routerPrefix);
    }
  });
};
console.log('\n=== Registered Routes ===');
listRoutes(app._router.stack);
console.log('=========================\n');
```

Then run `npm run dev` and look for:
```
=== Registered Routes ===
GET /api/admin/links
POST /api/admin/links
PUT /api/admin/links/:id
DELETE /api/admin/links/:id
...
=========================
```

---

## 🎯 Quick Fix Steps

1. **Kill all node processes:**
   ```bash
   pkill -f "node"
   ```

2. **Fresh start - Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Wait for "PIC App Backend running on port 5000"
   ```

3. **Fresh start - Frontend (new terminal):**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

4. **Test:**
   - Visit: http://localhost:3000/admin/setup
   - Backend should be responding

---

## 💾 Need to Restart Everything?

```bash
# Stop all processes
pkill -f "node"

# Reset database
dropdb pic_app
createdb pic_app
psql pic_app < backend/database/schema.sql
psql pic_app < backend/database/constraints.sql

# Reinstall dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start backend
cd backend && npm run dev

# In new terminal, start frontend
cd frontend && npm run dev
```

---

**Status:** Follow these steps and let me know what you find! 🔍
