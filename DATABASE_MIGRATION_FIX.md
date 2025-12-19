# 🗄️ DATABASE MIGRATION FIX

## 🔴 The Problem

```
ERROR: relation "public.User" does not exist
The table `public.User` does not exist in the current database.
```

**Root Cause:** The database tables haven't been created yet. We need to run Prisma migrations.

---

## ✅ THE SOLUTION

Run Prisma migrations to create all database tables.

---

## 🚀 STEP-BY-STEP FIX

### Option 1: Using Docker (Recommended)

```bash
# 1. Make sure containers are running
docker-compose ps

# 2. Run migrations inside backend container
docker exec -it pic_backend npm run prisma:migrate

# When prompted, enter a migration name (or press Enter for default):
# Migration name: init

# 3. Seed the database with master data
docker exec -it pic_backend npm run prisma:seed

# 4. Restart backend to clear any cached connections
docker-compose restart backend

# 5. Check logs
docker logs -f pic_backend
```

### Option 2: Direct Prisma Commands

If the above doesn't work, use direct Prisma commands:

```bash
# Generate Prisma Client
docker exec -it pic_backend npx prisma generate

# Push schema to database (alternative to migrate)
docker exec -it pic_backend npx prisma db push

# Seed database
docker exec -it pic_backend npm run prisma:seed

# Restart
docker-compose restart backend
```

### Option 3: Reset Everything (Fresh Start)

If migrations are stuck or corrupted:

```bash
# WARNING: This will delete all data!

# Stop containers
docker-compose down

# Remove postgres volume (deletes all database data)
docker volume rm picnew_postgres_data

# Start fresh
docker-compose up -d

# Wait for postgres to be ready
sleep 10

# Run migrations
docker exec -it pic_backend npm run prisma:migrate

# Seed database
docker exec -it pic_backend npm run prisma:seed

# Check logs
docker logs -f pic_backend
```

### Option 4: Running Locally (Without Docker)

If you're running backend locally:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
# Enter migration name: init

# Seed database
npm run prisma:seed

# Restart dev server
npm run dev
```

---

## ✅ Verification

### 1. Check if Tables Exist

```bash
# Connect to PostgreSQL
docker exec -it pic_postgres psql -U postgres -d pic_app

# List all tables
\dt

# You should see:
# User
# Bidang
# TrainingProgram
# TrainingClass
# PersonnelType
# EquipmentType
# RegistrationLink
# RequiredDocument
# Registration
# TraineeDocument
# Certificate
# Notification
# AuditLog
# _prisma_migrations

# Exit psql
\q
```

### 2. Check Seeded Data

```bash
# Check admin user exists
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT * FROM \"User\";"

# Check bidang exists
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT * FROM \"Bidang\";"

# Check training programs exist
docker exec -it pic_postgres psql -U postgres -d pic_app -c "SELECT * FROM \"TrainingProgram\";"
```

You should see:
- **1 admin user** (admin@delta-indonesia.com)
- **13 bidang** (PAA, AK3U, ELEVATOR, etc.)
- **5 training programs** (sample data)
- **12 classes** (AHLI, OPERATOR, etc.)
- **6 personnel types**

### 3. Test Login

```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

**Expected Response:**
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

---

## 🔧 Troubleshooting

### Issue: "Migration failed to apply"

**Solution 1: Force push schema**
```bash
docker exec -it pic_backend npx prisma db push --force-reset
```

**Solution 2: Manual reset**
```bash
# Drop all tables
docker exec -it pic_postgres psql -U postgres -d pic_app -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations again
docker exec -it pic_backend npm run prisma:migrate
```

### Issue: "Can't reach database server"

```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker logs pic_postgres

# Restart postgres
docker-compose restart postgres
sleep 5

# Check connection
docker exec -it pic_postgres pg_isready
```

### Issue: "Prisma Client not generated"

```bash
# Generate Prisma Client
docker exec -it pic_backend npx prisma generate

# Restart backend
docker-compose restart backend
```

### Issue: "Seed script failed"

```bash
# Check seed script logs
docker exec -it pic_backend npm run prisma:seed

# If bcrypt error, rebuild container
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue: "Password hash not working"

The seed script uses `bcrypt.hashSync()` with 10 rounds. If login fails:

```bash
# Manually create admin user with known password
docker exec -it pic_postgres psql -U postgres -d pic_app

# Delete existing admin
DELETE FROM "User" WHERE email = 'admin@delta-indonesia.com';

# Exit and run seed again
\q
docker exec -it pic_backend npm run prisma:seed
```

---

## 📝 Database Schema Overview

After successful migration, you'll have these tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Admin accounts | email, password, role |
| **Bidang** | Training sectors | name, description |
| **TrainingProgram** | Training courses | name, bidangId, durationDays |
| **TrainingClass** | Class levels | name, level |
| **PersonnelType** | Personnel categories | name |
| **EquipmentType** | Equipment types | name, bidangId |
| **RegistrationLink** | Admin-created links | uniqueToken, trainingProgramId |
| **RequiredDocument** | Required docs per link | documentType, displayName |
| **Registration** | Trainee submissions | fullName, email, submissionStatus |
| **TraineeDocument** | Uploaded files | filePath, uploadStatus |
| **Certificate** | Issued certificates | certificateNumber, pdfFilePath |
| **Notification** | Email/WhatsApp logs | type, recipient, status |
| **AuditLog** | Activity tracking | userId, action, changes |

---

## 🎯 Complete Reset Command Sequence

If you want to start completely fresh:

```bash
# 1. Stop everything
docker-compose down

# 2. Remove postgres data
docker volume rm picnew_postgres_data

# 3. Clean Docker system
docker system prune -f

# 4. Start services
docker-compose up -d

# 5. Wait for postgres to be ready
sleep 15

# 6. Generate Prisma Client
docker exec -it pic_backend npx prisma generate

# 7. Run migrations
docker exec -it pic_backend npm run prisma:migrate
# When prompted for migration name, enter: init

# 8. Seed database
docker exec -it pic_backend npm run prisma:seed

# 9. Restart backend
docker-compose restart backend

# 10. Check logs
docker logs -f pic_backend

# 11. Test login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delta-indonesia.com","password":"Admin123!"}'
```

---

## ✅ Success Indicators

**Backend logs should show:**
```
✓ Server running on port 5000
✓ Environment: development
✓ API: http://localhost:5000/api
```

**No Prisma errors about missing tables!**

**Login test returns JWT token!**

---

## 📚 Useful Prisma Commands

```bash
# View database in browser
docker exec -it pic_backend npx prisma studio
# Then open: http://localhost:5555

# Check migration status
docker exec -it pic_backend npx prisma migrate status

# View current schema
docker exec -it pic_backend npx prisma db pull

# Format schema file
docker exec -it pic_backend npx prisma format
```

---

**Run the commands above and your database should be ready!** 🚀

Let me know if you still get the "relation does not exist" error after this!
