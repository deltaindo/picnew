# Docker Automation Guide

## ✅ Good News: It's Already Automated!

Your Docker setup automatically handles database schema creation and seeding when containers start.

## How It Works

Your `docker-compose.yml` has this configuration:

```yaml
postgres:
  volumes:
    # These files auto-execute in order on first container startup
    - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    - ./backend/database/constraints.sql:/docker-entrypoint-initdb.d/02-constraints.sql
    - ./backend/database/admin-seeder.sql:/docker-entrypoint-initdb.d/03-admin-seeder.sql
    - ./backend/database/seeder.sql:/docker-entrypoint-initdb.d/04-seeder.sql
```

**PostgreSQL Docker Entry Point**: Files in `/docker-entrypoint-initdb.d/` are automatically executed when the container starts for the first time (if the database is empty).

## Startup Sequence

When you run `docker-compose up`:

```
1. PostgreSQL container starts
   ↓
2. Checks if database is empty
   ↓
3. Executes 01-schema.sql          → Creates all tables
   ↓
4. Executes 02-constraints.sql     → Adds constraints & indexes
   ↓
5. Executes 03-admin-seeder.sql    → Creates admin user
   ↓
6. Executes 04-seeder.sql          → Seeds master data
   ↓
7. Backend starts (depends_on: postgres healthy)
   ↓
8. Frontend starts (depends_on: backend)
   ✅ System ready!
```

## Updated Files for New Schema

These files have been updated with the new **snake_case** naming convention:

| File | Purpose | Status |
|------|---------|--------|
| `backend/database/schema.sql` | Creates 20 tables with snake_case names | ✅ Updated |
| `backend/database/admin-seeder.sql` | Creates admin user | ✅ Updated |
| `backend/database/seeder.sql` | Seeds bidangs, programs, PIC, marketing, etc. | ✅ Updated |
| `backend/database/constraints.sql` | (Optional) Additional constraints | (Unchanged if not using) |

## What Gets Seeded

### 1. Admin User (admin-seeder.sql)
- **Email**: admin@deltaindo.com
- **Password**: admin123
- **Role**: admin
- **Status**: active

### 2. Master Data (seeder.sql)

**Bidangs** (13 sectors):
- PAA (Pesawat Angkat dan Angkut)
- AK3U (Keahlian K3 Umum)
- Listrik, Kebakaran, Ketinggian, Konstruksi, etc.

**Training Classes** (22 classes):
- AHLI, TEKNISI, OPERATOR, KELAS A-D, etc.

**Personnel Types** (7 types):
- Operator Mesin, Teknisi, Ahli K3, Supervisor, etc.

**Document Types** (6 types):
- Sertifikat, Ijazah, KTP, Surat Kerja, Pas Foto, Sehat

**PIC - Person In Charge** (7 people):
- Ghaida, Yuyun, Echasita, Erje, Nur, Hafid, Daniel

**Marketing** (12 people):
- Agustyani, Atikah, Anik, Yoppi, etc.

**Program Types** (3 types):
- Reguler, Inhouse, BNSP

## Running Docker

### First Run (Fresh Database)
```bash
cd project-root

# Start all services (schema + seeding happens automatically)
docker-compose up

# Check logs to see seeding progress
docker-compose logs postgres
```

### Restart Containers (Preserves Data)
```bash
# Stop and restart (data persists in docker volume)
docker-compose down
docker-compose up

# Data is preserved because:
# - PostgreSQL data is in a named volume: postgres_data:/var/lib/postgresql/data
# - Seeding scripts only run if database is empty (first startup)
```

### Clean Reset (Delete All Data)
```bash
# Stop containers and delete volume
docker-compose down -v

# Start fresh (seeding happens again)
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just PostgreSQL
docker-compose logs -f postgres

# Just Backend
docker-compose logs -f backend

# Just Frontend
docker-compose logs -f frontend
```

## Important: Database Initialization

### ⚠️ First-Run Only
Seeding scripts execute **only on first container startup** when the database is empty:

✅ **First run**: Database empty → scripts execute → data seeded
❌ **Restart**: Database exists → scripts skip → data preserved

### To Force Re-seed
```bash
# Delete the volume (warning: destroys all data)
docker volume rm picnew_postgres_data

# Or delete by full name
docker volume rm $(docker volume ls -q | grep postgres)

# Then start again
docker-compose up
```

## SQL Files: Snake_Case Mapping

All SQL files now use **snake_case** for table and column names to match Prisma schema mappings:

```sql
-- Example from schema.sql
CREATE TABLE registration_links (
    id SERIAL PRIMARY KEY,
    unique_token VARCHAR(255) UNIQUE,
    training_program_id INT REFERENCES training_programs(id),
    training_class_id INT REFERENCES training_classes(id),
    created_by_admin_id INT REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Prisma Integration

### Behind the Scenes

Your Prisma schema has mappings:

```prisma
model User {
  id        Int       @id
  email     String    @unique
  createdAt DateTime  @map("created_at")  // SQL column name
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  @@map("users")  // SQL table name
}
```

**Result:**
- **Backend code** (Prisma Client): Uses `user.createdAt`
- **PostgreSQL database**: Has column `created_at`
- **Mapping**: Automatic via `@map` directives

### Prisma Migrations (Optional)

If you need to make schema changes:

```bash
# Create a new migration based on schema.prisma changes
cd backend
npx prisma migrate dev --name your_migration_name

# This will:
# 1. Generate SQL migration files
# 2. Apply to database
# 3. Update Prisma Client
```

## Troubleshooting

### Problem: Docker starts but no data seeded

**Cause**: Seeding scripts only run if database is empty.

**Solution**:
```bash
# Option 1: Delete volume and restart
docker-compose down -v
docker-compose up

# Option 2: Manually run seed from inside container
docker exec pic_postgres psql -U postgres -d pic_app -f /docker-entrypoint-initdb.d/04-seeder.sql
```

### Problem: "Table already exists" errors

**Cause**: Schema was already created but seeder tries again.

**Solution**: All SQL inserts use `ON CONFLICT ... DO NOTHING` so re-running is safe.

### Problem: Column names don't match

**Cause**: Old SQL files using camelCase or old column names.

**Solution**: All files updated to snake_case. Verify you're using the latest from `automated-migration` branch.

### Problem: Foreign key constraint errors

**Cause**: Wrong column names in constraint references.

**Solution**: Verify all column names use snake_case (e.g., `training_program_id`, not `trainingProgramId`).

## Environment Variables

`docker-compose.yml` uses these `.env` values:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pic_app
DB_PORT=5432

# Backend
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://backend:5000/api
```

## Health Checks

`docker-compose.yml` includes health checks:

```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

Backend waits for PostgreSQL to be healthy before starting:

```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy  # ← Won't start until postgres is ready
```

## Summary

✅ **Automation Status**: ENABLED

- ✅ Schema auto-created on first startup
- ✅ Data auto-seeded on first startup  
- ✅ Admin user auto-created on first startup
- ✅ All files updated for new schema mapping
- ✅ Docker volume persists data between restarts
- ✅ No manual SQL commands needed (unless you want to)

**Just run**: `docker-compose up` and you're done!
