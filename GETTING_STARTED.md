# 🚀 Getting Started - Phase 1 Complete

## What's Been Done ✅

I've implemented **all 3 major components** for Phase 1:

1. **Database Migrations** (Prisma ORM)
   - 11 tables fully designed
   - Automatic migrations
   - Seed data ready

2. **Authentication Endpoint** (Option 2)
   - Admin login with JWT
   - Protected routes
   - Frontend login page

3. **Training CRUD** (Option 3)
   - Full CRUD for training programs
   - Master data management (Bidang, Classes, Personnel Types)
   - Frontend management pages

---

## Quick Start (5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/deltaindo/picnew.git
cd picnew

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Setup Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 3. Start Docker
```bash
docker-compose up -d
```

### 4. Run Migrations
```bash
# Run migrations & seed data
docker exec -it pic_backend npm run prisma:migrate
docker exec -it pic_backend npm run prisma:seed
```

### 5. Visit Application

- **Frontend:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login
- **API Health:** http://localhost:5000/api/health

### 6. Login Credentials

```
Email: admin@delta-indonesia.com
Password: Admin123!
```

---

## What You Get

### ✅ Backend API Endpoints

**Auth:**
- `POST /api/admin/auth/login` - Login
- `GET /api/admin/auth/me` - Current user

**Training Programs:**
- `GET /api/admin/training` - List
- `POST /api/admin/training` - Create
- `PUT /api/admin/training/:id` - Update
- `DELETE /api/admin/training/:id` - Delete

**Master Data (Bidang, Classes, Personnel Types):**
- `GET /api/admin/bidang` - List bidang
- `POST /api/admin/bidang` - Create bidang
- And similar for classes & personnel types...

### ✅ Frontend Pages

- Landing page (http://localhost:3000)
- Admin login (http://localhost:3000/admin/login)
- Admin dashboard (http://localhost:3000/admin)
- Training management (http://localhost:3000/admin/training)

### ✅ Database

- PostgreSQL with 11 tables
- Pre-seeded with:
  - 1 admin user
  - 13 bidang (sectors)
  - 5 training programs
  - 12 classes
  - 6 personnel types

---

## Database Info

```
Host: localhost
Port: 5432
Database: pic_app
Username: postgres
Password: postgres
```

View database with Prisma Studio:
```bash
cd backend
npm run db:studio
```

---

## Next Steps (Phase 2)

After verifying everything works:

1. **Registration Links** - Create unique links for trainees
2. **Trainee Registration Form** - Public form with document upload
3. **Notifications** - Email + WhatsApp blast to trainees
4. **Document Verification** - Admin approve/reject documents
5. **Certificates** - Admin upload PDFs, trainees download

---

## Troubleshooting

### Port Already in Use
```bash
docker-compose down
docker-compose up -d
```

### Database Connection Failed
```bash
docker-compose logs postgres
```

### Migrations Stuck
```bash
# Reset database
docker exec -it pic_backend npx prisma migrate reset
```

---

## Documentation

- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions
- [API Quick Start](./docs/API_QUICK_START.md) - API examples with curl
- [Architecture](./docs/architecture.md) - System design
- [Master Data](./docs/master-data.md) - All master data lists

---

## Verification Checklist

- [ ] Docker containers running
- [ ] Database migrated
- [ ] Can login at http://localhost:3000/admin/login
- [ ] Can view training programs
- [ ] Can create new training

✅ **Ready to code!** Let's continue with Phase 2.
