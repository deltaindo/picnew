# Quick Start Guide - PIC App

## 🚀 Start Everything in 30 Seconds

```bash
# 1. Clone and checkout
git clone https://github.com/deltaindo/picnew.git
cd picnew
git checkout new-local-version

# 2. Start all services
docker-compose up

# 3. Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

**That's it!** Auto-seeding runs automatically.

---

## 📊 What Gets Seeded?

When the backend starts for the first time:

### PIC (7 people)
- Ghaida Trisnanda
- Yuyun
- Echasita
- Erje
- Nur Afidah
- Hafid
- Daniel Setiono

### Marketing (12 people)
- Agustyani, Atikah, Anik, Yoppi, Intang, Hafid, Ali M, Erje, Indri, Bayu, Yunny, Eko

### Program Types (3 types)
- Reguler
- Inhouse
- BNSP

---

## ✅ Verify Everything Works

### Option 1: Check Logs
```
Expect to see:
🌱 Checking if database needs seeding...
📋 Starting auto-seeding process...
✅ Auto-seeding completed successfully!
🚀 PIC APP BACKEND - STARTED
```

### Option 2: Test API
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","database":"connected"}
```

### Option 3: Check Dropdowns
1. Open http://localhost:3000/admin
2. Go to "Buat Link Pendaftaran"
3. See all dropdowns populated ✅

---

## 🔧 Manual Setup (No Docker)

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
# Auto-seed runs automatically! ✅

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 📚 Important Files

- **Auto-seeding logic**: `backend/prisma/auto-seed.ts`
- **Server startup**: `backend/server.js`
- **Schema**: `backend/prisma/schema.prisma`
- **Manual seed**: `backend/prisma/seed.ts` (still works)

---

## 🤧 Common Issues

### "Database connection refused"
```bash
# PostgreSQL not running?
docker-compose up pic_postgres
```

### "PrismaClient not found"
```bash
cd backend
npm run prisma:generate
npm run dev
```

### "Port 5000 already in use"
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use different port:
PORT=5001 npm run dev
```

---

## 📋 Quick Reference

### Main Endpoints
```
GET    /api/admin/master-data/pic              ✅ PIC list
GET    /api/admin/master-data/marketing        ✅ Marketing list
GET    /api/admin/master-data/program_types    ✅ Program types
GET    /api/admin/links                        ✅ Links list
POST   /api/admin/links                        ✅ Create link
GET    /health                                 ✅ Health check
```

### Useful Commands
```bash
# View database
npm run prisma:studio

# Manual seed (if needed)
npm run prisma:seed

# Reset everything
npm run prisma:reset

# Check migrations
npm run prisma:status
```

---

## 🔐 Authentication

### Default Admin
- Email: `admin@deltaindo.com`
- Password: `admin123`
- From: `backend/prisma/seed.ts`

**Change this in production!**

---

## 🛠 How Auto-Seeding Works

1. Backend starts → calls `autoSeed()`
2. `autoSeed()` checks if PIC table has data
3. **If empty**: Seeds all 22 entries
4. **If has data**: Skips (already seeded)
5. Server continues normally

**Result**: Always ready, no duplicates! ✅

---

## 📑 Documentation

- **Full Setup**: `docs/AUTO_SEEDING_SETUP.md`
- **Deployment**: `docs/DEPLOYMENT_GUIDE.md`
- **Implementation**: `IMPLEMENTATION_CHECKLIST.md`
- **API Reference**: `backend/server.js` → `/api` endpoint

---

## 🔍 Test Workflow

1. **Start system**: `docker-compose up`
2. **Wait for logs**: See "Ready to receive requests!"
3. **Open frontend**: http://localhost:3000/admin
4. **Create link**: Click "Buat Link Pendaftaran"
5. **See dropdowns**: All three populated
6. **Fill and save**: Creates link in database
7. **View table**: New link with all columns

---

## 🏡 Local Development Tips

### View Database in GUI
```bash
cd backend
npm run prisma:studio
# Opens http://localhost:5555
```

### Watch Backend Changes
```bash
cd backend
npm run dev  # Uses nodemon, auto-restarts
```

### Access Database CLI
```bash
docker exec -it pic_postgres psql -U postgres -d pic_app
# Then: SELECT * FROM pic;
```

### Fresh Start (Reset Everything)
```bash
# Stop containers
docker-compose down

# Remove volumes (data)
docker-compose down -v

# Start fresh
docker-compose up
# All data re-seeded automatically!
```

---

## 🙋 Need Help?

1. **Check logs**: `docker-compose logs backend`
2. **Read docs**: `docs/AUTO_SEEDING_SETUP.md`
3. **Test API**: `curl http://localhost:5000/health`
4. **Reset**: `docker-compose down -v && docker-compose up`

---

**Status**: ✅ Ready to Use  
**Last Updated**: December 29, 2025  
**Repository**: https://github.com/deltaindo/picnew  
**Branch**: new-local-version  
