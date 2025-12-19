# 🔧 Backend Setup Guide

## What Was Fixed

✅ **server.js** - Added route diagnostics, better error handling, and `/api` endpoint
✅ **.env** - Created with proper database configuration
✅ **Database connection** - Added startup test
✅ **Route registration logging** - Shows which routes loaded

---

## Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Start PostgreSQL (if not running)
brew services start postgresql  # macOS
# or
sudo service postgresql start   # Linux

# Create database
createdb pic_app

# Load schema
psql pic_app < database/schema.sql
psql pic_app < database/constraints.sql

# Verify tables created
psql pic_app -c "\dt"
# Should show: registration_links, trainings, users, etc.
```

### 3. Check .env File
```bash
cat backend/.env

# Should have:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
PORT=5000
```

**If values different on your machine, update them!**

### 4. Start Backend
```bash
cd backend
npm run dev
```

### 5. Verify Backend Running

**You should see:**
```
✅ Database connected successfully

📋 Registering routes...
✅ /api/admin/auth registered
✅ /api/admin/training registered
✅ /api/admin/links registered
✅ /api/admin/registrations registered
✅ /api/admin/master-data registered
✅ /api/public registered

============================================================
🚀 PIC App Backend
============================================================
Port:        5000
Environment: development
Database:    localhost:5432/pic_app
============================================================

📌 Test endpoints:
   GET    http://localhost:5000/health
   GET    http://localhost:5000/api

✅ Ready to receive requests!
```

**If you don't see this → backend has an error (check console)**

---

## Test Endpoints

### 1. Health Check (No Auth)
```bash
curl http://localhost:5000/health

# Response:
# {"status":"OK","timestamp":"...","backend":"running"}
```

### 2. API Info (No Auth)
```bash
curl http://localhost:5000/api

# Response: Shows all available endpoints
```

### 3. Auth Status (No Auth)
```bash
curl http://localhost:5000/api/admin/auth/status

# Response:
# {"success":true,"data":{"initialized":false,...}}
```

### 4. Initialize Admin
```bash
curl -X POST http://localhost:5000/api/admin/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrator",
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'

# Response should have: {"success":true,"data":{"id":1,...}}
```

### 5. Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'

# Response: {"success":true,"data":{"token":"...","user":{...}}}
# Copy the token for next requests
```

### 6. List Trainings (Requires Token)
```bash
# Replace YOUR_TOKEN with token from login response
curl http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: {"success":true,"data":[...]}  # Empty if no trainings created
```

### 7. List Links (Requires Token)
```bash
curl http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: {"success":true,"data":[...]}  # Empty if no links created
```

---

## Environment Variables

### Database
```env
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_USER=postgres          # PostgreSQL user
DB_PASSWORD=postgres      # PostgreSQL password
DB_NAME=pic_app           # Database name
```

### Server
```env
PORT=5000                 # Backend port
NODE_ENV=development      # Set to 'production' for deployment
FRONTEND_URL=http://localhost:3000  # For CORS
```

### JWT
```env
JWT_SECRET=your-key       # Keep secret! Min 32 chars
JWT_EXPIRY=24h            # Token expiry time
```

### Optional Services
```env
SENDGRID_API_KEY=         # For email (leave blank for now)
TWILIO_ACCOUNT_SID=       # For WhatsApp (leave blank for now)
AWS_ACCESS_KEY_ID=        # For file storage (leave blank for now)
```

---

## Troubleshooting

### Error: "Route not found" on /api
**Fixed!** Now `/api` returns info about available endpoints.

### Error: "Database connection failed"
```bash
# Check PostgreSQL running
psql -l

# If error:
brew services start postgresql

# Check .env credentials
cat backend/.env

# Test connection:
psql -h localhost -U postgres -d pic_app -c "SELECT 1"
```

### Error: "Cannot find module"
```bash
cd backend
npm install
```

### Error: "Port 5000 already in use"
```bash
pkill -f "node"
# or
lsof -i :5000
kill -9 <PID>
```

### Error: "ENOENT: no such file or directory, open '.env'"
Create .env file (already done):
```bash
cp backend/.env.example backend/.env  # if example exists
# or just use the one I created
```

---

## Full Flow Test

**Complete flow to verify everything works:**

```bash
# 1. Start backend
cd backend
npm run dev
# WAIT for "Ready to receive requests!"

# 2. In new terminal, initialize admin
curl -X POST http://localhost:5000/api/admin/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@delta-indonesia.com","password":"Admin123!"}'

# 3. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delta-indonesia.com","password":"Admin123!"}' | jq -r '.data.token')
echo "Token: $TOKEN"

# 4. Create a training
curl -X POST http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "K3 LISTRIK",
    "start_date": "2026-01-19",
    "end_date": "2026-01-23",
    "location": "Bekasi",
    "instructor": "Budi",
    "max_participants": 25
  }'

# 5. List trainings
curl http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer $TOKEN"

# 6. Create registration link
curl -X POST http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"training_id":1,"max_registrations":25}'

# 7. List links
curl http://localhost:5000/api/admin/links \
  -H "Authorization: Bearer $TOKEN"
```

If all these work → **Backend is fully functional!** ✅

---

## Package.json Scripts

```bash
npm run dev      # Development (hot reload)
npm start        # Production
npm test         # Run tests (if configured)
```

---

## File Structure

```
backend/
├─ server.js           ← Main server file ✅ FIXED
├─ db.js               ← Database connection
├─ .env                ← Configuration ✅ CREATED
├─ .env.example        ← Example env
│
├─ routes/
│  ├─ auth.js          ← Login & init
│  ├─ training.js      ← Training CRUD
│  ├─ links.js         ← Link generator
│  ├─ registration.js  ← Registrations
│  ├─ master-data.js   ← Master data
│  └─ public.js        ← Public form
│
├─ middleware/
│  └─ auth.js          ← JWT verification
│
├─ database/
│  ├─ schema.sql       ← Database tables
│  └─ constraints.sql  ← Constraints
│
├─ package.json
├─ DEBUG.md            ← Debugging guide
└─ BACKEND_SETUP.md    ← This file
```

---

## Next Steps

1. ✅ Setup backend (you're here)
2. ⬜ Setup frontend (`npm run dev` in frontend folder)
3. ⬜ Test registration flow
4. ⬜ Add email integration (SendGrid)
5. ⬜ Add WhatsApp integration (Twilio)

---

## Questions?

Check the console output when starting backend. New diagnostic messages show:
- ✅ Database connection status
- ✅ Routes registered
- ✅ Any errors during startup

**Backend is now fully fixed and ready to use!** 🎉
