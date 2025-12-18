# 🔒 OpenSSL/libssl Fix for Prisma on Alpine

## 🔴 The Error

```
Prisma failed to detect the libssl/openssl version to use
Error loading shared library libssl.so.1.1: No such file or directory
```

**Root Cause:** Alpine Linux uses `musl` libc and doesn't include OpenSSL 1.1 by default, but Prisma's query engine requires it.

---

## ✅ THE FIX (Already Applied)

I've updated the `backend/Dockerfile` to install the required OpenSSL compatibility libraries.

### What Changed

**Before (Broken):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
```

**After (Fixed):**
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install OpenSSL 1.1 and other dependencies required by Prisma
RUN apk add --no-cache openssl1.1-compat libc6-compat

COPY package*.json ./
RUN npm install
```

**Why this works:**
- `openssl1.1-compat` provides the `libssl.so.1.1` library that Prisma needs
- `libc6-compat` provides compatibility for glibc-based binaries on musl systems

---

## 🚀 APPLY THE FIX NOW

### Step 1: Pull Latest Changes
```bash
cd picnew
git pull origin main
```

### Step 2: Stop & Remove Old Containers
```bash
docker-compose down
```

### Step 3: Remove Old Images (Important!)
```bash
# Remove all images to force rebuild
docker-compose down --rmi all

# Or remove just the backend image
docker rmi picnew-backend
```

### Step 4: Rebuild with No Cache
```bash
docker-compose build --no-cache backend
```

### Step 5: Start Services
```bash
docker-compose up -d
```

### Step 6: Check Logs
```bash
# Wait 10 seconds
sleep 10

# Check backend logs
docker logs pic_backend
```

---

## ✅ Expected Output

After rebuilding, `docker logs pic_backend` should show:

```
✓ Server running on port 5000
✓ Environment: development
✓ API: http://localhost:5000/api
```

**NO OpenSSL warnings or errors!**

---

## 🧪 Verify It Works

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

### Test 2: Database Connection
```bash
# Login test (requires database)
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

Should return JWT token and user data.

---

## 🔄 Alternative: Use Debian-based Image

If Alpine still causes issues, switch to Debian:

**Edit `backend/Dockerfile`:**
```dockerfile
# Change this line:
FROM node:18-alpine

# To this:
FROM node:18-slim

WORKDIR /app

# Install OpenSSL (Debian already has it)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

Then rebuild:
```bash
docker-compose build --no-cache backend
docker-compose up -d
```

---

## 📦 Complete Rebuild Command

**Copy-paste this entire block:**

```bash
# Navigate to project
cd picnew

# Pull latest
git pull origin main

# Stop everything
docker-compose down

# Remove images
docker-compose down --rmi all

# Clean system
docker system prune -f

# Rebuild backend only (faster)
docker-compose build --no-cache backend

# Start all services
docker-compose up -d

# Wait for startup
sleep 15

# Check logs
docker logs pic_backend

# Test health
curl http://localhost:5000/api/health
```

---

## 🐛 Troubleshooting

### Still Getting OpenSSL Error?

**Option 1: Switch to Debian image**
```bash
# Edit backend/Dockerfile and change:
FROM node:18-alpine  # Remove this
FROM node:18-slim    # Use this instead

# Then rebuild
docker-compose build --no-cache backend
docker-compose up -d
```

**Option 2: Use different Prisma binary**

Add to `backend/.env`:
```bash
PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node
```

**Option 3: Run without Docker**
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

---

## 📋 Summary

✅ **Root Cause:** Alpine Linux missing OpenSSL 1.1 libraries
✅ **Solution:** Install `openssl1.1-compat` and `libc6-compat` packages
✅ **Fix Applied:** Updated `backend/Dockerfile`
✅ **Action Required:** Pull changes and rebuild Docker image

---

## 🎯 Quick Fix Command

```bash
cd picnew && \
git pull origin main && \
docker-compose down && \
docker-compose build --no-cache backend && \
docker-compose up -d && \
sleep 15 && \
docker logs pic_backend
```

**Expected:** Backend starts successfully without OpenSSL errors! 🚀
