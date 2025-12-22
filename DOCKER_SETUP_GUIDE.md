# Docker Setup Guide for Prisma Seeder

**Status**: ✅ Updated with Prisma dependencies  
**Date**: December 22, 2025  
**Environment**: Docker (pic_backend, pic_postgres)

---

## 🚀 Quick Start (Step by Step)

### Step 1: Stop Old Containers
```bash
docker-compose down
```

### Step 2: Rebuild Backend Container
```bash
docker-compose build pic_backend
```
This installs the new Prisma dependencies from updated `package.json`

### Step 3: Start Containers
```bash
docker-compose up -d
```

### Step 4: Wait for PostgreSQL (important!)
```bash
docker logs pic_postgres
```
Look for: `"database system is ready to accept connections"`

### Step 5: Install Dependencies (if needed)
```bash
docker exec -it pic_backend npm install
```

### Step 6: Generate Prisma Client
```bash
docker exec -it pic_backend npm run prisma:generate
```
**This is crucial!** Without this, TypeScript won't recognize the new models.

### Step 7: Run Migrations
```bash
docker exec -it pic_backend npm run prisma:migrate
```
This will:
- Create migration files for your new models
- Apply schema to database
- Ask if you want to reset database (press 'y' for yes)

### Step 8: Run the Seeder
```bash
# Full seed (all data including regions)
docker exec -it pic_backend npm run prisma:seed

# OR just regions
docker exec -it pic_backend npm run regions:seed
```

### Step 9: Verify Success
```bash
docker exec -it pic_backend npm run prisma:studio
```
Then open: `http://localhost:5555`

---

## 🐳 Docker Commands Reference

### Prisma Commands
```bash
# Generate Prisma client (MUST DO FIRST)
docker exec -it pic_backend npm run prisma:generate

# Run migrations
docker exec -it pic_backend npm run prisma:migrate

# Deploy migrations (production)
docker exec -it pic_backend npm run prisma:migrate:deploy

# Seed database
docker exec -it pic_backend npm run prisma:seed

# Seed only regions
docker exec -it pic_backend npm run regions:seed

# Open Prisma Studio GUI
docker exec -it pic_backend npm run prisma:studio

# Reset database (deletes all data!)
docker exec -it pic_backend npm run prisma:reset
```

### Container Management
```bash
# View running containers
docker-compose ps

# View logs
docker logs pic_backend
docker logs pic_postgres
docker-compose logs -f

# Restart containers
docker-compose restart
docker-compose restart pic_backend

# Stop containers
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Access container shell
docker exec -it pic_backend sh
docker exec -it pic_postgres sh
```

### Database Commands
```bash
# Run SQL in database
docker exec -it pic_postgres psql -U postgres -d pic_app -c \
  "SELECT COUNT(*) FROM \"Province\";"

# Interactive database access
docker exec -it pic_postgres psql -U postgres -d pic_app

# Backup database
docker exec pic_postgres pg_dump -U postgres pic_app > backup.sql

# Restore database
docker exec -i pic_postgres psql -U postgres pic_app < backup.sql
```

---

## ✅ Troubleshooting

### Error: "Property 'province' does not exist on type 'PrismaClient'"

**Cause**: Prisma client not generated for new models

**Fix**:
```bash
docker exec -it pic_backend npm run prisma:generate
```

Then rebuild:
```bash
docker-compose down
docker-compose build pic_backend
docker-compose up -d
```

### Error: "Cannot find module 'ts-node'"

**Cause**: Dependencies not installed

**Fix**:
```bash
docker exec -it pic_backend npm install
```

### Error: "Relation \"public.\"Province\" does not exist"

**Cause**: Migrations not applied to database

**Fix**:
```bash
docker exec -it pic_backend npm run prisma:migrate
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause**: PostgreSQL not ready or not connected

**Fix**:
```bash
# Wait for postgres to be healthy
docker logs pic_postgres

# Check if postgres is running
docker-compose ps

# Restart postgres
docker-compose restart pic_postgres
```

### Error: "HTTP 429: Too Many Requests" during seeding

**Cause**: Geonesia API rate limiting

**Fix**: Wait 5-10 minutes and try again
```bash
sleep 300  # Wait 5 minutes
docker exec -it pic_backend npm run regions:seed
```

---

## 🔄 Complete Fresh Start

If you want to start completely from scratch:

```bash
# Stop and remove everything
docker-compose down -v

# Remove built images
docker rmi pic_backend pic_frontend picnew_postgres

# Rebuild everything
docker-compose build

# Start fresh
docker-compose up -d

# Wait for postgres
sleep 10

# Generate client
docker exec -it pic_backend npm run prisma:generate

# Run migrations
docker exec -it pic_backend npm run prisma:migrate

# Seed database
docker exec -it pic_backend npm run prisma:seed
```

---

## 📝 Environment Setup

Your `backend/.env.local` is configured for Docker:

```env
# Uses 'postgres' hostname (Docker service name)
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/pic_app"

# Matches docker-compose.yml service configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
```

**Note**: If running locally (not in Docker), use:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pic_app"
```

---

## 🎯 Expected Output

When seeding runs successfully:

```
🌱 Seeding database...

✓ Admin user created: admin@delta-indonesia.com
✓ 13 Bidang created
✓ 12 Training Classes created
✓ 6 Personnel Types created
✓ 5 Training Programs created

🌱 Starting Indonesian Regions Seeding...

📋 Fetching provinces...
✓ Found 34 provinces

🏗️  Seeding Province: ACEH (11)
   📋 Found 23 regencies/cities
   ✓ Processed regency: KAB. ACEH SELATAN
   ...

✅ Indonesian Regions Seeding Complete!
────────────────────────────────────────
📊 Statistics:
   • Provinces:        34
   • Regencies/Cities: 514
   • Districts:        7,277
   • Villages:         83,763
   • Total Records:    91,588
────────────────────────────────────────

✅ Database seeded successfully!
```

---

## 📊 Verify Data

```bash
# Open Prisma Studio (Web UI)
docker exec -it pic_backend npm run prisma:studio
# Then visit: http://localhost:5555

# Or query directly
docker exec -it pic_postgres psql -U postgres -d pic_app << 'EOF'
SELECT 
  'Province' as table_name, COUNT(*) as count FROM "Province"
UNION ALL
SELECT 'Regency', COUNT(*) FROM "Regency"
UNION ALL
SELECT 'District', COUNT(*) FROM "District"
UNION ALL
SELECT 'Village', COUNT(*) FROM "Village"
ORDER BY table_name;
EOF
```

---

## 🐛 Debug Commands

```bash
# Check container health
docker-compose ps

# View environment variables in backend
docker exec pic_backend env | grep DB_

# Check Prisma schema
docker exec pic_backend cat prisma/schema.prisma

# Test database connection
docker exec -it pic_backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.province.count()
  .then(c => console.log('✓ Connected. Provinces:', c))
  .catch(e => console.log('✗ Error:', e.message));
"

# View npm scripts available
docker exec pic_backend npm run
```

---

## 📋 Complete Workflow

```bash
# 1. Stop old containers
docker-compose down

# 2. Rebuild backend (installs new dependencies)
docker-compose build pic_backend

# 3. Start all containers
docker-compose up -d

# 4. Wait for postgres (check logs)
docker logs pic_postgres

# 5. Generate Prisma client
docker exec -it pic_backend npm run prisma:generate

# 6. Run migrations
docker exec -it pic_backend npm run prisma:migrate

# 7. Seed database (full seed including regions)
docker exec -it pic_backend npm run prisma:seed

# 8. Verify in Prisma Studio
docker exec -it pic_backend npm run prisma:studio
# Visit: http://localhost:5555
```

---

## ✨ Now You're Ready!

Your database now has:
- ✅ 34 Provinces
- ✅ 514 Regencies/Cities
- ✅ 7,277 Districts
- ✅ 83,763+ Villages
- ✅ All training data seeded
- ✅ Admin user created

**Total: 91,588 region records + training data!** 🎉

---

## 🆘 Quick Help

**Forgot the command?**
```bash
# List all available npm scripts
docker exec pic_backend npm run
```

**Want to reset everything?**
```bash
# Delete all data and reseed
docker exec -it pic_backend npm run prisma:reset
```

**Want to see the data?**
```bash
# Open GUI browser
docker exec -it pic_backend npm run prisma:studio
```

**Having issues?**
1. Check logs: `docker logs pic_backend`
2. Rebuild: `docker-compose build pic_backend`
3. Try fresh start: `docker-compose down -v && docker-compose up -d`

---

**Happy seeding! 🚀**
