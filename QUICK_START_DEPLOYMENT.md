# 🚀 Quick Start Deployment Guide

**Branch:** `new-local-version`  
**Status:** All fixes applied and ready to deploy  
**Date:** December 31, 2025

---

## 📄 What Was Fixed

| Issue | Fix | Status |
|-------|-----|--------|
| Docker SWC binary error | Updated Dockerfile to use glibc | ✅ |
| API double `/api` prefix | Added `/api` suffix to API_BASE_URL | ✅ |
| Dropdown endpoints missing | Added PIC, Marketing, ProgramType to master-data route | ✅ |

---

## 🚀 5-Minute Deployment

### Step 1: Pull Code
```bash
cd ~/projects/picnew
git checkout new-local-version
git pull origin new-local-version
```

### Step 2: Stop Old Containers
```bash
docker-compose down
```

### Step 3: Clean Images
```bash
docker image prune -a -f
```

### Step 4: Build & Start
```bash
docker-compose up --build -d
```

### Step 5: Wait for Startup
```bash
# Watch logs (Ctrl+C to exit)
docker-compose logs -f

# Or check individually
docker logs pic_frontend  # Should show: ▲ Next.js 14.x ready
docker logs pic_backend   # Should show: ✓ Backend running on http://0.0.0.0:5000
```

**Done!** 🌟 All services running

---

## ✅ Verification (2 Minutes)

### Test 1: Admin Panel Loads
1. Open browser: http://localhost:3000/admin/login
2. Should load without errors
3. No SWC binary errors in logs

### Test 2: API Calls Correct
1. Open DevTools: F12 → Network tab
2. Refresh page
3. Look for requests to `/api/admin/links`
4. Should **NOT** be `/api/api/admin/links`

### Test 3: Dropdowns Work
1. Go to: http://localhost:3000/admin/links
2. Click "Buat Link Baru" button
3. Watch Network tab for:
   - ✅ `GET /api/admin/master-data/pic` → 200 OK
   - ✅ `GET /api/admin/master-data/marketing` → 200 OK
   - ✅ `GET /api/admin/master-data/program_types` → 200 OK
4. All dropdowns should be populated:
   - PIC: Ghaida Trisnanda, Yuyun, etc.
   - Marketing: Agustyani, Atikah, etc.
   - Program Type: Reguler, Inhouse, BNSP

---

## 🚧 If Something Goes Wrong

### Symptom: SWC Binary Error
```bash
# Complete reset
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d
```

### Symptom: Dropdowns Empty
```bash
# Seed the database
docker exec -it pic_backend npm run prisma:seed

# Verify data exists
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT COUNT(*) FROM \"PIC\";"
# Should return: count = 7
```

### Symptom: API Calls to `/api/api/...`
```bash
# Verify the fix was deployed
git log --oneline -5
# Should show: "fix: add /api suffix to API_BASE_URL"

# Check the code
grep 'API_BASE_URL' frontend/pages/admin/links.tsx
# Should show: http://localhost:5000/api
```

### Symptom: Backend Endpoints 404
```bash
# Verify the master-data route has new mappings
docker exec -it pic_backend grep "'pic'" routes/master-data.js
# Should return: 'pic': 'PIC',
```

---

## 📈 Commits Summary

```
0827238 docs: add comprehensive fix documentation
1d849f9 fix: add PIC, Marketing, and ProgramType endpoints to master-data routes
ddf70e7 fix: update Dockerfile for SWC binary compatibility with libc6-compat
da14ba8 fix: change Dockerfile.dev from node:18-alpine to node:18
72e2437 fix: add /api suffix to API_BASE_URL in links page
```

---

## 💱 Rollback (If Needed)

```bash
# Go back to previous version
git checkout main
git pull origin main

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔗 Useful Commands

```bash
# View all logs
docker-compose logs

# View specific service logs
docker logs pic_frontend
docker logs pic_backend
docker logs pic_postgres

# Access container
docker exec -it pic_backend bash

# Restart a service
docker-compose restart pic_backend

# Check container health
docker ps

# View environment variables
docker exec -it pic_frontend env | grep API

# Test API endpoint
curl http://localhost:5000/api/admin/master-data/pic \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔠 Key Files Changed

- **frontend/Dockerfile** - Added glibc support
- **frontend/Dockerfile.dev** - Switched to full Node.js
- **frontend/pages/admin/links.tsx** - Fixed API URL
- **backend/routes/master-data.js** - Added new endpoints

📖 For detailed info: See `FIXES_APPLIED.md`

---

## 📧 Summary

- ✅ All 3 issues fixed
- ✅ All code merged to `new-local-version`
- ✅ Ready for production deployment
- ✅ Documentation complete

**Status: READY FOR DEPLOYMENT** 🚀

---

**Questions?** Check `FIXES_APPLIED.md` for technical details!