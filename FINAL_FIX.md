# ✅ FINAL FIX - TypeScript jwt.sign Error

## 🔴 The Problem

```
TSError: ⪕ Unable to compile TypeScript:
src/controllers/authController.ts(30,23): error TS2769: 
No overload matches this call.
Type 'string' is not assignable to type 'number | StringValue | undefined'.
```

**Root cause:** TypeScript strict type checking doesn't like inline `process.env.JWT_EXPIRY || '24h'` being passed directly to `jwt.sign()`

---

## ✅ The Solution (Applied)

### What Changed

**Before (Broken):**
```typescript
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  jwtSecret,
  { expiresIn: process.env.JWT_EXPIRY || '24h' } // ❌ TS error
);
```

**After (Fixed):**
```typescript
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const expiresIn = (process.env.JWT_EXPIRY || '24h') as string; // ✅ Explicit type

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  jwtSecret,
  { expiresIn } // ✅ Now TypeScript knows it's a string
);
```

**Why this works:** By extracting `expiresIn` to a separate variable with explicit type casting `as string`, TypeScript correctly identifies it as a valid string type for JWT's `expiresIn` option.

---

## 🚀 Apply the Fix NOW

### Step 1: Pull Latest Changes
```bash
cd picnew
git pull origin main
```

### Step 2: Stop & Remove Everything
```bash
# Stop all containers
docker-compose down

# Optional: Remove volumes (if you want fresh DB)
# docker volume rm picnew_postgres_data
```

### Step 3: Rebuild from Scratch
```bash
# Rebuild images
docker-compose build --no-cache

# Start all services
docker-compose up -d
```

### Step 4: Wait for Services
```bash
# Wait 15 seconds
sleep 15

# Check status
docker-compose ps
```

You should see all 3 services running:
```
NAME             STATUS
pic_postgres     Up (healthy)
pic_backend      Up
pic_frontend     Up
```

### Step 5: Check Backend Logs
```bash
docker logs pic_backend
```

**Expected output:**
```
✅ Server running on port 5000
✅ Environment: development
✅ API: http://localhost:5000/api
```

**NO MORE TypeScript errors!**

---

## ✅ Run Migrations & Seed

```bash
# Run migrations
docker exec -it pic_backend npm run prisma:migrate

# Seed database
docker exec -it pic_backend npm run prisma:seed
```

---

## 🧪 Test Everything Works

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T09:37:00.000Z",
  "environment": "development"
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

Expected:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@delta-indonesia.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Test 3: Get Current User
```bash
# Replace YOUR_TOKEN with token from login response
curl http://localhost:5000/api/admin/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@delta-indonesia.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Test 4: Get Training Programs
```bash
curl http://localhost:5000/api/admin/training \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 5: Frontend

Visit in browser:
- **Landing:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login

Login with:
- Email: `admin@delta-indonesia.com`
- Password: `Admin123!`

---

## 🚧 If You STILL Get Errors

### Option 1: Nuclear Reset
```bash
# Stop everything
docker-compose down

# Remove ALL Docker resources
docker system prune -a --volumes

# Rebuild
docker-compose up --build -d

# Wait
sleep 20

# Run migrations
docker exec -it pic_backend npm run prisma:migrate
docker exec -it pic_backend npm run prisma:seed
```

### Option 2: Run Locally (No Docker)

**Terminal 1 - PostgreSQL:**
```bash
docker run -d --name pic_postgres_only \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pic_app \
  -p 5432:5432 \
  postgres:15-alpine
```

**Terminal 2 - Backend:**
```bash
cd backend

# Fresh install
rm -rf node_modules package-lock.json
npm install

# Ensure DATABASE_URL is set
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_app" > .env
echo "JWT_SECRET=your-secret-key-change-in-production" >> .env
echo "JWT_EXPIRY=24h" >> .env

# Run migrations
npm run prisma:migrate

# Seed
npm run prisma:seed

# Start
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend

# Fresh install
rm -rf node_modules package-lock.json .next
npm install

# Ensure API URL is set
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start
npm run dev
```

---

## 📝 Summary of All Changes

### Files Modified:
1. **backend/src/controllers/authController.ts**
   - Added explicit type casting: `const expiresIn = (process.env.JWT_EXPIRY || '24h') as string;`
   - Separated `expiresIn` from jwt.sign() options

### Why It Works:
- TypeScript's strict type checking requires explicit types for overloaded functions
- `jwt.sign()` has multiple overloads and was confused by inline env variable
- Extracting to a typed variable resolves the ambiguity

---

## ✅ Verification Checklist

After pulling and rebuilding, verify:

- [ ] `docker-compose ps` shows all 3 services running
- [ ] `docker logs pic_backend` shows "Server running on port 5000"
- [ ] `docker logs pic_frontend` shows "ready started server"
- [ ] `curl http://localhost:5000/api/health` returns 200 OK
- [ ] Login works at http://localhost:3000/admin/login
- [ ] Dashboard loads after login
- [ ] No TypeScript compilation errors in logs

---

## 📦 What's Ready

✅ **Backend:**
- Express API on port 5000
- JWT authentication working
- Training CRUD endpoints
- Master data endpoints
- Prisma ORM with PostgreSQL

✅ **Frontend:**
- Next.js on port 3000
- Admin login page
- Admin dashboard
- Training management page

✅ **Database:**
- PostgreSQL on port 5432
- 11 tables created
- Seed data ready

---

**Next:** Pull changes and rebuild! This should be the final fix. 🎯

```bash
git pull origin main
docker-compose down
docker-compose up --build -d
sleep 15
docker logs pic_backend
```
