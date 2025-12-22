# Docker Prisma Seeder - Quick Reference Card

## 🚀 Fix the Error (Do This NOW)

You have this error:
```
TSError: Property 'province' does not exist on type 'PrismaClient'
```

**Why?** Prisma client not generated for new models.

**Fix it in 5 commands:**

```bash
# 1. Stop containers
docker-compose down

# 2. Rebuild backend (installs Prisma dependencies)
docker-compose build pic_backend

# 3. Start containers
docker-compose up -d

# 4. Generate Prisma client (MOST IMPORTANT!)
docker exec -it pic_backend npm run prisma:generate

# 5. Run migrations to create tables
docker exec -it pic_backend npm run prisma:migrate
```

## ✅ Then Run the Seeder

```bash
# Full seed (everything including 91,588 regions)
docker exec -it pic_backend npm run prisma:seed

# OR just regions
docker exec -it pic_backend npm run regions:seed
```

## 🔍 Available Commands

| Command | What it does |
|---------|-------------|
| `docker exec -it pic_backend npm run prisma:generate` | Generate TypeScript types from schema (MUST DO FIRST) |
| `docker exec -it pic_backend npm run prisma:migrate` | Create/apply migrations to database |
| `docker exec -it pic_backend npm run prisma:seed` | Seed all data including regions |
| `docker exec -it pic_backend npm run regions:seed` | Seed only Indonesian regions |
| `docker exec -it pic_backend npm run prisma:studio` | Open web UI to view/edit data |
| `docker exec -it pic_backend npm run prisma:reset` | DELETE all data and reseed ⚠️ |
| `docker exec -it pic_backend npm install` | Install dependencies |

## 📋 Step-by-Step Guide

### Step 1: Fix the Prisma Client Error
```bash
docker-compose down
docker-compose build pic_backend
docker-compose up -d
docker exec -it pic_backend npm run prisma:generate
```

### Step 2: Create Database Tables
```bash
docker exec -it pic_backend npm run prisma:migrate
```
When asked `Do you want to continue?` - Type: **y**

### Step 3: Seed the Database
```bash
docker exec -it pic_backend npm run prisma:seed
```

### Step 4: View Your Data
```bash
docker exec -it pic_backend npm run prisma:studio
```
Open: `http://localhost:5555`

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Property 'province' does not exist" | `docker exec -it pic_backend npm run prisma:generate` |
| "Relation 'Province' does not exist" | `docker exec -it pic_backend npm run prisma:migrate` |
| "Cannot find module 'ts-node'" | `docker exec -it pic_backend npm install` |
| PostgreSQL not ready | `docker logs pic_postgres` (wait for "ready to accept connections") |
| API rate limiting (429) | Wait 5-10 minutes, try again |

## 🎯 Most Common Workflow

```bash
# Terminal Window 1: Start Docker
docker-compose down
docker-compose build pic_backend
docker-compose up -d

# Terminal Window 2: Setup and Seed
docker exec -it pic_backend npm run prisma:generate
docker exec -it pic_backend npm run prisma:migrate
docker exec -it pic_backend npm run prisma:seed

# Then view results
docker exec -it pic_backend npm run prisma:studio
```

## 📊 What Gets Seeded

✅ **Admin User**
- Email: admin@delta-indonesia.com
- Password: (check seed.ts file)

✅ **Training Data**
- 13 Bidang (Sectors)
- 12 Training Classes
- 6 Personnel Types
- 5 Training Programs

✅ **Indonesian Regions**
- 34 Provinces
- 514 Regencies/Cities
- 7,277 Districts
- 83,763+ Villages

**Total: 91,588 region records!**

## 💡 Pro Tips

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# Backend logs
docker logs pic_backend

# Database logs
docker logs pic_postgres

# Follow logs in real-time
docker logs -f pic_backend
```

### Access Container Shell
```bash
docker exec -it pic_backend sh

# Inside container, you can:
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
exit  # Exit shell
```

### Reset Everything
```bash
# DELETE ALL DATA!
docker exec -it pic_backend npm run prisma:reset

# OR manually:
docker-compose down -v
docker-compose up -d
```

## ⏱️ Timing

- Generate client: ~5 seconds
- Run migrations: ~10 seconds
- Seed basic data: ~5 seconds
- Seed regions: 15-30 minutes (API calls)

## ✨ You're Done When You See

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

**For more details, see:**
- `DOCKER_SETUP_GUIDE.md` - Full guide
- `SEEDER_QUICKSTART.md` - Seeder documentation
- `IMPLEMENTATION_CHECKLIST.md` - Verification steps
