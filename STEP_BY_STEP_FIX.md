# 🚀 STEP-BY-STEP FIX FOR 404 ERRORS

## What Was Wrong

1. **db.js** - Silent database failures, no clear error messages
2. **server.js** - Missing request logging and debug info
3. **Frontend** - Missing API hook or wrong configuration

## What I Fixed

✅ **db.js** - Added connection pooling, timeout config, and detailed error messages
✅ **server.js** - Added request logging, route registration logging, and better error handling
✅ **auth.js** - Already has `/status` endpoint (verified)

---

## NOW: FOLLOW THESE STEPS

### Step 1: Clean Everything

```bash
# Stop all running processes
pkill -f "node"

# Clear Docker (if using Docker)
docker-compose down -v  # Removes volumes

# Clear npm cache
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf backend/.npm
```

### Step 2: Verify PostgreSQL is Running

```bash
# List databases
psql -l

# If error "command not found" or connection error:
# Start PostgreSQL
brew services start postgresql    # macOS
sudo service postgresql start    # Linux

# Check it's running
psql -c "SELECT 1;"
# Should return: 1
```

### Step 3: Create Database (If Needed)

```bash
# Check if pic_app exists
psql -l | grep pic_app

# If NOT found, create it:
createdb pic_app

# Load schema
psql pic_app < backend/database/schema.sql
psql pic_app < backend/database/constraints.sql

# Verify tables exist
psql pic_app -c "\dt"
# Should list: users, trainings, registration_links, etc.
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install

# Verify nodemon installed
npm list nodemon
```

### Step 5: Start Backend

```bash
# From backend/ folder
npm run dev

# YOU SHOULD SEE:
# [DB] Initializing PostgreSQL connection pool...
# [DB] Host: localhost, Port: 5432, Database: pic_app
# ✅ [DB] Connection test successful
# 📋 Registering API routes...
#    ✅ /api/admin/auth
#    ✅ /api/admin/training
#    ✅ /api/admin/links
#    ✅ /api/admin/registrations
#    ✅ /api/admin/master-data
#    ✅ /api/public
# 
# ======================================================================
# 🚀 PIC APP BACKEND - STARTED
# ======================================================================
#    Port:        5000
#    Environment: development
#    Database:    localhost:5432/pic_app
#    Frontend:    http://localhost:3000
# ...
# ✅ Ready to receive requests!
```

**IF YOU DON'T SEE THIS:**
- ❌ Database connection failed → check PostgreSQL
- ❌ Routes not shown → check route files exist
- ❌ Error on startup → check .env configuration

### Step 6: Test Backend (VERY IMPORTANT)

Before touching frontend, test backend in new terminal:

```bash
# Test 1: Health check
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"2025-12-19T....","backend":"running"}

# If error: Backend not running!
```

```bash
# Test 2: API endpoints
curl http://localhost:5000/api

# Should list all available endpoints
```

```bash
# Test 3: Auth status (no token needed)
curl http://localhost:5000/api/admin/auth/status

# Should return:
# {"success":true,"data":{"initialized":false,"user_count":0,...}}

# If 404: Route not found - check backend logs
```

### Step 7: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 8: Check Frontend .env.local

```bash
cat frontend/.env.local

# MUST have:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# If missing, create it:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > frontend/.env.local
```

### Step 9: Start Frontend (New Terminal)

```bash
cd frontend
rm -rf .next  # Clear cache
npm run dev

# YOU SHOULD SEE:
# ▲ Next.js X.X.X
# - Local: http://localhost:3000
```

### Step 10: Test Frontend

1. **Open browser:** `http://localhost:3000/admin/setup`
2. **Check browser console** (F12 → Console tab)
   - Should NOT see errors
   - Should see GET requests to `/api/admin/auth/status`
3. **Initialize Admin:**
   - Fill form with:
     - Name: Admin
     - Email: admin@delta-indonesia.com
     - Password: Admin123!@
   - Click button
   - Should see success message

### Step 11: Check LinkGenerator Component

1. **Login:**
   - Go to: `http://localhost:3000/admin/login`
   - Use: admin@delta-indonesia.com / Admin123!@
   - Should log in successfully

2. **Test LinkGenerator:**
   - Go to: Dashboard or link generation page
   - Click "🔗 Buat Link Baru"
   - Form should appear
   - Dropdown should show trainings
   - Fill form and submit

---

## DEBUGGING IF STILL GETTING 404

### Check Backend Logs

When you get 404, backend terminal should show:

```
⚠️  404 - Route not found
Requested: GET /api/admin/links
```

If you DON'T see that → frontend not reaching backend at all

### Check Browser Console (F12)

**Look for:**

```javascript
// Should see request:
GET http://localhost:5000/api/admin/links

// Should see response header:
Status: 404 Not Found

// Body should be:
{"success":false,"message":"Route not found",...}
```

### Common Errors

#### ❌ "Cannot GET /api/admin/links"
- Backend is running but route not registered
- Check: Is `/api/admin/links` listed in backend startup?

#### ❌ "ECONNREFUSED 127.0.0.1:5000"
- Backend not running
- Fix: `npm run dev` in backend folder

#### ❌ "ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL not running
- Fix: `brew services start postgresql`

#### ❌ "Database does not exist"
- pic_app not created
- Fix: `createdb pic_app`

#### ❌ "Invalid token" error
- Frontend sending old/invalid token
- Fix: Clear localStorage: `localStorage.clear()` in browser console

---

## FULL RESET (Nuclear Option)

If nothing works:

```bash
# 1. Kill all node processes
pkill -f "node"

# 2. Drop and recreate database
dropdb pic_app
createdb pic_app
psql pic_app < backend/database/schema.sql
psql pic_app < backend/database/constraints.sql

# 3. Clean all cache/modules
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/.npm frontend/.next
rm frontend/.env.local 2>/dev/null

# 4. Reinstall
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 5. Setup env
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > frontend/.env.local

# 6. Start fresh
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2

# 7. Test
curl http://localhost:5000/health
curl http://localhost:3000
```

---

## Verify Each Step

- [ ] PostgreSQL running: `psql -c "SELECT 1;"`
- [ ] Database exists: `psql pic_app -c "\dt"`
- [ ] Backend starts: `cd backend && npm run dev`
- [ ] Shows all routes
- [ ] Shows "✅ Ready to receive requests!"
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Auth status works: `curl http://localhost:5000/api/admin/auth/status`
- [ ] Frontend .env.local exists and correct
- [ ] Frontend starts: `cd frontend && npm run dev`
- [ ] No console errors
- [ ] Can visit `http://localhost:3000/admin/setup`
- [ ] Setup page loads (no errors)
- [ ] Can initialize admin
- [ ] Can login
- [ ] LinkGenerator shows form
- [ ] Form shows trainings in dropdown

---

**Once all checks pass, everything should work!** ✅

If any check fails, that's where the problem is. Share that specific error and I can help debug further.
