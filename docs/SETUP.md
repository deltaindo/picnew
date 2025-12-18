# Project Setup Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/deltaindo/picnew.git
cd picnew
```

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Start Docker Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 5000
- Frontend on port 3000

### 4. Run Database Migrations
```bash
# Enter backend container
docker exec -it pic_backend sh

# Run migrations
npm run prisma:migrate

# Seed data
npm run prisma:seed

# Exit container
exit
```

### 5. Access the Application

**Frontend:** http://localhost:3000
- Admin Portal: http://localhost:3000/admin/login

**Backend API:** http://localhost:5000
- Health Check: http://localhost:5000/api/health

**Database:** localhost:5432
- User: postgres
- Password: postgres
- Database: pic_app

## Local Development (without Docker)

### Backend
```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart
```

### Port Already in Use
```bash
# Stop all containers
docker-compose down

# Start again
docker-compose up -d
```

### Prisma Migration Issues
```bash
# Reset database (WARNING: deletes all data)
docker exec pic_backend npx prisma migrate reset
```

## Admin Credentials

**Email:** admin@delta-indonesia.com
**Password:** Admin123!

## Next Steps

1. Login to the admin portal
2. Explore the dashboard
3. Manage training programs and master data
4. Create registration links
5. Set up notifications
