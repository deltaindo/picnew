# 🐛 Docker Fix - Frontend Not Starting

## Problem

Frontend shows error:
```
Error: Could not find a production build in the '.next' directory.
```

## ✅ Solution (Already Fixed!)

I've updated the Docker setup to use **development mode** with hot reload.

---

## Quick Fix Steps

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Stop All Containers
```bash
docker-compose down
```

### 3. Remove Old Images (Optional but Recommended)
```bash
docker-compose down --rmi all
```

### 4. Rebuild and Start
```bash
docker-compose up --build -d
```

### 5. Check Logs
```bash
# Check all services
docker-compose logs -f

# Or check frontend only
docker logs -f pic_frontend
```

---

## What Changed?

### Before (Broken)
- Used `next start` (production mode)
- Required `next build` first
- Volume mount overwrote `.next` directory

### After (Fixed)
- Uses `next dev` (development mode)
- No build needed
- Volume mounts preserve `node_modules` and `.next`
- Hot reload enabled

---

## Files Updated

1. **docker-compose.yml**
   - Frontend now uses `Dockerfile.dev`
   - Added volume exclusions for `node_modules` and `.next`
   - Backend uses `npm run dev`

2. **frontend/Dockerfile.dev** (NEW)
   - Development-focused Dockerfile
   - Uses `npm run dev`
   - Hot reload enabled

3. **frontend/Dockerfile** (UPDATED)
   - Now optimized for production only
   - Multi-stage build
   - Smaller image size

4. **backend/Dockerfile** (UPDATED)
   - Uses dev mode by default
   - Includes Prisma generation

---

## Verification

After running `docker-compose up --build -d`:

### 1. Check All Services Running
```bash
docker-compose ps
```

You should see:
```
NAME                IMAGE              STATUS
pic_postgres        postgres:15-alpine Up
pic_backend         picnew-backend     Up
pic_frontend        picnew-frontend    Up
```

### 2. Check Frontend Logs
```bash
docker logs pic_frontend
```

You should see:
```
> frontend@0.1.0 dev
> next dev

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3. Visit Frontend
http://localhost:3000

You should see the landing page!

### 4. Visit Admin Login
http://localhost:3000/admin/login

Login page should load.

---

## Alternative: Run Without Docker

If Docker still has issues, run locally:

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3 - PostgreSQL
```bash
# If you have PostgreSQL installed locally:
psql -U postgres -c "CREATE DATABASE pic_app;"

# Or use Docker for just the database:
docker run -d --name pic_postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pic_app \
  -p 5432:5432 \
  postgres:15-alpine
```

Then update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_app
```

---

## Production Build (Optional)

If you want to test production build:

```bash
cd frontend
npm run build
npm run start
```

Or with Docker:
```bash
# Use production Dockerfile
docker build -f frontend/Dockerfile -t pic-frontend-prod ./frontend
docker run -p 3000:3000 pic-frontend-prod
```

---

## Common Issues

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in docker-compose.yml:
# ports:
#   - "3001:3000"  # Access at http://localhost:3001
```

### Container Keeps Restarting
```bash
# Check logs
docker logs pic_frontend

# Check if node_modules installed
docker exec pic_frontend ls -la /app/node_modules

# Rebuild
docker-compose up --build frontend
```

### Changes Not Reflecting
```bash
# Restart container
docker-compose restart frontend

# Or rebuild
docker-compose up --build -d frontend
```

---

## Summary

✅ **Fixed:** Frontend now runs in dev mode with hot reload
✅ **No build needed:** Just `docker-compose up`
✅ **Volume mounts:** Code changes reflect immediately
✅ **Backend:** Also runs in dev mode with hot reload

**Next step:** Just pull the changes and rebuild!

```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

Then visit: http://localhost:3000/admin/login 🚀
