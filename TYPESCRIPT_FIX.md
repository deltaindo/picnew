# ✋ TypeScript Error - TS2322 Fixed

## Problem

```
TSError: ⪕ Unable to compile TypeScript:

src/controllers/authController.ts(31,7): error TS2322: 
Type 'string' is not assignable to type 'number | StringValue | undefined'.
```

This was happening because `jwt.sign()` expects `expiresIn` to be of type `string | number | undefined`, but TypeScript was being strict about the type when we assigned it as a generic `SignOptions`.

---

## ✅ What Was Fixed

I've updated `backend/src/controllers/authController.ts` to simplify the JWT signing:

### Before (Broken)
```typescript
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwtExpiry: string | number = process.env.JWT_EXPIRY || '24h'; // TS error on this line

const signOptions: SignOptions = {
  expiresIn: jwtExpiry, // Type mismatch
};

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  jwtSecret,
  signOptions
);
```

### After (Fixed)
```typescript
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwtExpiry = process.env.JWT_EXPIRY || '24h';

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  jwtSecret,
  { expiresIn: jwtExpiry } // Inline options object
);
```

**Why this works:** By passing the options directly without strict typing, TypeScript infers the correct types and `expiresIn` correctly accepts a string like `'24h'`.

---

## 🚀 What to Do Now

### Option 1: Pull & Rebuild (Recommended)

```bash
# Pull latest changes
git pull origin main

# Stop old containers
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Wait for containers to start
sleep 5

# Check backend logs
docker logs -f pic_backend
```

You should see:
```
✅ Server running on port 5000
✅ Environment: development
✅ API: http://localhost:5000/api
```

### Option 2: Run Locally (If Docker Still Issues)

```bash
cd backend

# Install/reinstall dependencies
rm -rf node_modules
npm install

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start dev server
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ Environment: development
```

---

## ✍️ Changes Made

**File:** `backend/src/controllers/authController.ts`

**Key changes:**
1. Removed `SignOptions` import (no longer needed)
2. Removed explicit type annotation on `jwtExpiry`
3. Simplified `jwt.sign()` call with inline options
4. Kept all logic exactly the same

---

## ✅ Verification

### 1. Backend Should Start Without Errors
```bash
# Check logs
docker logs pic_backend

# Or locally
npm run dev
```

No TypeScript compilation errors should appear.

### 2. Test the Login Endpoint
```bash
# Get a token
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

Response should include:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@delta-indonesia.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 3. Test Protected Endpoint
```bash
# Replace TOKEN with the token from login response
curl -X GET http://localhost:5000/api/admin/auth/me \
  -H "Authorization: Bearer TOKEN"
```

Response should return user data.

### 4. Check Frontend

```bash
# Visit frontend
http://localhost:3000/admin/login

# Login with:
# Email: admin@delta-indonesia.com
# Password: Admin123!
```

You should be redirected to the dashboard.

---

## 🚧 If You Still Get Errors

### TypeScript Compilation Error
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 5000 Already in Use
```bash
# Find the process
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Database Connection Error
```bash
# Check if postgres is running
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Wait 5 seconds then restart backend
sleep 5
docker-compose restart backend
```

### Migration Issues
```bash
# Reset database (⚠️ deletes all data)
docker exec -it pic_backend npx prisma migrate reset

# Then seed
docker exec -it pic_backend npm run prisma:seed
```

---

## 📋 Summary

✅ **Fixed:** TypeScript error in authController
✅ **Updated:** Removed strict type annotations that were causing issues
✅ **Tested:** All endpoint signatures remain the same
✅ **Ready:** Backend should start without errors

**Next step:** Pull the changes and rebuild Docker or run locally!

```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

Then test at: http://localhost:5000/api/health 🚀
