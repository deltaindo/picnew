# 🗄️ Database Setup - Fix Missing Tables

## 🔴 The Problem

```
The table `public.User` does not exist in the current database.
```

**Reason:** Prisma migrations haven't been run yet, so the database tables don't exist.

---

## ✅ SOLUTION - Run Migrations

### Option 1: Using Docker (Recommended)

```bash
# Run migrations
docker exec -it pic_backend npm run prisma:migrate

# Seed the database
docker exec -it pic_backend npm run prisma:seed
```

### Option 2: Direct Prisma Commands

```bash
# Generate Prisma client
docker exec -it pic_backend npx prisma generate

# Push schema to database
docker exec -it pic_backend npx prisma db push

# Seed data
docker exec -it pic_backend npm run prisma:seed
```

### Option 3: Enter Container and Run

```bash
# Enter backend container
docker exec -it pic_backend sh

# Inside container:
npx prisma generate
npx prisma db push
npm run prisma:seed

# Exit container
exit
```

---

## 🔍 Verify Database Tables Created

### Check with Prisma Studio
```bash
# Open Prisma Studio
docker exec -it pic_backend npx prisma studio
```

Visit: http://localhost:5555

You should see these tables:
- User
- Bidang
- TrainingProgram
- TrainingClass
- PersonnelType
- EquipmentType
- RegistrationLink
- RequiredDocument
- Registration
- TraineeDocument
- Certificate
- Notification
- AuditLog

### Check with psql
```bash
# Connect to database
docker exec -it pic_postgres psql -U postgres -d pic_app

# List tables
\dt

# Check User table
SELECT * FROM "User";

# Exit
\q
```

---

## 🎯 Complete Setup Sequence

**Run these commands in order:**

```bash
# 1. Ensure containers are running
docker-compose up -d

# 2. Wait for postgres to be ready
sleep 10

# 3. Generate Prisma client
docker exec -it pic_backend npx prisma generate

# 4. Run migrations (creates tables)
docker exec -it pic_backend npx prisma db push

# 5. Seed database (adds initial data)
docker exec -it pic_backend npm run prisma:seed

# 6. Restart backend
docker-compose restart backend

# 7. Check logs
docker logs -f pic_backend
```

---

## ✅ Expected Output

### After `npx prisma db push`:
```
🚀  Your database is now in sync with your Prisma schema. Done in XXXms

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### After `npm run prisma:seed`:
```
🌱  Seeding database...
✅ Created 13 Bidang
✅ Created 5 Training Programs
✅ Created 12 Training Classes
✅ Created 6 Personnel Types
✅ Created 1 Admin User
🌱  Database seeded successfully!
```

---

## 🧪 Test After Setup

### Test 1: Check Database
```bash
docker exec -it pic_postgres psql -U postgres -d pic_app -c 'SELECT * FROM "User";'
```

**Expected:** Should show 1 admin user

### Test 2: Test Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@delta-indonesia.com",
    "password": "Admin123!"
  }'
```

**Expected:** JWT token and user data (NO database error)

### Test 3: Frontend Login

1. Visit: http://localhost:3000/admin/login
2. Login:
   - Email: `admin@delta-indonesia.com`
   - Password: `Admin123!`
3. Should redirect to dashboard

---

## 🐛 Troubleshooting

### Issue: "npm run prisma:migrate" fails

**Solution:** Use `db push` instead:
```bash
docker exec -it pic_backend npx prisma db push
```

### Issue: "Can't reach database server"

**Check if postgres is running:**
```bash
docker ps | grep postgres
```

If not running:
```bash
docker-compose up -d postgres
sleep 10
```

**Check connection:**
```bash
docker exec -it pic_postgres pg_isready
```

Should output: `accepting connections`

### Issue: Seed script fails

**Reset and try again:**
```bash
# Clear database
docker exec -it pic_backend npx prisma db push --force-reset

# Seed again
docker exec -it pic_backend npm run prisma:seed
```

### Issue: "prisma command not found"

**Install dependencies:**
```bash
docker exec -it pic_backend npm install
docker exec -it pic_backend npx prisma generate
```

---

## 🔄 Reset Database (Start Fresh)

If you want to start completely fresh:

```bash
# Stop containers
docker-compose down

# Remove database volume (⚠️ DELETES ALL DATA)
docker volume rm picnew_postgres_data

# Start again
docker-compose up -d

# Wait for postgres
sleep 10

# Setup database
docker exec -it pic_backend npx prisma generate
docker exec -it pic_backend npx prisma db push
docker exec -it pic_backend npm run prisma:seed

# Restart backend
docker-compose restart backend
```

---

## 📋 Quick Command Summary

**Copy-paste this entire block:**

```bash
# Ensure services running
docker-compose up -d && sleep 10

# Setup database
docker exec -it pic_backend npx prisma generate
docker exec -it pic_backend npx prisma db push
docker exec -it pic_backend npm run prisma:seed

# Restart backend
docker-compose restart backend

# Check logs
docker logs pic_backend

# Test login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delta-indonesia.com","password":"Admin123!"}'
```

---

## ✅ Success Indicators

**After setup, you should see:**

✅ No TypeScript compilation errors
✅ Backend server running on port 5000
✅ 13 tables created in database
✅ 1 admin user in User table
✅ Login endpoint returns JWT token
✅ No "table does not exist" errors

---

## 📚 Database Schema

After migrations, your database will have:

```
User (1 record)
├─ Bidang (13 records)
│   └─ TrainingProgram (5 records)
├─ TrainingClass (12 records)
├─ PersonnelType (6 records)
└─ EquipmentType (0 records)

RegistrationLink (0 records)
├─ RequiredDocument (0 records)
└─ Registration (0 records)
    ├─ TraineeDocument (0 records)
    └─ Certificate (0 records)

Notification (0 records)
AuditLog (0 records)
```

---

**Run the Quick Command Summary above and your database will be ready!** 🚀
