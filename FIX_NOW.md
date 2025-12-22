# 🚨 FIX NOW - Prisma Client Error

## Your Error

```
TSError: ⨯ Unable to compile TypeScript:
prisma/seeders/indonesian-regions.ts:95:23 - error TS2339: 
Property 'province' does not exist on type 'PrismaClient'
```

## ✅ Copy & Paste These Commands

Open PowerShell or Terminal in your project root and run them one by one:

### Command 1: Stop Containers
```powershell
docker-compose down
```

### Command 2: Rebuild Backend
```powershell
docker-compose build pic_backend
```
*(This installs Prisma dependencies)*

### Command 3: Start Containers
```powershell
docker-compose up -d
```

### Command 4: Wait 10 seconds, then Generate Prisma Client
```powershell
Start-Sleep -Seconds 10
docker exec -it pic_backend npm run prisma:generate
```

**This is the KEY command that fixes your error!**

### Command 5: Run Migrations
```powershell
docker exec -it pic_backend npm run prisma:migrate
```

When it asks: `Do you want to continue? [y/N]`  
Type: **y** and press Enter

### Command 6: Seed the Database
```powershell
docker exec -it pic_backend npm run prisma:seed
```

This will take 15-30 minutes (fetching all 91,588 regions from API)

### Command 7: View Your Data
```powershell
docker exec -it pic_backend npm run prisma:studio
```

Then open in browser: **http://localhost:5555**

---

## 👌 One-Liner (Copy & Paste All at Once)

```powershell
docker-compose down; docker-compose build pic_backend; docker-compose up -d; Start-Sleep -Seconds 10; docker exec -it pic_backend npm run prisma:generate; docker exec -it pic_backend npm run prisma:migrate
```

Then after it completes:
```powershell
docker exec -it pic_backend npm run prisma:seed
```

---

## 📊 Full Terminal Script

Create a file `setup.ps1` with this content:

```powershell
# Docker Setup Script for Prisma

Write-Host "🚨 Starting Docker setup for Prisma..." -ForegroundColor Yellow

Write-Host "\n1. Stopping containers..." -ForegroundColor Cyan
docker-compose down

Write-Host "\n2. Building backend container..." -ForegroundColor Cyan
docker-compose build pic_backend

Write-Host "\n3. Starting containers..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "\n4. Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "\n5. Generating Prisma client..." -ForegroundColor Green
docker exec -it pic_backend npm run prisma:generate

Write-Host "\n6. Running migrations..." -ForegroundColor Green
docker exec -it pic_backend npm run prisma:migrate

Write-Host "\n✅ Setup complete! Now seeding database..." -ForegroundColor Green
Write-Host "\n7. Seeding database (this may take 15-30 minutes)..." -ForegroundColor Green
docker exec -it pic_backend npm run prisma:seed

Write-Host "\n✅ All done!" -ForegroundColor Green
Write-Host "\nOpening Prisma Studio..." -ForegroundColor Cyan
docker exec -it pic_backend npm run prisma:studio
```

Then run:
```powershell
.\setup.ps1
```

---

## 📌 What Changed

I've updated these files in your repository:

1. **backend/package.json** - Added Prisma dependencies and npm scripts
2. **backend/.env.local** - Added database configuration
3. **backend/prisma/schema.prisma** - Already had new models
4. **backend/prisma/seed.ts** - Already updated

What you need to do:

1. ✅ Run `docker-compose build pic_backend` (installs new dependencies)
2. ✅ Run `npm run prisma:generate` (generates TypeScript types)
3. ✅ Run `npm run prisma:migrate` (creates database tables)
4. ✅ Run `npm run prisma:seed` (seeds data)

---

## 🐛 If Something Goes Wrong

### Error: "npm: command not found"
```powershell
# Make sure npm is installed in container
docker exec -it pic_backend npm --version

# If not working, rebuild:
docker-compose down
docker-compose build pic_backend
docker-compose up -d
```

### Error: "Cannot find module 'ts-node'"
```powershell
# Install dependencies
docker exec -it pic_backend npm install
```

### Error: "Relation 'Province' does not exist"
```powershell
# Run migrations
docker exec -it pic_backend npm run prisma:migrate
```

### PostgreSQL Not Ready
```powershell
# Check status
docker logs pic_postgres

# Wait a bit and retry
Start-Sleep -Seconds 5
```

### Complete Fresh Start (DELETE ALL DATA!)
```powershell
docker-compose down -v
docker-compose build
docker-compose up -d
Start-Sleep -Seconds 10
docker exec -it pic_backend npm run prisma:generate
docker exec -it pic_backend npm run prisma:migrate
docker exec -it pic_backend npm run prisma:seed
```

---

## ✅ You'll Know It Worked When You See

```
✅ Database seeded successfully!

Statistics:
   • Provinces:        34
   • Regencies/Cities: 514
   • Districts:        7,277
   • Villages:         83,763
   • Total Records:    91,588
```

---

## 🔍 Quick Verification

After seeding, verify it worked:

```powershell
# Open Prisma Studio
docker exec -it pic_backend npm run prisma:studio

# Then open browser: http://localhost:5555
# You should see:
# - Province: 34 records
# - Regency: 514 records
# - District: 7,277 records
# - Village: ~83,763 records
```

Or query the database:
```powershell
docker exec -it pic_postgres psql -U postgres -d pic_app -c \
  "SELECT COUNT(*) as provinces FROM \"Province\";"

# Should return: 34
```

---

## 🎉 Final Checklist

- [ ] Run `docker-compose down`
- [ ] Run `docker-compose build pic_backend`
- [ ] Run `docker-compose up -d`
- [ ] Wait 10 seconds
- [ ] Run `docker exec -it pic_backend npm run prisma:generate`
- [ ] Run `docker exec -it pic_backend npm run prisma:migrate`
- [ ] Run `docker exec -it pic_backend npm run prisma:seed`
- [ ] Run `docker exec -it pic_backend npm run prisma:studio`
- [ ] Open http://localhost:5555 and verify data

---

**That's it! You're done!** 🌟

For more info, see `DOCKER_SETUP_GUIDE.md` or `DOCKER_QUICK_REFERENCE.md`
